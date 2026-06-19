import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Héra Bijouterie, maison de joaillerie et d’horlogerie à Nantes : notre histoire, nos valeurs et notre savoir-faire.",
};

const values = [
  { title: "Authenticité", text: "Des conseils honnêtes et une transparence totale sur les matières et les prix." },
  { title: "Exigence", text: "Une sélection rigoureuse des métaux et des pierres, sans compromis sur la qualité." },
  { title: "Accompagnement", text: "Un service humain, patient et discret, du premier échange au service après-vente." },
  { title: "Durabilité", text: "Des pièces pensées pour durer et un atelier capable de les entretenir dans le temps." },
];

const stats = [
  { value: "15+", label: "Années d’expérience" },
  { value: "1 200", label: "Avis clients" },
  { value: "4,9/5", label: "Note moyenne" },
  { value: "48 h", label: "Réponse aux devis" },
];

export default function AproposPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] border border-[#ecdcc0] bg-[#f8f1e6] p-8 md:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(193,154,91,0.2),transparent_55%)]" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b6a4b]">À propos</p>
            <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-tight text-[#231711]">
              Une maison de joaillerie au service de <span className="text-gilded">vos souvenirs</span>
            </h1>
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <Reveal>
          <div className="rounded-[28px] border border-line bg-white p-7 md:p-8">
            <h2 className="font-display text-3xl text-[#231711]">Notre histoire</h2>
            <div className="rule-gold my-5" />
            <p className="leading-8 text-ink-soft">
              Héra Bijouterie a été fondée avec l’envie de proposer un accompagnement chaleureux,
              discret et de qualité. Nous associons tradition familiale, goût du détail et exigence
              artisanale pour chaque pièce que nous créons ou restaurons.
            </p>
            <p className="mt-4 leading-8 text-ink-soft">
              Notre atelier nantais réunit joaillerie, horlogerie et sur-mesure sous un même toit :
              une bague de fiançailles imaginée avec vous, une montre remise en marche, un bijou de
              famille qui retrouve son éclat.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="overflow-hidden rounded-[28px] border border-line">
            <img
              src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1000&q=80"
              alt="Atelier de joaillerie"
              loading="lazy"
              className="h-full min-h-[320px] w-full object-cover transition-transform duration-[1200ms] hover:scale-105"
            />
          </div>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 70}>
            <div className="rounded-[24px] border border-line bg-cream-panel p-6 text-center">
              <p className="font-display text-4xl text-gilded">{stat.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink-muted">{stat.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {values.map((value, index) => (
          <Reveal key={value.title} delay={index * 70}>
            <div className="card-lift h-full rounded-[26px] border border-line bg-white p-7">
              <h3 className="font-display text-2xl text-[#231711]">{value.title}</h3>
              <p className="mt-3 leading-7 text-ink-soft">{value.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12 text-center">
        <Link
          href="/contact"
          className="press sheen group inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3.5 text-sm font-medium text-white hover:bg-espresso-light"
        >
          Venir nous rencontrer
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </div>
  );
}
