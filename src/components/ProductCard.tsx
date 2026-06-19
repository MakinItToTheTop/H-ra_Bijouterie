"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/data/products";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  const outOfStock = product.stock <= 0;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product, 1);
    setAdded(true);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} — ${formatPrice(product.price)}`,
    });
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="card-lift group relative flex flex-col overflow-hidden rounded-[28px] border border-line bg-white p-3 shadow-[var(--shadow-soft)] hover:border-[#dcc79f]">
      <div className="relative overflow-hidden rounded-[22px] bg-cream-deep">
        <div className="aspect-[4/5] w-full">
          {!loaded && <div className="skeleton absolute inset-0" />}
          <img
            src={product.image}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            data-loaded={loaded}
            className="img-fade h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
          />
        </div>

        {/* Gradient veil that appears on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1f1512]/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          {product.badge && (
            <span className="rounded-full bg-espresso/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f3d9a5] backdrop-blur">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
              −{discount}%
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Épuisé
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label={wished ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
          aria-pressed={wished}
          onClick={() => setWished((value) => !value)}
          className="press absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-espresso shadow-md backdrop-blur hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 transition-all duration-300 ${
              wished ? "scale-110 fill-[#c0553f] text-[#c0553f]" : ""
            }`}
          />
        </button>

        {/* Quick view slides up on hover */}
        <Link
          href={`/produit/${product.slug}`}
          className="absolute inset-x-3 bottom-3 flex translate-y-[130%] items-center justify-center gap-2 rounded-full bg-white/95 py-2.5 text-sm font-medium text-espresso opacity-0 shadow-lg backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          <Eye className="h-4 w-4" />
          Voir la pièce
        </Link>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3 px-1 pb-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            {product.category}
          </span>
          <span className="flex items-center gap-1 text-gold">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-medium text-ink-soft">{product.rating}</span>
          </span>
        </div>

        <Link
          href={`/produit/${product.slug}`}
          className="font-display text-xl leading-snug text-ink transition-colors hover:text-[#8d6a43]"
        >
          {product.name}
        </Link>

        <p className="text-sm text-ink-soft">{product.material}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div className="leading-none">
            <span className="text-2xl font-semibold tracking-tight text-ink">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="ml-2 text-sm text-ink-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={`Ajouter ${product.name} au panier`}
            className={`press sheen inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#bfb1a8] ${
              added ? "bg-[#5c7a4a]" : "bg-espresso hover:bg-espresso-light"
            }`}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            <span className="hidden sm:inline">{added ? "Ajouté" : "Ajouter"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-[28px] border border-line bg-white p-3">
      <div className="skeleton aspect-[4/5] w-full rounded-[22px]" />
      <div className="space-y-3 px-1 py-4">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-5 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-1/2 rounded-full" />
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-7 w-24 rounded-full" />
          <div className="skeleton h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
