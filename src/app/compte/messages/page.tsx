"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useToast } from "@/components/Toast";

type MessageRecord = {
  id: string;
  senderRole: "client" | "admin";
  body: string;
  createdAt: string;
};

type ThreadRecord = {
  id: string;
  subject: string;
  status: "nouveau" | "traité";
  createdAt: string;
  messages: MessageRecord[];
};

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [threads, setThreads] = useState<ThreadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/compte");
      return;
    }

    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setThreads(data.threads);
          if (data.threads.length > 0) setActiveId(data.threads[0].id);
        }
      })
      .finally(() => setIsLoading(false));
  }, [session, status, router]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId],
  );

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || !activeThread || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactRequestId: activeThread.id, message: text }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) throw new Error(result.message);

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id
            ? { ...t, status: "nouveau", messages: [...t.messages, result.message] }
            : t,
        ),
      );
      setReply("");
    } catch {
      toast({ title: "L'envoi a échoué", description: "Merci de réessayer.", tone: "error" });
    } finally {
      setSending(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
        <p className="text-sm text-ink-soft">Chargement…</p>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
      <Link href="/compte" className="inline-flex items-center gap-2 text-sm text-[#8b6a4b] hover:text-gold">
        <ArrowLeft className="h-4 w-4" />
        Retour à mon compte
      </Link>

      <h1 className="mt-4 font-display text-4xl text-[#231711]">Messagerie</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Retrouvez ici vos échanges avec l&apos;équipe Héra Bijouterie au sujet de vos demandes.
      </p>

      {threads.length === 0 ? (
        <div className="mt-10 rounded-[28px] border border-dashed border-[#e5d1ab] bg-[#fffaf3] p-12 text-center text-ink-soft">
          Vous n&apos;avez aucune conversation pour le moment.{" "}
          <Link href="/contact" className="text-gold hover:underline">
            Contactez-nous
          </Link>{" "}
          pour démarrer un échange.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Liste des fils */}
          <div className="space-y-2">
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  activeId === t.id
                    ? "border-gold bg-gold-pale"
                    : "border-line bg-white hover:border-gold"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b6a4b]">{t.subject}</p>
                <p className="mt-1 line-clamp-1 text-sm text-ink-soft">
                  {t.messages[t.messages.length - 1]?.body ?? ""}
                </p>
                <p className="mt-2 text-[11px] text-ink-muted">
                  {new Date(t.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </button>
            ))}
          </div>

          {/* Conversation active */}
          {activeThread && (
            <div className="flex min-h-[420px] flex-col rounded-[24px] border border-line bg-white p-6 shadow-[var(--shadow-soft)]">
              <div className="border-b border-line pb-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#8b6a4b]">{activeThread.subject}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  Statut : <span className="font-medium text-espresso">{activeThread.status}</span>
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto py-4">
                {activeThread.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      m.senderRole === "admin"
                        ? "bg-[#fffaf3] text-[#43352f]"
                        : "ml-auto bg-espresso text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className={`mt-1 text-[10px] ${m.senderRole === "admin" ? "text-ink-muted" : "text-white/60"}`}>
                      {m.senderRole === "admin" ? "Héra Bijouterie" : "Vous"} ·{" "}
                      {new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-end gap-2 border-t border-line pt-4">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Écrire un message…"
                  rows={2}
                  className="flex-1 resize-none rounded-2xl border border-[#e5d1ab] bg-cream-panel px-4 py-3 text-sm outline-none transition placeholder:text-ink-muted focus:border-gold focus:shadow-[0_0_0_4px_rgba(193,154,91,0.12)]"
                />
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  className="press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-espresso text-white hover:bg-espresso-light disabled:opacity-50"
                  aria-label="Envoyer"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}