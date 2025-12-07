// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { Door, Window } from "@/hooks/useMasonryCalculator";
import React, { createContext, useContext, useState } from "react";

export interface EquipmentSection {
  equipmentData: {
    standardEquipment: EquipmentItem[];
    customEquipment: EquipmentItem[];
    usageUnits: string[];
    categories: string[];
  };
}

export interface EquipmentItem {
  id?: string;
  name: string;
  description?: string;
  usage_unit?: string;
  rate_per_unit?: number;
  category?: string;
}

export interface ExtractedPlan {
  projectInfo?: {
    projectType: string;
    floors: number;
    totalArea: number;
    description: string;
  };

  rooms: {
    roomType: string;
    room_name: string;
    width: string;
    thickness: string;
    blockType: string;
    length: string;
    height: string;
    customBlock: {
      length: string;
      height: string;
      thickness: string;
      price: string;
    };
    plaster: string;
    doors: Door[];
    windows: Window[];
    // NEW: Wall connectivity data for each room
    wallConnectivity?: {
      roomId: string;
      position?: {
        x: number;
        y: number;
        rotation?: number;
      };
      walls?: {
        north?: WallConnectivity;
        south?: WallConnectivity;
        east?: WallConnectivity;
        west?: WallConnectivity;
      };
      connectedRooms?: string[];
      sharedArea?: number;
      externalWallArea?: number;
    };
  }[];

  walls?: Array<{
    id: string;
    start: [number, number];
    end: [number, number];
    thickness: string;
    height: string;
    blockType: string;
    connectedRooms: string[];
    material?: string;
    area?: string;
    // NEW: Enhanced wall properties
    isShared?: boolean;
    sharedWith?: string[];
  }>;

  floors: number;

  foundationDetails?: {
    foundationType: string;
    totalPerimeter: number;
    masonryType: string;
    wallThickness: string;
    wallHeight: string;
    blockDimensions?: string;
    length: string;
    width: string;
    height: string;
  };

  // NEW: Plan-wide connectivity data
  connectivity?: {
    sharedWalls: SharedWall[];
    roomPositions: { [roomId: string]: { x: number; y: number } };
    totalSharedArea: number;
    efficiency: {
      spaceUtilization: number;
      wallEfficiency: number;
      connectivityScore: number;
    };
  };

  // Existing structural elements
  earthworks?: Array<{
    id: string;
    type: string;
    length: string;
    width: string;
    depth: string;
    volume: string;
    material: string;
  }>;

  equipment?: EquipmentSection;

  concreteStructures?: Array<{
    id: string;
    name: string;
    element: string;
    length: string;
    width: string;
    height: string;
    volume?: string;
    mix: string;
    formwork?: string;
    category: string;
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
    reinforcement?: {
      mainBarSize?: string;
      mainBarSpacing?: string;
      distributionBarSize?: string;
      distributionBarSpacing?: string;
    };
    staircaseDetails?: {
      riserHeight?: string;
      treadWidth?: string;
      numberOfSteps?: number;
    };
    tankDetails?: {
      capacity?: string;
      wallThickness?: string;
      coverType?: string;
    };
  }>;

  reinforcement?: Array<{
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

  masonry?: Array<{
    id: string;
    type: string;
    blockType: string;
    length: string;
    height: string;
    thickness: string;
    area: string;
  }>;

  // Roofing systems
  roofing?: Array<{
    id: string;
    name: string;
    type: string;
    material: string;
    area: string;
    pitch: string;
    length?: string;
    width?: string;
    structure?: string;
    span?: string;
    perimeter?: string;
    ridgeLength?: string;
    flashingLength?: string;
    valleyLength?: string;
    thickness?: string;
    underlayment?: string;
    insulation?: {
      type: string;
      thickness: string;
    };
  }>;

  // Plumbing systems
  plumbing?: Array<{
    id: string;
    name: string;
    system: string;
    pipes?: Array<{
      id: string;
      material: string;
      diameter: string;
      length: string;
      pressureRating?: string;
      insulation?: {
        type: string;
        thickness: number;
      };
      trenchDetails?: {
        width: number;
        depth: number;
        length: number;
      };
    }>;
    fixtures?: Array<{
      id: string;
      type: string;
      count: number;
      location: string;
      waterConsumption?: number;
    }>;
    tanks?: any[];
    pumps?: any[];
    fittings?: any[];
  }>;

  // Electrical systems
  electrical?: Array<{
    id: string;
    name: string;
    system: string;
    panels?: Array<{
      id: string;
      type: string;
      circuits: number;
      rating: string;
      accessories?: string[];
    }>;
    outlets?: Array<{
      id: string;
      type: string;
      count: number;
      location: string;
      rating: string;
      gang?: number;
      mounting?: string;
    }>;
    lighting?: Array<{
      id: string;
      type: string;
      count: number;
      location: string;
      wattage: string;
      controlType: string;
      emergency: boolean;
    }>;
    cables?: Array<{
      id: string;
      type: string;
      size: string;
      length: string;
      circuit: string;
      protection?: string;
      installationMethod?: string;
    }>;
    protectionDevices?: any[];
    voltage?: number;
  }>;

  // Finishes
  finishes?: Array<{
    id: string;
    type: string;
    material: string;
    area: string;
    length?: string;
    width?: string;
    height?: string;
    room?: string;
    specifications?: any;
  }>;

  // External works
  externalWorks?: Array<{
    id: string;
    type: string;
    material: string;
    area: string;
    length?: string;
    width?: string;
  }>;

  file_url?: string;
  file_name?: string;
  uploaded_at?: string;
  houseType?: string;
  projectType?: string;
  projectName?: string;
  projectLocation?: string;
}

// NEW: Wall connectivity interfaces
export interface WallConnectivity {
  id: string;
  type: "external" | "shared" | "internal";
  sharedWith?: string;
  sharedLength?: number;
  sharedArea?: number;
  openings: WallOpening[];
  startPoint?: [number, number];
  endPoint?: [number, number];
  length: number;
  height: number;
  netArea: number;
  grossArea: number;
}

export interface WallOpening {
  id: string;
  type: "door" | "window";
  connectsTo?: string;
  size?: { width: number; height: number };
  position?: { fromStart: number; fromFloor: number };
  area: number;
}

export interface SharedWall {
  id: string;
  room1Id: string;
  room2Id: string;
  wall1Id: string;
  wall2Id: string;
  sharedLength: number;
  sharedArea: number;
  openings: string[];
}

interface PlanContextType {
  extractedPlan: ExtractedPlan | null;
  setExtractedPlan: (plan: ExtractedPlan) => void;
  // NEW: Helper methods for wall connectivity
  getSharedWallsForRoom: (roomId: string) => SharedWall[];
  getRoomConnections: (roomId: string) => string[];
  calculateMaterialSavings: () => {
    sharedArea: number;
    blockSavings: number;
    mortarSavings: number;
    costSavings: number;
  };
  getRoomWallConnectivity: (roomId: string) => any | null;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [extractedPlan, setExtractedPlan] = useState<ExtractedPlan | null>(
    null
  );

  // NEW: Helper function to get shared walls for a specific room
  const getSharedWallsForRoom = (roomId: string): SharedWall[] => {
    if (!extractedPlan?.connectivity?.sharedWalls) return [];

    return extractedPlan.connectivity.sharedWalls.filter(
      (wall) => wall.room1Id === roomId || wall.room2Id === roomId
    );
  };

  // NEW: Helper function to get room connections
  const getRoomConnections = (roomId: string): string[] => {
    const room = extractedPlan?.rooms.find(
      (r) => r.wallConnectivity?.roomId === roomId
    );
    return room?.wallConnectivity?.connectedRooms || [];
  };

  // NEW: Calculate material savings from shared walls
  const calculateMaterialSavings = () => {
    const sharedWalls = extractedPlan?.connectivity?.sharedWalls || [];
    const totalSharedArea = sharedWalls.reduce(
      (sum, wall) => sum + wall.sharedArea,
      0
    );

    // Calculate material savings (you can adjust these formulas based on your rates)
    const blockSavings = totalSharedArea / 0.08; // Assuming 0.08 m² per block
    const mortarSavings = totalSharedArea * 0.017; // MORTAR_PER_SQM
    const costSavings = blockSavings * 50 + mortarSavings * 5000; // Example rates

    return {
      sharedArea: totalSharedArea,
      blockSavings,
      mortarSavings,
      costSavings,
    };
  };

  // NEW: Get wall connectivity data for a specific room
  const getRoomWallConnectivity = (roomId: string) => {
    return (
      extractedPlan?.rooms.find(
        (room) => room.wallConnectivity?.roomId === roomId
      )?.wallConnectivity || null
    );
  };

  const contextValue: PlanContextType = {
    extractedPlan,
    setExtractedPlan: (plan: ExtractedPlan) => {
      // The plan now comes with pre-calculated wall connectivity from AI
      console.log(
        "Setting extracted plan with connectivity data:",
        plan.connectivity
      );
      setExtractedPlan(plan);
    },
    // NEW: Expose helper methods
    getSharedWallsForRoom,
    getRoomConnections,
    calculateMaterialSavings,
    getRoomWallConnectivity,
  };

  return (
    <PlanContext.Provider value={contextValue}>{children}</PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) throw new Error("usePlan must be used within a PlanProvider");
  return context;
};
