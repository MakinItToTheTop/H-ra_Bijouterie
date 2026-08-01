"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, MessageSquareReply, Phone, Send, Trash2, UserCheck, UserX } from "lucide-react";

type ContactRequestRecord = {
  id: string;
  subject: string;
  name: string;
  email: string;
  phone: string | null;
  orderNumber: string | null;
  message: string;
  status: "nouveau" | "traité";
  createdAt: string;
  isGuest: boolean;
  user: { id: string; name: string | null; email: string } | null;
};

export default function AdminContactRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<ContactRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"tous" | "nouveau" | "traité">("tous");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

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

    fetch("/api/admin/contact-requests")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setRequests(data.requests);
      })
      .finally(() => setIsLoading(false));
  }, [session, status, router]);

  const toggleStatus = async (item: ContactRequestRecord) => {
    const nextStatus = item.status === "nouveau" ? "traité" : "nouveau";

    // Mise à jour optimiste de l'affichage
    setRequests((prev) => prev.map((r) => (r.id === item.id ? { ...r, status: nextStatus } : r)));

    const response = await fetch("/api/admin/contact-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status: nextStatus }),
    });

    if (!response.ok) {
      // Revert si l'update échoue côté serveur
      setRequests((prev) => prev.map((r) => (r.id === item.id ? { ...r, status: item.status } : r)));
    }
  };

  const deleteRequest = async (item: ContactRequestRecord) => {
  const confirmed = window.confirm(
    `Supprimer définitivement la demande de ${item.name} ? Cette action est irréversible.`,
  );
  if (!confirmed) return;

  const previous = requests;
  setRequests((prev) => prev.filter((r) => r.id !== item.id));

  const response = await fetch(`/api/admin/contact-requests?id=${item.id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    setRequests(previous);
  }
};

  const sendReply = async (item: ContactRequestRecord) => {
    const text = replyText.trim();
    if (!text || sendingReply) return;

    setSendingReply(true);
    try {
      const response = await fetch("/api/admin/contact-requests/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, message: text }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) throw new Error(result.message);

      setRequests((prev) => prev.map((r) => (r.id === item.id ? { ...r, status: "traité" } : r)));
      setReplyingId(null);
      setReplyText("");
    } catch {
      window.alert("L'envoi de la réponse a échoué. Merci de réessayer.");
    } finally {
      setSendingReply(false);
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

  const filtered = requests.filter((r) => filter === "tous" || r.status === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-[#8b6a4b] hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux produits
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-[#231711]">Demandes reçues</h1>
        <div className="flex gap-2">
          {(["tous", "nouveau", "traité"] as const).map((option) => (
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
          Aucune demande {filter !== "tous" ? `au statut "${filter}"` : ""} pour le moment.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] border border-line bg-white p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#8b6a4b]">{item.subject}</p>
                    {item.isGuest ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f1e4cf] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#6f5230]">
                        <UserX className="h-3 w-3" />
                        Client invité (non connecté)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#dcead9] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#2f6b3e]">
                        <UserCheck className="h-3 w-3" />
                        Client connecté
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 font-display text-2xl text-[#231711]">{item.name}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                    <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 hover:text-gold">
                      <Mail className="h-3.5 w-3.5" />
                      {item.email}
                    </a>
                    {item.phone && (
                      <a href={`tel:${item.phone}`} className="flex items-center gap-1.5 hover:text-gold">
                        <Phone className="h-3.5 w-3.5" />
                        {item.phone}
                      </a>
                    )}
                    {item.orderNumber && (
                      <span className="rounded-full bg-gold-pale px-3 py-1 text-xs font-medium text-[#6f5230]">
                        N° commande : {item.orderNumber}
                      </span>
                    )}
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
  <button
    type="button"
    onClick={() => {
      setReplyingId(replyingId === item.id ? null : item.id);
      setReplyText("");
    }}
    className="inline-flex items-center gap-1.5 rounded-full border border-[#dfcda8] bg-white px-4 py-2 text-xs font-medium uppercase tracking-wide text-espresso transition hover:border-gold"
  >
    <MessageSquareReply className="h-3.5 w-3.5" />
    Répondre
  </button>
  <button
    type="button"
    onClick={() => toggleStatus(item)}
    className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide transition ${
      item.status === "nouveau"
        ? "bg-[#231711] text-white hover:bg-[#3a2a20]"
        : "border border-line bg-[#fffaf3] text-ink-soft hover:border-gold"
    }`}
  >
    {item.status === "nouveau" ? "Marquer comme traité" : "Traité ✓"}
  </button>
  {item.status === "traité" && (
    <button
      type="button"
      onClick={() => deleteRequest(item)}
      title="Supprimer cette demande"
      className="rounded-full border border-transparent p-2 text-ink-soft transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )}
</div>
              </div>
              <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#fffaf3] p-4 text-sm leading-6 text-[#43352f]">
                {item.message}
              </p>

              {replyingId === item.id && (
                <div className="mt-4 rounded-2xl border border-[#e5d1ab] bg-white p-4">
                  <p className="mb-2 text-xs text-ink-soft">
                    {item.isGuest
                      ? "Client non connecté : la réponse sera envoyée uniquement par email."
                      : "Client connecté : la réponse sera envoyée par email et déposée dans sa messagerie."}
                  </p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    placeholder="Votre réponse…"
                    className="w-full resize-none rounded-2xl border border-[#e5d1ab] bg-cream-panel px-4 py-3 text-sm outline-none transition placeholder:text-ink-muted focus:border-gold focus:shadow-[0_0_0_4px_rgba(193,154,91,0.12)]"
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingId(null);
                        setReplyText("");
                      }}
                      className="rounded-full border border-line bg-white px-4 py-2 text-xs font-medium text-ink-soft hover:border-gold"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => sendReply(item)}
                      disabled={sendingReply || !replyText.trim()}
                      className="press inline-flex items-center gap-1.5 rounded-full bg-espresso px-4 py-2 text-xs font-medium text-white hover:bg-espresso-light disabled:opacity-60"
                    >
                      {sendingReply ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Envoyer la réponse
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}