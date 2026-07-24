import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { syncProductAggregate } from "@/lib/reviews";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3, "L'avis doit contenir au moins 3 caractères.").max(1000),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; reviewId: string }> }) {
  try {
    const { id, reviewId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: "Connectez-vous pour modifier votre avis." }, { status: 401 });
    }

    const existing = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing || existing.productId !== id) {
      return NextResponse.json({ ok: false, message: "Avis introuvable" }, { status: 404 });
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ ok: false, message: "Vous ne pouvez modifier que votre propre avis." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { rating: parsed.data.rating, comment: parsed.data.comment },
    });

    await syncProductAggregate(id);
    return NextResponse.json({ ok: true, review });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Impossible de modifier l'avis" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; reviewId: string }> }) {
  try {
    const { id, reviewId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: "Connectez-vous pour supprimer votre avis." }, { status: 401 });
    }

    const existing = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing || existing.productId !== id) {
      return NextResponse.json({ ok: false, message: "Avis introuvable" }, { status: 404 });
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ ok: false, message: "Vous ne pouvez supprimer que votre propre avis." }, { status: 403 });
    }

    await prisma.review.delete({ where: { id: reviewId } });
    await syncProductAggregate(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Impossible de supprimer l'avis" }, { status: 500 });
  }
}