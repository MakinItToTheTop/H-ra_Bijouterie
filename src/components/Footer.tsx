import Link from "next/link";
import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from "lucide-react";

/** lucide-react no longer ships brand marks, so socials are inline SVGs. */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const navigation = [
  { href: "/boutique", label: "Boutique" },
  { href: "/alliances", label: "Alliances & sur-mesure" },
  { href: "/reparations", label: "Réparations" },
  { href: "/contact", label: "Contact" },
  { href: "/a-propos", label: "À propos" },
];

const legal = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Politique de confidentialité" },
  { href: "/retours", label: "Politique de retour" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-[#1f1714] text-[#f7f1ea]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c19a5b]/60 to-transparent" />
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#c19a5b]/10 blur-[80px]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1.3fr_1fr_1.2fr_1fr] lg:px-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#8a7048] font-display text-lg text-[#f3d9a5]">
              H
            </span>
            <span className="font-display text-2xl tracking-[0.22em]">HÉRA</span>
          </div>
          <p className="mt-5 max-w-xs leading-7 text-[#d8c4a1]">
            L’éclat de l’or, l’élégance intemporelle. Joaillerie, horlogerie et atelier de création
            au cœur de Nantes.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="https://instagram.com/herabijouterie44"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="press rounded-full border border-[#8a7048] p-2.5 text-[#f6e5c6] transition hover:border-[#f0d197] hover:bg-white/5 hover:text-[#f0d197]"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="press rounded-full border border-[#8a7048] p-2.5 text-[#f6e5c6] transition hover:border-[#f0d197] hover:bg-white/5 hover:text-[#f0d197]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M13.5 21v-8h3l.5-3h-3.5V7.5c0-.9.3-1.5 1.5-1.5H17V3.5c-.5-.1-1.7-.2-2.8-.2-2.8 0-4.7 1.7-4.7 4.7V10H7v3h2.5v8h4Z" />
              </svg>
            </a>
          </div>
        </div>

        <nav aria-label="Navigation du pied de page">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#f4e8c7]">
            Navigation
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-[#eadcc0]">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline inline-block hover:text-[#f0d197]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#f4e8c7]">
            Coordonnées
          </h3>
          <ul className="mt-5 space-y-3.5 text-sm text-[#eadcc0]">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c19a5b]" />
              <a
                href="https://www.google.com/maps?q=3+Place+de+la+Petite+Hollande+44000+Nantes"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#f0d197]"
              >
                3 Place de la Petite Hollande, 44000 Nantes
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#c19a5b]" />
              <span>
                <a href="tel:+33251835919" className="hover:text-[#f0d197]">
                  02 51 83 59 19
                </a>
                {" / "}
                <a href="tel:+33695517432" className="hover:text-[#f0d197]">
                  06 95 51 74 32
                </a>
              </span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#c19a5b]" />
              <a href="mailto:contact@herajoaillerie.fr" className="hover:text-[#f0d197]">
                contact@herajoaillerie.fr
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#c19a5b]" />
              Lun–Sam 10h–19h · Dim 12h30–19h
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#f4e8c7]">
            Légal
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-[#eadcc0]">
            {legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline inline-block hover:text-[#f0d197]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/contact"
            className="press group mt-7 inline-flex items-center gap-2 rounded-full border border-[#8a7048] px-4 py-2.5 text-xs uppercase tracking-[0.18em] text-[#f0d197] hover:border-[#f0d197] hover:bg-white/5"
          >
            Prendre rendez-vous
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      <div className="relative border-t border-[#3d2d23] py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-[#c8b190] sm:flex-row lg:px-6">
          <p>© {new Date().getFullYear()} Héra Bijouterie — Tous droits réservés.</p>
          <p>Joaillerie · Horlogerie · Atelier · Nantes</p>
        </div>
      </div>
    </footer>
  );
}
