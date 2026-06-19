import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const products = [
  {
    slug: "bague-etoile-dor",
    name: "Bague Étoile d'Or",
    category: "Bagues",
    material: "Or 18 carats",
    price: 580,
    compareAt: 690,
    rating: 4.9,
    reviews: 128,
    stock: 12,
    badge: "Best-seller",
    image: "/images/bague-etoile.jpg",
    gallery: ["/images/bague-etoile.jpg", "/images/bague-etoile-2.jpg"],
    description: "Une bague signée d’un éclat discret et lumineux.",
    longDescription: "Bague en or 18 carats avec finition polie. Une pièce raffinée, idéale pour les célébrations et les moments précieux.",
    features: ["Or 18 carats", "Finition miroir", "Protection de l’émail"],
    sizeOptions: ["48", "50", "52", "54", "56"],
    color: "Or jaune",
  },
  {
    slug: "collier-lune-bleue",
    name: "Collier Lune Bleue",
    category: "Colliers",
    material: "Argent 925",
    price: 430,
    compareAt: 520,
    rating: 4.8,
    reviews: 96,
    stock: 9,
    badge: null,
    image: "/images/collier-lune.jpg",
    gallery: ["/images/collier-lune.jpg", "/images/collier-lune-2.jpg"],
    description: "Collier léger à l’éclat profond et élégant.",
    longDescription: "Un collier délicat et sophistiqué en argent 925, pensé pour les tenues du quotidien comme les occasions festives.",
    features: ["Argent 925", "Pendentif fini", "Fixation sécurisée"],
    sizeOptions: ["40 cm", "45 cm", "50 cm"],
    color: "Bleu profond",
  },
  {
    slug: "bracelet-serein",
    name: "Bracelet Serein",
    category: "Bracelets",
    material: "Or blanc",
    price: 390,
    compareAt: null,
    rating: 4.7,
    reviews: 74,
    stock: 15,
    badge: "Nouveau",
    image: "/images/bracelet-serein.jpg",
    gallery: ["/images/bracelet-serein.jpg", "/images/bracelet-serein-2.jpg"],
    description: "Bracelet raffiné au design au plus près du quotidien.",
    longDescription: "Un bracelet en or blanc, léger et régulier, conçu pour un style chic et discret au quotidien.",
    features: ["Or blanc", "Très léger", "Résistant au port quotidien"],
    sizeOptions: ["16 cm", "18 cm", "20 cm"],
    color: "Or blanc",
  },
];

async function main() {
  for (const product of products) {
    const data = {
      ...product,
      gallery: JSON.stringify(product.gallery),
      features: JSON.stringify(product.features),
      sizeOptions: JSON.stringify(product.sizeOptions),
    };
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: data,
      create: data,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
