// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useCallback, useEffect } from "react";

export type ElectricalSystemType =
  | "lighting"
  | "power"
  | "data"
  | "security"
  | "cctv"
  | "fire-alarm"
  | "access-control"
  | "av-systems"
  | "emergency-lighting"
  | "renewable-energy";

export type CableType =
  | "NYM-J"
  | "PVC/PVC"
  | "XLPE"
  | "MICC"
  | "SWA"
  | "Data-CAT6"
  | "Ethernet"
  | "Fiber-Optic"
  | "Coaxial";

export type OutletType =
  | "power-socket"
  | "light-switch"
  | "dimmer-switch"
  | "data-port"
  | "tv-point"
  | "telephone"
  | "usb-charger"
  | "gpo";

export type LightingType =
  | "led-downlight"
  | "fluorescent"
  | "halogen"
  | "emergency-light"
  | "floodlight"
  | "street-light"
  | "decorative";

export type InstallationMethod =
  | "surface"
  | "concealed"
  | "underground"
  | "trunking";

export interface ElectricalRates {
  installationMethodMultipliers: Record<InstallationMethod, number>;
  gangMultipliers: Record<number, number>;
  controlMultipliers: {
    switch: number;
    dimmer: number;
    sensor: number;
    smart: number;
  };
  emergencyMultiplier: number;
}

export interface CableRun {
  id: string;
  type: CableType;
  size: number; // mm²
  length: number; // meters
  quantity: number;
  circuit: string;
  protection: string;
  installationMethod: InstallationMethod;
}

export interface ElectricalOutlet {
  id: string;
  type: OutletType;
  count: number;
  location: string;
  circuit: string;
  rating: number; // Amps
  gang: number;
  mounting: "surface" | "flush";
}

export interface LightingFixture {
  id: string;
  type: LightingType;
  count: number;
  location: string;
  circuit: string;
  wattage: number;
  controlType: "switch" | "dimmer" | "sensor" | "smart";
  emergency: boolean;
}

export interface DistributionBoard {
  id: string;
  type: "main" | "sub";
  circuits: number;
  rating: number; // Amps
  mounting: "surface" | "flush";
  accessories: string[];
}

export interface ElectricalSystem {
  id: string;
  name: string;
  systemType: ElectricalSystemType;
  cables: CableRun[];
  outlets: ElectricalOutlet[];
  lighting: LightingFixture[];
  distributionBoards: DistributionBoard[];
  protectionDevices: any[];
  voltage: number;
}

export interface ElectricalCalculation {
  id: string;
  name: string;
  systemType: ElectricalSystemType;
  totalCableLength: number;
  totalOutlets: number;
  totalLighting: number;
  materialCost: number;
  totalCost: number;
  breakdown: {
    cables: number;
    outlets: number;
    lighting: number;
    distribution: number;
    protection: number;
    accessories: number;
  };
  efficiency: {
    cableUtilization: number;
    circuitEfficiency: number;
    energyEfficiency: number;
  };
  powerLoad: number; // kW
  wastage: {
    percentage: number;
    adjustedQuantities: {
      cables: Array<{
        id: string;
        originalQuantity: number;
        adjustedQuantity: number;
        wastageAmount: number;
      }>;
      outlets: Array<{
        id: string;
        originalCount: number;
        adjustedCount: number;
        wastageAmount: number;
      }>;
      lighting: Array<{
        id: string;
        originalCount: number;
        adjustedCount: number;
        wastageAmount: number;
      }>;
    };
    totalWastageItems: number;
  };
}

export interface ElectricalTotals {
  totalCableLength: number;
  totalOutlets: number;
  totalLighting: number;
  totalMaterialCost: number;
  totalCost: number;
  totalPowerLoad: number;
  breakdown: {
    cables: number;
    outlets: number;
    lighting: number;
    distribution: number;
    protection: number;
    accessories: number;
  };
  wastage: {
    percentage: number;
    totalAdjustedItems: number;
    totalWastageItems: number;
  };
}

export default function useElectricalCalculator(
  electricalSystems: ElectricalSystem[],
  materialPrices: any[],
  quote: any,
  setQuoteData: (data: any) => void
) {
  const [calculations, setCalculations] = useState<ElectricalCalculation[]>([]);
  const [totals, setTotals] = useState<ElectricalTotals>({
    totalCableLength: 0,
    totalOutlets: 0,
    totalLighting: 0,
    totalMaterialCost: 0,
    totalCost: 0,
    totalPowerLoad: 0,
    breakdown: {
      cables: 0,
      outlets: 0,
      lighting: 0,
      distribution: 0,
      protection: 0,
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
    const wastageSetting = quote?.qsSettings?.wastageElectricals;

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

  type MaterialCategory =
    | "cable"
    | "outlets"
    | "lighting"
    | "distribution-board";

  const getMaterialPrice = useCallback(
    (
      category: MaterialCategory,
      name: string,
      options?: {
        size?: number;
        rating?: number;
        wattage?: number;
        controlType?: string;
      }
    ): number => {
      let price = 0;

      switch (category) {
        case "cable": {
          const cable = materialPrices.find(
            (c) => c.name.toLowerCase() === category.toLowerCase()
          );
          if (!cable) return 0;

          const cableTypes = cable.type || [];
          const cableTypeName = name?.toLowerCase();
          const size = options?.size;

          if (!cableTypeName || !size) return 0;

          const cableType = cableTypes.find(
            (c: any) => c.type?.toLowerCase() === cableTypeName
          );

          if (!cableType) return 0;

          const sizeKeyMM2 = `${size} mm²`;
          const sizeKeyCore = `${size} core`;

          const price =
            cableType.price_kes_per_meter[sizeKeyMM2] ??
            cableType.price_kes_per_meter[sizeKeyCore] ??
            0;

          return price;
        }

        case "outlets": {
          const outlet = materialPrices.find(
            (o) => o.name.toLowerCase() === category.toLowerCase()
          );
          if (!outlet) return 0;

          const outletTypes = outlet.type || [];
          const outletTypeName = name?.toLowerCase();
          const rating = options?.rating;

          if (!outletTypeName || !rating) return 0;

          const outletType = outletTypes.find(
            (t: any) => t.type?.toLowerCase() === outletTypeName
          );

          if (!outletType) {
            console.warn("No outlet type found for", outletTypeName);
            return 0;
          }

          const ratingKey = `${rating} A`;

          const price =
            outletType.price_kes_per_unit?.[ratingKey] ??
            outletType.price_kes_per_unit?.["default"] ??
            0;

          return price;
        }

        case "lighting": {
          const light = materialPrices.find(
            (l) => l.name.toLowerCase() === category.toLowerCase()
          );

          if (!light) return 0;

          const lightTypes = light.type || [];
          const lightTypeName = name?.toLowerCase();
          const wattage = options?.wattage;
          const controlType = options?.controlType;

          if (!lightTypeName || !wattage || !controlType) {
            console.warn("Missing lighting parameters:", {
              lightTypeName,
              wattage,
              controlType,
            });
            return 0;
          }

          const lightType = lightTypes.find(
            (t: any) => t.type?.toLowerCase() === lightTypeName
          );

          if (!lightType) {
            console.warn("No light type found for", lightTypeName);
            return 0;
          }

          const formattedControlType =
            options?.controlType?.charAt(0).toUpperCase() +
            options?.controlType?.slice(1).toLowerCase();

          const key = `${wattage}W - ${formattedControlType}`;
          const price =
            lightType.price_kes_per_unit?.[key] ??
            lightType.price_kes_per_unit?.["default"] ??
            0;

          return price;
        }

        case "distribution-board": {
          const db = materialPrices.find(
            (c) => c.name.toLowerCase() === category.toLowerCase()
          );
          price = db?.price || 0;
          break;
        }

        default:
          price = 0;
      }

      return price;
    },
    [materialPrices]
  );

  const calculateCableCost = useCallback(
    (cable: CableRun, wastagePercentage: number) => {
      const costPerMeter = getMaterialPrice("cable", cable.type, {
        size: cable.size,
      });

      // Apply wastage to quantity and round up
      const adjustedQuantity = applyWastageToQuantity(
        cable.quantity,
        wastagePercentage
      );
      const wastageAmount = adjustedQuantity - cable.quantity;

      const materialCost = cable.length * adjustedQuantity * costPerMeter;
      const id =
        cable.id || `${cable.type}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        id,
        materialCost,
        adjustedQuantity,
        wastageAmount,
        originalQuantity: cable.quantity,
      };
    },
    [getMaterialPrice, applyWastageToQuantity]
  );

  const calculateOutletCost = useCallback(
    (outlet: ElectricalOutlet, wastagePercentage: number) => {
      const costPerUnit = getMaterialPrice("outlets", outlet.type, {
        rating: outlet.rating,
      });

      // Apply wastage to count and round up
      const adjustedCount = applyWastageToQuantity(
        outlet.count,
        wastagePercentage
      );
      const wastageAmount = adjustedCount - outlet.count;

      const materialCost = adjustedCount * costPerUnit;
      const id =
        outlet.id ||
        `${outlet.type}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        id,
        materialCost,
        adjustedCount,
        wastageAmount,
        originalCount: outlet.count,
      };
    },
    [getMaterialPrice, applyWastageToQuantity]
  );

  const calculateLightingCost = useCallback(
    (light: LightingFixture, wastagePercentage: number) => {
      const costPerUnit = getMaterialPrice("lighting", light.type, {
        wattage: light.wattage,
        controlType: light.controlType,
      });

      // Apply wastage to count and round up
      const adjustedCount = applyWastageToQuantity(
        light.count,
        wastagePercentage
      );
      const wastageAmount = adjustedCount - light.count;

      const materialCost = adjustedCount * costPerUnit;
      const id =
        light.id || `${light.type}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        id,
        materialCost,
        adjustedCount,
        wastageAmount,
        originalCount: light.count,
      };
    },
    [getMaterialPrice, applyWastageToQuantity]
  );

  const calculateDBCost = useCallback(
    (db: DistributionBoard) => {
      const cost = getMaterialPrice("distribution-board", "main-db");
      return { materialCost: cost * (db.circuits / 12) };
    },
    [getMaterialPrice]
  );

  const calculatePowerLoad = useCallback((system: ElectricalSystem): number => {
    const lightingLoad = system.lighting.reduce(
      (sum, light) => sum + (light.wattage * light.count) / 1000,
      0
    );
    const outletLoad =
      system.outlets.reduce(
        (sum, outlet) =>
          sum + (outlet.rating * outlet.count * system.voltage) / 1000,
        0
      ) * 0.7;

    return lightingLoad + outletLoad;
  }, []);

  const calculateEfficiencyMetrics = useCallback(
    (system: ElectricalSystem): ElectricalCalculation["efficiency"] => {
      const totalCableLength = system.cables.reduce(
        (sum, cable) => sum + cable.length * cable.quantity,
        0
      );
      const theoreticalLength =
        (system.outlets.length + system.lighting.length) * 20;
      const cableUtilization =
        theoreticalLength > 0
          ? (totalCableLength / theoreticalLength) * 100
          : 100;

      const totalCircuits = system.distributionBoards.reduce(
        (sum, db) => sum + db.circuits,
        0
      );
      const circuitEfficiency =
        totalCircuits > 0
          ? Math.min(
              100,
              ((system.outlets.length + system.lighting.length) /
                totalCircuits) *
                100
            )
          : 100;

      const efficientLights = system.lighting.filter(
        (light) => light.wattage <= 20
      ).length;
      const energyEfficiency =
        system.lighting.length > 0
          ? (efficientLights / system.lighting.length) * 100
          : 100;

      return {
        cableUtilization: Math.min(150, cableUtilization),
        circuitEfficiency: Math.min(100, circuitEfficiency),
        energyEfficiency,
      };
    },
    []
  );

  const calculateElectricalSystem = useCallback(
    (system: ElectricalSystem): ElectricalCalculation => {
      const wastagePercentage = getWastagePercentage();

      // Calculate costs with wastage applied to quantities
      const cableCalculations = system.cables.map((cable) =>
        calculateCableCost(cable, wastagePercentage)
      );
      const cableMaterialCost = cableCalculations.reduce(
        (sum, calc) => sum + calc.materialCost,
        0
      );
      const totalCableLength = system.cables.reduce(
        (sum, cable) => sum + cable.length * cable.quantity,
        0
      );

      const outletCalculations = system.outlets.map((outlet) =>
        calculateOutletCost(outlet, wastagePercentage)
      );
      const outletMaterialCost = outletCalculations.reduce(
        (sum, calc) => sum + calc.materialCost,
        0
      );
      const totalOutlets = system.outlets.reduce(
        (sum, outlet) => sum + outlet.count,
        0
      );

      const lightingCalculations = system.lighting.map((light) =>
        calculateLightingCost(light, wastagePercentage)
      );
      const lightingMaterialCost = lightingCalculations.reduce(
        (sum, calc) => sum + calc.materialCost,
        0
      );
      const totalLighting = system.lighting.reduce(
        (sum, light) => sum + light.count,
        0
      );

      const dbCalculations = system.distributionBoards.map(calculateDBCost);
      const dbMaterialCost = dbCalculations.reduce(
        (sum, calc) => sum + calc.materialCost,
        0
      );

      const materialCost =
        cableMaterialCost +
        outletMaterialCost +
        lightingMaterialCost +
        dbMaterialCost;
      const totalCost = materialCost;
      const powerLoad = calculatePowerLoad(system);
      const efficiency = calculateEfficiencyMetrics(system);

      // Calculate wastage details
      const totalWastageItems =
        cableCalculations.reduce((sum, calc) => sum + calc.wastageAmount, 0) +
        outletCalculations.reduce((sum, calc) => sum + calc.wastageAmount, 0) +
        lightingCalculations.reduce((sum, calc) => sum + calc.wastageAmount, 0);

      return {
        id: system.id,
        name: system.name,
        systemType: system.systemType,
        totalCableLength,
        totalOutlets,
        totalLighting,
        materialCost,
        totalCost,
        breakdown: {
          cables: cableMaterialCost,
          outlets: outletMaterialCost,
          lighting: lightingMaterialCost,
          distribution: dbMaterialCost,
          protection: materialCost * 0.03,
          accessories: materialCost * 0.08,
        },
        efficiency,
        powerLoad,
        wastage: {
          percentage: wastagePercentage,
          adjustedQuantities: {
            cables: cableCalculations.map((calc) => ({
              id: calc.id,
              originalQuantity: calc.originalQuantity,
              adjustedQuantity: calc.adjustedQuantity,
              wastageAmount: calc.wastageAmount,
            })),
            outlets: outletCalculations.map((calc) => ({
              id: calc.id,
              originalCount: calc.originalCount,
              adjustedCount: calc.adjustedCount,
              wastageAmount: calc.wastageAmount,
            })),
            lighting: lightingCalculations.map((calc) => ({
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
      calculateCableCost,
      calculateOutletCost,
      calculateLightingCost,
      calculateDBCost,
      calculatePowerLoad,
      calculateEfficiencyMetrics,
    ]
  );

  const calculateAll = useCallback(() => {
    const calculatedResults = electricalSystems.map(calculateElectricalSystem);
    setCalculations(calculatedResults);

    const wastagePercentage = getWastagePercentage();

    const newTotals = calculatedResults.reduce(
      (acc, curr) => ({
        totalCableLength: acc.totalCableLength + curr.totalCableLength,
        totalOutlets: acc.totalOutlets + curr.totalOutlets,
        totalLighting: acc.totalLighting + curr.totalLighting,
        totalMaterialCost: acc.totalMaterialCost + curr.materialCost,
        totalCost: acc.totalCost + curr.totalCost,
        totalPowerLoad: acc.totalPowerLoad + curr.powerLoad,
        breakdown: {
          cables: acc.breakdown.cables + curr.breakdown.cables,
          outlets: acc.breakdown.outlets + curr.breakdown.outlets,
          lighting: acc.breakdown.lighting + curr.breakdown.lighting,
          distribution:
            acc.breakdown.distribution + curr.breakdown.distribution,
          protection: acc.breakdown.protection + curr.breakdown.protection,
          accessories: acc.breakdown.accessories + curr.breakdown.accessories,
        },
        wastage: {
          percentage: wastagePercentage,
          totalAdjustedItems:
            acc.wastage.totalAdjustedItems +
            (curr.totalOutlets +
              curr.totalLighting +
              curr.wastage.adjustedQuantities.cables.reduce(
                (sum, cable) => sum + cable.adjustedQuantity,
                0
              )),
          totalWastageItems:
            acc.wastage.totalWastageItems + curr.wastage.totalWastageItems,
        },
      }),
      {
        totalCableLength: 0,
        totalOutlets: 0,
        totalLighting: 0,
        totalMaterialCost: 0,
        totalCost: 0,
        totalPowerLoad: 0,
        breakdown: {
          cables: 0,
          outlets: 0,
          lighting: 0,
          distribution: 0,
          protection: 0,
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
  }, [electricalSystems, calculateElectricalSystem, getWastagePercentage]);

  useEffect(() => {
    if (electricalSystems?.length > 0) calculateAll();
  }, [electricalSystems, calculateAll]);
  const combined = { ...totals, calculations };

  useEffect(() => {
    setQuoteData((prev: any) => ({
      ...prev,
      electrical_calculations: combined,
    }));
  }, [combined]);

  return {
    calculations,
    totals,
    calculateAll,
    wastagePercentage: getWastagePercentage(),
  };
}

// Helper function to estimate cable requirements
export function estimateCableRequirements(
  outlets: ElectricalOutlet[],
  lighting: LightingFixture[]
): number {
  const averageLengthPerPoint = 18;
  const totalPoints =
    outlets.reduce((sum, outlet) => sum + outlet.count, 0) +
    lighting.reduce((sum, light) => sum + light.count, 0);
  return totalPoints * averageLengthPerPoint;
}
