import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type OrderItemInput = {
  id: string;
  name: string;
  quantity: number;
  price: number;
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

    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id ?? undefined,
        total: Number(body.total ?? 0),
        status: "en attente",
        shippingMode: body.shippingMode ?? "livraison",
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
    const orders = await prisma.order.findMany({
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
