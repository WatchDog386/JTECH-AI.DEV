// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useCallback, useEffect, useState } from "react";
import { RebarSize } from "./useRebarCalculator";
import { MasonryQSSettings } from "./useMasonryCalculator";

export type Category = "substructure" | "superstructure";
export type ElementType =
  | "slab"
  | "beam"
  | "column"
  | "foundation"
  | "septic-tank"
  | "underground-tank"
  | "staircase"
  | "ring-beam"
  | "strip-footing"
  | "raft-foundation"
  | "pile-cap"
  | "water-tank"
  | "ramp"
  | "retaining-wall"
  | "culvert"
  | "swimming-pool"
  | "paving"
  | "kerb"
  | "drainage-channel"
  | "manhole"
  | "inspection-chamber"
  | "soak-pit"
  | "soakaway";

export interface FoundationStep {
  id: string;
  length: string;
  width: string;
  depth: string;
  offset: string;
}

export interface ConnectionDetails {
  lapLength?: number;
  developmentLength?: number;
  hookType?: "standard" | "seismic" | "special";
  spliceType?: "lap" | "mechanical" | "welded";
}

export interface WaterproofingDetails {
  includesDPC: boolean;
  dpcWidth?: string;
  dpcMaterial?: string;
  includesPolythene: boolean;
  polytheneGauge?: string;
  includesWaterproofing: boolean;
  waterproofingType?: "bituminous" | "crystalline" | "membrane";
}

export interface SepticTankDetails {
  capacity: string;
  numberOfChambers: number;
  wallThickness: string;
  baseThickness: string;
  coverType: "slab" | "precast" | "none";
  depth: string;
  includesBaffles: boolean;
  includesManhole: boolean;
  manholeSize?: string;
}

export interface UndergroundTankDetails {
  capacity: string;
  wallThickness: string;
  baseThickness: string;
  coverType: "slab" | "precast" | "none";
  includesManhole: boolean;
  manholeSize?: string;
  waterProofingRequired: boolean;
}

export interface SoakPitDetails {
  diameter: string;
  depth: string;
  wallThickness: string;
  baseThickness: string;
  liningType: "brick" | "concrete" | "precast";
  includesGravel: boolean;
  gravelDepth?: string;
  includesGeotextile: boolean;
}

export interface SoakawayDetails {
  length: string;
  width: string;
  depth: string;
  wallThickness: string;
  baseThickness: string;
  includesGravel: boolean;
  gravelDepth?: string;
  includesPerforatedPipes: boolean;
}

export interface ConcreteRow {
  id: string;
  name: string;
  element: ElementType;
  length: string;
  width: string;
  height: string;
  mix: string;
  formwork?: string;
  category: Category;
  number: string;
  hasConcreteBed?: boolean;
  bedDepth?: string;
  hasAggregateBed?: boolean;
  aggregateDepth?: string;
  hasMasonryWall?: boolean;
  masonryBlockType?: string;
  masonryBlockDimensions?: string;
  masonryWallThickness?: string;
  masonryWallHeight?: string;
  masonryWallPerimeter?: number;
  foundationType?: string;
  clientProvidesWater?: boolean;
  cementWaterRatio?: string;

  isSteppedFoundation?: boolean;
  foundationSteps?: FoundationStep[];
  totalFoundationDepth?: string;

  waterproofing?: WaterproofingDetails;

  reinforcement?: {
    mainBarSize?: RebarSize;
    mainBarSpacing?: string;
    distributionBarSize?: RebarSize;
    distributionBarSpacing?: string;
    connectionDetails?: ConnectionDetails;
  };

  staircaseDetails?: {
    riserHeight?: number;
    treadWidth?: number;
    numberOfSteps?: number;
  };

  tankDetails?: {
    capacity?: string;
    wallThickness?: string;
    coverType?: string;
  };

  septicTankDetails?: SepticTankDetails;
  undergroundTankDetails?: UndergroundTankDetails;
  soakPitDetails?: SoakPitDetails;
  soakawayDetails?: SoakawayDetails;
}

export interface ConcreteResult {
  id: string;
  name: string;
  element: ElementType;
  volumeM3: number;
  cementBags: number;
  sandM3: number;
  stoneM3: number;
  number: string;
  totalVolume: number;
  formworkM2: number;
  bedVolume?: number;
  bedArea?: number;
  aggregateVolume?: number;
  aggregateArea?: number;
  totalBlocks?: number;
  masonryMortarCementBags?: number;
  masonryMortarSandM3?: number;
  waterRequired?: number;
  waterCost?: number;
  cementWaterRatio?: number;
  netCementBags: number;
  netSandM3: number;
  netStoneM3: number;
  netWaterRequiredL: number;
  netTotalBlocks?: number;
  netMortarCementBags?: number;
  netMortarSandM3?: number;
  grossCementBags: number;
  grossSandM3: number;
  grossStoneM3: number;
  grossWaterRequiredL: number;
  grossTotalBlocks?: number;
  grossMortarCementBags?: number;
  grossMortarSandM3?: number;
  waterMixingL: number;
  waterCuringL: number;
  waterOtherL: number;
  waterAggregateAdjustmentL: number;
  materialCost: number;
  totalConcreteCost: number;
  unitRate: number;

  steppedFoundationVolume?: number;
  dpcArea?: number;
  dpcCost?: number;
  polytheneArea?: number;
  polytheneCost?: number;
  waterproofingArea?: number;
  waterproofingCost?: number;
  connectionDetails?: ConnectionDetails;
  gravelVolume?: number;
  gravelCost?: number;
}

const CEMENT_DENSITY = 1440;
const SAND_DENSITY = 1600;
const STONE_DENSITY = 1500;
const CEMENT_BAG_KG = 50;
const CEMENT_BAG_VOLUME_M3 = 0.035;
const STANDARD_MIXES: {
  [key: string]: {
    cement: number;
    sand: number;
    stone: number;
  };
} = {
  "1:2:4": { cement: 1, sand: 2, stone: 4 },
  "1:1.5:3": { cement: 1, sand: 1.5, stone: 3 },
  "1:3:6": { cement: 1, sand: 3, stone: 6 },
  "1:4:8": { cement: 1, sand: 4, stone: 8 },
};
const MASONRY_MORTAR_MIX = { cement: 1, sand: 4 };
const MORTAR_DRY_VOLUME_FACTOR = 1.3;
const STANDARD_BLOCK_SIZE = { length: 0.4, height: 0.2, thickness: 0.2 };
const BRICK_SIZE = { length: 0.225, height: 0.075, thickness: 0.1125 };

function parseMortarRatio(ratio: string): {
  sand: number;
  cement: number;
} {
  if (!ratio) return { cement: 1, sand: 4 };
  const parts = ratio.split(":").map((part) => parseFloat(part.trim()));
  if (parts.length !== 2 || parts.some(isNaN) || parts.some((p) => p <= 0)) {
    return { cement: 1, sand: 4 };
  }
  return { cement: parts[0], sand: parts[1] };
}

export function parseMix(mix?: string): {
  cement: number;
  sand: number;
  stone: number;
} {
  if (!mix) return STANDARD_MIXES["1:2:4"];
  return STANDARD_MIXES[mix] || STANDARD_MIXES["1:2:4"];
}

export function parseCementWaterRatio(ratio: string): number {
  const parsed = parseFloat(ratio);
  return isNaN(parsed) || parsed <= 0 ? 0.5 : parsed;
}

export function calculateConcreteMaterials(
  volumeM3: number,
  mix: string,
  settings: MasonryQSSettings
): {
  cementBags: number;
  sandM3: number;
  stoneM3: number;
  cementMass: number;
  sandMass: number;
  stoneMass: number;
} {
  const mixRatio = parseMix(mix);
  const totalParts = mixRatio.cement + mixRatio.sand + mixRatio.stone;
  const cementVolumeM3 = (mixRatio.cement / totalParts) * volumeM3;
  const sandVolumeM3 = (mixRatio.sand / totalParts) * volumeM3;
  const stoneVolumeM3 = (mixRatio.stone / totalParts) * volumeM3;
  const cementBags = cementVolumeM3 / CEMENT_BAG_VOLUME_M3;
  const sandM3 = sandVolumeM3;
  const stoneM3 = stoneVolumeM3;
  const cementMass = cementVolumeM3 * CEMENT_DENSITY;
  const sandMass = sandVolumeM3 * SAND_DENSITY;
  const stoneMass = stoneVolumeM3 * STONE_DENSITY;
  return {
    cementBags,
    sandM3,
    stoneM3,
    cementMass,
    sandMass,
    stoneMass,
  };
}

export function calculateWaterRequirements(
  cementMass: number,
  cementWaterRatio: string,
  settings: MasonryQSSettings,
  sandMass: number,
  stoneMass: number,
  surfaceAreaM2: number,
  totalConcreteVolume: number
): {
  waterMixingL: number;
  waterCuringL: number;
  waterOtherL: number;
  waterAggregateAdjustmentL: number;
  totalWaterL: number;
} {
  const ratio = parseCementWaterRatio(cementWaterRatio);
  const hydrationWater = cementMass * ratio;
  const waterInSand =
    sandMass * (settings.aggregateMoistureContentPercent / 100);
  const waterInStone =
    stoneMass * (settings.aggregateMoistureContentPercent / 100);
  const waterAbsorbedBySand =
    sandMass * (settings.aggregateAbsorptionPercent / 100);
  const waterAbsorbedByStone =
    stoneMass * (settings.aggregateAbsorptionPercent / 100);
  const totalWaterInAggregate = waterInSand + waterInStone;
  const totalWaterAbsorbed = waterAbsorbedBySand + waterAbsorbedByStone;
  const waterAggregateAdjustment = totalWaterInAggregate - totalWaterAbsorbed;
  const waterMixingL = Math.max(0, hydrationWater - waterAggregateAdjustment);
  const waterCuringL =
    surfaceAreaM2 * settings.curingWaterRateLM2PerDay * settings.curingDays;
  const waterOtherL = totalConcreteVolume * settings.otherSiteWaterAllowanceLM3;
  const totalWaterL = waterMixingL + waterCuringL + waterOtherL;
  return {
    waterMixingL,
    waterCuringL,
    waterOtherL,
    waterAggregateAdjustmentL: waterAggregateAdjustment,
    totalWaterL,
  };
}

export function calculateMasonryQuantities(
  wallLength: number,
  wallHeight: number,
  wallThickness: number,
  blockDimensions: string,
  settings: MasonryQSSettings
): {
  blocks: number;
  mortarVolume: number;
} {
  const [bL, bH, bT] = blockDimensions?.split("x").map(parseFloat) || [
    0.4, 0.4, 0.2,
  ];
  const joint = settings.mortarJointThicknessM;
  const blocksLength = Math.ceil(wallLength / (bL + joint));
  const blocksHeight = Math.ceil(wallHeight / (bH + joint));
  const blocksThickness = Math.ceil(wallThickness / bT);
  const totalBlocks = blocksLength * blocksHeight * blocksThickness;
  const horizontalJointVolume =
    wallLength * wallThickness * joint * blocksHeight;
  const verticalJointVolume = wallHeight * wallThickness * joint * blocksLength;
  const mortarVolume = horizontalJointVolume + verticalJointVolume;
  return {
    blocks: totalBlocks,
    mortarVolume,
  };
}

function calculateSteppedFoundationVolume(
  steps: FoundationStep[],
  num: number
): number {
  return steps.reduce((total, step) => {
    const len = parseFloat(step.length) || 0;
    const wid = parseFloat(step.width) || 0;
    const depth = parseFloat(step.depth) || 0;
    return total + len * wid * depth * num;
  }, 0);
}

function calculateSepticTankQuantities(details: SepticTankDetails): {
  wallVolume: number;
  baseVolume: number;
  coverVolume: number;
  totalVolume: number;
  surfaceArea: number;
} {
  const capacity = parseFloat(details.capacity) || 0;
  const wallThickness = parseFloat(details.wallThickness) || 0.2;
  const baseThickness = parseFloat(details.baseThickness) || 0.25;
  const depth = parseFloat(details.depth) || 1.5;

  const width = Math.cbrt(capacity / (2 * depth));
  const length = 2 * width;

  const wallVolume = 2 * (length + width) * depth * wallThickness;
  const baseVolume = length * width * baseThickness;
  const coverVolume = details.coverType === "slab" ? length * width * 0.15 : 0;
  const totalVolume = wallVolume + baseVolume + coverVolume;
  const surfaceArea = 2 * (length + width) * depth + length * width;

  return {
    wallVolume,
    baseVolume,
    coverVolume,
    totalVolume,
    surfaceArea,
  };
}

function calculateUndergroundTankQuantities(details: UndergroundTankDetails): {
  wallVolume: number;
  baseVolume: number;
  coverVolume: number;
  totalVolume: number;
  surfaceArea: number;
} {
  const capacity = parseFloat(details.capacity) || 0;
  const wallThickness = parseFloat(details.wallThickness) || 0.2;
  const baseThickness = parseFloat(details.baseThickness) || 0.25;

  const side = Math.cbrt(capacity);
  const wallVolume = 4 * side * side * wallThickness;
  const baseVolume = side * side * baseThickness;
  const coverVolume = details.coverType === "slab" ? side * side * 0.15 : 0;
  const totalVolume = wallVolume + baseVolume + coverVolume;
  const surfaceArea = 4 * side * side + side * side;

  return {
    wallVolume,
    baseVolume,
    coverVolume,
    totalVolume,
    surfaceArea,
  };
}

function calculateSoakPitQuantities(details: SoakPitDetails): {
  wallVolume: number;
  baseVolume: number;
  coverVolume: number;
  totalVolume: number;
  surfaceArea: number;
  gravelVolume?: number;
} {
  const diameter = parseFloat(details.diameter) || 0;
  const depth = parseFloat(details.depth) || 0;
  const wallThickness = parseFloat(details.wallThickness) || 0.15;
  const baseThickness = parseFloat(details.baseThickness) || 0.2;
  const gravelDepth = parseFloat(details.gravelDepth) || 0.3;

  const radius = diameter / 2;
  const innerRadius = radius - wallThickness;

  const wallVolume =
    Math.PI * (radius * radius - innerRadius * innerRadius) * depth;
  const baseVolume = Math.PI * radius * radius * baseThickness;
  const coverVolume =
    details.liningType === "precast" ? 0 : Math.PI * radius * radius * 0.15;
  const totalVolume = wallVolume + baseVolume + coverVolume;
  const surfaceArea = 2 * Math.PI * radius * depth + Math.PI * radius * radius;

  const result: any = {
    wallVolume,
    baseVolume,
    coverVolume,
    totalVolume,
    surfaceArea,
  };

  if (details.includesGravel) {
    result.gravelVolume = Math.PI * innerRadius * innerRadius * gravelDepth;
  }

  return result;
}

function calculateSoakawayQuantities(details: SoakawayDetails): {
  wallVolume: number;
  baseVolume: number;
  totalVolume: number;
  surfaceArea: number;
  gravelVolume?: number;
} {
  const length = parseFloat(details.length) || 0;
  const width = parseFloat(details.width) || 0;
  const depth = parseFloat(details.depth) || 0;
  const wallThickness = parseFloat(details.wallThickness) || 0.15;
  const baseThickness = parseFloat(details.baseThickness) || 0.2;
  const gravelDepth = parseFloat(details.gravelDepth) || 0.3;

  const externalLength = length;
  const externalWidth = width;
  const internalLength = length - 2 * wallThickness;
  const internalWidth = width - 2 * wallThickness;

  const longWallsVolume = 2 * externalLength * depth * wallThickness;
  const shortWallsVolume =
    2 * (externalWidth - 2 * wallThickness) * depth * wallThickness;
  const wallVolume = longWallsVolume + shortWallsVolume;
  const baseVolume = externalLength * externalWidth * baseThickness;
  const totalVolume = wallVolume + baseVolume;
  const surfaceArea =
    2 * (externalLength + externalWidth) * depth +
    externalLength * externalWidth;

  const result: any = {
    wallVolume,
    baseVolume,
    totalVolume,
    surfaceArea,
  };

  if (details.includesGravel) {
    result.gravelVolume = internalLength * internalWidth * gravelDepth;
  }

  return result;
}

function calculateSurfaceArea(
  element: ElementType,
  len: number,
  wid: number,
  hei: number,
  num: number,
  staircaseDetails?
): number {
  switch (element) {
    case "slab":
    case "raft-foundation":
    case "paving":
      return len * wid * num;
    case "beam":
    case "ring-beam":
      return (2 * (len * hei) + len * wid) * num;
    case "column":
      return 2 * (len + wid) * hei * num;
    case "foundation":
    case "strip-footing":
    case "pile-cap":
      return len * wid * num;
    case "septic-tank":
    case "underground-tank":
    case "water-tank":
    case "swimming-pool":
      return 2 * (len + wid) * hei * num + len * wid * num;
    case "staircase":
      const treadWidth = staircaseDetails?.treadWidth || 0.3;
      const riserHeight = staircaseDetails?.riserHeight || 0.15;
      const steps = staircaseDetails?.numberOfSteps || 10;
      return (treadWidth + riserHeight) * wid * steps * num;
    case "ramp":
      return len * wid * num;
    case "retaining-wall":
      return len * hei * num * 2;
    case "culvert":
      return 2 * (len + wid) * hei * num + len * wid * num;
    case "kerb":
      return (2 * hei * len + wid * len) * num;
    case "drainage-channel":
      return (len * hei * 2 + len * wid) * num;
    case "manhole":
    case "inspection-chamber":
      const diameter = Math.sqrt(len * wid);
      const circumference = Math.PI * diameter;
      return (circumference * hei + len * wid) * num;
    case "soak-pit":
      const radius = len / 2;
      return (2 * Math.PI * radius * hei + Math.PI * radius * radius) * num;
    case "soakaway":
      return 2 * (len + wid) * hei * num + len * wid * num;
    default:
      return len * wid * num;
  }
}

export function calculateConcrete(
  row: ConcreteRow,
  materials: any[],
  settings: MasonryQSSettings,
  quote
): ConcreteResult {
  const {
    length,
    width,
    height,
    mix,
    id,
    name,
    element,
    number,
    hasConcreteBed,
    bedDepth,
    hasAggregateBed,
    aggregateDepth,
    hasMasonryWall,
    masonryBlockDimensions,
    masonryWallThickness,
    masonryWallHeight,
    masonryWallPerimeter,
    masonryBlockType,
    cementWaterRatio = settings.cementWaterRatio,
    staircaseDetails,
    tankDetails,
    isSteppedFoundation,
    foundationSteps = [],
    waterproofing,
    septicTankDetails,
    undergroundTankDetails,
    soakPitDetails,
    soakawayDetails,
  } = row;

  const len = parseFloat(length) || 0;
  const wid = parseFloat(width) || 0;
  const hei = parseFloat(height) || 0;
  const num = parseInt(number) || 1;
  const bedDepthNum = parseFloat(bedDepth) || 0;
  const aggregateDepthNum = parseFloat(aggregateDepth) || 0;
  const wallThicknessNum = parseFloat(masonryWallThickness) || 0.2;
  const wallHeightNum = parseFloat(masonryWallHeight) || 0;

  let mainVolume = 0;
  let surfaceAreaM2 = 0;
  let formworkM2 = 0;
  let steppedFoundationVolume = 0;
  let gravelVolume = 0;

  switch (element) {
    case "slab":
    case "raft-foundation":
    case "paving":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = len * wid * num;
      break;

    case "beam":
    case "ring-beam":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = (2 * hei * len + wid * len) * num;
      break;

    case "column":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = 2 * (len + wid) * hei * num;
      break;

    case "foundation":
    case "strip-footing":
    case "pile-cap":
      if (isSteppedFoundation && foundationSteps.length > 0) {
        steppedFoundationVolume = calculateSteppedFoundationVolume(
          foundationSteps,
          num
        );
        mainVolume = steppedFoundationVolume;
        surfaceAreaM2 = len * wid * num;
        formworkM2 = foundationSteps.reduce((total, step) => {
          const stepLen = parseFloat(step.length) || 0;
          const stepWid = parseFloat(step.width) || 0;
          const stepDepth = parseFloat(step.depth) || 0;
          return total + 2 * (stepLen + stepWid) * stepDepth * num;
        }, 0);
      } else {
        mainVolume = len * wid * hei * num;
        surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
        formworkM2 = 2 * (len + wid) * hei * num;
      }
      break;

    case "septic-tank":
      if (septicTankDetails) {
        const tankQuantities = calculateSepticTankQuantities(septicTankDetails);
        mainVolume = tankQuantities.totalVolume * num;
        surfaceAreaM2 = tankQuantities.surfaceArea * num;
        formworkM2 = 2 * (tankQuantities.surfaceArea / 3) * num;
      } else {
        const tankWallThickness = parseFloat(tankDetails?.wallThickness) || 0.2;
        const wallVolume = 2 * (len + wid) * hei * tankWallThickness * num;
        const baseVolume = len * wid * 0.25 * num;
        const coverVolume =
          tankDetails?.coverType === "slab" ? len * wid * 0.15 * num : 0;
        mainVolume = wallVolume + baseVolume + coverVolume;
        surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
        formworkM2 = 2 * (len + wid) * hei * num;
      }
      break;

    case "underground-tank":
    case "water-tank":
      if (undergroundTankDetails) {
        const tankQuantities = calculateUndergroundTankQuantities(
          undergroundTankDetails
        );
        mainVolume = tankQuantities.totalVolume * num;
        surfaceAreaM2 = tankQuantities.surfaceArea * num;
        formworkM2 = 2 * (tankQuantities.surfaceArea / 3) * num;
      } else {
        const tankWallThickness = parseFloat(tankDetails?.wallThickness) || 0.2;
        const wallVolume = 2 * (len + wid) * hei * tankWallThickness * num;
        const baseVolume = len * wid * 0.15 * num;
        const coverVolume =
          tankDetails?.coverType === "slab" ? len * wid * 0.1 * num : 0;
        mainVolume = wallVolume + baseVolume + coverVolume;
        surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
        formworkM2 = 2 * (len + wid) * hei * num;
      }
      break;

    case "soak-pit":
      if (soakPitDetails) {
        const soakPitQuantities = calculateSoakPitQuantities(soakPitDetails);
        mainVolume = soakPitQuantities.totalVolume * num;
        surfaceAreaM2 = soakPitQuantities.surfaceArea * num;
        formworkM2 =
          Math.PI *
          (parseFloat(soakPitDetails.diameter) || 0) *
          (parseFloat(soakPitDetails.depth) || 0) *
          num;

        if (soakPitQuantities.gravelVolume) {
          gravelVolume = soakPitQuantities.gravelVolume * num;
        }
      }
      break;

    case "soakaway":
      if (soakawayDetails) {
        const soakawayQuantities = calculateSoakawayQuantities(soakawayDetails);
        mainVolume = soakawayQuantities.totalVolume * num;
        surfaceAreaM2 = soakawayQuantities.surfaceArea * num;
        formworkM2 =
          2 *
          (parseFloat(soakawayDetails.length) ||
            0 + parseFloat(soakawayDetails.width) ||
            0) *
          (parseFloat(soakawayDetails.depth) || 0) *
          num;

        if (soakawayQuantities.gravelVolume) {
          gravelVolume = soakawayQuantities.gravelVolume * num;
        }
      }
      break;

    case "staircase":
      const riserHeight = staircaseDetails?.riserHeight || 0.15;
      const treadWidth = staircaseDetails?.treadWidth || 0.3;
      const numberOfSteps =
        staircaseDetails?.numberOfSteps || Math.ceil(hei / riserHeight);

      const stepVolume = (treadWidth * riserHeight * wid) / 2;
      const landingVolume = len * wid * 0.15;
      mainVolume = (stepVolume * numberOfSteps + landingVolume) * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = (treadWidth + riserHeight) * wid * numberOfSteps * 2 * num;
      break;

    case "ramp":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = len * wid * num;
      break;

    case "retaining-wall":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = len * hei * num;
      break;

    case "culvert":
      const culvertWallThickness = 0.2;
      const culvertBaseThickness = 0.25;
      const culvertCoverThickness = 0.2;

      const culvertWallVolume =
        2 * (len + wid) * hei * culvertWallThickness * num;
      const culvertBaseVolume = len * wid * culvertBaseThickness * num;
      const culvertCoverVolume = len * wid * culvertCoverThickness * num;
      mainVolume = culvertWallVolume + culvertBaseVolume + culvertCoverVolume;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = 2 * (len + wid) * hei * num;
      break;

    case "swimming-pool":
      const poolWallThickness = 0.25;
      const poolBaseThickness = 0.2;
      const poolWallVolume = 2 * (len + wid) * hei * poolWallThickness * num;
      const poolBaseVolume = len * wid * poolBaseThickness * num;
      mainVolume = poolWallVolume + poolBaseVolume;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = 2 * (len + wid) * hei * num;
      break;

    case "kerb":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = 2 * hei * len * num;
      break;

    case "drainage-channel":
      const channelBaseVolume = len * wid * 0.15 * num;
      const channelWallVolume = 2 * len * hei * 0.15 * num;
      mainVolume = channelBaseVolume + channelWallVolume;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = (2 * hei * len + wid * len) * num;
      break;

    case "manhole":
    case "inspection-chamber":
      const diameter = Math.sqrt(len * wid);
      const radius = diameter / 2;
      const chamberWallThickness = 0.15;
      const chamberBaseThickness = 0.2;
      const chamberCoverThickness = 0.1;

      const chamberWallVolume =
        Math.PI * diameter * hei * chamberWallThickness * num;
      const chamberBaseVolume =
        Math.PI * radius * radius * chamberBaseThickness * num;
      const chamberCoverVolume =
        Math.PI * radius * radius * chamberCoverThickness * num;
      mainVolume = chamberWallVolume + chamberBaseVolume + chamberCoverVolume;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = Math.PI * diameter * hei * num;
      break;

    default:
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = len * wid * num;
  }

  let bedVolume = 0;
  let bedArea = 0;
  let aggregateVolume = 0;
  let aggregateArea = 0;

  if (
    ["foundation", "strip-footing", "raft-foundation"].includes(element) &&
    !isSteppedFoundation
  ) {
    if (hasConcreteBed && bedDepthNum > 0) {
      bedArea = len * wid * num;
      bedVolume = bedArea * bedDepthNum;
    }
    if (hasAggregateBed && aggregateDepthNum > 0) {
      aggregateArea = len * wid * num;
      aggregateVolume = aggregateArea * aggregateDepthNum;
    }
  }

  let netTotalBlocks = 0;
  let netMortarCementBags = 0;
  let netMortarSandM3 = 0;

  if (
    hasMasonryWall &&
    wallHeightNum > 0 &&
    ["foundation", "retaining-wall"].includes(element)
  ) {
    const wallLength = element === "foundation" ? len * num : len;
    const masonry = calculateMasonryQuantities(
      wallLength,
      wallHeightNum,
      wallThicknessNum,
      masonryBlockDimensions || "0.4x0.2x0.2",
      settings
    );
    netTotalBlocks = masonry.blocks;
    const mortarVolume = masonry.mortarVolume;
    const dryMortarVolume = mortarVolume * MORTAR_DRY_VOLUME_FACTOR;
    const mortar_ratio = parseMortarRatio(quote.mortar_ratio);
    const totalMortarParts = mortar_ratio.cement + mortar_ratio.sand;
    const mortarCementVolume =
      (mortar_ratio.cement / totalMortarParts) * dryMortarVolume;
    const mortarSandVolume =
      (mortar_ratio.sand / totalMortarParts) * dryMortarVolume;
    netMortarCementBags = mortarCementVolume / CEMENT_BAG_VOLUME_M3;
    netMortarSandM3 = mortarSandVolume;
  }

  const totalConcreteVolume = mainVolume + bedVolume;
  const concreteMaterials = calculateConcreteMaterials(
    totalConcreteVolume,
    mix,
    settings
  );

  const waterCalc = calculateWaterRequirements(
    concreteMaterials.cementMass,
    cementWaterRatio,
    settings,
    concreteMaterials.sandMass,
    concreteMaterials.stoneMass,
    surfaceAreaM2,
    totalConcreteVolume
  );

  const grossCementBags = Math.ceil(
    concreteMaterials.cementBags * (1 + settings.wastageConcrete / 100)
  );
  const grossSandM3 =
    concreteMaterials.sandM3 * (1 + settings.wastageConcrete / 100);
  const grossStoneM3 =
    concreteMaterials.stoneM3 * (1 + settings.wastageConcrete / 100);
  const grossWaterRequiredL =
    waterCalc.totalWaterL * (1 + settings.wastageWater / 100);
  const grossTotalBlocks = Math.ceil(
    netTotalBlocks * (1 + settings.wastageConcrete / 100)
  );
  const grossMortarCementBags = Math.ceil(
    netMortarCementBags * (1 + settings.wastageConcrete / 100)
  );
  const grossMortarSandM3 =
    netMortarSandM3 * (1 + settings.wastageConcrete / 100);

  let dpcArea = 0;
  let dpcCost = 0;
  let polytheneArea = 0;
  let polytheneCost = 0;
  let waterproofingArea = 0;
  let waterproofingCost = 0;
  let gravelCost = 0;

  if (waterproofing) {
    if (waterproofing.includesDPC) {
      const dpcWidth = parseFloat(waterproofing.dpcWidth || "0.225");
      dpcArea = len * dpcWidth * num;
      const dpcMaterial = materials.find(
        (m) =>
          m.name?.toLowerCase().includes("dpc") ||
          m.name?.toLowerCase().includes("damp")
      );
      dpcCost = dpcArea * (dpcMaterial?.price || 50);
    }

    if (waterproofing.includesPolythene) {
      polytheneArea = len * wid * num;
      const polytheneMaterial = materials.find(
        (m) =>
          m.name?.toLowerCase().includes("polythene") ||
          m.name?.toLowerCase().includes("dpm")
      );
      polytheneCost = polytheneArea * (polytheneMaterial?.price || 30);
    }

    if (waterproofing.includesWaterproofing) {
      waterproofingArea = surfaceAreaM2;
      const waterproofingMaterial = materials.find(
        (m) =>
          m.name?.toLowerCase().includes("waterproof") ||
          m.name?.toLowerCase().includes("bituminous")
      );
      waterproofingCost =
        waterproofingArea * (waterproofingMaterial?.price || 80);
    }
  }

  if (gravelVolume > 0) {
    const gravelMaterial = materials.find(
      (m) =>
        m.name?.toLowerCase().includes("gravel") ||
        m.name?.toLowerCase().includes("aggregate")
    );
    gravelCost = gravelVolume * (gravelMaterial?.price || 0);
  }

  const cement = materials.find((m) => m.name?.toLowerCase() === "cement");
  const sand = materials.find((m) => m.name?.toLowerCase() === "sand");
  const stone = materials.find(
    (m) =>
      m.name?.toLowerCase() === "ballast" || m.name?.toLowerCase() === "stone"
  );
  const water = materials.find((m) => m.name?.toLowerCase() === "water");
  const formworkMat = materials.find(
    (m) => m.name?.toLowerCase() === "formwork"
  );
  const aggregate = materials.find(
    (m) => m.name?.toLowerCase() === "aggregate"
  );

  const cementCost = grossCementBags * (cement?.price || 0);
  const sandCost = grossSandM3 * (sand?.price || 0);
  const stoneCost = grossStoneM3 * (stone?.price || 0);
  const waterCost = settings.clientProvidesWater
    ? 0
    : (grossWaterRequiredL / 1000) * (water?.price || 0);
  const formworkCost = formworkM2 * (formworkMat?.price || 0);
  const aggregateCost = aggregateVolume * (aggregate?.price || 0);
  const mortarCementCost = (grossMortarCementBags || 0) * (cement?.price || 0);
  const mortarSandCost = (grossMortarSandM3 || 0) * (sand?.price || 0);

  const totalConcreteCost =
    cementCost +
    sandCost +
    stoneCost +
    waterCost +
    formworkCost +
    aggregateCost +
    mortarCementCost +
    mortarSandCost +
    dpcCost +
    polytheneCost +
    waterproofingCost +
    gravelCost;

  const unitRate =
    totalConcreteVolume > 0 ? totalConcreteCost / totalConcreteVolume : 0;

  return {
    id,
    name,
    element,
    number: num.toString(),
    volumeM3: mainVolume,
    totalVolume: totalConcreteVolume,
    cementBags: grossCementBags,
    sandM3: grossSandM3,
    stoneM3: grossStoneM3,
    formworkM2,
    bedVolume,
    bedArea,
    aggregateVolume,
    aggregateArea,
    totalBlocks: grossTotalBlocks,
    masonryMortarCementBags: grossMortarCementBags,
    masonryMortarSandM3: grossMortarSandM3,
    waterRequired: grossWaterRequiredL,
    waterCost,
    cementWaterRatio: parseCementWaterRatio(cementWaterRatio),
    netCementBags: concreteMaterials.cementBags,
    netSandM3: concreteMaterials.sandM3,
    netStoneM3: concreteMaterials.stoneM3,
    netWaterRequiredL: waterCalc.totalWaterL,
    netTotalBlocks,
    netMortarCementBags,
    netMortarSandM3,
    grossCementBags,
    grossSandM3,
    grossStoneM3,
    grossWaterRequiredL,
    grossTotalBlocks,
    grossMortarCementBags,
    grossMortarSandM3,
    waterMixingL: waterCalc.waterMixingL,
    waterCuringL: waterCalc.waterCuringL,
    waterOtherL: waterCalc.waterOtherL,
    waterAggregateAdjustmentL: waterCalc.waterAggregateAdjustmentL,
    materialCost: totalConcreteCost,
    totalConcreteCost,
    unitRate,

    steppedFoundationVolume: isSteppedFoundation
      ? steppedFoundationVolume
      : undefined,
    dpcArea,
    dpcCost,
    polytheneArea,
    polytheneCost,
    waterproofingArea,
    waterproofingCost,
    connectionDetails: row.reinforcement?.connectionDetails,
    gravelVolume,
    gravelCost,
  };
}

export function computeConcreteRatePerM3(
  mix: string,
  cementWaterRatio: string,
  prices: {
    cementPrice: number;
    sandPrice: number;
    stonePrice: number;
    waterPrice: number;
  },
  settings: MasonryQSSettings,
  element: ElementType,
  length: number,
  width: number,
  height: number,
  number: number = 1
): number {
  const { cementPrice, sandPrice, stonePrice, waterPrice } = prices;

  let volume = 0;
  let surfaceArea = 0;

  switch (element) {
    case "slab":
    case "raft-foundation":
    case "paving":
    case "ramp":
      volume = length * width * height * number;
      surfaceArea = length * width * number;
      break;
    case "beam":
    case "ring-beam":
    case "kerb":
      volume = length * width * height * number;
      surfaceArea = (2 * (length * height) + length * width) * number;
      break;
    case "column":
      volume = length * width * height * number;
      surfaceArea = 2 * (length + width) * height * number;
      break;
    case "foundation":
    case "strip-footing":
    case "pile-cap":
      volume = length * width * height * number;
      surfaceArea = length * width * number;
      break;
    case "staircase":
      const stepVolume = (0.3 * 0.15 * width) / 2;
      const steps = Math.ceil(height / 0.15);
      volume = stepVolume * steps * number;
      surfaceArea = (0.3 + 0.15) * width * steps * number;
      break;
    case "retaining-wall":
      volume = length * width * height * number;
      surfaceArea = length * height * number * 2;
      break;
    case "soak-pit":
      const radius = length / 2;
      volume = Math.PI * radius * radius * height * number;
      surfaceArea =
        (2 * Math.PI * radius * height + Math.PI * radius * radius) * number;
      break;
    case "soakaway":
      volume = length * width * height * number;
      surfaceArea =
        2 * (length + width) * height * number + length * width * number;
      break;
    default:
      volume = length * width * height * number;
      surfaceArea = length * width * number;
  }

  const materials = calculateConcreteMaterials(volume, mix, settings);
  const waterCalc = calculateWaterRequirements(
    materials.cementMass,
    cementWaterRatio,
    settings,
    materials.sandMass,
    materials.stoneMass,
    surfaceArea,
    volume
  );

  const grossCementBags =
    materials.cementBags * (1 + settings.wastageConcrete / 100);
  const grossSandM3 = materials.sandM3 * (1 + settings.wastageConcrete / 100);
  const grossStoneM3 = materials.stoneM3 * (1 + settings.wastageConcrete / 100);
  const grossWaterRequiredL =
    waterCalc.totalWaterL * (1 + settings.wastageWater / 100);

  const effectiveWaterPrice = settings.clientProvidesWater ? 0 : waterPrice;
  const cementCost = grossCementBags * cementPrice;
  const sandCost = grossSandM3 * sandPrice;
  const stoneCost = grossStoneM3 * stonePrice;
  const waterCost = (grossWaterRequiredL / 1000) * effectiveWaterPrice;

  const totalCost = cementCost + sandCost + stoneCost + waterCost;
  const ratePerM3 = volume > 0 ? totalCost / volume : 0;

  return ratePerM3;
}

export function useConcreteCalculator(
  rows: ConcreteRow[],
  materials: any[],
  settings: MasonryQSSettings,
  quote
) {
  const [results, setResults] = useState<ConcreteResult[]>([]);
  const [totals, setTotals] = useState<any>({});

  useEffect(() => {
    const calculatedResults = rows.map((row) =>
      calculateConcrete(row, materials, settings, quote)
    );
    setResults(calculatedResults);
  }, [rows, materials, settings, quote]);

  useEffect(() => {
    const newTotals = results.reduce(
      (acc, r) => {
        acc.volume += r.totalVolume;
        acc.cement += r.grossCementBags;
        acc.sand += r.grossSandM3;
        acc.stone += r.grossStoneM3;
        acc.mortarCementBags += r.grossMortarCementBags || 0;
        acc.formworkM2 += r.formworkM2;
        acc.waterRequired += r.grossWaterRequiredL;
        acc.waterCost += r.waterCost || 0;
        acc.mortarSandM3 += r.grossMortarSandM3 || 0;
        acc.aggregateVolume += r.aggregateVolume || 0;
        acc.totalBlocks += r.grossTotalBlocks || 0;
        acc.materialCost += r.materialCost;
        acc.totalCost += r.totalConcreteCost;

        acc.dpcArea += r.dpcArea || 0;
        acc.dpcCost += r.dpcCost || 0;
        acc.polytheneArea += r.polytheneArea || 0;
        acc.polytheneCost += r.polytheneCost || 0;
        acc.waterproofingArea += r.waterproofingArea || 0;
        acc.waterproofingCost += r.waterproofingCost || 0;
        acc.gravelVolume += r.gravelVolume || 0;
        acc.gravelCost += r.gravelCost || 0;

        return acc;
      },
      {
        volume: 0,
        cement: 0,
        sand: 0,
        stone: 0,
        mortarCementBags: 0,
        formworkM2: 0,
        mortarSandM3: 0,
        aggregateVolume: 0,
        totalBlocks: 0,
        materialCost: 0,
        waterRequired: 0,
        waterCost: 0,
        totalCost: 0,
        dpcArea: 0,
        dpcCost: 0,
        polytheneArea: 0,
        polytheneCost: 0,
        waterproofingArea: 0,
        waterproofingCost: 0,
        gravelVolume: 0,
        gravelCost: 0,
      }
    );
    setTotals(newTotals);
  }, [results]);

  const calculateConcreteRateForRow = useCallback(
    (row: ConcreteRow): number => {
      const cement = materials.find((m) => m.name?.toLowerCase() === "cement");
      const sand = materials.find((m) => m.name?.toLowerCase() === "sand");
      const stone = materials.find(
        (m) =>
          m.name?.toLowerCase() === "ballast" ||
          m.name?.toLowerCase() === "stone"
      );
      const water = materials.find((m) => m.name?.toLowerCase() === "water");

      if (!cement || !sand || !stone) return 0;

      const len = parseFloat(row.length) || 0;
      const wid = parseFloat(row.width) || 0;
      const hei = parseFloat(row.height) || 0;
      const num = parseInt(row.number) || 1;

      return computeConcreteRatePerM3(
        row.mix,
        row.cementWaterRatio || settings.cementWaterRatio,
        {
          cementPrice: cement.price,
          sandPrice: sand.price,
          stonePrice: stone.price,
          waterPrice: water?.price || 0,
        },
        settings,
        row.element,
        len,
        wid,
        hei,
        num
      );
    },
    [materials, settings]
  );

  return {
    results,
    totals,
    calculateConcreteRateForRow,
  };
}
