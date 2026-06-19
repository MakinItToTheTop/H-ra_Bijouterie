"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/data/products";

const ALL_CATEGORIES = "Toutes catégories";
const ALL_MATERIALS = "Toutes matières";

const sortOptions = [
  { value: "recent", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "rating", label: "Meilleures notes" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

// Parse product data from database
function parseProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    material: row.material,
    price: row.price,
    compareAtPrice: row.compareAt,
    rating: row.rating || 0,
    reviews: row.reviews || 0,
    stock: row.stock,
    badge: row.badge,
    image: row.image,
    gallery: Array.isArray(row.gallery) ? row.gallery : JSON.parse(row.gallery || "[]"),
    description: row.description,
    longDescription: row.longDescription,
    features: Array.isArray(row.features) ? row.features : JSON.parse(row.features || "[]"),
    sizeOptions: Array.isArray(row.sizeOptions) ? row.sizeOptions : JSON.parse(row.sizeOptions || "[]"),
    color: row.color,
  };
}

export default function BoutiquePage() {
  const { products: rawProducts, isLoading } = useProducts(5000);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [material, setMaterial] = useState<string>(ALL_MATERIALS);
  const [sort, setSort] = useState<SortValue>("recent");

  const products = useMemo(() => rawProducts.map(parseProduct), [rawProducts]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return [ALL_CATEGORIES, ...Array.from(cats).sort()];
  }, [products]);

  const materials = useMemo(() => {
    const mats = new Set(products.map((p) => p.material));
    return [ALL_MATERIALS, ...Array.from(mats).sort()];
  }, [products]);

  const priceRange = useMemo(() => {
    if (products.length === 0) return null;
    const prices = products.map((product) => product.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    const next = products.filter((product) => {
      const matchesCategory = category === ALL_CATEGORIES || product.category === category;
      const matchesMaterial = material === ALL_MATERIALS || product.material === material;
      const matchesQuery =
        !term ||
        [product.name, product.category, product.material, product.description]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchesCategory && matchesMaterial && matchesQuery;
    });

    switch (sort) {
      case "price-asc":
        return [...next].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...next].sort((a, b) => b.price - a.price);
      case "rating":
        return [...next].sort((a, b) => b.rating - a.rating);
      default:
        return next;
    }
  }, [products, category, material, query, sort]);

  const activeFilters = [
    category !== ALL_CATEGORIES ? { label: category, clear: () => setCategory(ALL_CATEGORIES) } : null,
    material !== ALL_MATERIALS ? { label: material, clear: () => setMaterial(ALL_MATERIALS) } : null,
    query ? { label: `« ${query} »`, clear: () => setQuery("") } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const resetAll = () => {
    setCategory(ALL_CATEGORIES);
    setMaterial(ALL_MATERIALS);
    setQuery("");
    setSort("recent");
  };

  const selectClass =
    "w-full appearance-none rounded-full border border-[#e5d1ab] bg-[#fffdfb] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%238a7167%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_1.1rem_center] bg-no-repeat px-5 py-3.5 pr-11 text-sm text-[#2a1f1b] outline-none transition hover:border-[#d8bd8c] focus:border-[#b88a44] focus:shadow-[0_0_0_4px_rgba(185,138,68,0.12)]";

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
      <header className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b6a4b]">Boutique</p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-tight text-[#231711]">
            Collection de bijoux
          </h1>
          {priceRange && (
            <p className="mt-3 text-sm text-[#5c453d]">
              De {priceRange.min}€ à {priceRange.max}€
            </p>
          )}
        </div>
        <div className="rounded-full border border-[#e5d1ab] bg-white px-4 py-2 text-sm text-[#5c453d]">
          {isLoading ? "Chargement…" : `${filtered.length} pièce${filtered.length > 1 ? "s" : ""} disponible${filtered.length > 1 ? "s" : ""}`}
        </div>
      </header>

      {/* Filter bar */}
      <div className="sticky top-[84px] z-30 mb-8 rounded-[28px] border border-[#e5d1ab] bg-white/95 p-4 shadow-sm backdrop-blur-xl">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b6a4b]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher…"
              aria-label="Rechercher un bijou"
              className="w-full rounded-full border border-[#e5d1ab] bg-[#fffdfb] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#a89968] hover:border-[#d8bd8c] focus:border-[#b88a44]"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filtrer par catégorie"
            className={selectClass}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={material}
            onChange={(event) => setMaterial(event.target.value)}
            aria-label="Filtrer par matière"
            className={selectClass}
          >
            {materials.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortValue)}
            aria-label="Trier"
            className={selectClass}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7b77a] bg-[#fff5e2] px-5 py-3.5 text-sm font-medium text-[#2a1f1b] hover:border-[#b88a44] hover:bg-[#fff8e8]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Réinit.
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#f2e7d4] pt-3">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8b6a4b]">Filtres</span>
            {activeFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={filter.clear}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#fef8f0] px-3 py-1.5 text-xs font-medium text-[#6f5230] hover:bg-[#ecdcba]"
              >
                {filter.label}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[#e0c98d] bg-[#fffaf3] p-14 text-center">
          <p className="font-display text-2xl text-[#231711]">Aucune pièce ne correspond</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5c453d]">
            {products.length === 0
              ? "Le catalogue est encore vide. Ajoutez votre première pièce depuis l'espace admin."
              : "Essayez d'élargir vos critères ou réinitialisez les filtres."}
          </p>
          {products.length > 0 && (
            <button
              type="button"
              onClick={resetAll}
              className="mt-6 inline-flex rounded-full bg-[#2a1f1b] px-5 py-3 text-sm font-medium text-white hover:bg-[#3a2f2b]"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product, index) => (
            <div
              key={product.id}
              style={{
                animation: `fadeIn 0.3s ease-in-out`,
                animationDelay: `${Math.min(index, 8) * 60}ms`,
                animationFillMode: "both",
              }}
            >
              <ProductCard product={product} priority={index < 3} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
