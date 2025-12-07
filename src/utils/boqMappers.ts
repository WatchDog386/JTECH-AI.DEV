// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { BOQSection, BOQItem } from "@/types/boq";

export const generateProfessionalBOQ = (quoteData: any): BOQSection[] => {
  if (!quoteData || typeof quoteData !== "object") {
    return [];
  }

  // Use existing BOQ data if available
  if (hasValidBOQData(quoteData)) {
    return processExistingBOQData(quoteData.boq_data);
  }

  // Generate from available structured data
  const sections = generateFromAvailableData(quoteData);

  return sections.filter((section) => section.items.length > 1); // Must have more than just header
};

const hasValidBOQData = (data: any): boolean => {
  return Array.isArray(data.boq_data) && data.boq_data.length > 0;
};

const processExistingBOQData = (boqData: any[]): BOQSection[] => {
  return boqData.map((section, index) => ({
    ...section,
    title: section.title || `BILL NO. ${index + 1}`,
    items: section.items.map((item) => ({
      ...item,
      amount: item.isHeader ? 0 : item.quantity * item.rate,
    })),
  }));
};

const generateFromAvailableData = (data: any): BOQSection[] => {
  const sections: BOQSection[] = [];

  // Generate sections only when we have concrete data
  const preliminaries = generatePreliminariesSection(data);
  if (preliminaries.items.length > 1) sections.push(preliminaries);

  const substructure = generateSubstructureSection(data);
  if (substructure.items.length > 1) sections.push(substructure);

  const superstructure = generateSuperstructureSection(data);
  if (superstructure.items.length > 1) sections.push(superstructure);

  const finishes = generateFinishesSection(data);
  if (finishes.items.length > 1) sections.push(finishes);

  const openings = generateOpeningsSection(data);
  if (openings.items.length > 1) sections.push(openings);

  const services = generateServicesSection(data);
  if (services.items.length > 1) sections.push(services);

  const external = generateExternalWorksSection(data);
  if (external.items.length > 1) sections.push(external);

  return sections;
};

// Section Generators
const generatePreliminariesSection = (data: any): BOQSection => {
  const items: BOQItem[] = [
    createHeaderItem("PRELIMINARIES AND GENERAL ITEMS", "preliminaries"),
  ];

  // Services
  if (Array.isArray(data.services)) {
    data.services.forEach((service: any) => {
      if (service.price > 0) {
        items.push(
          createBOQItem(
            service.name,
            "Sum",
            1,
            service.price,
            "preliminaries",
            "Service"
          )
        );
      }
    });
  }

  // Equipment
  if (Array.isArray(data.equipment)) {
    data.equipment.forEach((equip: any) => {
      if (equip.total_cost > 0) {
        items.push(
          createBOQItem(
            `${equip.name} - ${equip.desc}`,
            equip.usage_unit,
            equip.usage_quantity,
            equip.rate_per_unit,
            "preliminaries",
            "Equipment"
          )
        );
      }
    });
  }

  // Transport and other costs
  if (data.transport_costs > 0) {
    items.push(
      createBOQItem(
        "Transport of materials and personnel",
        "Sum",
        1,
        data.transport_costs,
        "preliminaries",
        "Transport"
      )
    );
  }

  if (data.equipment_costs > 0) {
    items.push(
      createBOQItem(
        "Plant and equipment",
        "Sum",
        1,
        data.equipment_costs,
        "preliminaries",
        "Equipment"
      )
    );
  }

  if (data.additional_services_cost > 0) {
    items.push(
      createBOQItem(
        "Additional services",
        "Sum",
        1,
        data.additional_services_cost,
        "preliminaries",
        "Services"
      )
    );
  }

  if (data.permit_cost > 0) {
    items.push(
      createBOQItem(
        "Permits and approvals",
        "Sum",
        1,
        data.permit_cost,
        "preliminaries",
        "Permits"
      )
    );
  }

  return {
    title: "BILL NO. 1: PRELIMINARIES AND GENERAL ITEMS",
    items,
  };
};

const generateSubstructureSection = (data: any): BOQSection => {
  const items: BOQItem[] = [
    createHeaderItem("SUBSTRUCTURE WORKS", "substructure"),
  ];

  // Extract from concrete_rows
  if (Array.isArray(data.concrete_rows)) {
    const substructureConcrete = data.concrete_rows.filter(
      (row: any) =>
        row.category === "substructure" || row.element === "foundation"
    );

    substructureConcrete.forEach((row: any) => {
      const volume = calculateExactVolume(row);
      if (volume > 0) {
        const rate = getConcreteRateFromData(data, row);
        if (rate > 0) {
          items.push(
            createBOQItem(
              `Vibrated reinforced concrete to ${row.element}`,
              "m³",
              volume,
              rate,
              "substructure",
              row.element
            )
          );
        }
      }
    });
  }

  // Add foundation walling if available
  const foundationWalling = extractFoundationWalling(data);
  items.push(...foundationWalling);

  return {
    title: "BILL NO. 2: SUBSTRUCTURE WORKS",
    items,
  };
};

const generateSuperstructureSection = (data: any): BOQSection => {
  const items: BOQItem[] = [
    createHeaderItem("SUPERSTRUCTURE WORKS", "superstructure"),
  ];

  // Concrete elements
  if (Array.isArray(data.concrete_rows)) {
    const superstructureConcrete = data.concrete_rows.filter(
      (row: any) => row.category === "superstructure"
    );

    superstructureConcrete.forEach((row: any) => {
      const volume = calculateExactVolume(row);
      if (volume > 0) {
        const rate = getConcreteRateFromData(data, row);
        if (rate > 0) {
          items.push(
            createBOQItem(
              `Vibrated reinforced concrete to ${row.element}`,
              "m³",
              volume,
              rate,
              "superstructure",
              row.element
            )
          );
        }
      }
    });
  }

  // Reinforcement
  if (Array.isArray(data.rebar_calculations)) {
    data.rebar_calculations.forEach((rebar: any) => {
      if (rebar.totalWeightKg > 0) {
        items.push(
          createBOQItem(
            `Reinforcement steel ${rebar.primaryBarSize || ""}`,
            "kg",
            rebar.totalWeightKg,
            rebar.rate || 180,
            "superstructure",
            "Reinforcement"
          )
        );
      }
    });
  }

  // Masonry from rooms
  const masonryItems = extractMasonryFromRooms(data.rooms || []);
  items.push(...masonryItems);

  return {
    title: "BILL NO. 3: SUPERSTRUCTURE WORKS",
    items,
  };
};

const generateFinishesSection = (data: any): BOQSection => {
  const items: BOQItem[] = [createHeaderItem("INTERNAL FINISHES", "finishes")];

  if (data.masonry_materials) {
    const masonry = data.masonry_materials;

    if (masonry.netPlasterArea > 0 && masonry.netPlasterCost > 0) {
      items.push(
        createBOQItem(
          "Internal wall plaster",
          "m²",
          masonry.netPlasterArea,
          masonry.netPlasterCost / masonry.netPlasterArea,
          "finishes",
          "Plaster"
        )
      );
    }
  }

  return {
    title: "BILL NO. 4: INTERNAL FINISHES",
    items,
  };
};

const generateOpeningsSection = (data: any): BOQSection => {
  const items: BOQItem[] = [createHeaderItem("DOORS AND WINDOWS", "openings")];

  if (Array.isArray(data.rooms)) {
    data.rooms.forEach((room) => {
      if (Array.isArray(room.doors)) {
        room.doors.forEach((door: any) => {
          if (door.count > 0 && door.price > 0) {
            items.push(
              createBOQItem(
                `${door.type} Door ${
                  door.standardSize ? `(${door.standardSize})` : ""
                }`,
                "No",
                door.count,
                door.price,
                "openings",
                "Doors"
              )
            );
          }
        });
      }

      if (Array.isArray(room.windows)) {
        room.windows.forEach((window: any) => {
          if (window.count > 0 && window.price > 0) {
            items.push(
              createBOQItem(
                `${window.glass} Glass Window ${
                  window.standardSize ? `(${window.standardSize})` : ""
                }`,
                "No",
                window.count,
                window.price,
                "openings",
                "Windows"
              )
            );
          }
        });
      }
    });
  }

  return {
    title: "BILL NO. 5: DOORS AND WINDOWS",
    items,
  };
};

const generateServicesSection = (data: any): BOQSection => {
  const items: BOQItem[] = [
    createHeaderItem("SERVICES INSTALLATIONS", "services"),
  ];

  if (data.mechanical_cost > 0) {
    items.push(
      createBOQItem(
        "Mechanical works and installations",
        "Sum",
        1,
        data.mechanical_cost,
        "services",
        "Mechanical"
      )
    );
  }

  if (data.electrical_cost > 0) {
    items.push(
      createBOQItem(
        "Electrical fittings and installations",
        "Sum",
        1,
        data.electrical_cost,
        "services",
        "Electrical"
      )
    );
  }

  return {
    title: "BILL NO. 6: SERVICES INSTALLATIONS",
    items,
  };
};

const generateExternalWorksSection = (data: any): BOQSection => {
  const items: BOQItem[] = [createHeaderItem("EXTERNAL WORKS", "external")];

  if (data.external_works_cost > 0) {
    items.push(
      createBOQItem(
        "External works and landscaping",
        "Sum",
        1,
        data.external_works_cost,
        "external",
        "External Works"
      )
    );
  }

  if (data.landscaping_cost > 0) {
    items.push(
      createBOQItem(
        "Landscaping works",
        "Sum",
        1,
        data.landscaping_cost,
        "external",
        "Landscaping"
      )
    );
  }

  return {
    title: "BILL NO. 7: EXTERNAL WORKS",
    items,
  };
};

// Helper Functions
const calculateExactVolume = (row: any): number => {
  const width = parseFloat(row.width) || 0;
  const length = parseFloat(row.length) || 0;
  const height = parseFloat(row.height) || 0;
  const number = parseFloat(row.number) || 1;
  return width * length * height * number;
};

const getConcreteRateFromData = (data: any, row: any): number => {
  // Try to find actual rate from concrete_materials
  if (Array.isArray(data.concrete_materials)) {
    const material = data.concrete_materials.find(
      (m: any) => m.rowId === row.id && m.rate > 0
    );
    if (material) return material.rate;
  }

  // Fallback to mix-based rates (from actual data)
  const mixRates: { [key: string]: number } = {
    "1:2:4": 13500,
    "1:3:6": 12500,
    "1:1.5:3": 14500,
  };

  return mixRates[row.mix] || 0;
};

const extractFoundationWalling = (data: any): BOQItem[] => {
  const items: BOQItem[] = [];

  if (Array.isArray(data.concrete_rows)) {
    data.concrete_rows.forEach((row: any) => {
      if (row.hasMasonryWall && row.masonryWallThickness) {
        const wallArea = calculateWallArea(row);
        if (wallArea > 0) {
          items.push(
            createBOQItem(
              `${row.masonryWallThickness * 1000}mm foundation walling`,
              "m²",
              wallArea,
              1200, // Default masonry rate
              "substructure",
              "Foundation Walling"
            )
          );
        }
      }
    });
  }

  return items;
};

const calculateWallArea = (row: any): number => {
  const length = parseFloat(row.length) || 0;
  const height = parseFloat(row.masonryWallHeight) || 1.0;
  return length * height;
};

const extractMasonryFromRooms = (rooms: any[]): BOQItem[] => {
  const items: BOQItem[] = [];
  const wallTypes = new Map();

  rooms.forEach((room) => {
    if (room.netArea > 0 && room.blockCost > 0) {
      const key = `${room.thickness}_${room.blockType}_${room.plaster}`;
      const existing = wallTypes.get(key);

      if (existing) {
        existing.area += room.netArea;
        existing.cost += room.blockCost;
      } else {
        wallTypes.set(key, {
          area: room.netArea,
          cost: room.blockCost,
          thickness: room.thickness,
          blockType: room.blockType,
          plaster: room.plaster,
        });
      }
    }
  });

  wallTypes.forEach((value, key) => {
    items.push(
      createBOQItem(
        `${value.thickness || "0.2"}m ${
          value.blockType || "Standard Block"
        } walling (${value.plaster || "Both Sides"})`,
        "m²",
        value.area,
        value.cost / value.area,
        "superstructure",
        "Masonry"
      )
    );
  });

  return items;
};

const createHeaderItem = (description: string, category: string): BOQItem => ({
  itemNo: "",
  description,
  unit: "",
  quantity: 0,
  rate: 0,
  amount: 0,
  category,
  element: "Header",
  isHeader: true,
});

const createBOQItem = (
  description: string,
  unit: string,
  quantity: number,
  rate: number,
  category: string,
  element: string,
  isHeader: boolean = false
): BOQItem => ({
  itemNo: "",
  description,
  unit,
  quantity,
  rate,
  amount: isHeader ? 0 : quantity * rate,
  category,
  element,
  isHeader,
});
