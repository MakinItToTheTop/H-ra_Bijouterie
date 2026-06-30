"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea";
  required?: boolean;
  rows?: number;
  full?: boolean;
  defaultValue?: string;
};

const defaultFields: Field[] = [
  { name: "name", label: "Votre nom", required: true },
  { name: "email", label: "Votre email", type: "email", required: true },
  { name: "message", label: "Votre message", type: "textarea", rows: 5, required: true, full: true },
];

export function ContactForm({
  fields = defaultFields,
  submitLabel = "Envoyer ma demande",
  subject,
  columns = 2,
  className = "",
}: {
  fields?: Field[];
  submitLabel?: string;
  subject?: string;
  columns?: 1 | 2;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, subject: subject ?? payload.subject }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) throw new Error(result.message);

      setMessage(result.message ?? "Votre demande a bien été envoyée.");
      setStatus("sent");
    } catch {
      setMessage("L’envoi a échoué. Merci de nous appeler au 02 51 83 59 19.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-[26px] border border-[#d9c8a4] bg-[#fffdf7] px-6 py-12 text-center ${className}`}
        style={{ animation: "var(--animate-scale-in)" }}
      >
        <CheckCircle2 className="h-12 w-12 text-gold" />
        <p className="mt-5 font-display text-2xl text-ink">Message envoyé</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-ink-soft">{message}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="press mt-6 rounded-full border border-[#dfc79a] bg-white px-5 py-2.5 text-sm font-medium text-espresso hover:border-gold"
        >
          Écrire un autre message
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-full border border-[#e5d1ab] bg-cream-panel px-5 py-3.5 text-sm outline-none transition placeholder:text-ink-muted hover:border-[#d8bd8c] focus:border-gold focus:shadow-[0_0_0_4px_rgba(193,154,91,0.12)]";

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid gap-4 ${columns === 2 ? "md:grid-cols-2" : ""} ${className}`}
    >
      {fields.map((field) => {
        const span = field.full || columns === 1 ? "md:col-span-2" : "";

        return field.type === "textarea" ? (
          <textarea
            key={field.name}
            name={field.name}
            aria-label={field.label}
            placeholder={field.label}
            rows={field.rows ?? 5}
            required={field.required}
            defaultValue={field.defaultValue}
            className={`${span} rounded-[24px] border border-[#e5d1ab] bg-cream-panel px-5 py-3.5 text-sm outline-none transition placeholder:text-ink-muted hover:border-[#d8bd8c] focus:border-gold focus:shadow-[0_0_0_4px_rgba(193,154,91,0.12)]`}
          />
        ) : (
          <input
            key={field.name}
            name={field.name}
            type={field.type ?? "text"}
            aria-label={field.label}
            placeholder={field.label}
            required={field.required}
            defaultValue={field.defaultValue}
            className={`${span} ${inputClass}`}
          />
        );
      })}

      {status === "error" && (
        <p className="md:col-span-2 text-sm text-[#b4544a]">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="press sheen md:col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-6 py-3.5 text-sm font-medium text-white hover:bg-espresso-light disabled:opacity-70"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            {submitLabel}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}
