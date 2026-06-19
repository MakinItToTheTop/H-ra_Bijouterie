import type { Metadata } from "next";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Héra Bijouterie à Nantes : adresse, horaires, téléphone et formulaire de contact.",
};

const details = [
  { icon: MapPin, label: "Adresse", value: "3 Place de la Petite Hollande, 44000 Nantes" },
  { icon: Phone, label: "Téléphone", value: "02 51 83 59 19 · 06 95 51 74 32", href: "tel:+33251835919" },
  { icon: Mail, label: "Email", value: "contact@herajoaillerie.fr", href: "mailto:contact@herajoaillerie.fr" },
  { icon: Clock3, label: "Horaires", value: "Lun–Sam 10h–19h · Dim 12h30–19h" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
      <Reveal className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b6a4b]">Contact</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-tight text-[#231711]">
          Nous sommes à votre écoute
        </h1>
        <p className="mt-4 max-w-xl leading-7 text-ink-soft">
          Une question sur une pièce, un devis sur mesure ou une réparation ? Écrivez-nous ou passez
          nous voir en boutique.
        </p>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <Reveal>
          <div className="rounded-[30px] border border-line bg-white p-7">
            <ul className="space-y-6">
              {details.map((item) => (
                <li key={item.label} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-pale text-[#7a5531]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-ink-muted">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a href={item.href} className="link-underline mt-1 inline-block text-ink">
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-ink">{item.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="rounded-[30px] border border-line bg-white p-7 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-3xl text-[#231711]">Écrivez-nous</h2>
            <div className="rule-gold my-5" />
            <ContactForm
              subject="Formulaire de contact"
              submitLabel="Envoyer le message"
              fields={[
                { name: "name", label: "Nom", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "subject", label: "Objet", full: true },
                { name: "message", label: "Votre message", type: "textarea", rows: 6, required: true, full: true },
              ]}
            />
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-10">
        <div className="overflow-hidden rounded-[30px] border border-line bg-white shadow-[var(--shadow-soft)]">
          <iframe
            title="Carte boutique Héra"
            src="https://www.google.com/maps?q=3%20Place%20de%20la%20Petite%20Hollande%2044000%20Nantes&output=embed"
            className="h-[380px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Reveal>
    </div>
  );
}
