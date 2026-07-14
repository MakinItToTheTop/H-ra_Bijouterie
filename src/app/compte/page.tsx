"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  total: number;
  status: string;
  shippingMode: string;
  createdAt: string;
  items: OrderItem[];
};

const statusLabels: Record<string, string> = {
  "en attente": "En attente",
  payée: "Payée",
  expédiée: "Expédiée",
  livrée: "Livrée",
  annulée: "Annulée",
};

export default function ComptePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (!session || isAdmin) return;

    setOrdersLoading(true);
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setOrders(data.orders);
      })
      .finally(() => setOrdersLoading(false));
  }, [session, isAdmin]);

  const cancelOrder = async (order: Order) => {
    if (!window.confirm(`Annuler la commande #${order.id.slice(-8).toUpperCase()} et être remboursé ?`)) {
      return;
    }

    setCancellingId(order.id);

    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        alert(data.message ?? "L'annulation n'a pas pu être effectuée.");
        return;
      }

      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "annulée" } : o)));
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Identifiants incorrects. Vérifiez votre email et votre mot de passe.");
      return;
    }

    router.push("/compte");
    router.refresh();
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  if (status === "loading") {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-[#5c453d]">Chargement...</div>;
  }

  if (session) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
        <div className="rounded-[30px] border border-[#ebddbe] bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-[#8b6a4b]">Compte client</p>
          <h1 className="mt-3 font-display text-5xl text-[#231711]">Bonjour {session.user?.name || session.user?.email}</h1>
          <p className="mt-4 text-[#5c453d]">Vous êtes connecté à votre espace Héra Bijouterie.</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-[#2a1f1b] px-5 py-3 text-sm font-medium text-white"
            >
              Se déconnecter
            </button>
            {session.user?.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-full border border-[#c19a5b] px-5 py-3 text-sm font-medium text-[#7a5d41] transition hover:bg-[#fffaf3]"
              >
                Gérer les produits →
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[30px] border border-[#ebddbe] bg-white p-6">
            <h2 className="font-display text-3xl text-[#231711]">Historique des commandes</h2>
            <div className="mt-5 space-y-3 text-[#4d3c35]">

              {isAdmin ? (
  <p className="text-sm text-[#8b7364]">
    Les commandes ne sont pas disponibles pour un compte administrateur.
  </p>
) :ordersLoading ? (
                <p className="text-sm text-[#8b7364]">Chargement…</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-[#8b7364]">Vous n&apos;avez pas encore passé de commande.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-[18px] bg-[#fffaf3] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Commande #{order.id.slice(-8).toUpperCase()}</span>
                      <span className="text-[#7a5d41]">
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-[#8b7364]">
                      <span>
                        {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
                      </span>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-[#231711]">
                      {order.total.toFixed(2)} €
                    </div>
                    {order.status === "payée" && (
                      <button
                        type="button"
                        onClick={() => cancelOrder(order)}
                        disabled={cancellingId === order.id}
                        className="mt-2 text-xs font-medium text-[#a13d3d] hover:underline disabled:opacity-60"
                      >
                        {cancellingId === order.id ? "Annulation…" : "Annuler et être remboursé"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#ebddbe] bg-white p-6">
            <h2 className="font-display text-3xl text-[#231711]">Wishlist</h2>
            <p className="mt-4 text-[#5c453d]">Aucune pièce enregistrée pour le moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-5xl text-[#231711]">Mon compte</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[30px] border border-[#ebddbe] bg-white p-6">
          <h2 className="font-display text-3xl text-[#231711]">Connexion</h2>
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
              required
              className="w-full rounded-full border border-[#e5d1ab] bg-[#fffdfb] px-4 py-3 outline-none transition focus:border-[#b88a44]"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mot de passe"
              type="password"
              required
              className="w-full rounded-full border border-[#e5d1ab] bg-[#fffdfb] px-4 py-3 outline-none transition focus:border-[#b88a44]"
            />
            {error ? <p className="text-sm text-[#c75a5a]">{error}</p> : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#2a1f1b] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>
          <div className="mt-5 text-sm text-[#5c453d]">
            Pas encore inscrit ? <Link href="/compte/inscription" className="font-medium text-[#7a5d41]">Créer un compte</Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-[#ebddbe] bg-white p-6">
            <h2 className="font-display text-3xl text-[#231711]">Vos avantages</h2>
            <p className="mt-4 text-sm leading-6 text-[#5c453d]">
              Connectez-vous pour retrouver votre historique de commandes, suivre vos livraisons
              et enregistrer vos pièces favorites.
            </p>
          </div>

          <div className="rounded-[30px] border border-[#ebddbe] bg-white p-6">
            <h2 className="font-display text-3xl text-[#231711]">Wishlist</h2>
            <p className="mt-4 text-[#5c453d]">Aucune pièce enregistrée pour le moment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}