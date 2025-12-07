# © 2025 Jeff. All rights reserved.
# Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import sys
import json
import os
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# Configuration
DEFAULT_HEIGHT = "2.7"
DEFAULT_THICKNESS = "0.2"
DEFAULT_BLOCK_TYPE = "Standard Block"
DEFAULT_PLASTER = "Both Sides"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
GEMINI_ENABLED = bool(GEMINI_API_KEY)

def call_gemini(file_path: str, prompt: str) -> Optional[Dict[str, Any]]:
    """Call Gemini API with proper error handling"""
    if not GEMINI_ENABLED:
        raise RuntimeError("Gemini API key not found. Set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.")
    
    try:
        import google.generativeai as genai
    except ImportError as e:
        raise RuntimeError(f"Google Generative AI library not installed: {e}")
    
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Use the most stable model
        model_name = "gemini-2.5-flash"
        print(f"🔄 Using model: {model_name}", file=sys.stderr)
        model = genai.GenerativeModel(model_name)
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        print(f"📤 Processing file: {os.path.basename(file_path)}", file=sys.stderr)
        
        # Read file as binary data
        with open(file_path, 'rb') as f:
            file_data = f.read()
        
        # Get file extension and set MIME type
        ext = os.path.splitext(file_path)[1].lower()
        mime_type = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png'
        }.get(ext, 'application/octet-stream')
        
        # Create file parts for the model
        file_part = {
            "mime_type": mime_type,
            "data": file_data
        }
        
        print("⏳ Waiting for Gemini response...", file=sys.stderr)
        
        # Generate content with file data
        response = model.generate_content([prompt, file_part])
        
        if response and response.text:
            cleaned = response.text.strip().replace('```json', '').replace('```', '').strip()
            
            # Try to parse JSON
            try:
                result = json.loads(cleaned)
                print("✅ Successfully parsed Gemini response", file=sys.stderr)
                return result
            except json.JSONDecodeError:
                # Try to extract JSON from text
                m = re.search(r'\{.*\}', cleaned, re.DOTALL)
                if m:
                    try:
                        result = json.loads(m.group())
                        print("✅ Successfully extracted JSON from response", file=sys.stderr)
                        return result
                    except Exception:
                        pass
                raise RuntimeError("Gemini returned non-JSON response")
        else:
            raise RuntimeError("Gemini returned empty response")
        
    except Exception as e:
        raise RuntimeError(f"Gemini API call failed: {e}")

def analyze_with_gemini(file_path: str) -> Dict[str, Any]:
    """Analyze construction document using Gemini only"""
    GEMINI_PROMPT = """
You are an expert architectural AI analyzing construction drawings and plans with extreme attention to detail.
(Keep output EXACTLY as JSON matching the requested schema. If no rooms detected, respond with {"error":"No rooms found"}.)

Analyze this construction document and extract ALL available information about:

### 🏠 ROOM IDENTIFICATION:
- Identify ALL rooms/spaces (living rooms, bedrooms, kitchens, bathrooms, etc.)
- Look for room labels, dimensions, and layout information
- Note any specific room names or numbers
- Identify shared walls between rooms and map them according to the json structure filling in all required data based on the plan
- Pay special attention to room boundaries and labels within floor plans
- Identify if rooms are marked as "Master Bedroom", "Bedroom 1", "Bedroom 2", etc.
- Identify en-suite bathrooms vs shared bathrooms

**Plumbing:**
- System types: "water-supply", "drainage", "sewage", "rainwater", "hot-water", "fire-fighting", "gas-piping", "irrigation"
- Pipe materials: "PVC-u", "PVC-c", "copper", "PEX", "galvanized-steel", "HDPE", "PPR", "cast-iron", "vitrified-clay"
- Fixture types: "water-closet", "urinal", "lavatory", "kitchen-sink", "shower", "bathtub", "bidet", "floor-drain", "cleanout", "hose-bib"
- Quality: "standard", "premium", "luxury"

**Electrical:**
- System types: "lighting", "power", "data", "security", "cctv", "fire-alarm", "access-control", "av-systems", "emergency-lighting", "renewable-energy"
- Cable types: "NYM-J", "PVC/PVC", "XLPE", "MICC", "SWA", "Data-CAT6", "Ethernet", "Fiber-Optic", "Coaxial"
- Outlet types: "power-socket", "light-switch", "dimmer-switch", "data-port", "tv-point", "telephone", "usb-charger", "gpo"
- Lighting types: "led-downlight", "fluorescent", "halogen", "emergency-light", "floodlight", "street-light", "decorative"
- Installation methods: "surface", "concealed", "underground", "trunking"
- Amperes: "6, 10, 13, 16, 20, 25, 32, 40, 45, 63"
- LIGHTING_WATTAGE = [3, 5, 7, 9, 12, 15, 18, 20, 24, 30, 36, 40, 50, 60];
- commonOutletRatings = [6, 10, 13, 16, 20, 25, 32, 40, 45, 63];

**Reinforcement:** 
- ElementTypes =
  | "slab"
  | "beam"
  | "column"
  | "foundation"
  | "strip-footing"
  | "tank";
- RebarSize = "Y8" | "Y10" | "Y12" | "Y16" | "Y20" | "Y25";
- ReinforcementType = "individual_bars" | "mesh";
- FootingType = "isolated" | "strip" | "combined";
- TankType =
  | "septic"
  | "underground"
  | "overhead"
  | "water"
  | "circular";
- TankWallType = "walls" | "base" | "cover" | "all";
- Be deifinate between the reinforcement types, eg either mesh or individual_bars
- If you find both reinforecement types, create two individual entries for each with the correct 

**Equipment:**
- Standard equipment types and their respective id = Bulldozer:15846932-db16-4a28-a477-2e4b2e1e42d5, Concrete Mixer:3203526d-fa51-4878-911b-477b2b909db5, Generator: 32c2ea0f-be58-47f0-bdcd-3027099eac4b, Water Pump:598ca378-6eb3-451f-89ea-f45aa6ecece8, Crane: d4665c7d-6ace-474d-8282-e888b53e7b48, Compactoreb80f645-6450-4026-b007-064b5f15a72a, Excavator:ef8d17ca-581d-4703-b200-17395bbe1c51

**Roofing:**
- Roof types: "pitched", "flat", "gable", "hip", "mansard", "butterfly", "skillion"
- Roof materials: "concrete-tiles", "clay-tiles", "metal-sheets", "box-profile", "thatch", "slate", "asphalt-shingles", "green-roof", "membrane"
- Timber sizes: "50x25", "50x50", "75x50", "100x50", "100x75", "150x50", "200x50"
- Underlayment: "felt-30", "felt-40", "synthetic", "rubberized", "breathable"
- Insulation: "glass-wool", "rock-wool", "eps", "xps", "polyurethane", "reflective-foil"
- Accessories: Use exact types (e.g., gutterType: "PVC", "Galvanized Steel", etc.)
- TIMBER_GRADES = [
  { value: "standard", label: "Standard Grade" },
  { value: "structural", label: "Structural Grade" },
  { value: "premium", label: "Premium Grade" },
];

- TIMBER_TREATMENTS = [
  { value: "untreated", label: "Untreated" },
  { value: "pressure-treated", label: "Pressure Treated" },
  { value: "fire-retardant", label: "Fire Retardant" },
];

- TIMBER_TYPES = [
  { value: "rafter", label: "Rafter" },
  { value: "wall-plate", label: "Wall Plate" },
  { value: "ridge-board", label: "Ridge Board" },
  { value: "purlin", label: "Purlin" },
  { value: "battens", label: "Battens" },
  { value: "truss", label: "Truss" },
  { value: "joist", label: "Joist" },
];

- UNDERLAYMENT_TYPES = [
  { value: "felt-30", label: "30# Felt Underlayment" },
  { value: "felt-40", label: "40# Felt Underlayment" },
  { value: "synthetic", label: "Synthetic Underlayment" },
  { value: "rubberized", label: "Rubberized Asphalt" },
  { value: "breathable", label: "Breathable Membrane" },
];

- INSULATION_TYPES = [
  { value: "glass-wool", label: "Glass Wool Batts" },
  { value: "rock-wool", label: "Rock Wool" },
  { value: "eps", label: "Expanded Polystyrene" },
  { value: "xps", label: "Extruded Polystyrene" },
  { value: "polyurethane", label: "Polyurethane Foam" },
  { value: "reflective-foil", label: "Reflective Foil" },
];

- GUTTER_TYPES = [
  { value: "PVC", label: "PVC Gutter" },
  { value: "Galvanized Steel", label: "Galvanized Steel Gutter" },
  { value: "Aluminum", label: "Aluminum Gutter" },
  { value: "Copper", label: "Copper Gutter" },
];

- DOWNPIPE_TYPES = [
  { value: "PVC", label: "PVC Downpipe" },
  { value: "Galvanized Steel", label: "Galvanized Steel Downpipe" },
  { value: "Aluminum", label: "Aluminum Downpipe" },
  { value: "Copper", label: "Copper Downpipe" },
];

- FLASHING_TYPES = [
  { value: "PVC", label: "PVC Flashing" },
  { value: "Galvanized Steel", label: "Galvanized Steel Flashing" },
  { value: "Aluminum", label: "Aluminum Flashing" },
  { value: "Copper", label: "Copper Flashing" },
];

- FASCIA_TYPES = [
  { value: "PVC", label: "PVC Fascia" },
  { value: "Painted Wood", label: "Painted Wood Fascia" },
  { value: "Aluminum", label: "Aluminum Fascia" },
  { value: "Composite", label: "Composite Fascia" },
];

- SOFFIT_TYPES = [
  { value: "PVC", label: "PVC Soffit" },
  { value: "Aluminum", label: "Aluminum Soffit" },
  { value: "Composite", label: "Composite Soffit" },
  { value: "Metal", label: "Metal Soffit" },
];

- ROOF_TYPES: { value: RoofType; label: string }[] = [
  { value: "flat", label: "Flat Roof" },
  { value: "pitched", label: "Pitched Roof" },
  { value: "gable", label: "Gable Roof" },
  { value: "hip", label: "Hip Roof" },
  { value: "mansard", label: "Mansard Roof" },
  { value: "butterfly", label: "Butterfly Roof" },
  { value: "skillion", label: "Skillion Roof" },
];

- ROOF_MATERIALS: { value: RoofMaterial; label: string }[] = [
  { value: "concrete-tiles", label: "Concrete Tiles" },
  { value: "clay-tiles", label: "Clay Tiles" },
  { value: "metal-sheets", label: "Metal Sheets" },
  { value: "box-profile", label: "Box Profile" },
  { value: "thatch", label: "Thatch" },
  { value: "slate", label: "Slate" },
  { value: "asphalt-shingles", label: "Asphalt Shingles" },
  { value: "green-roof", label: "Green Roof" },
  { value: "membrane", label: "Membrane" },
];

- TIMBER_SIZES: { value: TimberSize; label: string }[] = [
  { value: "50x25", label: "50mm x 25mm" },
  { value: "50x50", label: "50mm x 50mm" },
  { value: "75x50", label: "75mm x 50mm" },
  { value: "100x50", label: "100mm x 50mm" },
  { value: "100x75", label: "100mm x 75mm" },
  { value: "150x50", label: "150mm x 50mm" },
  { value: "200x50", label: "200mm x 50mm" },
];


**Finishes:**
- Categories: "flooring", "ceiling", "wall-finishes", "paint", "joinery"
- Only use these specified categories: skip glass, blocks, anyting to do with masonry or glass etc that are not in this list
- Materials must match common options per category (e.g., flooring: "Ceramic Tiles", "Hardwood", etc.)
- COMMON_MATERIALS = {
  flooring: [
    "Ceramic Tiles",
    "Porcelain Tiles",
    "Hardwood",
    "Laminate",
    "Vinyl",
    "Carpet",
    "Polished Concrete",
    "Terrazzo",
  ],
  ceiling: [
    "Gypsum Board",
    "PVC",
    "Acoustic Tiles",
    "Exposed Concrete",
    "Suspended Grid",
    "Wood Panels",
  ],
  "wall-finishes": [
    "Wallpaper",
    "Stone Cladding",
    "Tile Cladding",
    "Wood Paneling",
  ],
  paint: ["Emulsion", "Enamel", "Weatherproof", "Textured", "Metallic"],
  joinery: ["Solid Wood", "Plywood", "MDF", "Melamine", "Laminate"],
};

**Concrete & Structure:**
- Category = "substructure" | "superstructure";
- ElementType =
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

- FoundationStep {
  id: string;
  length: string;
  width: string;
  depth: string;
  offset: string;
}

- ConnectionDetails {
  lapLength?: number;
  developmentLength?: number;
  hookType?: "standard" | "seismic" | "special";
  spliceType?: "lap" | "mechanical" | "welded";
}

- WaterproofingDetails {
  includesDPC: boolean;
  dpcWidth?: string;
  dpcMaterial?: string;
  includesPolythene: boolean;
  polytheneGauge?: string;
  includesWaterproofing: boolean;
  waterproofingType?: "bituminous" | "crystalline" | "membrane";
}

- SepticTankDetails {
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

- UndergroundTankDetails {
  capacity: string;
  wallThickness: string;
  baseThickness: string;
  coverType: "slab" | "precast" | "none";
  includesManhole: boolean;
  manholeSize?: string;
  waterProofingRequired: boolean;
}

- SoakPitDetails {
  diameter: string;
  depth: string;
  wallThickness: string;
  baseThickness: string;
  liningType: "brick" | "concrete" | "precast";
  includesGravel: boolean;
  gravelDepth?: string;
  includesGeotextile: boolean;
}

- SoakawayDetails {
  length: string;
  width: string;
  depth: string;
  wallThickness: string;
  baseThickness: string;
  includesGravel: boolean;
  gravelDepth?: string;
  includesPerforatedPipes: boolean;
}
- Rebar sizes follow standard notation (e.g., "Y10", "Y12")
- Mixes to follow ratios eg 1:2:4, 1:2:3
- Notations C25 or C20 e.t.c, to be changed into their corresponding mixes for C:S:B(cement, sand, ballast)

### 📐 DIMENSION EXTRACTION:
- Extract room dimensions (length × width) in meters
- Look for dimension lines, labels, or text annotations
- Convert all measurements to meters (mm values should be divided by 1000)
- Pay attention to dimension lines that connect to room boundaries
- Look for both internal and external dimensions
- Identify grid lines or dimension strings that show room measurements

### 🚪 DOOR & WINDOW SPECIFICATIONS:
- Identify door types, sizes, and locations
- Identify window types, sizes, and locations
- Look for door/window schedules or labels (like DOO-001, WD-012, etc.)
- Note door swings and window opening directions if visible
- Count the number of doors and windows in each room

- standardDoorSizes = [
  "0.9 \u00D7 2.1 m",
  "1.0 \u00D7 2.1 m",
  "1.2 \u00D7 2.4 m",
];
- standardWindowSizes = [
  "1.2 \u00D7 1.2 m",
  "1.5 \u00D7 1.2 m",
  "2.0 \u00D7 1.5 m",
];

### 🏗️ CONSTRUCTION DETAILS:
- Note wall thicknesses if specified
- Identify floor levels (single story, multi-story)
- Look for any construction notes or specifications
- Note any special features like fireplaces, built-in cabinets, etc.
- If a room cannot be plasters for whatever reason, mark as "None"

### 🏗️ FOUNDATION AND CONSTRUCTION DETAILS (NEW FOCUS): 
# - Determine the **TOTAL EXTERNAL PERIMETER** of the building footprint in meters. 
# - Identify the specified **FOUNDATION TYPE** (e.g., Strip Footing, Raft). 
# - Identify the material used for the foundation wall/plinth level, specifically the **MASONRY TYPE** (e.g., Block Wall, Rubble Stone). 
# - Extract the **MASONRY WALL THICKNESS** (e.g., 0.2m). 
# - Extract the approximate **MASONRY WALL HEIGHT** from the top of the footing to the slab level (e.g., 1.0m).

### 📤 OUTPUT REQUIREMENTS:
Return ONLY valid JSON with this structure. Use reasonable estimates if exact dimensions aren't visible.

{
 "rooms": [
    {
      "roomType": "Living Room",
      "room_name": "Main Living",
      "length": "5.0",
      "width": "4.0",
      "height": "2.7",
      "thickness": "0.2",
      "blockType": "Standard Block",
      "plaster": "Both Sides",
      "customBlock": {
        "length": "",
        "height": "",
        "thickness": "",
        "price": ""
      },
      "doors": [
        {
          "sizeType": "standard",
          "standardSize": "0.9 × 2.1 m",
          "custom": {
            "height": "2.1",
            "width": "0.9",
            "price": ""
          },
          "type": "Panel",
          "frame": {
            "type": "Wood",
            "sizeType": "standard",
            "standardSize": "0.9 × 2.1 m",
            "height": "2.1",
            "width": "0.9",
            "custom": {
              "height": "1.2",
              "width": "1.2",
              "price": ""
            }
          },
          "count": 1
        }
      ],
      "windows": [
        {
          "sizeType": "standard",
          "standardSize": "1.2 × 1.2 m",
          "custom": {
            "height": "1.2",
            "width": "1.2",
            "price": ""
          },
          "type": "Clear",
          "frame": {
            "type": "Steel",
            "sizeType": "standard",
            "standardSize": "1.2 × 1.2 m",
            "height": "1.2",
            "width": "1.2",
            "custom": {
              "height": "1.2",
              "width": "1.2",
              "price": ""
            }
          },
          "count": 1
        }
      ],
      "wallConnectivity": {
        "roomId": "room_1",
        "position": {
          "x": 0,
          "y": 0
        },
        "walls": {
          "north": {
            "id": "wall_living_north",
            "type": "shared",
            "sharedWith": "room_2",
            "sharedLength": 5.0,
            "sharedArea": 13.5,
            "openings": [
              {
                "id": "door_1",
                "type": "door",
                "connectsTo": "room_2",
                "size": {
                  "width": 0.9,
                  "height": 2.1
                },
                "position": {
                  "fromStart": 2.0,
                  "fromFloor": 0.0
                },
                "area": 1.89
              }
            ],
            "length": 5.0,
            "height": 2.7,
            "netArea": 11.61,
            "grossArea": 13.5
          },
          "south": {
            "id": "wall_living_south",
            "type": "external",
            "openings": [
              {
                "id": "window_1",
                "type": "window",
                "size": {
                  "width": 1.2,
                  "height": 1.2
                },
                "position": {
                  "fromStart": 1.5,
                  "fromFloor": 1.0
                },
                "area": 1.44
              }
            ],
            "length": 5.0,
            "height": 2.7,
            "netArea": 12.06,
            "grossArea": 13.5
          },
          "east": {
            "id": "wall_living_east",
            "type": "shared",
            "sharedWith": "room_3",
            "sharedLength": 4.0,
            "sharedArea": 10.8,
            "openings": [],
            "length": 4.0,
            "height": 2.7,
            "netArea": 10.8,
            "grossArea": 10.8
          },
          "west": {
            "id": "wall_living_west",
            "type": "external",
            "openings": [],
            "length": 4.0,
            "height": 2.7,
            "netArea": 10.8,
            "grossArea": 10.8
          }
        },
        "connectedRooms": ["room_2", "room_3"],
        "sharedArea": 24.3,
        "externalWallArea": 24.3
      }
    },
    {
      "roomType": "Bedroom",
      "room_name": "Master Bedroom",
      "length": "4.0",
      "width": "3.5",
      "height": "2.7",
      "thickness": "0.2",
      "blockType": "Standard Block",
      "plaster": "Both Sides",
      "customBlock": {
        "length": "",
        "height": "",
        "thickness": "",
        "price": ""
      },
      "doors": [
        {
          "sizeType": "standard",
          "standardSize": "0.9 × 2.1 m",
          "custom": {
            "height": "2.1",
            "width": "0.9",
            "price": ""
          },
          "type": "Panel",
          "frame": {
            "type": "Wood",
            "sizeType": "standard",
            "standardSize": "0.9 × 2.1 m",
            "height": "2.1",
            "width": "0.9",
            "custom": {
              "height": "1.2",
              "width": "1.2",
              "price": ""
            }
          },
          "count": 1
        }
      ],
      "windows": [
        {
          "sizeType": "standard",
          "standardSize": "1.2 × 1.2 m",
          "custom": {
            "height": "1.2",
            "width": "1.2",
            "price": ""
          },
          "type": "Clear",
          "frame": {
            "type": "Steel",
            "sizeType": "standard",
            "standardSize": "1.2 × 1.2 m",
            "height": "1.2",
            "width": "1.2",
            "custom": {
              "height": "1.2",
              "width": "1.2",
              "price": ""
            }
          },
          "count": 1
        }
      ],
      "wallConnectivity": {
        "roomId": "room_2",
        "position": {
          "x": 0,
          "y": 4
        },
        "walls": {
          "south": {
            "id": "wall_bedroom_south",
            "type": "shared",
            "sharedWith": "room_1",
            "sharedLength": 4.0,
            "sharedArea": 10.8,
            "openings": [
              {
                "id": "door_1",
                "type": "door",
                "connectsTo": "room_1",
                "size": {
                  "width": 0.9,
                  "height": 2.1
                },
                "position": {
                  "fromStart": 1.5,
                  "fromFloor": 0.0
                },
                "area": 1.89
              }
            ],
            "length": 4.0,
            "height": 2.7,
            "netArea": 8.91,
            "grossArea": 10.8
          },
          "north": {
            "id": "wall_bedroom_north",
            "type": "external",
            "openings": [
              {
                "id": "window_2",
                "type": "window",
                "size": {
                  "width": 1.2,
                  "height": 1.2
                },
                "position": {
                  "fromStart": 1.0,
                  "fromFloor": 1.0
                },
                "area": 1.44
              }
            ],
            "length": 4.0,
            "height": 2.7,
            "netArea": 9.36,
            "grossArea": 10.8
          },
          "east": {
            "id": "wall_bedroom_east",
            "type": "external",
            "openings": [],
            "length": 3.5,
            "height": 2.7,
            "netArea": 9.45,
            "grossArea": 9.45
          },
          "west": {
            "id": "wall_bedroom_west",
            "type": "external",
            "openings": [],
            "length": 3.5,
            "height": 2.7,
            "netArea": 9.45,
            "grossArea": 9.45
          }
        },
        "connectedRooms": ["room_1"],
        "sharedArea": 10.8,
        "externalWallArea": 40.5
      }
    }
  ],
  "walls": [
    {
      "id": "wall_living_north",
      "start": [0, 4],
      "end": [5, 4],
      "thickness": "0.2",
      "height": "2.7",
      "blockType": "Standard Block",
      "connectedRooms": ["room_1", "room_2"],
      "area": "13.5",
      "isShared": true,
      "sharedWith": ["room_2"]
    },
    {
      "id": "wall_living_east",
      "start": [5, 0],
      "end": [5, 4],
      "thickness": "0.2",
      "height": "2.7",
      "blockType": "Standard Block",
      "connectedRooms": ["room_1", "room_3"],
      "area": "10.8",
      "isShared": true,
      "sharedWith": ["room_3"]
    }
  ],
  "floors": 1,
  "connectivity": {
    "sharedWalls": [
      {
        "id": "shared_living_bedroom",
        "room1Id": "room_1",
        "room2Id": "room_2",
        "wall1Id": "wall_living_north",
        "wall2Id": "wall_bedroom_south",
        "sharedLength": 5.0,
        "sharedArea": 13.5,
        "openings": ["door_1"]
      },
      {
        "id": "shared_living_kitchen",
        "room1Id": "room_1",
        "room2Id": "room_3",
        "wall1Id": "wall_living_east",
        "wall2Id": "wall_kitchen_west",
        "sharedLength": 4.0,
        "sharedArea": 10.8,
        "openings": []
      }
    ],
    "roomPositions": {
      "room_1": {
        "x": 0,
        "y": 0
      },
      "room_2": {
        "x": 0,
        "y": 4
      },
      "room_3": {
        "x": 5,
        "y": 0
      }
    },
    "totalSharedArea": 24.3,
    "efficiency": {
      "spaceUtilization": 0.85,
      "wallEfficiency": 0.78,
      "connectivityScore": 0.92
    }
  },
  ],
  "floors": 1
  "foundationDetails": { 
    "foundationType": "Strip Footing", 
    "totalPerimeter": 50.5, // Total length of all exterior foundation walls in meters 
    "masonryType": "Standard Block", // e.g., "Standard Block", "Rubble Stone" 
    "wallThickness": "0.200", // Thickness of the block/stone wall in meters
    "wallHeight": "1.0", // Height of the block/stone wall in meters 
    "blockDimensions": "0.400 x 0.200 x 0.200" // L x W x H in meters (optional) 
    "height": "1.0" // Depth or height of the foundation
    "length": "5.0" // Length of the foundation
    "width"" "6.0" //Width of the foundation
  } 
  "projectType": "residential" | "commercial" | "industrial" | "institutional",
  "floors": number,
  "totalArea": number,
  "houseType": string,
  "description": string
  "projectName": string,
  "projectLocation": string,
  
  "earthworks": [ {
      "id": "excavation-01",
      "type": "foundation-excavation",
      "length": "15.5",
      "width": "10.2", 
      "depth": "1.2",
      "volume": "189.72",
      "material": "soil"
    } 
  ],
  "concreteStructures": [
    {
      id:string;
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
  ],
  "reinforcement":[
    {
      id?: string;
      element: ElementTypes;
      name: string;
      length: string;
      width: string;
      depth: string;
      columnHeight?: string;
      mainBarSpacing?: string;
      distributionBarSpacing?: string;
      mainBarsCount?: string;
      distributionBarsCount?: string;
      slabLayers?: string;
      mainBarSize?: RebarSize;
      distributionBarSize?: RebarSize;
      stirrupSize?: RebarSize;
      tieSize?: RebarSize;
      stirrupSpacing?: string;
      tieSpacing?: string;
      category?: Category;
      number?: string;
      reinforcementType?: ReinforcementType;
      meshGrade?: string;
      meshSheetWidth?: string;
      meshSheetLength?: string;
      meshLapLength?: string;
      footingType?: FootingType;
      longitudinalBars?: string;
      transverseBars?: string;
      topReinforcement?: string;
      bottomReinforcement?: string;
      retainingWallType?: RetainingWallType;
      heelLength?: string;
      toeLength?: string;
      stemVerticalBarSize?: RebarSize;
      stemHorizontalBarSize?: RebarSize;
      stemVerticalSpacing?: string;
      stemHorizontalSpacing?: string;
    },
    {
      "id": "unique-id-6",
      "element": "tank",
      "name": "Septic Tank ST1",
      "length": "3.0",
      "width": "2.0",
      "depth": "1.8",
      "columnHeight": "",
      "mainBarSpacing": "",
      "distributionBarSpacing": "",
      "mainBarsCount": "",
      "distributionBarsCount": "",
      "slabLayers": "",
      "mainBarSize": "Y12",
      "distributionBarSize": "Y10",
      "stirrupSize": "",
      "tieSize": "",
      "stirrupSpacing": "",
      "tieSpacing": "",
      "category": "substructure",
      "number": "1",
      "reinforcementType": "individual_bars",
      "meshGrade": "",
      "meshSheetWidth": "",
      "meshSheetLength": "",
      "meshLapLength": "",
      "footingType": "",
      "longitudinalBars": "",
      "transverseBars": "",
      "topReinforcement": "",
      "bottomReinforcement": "",
      "tankType": "septic",
      "tankShape": "rectangular",
      "wallThickness": "0.2",
      "baseThickness": "0.2",
      "coverThickness": "0.15",
      "includeCover": true,
      "wallVerticalBarSize": "Y12",
      "wallHorizontalBarSize": "Y10",
      "wallVerticalSpacing": "150",
      "wallHorizontalSpacing": "200",
      "baseMainBarSize": "Y12",
      "baseDistributionBarSize": "Y10",
      "baseMainSpacing": "150",
      "baseDistributionSpacing": "200",
      "coverMainBarSize": "Y10",
      "coverDistributionBarSize": "Y8",
      "coverMainSpacing": "200",
      "coverDistributionSpacing": "250"
    },
  ],
  "equipment":{
    "equipmentData": {
      "standardEquipment": [
        {
          "id": "equip_001",
          "name": "Excavator",
          "description": "Heavy-duty excavator for digging and earthmoving",
          "usage_unit": "day",
          "usage_quantity": 1 // number of days, weeks, hours etc to be used,
          "category": "earthmoving"
        },
      ],
      "customEquipment": [
        {
          "equipment_type_id": "custom_001",
          "name": "Specialized Drilling Rig",
          "desc": "Custom drilling equipment for foundation work",
          "usage_unit": "week",
          "usage_quantity": 1 // number of days, weeks, hours etc to be used,
        },
      ],
    }
  }
  "roofing": [
    {
      "id": string,
      "name": string,
      "type": RoofType,
      "material": RoofMaterial,
      "area": number,
      "pitch": number, // degrees
      "length": number,
      "width": number,
      "eavesOverhang": number,
      "covering": {
        "type": string,
        "material": RoofMaterial,
        "underlayment"?: UnderlaymentType,
        "insulation"?: { "type": InsulationType, "thickness": number // m }
      },
      "timbers": [
        {
          "id": string,
          "type": string, // e.g., "rafter", "battens"
          "size": TimberSize,
          "spacing": number,
          "grade": "standard" | "structural" | "premium",
          "treatment": "untreated" | "pressure-treated" | "fire-retardant",
          "quantity": number,
          "length": number,
          "unit": "m" | "pcs"
        }
      ],
      "accessories": {
        "gutters": number,
        "gutterType": GutterType,
        "downpipes": number,
        "downpipeType": DownpipeType,
        "flashings": number,
        "flashingType": FlashingType,
        "fascia": number,
        "fasciaType": FasciaType,
        "soffit": number,
        "soffitType": SoffitType
        "RidgeCaps": number // m,
        valleyTraps: number // m
      },
    }
  ],
  "plumbing": [
    {
      "id": string,
      "name": string,
      "systemType": PlumbingSystemType,
      "pipes": [
        {
          "id": string,
          "material": PipeMaterial,
          "diameter": number, // from [15,20,...200]
          "length": number,
          "quantity": number,
          "pressureRating"?: string,
          "insulation"?: { "type": string, "thickness": number },
          "trenchDetails"?: { "width": number, "depth": number, "length": number }
        }
      ],
      "fixtures": [
        {
          "id": string,
          "type": FixtureType,
          "count": number,
          "location": string,
          "quality": "standard" | "premium" | "luxury",
          "connections": {
            "waterSupply": boolean,
            "drainage": boolean,
            "vent": boolean
          }
        }
      ],
      "tanks": [],
      "pumps": [],
      "fittings": []
    }
  ],
  "electrical": [
    {
      "id": string,
      "name": string,
      "systemType": ElectricalSystemType,
      "cables": [
        {
          "id": string,
          "type": CableType,
          "size": number, // mm² (from commonCableSizes)
          "length": number,
          "quantity": number,
          "circuit": string,
          "protection": string,
          "installationMethod": InstallationMethod
        }
      ],
      "outlets": [
        {
          "id": string,
          "type": OutletType,
          "count": number,
          "location": string,
          "circuit": string,
          "rating": number, // from commonOutletRatings
          "gang": number, // 1–4
          "mounting": "surface" | "flush"
        }
      ],
      "lighting": [
        {
          "id": string,
          "type": LightingType,
          "count": number,
          "location": string,
          "circuit": string,
          "wattage": number, // from LIGHTING_WATTAGE
          "controlType": "switch" | "dimmer" | "sensor" | "smart",
          "emergency": boolean
        }
      ],
      "distributionBoards": [
        {
          "id": string,
          "type": "main" | "sub",
          "circuits": number,
          "rating": number,
          "mounting": "surface" | "flush",
          "accessories": string[]
        }
      ],
      "protectionDevices": [],
      "voltage": 230 // default if not specified
    }
  ],
  "finishes": [
    {
      "id": string,
      "category": FinishCategory,
      "type": string,
      "material": string, // from COMMON_MATERIALS[category]
      "area": number,
      "unit": "m²" | "m" | "pcs",
      "quantity": number,
      "location": string
    }
  ],
  }

IMPORTANT: 
1. **DO NOT invent dimensions** that are not visible or inferable.
2. **Use defaults only when reasonable**:
   - Room height → 2.7 m
   - Roof wastage → 5%
   - Electrical voltage → 230V
   - Fixture quality → "standard"
   - Timber grade/treatment → "structural" / "pressure-treated" for structural elements
3. **Map extracted names to closest enum** (e.g., "toilet" → "water-closet", "LED light" → "led-downlight")
4. **If a section has no data, return empty array** (`[]`) or omit optional objects.
5. **All numeric measurements in meters or as specified** (e.g., diameter in mm, area in m²).
6. **Be consistent with your type system** — no arbitrary strings.
- Base your analysis on what you can actually see in the drawing
- External works should be in the concreteStructures section
- Use reasonable architectural standards for missing information
- Return at least one room if any building elements are visible
- Prefer custom sizes when specific dimensions are visible
- For bedrooms, distinguish between "Master Bedroom" and regular "Bedroom"
- For bathrooms, identify if they are "En-suite" or shared
- Pay special attention to dimension lines and labels
- Estimate resonably the equipment that would be used and days to be used
- Use the provided equipment types and ids, if your findings dont exist on the provided list, add them on your own
- Convert all measurements to meters (mm ÷ 1000)
- Use the specific types provided
- Use the variables provided as is: eg led-downlight, water-closet, etc. should stay as they are in the output, do not chnage the speling or characters
- Be precise with room identification and dimensions
- Do not leave any null items. If empty use resonable estimates based on the plan and what would be expected
"""

    result = call_gemini(file_path, GEMINI_PROMPT)
    
    # Validate the result structure
    if not isinstance(result, dict):
        raise RuntimeError("Gemini returned invalid response format")
    
    if "error" in result:
        return result
    
    if "rooms" not in result:
        raise RuntimeError("Gemini response missing 'rooms' field")
    
    if not result["rooms"]:
        return {"error": "No rooms found in analysis"}
    
    return result

def parse_file(file_path: str) -> Dict[str, Any]:
    """Parse file using Gemini only - no fallbacks"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Validate file type
    ext = os.path.splitext(file_path)[1].lower()
    supported_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
    
    if ext not in supported_extensions:
        raise ValueError(f"Unsupported file type: {ext}. Supported types: {', '.join(supported_extensions)}")
    
    print(f"🔍 Beginning Gemini analysis: {file_path}", file=sys.stderr)
    
    try:
        result = analyze_with_gemini(file_path)
        result["analysis_method"] = "gemini_ai"
        return result
    except Exception as e:
        # Re-raise with clear error message
        raise RuntimeError(f"Gemini analysis failed: {str(e)}")

# CLI Entrypoint
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python parser.py <file_path>"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        result = parse_file(file_path)
        print(json.dumps(result, indent=2))
        sys.exit(0)
    except Exception as e:
        error_result = {"error": str(e)}
        print(json.dumps(error_result, indent=2))
        print(f"❌ ERROR: {e}", file=sys.stderr)
        sys.exit(1)