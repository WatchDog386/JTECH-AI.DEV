// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  RegionalMultiplier,
  useDynamicPricing,
} from "@/hooks/useDynamicPricing";
import { useUserSettings } from "@/hooks/useUserSettings";
import { EquipmentType } from "@/hooks/useUserSettings";
import { AdditionalService } from "@/hooks/useUserSettings";
import { UserEquipmentRate } from "@/hooks/useUserSettings";
import { UserServiceRate } from "@/hooks/useUserSettings";
import { UserSubcontractorRate } from "@/hooks/useUserSettings";
import { UserMaterialPrice } from "@/hooks/useUserSettings";
import { UserTransportRate } from "@/hooks/useUserSettings";
import { useLocation } from "react-router-dom";
import { Sun } from "lucide-react";
import { calculateConcrete } from "./useConcreteCalculator";
import ConcreteCalculatorForm from "@/components/ConcreteCalculatorForm";
import { ElectricalSystem } from "./useElectricalCalculator";
import { PlumbingSystem } from "./usePlumbingCalculator";
import {
  FinishCalculation,
  FinishElement,
} from "./useUniversalFinishesCalculator";
import { RoofStructure } from "./useRoofingCalculator";
import { MasonryQSSettings } from "./useMasonryCalculator";

export interface Material {
  id: string;
  name: string;
  unit: string;
  region: string;
  price: number;
  category: string;
}

export interface EquipmentItem {
  name: string;
  total_cost: number;
  equipment_type_id: string;
  rate_per_unit?: number;
  usage_quantity: number;
  usage_unit: string;
}

export interface Percentage {
  labour: number;
  overhead: number;
  profit: number;
  contingency: number;
  labourMode: "percent" | "cash";
  overheadMode: "percent" | "cash";
  profitMode: "percent" | "cash";
  contingencyMode: "percent" | "cash";
}

export interface Subcontractors {
  id: string;
  name: string;
  subcontractor_payment_plan: string;
  price: number;
  days: number;
  total: number;
}

export interface Addons {
  name: string;
  price: number;
}

export interface QuoteCalculation {
  rooms: Array<{
    room_name: string;
    length: string;
    width: string;
    height: string;
    doors: any[];
    windows: any[];
    blockType: string;
    thickness: string;
    customBlock: {
      price: string;
      height: string;
      length: string;
      thickness: string;
    };
    roomArea: number;
    plasterArea: number;
    openings: number;
    netArea: number;
    blocks: number;
    mortar: number;
    plaster: string;
    blockCost: number;
    mortarCost: number;
    plasterCost: number;
    openingsCost: number;
    cementBags: number;
    cementCost: number;
    sandVolume: number;
    sandCost: number;
    stoneVolume: number;
    totalCost: number;
  }>;
  id: string;
  user_id: string;
  title: string;
  client_name: string;
  client_email: string;
  contractor_name?: string;
  company_name?: string;
  house_type: string;
  location: string;
  subcontractors: Subcontractors[];
  custom_specs: string;
  qsSettings: any;
  external_works: any[];
  floors: number;
  status: string;
  concrete_rows: Array<{
    id: string;
    name: string;
    element: string;
    length: string;
    width: string;
    height: string;
    mix: string;
    formwork: string;
    category: string;
    number: string;
    hasConcreteBed: boolean;
    bedDepth: string;
    hasAggregateBed: boolean;
    aggregateDepth: string;
    hasMasonryWall: boolean;
    masonryBlockType?: string;
    masonryBlockDimensions?: string;
    masonryWallThickness?: string;
    masonryWallHeight?: string;
    masonryWallPerimeter?: string;
    foundationType?: string;
    clientProvidesWater: boolean;
    cementWaterRatio: string;
    reinforcement: {
      mainBarSize: string;
      mainBarSpacing: string;
    };
    staircaseDetails?: any;
    tankDetails?: any;
  }>;

  rebar_rows: Array<{
    id: string;
    element: string;
    name: string;
    length: string;
    width: string;
    depth: string;
    mainBarSize: string;
    mainBarSpacing: string;
    distributionBarSize?: string;
    distributionBarSpacing?: string;
  }>;

  mortar_ratio: string;
  concrete_mix_ratio: string;
  plaster_thickness: number;
  electrical_systems: ElectricalSystem[];
  plumbing_systems: PlumbingSystem[];
  finishes: FinishElement[];
  roof_structures: RoofStructure[];
  electrical_calculations: any[];
  plumbing_calculations: any[];
  finishes_calculations: any[];
  roofing_calculations: any[];
  include_wastage: boolean;
  equipment: EquipmentItem[];
  services: AdditionalService[];
  boqData: any[];
  boq_data: any[];
  distance_km: number;
  percentages: Percentage[];
  contract_type: "full_contract" | "labor_only";
  region: string;
  materials_cost: number;
  masonry_materials: any;
  concrete_materials: any[];
  rebar_calculations: any[];
  preliminaries: any[];
  earthwork: any[];
  total_wall_area: number;
  total_concrete_volume: number;
  total_formwork_area: number;
  total_rebar_weight: number;
  total_plaster_volume: number;
  project_type: string;
  equipment_costs: number;
  additional_services_cost: number;
  transport_costs: number;
  show_profit_to_client: boolean;
  labor_percentages: number;
  overhead_percentages: number;
  profit_percentages: number;
  contingency_percentages: number;
  permit_cost: number;
  foundationDetails: {};
}

export interface CalculationResult {
  labor_cost: number;
  subcontractors_profit: number;
  subcontractors_cost: number;
  material_profits: number;
  equipment_cost: number;
  transport_cost: number;
  selected_services_cost: number;
  distance_km: number;
  permit_cost: number;
  contract_type: string;
  contingency_amount: number;
  subtotal: number;
  overhead_amount: number;
  profit_amount: number;
  total_amount: number;
  materials_cost: number;
  preliminariesCost: number;
  regional_multiplier: number;
  subcontractors: Subcontractors[];
  percentages: Percentage[];
  materialPrices: Material[];
  qsSettings: MasonryQSSettings[];
  labor: Array<{
    type: string;
    percentage: number;
    cost: number;
  }>;
  equipment: Array<{
    name: string;
    total_cost: number;
  }>;
  services: Array<{
    name: string;
    price: number;
  }>;
}

export type FullQuoteCalculation = QuoteCalculation & CalculationResult;

export const useQuoteCalculations = () => {
  const [region, setRegion] = useState(null);
  const updateRegion = (newRegion) => setRegion(newRegion);

  const { user, profile } = useAuth();
  const [services, setServices] = useState<UserServiceRate[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [subContractors, setSubcontractors] = useState<Subcontractors[]>([]);
  const location = useLocation();
  const [equipmentRates, setEquipmentRates] = useState<UserEquipmentRate[]>([]);
  const [regionalMultipliers] = useState<RegionalMultiplier[]>([]);

  const fetchMaterials = useCallback(async () => {
    const { data: baseMaterials, error: baseError } = await supabase
      .from("material_base_prices")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_material_prices")
      .select("material_id, region, price")
      .eq("user_id", profile.id);
    if (baseError) console.error("Base materials error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);
    const merged = baseMaterials.map((material) => {
      const userRegion = region || "Nairobi";
      const userRate = overrides?.find(
        (o) => o.material_id === material.id && o.region === userRegion
      );
      const price = userRate ? userRate.price : material.price ?? 0;
      const multiplier =
        regionalMultipliers.find((r) => r.region === userRegion)?.multiplier ||
        1;
      const result = price * multiplier;
      return {
        ...material,
        result,
        source: userRate ? "user" : material.price != null ? "base" : "none",
      };
    });
    setMaterials(merged);
  }, [user, location, location.key]);

  const fetchServices = useCallback(async () => {
    const { data: baseServices, error: baseError } = await supabase
      .from("additional_services")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_service_rates")
      .select("service_id, price")
      .eq("user_id", profile?.id);
    if (baseError) console.error("Base services error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);
    const merged = baseServices.map((service) => {
      const userRate = overrides?.find((o) => o.service_id === service.id);
      const price = userRate ? userRate.price : service.price ?? 0;
      return {
        ...service,
        price,
        source: userRate ? "user" : service.price != null ? "base" : "none",
      };
    });
    setServices(merged);
  }, [user, profile, location.key]);

  const fetchRates = async () => {
    const { data: baseServices, error: baseError } = await supabase
      .from("subcontractor_prices")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_subcontractor_rates")
      .select("service_id, price")
      .eq("user_id", profile.id);
    if (baseError) console.error("Base rates error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);
    const merged = baseServices.map((service) => {
      const userRate = overrides?.find((o) => o.service_id === service.id);
      const rate = userRate
        ? Number(userRate.price)
        : service.price != null
        ? Number(service.price)
        : 0;
      return {
        ...service,
        price: rate,
        unit: service.unit ?? "unit",
        source: userRate ? "user" : service.price != null ? "base" : "none",
      };
    });
    setSubcontractors(merged);
  };

  const fetchEquipment = useCallback(async () => {
    const { data: baseEquipment, error: baseError } = await supabase
      .from("equipment_types")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_equipment_rates")
      .select("equipment_type_id, total_cost")
      .eq("user_id", profile.id);
    if (baseError) console.error("Base equipment error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);
    const merged = baseEquipment.map((equipment) => {
      const userRate = overrides?.find(
        (o) => o.equipment_type_id === equipment.id
      );
      const rate = userRate ? userRate.total_cost : equipment.total_cost ?? 0;
      return {
        ...equipment,
        total_cost: rate,
        source: userRate
          ? "user"
          : equipment.total_cost != null
          ? "base"
          : "none",
      };
    });
    setEquipmentRates(merged);
  }, [user, location.key]);

  useEffect(() => {
    if (user && profile !== null) {
      fetchMaterials();
      fetchServices();
      fetchEquipment();
      fetchRates();
    }
  }, [user, profile, location.key]);

  const calculateQuote = async (
    params: QuoteCalculation
  ): Promise<CalculationResult> => {
    if (!user || !profile) throw new Error("User not authenticated");
    setLoading(true);
    try {
      const {
        include_wastage,
        boqData,
        equipment,
        location,
        boq_data,
        transport_costs,
        services,
        region,
        subcontractors,
        distance_km,
        permit_cost,
        contract_type,
        preliminaries,
        qsSettings,
      } = params;

      // Get percentage settings from either percentages array or qsSettings
      const percentageSettings =
        params.percentages && params.percentages.length > 0
          ? params.percentages[0]
          : {
              labour: params.labor_percentages || 0,
              overhead: params.overhead_percentages || 0,
              profit: params.profit_percentages || 0,
              contingency: params.contingency_percentages || 0,
              labourMode: "percent" as const,
              overheadMode: "percent" as const,
              profitMode: "percent" as const,
              contingencyMode: "percent" as const,
            };

      const calculatePreliminariesTotal = (): number => {
        if (!Array.isArray(preliminaries)) return 0;
        return preliminaries.reduce((total, prelim) => {
          return (
            total +
            prelim.items.reduce((subTotal, item) => {
              if (item.isHeader) return subTotal;
              return subTotal + (item.amount || 0);
            }, 0)
          );
        }, 0);
      };

      const calculateMaterialTotals = (): number => {
        let total = 0;
        const boqItems = params.boqData || params.boq_data || [];
        if (boqItems) {
          boqItems.forEach((section) => {
            section.items.forEach((item) => {
              if (!item.isHeader) {
                total += item.amount || 0;
              }
            });
          });
        }
        return total;
      };

      const materials_cost = calculateMaterialTotals();
      const preliminariesCost = calculatePreliminariesTotal();

      // Calculate material profits based on profit mode
      const materialProfits =
        qsSettings?.financialModes?.profit === "percentage"
          ? materials_cost * (percentageSettings.profit / 100)
          : 0; // If profit is fixed, material profits are handled separately

      const equipmentCost = equipment.reduce((total, item) => {
        return total + item.total_cost;
      }, 0);

      const selectedSubcontractors = subcontractors ?? [];
      const { updatedSubcontractors, subcontractorRates, subcontractorProfit } =
        (() => {
          let totalAll = 0;
          let profitSub = 0;
          const updated = selectedSubcontractors.map((sub) => {
            let total = 0;
            if (sub.subcontractor_payment_plan?.toLowerCase() === "daily") {
              total = (Number(sub.price) || 10) * (Number(sub.days) || 0);
            } else if (
              sub.subcontractor_payment_plan?.toLowerCase() === "full"
            ) {
              total = Number(sub.total) || 0;
            }
            sub.total = total;

            // Calculate subcontractor profit based on profit mode
            if (qsSettings?.financialModes?.profit === "percentage") {
              profitSub += total * (percentageSettings.profit / 100);
            }

            totalAll += total;
            return {
              ...sub,
              total,
            };
          });
          return {
            updatedSubcontractors: updated,
            subcontractorRates: totalAll,
            subcontractorProfit: profitSub,
          };
        })();

      const servicesCost = services.reduce((total, s) => {
        return total + (s.price ?? 0);
      }, 0);

      // Handle permit cost based on mode (if stored in qsSettings)
      const permitCostMode = qsSettings?.financialModes?.permit_cost;
      const permitCost =
        permitCostMode === "percentage"
          ? permit_cost || 0
          : qsSettings?.permit_cost_fixed || 0;
      const laborCost =
        qsSettings?.financialModes?.labour === "percentage"
          ? Math.round(materials_cost * (percentageSettings.labour / 100))
          : qsSettings?.labour_fixed || 0;

      // Calculate subtotal based on contract type
      let subtotalBeforeExtras;
      if (contract_type === "full_contract") {
        subtotalBeforeExtras =
          materials_cost + laborCost + subcontractorRates + preliminariesCost;
      } else {
        subtotalBeforeExtras =
          laborCost + preliminariesCost + subcontractorRates;
      }

      // Calculate overhead based on mode
      const overheadAmount =
        qsSettings?.financialModes?.overhead === "percentage"
          ? Math.round(
              subtotalBeforeExtras * (percentageSettings.overhead / 100)
            )
          : qsSettings?.overhead_fixed || 0;

      // Calculate contingency based on mode
      const contingencyAmount =
        qsSettings?.financialModes?.contingency === "percentage"
          ? Math.round(
              subtotalBeforeExtras * (percentageSettings.contingency / 100)
            )
          : qsSettings?.contingency_fixed || 0;

      // Calculate profit based on mode
      const profitAmount =
        qsSettings?.financialModes?.profit === "percentage"
          ? Math.round(subcontractorProfit + materialProfits)
          : qsSettings?.profit_fixed || 0;

      const subtotalWithExtras =
        subtotalBeforeExtras + overheadAmount + contingencyAmount;
      const totalAmount = Math.round(subtotalWithExtras + profitAmount);

      return {
        labor_cost: laborCost,
        equipment_cost: equipmentCost,
        transport_cost: transport_costs,
        selected_services_cost: servicesCost,
        subcontractors_cost: subcontractorRates,
        subcontractors_profit: subcontractorProfit,
        material_profits: materialProfits,
        distance_km: distance_km,
        permit_cost: permitCost,
        contingency_amount: contingencyAmount,
        subtotal: subtotalBeforeExtras,
        overhead_amount: overheadAmount,
        profit_amount: profitAmount,
        total_amount: totalAmount,
        materials_cost: materials_cost,
        preliminariesCost: preliminariesCost,
        subcontractors: updatedSubcontractors,
        qsSettings: qsSettings,
        percentages: [percentageSettings],
        materialPrices: materials,
        labor: [
          {
            type: "calculated",
            percentage: percentageSettings.labour,
            cost: laborCost,
          },
        ],
        equipment: equipment.map((item) => {
          return {
            ...item,
            total_cost: item.total_cost,
          };
        }),
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price ?? 0,
        })),
        regional_multiplier:
          regionalMultipliers.find((r) => r.region === (region || "Nairobi"))
            ?.multiplier || 1,
        contract_type: contract_type,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    materials,
    equipmentRates,
    services,
    loading,
    updateRegion,
    calculateQuote,
  };
};
