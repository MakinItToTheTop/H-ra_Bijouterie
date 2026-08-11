import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { products as demoProducts } from "@/data/products";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST() {
  const session = await getServerSession(authOptions);
if (!session?.user || session.user.role !== "admin") {
  return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 403 });
}
  try {
    const rows = demoProducts.map((product) => ({
      slug: product.slug,
      name: product.name,
      category: product.category,
      material: product.material,
      price: product.price,
      compareAt: product.compareAtPrice ?? null,
      rating: product.rating,
      reviews: product.reviews,
      stock: product.stock,
      badge: product.badge ?? null,
      image: product.image,
      gallery: JSON.stringify(product.gallery ?? []),
      description: product.description,
      longDescription: product.longDescription,
      features: JSON.stringify(product.features ?? []),
      sizeOptions: JSON.stringify(product.sizeOptions ?? []),
      color: product.color ?? null,
    }));

    const created = await prisma.$transaction(
      rows.map((row) =>
        prisma.product.upsert({
          where: { slug: row.slug },
          update: row,
          create: row,
        }),
      ),
    );

    return NextResponse.json({ ok: true, count: created.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Erreur de seed" }, { status: 500 });
  }
}
