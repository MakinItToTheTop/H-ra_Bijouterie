"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function ComptePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    await signOut({ callbackUrl: "/" });
    router.refresh();
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
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-[#2a1f1b] px-5 py-3 text-sm font-medium text-white"
            >
              Se déconnecter
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[30px] border border-[#ebddbe] bg-white p-6">
            <h2 className="font-display text-3xl text-[#231711]">Historique des commandes</h2>
            <div className="mt-5 space-y-3 text-[#4d3c35]">
              <div className="flex items-center justify-between rounded-[18px] bg-[#fffaf3] p-4"><span>Commande #HERA-2026-1042</span><span className="text-[#7a5d41]">Payée</span></div>
              <div className="flex items-center justify-between rounded-[18px] bg-[#fffaf3] p-4"><span>Commande #HERA-2026-9801</span><span className="text-[#7a5d41]">Expédiée</span></div>
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
            <h2 className="font-display text-3xl text-[#231711]">Historique des commandes</h2>
            <div className="mt-5 space-y-3 text-[#4d3c35]">
              <div className="flex items-center justify-between rounded-[18px] bg-[#fffaf3] p-4"><span>Commande #HERA-2026-1042</span><span className="text-[#7a5d41]">Payée</span></div>
              <div className="flex items-center justify-between rounded-[18px] bg-[#fffaf3] p-4"><span>Commande #HERA-2026-9801</span><span className="text-[#7a5d41]">Expédiée</span></div>
            </div>
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
