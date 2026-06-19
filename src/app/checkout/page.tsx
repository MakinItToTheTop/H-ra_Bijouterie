"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, CreditCard, Loader2, Lock, Store, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  VAT_RATE,
  formatPrice,
} from "@/lib/format";

type ShippingMode = "retrait" | "livraison";

export default function CheckoutPage() {
  const { items, subtotal, clearCart, hydrated } = useCart();
  const [shippingMode, setShippingMode] = useState<ShippingMode>("livraison");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  const shipping =
    shippingMode === "retrait" || subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
      ? 0
      : SHIPPING_FEE;
  const total = subtotal + shipping;
  const vatIncluded = total - total / (1 + VAT_RATE);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) return;

    setStatus("sending");
    setError("");

    const formData = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<
      string,
      string
    >;

    const payload = {
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country,
      },
      items: items.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        quantity,
        price: product.price,
      })),
      shippingMode,
      total,
    };

    try {
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const order = await orderResponse.json();

      if (!orderResponse.ok || !order.ok) {
        throw new Error(order.message ?? "Commande refusée");
      }

      // Hand off to Stripe when a key is configured; otherwise confirm locally.
      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, orderId: order.orderId }),
      });
      const checkout = await checkoutResponse.json();

      if (checkout?.url) {
        window.location.href = checkout.url;
        return;
      }

      setOrderId(order.orderId);
      setStatus("done");
      clearCart();
    } catch {
      setError("Le paiement n’a pas pu être initialisé. Merci de réessayer.");
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 lg:px-6">
        <div
          className="rounded-[32px] border border-[#e5d4b0] bg-white p-10 text-center shadow-[var(--shadow-soft)] md:p-14"
          style={{ animation: "var(--animate-scale-in)" }}
        >
          <CheckCircle2 className="mx-auto h-16 w-16 text-gold" />
          <h1 className="mt-7 font-display text-[clamp(2rem,4vw,2.75rem)] text-[#231711]">
            Commande confirmée
          </h1>
          <p className="mx-auto mt-4 max-w-md leading-7 text-ink-soft">
            Merci pour votre confiance. Votre commande est enregistrée et en attente de validation
            par notre atelier.
          </p>
          <p className="mt-4 inline-flex rounded-full bg-gold-pale px-4 py-2 text-sm font-medium text-[#6f5230]">
            N° {orderId}
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="press inline-flex justify-center rounded-full bg-espresso px-6 py-3.5 text-sm font-medium text-white hover:bg-espresso-light"
            >
              Retour à l’accueil
            </Link>
            <Link
              href="/boutique"
              className="press inline-flex justify-center rounded-full border border-[#e0cba4] px-6 py-3.5 text-sm font-medium text-espresso hover:border-gold"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center lg:px-6">
        <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] text-[#231711]">
          Votre panier est vide
        </h1>
        <p className="mt-4 text-ink-soft">Ajoutez une pièce avant de passer commande.</p>
        <Link
          href="/boutique"
          className="press mt-8 inline-flex rounded-full bg-espresso px-6 py-3.5 text-sm font-medium text-white hover:bg-espresso-light"
        >
          Voir la collection
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-full border border-[#e5d1ab] bg-cream-panel px-5 py-3.5 text-sm outline-none transition placeholder:text-ink-muted hover:border-[#d8bd8c] focus:border-gold focus:shadow-[0_0_0_4px_rgba(193,154,91,0.12)]";

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
      <p className="text-[11px] uppercase tracking-[0.3em] text-[#8b6a4b]">Étape finale</p>
      <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-tight text-[#231711]">
        Paiement et livraison
      </h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <form onSubmit={handleSubmit} className="space-y-8 rounded-[30px] border border-line bg-white p-6 md:p-8">
          <fieldset>
            <legend className="font-display text-2xl text-[#231711]">Informations client</legend>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input name="firstName" required placeholder="Prénom" className={inputClass} />
              <input name="lastName" required placeholder="Nom" className={inputClass} />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className={`md:col-span-2 ${inputClass}`}
              />
              <input
                name="phone"
                type="tel"
                placeholder="Téléphone"
                className={`md:col-span-2 ${inputClass}`}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-2xl text-[#231711]">Adresse</legend>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                name="address"
                required={shippingMode === "livraison"}
                placeholder="Adresse"
                className={`md:col-span-2 ${inputClass}`}
              />
              <input name="postalCode" placeholder="Code postal" className={inputClass} />
              <input name="city" placeholder="Ville" className={inputClass} />
              <input
                name="country"
                defaultValue="France"
                placeholder="Pays"
                className={`md:col-span-2 ${inputClass}`}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-2xl text-[#231711]">Mode de livraison</legend>
            <div className="mt-5 space-y-3">
              {(
                [
                  {
                    value: "retrait" as const,
                    icon: Store,
                    title: "Retrait en boutique — Nantes",
                    hint: "Disponible sous 24 h ouvrées",
                    price: "Gratuit",
                  },
                  {
                    value: "livraison" as const,
                    icon: Truck,
                    title: "Livraison sécurisée à domicile",
                    hint: "2 à 4 jours ouvrés, suivi inclus",
                    price:
                      subtotal >= FREE_SHIPPING_THRESHOLD
                        ? "Offerte"
                        : formatPrice(SHIPPING_FEE),
                  },
                ]
              ).map((option) => (
                <label
                  key={option.value}
                  data-active={shippingMode === option.value}
                  className="flex cursor-pointer items-center gap-4 rounded-[20px] border border-line bg-[#fffaf3] p-4 transition-all hover:border-[#d8bd8c] data-[active=true]:border-gold data-[active=true]:bg-gold-pale/40 data-[active=true]:shadow-[0_0_0_4px_rgba(193,154,91,0.1)]"
                >
                  <input
                    type="radio"
                    name="shippingMode"
                    value={option.value}
                    checked={shippingMode === option.value}
                    onChange={() => setShippingMode(option.value)}
                    className="sr-only"
                  />
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gold">
                    <option.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-ink">{option.title}</span>
                    <span className="block text-xs text-ink-muted">{option.hint}</span>
                  </span>
                  <span className="text-sm font-semibold text-ink">{option.price}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-2xl text-[#231711]">Paiement</legend>
            <div className="mt-5 rounded-[20px] border border-line bg-[#fffaf3] p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <Lock className="h-4 w-4 text-gold" />
                Paiement sécurisé par Stripe
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                Vous serez redirigé vers la page de paiement sécurisée Stripe pour saisir vos
                coordonnées bancaires. Aucune donnée de carte ne transite par ce site.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-muted">
                <CreditCard className="h-4 w-4" />
                Visa · Mastercard · CB · Apple Pay
              </div>
            </div>
          </fieldset>

          {error && <p className="text-sm text-[#b4544a]">{error}</p>}

          <button
            type="submit"
            disabled={status === "sending"}
            className="press sheen inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-6 py-4 text-sm font-medium text-white hover:bg-espresso-light disabled:opacity-70"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement en cours…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Payer {formatPrice(total)}
              </>
            )}
          </button>
        </form>

        <aside className="rounded-[30px] border border-line bg-white p-6 shadow-[var(--shadow-soft)] lg:sticky lg:top-[100px]">
          <h2 className="font-display text-2xl text-[#231711]">Résumé</h2>
          <div className="rule-gold my-5" />

          <ul className="space-y-4">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt=""
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                  <p className="text-xs text-ink-muted">Quantité {quantity}</p>
                </div>
                <span className="text-sm font-semibold text-ink">
                  {formatPrice(product.price * quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-[#f2e7d4] pt-5 text-sm text-[#4d3c35]">
            <div className="flex items-center justify-between">
              <dt>Sous-total</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Livraison</dt>
              <dd className={shipping === 0 ? "text-[#5c7a4a]" : undefined}>
                {shipping === 0 ? "Offerte" : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex items-center justify-between text-ink-muted">
              <dt>dont TVA (20 %)</dt>
              <dd>{formatPrice(vatIncluded)}</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-center justify-between border-t border-[#e8dcc0] pt-5">
            <span className="text-sm uppercase tracking-[0.2em] text-ink-muted">Total</span>
            <span className="font-display text-3xl text-ink">{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
