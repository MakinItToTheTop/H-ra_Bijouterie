import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

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

    // Le stock ne doit être décrémenté qu'une seule fois : au moment précis où
    // la commande BASCULE vers "payée" (pas si elle l'était déjà).
    const justPaid = status === "payée" && existing.status === "en attente";

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
  order.status === "livrée" || (order.shippingMode === "retrait" && order.status === "prête à récupérer");

if (!isDeletable) {
  return NextResponse.json(
    { ok: false, message: "Seules les commandes livrées (ou prêtes à récupérer pour un retrait) peuvent être supprimées." },
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