import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["en attente", "payée", "expédiée", "livrée", "annulée"];

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

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (error) {
    console.error("Admin order update error", error);
    return NextResponse.json({ ok: false, message: "Échec de la mise à jour." }, { status: 500 });
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

    if (order.status !== "livrée") {
      return NextResponse.json(
        { ok: false, message: "Seules les commandes livrées peuvent être supprimées." },
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