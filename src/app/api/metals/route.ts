import { NextResponse } from "next/server";

<<<<<<< HEAD
// Prix de repli utilisés uniquement si l'API externe est indisponible
// (clé absente, quota dépassé, panne réseau...).
const FALLBACK_PRICES_PER_GRAM: Record<string, number> = {
=======
// Prix des métaux en €/gramme (approximatifs pour développement)
// En production, ces données viendraient d'une API externe
const metalPrices: Record<string, number> = {
>>>>>>> 9defbd9fe45c07c4a3655e6346ce7f98a77502ed
  "Or 18 carats": 65,
  "Or blanc": 65,
  "Argent 925": 0.85,
  "Plaqué or": 0.05,
};

<<<<<<< HEAD
const TROY_OUNCE_IN_GRAMS = 31.1034768;

// Puretés utilisées pour dériver un prix/gramme "matière travaillée"
// à partir du cours de l'or fin (24 carats) et de l'argent fin.
const GOLD_PURITY: Record<string, number> = {
  "Or 18 carats": 18 / 24,
  "Or blanc": 18 / 24,
  "Plaqué or": 0.05, // fine dorure, très peu de métal précieux réel
};
const SILVER_PURITY = 0.925; // argent 925

type MetalPriceApiResponse = {
  success: boolean;
  base: string;
  timestamp: number;
  rates: Record<string, number>;
  error?: { code: number; info: string };
};

async function fetchLiveMetalPrices(): Promise<{
  prices: Record<string, number>;
  timestamp: string;
  source: "live";
} | null> {
  const apiKey = process.env.METALPRICE_API_KEY;
  if (!apiKey) return null;

  const url =
    "https://api.metalpriceapi.com/v1/latest" +
    `?api_key=${apiKey}&base=EUR&currencies=XAU,XAG`;

  // Le plan gratuit ne se met à jour qu'une fois par jour et n'autorise que
  // 100 requêtes/mois : on met donc le résultat en cache 24h côté Next.js
  // pour ne jamais dépasser le quota tout en restant "temps réel" au sens
  // du plan utilisé.
  const response = await fetch(url, { next: { revalidate: 86400 } });
  const data = (await response.json()) as MetalPriceApiResponse;

  if (!data.success || !data.rates?.XAU || !data.rates?.XAG) {
    console.error("MetalpriceAPI error", data.error ?? data);
    return null;
  }

  // Avec base=EUR, la clé "EURXAU" donne directement le prix d'une once
  // troy d'or fin en euros (voir doc MetalpriceAPI).
  const goldPerOunceEur = data.rates["EURXAU"] ?? 1 / data.rates.XAU;
  const silverPerOunceEur = data.rates["EURXAG"] ?? 1 / data.rates.XAG;

  const goldFinePerGram = goldPerOunceEur / TROY_OUNCE_IN_GRAMS;
  const silverFinePerGram = silverPerOunceEur / TROY_OUNCE_IN_GRAMS;

  const prices: Record<string, number> = {
    "Or 18 carats": round2(goldFinePerGram * GOLD_PURITY["Or 18 carats"]),
    "Or blanc": round2(goldFinePerGram * GOLD_PURITY["Or blanc"]),
    "Argent 925": round2(silverFinePerGram * SILVER_PURITY),
    "Plaqué or": round2(goldFinePerGram * GOLD_PURITY["Plaqué or"]),
  };

  return {
    prices,
    timestamp: new Date(data.timestamp * 1000).toISOString(),
    source: "live",
  };
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
=======
// Simule une variation en temps réel
function getMetalPrices() {
  const variation = Math.random() * 0.98 + 0.95; // Variation de ±5%
  const prices: Record<string, number> = {};

  for (const [metal, basePrice] of Object.entries(metalPrices)) {
    prices[metal] = Math.round(basePrice * variation * 100) / 100;
  }

  return prices;
>>>>>>> 9defbd9fe45c07c4a3655e6346ce7f98a77502ed
}

export async function GET() {
  try {
<<<<<<< HEAD
    const live = await fetchLiveMetalPrices();

    if (live) {
      return NextResponse.json({
        ok: true,
        prices: live.prices,
        timestamp: live.timestamp,
        source: "metalpriceapi",
      });
    }

    return NextResponse.json({
      ok: true,
      prices: FALLBACK_PRICES_PER_GRAM,
      timestamp: new Date().toISOString(),
      source: "fallback",
=======
    const prices = getMetalPrices();
    return NextResponse.json({
      ok: true,
      prices,
      timestamp: new Date().toISOString(),
>>>>>>> 9defbd9fe45c07c4a3655e6346ce7f98a77502ed
    });
  } catch (error) {
    console.error("Error fetching metal prices:", error);
    return NextResponse.json(
<<<<<<< HEAD
      {
        ok: false,
        message: "Impossible de récupérer les prix des métaux",
        prices: FALLBACK_PRICES_PER_GRAM,
        source: "fallback",
      },
      { status: 500 },
=======
      { ok: false, message: "Impossible de récupérer les prix des métaux", prices: metalPrices },
      { status: 500 }
>>>>>>> 9defbd9fe45c07c4a3655e6346ce7f98a77502ed
    );
  }
}
