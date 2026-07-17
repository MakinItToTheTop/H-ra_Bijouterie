import { NextResponse } from "next/server";
import { Resend } from "resend"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";   

type OrderItemInput = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type CustomerInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    const items: OrderItemInput[] = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Le panier est vide." },
        { status: 400 },
      );
    }

    // productId is a required foreign key on OrderItem, so every item in the
    // cart must reference a real Product row or the order creation must fail
    // cleanly (rather than crash with an opaque Prisma FK error).
    const productIds = items.map((item) => item.id);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const existingIds = new Set(existingProducts.map((p) => p.id));
    const missing = items.filter((item) => !existingIds.has(item.id));

    if (missing.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Certains articles de votre panier ne sont plus disponibles. Merci de rafraîchir votre panier.",
        },
        { status: 409 },
      );
    }

    const customer: CustomerInput = body.customer ?? {};

    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id ?? undefined,
        total: Number(body.total ?? 0),
        status: stripe ? "en attente" : "payée",
        shippingMode: body.shippingMode ?? "livraison",
        customerFirstName: customer.firstName ?? null,
customerLastName: customer.lastName ?? null,
customerEmail: customer.email ?? null,
customerPhone: customer.phone ?? null,
address: customer.address ?? null,
postalCode: customer.postalCode ?? null,
city: customer.city ?? null,
country: customer.country ?? null,
        items: {
          create: items.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    // Accusé de réception — best effort, ne bloque pas la commande si l'email échoue.
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && customer.email) {
      try {
        const resend = new Resend(resendApiKey);
        const orderNumber = order.id.slice(-8).toUpperCase();
        const itemsList = items
          .map((item) => `- ${item.quantity}x ${item.name} (${item.price.toFixed(2)} €)`)
          .join("\n");

        await resend.emails.send({
          from: process.env.CONTACT_FROM_EMAIL ?? "Héra Bijouterie <onboarding@resend.dev>",
          to: customer.email,
          subject: `Confirmation de votre commande #${orderNumber}`,
          text: [
            `Bonjour ${customer.firstName ?? ""},`,
            "",
            `Nous avons bien reçu votre commande #${orderNumber}.`,
            "",
            itemsList,
            "",
            `Total : ${order.total.toFixed(2)} €`,
            `Mode : ${order.shippingMode === "retrait" ? "Retrait en boutique" : "Livraison à domicile"}`,
            "",
            "Nous reviendrons vers vous dès que votre commande sera validée.",
            "",
            "Héra Bijouterie",
          ].join("\n"),
        });
      } catch (emailError) {
        console.error("Order confirmation email error", emailError);
      }
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      status: order.status,
      message: "Commande enregistrée avec succès",
    });
  } catch (error) {
    console.error("Order creation error", error);
    return NextResponse.json(
      { ok: false, message: "La commande n'a pas pu être enregistrée." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ ok: false, orders: [] }, { status: 401 });
    }

    const isAdmin = session.user.role === "admin";

    const orders = await prisma.order.findMany({
      where: isAdmin ? undefined : { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 50,
    });

    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    console.error("Order fetch error", error);
    return NextResponse.json({ ok: false, orders: [] }, { status: 500 });
  }
}