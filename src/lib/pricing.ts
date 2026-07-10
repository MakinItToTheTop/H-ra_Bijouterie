export type JewelryMaterial = "Or 18 carats" | "Argent 925" | "Or blanc" | "Plaqué or";

export type JewelryPriceInput = {
  material: JewelryMaterial | string;
  weightGrams: number;
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
  weightGrams,
  marketRate,
  labor,
}: JewelryPriceInput): number {
  const safeWeight = Number(weightGrams) || 0;
  const safeMarketRate = Number(marketRate) || 0;
  const safeLabor = Number(labor) || 0;

  // marketRate provient de /api/metals et représente déjà le prix au gramme
  // de l'alliage travaillé (pureté déjà appliquée côté API) : pas besoin de
  // réappliquer une pureté ou un facteur d'alliage ici.
  const intrinsicValue = safeWeight * safeMarketRate;
  const total = intrinsicValue + safeLabor;

  return Math.round(Math.max(total, 0));
}