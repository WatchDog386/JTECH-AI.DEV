// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { RebarSize } from "@/hooks/useRebarCalculator";

// types/construction.ts
export type ConstructionCategory =
  | "earthworks"
  | "substructure"
  | "superstructure"
  | "roofing"
  | "finishes"
  | "services"
  | "external"
  | "special";

export type ConcreteElementType =
  | "slab"
  | "beam"
  | "column"
  | "foundation"
  | "strip-footing"
  | "raft-foundation"
  | "pile-cap"
  | "septic-tank"
  | "underground-tank"
  | "water-tank"
  | "staircase"
  | "ramp"
  | "retaining-wall"
  | "culvert"
  | "swimming-pool"
  | "paving"
  | "kerb"
  | "drainage-channel"
  | "manhole"
  | "inspection-chamber";

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
  | "green-roof";

export type PlumbingSystemType =
  | "water-supply"
  | "drainage"
  | "sewage"
  | "rainwater"
  | "hot-water"
  | "fire-fighting"
  | "gas-piping";

export type ElectricalSystemType =
  | "lighting"
  | "power"
  | "data"
  | "security"
  | "cctv"
  | "fire-alarm"
  | "access-control"
  | "av-systems";

export type FinishType =
  | "flooring"
  | "ceiling"
  | "wall-finishes"
  | "painting"
  | "glazing"
  | "joinery";

// Extended Concrete Interface
export interface ConcreteStructure {
  id: string;
  name: string;
  element: ConcreteElementType;
  length: string;
  width: string;
  height: string;
  mix: string;
  formwork?: string;
  category: ConstructionCategory;
  quantity: string;

  // Foundation specific
  foundationType?: string;
  hasConcreteBed?: boolean;
  bedDepth?: string;
  hasAggregateBed?: boolean;
  aggregateDepth?: string;

  // Masonry specific
  hasMasonryWall?: boolean;
  masonryBlockType?: string;
  masonryBlockDimensions?: string;
  masonryWallThickness?: string;
  masonryWallHeight?: string;
  masonryWallPerimeter?: number;

  // Reinforcement
  reinforcement?: {
    mainBarSize?: RebarSize;
    mainBarSpacing?: string;
    distributionBarSize?: RebarSize;
    distributionBarSpacing?: string;
    stirrupSize?: RebarSize;
    stirrupSpacing?: string;
  };

  // Special elements
  staircaseDetails?: {
    riserHeight?: string;
    treadWidth?: string;
    numberOfSteps?: number;
    landing?: boolean;
  };

  tankDetails?: {
    capacity?: string;
    wallThickness?: string;
    coverType?: string;
    numberOfChambers?: number;
  };

  // General
  clientProvidesWater?: boolean;
  cementWaterRatio?: string;
}
