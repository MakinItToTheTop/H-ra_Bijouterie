"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Pencil, Star, Trash2 } from "lucide-react";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/format";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  isMine: boolean;
};

export function ProductReviews({ productId }: { productId: string }) {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      const data = await response.json();
      if (data.ok) setReviews(data.reviews);
    } catch {
      // silencieux : la section reste vide en cas d'erreur réseau
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const myReview = reviews.find((review) => review.isMine);
  const otherReviews = reviews.filter((review) => !review.isMine);

  const openForm = (existing?: ReviewRow) => {
    setRating(existing?.rating ?? 5);
    setComment(existing?.comment ?? "");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setRating(5);
    setComment("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (comment.trim().length < 3) {
      toast({ title: "Avis trop court", description: "Ajoutez quelques mots de plus.", tone: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const isEditing = Boolean(myReview);
      const url = isEditing
        ? `/api/products/${productId}/reviews/${myReview!.id}`
        : `/api/products/${productId}/reviews`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });
      const data = await response.json();

      if (!data.ok) {
        toast({ title: "Impossible d'envoyer votre avis", description: data.message, tone: "error" });
        return;
      }

      toast({ title: isEditing ? "Avis modifié" : "Merci pour votre avis !", tone: "success" });
      closeForm();
      await loadReviews();
    } catch {
      toast({ title: "Une erreur est survenue", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/products/${productId}/reviews/${myReview.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!data.ok) {
        toast({ title: "Impossible de supprimer l'avis", description: data.message, tone: "error" });
        return;
      }

      toast({ title: "Avis supprimé", tone: "success" });
      closeForm();
      await loadReviews();
    } catch {
      toast({ title: "Une erreur est survenue", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mon avis */}
      {status === "authenticated" ? (
        isFormOpen ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-2xl border border-[#e2ceb1] bg-white p-4"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                    className="text-gold"
                  >
                    <Star className={`h-5 w-5 ${value <= rating ? "fill-current" : "opacity-30"}`} />
                  </button>
                );
              })}
            </div>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Partagez votre expérience avec ce bijou…"
              rows={3}
              className="w-full rounded-xl border border-line bg-[#fffaf3] px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-espresso px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {myReview ? "Enregistrer" : "Publier mon avis"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="rounded-full border border-line px-4 py-2 text-xs text-ink-soft hover:border-gold"
              >
                Annuler
              </button>
              {myReview && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#e3bcb4] px-4 py-2 text-xs text-[#b4544a] hover:bg-[#fff5f4]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              )}
            </div>
          </form>
        ) : myReview ? (
          <div className="rounded-2xl border border-[#e2ceb1] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className={`h-4 w-4 ${index < myReview.rating ? "fill-current" : "opacity-30"}`} />
                  ))}
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-[#8c6b4b]">Votre avis</p>
                <p className="mt-1 leading-7 text-ink-soft">"{myReview.comment}"</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => openForm(myReview)}
                  aria-label="Modifier mon avis"
                  className="rounded-full p-2 text-ink-soft hover:bg-[#f4e7c9] hover:text-[#231711]"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  aria-label="Supprimer mon avis"
                  className="rounded-full p-2 text-[#b4544a] hover:bg-[#fff5f4]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openForm()}
            className="rounded-full bg-espresso px-4 py-2 text-xs font-medium text-white hover:opacity-90"
          >
            Laisser un avis
          </button>
        )
      ) : status === "unauthenticated" ? (
        <p className="text-sm text-ink-muted">
          <Link href="/compte" className="link-underline text-espresso">
            Connectez-vous
          </Link>{" "}
          pour laisser votre propre avis sur ce bijou.
        </p>
      ) : null}

      {/* Avis des autres clients */}
      {isLoading ? (
        <p className="text-sm text-ink-muted">Chargement des avis…</p>
      ) : otherReviews.length === 0 && !myReview ? (
        <p className="text-sm text-ink-muted">Soyez le premier à laisser un avis sur ce bijou.</p>
      ) : (
        <div className="space-y-6">
          {otherReviews.map((review) => (
            <figure key={review.id}>
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current" : "opacity-30"}`} />
                ))}
              </div>
              <blockquote className="mt-3 leading-7 text-ink-soft">"{review.comment}"</blockquote>
              <figcaption className="mt-2 text-xs text-ink-muted">
                {review.authorName} · {formatDate(review.createdAt)}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}