import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateJewelryPrice } from "./pricing";

describe("calculateJewelryPrice", () => {
  it("calcul le prix en fonction du métal et du poids", () => {
    const price = calculateJewelryPrice({
      material: "Or 18 carats",
      weightGrams: 2.4,
      purity: 18,
      marketRate: 70,
      labor: 150,
    });

    assert.ok(price > 0);
    assert.ok(Math.abs(price - 1170) < 20);
  });

  it("applique un prix plus bas pour l'argent et le plaqué", () => {
    const silver = calculateJewelryPrice({
      material: "Argent 925",
      weightGrams: 10,
      purity: 92.5,
      marketRate: 0.8,
      labor: 40,
    });

    const plated = calculateJewelryPrice({
      material: "Plaqué or",
      weightGrams: 10,
      purity: 18,
      marketRate: 70,
      labor: 25,
    });

    assert.ok(silver > 0);
    assert.ok(plated > 0);
    assert.ok(silver < plated);
  });
});
