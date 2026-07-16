"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type OrderRecord = {
  id: string;
  total: number;
  status: string;
  shippingMode: string;
  createdAt: string;
  items: OrderItem[];
  user: { name: string | null; email: string } | null;
  customerFirstName: string | null;
customerLastName: string | null;
customerEmail: string | null;
customerPhone: string | null;
address: string | null;
postalCode: string | null;
city: string | null;
country: string | null;
};

const STATUSES = ["en attente", "payée", "expédiée", "livrée", "annulée"] as const;

const statusStyles: Record<string, string> = {
  "en attente": "bg-[#fdf1de] text-[#8b6a4b]",
  payée: "bg-[#e7f3e3] text-[#3f6b34]",
  expédiée: "bg-[#e3ecf7] text-[#33578f]",
  livrée: "bg-[#f4e7c9] text-[#7a5d41]",
  annulée: "bg-[#fbe4e4] text-[#a13d3d]",
};

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("tous");

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user) {
      router.push("/compte");
      return;
    }

    if (session.user?.role !== "admin") {
      router.push("/");
      return;
    }

    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setOrders(data.orders);
      })
      .finally(() => setIsLoading(false));
  }, [session, status, router]);

  const updateStatus = async (order: OrderRecord, newStatus: string) => {
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));

    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: newStatus }),
    });

    if (!response.ok) {
      setOrders(previous);
    }
  };

  const deleteOrder = async (order: OrderRecord) => {
    if (!window.confirm(`Supprimer définitivement la commande #${order.id.slice(-8).toUpperCase()} ?`)) {
      return;
    }

    const previous = orders;
    setOrders((prev) => prev.filter((o) => o.id !== order.id));

    const response = await fetch(`/api/admin/orders?id=${order.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setOrders(previous);
      const data = await response.json().catch(() => null);
      alert(data?.message || "Échec de la suppression.");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
        <p className="text-sm text-ink-soft">Chargement…</p>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    return null;
  }

  const filtered = orders.filter((o) => filter === "tous" || o.status === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#8b6a4b] hover:text-gold">
        <ArrowLeft className="h-4 w-4" />
        Retour aux produits
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-[#231711]">Commandes</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("tous")}
            className={`rounded-full border px-4 py-2 text-sm capitalize transition ${
              filter === "tous"
                ? "border-gold bg-gold-pale text-espresso"
                : "border-line bg-white text-ink-soft hover:border-gold"
            }`}
          >
            Tous
          </button>
          {STATUSES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full border px-4 py-2 text-sm capitalize transition ${
                filter === option
                  ? "border-gold bg-gold-pale text-espresso"
                  : "border-line bg-white text-ink-soft hover:border-gold"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-[28px] border border-dashed border-[#e5d1ab] bg-[#fffaf3] p-12 text-center text-ink-soft">
          Aucune commande {filter !== "tous" ? `au statut "${filter}"` : ""} pour le moment.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="rounded-[24px] border border-line bg-white p-6 shadow-[var(--shadow-soft)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#8b6a4b]">
                    Commande #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <h2 className="mt-1 font-display text-xl text-[#231711]">
                    {order.user?.name || order.user?.email || "Client invité"}
                  </h2>
                  {order.user?.email && (
                    <a href={`mailto:${order.user.email}`} className="text-sm text-ink-soft hover:text-gold">
                      {order.user.email}
                    </a>
                  )}
                  <p className="mt-1 text-xs text-ink-soft">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · Livraison : {order.shippingMode}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[order.status] ?? "bg-[#fffaf3] text-ink-soft"}`}>
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(event) => updateStatus(order, event.target.value)}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink-soft outline-none focus:border-gold"
                  >
                    {STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {order.status === "livrée" && (
                    <button
                      type="button"
                      onClick={() => deleteOrder(order)}
                      className="text-xs font-medium text-[#a13d3d] hover:underline"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

              {order.shippingMode === "livraison" && (order.address || order.customerPhone) && (
  <div className="mt-4 rounded-2xl border border-[#e5d1ab] bg-[#fffaf3] p-4 text-sm text-[#43352f]">
    <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8b6a4b]">
      Adresse de livraison
    </p>
    <p className="mt-2">
      {order.customerFirstName || order.customerLastName
        ? `${order.customerFirstName ?? ""} ${order.customerLastName ?? ""}`.trim()
        : order.user?.name || "Client"}
    </p>
    {order.address && <p>{order.address}</p>}
    {(order.postalCode || order.city) && (
      <p>
        {order.postalCode} {order.city}
      </p>
    )}
    {order.country && <p>{order.country}</p>}
    {order.customerPhone && (
      <p className="mt-1 text-[#8b7364]">Tél : {order.customerPhone}</p>
    )}
  </div>
)}
              <div className="mt-4 space-y-1 rounded-2xl bg-[#fffaf3] p-4 text-sm text-[#43352f]">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between border-t border-[#ecdcc0] pt-2 font-medium text-[#231711]">
                  <span>Total</span>
                  <span>{order.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}