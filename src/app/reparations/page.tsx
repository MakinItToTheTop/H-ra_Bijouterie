import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Réparations & atelier",
  description:
    "Réparation de bijoux et montres à Nantes : mise à taille, remplacement de pierres, polissage, estimation gratuite.",
};

const services = [
  "Réglage et mise à taille de bagues, bracelets et montres",
  "Remplacement de pierres, fermoirs et maillons",
  "Nettoyage et polissage de pièces en or et argent",
  "Changement de pile et étanchéité des montres",
  "Restauration de bijoux anciens et de famille",
  "Estimation gratuite avant toute intervention",
];

export default function ReparationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] border border-[#ecdcc0] bg-cream-deep p-8 md:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(193,154,91,0.2),transparent_55%)]" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b6a4b]">
              Réparations & atelier
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-tight text-[#231711]">
              Expertise pour <span className="text-gilded">préserver vos bijoux</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
              Nous prenons en charge les réparations, remises en état, nettoyages et réglages avec le
              plus grand soin — y compris sur vos pièces les plus précieuses.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <div className="rounded-[28px] border border-line bg-white p-7">
            <h2 className="font-display text-3xl text-[#231711]">Services proposés</h2>
            <div className="rule-gold my-5" />
            <ul className="space-y-3">
              {services.map((service) => (
                <li
                  key={service}
                  className="flex items-start gap-3 rounded-2xl bg-[#fffaf3] px-4 py-3 text-sm leading-6 text-[#43352f] transition-colors hover:bg-gold-pale/50"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="rounded-[28px] border border-line bg-white p-7 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-3xl text-[#231711]">Demande de prise en charge</h2>
            <div className="rule-gold my-5" />
            <ContactForm
              columns={1}
              subject="Demande de réparation"
              submitLabel="Envoyer ma demande"
              fields={[
                { name: "name", label: "Nom et prénom", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "phone", label: "Téléphone", type: "tel" },
                {
                  name: "message",
                  label: "Décrivez l’objet et la réparation souhaitée",
                  type: "textarea",
                  rows: 5,
                  required: true,
                },
              ]}
            />
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-12 text-center">
        <Link
          href="/contact"
          className="press group inline-flex items-center gap-2 rounded-full border border-[#d9b677] bg-[#fff5e4] px-6 py-3.5 text-sm font-medium text-espresso hover:border-gold hover:bg-gold-pale"
        >
          Contacter l’atelier
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </div>
  );
}
