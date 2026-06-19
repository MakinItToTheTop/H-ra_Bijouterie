import { NextResponse } from "next/server";
import { getCheckoutBaseUrl, stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const baseUrl = getCheckoutBaseUrl();

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
      line_items: (body.items ?? []).map((item: { name: string; price: number; quantity: number }) => ({
        price_data: {
          currency: "eur",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${baseUrl}/checkout?success=1`,
      cancel_url: `${baseUrl}/panier?cancel=1`,
      customer_email: body.customer?.email,
      metadata: {
        orderId: body.orderId ?? "demo-order",
      },
    });

    return NextResponse.json({ ok: true, url: session.url, demo: false });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json(
      { ok: false, message: "Le paiement n’a pas pu être initialisé." },
      { status: 500 },
    );
  }
}
