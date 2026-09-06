import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Liste des favoris du client connecté. On ne renvoie que les IDs produit :
// le front possède déjà les fiches produit affichées à l'écran, pas besoin
// de dupliquer les données ici — sauf pour une future page "Mes favoris"
// dédiée, qui pourra inclure { product: true }.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    });

    return NextResponse.json({ ok: true, productIds: items.map((item) => item.productId) });
  } catch (error) {
    console.error("Wishlist fetch error", error);
    return NextResponse.json({ ok: false, productIds: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Connectez-vous pour ajouter un favori." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const productId = typeof body.productId === "string" ? body.productId : "";

    if (!productId) {
      return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) {
      return NextResponse.json({ ok: false, message: "Produit introuvable." }, { status: 404 });
    }

    // upsert plutôt que create : si le client clique deux fois très vite
    // (double appel), on évite une erreur de contrainte unique inutile.
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      create: { userId: session.user.id, productId },
      update: {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Wishlist add error", error);
    return NextResponse.json({ ok: false, message: "Impossible d'ajouter le favori." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
    }

    // deleteMany plutôt que delete : si l'entrée n'existe déjà plus (double
    // clic, état déjà retiré ailleurs), on répond simplement "ok" au lieu
    // d'une erreur "record not found".
    await prisma.wishlistItem.deleteMany({
      where: { userId: session.user.id, productId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Wishlist remove error", error);
    return NextResponse.json({ ok: false, message: "Impossible de retirer le favori." }, { status: 500 });
  }
}