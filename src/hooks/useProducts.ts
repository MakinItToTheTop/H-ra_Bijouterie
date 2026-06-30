import { useEffect, useState } from "react";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  material: string;
  price: number;
  compareAt?: number | null;
  stock: number;
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

export function useProducts(pollIntervalMs = 5000) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        if (data.ok && data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des produits", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Mettre à jour les produits automatiquement
    const interval = setInterval(fetchProducts, pollIntervalMs);

    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  return { products, isLoading };
}
