"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/data/products";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const images = [product.image, ...(product.gallery ?? []).filter((src) => src !== product.image)];
  const [activeImage, setActiveImage] = useState(images[0]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(product.sizeOptions?.[0] ?? "");
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  const outOfStock = product.stock <= 0;
  const maxQuantity = Math.max(1, product.stock);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product, quantity);
    setAdded(true);
    toast({
      title: "Ajouté au panier",
      description: `${product.name}${size ? ` · taille ${size}` : ""} × ${quantity}`,
    });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      {/* Gallery */}
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[30px] border border-line bg-cream-deep">
          {!imageLoaded && <div className="skeleton absolute inset-0" />}
          <img
            key={activeImage}
            src={activeImage}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            data-loaded={imageLoaded}
            className="img-fade aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04] md:aspect-[5/6]"
          />
          {discount > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              −{discount}%
            </span>
          )}
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, 8).map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => {
                  setImageLoaded(false);
                  setActiveImage(image);
                }}
                aria-label={`Voir la vue ${index + 1}`}
                data-active={activeImage === image}
                className="press overflow-hidden rounded-[18px] border-2 border-transparent opacity-70 transition-all duration-300 hover:opacity-100 data-[active=true]:border-gold data-[active=true]:opacity-100"
              >
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Purchase panel */}
      <div className="lg:sticky lg:top-[100px] lg:h-fit">
        <div className="rounded-[30px] border border-line bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#8c6b4b]">
              {product.category}
            </span>
            {product.badge && (
              <span className="rounded-full bg-gold-pale px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#7a5b39]">
                {product.badge}
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight text-[#231711]">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-gold">
            <span className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${index < Math.round(product.rating) ? "fill-current" : "opacity-30"}`}
                />
              ))}
            </span>
            <span className="text-sm font-medium text-ink-soft">{product.rating}/5</span>
            <span className="text-sm text-ink-muted">({product.reviews} avis)</span>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="font-display text-4xl text-[#251912]">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="pb-1 text-lg text-ink-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">TVA incluse · Livraison calculée au paiement</p>

          <p className="mt-6 leading-7 text-ink-soft">{product.description}</p>

          <dl className="mt-6 space-y-3 rounded-[22px] bg-[#fffaf3] p-5 text-sm text-[#4d3d37]">
            <div className="flex items-center justify-between">
              <dt>Matière</dt>
              <dd className="font-semibold text-ink">{product.material}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Disponibilité</dt>
              <dd
                className={`font-semibold ${outOfStock ? "text-[#b4544a]" : "text-[#5c7a4a]"}`}
              >
                {outOfStock
                  ? "Épuisé"
                  : product.stock <= 3
                    ? `Plus que ${product.stock} en stock`
                    : `${product.stock} en stock`}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Garantie</dt>
              <dd className="font-semibold text-ink">2 ans</dd>
            </div>
          </dl>

          {(product.sizeOptions ?? []).length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#7d5d46]">
                Taille
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizeOptions?.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    data-active={size === option}
                    className="press rounded-full border border-[#dcc7a0] bg-[#fffaf4] px-5 py-2.5 text-sm text-espresso hover:border-gold data-[active=true]:border-espresso data-[active=true]:bg-espresso data-[active=true]:text-white"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center rounded-full border border-[#e2ceb1] bg-[#fffaf5]">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                aria-label="Diminuer la quantité"
                className="press rounded-full p-3 text-espresso disabled:opacity-35"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                disabled={quantity >= maxQuantity}
                aria-label="Augmenter la quantité"
                className="press rounded-full p-3 text-espresso disabled:opacity-35"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              className={`press sheen flex-1 rounded-full px-6 py-3.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#bfb1a8] ${
                added ? "bg-[#5c7a4a]" : "bg-espresso hover:bg-espresso-light"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                {outOfStock ? "Indisponible" : added ? "Ajouté au panier" : "Ajouter au panier"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setWished((value) => !value)}
              aria-pressed={wished}
              aria-label="Ajouter à la wishlist"
              className="press inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border border-[#d7b77a] bg-[#fff5e2] text-espresso hover:border-gold"
            >
              <Heart
                className={`h-4 w-4 transition-all duration-300 ${wished ? "scale-110 fill-[#c0553f] text-[#c0553f]" : ""}`}
              />
            </button>
          </div>

          {added && (
            <Link
              href="/panier"
              className="mt-3 block w-full rounded-full border border-[#dfc79a] bg-white py-3 text-center text-sm font-medium text-espresso hover:border-gold"
              style={{ animation: "var(--animate-slide-down)" }}
            >
              Voir mon panier →
            </Link>
          )}

          <ul className="mt-7 grid gap-3 border-t border-[#f2e7d4] pt-6 text-sm text-ink-soft">
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
              Paiement sécurisé et livraison assurée
            </li>
            <li className="flex items-center gap-3">
              <Package className="h-4 w-4 shrink-0 text-gold" />
              Livraison offerte dès 300 € · Retrait boutique gratuit
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 shrink-0 text-gold" />
              Retour sous 14 jours
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
