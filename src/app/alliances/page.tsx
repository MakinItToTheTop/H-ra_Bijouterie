import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gem, HeartHandshake, PenTool, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Alliances & sur-mesure",
  description:
    "Alliances et créations sur mesure à Nantes : consultation, choix des métaux, maquette et fabrication en atelier.",
};

const steps = [
  {
    icon: HeartHandshake,
    title: "Consultation",
    text: "Un échange personnalisé autour de vos envies, de votre style et de votre budget.",
  },
  {
    icon: Gem,
    title: "Choix des matières",
    text: "Métal, pierres, style et finitions : chaque détail est décidé avec vous.",
  },
  {
    icon: PenTool,
    title: "Maquette",
    text: "Un modèle de conception vous est présenté et validé avant toute fabrication.",
  },
  {
    icon: Sparkles,
    title: "Création & remise",
    text: "Fabrication en atelier, puis livraison ou remise en boutique de votre pièce unique.",
  },
];

export default function AlliancesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] border border-[#ecdcc0] bg-cream-deep p-8 md:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(193,154,91,0.22),transparent_55%)]" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b6a4b]">
              Alliances & sur-mesure
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-tight text-[#231711]">
              Une pièce pensée pour <span className="text-gilded">votre histoire</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
              Chez Héra Bijouterie, chaque alliance ou création sur mesure est conçue avec soin, afin
              de refléter votre style, votre histoire et vos aspirations.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Reveal key={step.title} delay={index * 80}>
            <div className="card-lift group h-full rounded-[26px] border border-line bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-pale text-[#7a5531] transition-transform duration-500 group-hover:scale-110">
                  <step.icon className="h-4 w-4" />
                </span>
                <span className="font-display text-2xl text-[#c19a5b]">0{index + 1}</span>
              </div>
              <h2 className="mt-5 font-display text-xl text-[#231711]">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{step.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <div className="overflow-hidden rounded-[28px] border border-line">
            <img
              src="https://images.unsplash.com/photo-1591209627470-9b0c7d1e2f5a?auto=format&fit=crop&w=1000&q=80"
              alt="Alliances en or"
              loading="lazy"
              className="h-full min-h-[380px] w-full object-cover transition-transform duration-[1200ms] hover:scale-105"
            />
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="rounded-[28px] border border-line bg-white p-7 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-3xl text-[#231711]">Demande de devis</h2>
            <div className="rule-gold my-5" />
            <p className="mb-6 text-sm leading-6 text-ink-soft">
              Décrivez votre projet : nous revenons vers vous sous 48 h avec une première
              proposition.
            </p>
            <ContactForm
              columns={1}
              subject="Demande de devis — alliances & sur-mesure"
              submitLabel="Envoyer la demande"
              fields={[
                { name: "name", label: "Nom et prénom", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "phone", label: "Téléphone", type: "tel" },
                {
                  name: "message",
                  label: "Décrivez votre projet, vos inspirations et votre budget",
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
          Parler à notre atelier
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </div>
  );
}
