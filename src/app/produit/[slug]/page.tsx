import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Star } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "@/components/ProductDetail";
import { Reveal } from "@/components/Reveal";
import { toProduct } from "@/data/products";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ slug: string }> };

async function findProduct(slug: string) {
  try {
    return await prisma.product.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProduct(slug);

  if (!product) return { title: "Bijou introuvable" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await findProduct(slug);

  if (!product) {
    notFound();
  }

  let related: typeof product[] = [];
  try {
    related = await prisma.product.findMany({
      where: { category: product.category, id: { not: product.id } },
      take: 3,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    related = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
      <nav aria-label="Fil d’Ariane" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        <Link href="/boutique" className="link-underline inline-flex items-center gap-2 text-[#7b5d41]">
          <ArrowLeft className="h-4 w-4" />
          Boutique
        </Link>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <ProductDetail product={toProduct(product)} />

      <div className="mt-16 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <div className="h-full rounded-[28px] border border-line bg-white p-7 md:p-8">
            <h2 className="font-display text-3xl text-[#231711]">Description</h2>
            <div className="rule-gold my-5" />
            <p className="leading-8 text-ink-soft">{toProduct(product).longDescription}</p>
            {toProduct(product).features.length > 0 && (
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {toProduct(product).features.map((feature: string) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 rounded-2xl bg-[#fffaf3] px-4 py-3 text-sm text-[#43352f]"
                  >
                    <Check className="h-4 w-4 shrink-0 text-gold" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="h-full rounded-[28px] border border-line bg-[#fffaf3] p-7 md:p-8">
            <h2 className="font-display text-3xl text-[#231711]">Avis clients</h2>
            <div className="rule-gold my-5" />
            <div className="space-y-6">
              {[
                "Magnifique qualité, très beau cadeau et conseil parfait.",
                "Je recommande vivement pour ses créations raffinées.",
              ].map((review) => (
                <figure key={review}>
                  <div className="flex items-center gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-3 leading-7 text-ink-soft">“{review}”</blockquote>
                </figure>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.5rem)] text-[#231711]">
              Vous aimerez aussi
            </h2>
            <div className="rule-gold mt-5 max-w-xs" />
          </Reveal>
          <div className="mt-8 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 90}>
                <ProductCard product={toProduct(item)} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
