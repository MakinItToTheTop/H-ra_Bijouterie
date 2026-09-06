import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Levée quand un ou plusieurs articles n'ont plus assez de stock au moment
// où Stripe confirme le paiement : on distingue ce cas d'une simple erreur
// technique, car il appelle une réaction différente (rembourser le client)
// plutôt qu'un simple retour d'erreur 500.
class InsufficientStockError extends Error {
  constructor(public items: string[]) {
    super(`Stock insuffisant pour : ${items.join(", ")}`);
  }
}

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
        try {
          await prisma.$transaction(async (tx) => {
            const insufficient: string[] = [];

            for (const item of existing.items) {
              // updateMany avec condition WHERE stock >= quantité : Postgres
              // verrouille la ligne le temps de l'update, ce qui rend la
              // vérification et la décrémentation atomiques. Si deux paiements
              // concurrents visent la dernière pièce, un seul des deux
              // updateMany affectera une ligne (count: 1) ; l'autre aura
              // count: 0 et déclenchera le remboursement ci-dessous.
              const result = await tx.product.updateMany({
                where: { id: item.productId, stock: { gte: item.quantity } },
                data: { stock: { decrement: item.quantity } },
              });

              if (result.count === 0) {
                insufficient.push(item.name);
              }
            }

            if (insufficient.length > 0) {
              // On sort de la transaction en erreur : tous les decrement déjà
              // appliqués sur d'autres articles de CETTE commande sont annulés
              // (rollback), pour ne pas décrémenter partiellement une commande
              // qu'on va de toute façon rembourser en intégralité.
              throw new InsufficientStockError(insufficient);
            }

            await tx.order.update({
              where: { id: orderId },
              data: { status: "payée", stripePaymentIntentId: paymentIntentId ?? null },
            });
          });
        } catch (error) {
          if (error instanceof InsufficientStockError) {
            console.error(
              `Stripe webhook: rupture de stock à la confirmation du paiement (commande ${orderId}) — ${error.message}. Remboursement automatique déclenché.`
            );

            if (paymentIntentId) {
              await stripe.refunds.create({ payment_intent: paymentIntentId });
            }

            await prisma.order.update({
              where: { id: orderId },
              data: { status: "annulée", stripePaymentIntentId: paymentIntentId ?? null },
            });

            // Email best-effort : on informe le client, mais un échec d'envoi
            // ne doit pas faire échouer le webhook (le remboursement, lui, a
            // déjà eu lieu).
            const resendApiKey = process.env.RESEND_API_KEY;
            if (resendApiKey && existing.customerEmail) {
              try {
                const resend = new Resend(resendApiKey);
                const orderNumber = existing.id.slice(-8).toUpperCase();
                await resend.emails.send({
                  from: process.env.CONTACT_FROM_EMAIL ?? "Héra Bijouterie <onboarding@resend.dev>",
                  to: existing.customerEmail,
                  subject: `Commande #${orderNumber} annulée et remboursée`,
                  text: [
                    `Bonjour ${existing.customerFirstName ?? ""},`,
                    "",
                    `Nous sommes désolés : ${error.items.join(", ")} vien${
                      error.items.length > 1 ? "nent" : "t"
                    } d'être vendu(s) au moment de la validation de votre paiement.`,
                    "",
                    `Votre commande #${orderNumber} est annulée et vous serez intégralement remboursé(e) sous quelques jours.`,
                    "",
                    "Toutes nos excuses pour la gêne occasionnée.",
                    "",
                    "Héra Bijouterie",
                  ].join("\n"),
                });
              } catch (emailError) {
                console.error("Stock shortage refund email error", emailError);
              }
            }

            // On répond 200 à Stripe : l'événement a bien été traité (par un
            // remboursement), il ne faut pas que Stripe le renvoie en boucle.
            return NextResponse.json({ ok: true, refunded: true, reason: "stock insuffisant" });
          }

          throw error;
        }
      }
    } catch (error) {
      console.error("Stripe webhook: échec de mise à jour de la commande", error);
      return NextResponse.json({ ok: false, message: "Échec du traitement." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}