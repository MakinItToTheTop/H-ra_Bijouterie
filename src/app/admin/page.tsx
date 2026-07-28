"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { calculateJewelryPrice, jewelryMaterials } from "@/lib/pricing";
import Link from "next/link";

const defaultForm = {
  id: "",
  name: "",
  slug: "",
  category: "Bagues",
  material: "Or 18 carats",
  image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
  price: "0",
  stock: "1",
  badge: "",
  description: "",
  longDescription: "",
  features: "",
  gallery: "",
  sizeOptions: "",
  color: "",
  weightGrams: "1.2",
  marketRate: "70",
  labor: "120",
};

type ProductForm = typeof defaultForm;

type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  material: string;
  price: number | string;
  compareAt?: number | null;
  stock: number | string;
  badge?: string | null;
  image: string;
  gallery: string | string[];
  description: string;
  longDescription: string;
  features: string | string[];
  sizeOptions?: string | string[];
  color?: string | null;
  rating?: number;
  reviews?: number;
  createdAt?: string;
};

function parseStringArray(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [metalPrices, setMetalPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [imageSource, setImageSource] = useState<"url" | "file">("url");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check authentication and admin role
  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user) {
      router.push("/compte");
      return;
    }

    const userRole = session.user?.role;
    if (userRole !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  const realTimePrice = useMemo(() => {
    return calculateJewelryPrice({
      material: form.material,
      weightGrams: parseFloat(form.weightGrams) || 1.2,
      marketRate: metalPrices[form.material] || parseFloat(form.marketRate) || 70,
      labor: parseFloat(form.labor) || 120,
    });
  }, [form.material, form.weightGrams, form.marketRate, form.labor, metalPrices]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.products ?? []);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits", error);
    }
  };

  const fetchMetalPrices = async () => {
    try {
      const response = await fetch("/api/metals");
      const data = await response.json();
      if (data.ok && data.prices) {
        setMetalPrices(data.prices);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des prix des métaux", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMetalPrices();

    pollIntervalRef.current = setInterval(() => {
      fetchMetalPrices();
    }, 10000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const updateForm = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleImageFileChange = async (file: File | undefined) => {
  if (!file) return;

  setIsUploadingImage(true);
  try {
    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await response.json();

    if (!data.ok) {
      alert(data.message || "Échec de l'envoi de l'image.");
      return;
    }

    updateForm("image", data.url);
  } catch (error) {
    console.error(error);
    alert("Échec de l'envoi de l'image.");
  } finally {
    setIsUploadingImage(false);
  }
};

  const resetForm = () => {
    setForm(defaultForm);
    setImageSource("url");
    setIsFormOpen(false);
  };

  const editProduct = (product: ProductRecord) => {
    const features = parseStringArray(product.features);
    const gallery = parseStringArray(product.gallery);
    const sizeOptions = parseStringArray(product.sizeOptions);

    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      material: product.material,
      image: product.image,
      price: String(product.price),
      stock: String(product.stock),
      badge: product.badge || "",
      description: product.description,
      longDescription: product.longDescription,
      features: features.join("\n"),
      gallery: gallery.join("\n"),
      sizeOptions: sizeOptions.join("\n"),
      color: product.color || "",
      weightGrams: "1.2",
      marketRate: String(metalPrices[product.material] || 70),
      labor: "120",
    });
    setIsFormOpen(true);
  };

  const submitProduct = async () => {
    setIsLoading(true);

    const galleryLines = form.gallery
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: form.category,
      material: form.material,
      image: form.image,
      price: Number(form.price) || realTimePrice,
      stock: Number(form.stock) || 0,
      badge: form.badge || null,
      description: form.description || `${form.name} en ${form.material}.`,
      longDescription: form.longDescription || `Pièce ${form.name} en ${form.material}, conçue pour un port quotidien et une élégance durable.`,
      features: form.features
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      gallery: galleryLines.length > 0 ? galleryLines : [form.image],
      sizeOptions: form.sizeOptions
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      color: form.color || null,
    };

    if (!payload.name || !payload.image) {
      alert("Le titre et l'image du produit sont requis.");
      setIsLoading(false);
      return;
    }

    try {
      const url = form.id ? `/api/products/${form.id}` : "/api/products";
      const method = form.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Erreur lors de l'enregistrement du produit");
      }

      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (data.ok) {
        await fetchProducts();
      } else {
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#fffdfb] px-4 py-8 lg:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-[#8b6a4b]">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  if (!session || !session.user || session.user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#fffdfb] px-4 py-8 lg:px-6">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-dashed border-[#e5d1ab] bg-[#fffaf3] p-12 text-center">
          <p className="font-display text-2xl text-[#231711] mb-3">Accès refusé</p>
          <p className="text-[#5c453d]">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdfb] px-4 py-8 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
  <h1 className="font-display text-5xl text-[#231711]">Gestion des produits</h1>
  <div className="flex items-center gap-3">
  <Link
    href="/admin/commandes"
    className="flex items-center gap-2 rounded-full border border-[#c19a5b] px-5 py-3 text-sm font-medium text-[#7a5d41] transition hover:bg-[#fffaf3]"
  >
    Commandes
  </Link>
  <Link
    href="/admin/demandes"
    className="flex items-center gap-2 rounded-full border border-[#c19a5b] px-5 py-3 text-sm font-medium text-[#7a5d41] transition hover:bg-[#fffaf3]"
  >
    Demandes reçues
  </Link>
  <button
    onClick={() => setIsFormOpen(!isFormOpen)}
    className="flex items-center gap-2 rounded-full bg-[#2a1f1b] px-5 py-3 text-white hover:bg-[#3a2f2b]"
  >
    <Plus size={20} />
    Nouveau produit
  </button>
</div>
</div>

        {/* Métal Prices Display */}
        <div className="mb-8 rounded-[20px] border border-[#e5d1ab] bg-white p-6">
          <h2 className="font-display text-xl text-[#231711] mb-4">Prix des métaux (actualisé)</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {jewelryMaterials.map((mat) => (
              <div key={mat} className="rounded-lg bg-[#fffaf3] p-3">
                <div className="text-xs text-[#8b6a4b]">{mat}</div>
                <div className="font-display text-lg text-[#b88a44]">
                  {metalPrices[mat]?.toFixed(2) || "—"}€/g
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="max-h-screen w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#e5d1ab] bg-white p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-3xl text-[#231711]">
                  {form.id ? "Modifier le produit" : "Nouveau produit"}
                </h2>
                <button onClick={resetForm} className="text-[#8b6a4b] hover:text-[#2a1f1b]">
                  <X size={24} />
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">Titre</label>
                    <input
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                      placeholder="Nom du bijou"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">Slug</label>
                    <input
                      value={form.slug}
                      onChange={(e) => updateForm("slug", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                      placeholder="bague-or-18-carats"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">Catégorie</label>
                    <select
                      value={form.category}
                      onChange={(e) => updateForm("category", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                    >
                      {["Bagues", "Colliers", "Bracelets", "Boucles d'oreilles", "Alliances", "Montres"].map((cat) => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">
                      Matière (Prix actualisé: {metalPrices[form.material]?.toFixed(2) || form.marketRate}€/g)
                    </label>
                    <select
                      value={form.material}
                      onChange={(e) => updateForm("material", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                    >
                      {jewelryMaterials.map((mat) => (
                        <option key={mat}>{mat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">Poids (g)</label>
                    <input
                      type="number"
                      value={form.weightGrams}
                      onChange={(e) => updateForm("weightGrams", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">
                      Prix calculé: <span className="font-display text-lg text-[#b88a44]">{realTimePrice.toFixed(2)}€</span>
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => updateForm("price", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                      placeholder="Prix personnalisé (optionnel)"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
  <label className="text-sm font-medium text-[#2a1f1b]">Image du produit</label>
  <div className="mt-1.5 mb-2 inline-flex rounded-lg border border-[#e5d1ab] bg-[#fffdfb] p-0.5 text-xs">
    <button
      type="button"
      onClick={() => setImageSource("url")}
      className={`rounded-md px-3 py-1.5 font-medium transition ${
        imageSource === "url" ? "bg-[#b88a44] text-white" : "text-[#8b6a4b] hover:text-[#2a1f1b]"
      }`}
    >
      URL
    </button>
    <button
      type="button"
      onClick={() => setImageSource("file")}
      className={`rounded-md px-3 py-1.5 font-medium transition ${
        imageSource === "file" ? "bg-[#b88a44] text-white" : "text-[#8b6a4b] hover:text-[#2a1f1b]"
      }`}
    >
      Depuis mon ordinateur
    </button>
  </div>

  {imageSource === "url" ? (
    <input
      value={form.image}
      onChange={(e) => updateForm("image", e.target.value)}
      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
      placeholder="https://..."
    />
  ) : (
    <input
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      onChange={(e) => handleImageFileChange(e.target.files?.[0])}
      disabled={isUploadingImage}
      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#f4e7c9] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#7a5b39] disabled:opacity-60"
    />
  )}

  {isUploadingImage && <p className="mt-1.5 text-xs text-[#8b6a4b]">Envoi de l&apos;image…</p>}

  {form.image && (
    <img
      src={form.image}
      alt="Aperçu"
      className="mt-3 h-24 w-24 rounded-lg border border-[#e5d1ab] object-cover"
    />
  )}
</div>

                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => updateForm("stock", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">Badge</label>
                    <input
                      value={form.badge}
                      onChange={(e) => updateForm("badge", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                      placeholder="Nouveau, Solde, etc..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">Couleur</label>
                    <input
                      value={form.color}
                      onChange={(e) => updateForm("color", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                      placeholder="Or, Argent, etc..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateForm("description", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                      rows={2}
                      placeholder="Courte description"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">Description longue</label>
                    <textarea
                      value={form.longDescription}
                      onChange={(e) => updateForm("longDescription", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                      rows={2}
                      placeholder="Description détaillée"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#2a1f1b]">Caractéristiques (une par ligne)</label>
                    <textarea
                      value={form.features}
                      onChange={(e) => updateForm("features", e.target.value)}
                      className="w-full rounded-lg border border-[#e5d1ab] bg-[#fffdfb] px-4 py-2 text-sm outline-none focus:border-[#b88a44]"
                      rows={2}
                      placeholder="Gravure personnalisée&#10;Garantie à vie"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={submitProduct}
                  disabled={isLoading || isUploadingImage}
                  className="flex-1 rounded-full bg-[#b88a44] px-6 py-3 text-sm font-medium text-white hover:bg-[#a67a34] disabled:opacity-50"
                >
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 rounded-full border border-[#e5d1ab] bg-[#fffdfb] px-6 py-3 text-sm font-medium text-[#2a1f1b] hover:bg-[#f5eee0]"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div>
          <h2 className="mb-4 font-display text-2xl text-[#231711]">Produits ({products.length})</h2>
          {products.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#e5d1ab] bg-[#fffaf3] p-12 text-center">
              <p className="text-[#8b6a4b]">Aucun produit. Créez-en un pour commencer.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-[30px] border border-[#ebddbe] bg-white p-6 hover:shadow-lg transition"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-display text-xl text-[#231711]">{product.name}</h3>
                      <p className="text-sm text-[#7a5d41]">{product.material}</p>
                    </div>
                    {product.badge && (
                      <span className="rounded-full bg-[#b88a44] px-3 py-1 text-xs font-medium text-white">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-2 text-sm text-[#5c453d]">
                    <div>
                      <span className="text-[#8b6a4b]">Prix:</span> <span className="font-medium">{product.price}€</span>
                    </div>
                    <div>
                      <span className="text-[#8b6a4b]">Stock:</span> <span className="font-medium">{product.stock}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#8b6a4b]">Catégorie:</span> <span className="font-medium">{product.category}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => editProduct(product)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full border border-[#b88a44] px-4 py-2 text-sm font-medium text-[#b88a44] hover:bg-[#fef8f0]"
                    >
                      <Pencil size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full border border-[#c75a5a] px-4 py-2 text-sm font-medium text-[#c75a5a] hover:bg-[#fef8f0]"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
