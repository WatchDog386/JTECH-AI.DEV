// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useCallback, useEffect } from "react";

export type FinishCategory =
  | "flooring"
  | "ceiling"
  | "wall-finishes"
  | "paint"
  | "glazing"
  | "joinery";

export interface FinishElement {
  id: string;
  category: FinishCategory;
  material: string;
  area: number;
  length?: number;
  width?: number;
  height?: number;
  unit: "m²" | "m" | "pcs";
  quantity: number;
  location?: string;
  specifications?: any;
}

export interface FinishCalculation {
  id: string;
  category: FinishCategory;
  material: string;
  quantity: number;
  adjustedQuantity: number;
  unit: string;
  unitRate: number;
  materialCost: number;
  materialCostWithWastage: number;
  totalCost: number;
  totalCostWithWastage: number;
  wastage: {
    percentage: number;
    wastageQuantity: number;
    totalWastageCost: number;
  };
}

export interface FinishesTotals {
  totalArea: number;
  totalQuantity: number;
  totalAdjustedQuantity: number;
  totalMaterialCost: number;
  totalMaterialCostWithWastage: number;
  totalCost: number;
  totalCostWithWastage: number;
  wastage: {
    percentage: number;
    totalWastageQuantity: number;
    totalWastageCost: number;
  };
}

export default function useUniversalFinishesCalculator(
  finishes: FinishElement[],
  materialPrices: any[],
  quote: any,
  setQuoteData
) {
  const [calculations, setCalculations] = useState<FinishCalculation[]>([]);
  const [totals, setTotals] = useState<FinishesTotals>({
    totalArea: 0,
    totalQuantity: 0,
    totalAdjustedQuantity: 0,
    totalMaterialCost: 0,
    totalMaterialCostWithWastage: 0,
    totalCost: 0,
    totalCostWithWastage: 0,
    wastage: {
      percentage: 0,
      totalWastageQuantity: 0,
      totalWastageCost: 0,
    },
  });

  // Get wastage percentage from quote settings with fallback
  const getWastagePercentage = useCallback((): number => {
    const wastageSetting = quote?.qsSettings?.wastageFinishes;

    if (typeof wastageSetting === "number") {
      return wastageSetting / 100;
    }

    if (typeof wastageSetting === "string") {
      const parsed = parseFloat(wastageSetting);
      return isNaN(parsed) ? 0.1 : parsed / 100;
    }

    return 0.1; // Default to 10% wastage
  }, [quote]);

  // Apply wastage to quantity and round up
  const applyWastageToQuantity = useCallback(
    (quantity: number, wastagePercentage: number): number => {
      const adjustedQuantity = quantity * (1 + wastagePercentage);
      return Math.ceil(adjustedQuantity * 100) / 100; // Round to 2 decimal places for area/linear, whole numbers for pieces
    },
    []
  );

  const calculateFinish = useCallback(
    (finish: FinishElement): FinishCalculation => {
      const wastagePercentage = getWastagePercentage();
      const unitRate = getFinishRate(finish, materialPrices);

      // Apply wastage to quantity
      const adjustedQuantity = applyWastageToQuantity(
        finish.quantity,
        wastagePercentage
      );
      const wastageQuantity = adjustedQuantity - finish.quantity;

      // Calculate costs
      const materialCost = finish.quantity * unitRate;
      const materialCostWithWastage = adjustedQuantity * unitRate;
      const totalWastageCost = wastageQuantity * unitRate;

      const totalCost = materialCost;
      const totalCostWithWastage = materialCostWithWastage;

      return {
        id: finish.id,
        category: finish.category,
        material: finish.material,
        quantity: finish.quantity,
        adjustedQuantity,
        unit: finish.unit,
        unitRate,
        materialCost,
        materialCostWithWastage,
        totalCost,
        totalCostWithWastage,
        wastage: {
          percentage: wastagePercentage,
          wastageQuantity,
          totalWastageCost,
        },
      };
    },
    [materialPrices, getWastagePercentage, applyWastageToQuantity]
  );

  const calculateAll = useCallback(() => {
    const calculated = finishes.map(calculateFinish);
    setCalculations(calculated);

    const wastagePercentage = getWastagePercentage();

    const newTotals = calculated.reduce(
      (acc, curr) => ({
        totalArea: acc.totalArea + (curr.unit === "m²" ? curr.quantity : 0),
        totalQuantity: acc.totalQuantity + curr.quantity,
        totalAdjustedQuantity:
          acc.totalAdjustedQuantity + curr.adjustedQuantity,
        totalMaterialCost: acc.totalMaterialCost + curr.materialCost,
        totalMaterialCostWithWastage:
          acc.totalMaterialCostWithWastage + curr.materialCostWithWastage,
        totalCost: acc.totalCost + curr.totalCost,
        totalCostWithWastage:
          acc.totalCostWithWastage + curr.totalCostWithWastage,
        wastage: {
          percentage: wastagePercentage,
          totalWastageQuantity:
            acc.wastage.totalWastageQuantity + curr.wastage.wastageQuantity,
          totalWastageCost:
            acc.wastage.totalWastageCost + curr.wastage.totalWastageCost,
        },
      }),
      {
        totalArea: 0,
        totalQuantity: 0,
        totalAdjustedQuantity: 0,
        totalMaterialCost: 0,
        totalMaterialCostWithWastage: 0,
        totalCost: 0,
        totalCostWithWastage: 0,
        wastage: {
          percentage: wastagePercentage,
          totalWastageQuantity: 0,
          totalWastageCost: 0,
        },
      }
    );

    setTotals(newTotals);
  }, [finishes, calculateFinish, getWastagePercentage]);

  useEffect(() => {
    if (finishes?.length > 0) {
      calculateAll();
    }
  }, [finishes, calculateAll]);

  const combined = { ...totals, calculations };

  useEffect(() => {
    setQuoteData((prev: any) => ({
      ...prev,
      finishes_calculations: combined,
    }));
  }, [combined]);

  return {
    calculations,
    totals,
    calculateAll,
    wastagePercentage: getWastagePercentage(),
  };
}

function getFinishRate(finish: FinishElement, prices: any[]): number {
  if (!finish || !prices?.length) return 0;

  const categoryKey = finish.category.toLowerCase();

  // Find category in finishes JSON
  const category = prices.find(
    (p: any) => p.name.toLowerCase() === categoryKey
  );
  if (!category) return 0;

  // Find material in that category
  if (!category?.type?.materials) return 0;
  const matchedMaterial = Object.entries(category?.type?.materials).find(
    ([materialName]) =>
      materialName.toLowerCase() === finish.material.toLowerCase()
  );

  if (!matchedMaterial) {
    // fallback if partial match
    const partialMatch = Object.entries(category?.type?.materials).find(
      ([materialName]) =>
        materialName.toLowerCase().includes(finish.material.toLowerCase())
    );
    return partialMatch ? Number(partialMatch[1]) : 0;
  }

  // Return the price value
  return Number(matchedMaterial[1]) || 0;
}
