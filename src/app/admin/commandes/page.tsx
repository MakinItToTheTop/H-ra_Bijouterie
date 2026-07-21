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

// Statuts affichés dans les filtres en haut de page (union livraison + retrait).
const STATUSES = ["en attente", "payée", "expédiée", "prête à récupérer", "livrée", "annulée"] as const;

// Statuts proposés dans le menu déroulant de chaque commande, selon le mode de livraison.
const DELIVERY_STATUSES = ["payée", "expédiée", "livrée", "annulée"] as const;
const PICKUP_STATUSES = ["payée", "prête à récupérer", "annulée"] as const;

const statusStyles: Record<string, string> = {
  "en attente": "bg-[#fdf1de] text-[#8b6a4b]",
  payée: "bg-[#e7f3e3] text-[#3f6b34]",
  expédiée: "bg-[#e3ecf7] text-[#33578f]",
  "prête à récupérer": "bg-[#e3ecf7] text-[#33578f]",
  livrée: "bg-[#f4e7c9] text-[#7a5d41]",
  annulée: "bg-[#fbe4e4] text-[#a13d3d]",
};

const URGENCY_COLORS: Record<"red" | "orange" | "green", string> = {
  red: "bg-[#c1443d]",
  orange: "bg-[#d98a2b]",
  green: "bg-[#4f8c3f]",
};

function getElapsedHours(order: OrderRecord): number {
  return (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
}

// Retrait : le client est invité à venir sous 48h.
function getPickupUrgency(hours: number): "red" | "orange" | "green" {
  if (hours >= 32) return "red";
  if (hours >= 16) return "orange";
  return "green";
}

// Livraison : promesse de 7 jours (168h).
function getDeliveryUrgency(hours: number): "red" | "orange" | "green" {
  if (hours >= 120) return "red"; // 5 à 7 jours
  if (hours >= 84) return "orange"; // 3.5 à 5 jours
  return "green"; // < 3.5 jours
}

function getUrgency(order: OrderRecord): "red" | "orange" | "green" {
  const hours = getElapsedHours(order);
  return order.shippingMode === "retrait" ? getPickupUrgency(hours) : getDeliveryUrgency(hours);
}

// Trie les commandes payées par urgence (plus ancien en premier),
// laisse les autres statuts dans leur ordre chronologique existant.
function sortByUrgency(list: OrderRecord[]): OrderRecord[] {
  return list.slice().sort((a, b) => {
    if (a.status !== "payée" && b.status !== "payée") return 0;
    if (a.status !== "payée") return 1;
    if (b.status !== "payée") return -1;
    return getElapsedHours(b) - getElapsedHours(a);
  });
}

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

  const statusFiltered = orders.filter((o) => filter === "tous" || o.status === filter);
  const pickupOrders = sortByUrgency(statusFiltered.filter((o) => o.shippingMode === "retrait"));
  const deliveryOrders = sortByUrgency(statusFiltered.filter((o) => o.shippingMode !== "retrait"));

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

      {pickupOrders.length === 0 && deliveryOrders.length === 0 ? (
        <div className="mt-10 rounded-[28px] border border-dashed border-[#e5d1ab] bg-[#fffaf3] p-12 text-center text-ink-soft">
          Aucune commande {filter !== "tous" ? `au statut "${filter}"` : ""} pour le moment.
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="mb-4 font-display text-2xl text-[#231711]">
              Retrait en boutique <span className="font-sans text-sm text-ink-soft">({pickupOrders.length})</span>
            </h2>
            {pickupOrders.length === 0 ? (
              <p className="text-sm text-ink-soft">Aucune commande en retrait.</p>
            ) : (
              <div className="space-y-4">
                {pickupOrders.map((order) => (
                  <OrderCard key={order.id} order={order} updateStatus={updateStatus} deleteOrder={deleteOrder} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 font-display text-2xl text-[#231711]">
              Livraison à domicile{" "}
              <span className="font-sans text-sm text-ink-soft">({deliveryOrders.length})</span>
            </h2>
            {deliveryOrders.length === 0 ? (
              <p className="text-sm text-ink-soft">Aucune commande en livraison.</p>
            ) : (
              <div className="space-y-4">
                {deliveryOrders.map((order) => (
                  <OrderCard key={order.id} order={order} updateStatus={updateStatus} deleteOrder={deleteOrder} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  updateStatus,
  deleteOrder,
}: {
  order: OrderRecord;
  updateStatus: (order: OrderRecord, newStatus: string) => void;
  deleteOrder: (order: OrderRecord) => void;
}) {
  return (
    <div className="rounded-[24px] border border-line bg-white p-6 shadow-[var(--shadow-soft)]">
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
          {order.status === "payée" && (
            <span className="flex items-center gap-1.5 text-xs text-ink-soft">
              <span className={`h-2.5 w-2.5 rounded-full ${URGENCY_COLORS[getUrgency(order)]}`} />
              {order.shippingMode === "livraison"
                ? "À expédier"
                : getUrgency(order) === "red"
                ? "Urgent"
                : getUrgency(order) === "orange"
                ? "À préparer"
                : "Récent"}
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              statusStyles[order.status] ?? "bg-[#fffaf3] text-ink-soft"
            }`}
          >
            {order.status}
          </span>
          <select
            value={order.status}
            onChange={(event) => updateStatus(order, event.target.value)}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink-soft outline-none focus:border-gold"
          >
            {/* "en attente" n'est pas un choix manuel pour le retrait (statut
                initial avant paiement) : on ne l'affiche que si la commande
                s'y trouve déjà, pour ne pas la laisser bloquée sans option. */}
            {order.status === "en attente" && <option value="en attente">en attente</option>}
            {(order.shippingMode === "retrait" ? PICKUP_STATUSES : DELIVERY_STATUSES).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {((order.shippingMode === "retrait" && order.status === "prête à récupérer") ||
            (order.shippingMode !== "retrait" && order.status === "livrée")) && (
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

      {(order.customerFirstName || order.customerLastName || order.customerPhone || order.address) && (
        <div className="mt-4 rounded-2xl border border-[#e5d1ab] bg-[#fffaf3] p-4 text-sm text-[#43352f]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8b6a4b]">
            {order.shippingMode === "retrait" ? "Client à identifier (retrait en boutique)" : "Adresse de livraison"}
          </p>
          <p className="mt-2 font-medium">
            {order.customerFirstName || order.customerLastName
              ? `${order.customerFirstName ?? ""} ${order.customerLastName ?? ""}`.trim()
              : order.user?.name || "Client"}
          </p>
          {order.shippingMode === "livraison" && (
            <>
              {order.address && <p>{order.address}</p>}
              {(order.postalCode || order.city) && (
                <p>
                  {order.postalCode} {order.city}
                </p>
              )}
              {order.country && <p>{order.country}</p>}
            </>
          )}
          {order.customerEmail && <p className="mt-1 text-[#8b7364]">{order.customerEmail}</p>}
          {order.customerPhone && <p className="text-[#8b7364]">Tél : {order.customerPhone}</p>}
          {order.shippingMode === "retrait" && (
            <p className="mt-2 text-xs text-[#a13d3d]">
              Vérifier une pièce d'identité correspondant à ce nom avant de remettre la commande
              (n° #{order.id.slice(-8).toUpperCase()}).
            </p>
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
  );
}