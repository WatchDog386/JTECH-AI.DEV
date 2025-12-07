// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { MaterialBreakdown, MaterialRelationship } from "@/types/boq";
import type { QuoteCalculation } from "@/hooks/useQuoteCalculations";
export interface MaterialRatios {
  [key: string]: number;
}
export interface MaterialProperties {
  requirements: string[];
  preparationSteps: string[];
  mixRatio?: string;
  thickness?: number;
  includeWastage?: boolean;
}
export interface MaterialConfig {
  type: string;
  label: string;
  defaultUnit: string;
  category: string;
  ratios: MaterialRatios;
  properties: MaterialProperties;
  relationships: MaterialRelationship[];
  calculatedRatios?: MaterialRatios;
  projectSpecifications?: {
    mixRatio?: string;
    thickness?: number;
    includeWastage?: boolean;
    customSpecs?: string;
  };
}
export interface MaterialValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}
export interface MaterialPrice {
  basePrice: number;
  unit: string;
  region: string;
  lastUpdated: Date;
  variations?: {
    [key: string]: number;
  };
  marketFactors?: {
    seasonalAdjustment: number;
    regionalFactor: number;
    bulkDiscount?: number;
  };
}
export function validateMaterialConfig(
  config: MaterialConfig
): MaterialValidationError[] {
  const errors: MaterialValidationError[] = [];
  if (!config.type) {
    errors.push({
      field: "type",
      message: "Material type is required",
      severity: "error",
    });
  }
  if (!config.label) {
    errors.push({
      field: "label",
      message: "Material label is required",
      severity: "error",
    });
  }
  if (!config.category) {
    errors.push({
      field: "category",
      message: "Material category is required",
      severity: "error",
    });
  }
  if (!config.defaultUnit) {
    errors.push({
      field: "defaultUnit",
      message: "Default unit is required",
      severity: "error",
    });
  }
  if (!config.ratios || Object.keys(config.ratios).length === 0) {
    errors.push({
      field: "ratios",
      message: "At least one ratio must be defined",
      severity: "error",
    });
  } else {
    Object.entries(config.ratios).forEach(([key, value]) => {
      if (typeof value !== "number" || value <= 0) {
        errors.push({
          field: `ratios.${key}`,
          message: "Ratio must be a positive number",
          severity: "error",
        });
      }
    });
  }
  if (!config.properties) {
    errors.push({
      field: "properties",
      message: "Properties are required",
      severity: "error",
    });
  } else {
    if (!Array.isArray(config.properties.requirements)) {
      errors.push({
        field: "properties.requirements",
        message: "Requirements must be an array",
        severity: "error",
      });
    }
    if (!Array.isArray(config.properties.preparationSteps)) {
      errors.push({
        field: "properties.preparationSteps",
        message: "Preparation steps must be an array",
        severity: "error",
      });
    }
    if (
      config.properties.mixRatio &&
      !config.properties.mixRatio.match(/^\d+:\d+(?::\d+)?$/)
    ) {
      errors.push({
        field: "properties.mixRatio",
        message: "Invalid mix ratio format",
        severity: "error",
      });
    }
  }
  if (!Array.isArray(config.relationships)) {
    errors.push({
      field: "relationships",
      message: "Relationships must be an array",
      severity: "error",
    });
  } else {
    config.relationships.forEach((rel, index) => {
      if (!rel.material || !rel.type || !rel.description) {
        errors.push({
          field: `relationships[${index}]`,
          message: "Incomplete relationship definition",
          severity: "error",
        });
      }
    });
  }
  return errors;
}
export interface MaterialPriceResult {
  totalPrice: number;
  priceBreakdown: {
    basePrice: number;
    wastageAdjustment: number;
    seasonalAdjustment: number;
    regionalAdjustment: number;
    bulkDiscount: number;
    urgencyAdjustment: number;
    variationAdjustment: number;
  };
  adjustedQuantity: number;
  warnings: string[];
}
export function calculateMaterialPrice(
  materialType: string,
  quantity: number,
  basePrice: MaterialPrice,
  customFactors?: {
    wastagePercent?: number;
    bulkDiscountThreshold?: number;
    urgencyFactor?: number;
  }
): MaterialPriceResult {
  const warnings: string[] = [];
  let adjustedQuantity = quantity;
  let finalPrice = basePrice.basePrice;
  const priceBreakdown = {
    basePrice: basePrice.basePrice,
    wastageAdjustment: 0,
    seasonalAdjustment: 0,
    regionalAdjustment: 0,
    bulkDiscount: 0,
    urgencyAdjustment: 0,
    variationAdjustment: 0,
  };
  if (basePrice.marketFactors) {
    const seasonalFactor = basePrice.marketFactors.seasonalAdjustment - 1;
    const regionalFactor = basePrice.marketFactors.regionalFactor - 1;
    priceBreakdown.seasonalAdjustment = finalPrice * seasonalFactor;
    finalPrice *= 1 + seasonalFactor;
    priceBreakdown.regionalAdjustment = finalPrice * regionalFactor;
    finalPrice *= 1 + regionalFactor;
    if (
      basePrice.marketFactors.bulkDiscount &&
      customFactors?.bulkDiscountThreshold &&
      quantity >= customFactors.bulkDiscountThreshold
    ) {
      const discount = basePrice.marketFactors.bulkDiscount;
      priceBreakdown.bulkDiscount = finalPrice * discount;
      finalPrice *= 1 - discount;
      warnings.push(
        "Bulk discount of " + (discount * 100).toFixed(1) + "% applied"
      );
    }
  }
  if (customFactors?.wastagePercent) {
    const wastage = customFactors.wastagePercent / 100;
    const extraQuantity = quantity * wastage;
    adjustedQuantity = quantity + extraQuantity;
    priceBreakdown.wastageAdjustment = finalPrice * extraQuantity;
    warnings.push(
      "Wastage of " +
        customFactors.wastagePercent +
        "% added (" +
        extraQuantity.toFixed(2) +
        " units)"
    );
  }
  if (customFactors?.urgencyFactor && customFactors.urgencyFactor !== 1) {
    const urgencyAdjustment = customFactors.urgencyFactor - 1;
    priceBreakdown.urgencyAdjustment = finalPrice * urgencyAdjustment;
    finalPrice *= 1 + urgencyAdjustment;
    if (customFactors.urgencyFactor > 1) {
      warnings.push(
        "Urgency premium of " +
          ((customFactors.urgencyFactor - 1) * 100).toFixed(1) +
          "% applied"
      );
    } else {
      warnings.push(
        "Urgency discount of " +
          ((1 - customFactors.urgencyFactor) * 100).toFixed(1) +
          "% applied"
      );
    }
  }
  if (basePrice.variations && Object.keys(basePrice.variations).length > 0) {
    const variationFactor = Math.max(...Object.values(basePrice.variations));
    priceBreakdown.variationAdjustment = finalPrice * variationFactor;
    finalPrice *= 1 + variationFactor;
    warnings.push(
      "Variation adjustment of " +
        (variationFactor * 100).toFixed(1) +
        "% applied"
    );
  }
  return {
    totalPrice: finalPrice * adjustedQuantity,
    priceBreakdown,
    adjustedQuantity,
    warnings,
  };
}
export function validateMaterialPrice(
  materialType: string,
  unitPrice: number,
  expectedRange?: {
    min: number;
    max: number;
  }
): MaterialValidationError[] {
  const errors: MaterialValidationError[] = [];
  const defaultPriceRanges: {
    [key: string]: {
      min: number;
      max: number;
    };
  } = {
    concrete: { min: 80, max: 200 },
    masonry: { min: 30, max: 100 },
    steel: { min: 0.8, max: 2.5 },
    cement: { min: 500, max: 1000 },
    sand: { min: 20, max: 50 },
  };
  const range = expectedRange || defaultPriceRanges[materialType];
  if (range) {
    if (unitPrice < range.min) {
      errors.push({
        field: "unitPrice",
        message:
          "Unit price (" +
          unitPrice +
          ") is below expected minimum (" +
          range.min +
          ")",
        severity: "warning",
      });
    }
    if (unitPrice > range.max) {
      errors.push({
        field: "unitPrice",
        message:
          "Unit price (" +
          unitPrice +
          ") is above expected maximum (" +
          range.max +
          ")",
        severity: "warning",
      });
    }
  }
  return errors;
}
export function getRequiredMaterials(materialType: string): string[] {
  const config = MaterialConfigurations[materialType];
  if (!config) return [];
  return config.relationships
    .filter((rel) => rel.type === "requires")
    .map((rel) => rel.material);
}
export function validateProjectSpecifications(
  materialType: string,
  specifications: MaterialConfig["projectSpecifications"]
): MaterialValidationError[] {
  const errors: MaterialValidationError[] = [];
  const config = MaterialConfigurations[materialType];
  if (!config) {
    errors.push({
      field: "materialType",
      message: "Invalid material type",
      severity: "error",
    });
    return errors;
  }
  if (specifications?.mixRatio) {
    const parts = specifications.mixRatio.split(":").map(Number);
    if (parts.some(isNaN)) {
      errors.push({
        field: "mixRatio",
        message: "Mix ratio must contain only numbers",
        severity: "error",
      });
    }
    if (materialType === "concrete" && parts.length !== 3) {
      errors.push({
        field: "mixRatio",
        message: "Concrete mix ratio must be in format n:n:n",
        severity: "error",
      });
    }
    if (materialType === "masonry" && parts.length !== 2) {
      errors.push({
        field: "mixRatio",
        message: "Mortar mix ratio must be in format n:n",
        severity: "error",
      });
    }
  }
  if (specifications?.thickness) {
    if (specifications.thickness <= 0) {
      errors.push({
        field: "thickness",
        message: "Thickness must be greater than 0",
        severity: "error",
      });
    }
  }
  return errors;
}
export const MaterialConfigurations: {
  [key: string]: MaterialConfig;
} = {
  concrete: {
    type: "concrete",
    label: "Concrete Works",
    category: "structural",
    defaultUnit: "m\u00B3",
    ratios: {
      cement: 5.2,
      sand: 0.7,
      ballast: 1.5,
      water: 170,
    },
    properties: {
      requirements: [
        "Design mix as specified",
        "Proper curing for minimum 7 days",
        "Maximum aggregate size as per specification",
      ],
      preparationSteps: [
        "Check all materials meet specifications",
        "Clean and wet formwork before casting",
        "Ensure reinforcement is properly placed",
        "Check concrete mix proportions",
      ],
      mixRatio: "1:2:4",
    },
    relationships: [
      {
        material: "Formwork",
        type: "requires",
        description: "Required for casting concrete",
      },
      {
        material: "Reinforcement",
        type: "requires",
        description: "Required for structural concrete",
      },
    ],
  },
  masonry: {
    type: "masonry",
    label: "Masonry Works",
    category: "walls",
    defaultUnit: "m\u00B2",
    ratios: {
      stones: 16,
      cement: 0.4,
      sand: 0.07,
    },
    properties: {
      requirements: [
        "Stones to be machine cut to specified sizes",
        "Mortar mix as specified in project requirements",
        "Proper curing for minimum 3 days",
      ],
      preparationSteps: [
        "Verify stone sizes and quality",
        "Check mortar mixing proportions",
        "Ensure proper alignment and leveling",
        "Clean stones before laying",
      ],
      mixRatio: "1:6",
      thickness: 0.012,
    },
    relationships: [
      {
        material: "DPC",
        type: "requires",
        description: "Required for ground floor walls",
      },
      {
        material: "Wall ties",
        type: "requires",
        description: "Required for cavity walls",
      },
    ],
  },
  formwork: {
    type: "formwork",
    label: "Formwork",
    category: "temporary",
    defaultUnit: "m\u00B2",
    ratios: {
      marineBoards: 0.33,
      timber: 18.5,
      nails: 0.5,
    },
    properties: {
      requirements: [
        "Marine boards minimum 18mm thick",
        "Timber supports adequately spaced",
        "Release agent applied evenly",
        "Watertight joints",
      ],
      preparationSteps: [
        "Clean all surfaces",
        "Apply release agent",
        "Check alignment and bracing",
        "Verify dimensions and levels",
      ],
    },
    relationships: [
      {
        material: "Release agent",
        type: "requires",
        description: "For easy formwork removal",
      },
      {
        material: "Props",
        type: "requires",
        description: "For formwork support",
      },
    ],
  },
  steel: {
    type: "rebar",
    label: "Steel/Reinforcement",
    category: "structural",
    defaultUnit: "kg",
    ratios: {
      bindingWire: 0.02,
      spacerBlocks: 4,
    },
    properties: {
      requirements: [
        "Steel grade as specified",
        "Free from rust and oil",
        "Stored off ground",
        "Protected from rain",
      ],
      preparationSteps: [
        "Check bar sizes and grades",
        "Ensure proper bending radius",
        "Clean bars if necessary",
        "Verify cover requirements",
      ],
    },
    relationships: [
      {
        material: "Binding wire",
        type: "requires",
        description: "For tying reinforcement",
      },
      {
        material: "Spacer blocks",
        type: "requires",
        description: "For maintaining cover",
      },
    ],
  },
  waterproofing: {
    type: "waterproofing",
    label: "Waterproofing",
    category: "finishes",
    defaultUnit: "m\u00B2",
    ratios: {
      membrane: 1.1,
      primer: 0.3,
    },
    properties: {
      requirements: [
        "Surface must be clean and dry",
        "Minimum overlaps as specified",
        "Full bond with substrate",
        "Protected from UV exposure",
      ],
      preparationSteps: [
        "Clean and repair substrate",
        "Apply primer as specified",
        "Check ambient conditions",
        "Protect finished work",
      ],
    },
    relationships: [
      {
        material: "Primer",
        type: "requires",
        description: "For surface preparation",
      },
      {
        material: "Protection board",
        type: "follows",
        description: "To protect membrane",
      },
    ],
  },
  doors: {
    type: "doors",
    label: "Doors",
    category: "openings",
    defaultUnit: "no",
    ratios: {
      door_frame: 1,
      hinges: 3,
      lock_set: 1,
      screws: 24,
    },
    properties: {
      requirements: [
        "Door size as per schedule",
        "Proper hardware installation",
        "Level and plumb installation",
      ],
      preparationSteps: [
        "Check opening dimensions",
        "Prepare frame installation",
        "Install hardware properly",
        "Test operation",
      ],
    },
    relationships: [
      {
        material: "Door frame",
        type: "requires",
        description: "Required for door installation",
      },
      {
        material: "Hardware",
        type: "requires",
        description: "Required for door operation",
      },
    ],
  },
  windows: {
    type: "windows",
    label: "Windows",
    category: "openings",
    defaultUnit: "no",
    ratios: {
      window_frame: 1,
      glass: 1,
      sealant: 0.2,
      fixing_screws: 12,
    },
    properties: {
      requirements: [
        "Window size as per schedule",
        "Watertight installation",
        "Proper operation",
      ],
      preparationSteps: [
        "Check opening dimensions",
        "Prepare frame installation",
        "Install glass properly",
        "Apply weatherproofing",
      ],
    },
    relationships: [
      {
        material: "Window frame",
        type: "requires",
        description: "Required for window installation",
      },
      {
        material: "Glass",
        type: "requires",
        description: "Required for window completion",
      },
    ],
  },
  roofing: {
    type: "roofing",
    label: "Roofing Works",
    category: "structural",
    defaultUnit: "m\u00B2",
    ratios: {
      tiles: 13.5,
      battens: 3.2,
      nails: 0.15,
      underlay: 1.1,
    },
    properties: {
      requirements: [
        "Proper overlap of tiles",
        "Correct batten spacing",
        "Adequate ventilation",
        "Waterproof installation",
      ],
      preparationSteps: [
        "Check roof structure",
        "Install underlay",
        "Fix battens",
        "Lay tiles with proper overlap",
      ],
    },
    relationships: [
      {
        material: "Underlay",
        type: "precedes",
        description: "Must be installed before tiles",
      },
      {
        material: "Battens",
        type: "requires",
        description: "Required for tile support",
      },
    ],
  },
  finishes: {
    type: "finishes",
    label: "Wall Finishes",
    category: "finishes",
    defaultUnit: "m\u00B2",
    ratios: {
      paint: 0.4,
      primer: 0.2,
      filler: 0.1,
      sandpaper: 0.2,
    },
    properties: {
      requirements: [
        "Surface preparation",
        "Even application",
        "Proper drying time",
        "Required number of coats",
      ],
      preparationSteps: [
        "Clean surface",
        "Apply filler where needed",
        "Sand smooth",
        "Apply primer before paint",
      ],
    },
    relationships: [
      {
        material: "Primer",
        type: "precedes",
        description: "Must be applied before paint",
      },
      {
        material: "Filler",
        type: "optional",
        description: "Used for surface preparation if needed",
      },
    ],
  },
};
export function getMaterialConfig(
  materialType: string,
  quoteData?: QuoteCalculation
): MaterialConfig | undefined {
  const config = { ...MaterialConfigurations[materialType] };
  if (!config) return undefined;
  if (quoteData) {
    config.projectSpecifications = {
      mixRatio:
        materialType === "concrete"
          ? quoteData.concrete_mix_ratio
          : materialType === "masonry"
          ? quoteData.mortar_ratio
          : undefined,
      thickness:
        materialType === "masonry" ? quoteData.plaster_thickness : undefined,
      includeWastage: quoteData.include_wastage,
      customSpecs: quoteData.custom_specs,
    };
    if (materialType === "concrete" && quoteData.concrete_mix_ratio) {
      const [cement, sand, aggregate] = quoteData.concrete_mix_ratio
        .split(":")
        .map(Number);
      const total = cement + sand + aggregate;
      config.calculatedRatios = {
        cement:
          (cement / total) *
          config.ratios.cement *
          (quoteData.include_wastage ? 1.1 : 1),
        sand:
          (sand / total) *
          config.ratios.sand *
          (quoteData.include_wastage ? 1.1 : 1),
        ballast:
          (aggregate / total) *
          config.ratios.ballast *
          (quoteData.include_wastage ? 1.1 : 1),
        water: config.ratios.water * (quoteData.include_wastage ? 1.1 : 1),
      };
    } else if (materialType === "masonry" && quoteData.mortar_ratio) {
      const [cement, sand] = quoteData.mortar_ratio.split(":").map(Number);
      const total = cement + sand;
      config.calculatedRatios = {
        cement:
          (cement / total) *
          config.ratios.cement *
          (quoteData.include_wastage ? 1.1 : 1),
        sand:
          (sand / total) *
          config.ratios.sand *
          (quoteData.include_wastage ? 1.1 : 1),
        stones: config.ratios.stones * (quoteData.include_wastage ? 1.1 : 1),
      };
    }
  }
  return config;
}
interface UnitMapping {
  [key: string]: string;
}
const standardUnits: UnitMapping = {
  cement: "Bags",
  sand: "Tonnes",
  ballast: "Tonnes",
  water: "Litres",
  stones: "No",
  marineBoards: "No",
  timber: "Ft",
  nails: "Kg",
  bindingWire: "Kg",
  spacerBlocks: "No",
  membrane: "m\u00B2",
  primer: "Litres",
  paint: "Litres",
  glass: "m\u00B2",
  tiles: "No",
  battens: "m",
  underlay: "m\u00B2",
  filler: "Kg",
  screws: "No",
  hinges: "Pairs",
  sealant: "Tubes",
};
export interface MaterialCalculationResult {
  breakdown: MaterialBreakdown[];
  errors: MaterialValidationError[];
  warnings: MaterialValidationError[];
}
export function getMaterialBreakdown(
  materialType: string,
  baseQuantity: number,
  quoteData?: QuoteCalculation
): MaterialCalculationResult {
  const errors: MaterialValidationError[] = [];
  const warnings: MaterialValidationError[] = [];
  if (!materialType) {
    errors.push({
      field: "materialType",
      message: "Material type is required",
      severity: "error",
    });
  }
  if (typeof baseQuantity !== "number" || baseQuantity <= 0) {
    errors.push({
      field: "baseQuantity",
      message: "Base quantity must be a positive number",
      severity: "error",
    });
  }
  const config = getMaterialConfig(materialType, quoteData);
  if (!config) {
    errors.push({
      field: "materialType",
      message: "Invalid material type: " + materialType,
      severity: "error",
    });
    return { breakdown: [], errors, warnings };
  }
  const configErrors = validateMaterialConfig(config);
  errors.push(...configErrors);
  if (errors.length > 0) {
    return { breakdown: [], errors, warnings };
  }
  const ratios = config.calculatedRatios || config.ratios;
  const breakdown = Object.entries(ratios).map(([material, ratio]) => {
    const quantity = baseQuantity * ratio;
    if (isUnusualQuantity(material, quantity)) {
      warnings.push({
        field: "quantity." + material,
        message: "Unusual quantity for " + material + ": " + quantity,
        severity: "warning",
      });
    }
    return {
      material,
      unit: standardUnits[material] || config.defaultUnit,
      ratio,
      category: config.type,
      element: material.charAt(0).toUpperCase() + material.slice(1),
      materialType: getMaterialTypeFromDescription(material),
      quantity,
      requirements: config.properties.requirements,
      preparationSteps: config.properties.preparationSteps,
      relationships: config.relationships.filter(
        (rel) => rel.material.toLowerCase() === material.toLowerCase()
      ),
      variations: getVariationsForMaterial(material, materialType),
    };
  });
  return { breakdown, errors, warnings };
}
function isUnusualQuantity(material: string, quantity: number): boolean {
  const ranges: {
    [key: string]: {
      min: number;
      max: number;
    };
  } = {
    cement: { min: 0.1, max: 1000 },
    sand: { min: 0.1, max: 100 },
    ballast: { min: 0.1, max: 100 },
    water: { min: 1, max: 10000 },
  };
  const range = ranges[material];
  if (!range) return false;
  return quantity < range.min || quantity > range.max;
}
function getMaterialTypeFromDescription(material: string): string {
  const materialTypes: {
    [key: string]: string;
  } = {
    cement: "binding",
    mortar: "binding",
    sand: "primary",
    ballast: "primary",
    stone: "primary",
    water: "auxiliary",
    wire: "auxiliary",
    spacer: "auxiliary",
    nail: "auxiliary",
    screw: "auxiliary",
    board: "primary",
    timber: "primary",
    membrane: "primary",
    primer: "primary",
    paint: "finishing",
    glass: "primary",
    tile: "finishing",
    sealant: "auxiliary",
    hinge: "hardware",
    lock: "hardware",
  };
  const lowerMat = material.toLowerCase();
  for (const [key, type] of Object.entries(materialTypes)) {
    if (lowerMat.includes(key)) return type;
  }
  return "primary";
}
function getVariationsForMaterial(
  material: string,
  category: string
): string[] {
  const materialVariations: {
    [key: string]: {
      [key: string]: string[];
    };
  } = {
    concrete: {
      cement: [
        "OPC (Ordinary Portland Cement)",
        "PPC (Portland Pozzolana Cement)",
        "SRC (Sulfate Resistant Cement)",
      ],
      sand: ["River Sand", "Crushed Sand", "M-Sand", "Pit Sand"],
      ballast: ["10mm", "20mm", "40mm", "Crushed Stone", "River Gravel"],
    },
    masonry: {
      stone: ["Machine Cut", "Hand Cut", "Natural Stone", "Concrete Blocks"],
      mortar: ["Type N (1:1:6)", "Type S (1:0.5:4.5)", "Type M (1:0.25:3)"],
    },
    roofing: {
      tiles: ["Clay", "Concrete", "Slate", "Metal"],
      battens: ["Treated Timber", "Metal"],
      underlay: ["Breathable", "Non-breathable", "Foil-backed"],
    },
    finishes: {
      paint: ["Emulsion", "Gloss", "Matt", "Satin"],
      primer: ["Water-based", "Oil-based", "Epoxy"],
    },
  };
  const lowerMat = material.toLowerCase();
  for (const [cat, materials] of Object.entries(materialVariations)) {
    if (category.toLowerCase() === cat) {
      for (const [mat, variations] of Object.entries(materials)) {
        if (lowerMat.includes(mat)) return variations;
      }
    }
  }
  return [];
}
export function calculateMaterialQuantities(
  materialType: string,
  baseQuantity: number,
  quoteData?: QuoteCalculation,
  customRatios?: {
    [key: string]: number;
  }
): {
  quantities: {
    [key: string]: number;
  };
  errors: MaterialValidationError[];
} {
  const errors: MaterialValidationError[] = [];
  if (!materialType || typeof baseQuantity !== "number" || baseQuantity <= 0) {
    errors.push({
      field: "input",
      message: "Invalid input parameters",
      severity: "error",
    });
    return { quantities: {}, errors };
  }
  const config = getMaterialConfig(materialType, quoteData);
  if (!config) {
    errors.push({
      field: "materialType",
      message: "Invalid material type: " + materialType,
      severity: "error",
    });
    return { quantities: {}, errors };
  }
  const configErrors = validateMaterialConfig(config);
  if (configErrors.length > 0) {
    return { quantities: {}, errors: configErrors };
  }
  const baseRatios = config.calculatedRatios || config.ratios;
  const ratios = { ...baseRatios, ...customRatios };
  const quantities: {
    [key: string]: number;
  } = {};
  for (const [material, ratio] of Object.entries(ratios)) {
    if (typeof ratio !== "number" || ratio <= 0) {
      errors.push({
        field: "ratio." + material,
        message: "Invalid ratio for " + material,
        severity: "error",
      });
      continue;
    }
    const quantity = baseQuantity * ratio;
    if (isUnusualQuantity(material, quantity)) {
      errors.push({
        field: "quantity." + material,
        message:
          "Unusual quantity calculated for " + material + ": " + quantity,
        severity: "warning",
      });
    }
    quantities[material] = quantity;
  }
  return { quantities, errors };
}
