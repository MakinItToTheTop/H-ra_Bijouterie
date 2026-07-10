import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateJewelryPrice } from "./pricing";

describe("calculateJewelryPrice", () => {
  it("calcule le prix à partir du poids et du cours au gramme", () => {
    const price = calculateJewelryPrice({
      material: "Or 18 carats",
      weightGrams: 2.4,
      marketRate: 65,
      labor: 150,
    });

    // 2.4 * 65 + 150 = 306
    assert.equal(price, 306);
  });

  it("applique un prix plus bas pour l'argent que pour l'or", () => {
    const silver = calculateJewelryPrice({
      material: "Argent 925",
      weightGrams: 10,
      marketRate: 0.85,
      labor: 40,
    });

    const gold = calculateJewelryPrice({
      material: "Or 18 carats",
      weightGrams: 10,
      marketRate: 65,
      labor: 25,
    });

    assert.ok(silver > 0);
    assert.ok(gold > 0);
    assert.ok(silver < gold);
  });
});