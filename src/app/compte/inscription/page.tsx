"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Impossible de créer le compte.");
        setIsSubmitting(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      setIsSubmitting(false);

      if (signInResult?.error) {
        setError("Compte créé, mais la connexion automatique a échoué.");
        router.push("/compte");
        return;
      }

      router.push("/compte");
      router.refresh();
    } catch {
      setError("Une erreur est survenue lors de l’inscription.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 lg:px-6">
      <div className="rounded-[30px] border border-[#ebddbe] bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.28em] text-[#8b6a4b]">Compte client</p>
        <h1 className="mt-3 font-display text-5xl text-[#231711]">Créer un compte</h1>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="Nom complet"
            required
            className="w-full rounded-full border border-[#e5d1ab] bg-[#fffdfb] px-4 py-3 outline-none transition focus:border-[#b88a44]"
          />
          <input
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="Email"
            type="email"
            required
            className="w-full rounded-full border border-[#e5d1ab] bg-[#fffdfb] px-4 py-3 outline-none transition focus:border-[#b88a44]"
          />
          <input
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            placeholder="Mot de passe"
            type="password"
            minLength={6}
            required
            className="w-full rounded-full border border-[#e5d1ab] bg-[#fffdfb] px-4 py-3 outline-none transition focus:border-[#b88a44]"
          />
          {error ? <p className="text-sm text-[#c75a5a]">{error}</p> : null}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#2a1f1b] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? "Création..." : "S’inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
}
