import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const VALID_STATUSES = ["en attente", "payée", "expédiée", "prête à récupérer", "livrée", "annulée"];

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 403 });
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    });
    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    console.error("Admin orders fetch error", error);
    return NextResponse.json({ ok: false, orders: [] }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status } = body as { id?: string; status?: string };

    if (!id || !status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, message: "Commande introuvable." }, { status: 404 });
    }

    // Une commande déjà livrée ne peut plus être annulée : le bijou est chez
    // le client, l'annulation devrait passer par un retour, pas par ce flux.
    if (status === "annulée" && existing.status === "livrée") {
      return NextResponse.json(
        { ok: false, message: "Une commande déjà livrée ne peut pas être annulée." },
        { status: 400 }
      );
    }

    // Le stock ne doit être décrémenté qu'une seule fois : au moment précis où
    // la commande BASCULE vers "payée" (pas si elle l'était déjà).
    const justPaid = status === "payée" && existing.status === "en attente";

    // Une commande n'a un stripePaymentIntentId que si le webhook Stripe a
    // confirmé un paiement (voir /api/webhooks/stripe) : c'est donc le signal
    // fiable qu'un paiement a réellement eu lieu et que le stock a été
    // décrémenté. On ne déclenche le remboursement/restock que dans ce cas,
    // et uniquement si la commande n'était pas déjà annulée (idempotence).
    const isCancelling =
      status === "annulée" && existing.status !== "annulée" && Boolean(existing.stripePaymentIntentId);

    if (isCancelling) {
      if (!stripe) {
        return NextResponse.json({ ok: false, message: "Stripe non configuré." }, { status: 500 });
      }

      // On déclenche le remboursement AVANT de toucher à la base : si Stripe
      // refuse (paiement déjà remboursé, litige en cours...), on ne modifie
      // rien côté commande/stock.
      try {
        await stripe.refunds.create({ payment_intent: existing.stripePaymentIntentId! });
      } catch (error) {
        console.error("Admin order cancel: échec du remboursement Stripe", error);
        return NextResponse.json(
          { ok: false, message: "Le remboursement Stripe a échoué, la commande n'a pas été annulée." },
          { status: 500 }
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (justPaid) {
        for (const item of existing.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stock < item.quantity) {
            throw new Error(
              `Stock insuffisant pour "${item.name}" (disponible : ${product?.stock ?? 0}, demandé : ${item.quantity}).`
            );
          }
        }

        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      if (isCancelling) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({ where: { id }, data: { status } });
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (error) {
    console.error("Admin order update error", error);
    const message = error instanceof Error ? error.message : "Échec de la mise à jour.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ ok: false, message: "Commande introuvable." }, { status: 404 });
    }

    const isDeletable =
  order.status === "livrée" ||
  order.status === "annulée" ||
  (order.shippingMode === "retrait" && order.status === "prête à récupérer");

if (!isDeletable) {
  return NextResponse.json(
    { ok: false, message: "Seules les commandes livrées, annulées (ou prêtes à récupérer pour un retrait) peuvent être supprimées." },
    { status: 400 }
  );
}

    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin order delete error", error);
    return NextResponse.json({ ok: false, message: "Échec de la suppression." }, { status: 500 });
  }
}