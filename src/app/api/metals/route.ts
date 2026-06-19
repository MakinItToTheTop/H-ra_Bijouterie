import { NextResponse } from "next/server";

// Prix des métaux en €/gramme (approximatifs pour développement)
// En production, ces données viendraient d'une API externe
const metalPrices: Record<string, number> = {
  "Or 18 carats": 65,
  "Or blanc": 65,
  "Argent 925": 0.85,
  "Plaqué or": 0.05,
};

// Simule une variation en temps réel
function getMetalPrices() {
  const variation = Math.random() * 0.98 + 0.95; // Variation de ±5%
  const prices: Record<string, number> = {};

  for (const [metal, basePrice] of Object.entries(metalPrices)) {
    prices[metal] = Math.round(basePrice * variation * 100) / 100;
  }

  return prices;
}

export async function GET() {
  try {
    const prices = getMetalPrices();
    return NextResponse.json({
      ok: true,
      prices,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching metal prices:", error);
    return NextResponse.json(
      { ok: false, message: "Impossible de récupérer les prix des métaux", prices: metalPrices },
      { status: 500 }
    );
  }
}
