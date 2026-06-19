import Link from "next/link";
import { ArrowLeft, Gem } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center lg:px-6">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-pale text-[#7a5531]"
        style={{ animation: "var(--animate-scale-in)" }}
      >
        <Gem className="h-6 w-6" />
      </span>
      <p className="mt-8 font-display text-6xl text-gilded">404</p>
      <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-[#231711]">
        Cette pièce est introuvable
      </h1>
      <p className="mt-4 max-w-md leading-7 text-ink-soft">
        La page que vous cherchez a peut-être été déplacée, ou le bijou n’est plus au catalogue.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/boutique"
          className="press sheen inline-flex items-center justify-center gap-2 rounded-full bg-espresso px-6 py-3.5 text-sm font-medium text-white hover:bg-espresso-light"
        >
          Voir la collection
        </Link>
        <Link
          href="/"
          className="press inline-flex items-center justify-center gap-2 rounded-full border border-[#e0cba4] bg-white px-6 py-3.5 text-sm font-medium text-espresso hover:border-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
