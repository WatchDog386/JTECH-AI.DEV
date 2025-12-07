// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useCallback, useEffect } from "react";

export type RoofType =
  | "pitched"
  | "flat"
  | "gable"
  | "hip"
  | "mansard"
  | "butterfly"
  | "skillion";
export type RoofMaterial =
  | "concrete-tiles"
  | "clay-tiles"
  | "metal-sheets"
  | "box-profile"
  | "thatch"
  | "slate"
  | "asphalt-shingles"
  | "green-roof"
  | "membrane";

export type TimberSize =
  | "100x50"
  | "100x75"
  | "75x50"
  | "50x50"
  | "50x25"
  | "150x50"
  | "200x50";

export type UnderlaymentType =
  | "felt-30"
  | "felt-40"
  | "synthetic"
  | "rubberized"
  | "breathable";

export type InsulationType =
  | "glass-wool"
  | "rock-wool"
  | "eps"
  | "xps"
  | "polyurethane"
  | "reflective-foil";

export type GutterType = "PVC" | "Galvanized Steel" | "Aluminum" | "Copper";
export type DownpipeType = "PVC" | "Galvanized Steel" | "Aluminum" | "Copper";
export type FlashingType = "Galvanized Steel" | "Aluminum" | "Copper" | "PVC";
export type FasciaType = "PVC" | "Painted Wood" | "Aluminum" | "Composite";
export type SoffitType = "PVC" | "Aluminum" | "Composite";

export interface RoofTimber {
  id: string;
  type: string;
  size: TimberSize;
  spacing: number; // spacing in mm
  grade: string;
  treatment: string;
  quantity: number;
  length: number; // meters
  unit: "m" | "pcs";
}

export interface RoofCovering {
  type: string;
  material: RoofMaterial;
  thickness?: number; // mm
  underlayment?: UnderlaymentType;
  insulation?: {
    type: InsulationType;
    thickness: number; // mm
  };
}

export interface RoofAccessories {
  gutters: number; // meters
  gutterType: GutterType;
  downpipes: number; // pieces
  downpipeType: DownpipeType;
  flashings: number; // meters
  flashingType: FlashingType;
  fascia: number; // meters
  fasciaType: FasciaType;
  soffit: number; // meters
  soffitType: SoffitType;
  ridgeCaps?: number; // meters
  valleyTrays?: number; // meters
}

export interface RoofStructure {
  id: string;
  name: string;
  type: RoofType;
  material: RoofMaterial;
  area: number; // m²
  pitch: number; // degrees
  length: number; // meters
  width: number; // meters
  eavesOverhang: number; // meters
  ridgeLength?: number; // meters
  covering: RoofCovering;
  grade?: string;
  treatment?: string;
  timbers: RoofTimber[];
  accessories?: RoofAccessories;
}

export interface RoofingCalculation {
  id: string;
  name: string;
  type: RoofType;
  material: RoofMaterial;
  area: number;
  totalTimberVolume: number;
  coveringArea: number;
  materialCost: number;
  materialCostWithWastage: number;
  totalCost: number;
  totalCostWithWastage: number;
  breakdown: {
    timber: number;
    covering: number;
    accessories: number;
    insulation?: number;
    underlayment?: number;
  };
  breakdownWithWastage: {
    timber: number;
    covering: number;
    accessories: number;
    insulation?: number;
    underlayment?: number;
  };
  efficiency: {
    materialUtilization: number;
    wastePercentage: number;
  };
  wastage: {
    percentage: number;
    adjustedQuantities: {
      timbers: Array<{
        id: string;
        originalQuantity: number;
        adjustedQuantity: number;
        wastageAmount: number;
      }>;
      accessories: {
        gutters: { original: number; adjusted: number; wastage: number };
        downpipes: { original: number; adjusted: number; wastage: number };
        flashings: { original: number; adjusted: number; wastage: number };
        fascia: { original: number; adjusted: number; wastage: number };
        soffit: { original: number; adjusted: number; wastage: number };
        ridgeCaps: { original: number; adjusted: number; wastage: number };
        valleyTrays: { original: number; adjusted: number; wastage: number };
      };
    };
    totalWastageItems: number;
  };
}

export interface RoofingTotals {
  totalArea: number;
  totalTimberVolume: number;
  totalCoveringArea: number;
  totalMaterialCost: number;
  totalMaterialCostWithWastage: number;
  totalCost: number;
  totalCostWithWastage: number;
  breakdown: {
    timber: number;
    covering: number;
    accessories: number;
    insulation: number;
    underlayment: number;
  };
  breakdownWithWastage: {
    timber: number;
    covering: number;
    accessories: number;
    insulation: number;
    underlayment: number;
  };
  wastage: {
    percentage: number;
    totalAdjustedItems: number;
    totalWastageItems: number;
  };
}

export default function useRoofingCalculator(
  roofStructures: RoofStructure[],
  materialPrices: any,
  quote: any,
  setQuoteData
) {
  const [calculations, setCalculations] = useState<RoofingCalculation[]>([]);
  const [totals, setTotals] = useState<RoofingTotals>({
    totalArea: 0,
    totalTimberVolume: 0,
    totalCoveringArea: 0,
    totalMaterialCost: 0,
    totalMaterialCostWithWastage: 0,
    totalCost: 0,
    totalCostWithWastage: 0,
    breakdown: {
      timber: 0,
      covering: 0,
      accessories: 0,
      insulation: 0,
      underlayment: 0,
    },
    breakdownWithWastage: {
      timber: 0,
      covering: 0,
      accessories: 0,
      insulation: 0,
      underlayment: 0,
    },
    wastage: {
      percentage: 0,
      totalAdjustedItems: 0,
      totalWastageItems: 0,
    },
  });

  // Get wastage percentage from quote settings with fallback
  const getWastagePercentage = useCallback((): number => {
    const wastageSetting = quote?.qsSettings?.wastageRoofing;

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
      return Math.ceil(adjustedQuantity);
    },
    []
  );

  // Calculate timber cross-sectional area in m²
  const parseTimberSize = useCallback((size: TimberSize): number => {
    const sizes: Record<TimberSize, number> = {
      "50x25": 0.05 * 0.025,
      "50x50": 0.05 * 0.05,
      "75x50": 0.075 * 0.05,
      "100x50": 0.1 * 0.05,
      "100x75": 0.1 * 0.075,
      "150x50": 0.15 * 0.05,
      "200x50": 0.2 * 0.05,
    };
    return sizes[size] || 0;
  }, []);

  // Updated getMaterialPrice function in useRoofingCalculator.ts
  const getMaterialPrice = useCallback(
    (category: string, type?: string, attributes?: any): number => {
      if (!materialPrices || !Array.isArray(materialPrices)) return 0;

      try {
        // Helper function to find material by name
        const findMaterialByName = (name: string) => {
          return materialPrices.find((item) =>
            item.name?.toLowerCase().includes(name.toLowerCase())
          );
        };

        switch (category) {
          case "timber":
            const timberMaterial = findMaterialByName("Timber");
            if (!timberMaterial?.type || !Array.isArray(timberMaterial.type))
              return 0;

            const timberType = timberMaterial.type.find(
              (t: any) =>
                t.size === attributes?.size ||
                t.name?.toLowerCase().includes(attributes?.size?.toLowerCase())
            );
            return timberType?.price || timberMaterial.price || 0;

          case "roofCovering":
            const roofMaterial = findMaterialByName("Roof-Covering");
            if (!roofMaterial?.type || !Array.isArray(roofMaterial.type))
              return 0;

            const coveringType = roofMaterial.type.find(
              (c: any) =>
                c.type === type ||
                c.name?.toLowerCase().includes(type?.toLowerCase())
            );
            return coveringType?.price || roofMaterial.price || 0;

          case "underlayment":
            const underlaymentMaterial = findMaterialByName("UnderLayment");
            if (
              !underlaymentMaterial?.type ||
              !Array.isArray(underlaymentMaterial.type)
            )
              return 0;

            const underlaymentType = underlaymentMaterial.type.find(
              (u: any) =>
                u.type === type ||
                u.name?.toLowerCase().includes(type?.toLowerCase())
            );
            return underlaymentType?.price || underlaymentMaterial.price || 0;

          case "insulation":
            const insulationMaterial = findMaterialByName("Insulation");
            if (
              !insulationMaterial?.type ||
              !Array.isArray(insulationMaterial.type)
            )
              return 0;

            const insulationType = insulationMaterial.type.find(
              (i: any) =>
                i.type === type ||
                i.name?.toLowerCase().includes(type?.toLowerCase())
            );
            return insulationType?.price || insulationMaterial.price || 0;

          case "accesories":
            const accessoriesMaterial = findMaterialByName("Accesories");
            if (
              !accessoriesMaterial?.type ||
              typeof accessoriesMaterial.type !== "object"
            )
              return 0;

            const accessoryTypes = accessoriesMaterial.type as Record<
              string,
              any[]
            >;

            switch (type) {
              case "gutters":
                const gutters = accessoryTypes.gutters || [];
                const gutter = gutters.find(
                  (g: any) => g.type === attributes || g.material === attributes
                );
                return gutter?.price || gutters[0]?.price || 0;

              case "downpipes":
                const downpipes = accessoryTypes.downpipes || [];
                const downpipe = downpipes.find(
                  (d: any) => d.type === attributes || d.material === attributes
                );
                return downpipe?.price || downpipes[0]?.price || 0;

              case "flashings":
                const flashings = accessoryTypes.flashings || [];
                const flashing = flashings.find(
                  (f: any) => f.material === attributes || f.type === attributes
                );
                return flashing?.price || flashings[0]?.price || 0;

              case "fascia":
                const fascia = accessoryTypes.fascia || [];
                const fasciaItem = fascia.find(
                  (f: any) => f.material === attributes || f.type === attributes
                );
                return fasciaItem?.price || fascia[0]?.price || 0;

              case "soffit":
                const soffit = accessoryTypes.soffit || [];
                const soffitItem = soffit.find(
                  (s: any) => s.material === attributes || s.type === attributes
                );
                return soffitItem?.price || soffit[0]?.price || 0;

              case "ridgeCaps":
                const ridgeCaps = accessoryTypes.ridgeCaps || [];
                const ridgeCap = ridgeCaps.find(
                  (r: any) => r.material === attributes || r.type === attributes
                );
                return ridgeCap?.price || ridgeCaps[0]?.price || 0;

              case "valleyTrays":
                const valleyTrays = accessoryTypes.valleyTrays || [];
                const valleyTray = valleyTrays.find(
                  (v: any) => v.material === attributes || v.type === attributes
                );
                return valleyTray?.price || valleyTrays[0]?.price || 0;

              default:
                return 0;
            }

          default:
            return 0;
        }
      } catch (error) {
        console.error("Error getting material price:", error);
        return 0;
      }
    },
    [materialPrices]
  );

  // Calculate roof area with pitch factor
  const calculatePitchedArea = useCallback(
    (area: number, pitch: number): number => {
      const pitchFactor = 1 / Math.cos((pitch * Math.PI) / 180);
      return area * pitchFactor;
    },
    []
  );

  // Calculate timber volume for a roof structure - NOW WITH WASTAGE
  const calculateTimberVolume = useCallback(
    (
      roof: RoofStructure,
      wastagePercentage: number
    ): {
      volume: number;
      adjustedQuantities: Array<{
        id: string;
        originalQuantity: number;
        adjustedQuantity: number;
        wastageAmount: number;
      }>;
      materialCost: number;
    } => {
      const timberCalculations = roof.timbers.map((timber) => {
        const crossSection = parseTimberSize(timber.size);

        // Apply wastage to quantity and round up
        const adjustedQuantity = applyWastageToQuantity(
          timber.quantity,
          wastagePercentage
        );
        const wastageAmount = adjustedQuantity - timber.quantity;

        const volume = crossSection * timber.length * adjustedQuantity;
        const pricePerCubicMeter = getMaterialPrice("timber", undefined, {
          size: timber.size,
        });
        const materialCost = volume * pricePerCubicMeter;

        return {
          id: timber.id,
          originalQuantity: timber.quantity,
          adjustedQuantity,
          wastageAmount,
          volume,
          materialCost,
        };
      });

      const totalVolume = timberCalculations.reduce(
        (sum, calc) => sum + calc.volume,
        0
      );
      const totalMaterialCost = timberCalculations.reduce(
        (sum, calc) => sum + calc.materialCost,
        0
      );

      return {
        volume: totalVolume,
        adjustedQuantities: timberCalculations.map((calc) => ({
          id: calc.id,
          originalQuantity: calc.originalQuantity,
          adjustedQuantity: calc.adjustedQuantity,
          wastageAmount: calc.wastageAmount,
        })),
        materialCost: totalMaterialCost,
      };
    },
    [parseTimberSize, applyWastageToQuantity, getMaterialPrice]
  );

  // Calculate covering area with wastage
  const calculateCoveringArea = useCallback(
    (roof: RoofStructure, wastagePercentage: number): number => {
      return roof.area * (1 + wastagePercentage);
    },
    []
  );

  // Apply wastage to breakdown
  const applyWastageToBreakdown = useCallback(
    (breakdown: any, wastagePercentage: number) => {
      return {
        timber: breakdown.timber * (1 + wastagePercentage),
        covering: breakdown.covering * (1 + wastagePercentage),
        accessories: breakdown.accessories * (1 + wastagePercentage),
        insulation: breakdown.insulation * (1 + wastagePercentage),
        underlayment: breakdown.underlayment * (1 + wastagePercentage),
      };
    },
    []
  );

  // Updated calculation section in useRoofingCalculator.ts
  const calculateRoofStructure = useCallback(
    (roof: RoofStructure): RoofingCalculation => {
      const wastagePercentage = getWastagePercentage();

      // Calculate timber with wastage
      const timberCalculation = calculateTimberVolume(roof, wastagePercentage);
      const timberVolume = timberCalculation.volume;
      const timberMaterialCost = timberCalculation.materialCost;

      // Calculate covering with wastage
      const coveringArea = calculateCoveringArea(roof, wastagePercentage);

      // Calculate covering cost
      const coveringPrice = getMaterialPrice("roofCovering", roof.material);
      const coveringMaterialCost = coveringArea * coveringPrice;

      // Calculate covering labor cost
      const coveringLaborRate = 1200; // KES per m²
      const coveringLaborCost = coveringArea * coveringLaborRate;

      // Calculate underlayment cost
      const underlaymentPrice = roof.covering.underlayment
        ? getMaterialPrice("underlayment", roof.covering.underlayment)
        : 0;
      const underlaymentMaterialCost = roof.covering.underlayment
        ? roof.area * underlaymentPrice
        : 0;
      const underlaymentLaborCost = roof.covering.underlayment
        ? roof.area * 300 // KES per m²
        : 0;

      // Calculate insulation cost
      let insulationMaterialCost = 0;
      if (roof.covering.insulation) {
        const insulationPrice = getMaterialPrice(
          "insulation",
          roof.covering.insulation.type
        );
        insulationMaterialCost =
          roof.area *
          insulationPrice *
          ((roof.covering.insulation.thickness * 1000) / 50);
      }

      // Calculate accessory costs with wastage
      const calculateAccessoryCost = (
        lengthOrCount: number,
        price: number,
        wastagePercentage: number
      ) => {
        const adjustedLength = applyWastageToQuantity(
          lengthOrCount,
          wastagePercentage
        );
        const wastageAmount = adjustedLength - lengthOrCount;
        const materialCost = adjustedLength * price;

        return {
          original: lengthOrCount,
          adjusted: adjustedLength,
          wastage: wastageAmount,
          materialCost,
        };
      };

      const gutterCalculation = calculateAccessoryCost(
        roof.accessories?.gutters || 0,
        getMaterialPrice(
          "accesories",
          "gutters",
          roof.accessories?.gutterType || "PVC"
        ),
        wastagePercentage
      );

      const downpipeCalculation = calculateAccessoryCost(
        roof.accessories?.downpipes || 0,
        getMaterialPrice(
          "accesories",
          "downpipes",
          roof.accessories?.downpipeType || "PVC"
        ),
        wastagePercentage
      );

      const flashingCalculation = calculateAccessoryCost(
        roof.accessories?.flashings || 0,
        getMaterialPrice(
          "accesories",
          "flashings",
          roof.accessories?.flashingType || "PVC"
        ),
        wastagePercentage
      );

      const fasciaCalculation = calculateAccessoryCost(
        roof.accessories?.fascia || 0,
        getMaterialPrice(
          "accesories",
          "fascia",
          roof.accessories?.fasciaType || "PVC"
        ),
        wastagePercentage
      );

      const soffitCalculation = calculateAccessoryCost(
        roof.accessories?.soffit || 0,
        getMaterialPrice(
          "accesories",
          "soffit",
          roof.accessories?.soffitType || "PVC"
        ),
        wastagePercentage
      );

      const ridgeCapsCalculation = calculateAccessoryCost(
        roof.accessories?.ridgeCaps || 0,
        getMaterialPrice("accesories", "ridgeCaps", "Concrete"),
        wastagePercentage
      );

      const valleyTraysCalculation = calculateAccessoryCost(
        roof.accessories?.valleyTrays || 0,
        getMaterialPrice("accesories", "valleyTrays", "Galvanized Steel"),
        wastagePercentage
      );

      const accessoriesMaterialCost =
        gutterCalculation.materialCost +
        downpipeCalculation.materialCost +
        flashingCalculation.materialCost +
        fasciaCalculation.materialCost +
        soffitCalculation.materialCost +
        ridgeCapsCalculation.materialCost +
        valleyTraysCalculation.materialCost;

      // Calculate total costs
      const materialCost =
        timberMaterialCost +
        coveringMaterialCost +
        accessoriesMaterialCost +
        insulationMaterialCost +
        underlaymentMaterialCost;

      const materialCostWithWastage = materialCost; // Already includes wastage in quantities

      const totalCostWithoutWastage = materialCost;
      const totalCostWithWastage = totalCostWithoutWastage; // Already includes wastage in quantities

      // Calculate efficiency metrics
      const theoreticalTimberVolume = roof.area * 0.05; // 50mm average thickness
      const materialUtilization =
        theoreticalTimberVolume > 0
          ? (timberVolume / theoreticalTimberVolume) * 100
          : 100;

      // Calculate wastage details
      const totalWastageItems =
        timberCalculation.adjustedQuantities.reduce(
          (sum, timber) => sum + timber.wastageAmount,
          0
        ) +
        gutterCalculation.wastage +
        downpipeCalculation.wastage +
        flashingCalculation.wastage +
        fasciaCalculation.wastage +
        soffitCalculation.wastage +
        ridgeCapsCalculation.wastage +
        valleyTraysCalculation.wastage;

      // Calculate breakdowns
      const breakdown = {
        timber: timberMaterialCost,
        covering: coveringMaterialCost,
        accessories: accessoriesMaterialCost,
        insulation: insulationMaterialCost,
        underlayment: underlaymentMaterialCost,
      };

      const breakdownWithWastage = applyWastageToBreakdown(
        breakdown,
        wastagePercentage
      );

      return {
        id: roof.id,
        name: roof.name,
        type: roof.type,
        material: roof.material,
        area: roof.area,
        totalTimberVolume: timberVolume,
        coveringArea,
        materialCost,
        materialCostWithWastage,
        totalCost: totalCostWithoutWastage,
        totalCostWithWastage,
        breakdown,
        breakdownWithWastage,
        efficiency: {
          materialUtilization: Math.min(100, materialUtilization),
          wastePercentage: wastagePercentage * 100, // Convert to percentage
        },
        wastage: {
          percentage: wastagePercentage,
          adjustedQuantities: {
            timbers: timberCalculation.adjustedQuantities,
            accessories: {
              gutters: {
                original: gutterCalculation.original,
                adjusted: gutterCalculation.adjusted,
                wastage: gutterCalculation.wastage,
              },
              downpipes: {
                original: downpipeCalculation.original,
                adjusted: downpipeCalculation.adjusted,
                wastage: downpipeCalculation.wastage,
              },
              flashings: {
                original: flashingCalculation.original,
                adjusted: flashingCalculation.adjusted,
                wastage: flashingCalculation.wastage,
              },
              fascia: {
                original: fasciaCalculation.original,
                adjusted: fasciaCalculation.adjusted,
                wastage: fasciaCalculation.wastage,
              },
              soffit: {
                original: soffitCalculation.original,
                adjusted: soffitCalculation.adjusted,
                wastage: soffitCalculation.wastage,
              },
              ridgeCaps: {
                original: ridgeCapsCalculation.original,
                adjusted: ridgeCapsCalculation.adjusted,
                wastage: ridgeCapsCalculation.wastage,
              },
              valleyTrays: {
                original: valleyTraysCalculation.original,
                adjusted: valleyTraysCalculation.adjusted,
                wastage: valleyTraysCalculation.wastage,
              },
            },
          },
          totalWastageItems,
        },
      };
    },
    [
      getWastagePercentage,
      calculateTimberVolume,
      calculateCoveringArea,
      getMaterialPrice,
      applyWastageToQuantity,
      applyWastageToBreakdown,
    ]
  );

  // Calculate all roof structures
  const calculateAll = useCallback(() => {
    const calculatedResults = roofStructures.map(calculateRoofStructure);
    setCalculations(calculatedResults);

    const wastagePercentage = getWastagePercentage();

    // Calculate totals
    const newTotals = calculatedResults.reduce(
      (acc, curr) => ({
        totalArea: acc.totalArea + curr.area,
        totalTimberVolume: acc.totalTimberVolume + curr.totalTimberVolume,
        totalCoveringArea: acc.totalCoveringArea + curr.coveringArea,
        totalMaterialCost: acc.totalMaterialCost + curr.materialCost,
        totalMaterialCostWithWastage:
          acc.totalMaterialCostWithWastage + curr.materialCostWithWastage,
        totalCost: acc.totalCost + curr.totalCost,
        totalCostWithWastage:
          acc.totalCostWithWastage + curr.totalCostWithWastage,
        breakdown: {
          timber: acc.breakdown.timber + curr.breakdown.timber,
          covering: acc.breakdown.covering + curr.breakdown.covering,
          accessories: acc.breakdown.accessories + curr.breakdown.accessories,
          insulation:
            acc.breakdown.insulation + (curr.breakdown.insulation || 0),
          underlayment:
            acc.breakdown.underlayment + (curr.breakdown.underlayment || 0),
        },
        breakdownWithWastage: {
          timber:
            acc.breakdownWithWastage.timber + curr.breakdownWithWastage.timber,
          covering:
            acc.breakdownWithWastage.covering +
            curr.breakdownWithWastage.covering,
          accessories:
            acc.breakdownWithWastage.accessories +
            curr.breakdownWithWastage.accessories,
          insulation:
            acc.breakdownWithWastage.insulation +
            (curr.breakdownWithWastage.insulation || 0),
          underlayment:
            acc.breakdownWithWastage.underlayment +
            (curr.breakdownWithWastage.underlayment || 0),
        },
        wastage: {
          percentage: wastagePercentage,
          totalAdjustedItems:
            acc.wastage.totalAdjustedItems +
            curr.wastage.adjustedQuantities.timbers.reduce(
              (sum, timber) => sum + timber.adjustedQuantity,
              0
            ) +
            curr.wastage.adjustedQuantities.accessories.gutters.adjusted +
            curr.wastage.adjustedQuantities.accessories.downpipes.adjusted +
            curr.wastage.adjustedQuantities.accessories.flashings.adjusted +
            curr.wastage.adjustedQuantities.accessories.fascia.adjusted +
            curr.wastage.adjustedQuantities.accessories.soffit.adjusted +
            curr.wastage.adjustedQuantities.accessories.ridgeCaps.adjusted +
            curr.wastage.adjustedQuantities.accessories.valleyTrays.adjusted,
          totalWastageItems:
            acc.wastage.totalWastageItems + curr.wastage.totalWastageItems,
        },
      }),
      {
        totalArea: 0,
        totalTimberVolume: 0,
        totalCoveringArea: 0,
        totalMaterialCost: 0,
        totalMaterialCostWithWastage: 0,
        totalCost: 0,
        totalCostWithWastage: 0,
        breakdown: {
          timber: 0,
          covering: 0,
          accessories: 0,
          insulation: 0,
          underlayment: 0,
        },
        breakdownWithWastage: {
          timber: 0,
          covering: 0,
          accessories: 0,
          insulation: 0,
          underlayment: 0,
        },
        wastage: {
          percentage: wastagePercentage,
          totalAdjustedItems: 0,
          totalWastageItems: 0,
        },
      }
    );

    setTotals(newTotals);
  }, [roofStructures, calculateRoofStructure, getWastagePercentage]);

  // Recalculate when dependencies change
  useEffect(() => {
    if (roofStructures?.length > 0 && materialPrices) {
      calculateAll();
    } else {
      setCalculations([]);
      setTotals({
        totalArea: 0,
        totalTimberVolume: 0,
        totalCoveringArea: 0,
        totalMaterialCost: 0,
        totalMaterialCostWithWastage: 0,
        totalCost: 0,
        totalCostWithWastage: 0,
        breakdown: {
          timber: 0,
          covering: 0,
          accessories: 0,
          insulation: 0,
          underlayment: 0,
        },
        breakdownWithWastage: {
          timber: 0,
          covering: 0,
          accessories: 0,
          insulation: 0,
          underlayment: 0,
        },
        wastage: {
          percentage: getWastagePercentage(),
          totalAdjustedItems: 0,
          totalWastageItems: 0,
        },
      });
    }
  }, [roofStructures, materialPrices, calculateAll, getWastagePercentage]);
  const combined = { ...totals, calculations };

  useEffect(() => {
    setQuoteData((prev: any) => ({
      ...prev,
      roofing_calculations: combined,
    }));
  }, [combined]);

  return {
    calculations,
    totals,
    calculateAll,
    wastagePercentage: getWastagePercentage(),
  };
}

// Helper function to estimate roof area from dimensions
export function estimateRoofArea(
  length: number,
  width: number,
  type: RoofType,
  pitch: number = 30,
  eavesOverhang: number = 0.5
): number {
  const effectiveLength = length + eavesOverhang * 2;
  const effectiveWidth = width + eavesOverhang * 2;

  const baseArea = effectiveLength * effectiveWidth;

  switch (type) {
    case "flat":
      return baseArea;
    case "pitched":
    case "gable":
      const pitchFactor = 1 / Math.cos((pitch * Math.PI) / 180);
      return baseArea * pitchFactor;
    case "hip":
      return baseArea * 1.1; // 10% more for hip roofs
    case "mansard":
      return baseArea * 1.2; // 20% more for mansard roofs
    case "butterfly":
      return baseArea * 1.15; // 15% more for butterfly roofs
    case "skillion":
      const skillionPitchFactor = 1 / Math.cos((pitch * Math.PI) / 180);
      return baseArea * skillionPitchFactor;
    default:
      return baseArea;
  }
}
