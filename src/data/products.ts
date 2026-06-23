export type ProductCategory =
  | "Bagues"
  | "Colliers"
  | "Bracelets"
  | "Boucles d'oreilles"
  | "Alliances"
  | "Montres";

export type ProductMaterial =
  | "Or 18 carats"
  | "Argent 925"
  | "Or blanc"
  | "Plaqué or";

/**
 * Shape used by the UI (cards, cart, product page).
 * `category` / `material` stay strings because the admin can create any value;
 * the unions above are only used to build the filter menus.
 */
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  material: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  badge?: string | null;
  image: string;
  gallery: string[];
  description: string;
  longDescription: string;
  features: string[];
  sizeOptions?: string[];
  color?: string | null;
};

/** Row as returned by Prisma / `/api/products`. */
export type ProductRow = Omit<Product, "compareAtPrice" | "gallery" | "features" | "sizeOptions"> & {
  compareAt?: number | null;
  gallery?: string | string[] | null;
  features?: string | string[] | null;
  sizeOptions?: string | string[] | null;
  createdAt?: string | Date;
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

/** Normalises a database row into the shape the UI components expect. */
export function toProduct(row: ProductRow): Product {
  return {
    ...row,
    compareAtPrice: row.compareAt ?? undefined,
    gallery: parseStringArray(row.gallery),
    features: parseStringArray(row.features),
    sizeOptions: parseStringArray(row.sizeOptions),
  };
}

export const productCategories: ProductCategory[] = [
  "Bagues",
  "Colliers",
  "Bracelets",
  "Boucles d'oreilles",
  "Alliances",
  "Montres",
];

export const productMaterials: ProductMaterial[] = [
  "Or 18 carats",
  "Argent 925",
  "Or blanc",
  "Plaqué or",
];

export const categories: { name: ProductCategory; description: string; image: string }[] = [
  {
    name: "Bagues",
    description: "Sélection fine et intemporelle",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Colliers",
    description: "Éclats lumineux au quotidien",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bracelets",
    description: "Luxe discret et précieux",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Boucles d'oreilles",
    description: "Éclat pour chaque instant",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Alliances",
    description: "Un lien pour la vie",
    image:
      "https://images.unsplash.com/photo-1591209627470-9b0c7d1e2f5a?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Montres",
    description: "Précision et élégance",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
  },
];

export const products: Product[] = [
  {
    id: "prod-bague-etoile-dor",
    slug: "bague-etoile-dor",
    name: "Bague Étoile d'Or",
    category: "Bagues",
    material: "Or 18 carats",
    price: 580,
    compareAtPrice: 690,
    rating: 4.9,
    reviews: 128,
    stock: 12,
    badge: "Best-seller",
    image: "/images/bague-etoile.jpg",
    gallery: ["/images/bague-etoile.jpg", "/images/bague-etoile-2.jpg"],
    description: "Une bague signée d’un éclat discret et lumineux.",
    longDescription:
      "Bague en or 18 carats avec finition polie. Une pièce raffinée, idéale pour les célébrations et les moments précieux.",
    features: ["Or 18 carats", "Finition miroir", "Protection de l’émail"],
    sizeOptions: ["48", "50", "52", "54", "56"],
    color: "Or jaune",
  },
  {
    id: "prod-collier-lune-bleue",
    slug: "collier-lune-bleue",
    name: "Collier Lune Bleue",
    category: "Colliers",
    material: "Argent 925",
    price: 430,
    compareAtPrice: 520,
    rating: 4.8,
    reviews: 96,
    stock: 9,
    badge: null,
    image: "/images/collier-lune.jpg",
    gallery: ["/images/collier-lune.jpg", "/images/collier-lune-2.jpg"],
    description: "Collier léger à l’éclat profond et élégant.",
    longDescription:
      "Un collier délicat et sophistiqué en argent 925, pensé pour les tenues du quotidien comme les occasions festives.",
    features: ["Argent 925", "Pendentif fini", "Fixation sécurisée"],
    sizeOptions: ["40 cm", "45 cm", "50 cm"],
    color: "Bleu profond",
  },
  {
    id: "prod-bracelet-serein",
    slug: "bracelet-serein",
    name: "Bracelet Serein",
    category: "Bracelets",
    material: "Or blanc",
    price: 390,
    compareAtPrice: 450,
    rating: 4.7,
    reviews: 74,
    stock: 15,
    badge: "Nouveau",
    image: "/images/bracelet-serein.jpg",
    gallery: ["/images/bracelet-serein.jpg", "/images/bracelet-serein-2.jpg"],
    description: "Bracelet raffiné au design au plus près du quotidien.",
    longDescription:
      "Un bracelet en or blanc, léger et régulier, conçu pour un style chic et discret au quotidien.",
    features: ["Or blanc", "Très léger", "Résistant au port quotidien"],
    sizeOptions: ["16 cm", "18 cm", "20 cm"],
    color: "Or blanc",
  },
];

export const testimonials = [
  {
    name: "Claire M.",
    city: "Nantes",
    review:
      "Un accueil chaleureux, des conseils très professionnels et une bague absolument sublime. Je recommande sans hésiter.",
  },
  {
    name: "Yasemin T.",
    city: "Rezé",
    review:
      "Service client irréprochable, création sur mesure parfaite et très belle qualité. J’ai trouvé la pièce idéale.",
  },
  {
    name: "Thomas P.",
    city: "Saint-Herblain",
    review:
      "Atelier très sérieux, réparation rapide et très bien expliquée. Le rapport qualité-prix est excellent.",
  },
];
