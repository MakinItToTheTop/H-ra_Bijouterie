export type JewelryMaterial = "Or 18 carats" | "Argent 925" | "Or blanc" | "Plaqué or";

export type JewelryPriceInput = {
  material: JewelryMaterial | string;
  weightGrams: number;
  purity: number;
  marketRate: number;
  labor: number;
};

export const jewelryMaterials: JewelryMaterial[] = [
  "Or 18 carats",
  "Argent 925",
  "Or blanc",
  "Plaqué or",
];

export function calculateJewelryPrice({
  material,
  weightGrams,
  purity,
  marketRate,
  labor,
}: JewelryPriceInput): number {
  const safeWeight = Number(weightGrams) || 0;
  const safePurity = Number(purity) || 0;
  const safeMarketRate = Number(marketRate) || 0;
  const safeLabor = Number(labor) || 0;

  const alloyMultiplier: Record<string, number> = {
    "Or 18 carats": 8.1,
    "Or blanc": 7.8,
    "Argent 925": 2.6,
    "Plaqué or": 1.2,
  };

  const materialFactor = alloyMultiplier[String(material)] ?? 1.5;
  const intrinsicValue = safeWeight * safeMarketRate * (safePurity / 24) * materialFactor;
  const total = intrinsicValue + safeLabor;

  return Math.round(Math.max(total, 0));
}
