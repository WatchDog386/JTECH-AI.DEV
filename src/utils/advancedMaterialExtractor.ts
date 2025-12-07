// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { BOQSection, MaterialBreakdown } from "@/types/boq";
import {
  geminiService,
  GeminiMaterialResponse,
} from "@/services/geminiService";
import {
  getMaterialConfig,
  getMaterialBreakdown,
  calculateMaterialQuantities,
} from "@/config/materialConfig";
export type MaterialType =
  | "structural-concrete"
  | "structural-steel"
  | "structural-timber"
  | "structural-masonry"
  | "primary"
  | "aggregate"
  | "binding"
  | "auxiliary"
  | "roofing"
  | "insulation"
  | "waterproofing"
  | "cladding"
  | "partition"
  | "ceiling"
  | "flooring"
  | "wall-finish"
  | "plumbing"
  | "electrical"
  | "hvac"
  | "lighting"
  | "door"
  | "window"
  | "cabinet"
  | "hardware"
  | "earthwork"
  | "foundation"
  | "paving"
  | "landscaping"
  | "formwork"
  | "scaffolding"
  | "temporary"
  | "preparatory"
  | "finishing"
  | "painting"
  | "coating"
  | "sealant"
  | "fire-protection"
  | "safety-equipment"
  | "security"
  | "protective"
  | "acoustic"
  | "environmental"
  | "decorative"
  | "signage"
  | "drainage"
  | "utility"
  | "road-base"
  | "reinforcement";
export interface MaterialProperty {
  requirements: string[];
  preparationSteps: string[];
}
export interface MaterialPropertyMap {
  [key: string]: MaterialProperty;
}
export interface CategorizedMaterial {
  itemNo: string;
  category: string;
  element: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  source: string;
  location?: string;
  confidence?: number;
  materialBreakdown?: MaterialBreakdown[];
  materialType?: string;
  workType?: string;
  requirements?: string[];
  preparationSteps?: string[];
  relationships?: Array<{
    material: string;
    type: "requires" | "optional" | "precedes" | "follows";
    description: string;
  }>;
}
export type MaterialSchedule = CategorizedMaterial[];
export class AdvancedMaterialExtractor {
  private static itemCounter = 1;
  private static readonly defaultMaterialProperties: MaterialPropertyMap = {
    "structural-concrete": {
      requirements: [
        "Verify concrete mix design",
        "Check reinforcement details",
        "Monitor curing conditions",
        "Check strength requirements",
      ],
      preparationSteps: [
        "Setup formwork",
        "Place reinforcement",
        "Prepare surface",
        "Check weather conditions",
      ],
    },
    "structural-steel": {
      requirements: [
        "Check steel grade",
        "Verify connection details",
        "Confirm dimensions",
        "Review welding specifications",
      ],
      preparationSteps: [
        "Prepare connections",
        "Check alignment",
        "Setup welding equipment",
        "Verify protective coating",
      ],
    },
    "structural-timber": {
      requirements: [
        "Check moisture content",
        "Verify grade and treatment",
        "Review connection details",
        "Check load specifications",
      ],
      preparationSteps: [
        "Acclimatize material",
        "Prepare joints",
        "Check support conditions",
        "Verify ventilation requirements",
      ],
    },
    "structural-masonry": {
      requirements: [
        "Check unit specifications",
        "Verify mortar mix",
        "Review bond pattern",
        "Check structural requirements",
      ],
      preparationSteps: [
        "Prepare foundation",
        "Setup guides",
        "Mix mortar",
        "Check weather conditions",
      ],
    },
    primary: {
      requirements: [
        "Check material specifications",
        "Store properly",
        "Handle with care",
        "Verify quantities",
      ],
      preparationSteps: [
        "Check material quality",
        "Prepare storage area",
        "Review installation method",
        "Setup handling equipment",
      ],
    },
    aggregate: {
      requirements: [
        "Check gradation",
        "Verify cleanliness",
        "Test moisture content",
        "Check contamination",
      ],
      preparationSteps: [
        "Prepare storage area",
        "Setup washing facility",
        "Arrange stockpiles",
        "Check drainage",
      ],
    },
    binding: {
      requirements: [
        "Store in dry conditions",
        "Use within specified time",
        "Check mix specifications",
        "Monitor temperature",
      ],
      preparationSteps: [
        "Check mixing ratios",
        "Prepare mixing area",
        "Ensure water supply",
        "Setup mixing equipment",
      ],
    },
    roofing: {
      requirements: [
        "Check weather resistance",
        "Verify slope requirements",
        "Check material compatibility",
        "Review warranty conditions",
      ],
      preparationSteps: [
        "Prepare substrate",
        "Check ventilation",
        "Setup safety equipment",
        "Verify drainage",
      ],
    },
    insulation: {
      requirements: [
        "Check R-value",
        "Verify moisture protection",
        "Review fire rating",
        "Check vapor barrier requirements",
      ],
      preparationSteps: [
        "Clean cavity",
        "Check ventilation",
        "Prepare barriers",
        "Setup protection",
      ],
    },
    waterproofing: {
      requirements: [
        "Check product compatibility",
        "Verify coverage rates",
        "Review cure times",
        "Check weather conditions",
      ],
      preparationSteps: [
        "Clean surface",
        "Repair cracks",
        "Apply primer",
        "Setup protection",
      ],
    },
    "wall-finish": {
      requirements: [
        "Check surface preparation",
        "Verify material compatibility",
        "Review application conditions",
        "Check coverage rates",
      ],
      preparationSteps: [
        "Clean surface",
        "Repair defects",
        "Apply primer",
        "Protect adjacent areas",
      ],
    },
    flooring: {
      requirements: [
        "Check substrate condition",
        "Verify moisture levels",
        "Review installation pattern",
        "Check material acclimation",
      ],
      preparationSteps: [
        "Level substrate",
        "Clean surface",
        "Apply primer",
        "Setup layout lines",
      ],
    },
    formwork: {
      requirements: [
        "Check structural stability",
        "Verify dimensions",
        "Review release agents",
        "Check support spacing",
      ],
      preparationSteps: [
        "Clean panels",
        "Apply release agent",
        "Check alignment",
        "Verify bracing",
      ],
    },
    scaffolding: {
      requirements: [
        "Check load capacity",
        "Verify stability",
        "Review safety requirements",
        "Check access requirements",
      ],
      preparationSteps: [
        "Level base",
        "Check components",
        "Install guardrails",
        "Verify ties",
      ],
    },
    finishing: {
      requirements: [
        "Check surface preparation",
        "Verify environmental conditions",
        "Review application method",
        "Check cure times",
      ],
      preparationSteps: [
        "Clean surface",
        "Protect surroundings",
        "Check ventilation",
        "Setup equipment",
      ],
    },
    painting: {
      requirements: [
        "Check paint compatibility",
        "Verify coverage rates",
        "Review environmental conditions",
        "Check color consistency",
      ],
      preparationSteps: [
        "Prepare surface",
        "Mask areas",
        "Check ventilation",
        "Mix paint",
      ],
    },
    preparatory: {
      requirements: [
        "Check surface conditions",
        "Verify site readiness",
        "Review sequence",
        "Check equipment",
      ],
      preparationSteps: [
        "Clean work area",
        "Setup equipment",
        "Verify access",
        "Check safety measures",
      ],
    },
    auxiliary: {
      requirements: [
        "Check compatibility",
        "Verify quantities",
        "Review installation method",
        "Check storage requirements",
      ],
      preparationSteps: [
        "Prepare work area",
        "Setup equipment",
        "Check access",
        "Verify conditions",
      ],
    },
  };
  static async extractWithGemini(quote: any): Promise<MaterialSchedule> {
    try {
      const geminiAnalysis = await geminiService.analyzeMaterials(quote);
      const materials = this.convertGeminiToMaterials(geminiAnalysis);
      return this.consolidateMaterials(materials);
    } catch (error) {
      console.warn(
        "Gemini analysis failed, falling back to local extraction:",
        error
      );
      return error;
    }
  }
  static extractLocally(quote: any): MaterialSchedule {
    try {
      let allMaterials: CategorizedMaterial[] = [];
      if (quote.boqData) {
        try {
          const boqMaterials = this.extractBOQMaterials(quote.boqData);
          allMaterials.push(...boqMaterials);
        } catch (error) {
          console.warn("Error extracting BOQ materials:", error);
        }
      }
      if (quote.concrete_materials) {
        try {
          const concreteMaterials = this.extractConcreteMaterials(
            quote.concrete_materials
          );
          const enhancedConcreteMaterials = concreteMaterials.map(
            (material) => ({
              ...material,
              materialType: "structural-concrete" as MaterialType,
              relationships: [
                {
                  material: "formwork",
                  type: "requires" as const,
                  description: "Requires formwork for casting",
                },
                {
                  material: "reinforcement",
                  type: "requires" as const,
                  description: "Requires steel reinforcement",
                },
              ],
            })
          );
          allMaterials.push(...enhancedConcreteMaterials);
        } catch (error) {
          console.warn("Error extracting concrete materials:", error);
        }
      }
      if (quote.rebar_calculations) {
        try {
          const rebarMaterials = this.extractRebarMaterials(
            quote.rebar_calculations
          );
          const enhancedRebarMaterials = rebarMaterials.map((material) => ({
            ...material,
            materialType: "reinforcement" as MaterialType,
            relationships: [
              {
                material: "binding wire",
                type: "requires" as const,
                description: "Requires binding wire for assembly",
              },
              {
                material: "spacer blocks",
                type: "requires" as const,
                description: "Requires spacer blocks for cover",
              },
            ],
          }));
          allMaterials.push(...enhancedRebarMaterials);
        } catch (error) {
          console.warn("Error extracting rebar materials:", error);
        }
      }
      if (quote.rooms) {
        try {
          const roomMaterials = this.extractRoomMaterials(quote.rooms);
          const enhancedRoomMaterials = roomMaterials.map((material) => {
            const relationships = [];
            if (material.materialType === "masonry") {
              relationships.push(
                {
                  material: "mortar",
                  type: "requires" as const,
                  description: "Requires mortar for bonding",
                },
                {
                  material: "wall ties",
                  type: "requires" as const,
                  description: "Requires wall ties for stability",
                }
              );
            }
            return {
              ...material,
              relationships,
            };
          });
          allMaterials.push(...enhancedRoomMaterials);
        } catch (error) {
          console.warn("Error extracting room materials:", error);
        }
      }
      allMaterials.sort((a, b) => {
        if (a.category === b.category) {
          return a.element.localeCompare(b.element);
        }
        return a.category.localeCompare(b.category);
      });
      allMaterials = allMaterials.map((material) => ({
        ...material,
        quantity: Math.max(0, Number(material.quantity) || 0),
        rate: Math.max(0, Number(material.rate) || 0),
        amount: Math.max(0, Number(material.amount) || 0),
        requirements:
          material.requirements ||
          this.getMaterialRequirements(
            material.category,
            material.materialType as MaterialType
          ),
        preparationSteps:
          material.preparationSteps ||
          this.getPreparationSteps(
            material.category,
            material.materialType as MaterialType
          ),
      }));
      return allMaterials;
    } catch (error) {
      console.error("Error in local extraction:", error);
      return [];
    }
  }
  private static convertGeminiToMaterials(
    analysis: GeminiMaterialResponse
  ): MaterialSchedule {
    return analysis.materials.map((mat) => ({
      itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
      category: mat.category || this.autoCategory(mat.description),
      element: mat.element || this.autoElement(mat.description),
      description: mat.description,
      unit: mat.unit || "Unit",
      quantity: mat.quantity || 0,
      rate: mat.rate || 0,
      amount: mat.amount || 0,
      source: "gemini",
      location: mat.location,
      confidence: mat.confidence,
    }));
  }
  private static extractBOQMaterials(boqData: BOQSection[]): MaterialSchedule {
    const materials: CategorizedMaterial[] = [];
    for (const section of boqData) {
      for (const item of section.items) {
        if (item.isHeader) continue;
        if (item.materialBreakdown?.length) {
          for (const breakdown of item.materialBreakdown) {
            const materialType = this.determineMaterialType(
              breakdown.category,
              breakdown.material
            );
            materials.push({
              itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
              category: breakdown.category,
              element: breakdown.element,
              description: breakdown.material,
              unit: breakdown.unit,
              quantity: item.quantity ? item.quantity * breakdown.ratio : 0,
              rate: item.rate || 0,
              amount:
                (item.rate || 0) *
                (item.quantity ? item.quantity * breakdown.ratio : 0),
              source: "boq",
              location: section.title,
              requirements:
                breakdown.requirements ||
                this.getMaterialRequirements(breakdown.category, materialType),
              preparationSteps:
                breakdown.preparationSteps ||
                this.getPreparationSteps(breakdown.category, materialType),
              relationships: breakdown.relationships || [],
              materialType: breakdown.materialType || materialType,
              workType: item.workType,
            });
          }
          continue;
        }
        const config = getMaterialConfig(item.category?.toLowerCase() || "");
        if (config) {
          const breakdownResult = getMaterialBreakdown(
            item.category || "",
            item.quantity || 0
          );
          if (breakdownResult.errors.length > 0) {
            console.warn("Material breakdown errors:", breakdownResult.errors);
          }
          for (const material of breakdownResult.breakdown) {
            materials.push({
              itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
              category: material.category,
              element: material.element,
              description: material.material,
              unit: material.unit,
              quantity: material.quantity || 0,
              rate: item.rate || 0,
              amount: (item.rate || 0) * (material.quantity || 0),
              source: "boq",
              location: section.title,
              requirements: material.requirements || [],
              preparationSteps: material.preparationSteps || [],
              relationships: material.relationships || [],
              materialType: material.materialType,
              workType: item.workType,
            });
          }
        } else {
          const materialType = this.determineMaterialType(
            item.category || "",
            item.description
          );
          materials.push({
            itemNo: `M${(this.itemCounter++).toString().padStart(3, "0")}`,
            category: item.category || "Unknown",
            element: item.element || "Main Material",
            description: item.description,
            unit: item.unit || "Unit",
            quantity: item.quantity || 0,
            rate: item.rate || 0,
            amount: item.amount || 0,
            source: "boq",
            location: section.title,
            requirements: this.getMaterialRequirements(
              item.category || "",
              materialType
            ),
            preparationSteps: this.getPreparationSteps(
              item.category || "",
              materialType
            ),
            relationships: [],
            materialType,
          });
        }
      }
    }
    return materials;
  }
  private static extractConcreteMaterials(
    concreteMaterials: any[]
  ): MaterialSchedule {
    return concreteMaterials.map((item) => ({
      itemNo: `C${(this.itemCounter++).toString().padStart(3, "0")}`,
      category: this.autoCategory(item.name),
      element: "concrete",
      description: item.name,
      unit: this.autoUnit(item.name),
      quantity: item.quantity || 0,
      rate: item.unit_price || 0,
      amount: item.total_price || 0,
      source: "concrete",
      location: item.location || "General",
    }));
  }
  private static extractRebarMaterials(rebars: any[]): MaterialSchedule {
    return rebars.map((r) => ({
      itemNo: `R${(this.itemCounter++).toString().padStart(3, "0")}`,
      category: r.category || "superstructure",
      element: "reinforcement",
      description: r.description || `Reinforcement ${r.primaryBarSize || ""}`,
      unit: r.unit || "Kg",
      quantity: r.quantity || r.totalWeightKg || 0,
      rate: r.rate || r.pricePerM || 0,
      amount: r.amount || r.totalPrice || 0,
      source: "rebar",
      location: r.location || "General",
    }));
  }
  private static extractRoomMaterials(rooms: any[]): MaterialSchedule {
    const materials: CategorizedMaterial[] = [];
    for (const room of rooms) {
      if (room.wallArea) {
        const quantityResult = calculateMaterialQuantities(
          "masonry",
          room.wallArea
        );
        const breakdownResult = getMaterialBreakdown("masonry", room.wallArea);
        if (breakdownResult.errors.length > 0) {
          console.warn(
            "Room material breakdown errors:",
            breakdownResult.errors
          );
        }
        if (quantityResult.errors.length > 0) {
          console.warn(
            "Room quantity calculation errors:",
            quantityResult.errors
          );
        }
        breakdownResult.breakdown.forEach((mat) => {
          const quantity = quantityResult.quantities?.[mat.material] || 0;
          materials.push({
            itemNo: `WM${(this.itemCounter++).toString().padStart(3, "0")}`,
            category: "Masonry",
            element: mat.element,
            description: mat.material,
            unit: mat.unit,
            quantity: quantity,
            rate: room.wallRate || 0,
            amount: (room.wallRate || 0) * quantity,
            source: "room-calculator",
            location: room.room_name || "Unknown Room",
            requirements: mat.requirements,
            preparationSteps: mat.preparationSteps,
            relationships: mat.relationships,
            materialType: "masonry",
          });
        });
      }
    }
    return materials;
  }
  private static autoCategory(description: string): string {
    const lowerDesc = description.toLowerCase();
    const config = getMaterialConfig(lowerDesc);
    if (config) return config.category;
    if (lowerDesc.includes("concrete") || lowerDesc.includes("cement"))
      return "concrete";
    if (lowerDesc.includes("stone") || lowerDesc.includes("block"))
      return "masonry";
    if (lowerDesc.includes("rebar") || lowerDesc.includes("steel"))
      return "steel";
    if (lowerDesc.includes("board") || lowerDesc.includes("timber"))
      return "formwork";
    return "other";
  }
  private static autoElement(description: string): string {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes("foundation")) return "foundation";
    if (lowerDesc.includes("column")) return "column";
    if (lowerDesc.includes("beam")) return "beam";
    if (lowerDesc.includes("wall")) return "wall";
    if (lowerDesc.includes("slab")) return "slab";
    return "general";
  }
  private static autoUnit(description: string): string {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes("concrete")) return "m\u00B3";
    if (lowerDesc.includes("steel") || lowerDesc.includes("rebar")) return "kg";
    if (lowerDesc.includes("formwork") || lowerDesc.includes("wall"))
      return "m\u00B2";
    if (lowerDesc.includes("door") || lowerDesc.includes("window")) return "No";
    return "unit";
  }
  private static determineMaterialType(
    category: string,
    description: string
  ): MaterialType {
    const lowerDesc = description.toLowerCase();
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes("concrete") || lowerDesc.includes("concrete")) {
      if (
        lowerDesc.includes("beam") ||
        lowerDesc.includes("column") ||
        lowerDesc.includes("slab")
      )
        return "structural-concrete";
      if (lowerDesc.includes("cement")) return "binding";
      if (lowerDesc.includes("sand") || lowerDesc.includes("aggregate"))
        return "aggregate";
      if (lowerDesc.includes("water")) return "auxiliary";
    }
    if (lowerCat.includes("steel") || lowerDesc.includes("steel")) {
      if (
        lowerDesc.includes("beam") ||
        lowerDesc.includes("column") ||
        lowerDesc.includes("truss")
      )
        return "structural-steel";
      if (lowerDesc.includes("reinforcement") || lowerDesc.includes("rebar"))
        return "reinforcement";
      if (lowerDesc.includes("wire") || lowerDesc.includes("spacer"))
        return "auxiliary";
    }
    if (lowerCat.includes("timber") || lowerDesc.includes("timber")) {
      if (
        lowerDesc.includes("beam") ||
        lowerDesc.includes("joist") ||
        lowerDesc.includes("truss")
      )
        return "structural-timber";
      return "primary";
    }
    if (lowerCat.includes("masonry") || lowerDesc.includes("masonry")) {
      if (
        lowerDesc.includes("load bearing") ||
        lowerDesc.includes("structural")
      )
        return "structural-masonry";
      if (lowerDesc.includes("partition")) return "partition";
      if (lowerDesc.includes("cement")) return "binding";
      if (lowerDesc.includes("sand")) return "aggregate";
      if (lowerDesc.includes("ties") || lowerDesc.includes("dpc"))
        return "auxiliary";
    }
    if (
      lowerDesc.includes("roof") ||
      lowerDesc.includes("tile") ||
      lowerDesc.includes("sheet")
    )
      return "roofing";
    if (
      lowerDesc.includes("insulation") ||
      lowerDesc.includes("thermal") ||
      lowerDesc.includes("acoustic")
    )
      return "insulation";
    if (lowerDesc.includes("waterproof") || lowerDesc.includes("membrane"))
      return "waterproofing";
    if (lowerDesc.includes("cladding") || lowerDesc.includes("facade"))
      return "cladding";
    if (lowerDesc.includes("partition") || lowerDesc.includes("dividing wall"))
      return "partition";
    if (lowerDesc.includes("ceiling") || lowerDesc.includes("suspended"))
      return "ceiling";
    if (
      lowerDesc.includes("floor") ||
      lowerDesc.includes("tile") ||
      lowerDesc.includes("carpet")
    )
      return "flooring";
    if (
      lowerDesc.includes("plaster") ||
      lowerDesc.includes("paint") ||
      lowerDesc.includes("wallpaper")
    )
      return "wall-finish";
    if (lowerDesc.includes("pipe") || lowerDesc.includes("plumbing"))
      return "plumbing";
    if (lowerDesc.includes("wire") || lowerDesc.includes("electrical"))
      return "electrical";
    if (lowerDesc.includes("hvac") || lowerDesc.includes("duct")) return "hvac";
    if (lowerDesc.includes("light") || lowerDesc.includes("lamp"))
      return "lighting";
    if (lowerDesc.includes("door")) return "door";
    if (lowerDesc.includes("window")) return "window";
    if (lowerDesc.includes("cabinet") || lowerDesc.includes("cupboard"))
      return "cabinet";
    if (
      lowerDesc.includes("handle") ||
      lowerDesc.includes("hinge") ||
      lowerDesc.includes("lock")
    )
      return "hardware";
    if (lowerDesc.includes("soil") || lowerDesc.includes("excavation"))
      return "earthwork";
    if (lowerDesc.includes("foundation") || lowerDesc.includes("footing"))
      return "foundation";
    if (lowerDesc.includes("paving") || lowerDesc.includes("pavement"))
      return "paving";
    if (lowerDesc.includes("landscape") || lowerDesc.includes("plant"))
      return "landscaping";
    if (lowerDesc.includes("formwork") || lowerDesc.includes("shuttering"))
      return "formwork";
    if (lowerDesc.includes("scaffold")) return "scaffolding";
    if (lowerDesc.includes("temporary")) return "temporary";
    if (lowerDesc.includes("preparation") || lowerDesc.includes("clean"))
      return "preparatory";
    if (lowerDesc.includes("finish")) return "finishing";
    if (lowerDesc.includes("paint")) return "painting";
    if (lowerDesc.includes("coat")) return "coating";
    if (lowerDesc.includes("sealant")) return "sealant";
    if (lowerDesc.includes("fire") || lowerDesc.includes("fireproof"))
      return "fire-protection";
    if (lowerDesc.includes("guard") || lowerDesc.includes("handrail"))
      return "safety-equipment";
    if (lowerDesc.includes("security") || lowerDesc.includes("access control"))
      return "security";
    if (lowerDesc.includes("drain") || lowerDesc.includes("sewer"))
      return "drainage";
    if (lowerDesc.includes("utility") || lowerDesc.includes("service"))
      return "utility";
    if (lowerDesc.includes("road") || lowerDesc.includes("pavement"))
      return "road-base";
    return "primary";
  }
  private static getConfigProperty(
    category: string,
    propertyName: keyof MaterialProperty,
    materialType: MaterialType
  ): string[] {
    const config = getMaterialConfig(category?.toLowerCase());
    if (config?.properties?.[propertyName]) {
      return config.properties[propertyName];
    }
    return this.defaultMaterialProperties[materialType]?.[propertyName] || [];
  }
  private static getMaterialRequirements(
    category: string,
    materialType: MaterialType
  ): string[] {
    return this.getConfigProperty(category, "requirements", materialType);
  }
  private static getPreparationSteps(
    category: string,
    materialType: MaterialType
  ): string[] {
    return this.getConfigProperty(category, "preparationSteps", materialType);
  }
  private static consolidateMaterials(
    materialsA: MaterialSchedule
  ): MaterialSchedule {
    const consolidatedMap = new Map<string, CategorizedMaterial>();
    const getMaterialKey = (material: CategorizedMaterial): string => {
      return `${material.category}_${material.description}_${material.unit}_${
        material.location || "default"
      }`;
    };
    const mergeMaterials = (
      existing: CategorizedMaterial,
      incoming: CategorizedMaterial
    ): CategorizedMaterial => {
      const merged = { ...existing };
      merged.quantity = (existing.quantity || 0) + (incoming.quantity || 0);
      merged.amount = (existing.amount || 0) + (incoming.amount || 0);
      if (existing.quantity && incoming.quantity) {
        merged.rate =
          (existing.rate * existing.quantity +
            incoming.rate * incoming.quantity) /
          (existing.quantity + incoming.quantity);
      }
      merged.requirements = Array.from(
        new Set([
          ...(existing.requirements || []),
          ...(incoming.requirements || []),
        ])
      );
      merged.preparationSteps = Array.from(
        new Set([
          ...(existing.preparationSteps || []),
          ...(incoming.preparationSteps || []),
        ])
      );
      merged.relationships = Array.from(
        new Map(
          [
            ...(existing.relationships || []),
            ...(incoming.relationships || []),
          ].map((rel) => [rel.material + rel.type, rel])
        ).values()
      );
      merged.confidence = Math.max(
        existing.confidence || 0,
        incoming.confidence || 0
      );
      merged.source = Array.from(
        new Set([existing.source, incoming.source])
      ).join("+");
      return merged;
    };
    [...materialsA].forEach((material) => {
      const key = getMaterialKey(material);
      if (consolidatedMap.has(key)) {
        consolidatedMap.set(
          key,
          mergeMaterials(consolidatedMap.get(key)!, material)
        );
      } else {
        consolidatedMap.set(key, { ...material });
      }
    });
    return Array.from(consolidatedMap.values()).map((material, index) => ({
      ...material,
      itemNo: `M${(index + 1).toString().padStart(3, "0")}`,
    }));
  }
}
