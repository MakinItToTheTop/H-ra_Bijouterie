import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Stripe a besoin du corps brut (non parsé) de la requête pour vérifier la
// signature de l'événement : on désactive donc le body parser par défaut de
// Next.js pour cette route.
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!stripe) {
    console.error("Stripe webhook: STRIPE_SECRET_KEY manquante.");
    return NextResponse.json({ ok: false, message: "Stripe non configuré." }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Stripe webhook: STRIPE_WEBHOOK_SECRET manquante.");
    return NextResponse.json({ ok: false, message: "Webhook non configuré." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, message: "Signature manquante." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook: signature invalide", error);
    return NextResponse.json({ ok: false, message: "Signature invalide." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

    if (!orderId || orderId === "demo-order") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    try {
      const existing = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!existing) {
        console.error(`Stripe webhook: commande introuvable (${orderId})`);
        return NextResponse.json({ ok: false, message: "Commande introuvable." }, { status: 404 });
      }

      // Idempotence : si la commande est déjà marquée payée (Stripe peut
      // renvoyer le même événement plusieurs fois), on ne redécrémente pas
      // le stock une seconde fois.
      if (existing.status !== "payée") {
        await prisma.$transaction(async (tx) => {
          for (const item of existing.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }

          await tx.order.update({
            where: { id: orderId },
            data: { status: "payée", stripePaymentIntentId: paymentIntentId ?? null },
          });
        });
      }
    } catch (error) {
      console.error("Stripe webhook: échec de mise à jour de la commande", error);
      return NextResponse.json({ ok: false, message: "Échec du traitement." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}