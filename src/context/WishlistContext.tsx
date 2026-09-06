"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/Toast";

type WishlistContextValue = {
  /** False tant qu'on n'a pas encore récupéré la liste depuis le serveur —
   *  évite d'afficher tous les cœurs comme "non favoris" le temps du fetch. */
  hydrated: boolean;
  isWished: (productId: string) => boolean;
  toggleWish: (productId: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const { toast } = useToast();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  const isLoggedIn = status === "authenticated";

  // Récupère les favoris depuis la base dès qu'on sait que le client est
  // connecté. Un visiteur non connecté n'a pas de wishlist côté serveur :
  // on ne fait aucun appel et la liste reste vide.
  useEffect(() => {
    if (status === "loading") return;

    if (!isLoggedIn) {
      setIds(new Set());
      setHydrated(true);
      return;
    }

    let cancelled = false;
    setHydrated(false);

    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setIds(new Set(Array.isArray(data.productIds) ? data.productIds : []));
      })
      .catch((error) => console.error("Wishlist load error", error))
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, status]);

  const toggleWish = useCallback(
    (productId: string) => {
      if (!isLoggedIn) {
        toast({
          title: "Connectez-vous",
          description: "Créez un compte ou connectez-vous pour enregistrer vos favoris.",
          tone: "info",
        });
        return;
      }

      const wasWished = ids.has(productId);

      // Mise à jour optimiste : le cœur réagit immédiatement, on ne bloque
      // pas l'utilisateur sur l'aller-retour réseau.
      setIds((current) => {
        const next = new Set(current);
        if (wasWished) next.delete(productId);
        else next.add(productId);
        return next;
      });

      const request = wasWished
        ? fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, { method: "DELETE" })
        : fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });

      request
        .then(async (res) => {
          if (!res.ok) throw new Error(await res.text());
        })
        .catch((error) => {
          console.error("Wishlist toggle error", error);
          // Échec réseau/serveur : on annule la mise à jour optimiste pour
          // ne pas laisser le cœur mentir sur l'état réel enregistré.
          setIds((current) => {
            const next = new Set(current);
            if (wasWished) next.add(productId);
            else next.delete(productId);
            return next;
          });
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour vos favoris pour le moment.",
            tone: "error",
          });
        });
    },
    [ids, isLoggedIn, toast]
  );

  const isWished = useCallback((productId: string) => ids.has(productId), [ids]);

  const value = useMemo(() => ({ hydrated, isWished, toggleWish }), [hydrated, isWished, toggleWish]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist doit être utilisé à l'intérieur d'un WishlistProvider.");
  }
  return context;
}