"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { formatPrice } from "@/lib/format";

type SearchProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  material: string;
  price: number;
  image: string;
};

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Catalogue is small — fetch once and filter locally for instant results.
  useEffect(() => {
    if (!open || products.length > 0) return;

    let cancelled = false;
    setLoading(true);

    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setProducts(data.products ?? []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, products.length]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products.slice(0, 6);

    return products
      .filter((product) =>
        [product.name, product.category, product.material]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
      .slice(0, 8);
  }, [products, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Recherche">
      <button
        type="button"
        aria-label="Fermer la recherche"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#1f1512]/40 backdrop-blur-sm"
        style={{ animation: "var(--animate-fade-in)" }}
      />

      <div
        className="relative mx-auto mt-[10vh] w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-line bg-cream-panel shadow-[var(--shadow-lift)]"
        style={{ animation: "var(--animate-scale-in)" }}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <Search className="h-5 w-5 shrink-0 text-gold" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une bague, un collier, une montre…"
            className="w-full bg-transparent text-base outline-none placeholder:text-ink-muted"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1 text-ink-muted hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {loading && (
            <div className="space-y-2 p-2">
              {[0, 1, 2].map((index) => (
                <div key={index} className="skeleton h-16 rounded-2xl" />
              ))}
            </div>
          )}

          {!loading && results.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-ink-soft">
              {query ? `Aucun résultat pour « ${query} ».` : "Le catalogue est vide pour le moment."}
            </p>
          )}

          {!loading &&
            results.map((product) => (
              <Link
                key={product.id}
                href={`/produit/${product.slug}`}
                onClick={onClose}
                className="flex items-center gap-4 rounded-2xl px-3 py-2.5 transition hover:bg-cream-deep"
              >
                <img
                  src={product.image}
                  alt=""
                  loading="lazy"
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">
                    {product.category}
                  </p>
                </div>
                <span className="text-sm font-semibold text-ink">{formatPrice(product.price)}</span>
              </Link>
            ))}
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          <span>Recherche instantanée</span>
          <span>Échap pour fermer</span>
        </div>
      </div>
    </div>
  );
}
