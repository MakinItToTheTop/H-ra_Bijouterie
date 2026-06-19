const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 1234.5 → "1 234,50 €" — used everywhere a price is shown. */
export function formatPrice(value: number) {
  return euro.format(Number.isFinite(value) ? value : 0);
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

export const FREE_SHIPPING_THRESHOLD = 300;
export const SHIPPING_FEE = 14;
export const VAT_RATE = 0.2;
