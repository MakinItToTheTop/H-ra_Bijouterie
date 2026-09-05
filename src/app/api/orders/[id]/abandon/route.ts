import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Annule une commande encore "en attente" quand le client abandonne le
// paiement Stripe (clic sur "Retour"). On ne touche jamais le stock ici,
// car il n'est décrémenté qu'au moment du webhook checkout.session.completed.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ ok: false, message: "Commande introuvable." }, { status: 404 });
    }

    // Sécurité : on n'annule que les commandes encore "en attente". Une
    // commande déjà payée ou déjà annulée ne doit jamais être touchée ici.
    if (order.status !== "en attente") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await prisma.order.update({
      where: { id },
      data: { status: "annulée" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Order abandon error", error);
    return NextResponse.json(
      { ok: false, message: "L'annulation n'a pas pu être effectuée." },
      { status: 500 },
    );
  }
}