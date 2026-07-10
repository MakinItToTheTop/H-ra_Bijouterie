import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateJewelryPrice } from "@/lib/pricing";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  category: z.string().min(2),
  material: z.string().min(2),
  image: z.string().min(2),
  price: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  badge: z.string().nullable().optional(),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  features: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
  sizeOptions: z.array(z.string()).optional(),
  color: z.string().nullable().optional(),
  weightGrams: z.number().optional(),
  marketRate: z.number().optional(),
  labor: z.number().optional(),
});

function buildPayload(data: z.infer<typeof productSchema>) {
  const computedPrice = calculateJewelryPrice({
    material: data.material,
    weightGrams: Number(data.weightGrams ?? 1.2),
    marketRate: Number(data.marketRate ?? 70),
    labor: Number(data.labor ?? 120),
  });

  const price = data.price ?? computedPrice;
  const slug = data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return {
    name: data.name,
    slug,
    category: data.category,
    material: data.material,
    image: data.image,
    price,
    stock: Number(data.stock ?? 1),
    badge: data.badge ?? null,
    description: data.description ?? `${data.name} en ${data.material}.`,
    longDescription:
      data.longDescription ?? `Pièce ${data.name} en ${data.material}, conçue pour un port quotidien et une élégance durable.`,
    features: JSON.stringify(data.features && data.features.length > 0 ? data.features : [data.material, "Finition premium", "Livraison en coffret"]),
    gallery: JSON.stringify(data.gallery && data.gallery.length > 0 ? data.gallery : [data.image]),
    sizeOptions: JSON.stringify(data.sizeOptions ?? []),
    color: data.color ?? null,
    rating: 5,
    reviews: 0,
    compareAt: Math.round(price * 1.15),
  };
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, products });
  } catch {
    return NextResponse.json({ ok: true, products: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Données invalides" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: buildPayload(parsed.data),
    });

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Impossible d'ajouter le produit" }, { status: 500 });
  }
}
