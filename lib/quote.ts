import { Material, Finish } from "@prisma/client";

// Material base cost per cm³ in INR
const MATERIAL_RATE: Record<Material, number> = {
  PLA: 3.5,
  ABS: 4.0,
  PETG: 4.5,
  RESIN: 8.0,
  SLS_NYLON: 12.0,
  MJF_NYLON: 14.0,
};

// Finish multiplier on top of base
const FINISH_MULTIPLIER: Record<Finish, number> = {
  RAW: 1.0,
  SANDED: 1.3,
  PAINTED: 1.7,
  POLISHED: 1.5,
};

// Infill surcharge: each 10% above base 20% adds 5%
const INFILL_SURCHARGE = (infill: number) => {
  const above = Math.max(0, infill - 20);
  return 1 + (above / 10) * 0.05;
};

const BASE_SETUP_FEE = 50; // INR per order
const MIN_ORDER_AMOUNT = 200; // INR

export interface EstimateInput {
  volumeCm3: number; // File volume in cm³ — parsed from STL on client
  material: Material;
  finish: Finish;
  infillPercent: number;
  quantity: number;
}

export interface EstimateResult {
  estimateAmount: number; // Total in INR, rounded
  breakdown: {
    volumeCost: number;
    materialRate: number;
    finishMultiplier: number;
    infillSurcharge: number;
    setupFee: number;
    quantity: number;
    perUnitCost: number;
  };
  isEstimate: true; // Always flag as estimate — admin will confirm
}

export function calculateEstimate(input: EstimateInput): EstimateResult {
  const { volumeCm3, material, finish, infillPercent, quantity } = input;

  const materialRate = MATERIAL_RATE[material];
  const finishMultiplier = FINISH_MULTIPLIER[finish];
  const infillSurcharge = INFILL_SURCHARGE(infillPercent);

  const volumeCost = volumeCm3 * materialRate;
  const perUnitCost =
    volumeCost * finishMultiplier * infillSurcharge + BASE_SETUP_FEE;
  const total = Math.max(perUnitCost * quantity, MIN_ORDER_AMOUNT);

  return {
    estimateAmount: Math.round(total),
    breakdown: {
      volumeCost: Math.round(volumeCost * 100) / 100,
      materialRate,
      finishMultiplier,
      infillSurcharge: Math.round(infillSurcharge * 100) / 100,
      setupFee: BASE_SETUP_FEE,
      quantity,
      perUnitCost: Math.round(perUnitCost * 100) / 100,
    },
    isEstimate: true,
  };
}
