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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const reviews = await prisma.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({
      ok: true,
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        authorName: review.user.name || review.user.email.split("@")[0],
        isMine: session?.user?.id === review.userId,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Impossible de charger les avis" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: "Connectez-vous pour laisser un avis." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!product) {
      return NextResponse.json({ ok: false, message: "Produit introuvable" }, { status: 404 });
    }

    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId: id, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, message: "Vous avez déjà laissé un avis sur ce produit. Vous pouvez le modifier." },
        { status: 409 },
      );
    }

    const review = await prisma.review.create({
      data: { productId: id, userId: session.user.id, rating: parsed.data.rating, comment: parsed.data.comment },
    });

    await syncProductAggregate(id);

    return NextResponse.json({ ok: true, review });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Impossible d'ajouter l'avis" }, { status: 500 });
  }
}