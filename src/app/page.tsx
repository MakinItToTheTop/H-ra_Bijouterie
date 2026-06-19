import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Gem,
  Hammer,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Watch,
} from "lucide-react";
import { categories, testimonials, toProduct } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { prisma } from "@/lib/prisma";

const marqueeClaims = [
  "Créations sur mesure",
  "Atelier à Nantes",
  "Garantie 2 ans",
  "Or 18 carats",
  "Réparation express",
  "Retrait en boutique",
];

const services = [
  {
    icon: Gem,
    title: "Atelier de création",
    text: "Créations sur mesure, alliances et pièces uniques réalisées avec soin dans notre atelier nantais.",
  },
  {
    icon: Watch,
    title: "Horlogerie",
    text: "Conseil expert, réparation, entretien et sélection de montres élégantes pour chaque occasion.",
  },
  {
    icon: ShieldCheck,
    title: "Confiance familiale",
    text: "Des conseils transparents, un service rassurant et un savoir-faire apprécié par nos clients.",
  },
];

export default async function Home() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];

  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch {
    products = [];
  }

  return (
    <div className="overflow-hidden">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate bg-cream-deep">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(193,154,91,0.22),transparent_55%)]" />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-[#d9c08f]/30 blur-[90px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-6">
          <div className="flex flex-col justify-center">
            <div
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#d9c39f] bg-white/70 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-[#7a5c3d] backdrop-blur"
              style={{ animation: "var(--animate-fade-up)" }}
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Bijouterie & horlogerie à Nantes
            </div>

            <h1
              className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.03] tracking-[-0.02em] text-[#231711]"
              style={{ animation: "var(--animate-fade-up)", animationDelay: "80ms" }}
            >
              L’éclat de l’or,
              <span className="mt-1 block text-gilded">l’élégance intemporelle</span>
            </h1>

            <p
              className="mt-7 max-w-xl text-lg leading-8 text-ink-soft"
              style={{ animation: "var(--animate-fade-up)", animationDelay: "160ms" }}
            >
              Créations sur mesure, réparations d’atelier et pièces signées pour célébrer les
              instants qui comptent.
            </p>

            <div
              className="mt-9 flex flex-col gap-3 sm:flex-row"
              style={{ animation: "var(--animate-fade-up)", animationDelay: "240ms" }}
            >
              <Link
                href="/boutique"
                className="press sheen group inline-flex items-center justify-center gap-2 rounded-full bg-espresso px-7 py-3.5 text-sm font-medium text-white shadow-[var(--shadow-soft)] hover:bg-espresso-light"
              >
                Découvrir la boutique
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/alliances"
                className="press inline-flex items-center justify-center rounded-full border border-[#cfb07c] bg-white/70 px-7 py-3.5 text-sm font-medium text-espresso backdrop-blur hover:border-gold hover:bg-white"
              >
                Demander un devis
              </Link>
            </div>

            <div
              className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-soft"
              style={{ animation: "var(--animate-fade-up)", animationDelay: "320ms" }}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" /> Garantie et expertise
              </span>
              <span className="flex items-center gap-2">
                <Gem className="h-4 w-4 text-gold" /> Création sur mesure
              </span>
              <span className="flex items-center gap-2">
                <Hammer className="h-4 w-4 text-gold" /> Atelier intégré
              </span>
            </div>
          </div>

          <div
            className="relative"
            style={{ animation: "var(--animate-scale-in)", animationDelay: "200ms" }}
          >
            <div className="pointer-events-none absolute -left-6 top-8 h-32 w-32 animate-[float_7s_ease-in-out_infinite] rounded-full bg-[#d9c08f]/50 blur-2xl" />
            <div className="pointer-events-none absolute -right-3 bottom-6 h-36 w-36 animate-[float_9s_ease-in-out_infinite_reverse] rounded-full bg-[#c6a46a]/30 blur-2xl" />

            <div className="relative overflow-hidden rounded-[36px] shadow-[var(--shadow-hero)] ring-1 ring-[#e0cba4]">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80"
                alt="Bijoux haut de gamme Héra"
                fetchPriority="high"
                className="h-[420px] w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 md:h-[560px]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1f1512]/25 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-5 left-5 rounded-2xl border border-[#e6d5ae] bg-white/90 px-5 py-4 shadow-[var(--shadow-lift)] backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#7b5e43]">
                Cadeaux de luxe
              </p>
              <p className="mt-1.5 font-display text-2xl text-ink">Depuis 89 €</p>
            </div>

            <div className="absolute -top-4 right-4 hidden items-center gap-2 rounded-full border border-[#e6d5ae] bg-white/90 px-4 py-2 shadow-lg backdrop-blur sm:flex">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="text-sm font-medium text-ink">4,9/5</span>
              <span className="text-xs text-ink-muted">· 1 200 avis</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Marquee */}
      <div className="marquee overflow-hidden border-y border-[#e8dabb] bg-espresso py-3.5">
        <div className="marquee-track flex w-max items-center gap-10 text-[11px] uppercase tracking-[0.3em] text-[#e0c9a0]">
          {[...marqueeClaims, ...marqueeClaims].map((claim, index) => (
            <span key={`${claim}-${index}`} className="flex items-center gap-10 whitespace-nowrap">
              {claim}
              <Sparkles className="h-3 w-3 text-gold" />
            </span>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------- Collections */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#8a6b49]">Collections</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight text-[#231711]">
              Des pièces qui racontent votre histoire
            </h2>
          </div>
          <Link
            href="/boutique"
            className="link-underline group hidden w-fit items-center gap-2 text-sm font-medium text-[#7d5938] md:inline-flex"
          >
            Voir toute la collection
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => (
            <Reveal key={category.name} delay={index * 70}>
              <Link
                href="/boutique"
                className="card-lift group relative block h-56 overflow-hidden rounded-[26px] border border-line"
              >
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f1512]/85 via-[#1f1512]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-[#e3c894]">
                    {category.name}
                  </p>
                  <p className="mt-1.5 text-lg font-medium text-white">{category.description}</p>
                  <span className="mt-3 inline-flex translate-y-1 items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/0 transition-all duration-500 group-hover:translate-y-0 group-hover:text-white/90">
                    Explorer <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- Best sellers */}
      <section className="relative isolate bg-[#1f1714] py-20 text-[#f4efe9]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(193,154,91,0.16),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#d1b177]">Best-sellers</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight">
                Sélection de la maison
              </h2>
            </div>
            <Link
              href="/boutique"
              className="link-underline group inline-flex w-fit items-center gap-2 text-sm font-medium text-[#f0d197]"
            >
              Tout voir
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {products.length === 0 ? (
            <Reveal className="rounded-[28px] border border-dashed border-[#7a6141] bg-white/5 p-12 text-center">
              <p className="text-[#e4d5bf]">
                La sélection arrive bientôt — ajoutez vos premières pièces depuis l’espace admin.
              </p>
              <Link
                href="/admin"
                className="press mt-6 inline-flex rounded-full bg-[#f0d197] px-5 py-3 text-sm font-medium text-[#2a1f1b]"
              >
                Ouvrir l’admin
              </Link>
            </Reveal>
          ) : (
            <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product, index) => (
                <Reveal key={product.id} delay={index * 90}>
                  <ProductCard product={toProduct(product)} priority={index === 0} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ Services */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={index * 90}>
              <div className="card-lift group h-full rounded-[28px] border border-line bg-cream-panel p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-pale text-[#7a5531] transition-transform duration-500 group-hover:scale-110">
                  <service.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-[1.75rem] leading-tight text-[#251912]">
                  {service.title}
                </h3>
                <p className="mt-4 leading-7 text-ink-soft">{service.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- Reviews */}
      <section className="bg-[#f8f2ea] py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8c6b4b]">Avis clients</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight text-[#231711]">
                Ils nous font confiance
              </h2>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-[#d9c39f] bg-white px-4 py-2.5 text-sm text-[#4a382f]">
              <Star className="h-4 w-4 fill-gold text-gold" />
              4,9/5 sur 1 200 avis
            </div>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <Reveal key={item.name} delay={index * 90}>
                <figure className="card-lift flex h-full flex-col rounded-[28px] border border-[#ebddd1] bg-white p-7">
                  <div className="mb-5 flex items-center gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="flex-1 text-base leading-7 text-[#504339]">
                    “{item.review}”
                  </blockquote>
                  <figcaption className="mt-6 border-t border-[#f0e6d8] pt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#8a6c4e]">
                    {item.name}
                    <span className="ml-2 font-normal normal-case tracking-normal text-ink-muted">
                      {item.city}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Store visit */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <Reveal>
          <div className="grid gap-8 rounded-[32px] border border-[#ecdcc0] bg-[#f4eadb] p-6 md:grid-cols-2 md:p-10">
            <div className="flex flex-col justify-center">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8a6b49]">Visite</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight text-[#231711]">
                Notre boutique à Nantes
              </h2>
              <div className="mt-7 space-y-4 text-[#4f3b33]">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  3 Place de la Petite Hollande, 44000 Nantes
                </p>
                <p className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  Lun–Sam 10h–19h · Dim 12h30–19h
                </p>
                <p className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <a href="tel:+33251835919" className="link-underline">
                    02 51 83 59 19
                  </a>
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="press sheen group inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3.5 text-sm font-medium text-white hover:bg-espresso-light"
                >
                  Nous contacter
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a
                  href="https://www.google.com/maps?q=3+Place+de+la+Petite+Hollande+44000+Nantes"
                  target="_blank"
                  rel="noreferrer"
                  className="press inline-flex items-center gap-2 rounded-full border border-[#d3b483] bg-white/70 px-6 py-3.5 text-sm font-medium text-espresso hover:border-gold hover:bg-white"
                >
                  <Truck className="h-4 w-4" />
                  Itinéraire
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-[#ddc799] shadow-[var(--shadow-soft)]">
              <iframe
                title="Carte Héra Bijouterie"
                src="https://www.google.com/maps?q=3%20Place%20de%20la%20Petite%20Hollande%2044000%20Nantes&output=embed"
                className="h-[320px] w-full border-0 md:h-full md:min-h-[360px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------- Contact */}
      <section className="mx-auto max-w-5xl px-4 pb-24 lg:px-6">
        <Reveal>
          <div className="rounded-[32px] border border-line bg-white p-6 shadow-[var(--shadow-soft)] md:p-10">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#8a6b49]">Contact rapide</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight text-[#231711]">
              Une question ?
            </h2>
            <p className="mt-3 max-w-lg text-ink-soft">
              Écrivez-nous, nous répondons généralement sous 24 heures ouvrées.
            </p>
            <ContactForm className="mt-8" subject="Contact rapide — accueil" />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
