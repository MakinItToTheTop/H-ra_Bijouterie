"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  VAT_RATE,
  formatPrice,
} from "@/lib/format";

export default function PanierPage() {
  const { items, subtotal, updateQuantity, removeItem, hydrated, stockAdjustedIds } = useCart();

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const vatIncluded = total - total / (1 + VAT_RATE);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="skeleton h-12 w-64 rounded-full" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            {[0, 1].map((index) => (
              <div key={index} className="skeleton h-40 rounded-[28px]" />
            ))}
          </div>
          <div className="skeleton h-80 rounded-[28px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
      {stockAdjustedIds.length > 0 && (
        <div
          className="mb-6 flex items-start gap-3 rounded-2xl border border-[#e8b4a0] bg-[#fff4f0] p-4 text-sm text-[#8a4a3a]"
          style={{ animation: "var(--animate-fade-up)" }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Le stock de certains articles a changé depuis leur ajout au panier : les
            quantités ont été ajustées, ou l’article a été retiré s’il n’était plus
            disponible.
          </p>
        </div>
      )}

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b6a4b]">Panier</p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-tight text-[#231711]">
            Mon panier
          </h1>
        </div>
        {items.length > 0 && (
          <p className="text-sm text-ink-soft">
            {items.length} référence{items.length > 1 ? "s" : ""}
          </p>
        )}
      </header>

      {items.length === 0 ? (
        <div
          className="mt-10 rounded-[30px] border border-dashed border-[#e0c98d] bg-[#fffaf3] p-14 text-center"
          style={{ animation: "var(--animate-fade-up)" }}
        >
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-pale text-[#7a5531]">
            <ShoppingBag className="h-6 w-6" />
          </span>
          <p className="mt-6 font-display text-3xl text-ink">Votre panier est vide</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink-soft">
            Parcourez la collection et laissez-vous tenter par une pièce d’exception.
          </p>
          <Link
            href="/boutique"
            className="press sheen mt-8 inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3.5 text-sm font-medium text-white hover:bg-espresso-light"
          >
            Découvrir nos bijoux
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div className="space-y-5">
            {/* Free shipping progress */}
            <div className="rounded-[24px] border border-line bg-white p-5">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 shrink-0 text-gold" />
                {remainingForFreeShipping > 0 ? (
                  <p className="text-ink-soft">
                    Plus que{" "}
                    <strong className="font-semibold text-ink">
                      {formatPrice(remainingForFreeShipping)}
                    </strong>{" "}
                    pour la livraison offerte.
                  </p>
                ) : (
                  <p className="font-medium text-[#5c7a4a]">Livraison offerte débloquée 🎉</p>
                )}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f1e6d3]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c19a5b] to-[#e3c894] transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            {items.map(({ product, quantity }, index) => (
              <article
                key={product.id}
                className="card-lift flex flex-col gap-5 rounded-[28px] border border-line bg-white p-4 sm:flex-row sm:items-center"
                style={{
                  animation: "var(--animate-fade-up)",
                  animationDelay: `${index * 60}ms`,
                }}
              >
                <Link
                  href={`/produit/${product.slug}`}
                  className="shrink-0 overflow-hidden rounded-[20px]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-32 w-32 object-cover transition-transform duration-700 hover:scale-110"
                  />
                </Link>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                        {product.category}
                      </p>
                      <Link
                        href={`/produit/${product.slug}`}
                        className="mt-1.5 block font-display text-xl text-ink hover:text-[#8d6a43]"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-ink-soft">
                        {formatPrice(product.price)} l’unité
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      aria-label={`Retirer ${product.name} du panier`}
                      className="press rounded-full p-2 text-ink-muted hover:bg-[#fff0ee] hover:text-[#b4544a]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex items-center rounded-full border border-[#e2ceb1] bg-[#fffaf5]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label="Diminuer la quantité"
                        className="press rounded-full p-2.5 text-espresso hover:text-gold"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-9 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= Math.max(1, product.stock)}
                        aria-label="Augmenter la quantité"
                        className="press rounded-full p-2.5 text-espresso hover:text-gold disabled:opacity-35"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="font-display text-xl text-ink">
                      {formatPrice(product.price * quantity)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-[28px] border border-line bg-white p-6 shadow-[var(--shadow-soft)] lg:sticky lg:top-[100px]">
            <h2 className="font-display text-3xl text-[#231711]">Récapitulatif</h2>
            <div className="rule-gold my-5" />

            <dl className="space-y-3.5 text-sm text-[#4d3c35]">
              <div className="flex items-center justify-between">
                <dt>Sous-total</dt>
                <dd className="font-medium text-ink">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Livraison</dt>
                <dd className={shipping === 0 ? "font-medium text-[#5c7a4a]" : "font-medium text-ink"}>
                  {shipping === 0 ? "Offerte" : formatPrice(shipping)}
                </dd>
              </div>
              <div className="flex items-center justify-between text-ink-muted">
                <dt>dont TVA (20 %)</dt>
                <dd>{formatPrice(vatIncluded)}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-center justify-between border-t border-[#e8dcc0] pt-5">
              <span className="text-sm uppercase tracking-[0.2em] text-ink-muted">Total</span>
              <span className="font-display text-3xl text-ink">{formatPrice(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="press sheen mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-5 py-3.5 text-sm font-medium text-white hover:bg-espresso-light"
            >
              Passer commande
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/boutique"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#e0cba4] bg-white px-5 py-3 text-sm font-medium text-espresso hover:border-gold"
            >
              Continuer mes achats
            </Link>

            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-muted">
              <ShieldCheck className="h-4 w-4 text-gold" />
              Paiement sécurisé · Retour sous 14 jours
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}