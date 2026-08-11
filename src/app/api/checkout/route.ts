import { NextResponse } from "next/server";
import { getCheckoutBaseUrl, stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const baseUrl = getCheckoutBaseUrl();

    const requestedItems: { id: string; quantity: number }[] = Array.isArray(body.items) ? body.items : [];

    if (requestedItems.length === 0) {
      return NextResponse.json({ ok: false, message: "Le panier est vide." }, { status: 400 });
    }

    const productIds = requestedItems.map((item) => item.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    const missing = requestedItems.filter((item) => !productById.has(item.id));
    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, message: "Certains articles ne sont plus disponibles." },
        { status: 409 },
      );
    }

    const lineItems = requestedItems.map((item) => {
      const product = productById.get(item.id)!;
      return {
        price_data: {
          currency: "eur",
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: Math.max(1, Math.floor(item.quantity)),
      };
    });

    if (!stripe) {
      return NextResponse.json({
        ok: true,
        demo: true,
        message: "Mode démo Stripe activé. Ajoutez STRIPE_SECRET_KEY pour la vraie intégration.",
        paymentIntentId: "demo_pi_123",
        checkoutUrl: `${baseUrl}/checkout?success=1`,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/checkout?success=1`,
      cancel_url: `${baseUrl}/panier?cancel=1`,
      customer_email: body.customer?.email,
      metadata: { orderId: body.orderId ?? "demo-order" },
    });

    return NextResponse.json({ ok: true, url: session.url, demo: false });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json(
      { ok: false, message: "Le paiement n'a pas pu être initialisé." },
      { status: 500 },
    );
  }
}
