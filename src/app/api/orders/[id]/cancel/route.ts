import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ ok: false, message: "Commande introuvable." }, { status: 404 });
    }

    // Un client ne peut annuler que ses propres commandes (l'admin passe par
    // /api/admin/orders et n'est pas concerné par cette route).
    if (order.userId !== session.user.id) {
      return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 403 });
    }

    if (order.status !== "payée") {
      return NextResponse.json(
        { ok: false, message: "Seules les commandes payées peuvent être annulées." },
        { status: 400 }
      );
    }

    if (!order.stripePaymentIntentId) {
      console.error(`Annulation impossible: aucun payment_intent pour la commande ${id}`);
      return NextResponse.json(
        { ok: false, message: "Remboursement impossible : paiement introuvable." },
        { status: 500 }
      );
    }

    if (!stripe) {
      return NextResponse.json({ ok: false, message: "Stripe non configuré." }, { status: 500 });
    }

    // On déclenche le remboursement AVANT de toucher à la base : si Stripe
    // refuse (paiement déjà remboursé, litige en cours...), on ne modifie
    // rien côté commande/stock.
    await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.order.update({
        where: { id },
        data: { status: "annulée" },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Order cancel error", error);
    return NextResponse.json(
      { ok: false, message: "L'annulation n'a pas pu être effectuée." },
      { status: 500 }
    );
  }
}