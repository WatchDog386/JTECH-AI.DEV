// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useCallback, useEffect } from "react";

export type PlumbingSystemType =
  | "water-supply"
  | "drainage"
  | "sewage"
  | "rainwater"
  | "hot-water"
  | "fire-fighting"
  | "gas-piping"
  | "irrigation";

export type PipeMaterial =
  | "PVC-u"
  | "PVC-c"
  | "copper"
  | "PEX"
  | "galvanized-steel"
  | "HDPE"
  | "PPR"
  | "cast-iron"
  | "vitrified-clay";

export type FixtureType =
  | "water-closet"
  | "urinal"
  | "lavatory"
  | "kitchen-sink"
  | "shower"
  | "bathtub"
  | "bidet"
  | "floor-drain"
  | "cleanout"
  | "hose-bib";

// Configurable rates interface
export interface PlumbingRates {
  fittingMultipliers: Record<string, number>;
  qualityMultipliers: {
    standard: number;
    premium: number;
    luxury: number;
  };
  tankInstallationRate: number; // per 1000L
  pumpInstallationRate: number; // per kW
}

export interface PipeSection {
  id: string;
  material: PipeMaterial;
  diameter: number;
  length: number;
  quantity: number;
  pressureRating?: string;
  insulation?: { type: string; thickness: number };
  trenchDetails?: { width: number; depth: number; length: number };
}

export interface PlumbingFixture {
  id: string;
  type: FixtureType;
  count: number;
  location: string;
  quality: "standard" | "premium" | "luxury";
  waterConsumption?: number;
  connections: { waterSupply: boolean; drainage: boolean; vent: boolean };
}

export interface PlumbingSystem {
  id: string;
  name: string;
  systemType: PlumbingSystemType;
  pipes: PipeSection[];
  fixtures: PlumbingFixture[];
  tanks: any[];
  pumps: any[];
  fittings: any[];
}

export interface PlumbingCalculation {
  id: string;
  name: string;
  systemType: PlumbingSystemType;
  totalPipeLength: number;
  totalFixtures: number;
  materialCost: number;
  materialCostWithWastage: number;
  totalCost: number;
  totalCostWithWastage: number;
  breakdown: {
    pipes: number;
    fixtures: number;
    fittings: number;
    accessories: number;
  };
  breakdownWithWastage: {
    pipes: number;
    fixtures: number;
    fittings: number;
    accessories: number;
  };
  efficiency: {
    materialUtilization: number;
    installationEfficiency: number;
  };
  wastage: {
    percentage: number;
    adjustedQuantities: {
      pipes: Array<{
        id: string;
        originalQuantity: number;
        adjustedQuantity: number;
        wastageAmount: number;
      }>;
      fixtures: Array<{
        id: string;
        originalCount: number;
        adjustedCount: number;
        wastageAmount: number;
      }>;
    };
    totalWastageItems: number;
  };
}

export interface PlumbingTotals {
  totalPipeLength: number;
  totalFixtures: number;
  totalMaterialCost: number;
  totalMaterialCostWithWastage: number;
  totalCost: number;
  totalCostWithWastage: number;
  breakdown: {
    pipes: number;
    fixtures: number;
    fittings: number;
    accessories: number;
  };
  breakdownWithWastage: {
    pipes: number;
    fixtures: number;
    fittings: number;
    accessories: number;
  };
  wastage: {
    percentage: number;
    totalAdjustedItems: number;
    totalWastageItems: number;
  };
}

export default function usePlumbingCalculator(
  plumbingSystems: PlumbingSystem[],
  materialPrices: any[],
  quote: any,
  setQuoteData
) {
  const [calculations, setCalculations] = useState<PlumbingCalculation[]>([]);
  const [totals, setTotals] = useState<PlumbingTotals>({
    totalPipeLength: 0,
    totalFixtures: 0,
    totalMaterialCost: 0,
    totalMaterialCostWithWastage: 0,
    totalCost: 0,
    totalCostWithWastage: 0,
    breakdown: { pipes: 0, fixtures: 0, fittings: 0, accessories: 0 },
    breakdownWithWastage: {
      pipes: 0,
      fixtures: 0,
      fittings: 0,
      accessories: 0,
    },
    wastage: {
      percentage: 0,
      totalAdjustedItems: 0,
      totalWastageItems: 0,
    },
  });

  // Get wastage percentage from quote settings with fallback
  const getWastagePercentage = useCallback((): number => {
    const wastageSetting = quote?.qsSettings?.wastagePlumbing;

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
      const adjustedQuantity = Math.ceil(quantity * (1 + wastagePercentage));
      return Math.ceil(adjustedQuantity);
    },
    []
  );

  const getMaterialPrice = useCallback(
    (materialName: string, diameterOrQuality?: number | string): number => {
      // Find top-level category (like "Pipes" or "Fixtures")
      const categories = materialPrices.filter(
        (cat) =>
          cat.name?.toLowerCase() === "fixtures" ||
          cat.name?.toLowerCase() === "pipes"
      );

      for (const category of categories) {
        if (category.name.toLowerCase() === "fixtures") {
          const fixtureType = category.type?.find((f: any) =>
            f.fixture?.toLowerCase().includes(materialName.toLowerCase())
          );
          if (fixtureType) {
            const qualityKey =
              typeof diameterOrQuality === "string"
                ? diameterOrQuality.toLowerCase()
                : "standard";

            const price =
              fixtureType.price_kes_per_item[qualityKey] ??
              fixtureType.price_kes_per_item.standard ??
              0;

            return price;
          }

          return 0; // fallback if fixture not found
        }

        if (category.name.toLowerCase() === "pipes") {
          // Find pipe type (PVC-U, HDPE, etc.)
          const pipeType = category.type?.find((p: any) =>
            p.type?.toLowerCase().includes(materialName.toLowerCase())
          );

          if (pipeType) {
            const diameterKey =
              typeof diameterOrQuality === "number"
                ? `${diameterOrQuality} mm`
                : undefined;

            const price =
              diameterKey && pipeType.price_kes_per_meter[diameterKey]
                ? pipeType.price_kes_per_meter[diameterKey]
                : 0;

            return price;
          }
        }
      }

      // Default if not found
      return 0;
    },
    [materialPrices]
  );

  const calculatePipeCost = useCallback(
    (
      pipe: PipeSection,
      wastagePercentage: number
    ): {
      materialCost: number;
      id: string;
      adjustedQuantity: number;
      wastageAmount: number;
      originalQuantity: number;
    } => {
      const pipeCostPerMeter = getMaterialPrice(pipe.material, pipe.diameter);

      // Apply wastage to quantity and round up
      const adjustedQuantity = applyWastageToQuantity(
        pipe.quantity,
        wastagePercentage
      );
      const wastageAmount = adjustedQuantity - pipe.quantity;

      const materialCost = pipe.length * adjustedQuantity * pipeCostPerMeter;

      const id = pipe.id;

      return {
        id,
        materialCost,
        adjustedQuantity,
        wastageAmount,
        originalQuantity: pipe.quantity,
      };
    },
    [getMaterialPrice, applyWastageToQuantity]
  );

  const calculateFixtureCost = useCallback(
    (
      fixture: PlumbingFixture,
      wastagePercentage: number
    ): {
      materialCost: number;
      id: string;
      adjustedCount: number;
      wastageAmount: number;
      originalCount: number;
    } => {
      const baseFixtureCost = getMaterialPrice(fixture.type, fixture.quality);

      // Apply wastage to count and round up
      const adjustedCount = applyWastageToQuantity(
        fixture.count,
        wastagePercentage
      );
      const wastageAmount = adjustedCount - fixture.count;

      const materialCost = adjustedCount * baseFixtureCost;

      const id = fixture.id;
      return {
        id,
        materialCost,
        adjustedCount,
        wastageAmount,
        originalCount: fixture.count,
      };
    },
    [getMaterialPrice, applyWastageToQuantity]
  );

  // Apply wastage to breakdown
  const applyWastageToBreakdown = useCallback(
    (breakdown: any, wastagePercentage: number) => {
      return {
        pipes: breakdown.pipes * (1 + wastagePercentage),
        fixtures: breakdown.fixtures * (1 + wastagePercentage),
        fittings: breakdown.fittings * (1 + wastagePercentage),
        accessories: breakdown.accessories * (1 + wastagePercentage),
      };
    },
    []
  );

  const calculatePlumbingSystem = useCallback(
    (system: PlumbingSystem): PlumbingCalculation => {
      const wastagePercentage = getWastagePercentage();

      // Calculate costs with wastage applied to quantities
      const pipeCalculations = system.pipes.map((pipe) =>
        calculatePipeCost(pipe, wastagePercentage)
      );
      const pipeMaterialCost = pipeCalculations.reduce(
        (sum, calc) => sum + calc.materialCost,
        0
      );
      const totalPipeLength = system.pipes.reduce(
        (sum, pipe) => sum + pipe.length * pipe.quantity,
        0
      );

      const fixtureCalculations = system.fixtures.map((fixture) =>
        calculateFixtureCost(fixture, wastagePercentage)
      );
      const fixtureMaterialCost = fixtureCalculations.reduce(
        (sum, calc) => sum + calc.materialCost,
        0
      );
      const totalFixtures = system.fixtures.reduce(
        (sum, fixture) => sum + fixture.count,
        0
      );

      // Calculate total costs
      const materialCost = pipeMaterialCost + fixtureMaterialCost;
      const totalCostWithoutWastage = materialCost;

      // Calculate wastage
      const materialCostWithWastage = materialCost; // Already includes wastage in quantities
      const totalCostWithWastage = totalCostWithoutWastage; // Already includes wastage in quantities

      const theoreticalLength = system.fixtures.length * 15;
      const materialUtilization =
        theoreticalLength > 0
          ? (totalPipeLength / theoreticalLength) * 100
          : 100;
      const installationEfficiency = Math.min(
        100,
        (totalCostWithWastage / Math.max(1, system.fixtures.length * 10000)) *
          100
      );

      // Calculate wastage details
      const totalWastageItems =
        pipeCalculations.reduce((sum, calc) => sum + calc.wastageAmount, 0) +
        fixtureCalculations.reduce((sum, calc) => sum + calc.wastageAmount, 0);

      // Calculate breakdowns
      const breakdown = {
        pipes: pipeMaterialCost,
        fixtures: fixtureMaterialCost,
        fittings: materialCost * 0.05,
        accessories: materialCost * 0.1,
      };

      const breakdownWithWastage = applyWastageToBreakdown(
        breakdown,
        wastagePercentage
      );

      return {
        id: system.id,
        name: system.name,
        systemType: system.systemType,
        totalPipeLength,
        totalFixtures,
        materialCost,
        materialCostWithWastage,
        totalCost: totalCostWithoutWastage,
        totalCostWithWastage,
        breakdown,
        breakdownWithWastage,
        efficiency: {
          materialUtilization: Math.min(150, materialUtilization),
          installationEfficiency: Math.min(100, installationEfficiency),
        },
        wastage: {
          percentage: wastagePercentage,
          adjustedQuantities: {
            pipes: pipeCalculations.map((calc) => ({
              id: calc.id,
              originalQuantity: calc.originalQuantity,
              adjustedQuantity: calc.adjustedQuantity,
              wastageAmount: calc.wastageAmount,
            })),
            fixtures: fixtureCalculations.map((calc) => ({
              id: calc.id,
              originalCount: calc.originalCount,
              adjustedCount: calc.adjustedCount,
              wastageAmount: calc.wastageAmount,
            })),
          },
          totalWastageItems,
        },
      };
    },
    [
      getWastagePercentage,
      calculatePipeCost,
      calculateFixtureCost,
      applyWastageToBreakdown,
    ]
  );

  const calculateAll = useCallback(() => {
    const calculatedResults = plumbingSystems.map(calculatePlumbingSystem);
    setCalculations(calculatedResults);

    const wastagePercentage = getWastagePercentage();

    const newTotals = calculatedResults.reduce(
      (acc, curr) => {
        return {
          totalPipeLength: acc.totalPipeLength + curr.totalPipeLength,
          totalFixtures: acc.totalFixtures + curr.totalFixtures,
          totalMaterialCost: acc.totalMaterialCost + curr.materialCost,
          totalMaterialCostWithWastage:
            acc.totalMaterialCostWithWastage + curr.materialCostWithWastage,
          totalCost: acc.totalCost + curr.totalCost,
          totalCostWithWastage:
            acc.totalCostWithWastage + curr.totalCostWithWastage,
          breakdown: {
            pipes: acc.breakdown.pipes + curr.breakdown.pipes,
            fixtures: acc.breakdown.fixtures + curr.breakdown.fixtures,
            fittings: acc.breakdown.fittings + curr.breakdown.fittings,
            accessories: acc.breakdown.accessories + curr.breakdown.accessories,
          },
          breakdownWithWastage: {
            pipes:
              acc.breakdownWithWastage.pipes + curr.breakdownWithWastage.pipes,
            fixtures:
              acc.breakdownWithWastage.fixtures +
              curr.breakdownWithWastage.fixtures,
            fittings:
              acc.breakdownWithWastage.fittings +
              curr.breakdownWithWastage.fittings,
            accessories:
              acc.breakdownWithWastage.accessories +
              curr.breakdownWithWastage.accessories,
          },
          wastage: {
            percentage: wastagePercentage,
            totalAdjustedItems:
              acc.wastage.totalAdjustedItems +
              (curr.totalFixtures +
                curr.wastage.adjustedQuantities.pipes.reduce(
                  (sum, pipe) => sum + pipe.adjustedQuantity,
                  0
                )),
            totalWastageItems:
              acc.wastage.totalWastageItems + curr.wastage.totalWastageItems,
          },
        };
      },
      {
        totalPipeLength: 0,
        totalFixtures: 0,
        totalMaterialCost: 0,
        totalMaterialCostWithWastage: 0,
        totalCost: 0,
        totalCostWithWastage: 0,
        breakdown: { pipes: 0, fixtures: 0, fittings: 0, accessories: 0 },
        breakdownWithWastage: {
          pipes: 0,
          fixtures: 0,
          fittings: 0,
          accessories: 0,
        },
        wastage: {
          percentage: wastagePercentage,
          totalAdjustedItems: 0,
          totalWastageItems: 0,
        },
      }
    );

    setTotals(newTotals);
  }, [plumbingSystems, calculatePlumbingSystem, getWastagePercentage]);

  const combined = { ...totals, calculations };

  useEffect(() => {
    setQuoteData((prev: any) => ({
      ...prev,
      plumbing_calculations: combined,
    }));
  }, [combined]);

  useEffect(() => {
    if (plumbingSystems?.length > 0) calculateAll();
  }, [plumbingSystems, calculateAll]);

  return {
    calculations,
    totals,
    calculateAll,
    wastagePercentage: getWastagePercentage(),
  };
}
