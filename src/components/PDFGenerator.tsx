// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useMemo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { BOQSection, BOQItem, MaterialBreakdown } from "@/types/boq";
import {
  AdvancedMaterialExtractor,
  CategorizedMaterial,
  MaterialSchedule,
} from "@/utils/advancedMaterialExtractor";
import {
  ConsolidatedMaterial,
  MaterialConsolidator,
} from "@/utils/materialConsolidator";
import { Target } from "lucide-react";
Font.register({
  family: "Outfit",
  fonts: [
    {
      src: "/fonts/Outfit-Regular.ttf",
      fontWeight: "normal",
      fontStyle: "normal",
    },
    { src: "/fonts/Outfit-Bold.ttf", fontWeight: "bold", fontStyle: "normal" },
    {
      src: "/fonts/Outfit-Light.ttf",
      fontWeight: "light",
      fontStyle: "normal",
    },
    {
      src: "/fonts/Outfit-Medium.ttf",
      fontWeight: "medium",
      fontStyle: "normal",
    },
    {
      src: "/fonts/Outfit-SemiBold.ttf",
      fontWeight: "semibold",
      fontStyle: "normal",
    },
    {
      src: "/fonts/Outfit-Regular.ttf",
      fontWeight: "normal",
      fontStyle: "italic",
    },
    {
      src: "/fonts/Outfit-Light.ttf",
      fontWeight: "light",
      fontStyle: "italic",
    },
    {
      src: "/fonts/Outfit-Medium.ttf",
      fontWeight: "medium",
      fontStyle: "italic",
    },
  ],
});
const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 10,
    fontFamily: "Outfit",
    lineHeight: 1.3,
    backgroundColor: "#FFFFFF",
  },
  header: {
    textAlign: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  materialCategoryHeader: {
    fontSize: 12,
    fontWeight: "medium",
    marginTop: 12,
    marginBottom: 4,
    padding: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
  },
  materialSource: {
    fontSize: 8,
    color: "#6B7280",
    fontWeight: "light",
    marginTop: 2,
  },
  sectionHeader: {
    backgroundColor: "#F3F4F6",
    padding: 8,
    marginVertical: 8,
    fontWeight: "bold",
  },
  subSectionHeader: {
    backgroundColor: "#F9FAFB",
    padding: 6,
    marginVertical: 4,
    fontWeight: "medium",
    fontSize: 9,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 6,
    color: "#4B5563",
    fontWeight: 500,
  },
  projectInfoContainer: {
    marginBottom: 15,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  projectInfoRow: {
    flexDirection: "row",
    marginBottom: 4,
    fontSize: 11,
  },
  projectInfoLabel: {
    width: 100,
    fontWeight: "bold",
    color: "#374151",
  },
  projectInfoValue: {
    flex: 1,
    color: "#6B7280",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
    borderRadius: 4,
  },
  table: {
    width: "100%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    color: "#FFFFFF",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    minHeight: 18,
  },
  tableColHeader: {
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 9,
    color: "#FFFFFF",
  },
  tableColHeaderDescription: {
    padding: 5,
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
    fontSize: 9,
    color: "#FFFFFF",
  },
  tableCol: {
    padding: 5,
    textAlign: "center",
    fontSize: 9,
    color: "#4B5563",
  },
  tableColDescription: {
    padding: 5,
    textAlign: "left",
    flex: 1,
    fontSize: 9,
    color: "#4B5563",
  },
  tableColAmount: {
    padding: 5,
    textAlign: "right",
    fontSize: 9,
    color: "#4B5563",
  },
  sectionTotalRow: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 11,
    backgroundColor: "#F3F4F6",
    padding: 6,
    borderRadius: 4,
  },
  sectionTotalLabel: {
    width: "80%",
    textAlign: "right",
    paddingRight: 8,
    color: "#374151",
  },
  sectionTotalValue: {
    width: "20%",
    textAlign: "right",
    color: "#1F2937",
  },
  grandTotalRow: {
    flexDirection: "row",
    marginTop: 15,
    borderTop: "2pt solid #3B82F6",
    paddingTop: 10,
    fontWeight: "bold",
    fontSize: 14,
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 6,
  },
  grandTotalLabel: {
    width: "80%",
    textAlign: "right",
    paddingRight: 8,
    color: "#1E40AF",
  },
  grandTotalValue: {
    width: "20%",
    textAlign: "right",
    color: "#1E40AF",
  },
  pageNumber: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#6B7280",
  },
  materialScheduleTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  materialScheduleColHeaderItem: {
    width: "14%",
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 9,
    color: "#FFFFFF",
  },
  materialScheduleColHeaderDescription: {
    width: "30%",
    padding: 5,
    fontWeight: "bold",
    textAlign: "left",
    fontSize: 9,
    color: "#FFFFFF",
  },
  materialScheduleColHeaderUnit: {
    width: "14%",
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 9,
    color: "#FFFFFF",
  },
  materialScheduleColHeaderQty: {
    width: "14%",
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 9,
    color: "#FFFFFF",
  },
  materialScheduleColHeaderRate: {
    width: "14%",
    padding: 5,
    fontWeight: "bold",
    textAlign: "right",
    fontSize: 9,
    color: "#FFFFFF",
  },
  materialScheduleColHeaderAmount: {
    width: "14%",
    padding: 5,
    fontWeight: "bold",
    textAlign: "right",
    fontSize: 9,
    color: "#FFFFFF",
  },
  materialScheduleColItem: {
    width: "14%",
    padding: 5,
    textAlign: "center",
    fontSize: 9,
    color: "#4B5563",
  },
  materialScheduleColDescription: {
    width: "90%",
    padding: 5,
    textAlign: "left",
    fontSize: 9,
    color: "#4B5563",
  },
  materialScheduleColUnit: {
    width: "14%",
    padding: 5,
    textAlign: "center",
    fontSize: 9,
    color: "#4B5563",
  },
  materialScheduleColQty: {
    width: "14%",
    padding: 5,
    textAlign: "center",
    fontSize: 9,
    color: "#4B5563",
  },
  materialScheduleColRate: {
    width: "14%",
    padding: 5,
    textAlign: "right",
    fontSize: 9,
    color: "#4B5563",
  },
  materialScheduleColAmount: {
    width: "14%",
    padding: 5,
    textAlign: "right",
    fontSize: 9,
    color: "#4B5563",
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
  },
  logoContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
    backgroundColor: "#ffffffff",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  companyTagline: {
    fontSize: 10,
    color: "#6B7280",
  },
  materialScheduleSection: {
    marginTop: 15,
  },
  materialScheduleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#ffffff",
    padding: 8,
    backgroundColor: "#3B82F6",
  },
  materialScheduleHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
  },
  materialScheduleRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    minHeight: 18,
  },
  boqFooter: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#6B7280",
    paddingTop: 8,
    borderTop: "1pt solid #E5E7EB",
  },
  boldText: {
    fontWeight: "bold",
  },
  prelimPage: {
    padding: 25,
    fontSize: 11,
    fontFamily: "Outfit",
    lineHeight: 1.4,
    backgroundColor: "#FFFFFF",
  },
  prelimTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#1F2937",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#3B82F6",
    borderBottomStyle: "solid",
  },
  prelimSubtitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 10,
    marginTop: 12,
    color: "#374151",
    paddingLeft: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
    borderLeftStyle: "solid",
  },
  prelimContent: {
    marginBottom: 10,
    textAlign: "justify",
    color: "#4B5563",
  },
  headerRow: {
    backgroundColor: "#F3F4F6",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#6B7280",
    paddingTop: 8,
    borderTop: "1pt solid #E5E7EB",
  },
  footerTotal: {
    fontWeight: "bold",
    color: "#1F2937",
  },
});
const formatCurrency = (amount: number): string => {
  if (!amount || amount === 0) return "";
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
const formatQuantity = (quantity: any): string => {
  if (quantity === null || quantity === undefined || quantity === "") return "";
  const num = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  if (isNaN(num)) return "";
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};
interface ProjectInfo {
  title: string;
  clientName: string;
  clientEmail?: string;
  location: string;
  projectType: string;
  houseType?: string;
  region?: string;
  floors?: number;
  date: string;
  consultant?: string;
  contractor?: string;
  drawingReference?: string;
  boqReference?: string;
  logoUrl?: string;
  companyName?: string;
  companyTagline?: string;
}
interface Preliminaries {
  items: PreliminariesItem[];
  title: string;
}
interface PreliminariesItem {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  isHeader?: boolean;
}
interface PDFGeneratorProps {
  boqData: BOQSection[];
  projectInfo: ProjectInfo;
  preliminariesData?: Preliminaries[];
  materialSchedule?: any[];
  calculationSummary?: CalculationSummary;
  equipmentItems?: EquipmentItem[];
  additionalServices?: AdditionalService[];
  subcontractors?: Subcontractor[];
  addons?: Addon[];
  transportCost?: number;
  contractType?: "full_contract" | "labor_only";
  profit: number;
  contingency_amount: number;
  overhead_amount: number;
  labour: number;
  permits: number;
  isClientExport?: boolean;
}
interface EquipmentItem {
  name: string;
  total_cost: number;
  equipment_type_id: string;
}
interface AdditionalService {
  name: string;
  price: number;
}
interface Subcontractor {
  id: string;
  name: string;
  subcontractor_payment_plan: string;
  price: number;
  days: number;
  total: number;
}
interface Addon {
  name: string;
  price: number;
}
interface Percentage {
  labour: number;
  overhead: number;
  profit: number;
  contingency: number;
  permit: number;
}
interface CalculationSummary {
  materials_cost: number;
  labor_cost: number;
  equipment_cost: number;
  transport_costs: number;
  services_cost: number;
  subcontractors_cost: number;
  preliminaries_cost: number;
  addons_cost: number;
  permit_cost: number;
  overhead_amount: number;
  contingency_amount: number;
  profit_amount: number;
  subtotal: number;
  total_amount: number;
  percentages: Percentage[];
}
const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  boqData,
  projectInfo,
  preliminariesData = [],
  materialSchedule,
  calculationSummary,
  equipmentItems = [],
  additionalServices = [],
  subcontractors = [],
  addons = [],
  transportCost = 0,
  contractType = "full_contract",
  profit = 0,
  contingency_amount = 0,
  overhead_amount = 0,
  labour = 0,
  permits = 0,
  isClientExport = false,
}) => {
  const nonEmptySections = useMemo(() => {
    return boqData?.filter((section) => {
      const hasNonHeaderItems = section.items.some((item) => !item.isHeader);
      const hasHeadersOnly = section.items.some((item) => item.isHeader);
      return hasNonHeaderItems || (hasHeadersOnly && section.items.length > 0);
    });
  }, [boqData]);
  const consolidatedMaterials = useMemo(() => {
    let allMaterials: CategorizedMaterial[] = [];
    if (materialSchedule && Array.isArray(materialSchedule)) {
      allMaterials = materialSchedule;
    } else {
      const mockQuote = {
        boqData: boqData,
      };
      const schedule = AdvancedMaterialExtractor.extractLocally(mockQuote);
      allMaterials = Object.values(schedule).flat();
    }
    return MaterialConsolidator.consolidateAllMaterials(allMaterials);
  }, [boqData, materialSchedule]);
  const calculateEquipmentTotal = useMemo(
    () => equipmentItems.reduce((sum, item) => sum + item.total_cost, 0),
    [equipmentItems]
  );
  const calculateServicesTotal = useMemo(
    () => additionalServices.reduce((sum, service) => sum + service.price, 0),
    [additionalServices]
  );
  const calculateSubcontractorsTotal = useMemo(
    () => subcontractors.reduce((sum, sub) => sum + sub.total, 0),
    [subcontractors]
  );
  const calculateAddonsTotal = useMemo(
    () => addons.reduce((sum, addon) => sum + addon.price, 0),
    [addons]
  );
  const calculateMaterialsTotal = useMemo(() => {
    if (calculationSummary?.materials_cost) {
      return calculationSummary.materials_cost;
    }
  }, [calculationSummary]);
  const materialsByCategory = materialSchedule.reduce((acc, material) => {
    const category = material.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(material);
    return acc;
  }, {} as Record<string, ConsolidatedMaterial[]>);
  const renderAdditionalCostDetails = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ADDITIONAL COST DETAILS</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Contract Type:
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {contractType === "full_contract"
                ? "Full Contract"
                : "Labor Only"}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Contingency:
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(contingency_amount)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Overhead:
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(overhead_amount)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Labour:
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(labour)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Permits:
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(permits)}
            </Text>
          </View>

          {!isClientExport && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableColDescription, { width: "70%" }]}>
                Profit:
              </Text>
              <Text style={[styles.tableColAmount, { width: "30%" }]}>
                {formatCurrency(profit)}
              </Text>
            </View>
          )}

          {!isClientExport && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableColDescription, { width: "70%" }]}>
                Transport Cost:
              </Text>
              <Text style={[styles.tableColAmount, { width: "30%" }]}>
                {formatCurrency(transportCost)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };
  const renderEquipmentPage = (equipment: EquipmentItem[]) => {
    if (!equipment || equipment.length === 0) return null;
    if (isClientExport) return null;
    return (
      <Page key="equipment-page" style={styles.page}>
        <CompanyHeader />
        {renderEquipmentSummary(equipment)}
        <View style={styles.boqFooter} fixed>
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
          <Text>{projectInfo.title}</Text>
          <Text>{projectInfo.clientName}</Text>
        </View>
      </Page>
    );
  };
  const renderSubcontractorsPage = (subcontractors: Subcontractor[]) => {
    if (!subcontractors || subcontractors.length === 0) return null;
    if (isClientExport) return null;
    return (
      <Page key="subcontractors-page" style={styles.page}>
        <CompanyHeader />
        {renderSubcontractorsSummary(subcontractors)}
        <View style={styles.boqFooter} fixed>
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
          <Text>{projectInfo.title}</Text>
          <Text>{projectInfo.clientName}</Text>
        </View>
      </Page>
    );
  };
  const renderAddonsPage = (addons: Addon[]) => {
    if (!addons || addons.length === 0) return null;
    return (
      <Page key="addons-page" style={styles.page}>
        <CompanyHeader />
        {renderAddonsSummary(addons)}
        <View style={styles.boqFooter} fixed>
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
          <Text>{projectInfo.title}</Text>
          <Text>{projectInfo.clientName}</Text>
        </View>
      </Page>
    );
  };
  const renderServicesPage = (services: AdditionalService[]) => {
    if (!services || services.length === 0) return null;
    return (
      <Page key="services-page" style={styles.page}>
        <CompanyHeader />
        {renderServicesSummary(services)}
        <View style={styles.boqFooter} fixed>
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
          <Text>{projectInfo.title}</Text>
          <Text>{projectInfo.clientName}</Text>
        </View>
      </Page>
    );
  };
  const renderMaterialRow = (material: ConsolidatedMaterial) => (
    <View style={styles.materialScheduleRow}>
      <Text style={styles.materialScheduleColItem}>{material.itemNo}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.materialScheduleColDescription}>
          {material.description}
        </Text>
        {material.category && (
          <Text style={styles.materialSource}>From: {material.category}</Text>
        )}
      </View>
      <Text style={styles.materialScheduleColUnit}>{material.unit}</Text>
      <Text style={styles.materialScheduleColQty}>
        {material.quantity.toFixed(2)}
      </Text>
      <Text style={styles.materialScheduleColRate}>
        {material.rate?.toLocaleString()}
      </Text>
      <Text style={styles.materialScheduleColAmount}>
        {material.amount?.toLocaleString()}
      </Text>
    </View>
  );
  const renderConsolidatedMaterials = (materials: ConsolidatedMaterial[]) => {
    if (materials.length === 0) return null;
    const materialsByCategory = materials.reduce((acc, material) => {
      const category = material.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(material);
      return acc;
    }, {} as Record<string, ConsolidatedMaterial[]>);
    const materialsTotal = materials.reduce((sum, m) => sum + m.amount, 0);
    return Object.entries(materialsByCategory).flatMap(
      ([category, categoryMaterials]) => {
        const itemChunks = chunkArray(categoryMaterials, 18);
        return itemChunks.map((chunk, chunkIndex) => (
          <Page
            key={`materials-${category}-${chunkIndex}`}
            size="A4"
            style={styles.page}
          >
            <CompanyHeader />
            <Text style={styles.materialScheduleTitle}>MATERIAL SCHEDULE</Text>
            <Text style={styles.materialCategoryHeader}>
              {category.toUpperCase()}
            </Text>

            <View style={styles.materialScheduleTable}>
              <View style={styles.materialScheduleHeaderRow}>
                <Text style={styles.materialScheduleColHeaderItem}>Item</Text>
                <Text style={styles.materialScheduleColHeaderDescription}>
                  Description
                </Text>
                <Text style={styles.materialScheduleColHeaderUnit}>Unit</Text>
                <Text style={styles.materialScheduleColHeaderQty}>Qty</Text>
                <Text style={styles.materialScheduleColHeaderRate}>Rate</Text>
                <Text style={styles.materialScheduleColHeaderAmount}>
                  Amount
                </Text>
              </View>

              {chunk.map((material, index) => renderMaterialRow(material))}

              {chunkIndex === itemChunks.length - 1 && (
                <View style={styles.sectionTotalRow}>
                  <Text style={styles.sectionTotalLabel}>
                    Total for {category}:
                  </Text>
                  <Text style={styles.sectionTotalValue}>
                    {formatCurrency(
                      categoryMaterials.reduce(
                        (sum, m) => sum + (m.amount || 0),
                        0
                      )
                    )}
                  </Text>
                </View>
              )}
            </View>

            {category ===
              Object.keys(materialsByCategory)[
                Object.keys(materialsByCategory).length - 1
              ] &&
              chunkIndex === itemChunks.length - 1 && (
                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>
                    TOTAL MATERIALS COST:
                  </Text>
                  <Text style={styles.grandTotalValue}>
                    {formatCurrency(materialsTotal)}
                  </Text>
                </View>
              )}

            <View style={styles.boqFooter} fixed>
              <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
              <Text>{projectInfo.title}</Text>
              <Text>{projectInfo.clientName}</Text>
            </View>
          </Page>
        ));
      }
    );
  };
  const calculateSectionTotal = (items: BOQItem[]): number => {
    return items.reduce((total, item) => {
      if (item.isHeader) return total;
      return total + (item.amount || 0);
    }, 0);
  };
  const calculatePreliminariesTotal = (): number => {
    if (!Array.isArray(preliminariesData)) return 0;
    return preliminariesData.reduce((total, prelim) => {
      return (
        total +
        prelim.items.reduce((subTotal, item) => {
          if (item.isHeader) return subTotal;
          return subTotal + (item.amount || 0);
        }, 0)
      );
    }, 0);
  };
  const preliminariesTotal = useMemo(
    () => calculatePreliminariesTotal(),
    [preliminariesData]
  );
  const calculateComprehensiveTotal = useMemo(() => {
    const baseTotal =
      preliminariesTotal +
      calculateMaterialsTotal +
      calculateEquipmentTotal +
      calculateServicesTotal +
      calculateSubcontractorsTotal +
      calculateAddonsTotal;
    if (calculationSummary) {
      return calculationSummary.total_amount;
    }
    return baseTotal;
  }, [
    preliminariesTotal,
    calculateMaterialsTotal,
    calculateEquipmentTotal,
    calculateServicesTotal,
    calculateSubcontractorsTotal,
    calculateAddonsTotal,
    calculationSummary,
  ]);
  const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };
  const CompanyHeader = () => (
    <View style={styles.companyHeader}>
      {projectInfo.logoUrl ? (
        <Image style={styles.logoContainer} source={projectInfo.logoUrl} />
      ) : projectInfo.companyName ? (
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            {projectInfo.companyName
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </Text>
        </View>
      ) : null}

      {(projectInfo.companyName || projectInfo.companyTagline) && (
        <View style={styles.companyInfo}>
          {projectInfo.companyName && (
            <Text style={styles.companyName}>{projectInfo.companyName}</Text>
          )}
          {projectInfo.companyTagline && (
            <Text style={styles.companyTagline}>
              {projectInfo.companyTagline}
            </Text>
          )}
        </View>
      )}
    </View>
  );
  const renderEquipmentSummary = (equipment: EquipmentItem[]) => {
    if (!equipment || equipment.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EQUIPMENT SUMMARY</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColHeader, { width: "70%" }]}>
              EQUIPMENT
            </Text>
            <Text style={[styles.tableColHeader, { width: "30%" }]}>
              COST (KSh)
            </Text>
          </View>
          {equipment.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableColDescription, { width: "70%" }]}>
                {item.name}
              </Text>
              <Text style={[styles.tableColAmount, { width: "30%" }]}>
                {formatCurrency(item.total_cost)}
              </Text>
            </View>
          ))}
          <View style={[styles.tableRow, styles.headerRow]}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              TOTAL EQUIPMENT COST:
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(
                equipment.reduce((sum, item) => sum + item.total_cost, 0)
              )}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  const renderServicesSummary = (services: AdditionalService[]) => {
    if (!services || services.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ADDITIONAL SERVICES</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColHeader, { width: "70%" }]}>
              SERVICE
            </Text>
            <Text style={[styles.tableColHeader, { width: "30%" }]}>
              COST (KSh)
            </Text>
          </View>
          {services.map((service, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableColDescription, { width: "70%" }]}>
                {service.name}
              </Text>
              <Text style={[styles.tableColAmount, { width: "30%" }]}>
                {formatCurrency(service.price)}
              </Text>
            </View>
          ))}
          <View style={[styles.tableRow, styles.headerRow]}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              TOTAL SERVICES COST:
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(
                services.reduce((sum, service) => sum + service.price, 0)
              )}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  const renderSubcontractorsSummary = (subcontractors: Subcontractor[]) => {
    if (!subcontractors || subcontractors.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUBCONTRACTORS</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColHeader, { width: "40%" }]}>
              SUBCONTRACTOR
            </Text>
            <Text style={[styles.tableColHeader, { width: "20%" }]}>
              RATE TYPE
            </Text>
            <Text style={[styles.tableColHeader, { width: "20%" }]}>
              DAYS/AMOUNT
            </Text>
            <Text style={[styles.tableColHeader, { width: "20%" }]}>
              TOTAL (KSh)
            </Text>
          </View>
          {subcontractors.map((sub, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableColDescription, { width: "40%" }]}>
                {sub.name}
              </Text>
              <Text style={[styles.tableCol, { width: "20%" }]}>
                {sub.subcontractor_payment_plan}
              </Text>
              <Text style={[styles.tableCol, { width: "20%" }]}>
                {sub.subcontractor_payment_plan?.toLowerCase() === "daily"
                  ? `${sub.days} days`
                  : formatCurrency(sub.price)}
              </Text>
              <Text style={[styles.tableColAmount, { width: "20%" }]}>
                {formatCurrency(sub.total)}
              </Text>
            </View>
          ))}
          <View style={[styles.tableRow, styles.headerRow]}>
            <Text style={[styles.tableColDescription, { width: "80%" }]}>
              TOTAL SUBCONTRACTOR COST:
            </Text>
            <Text style={[styles.tableColAmount, { width: "20%" }]}>
              {formatCurrency(
                subcontractors.reduce((sum, sub) => sum + sub.total, 0)
              )}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  const renderAddonsSummary = (addons: Addon[]) => {
    if (!addons || addons.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ADDITIONAL ITEMS</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColHeader, { width: "70%" }]}>ITEM</Text>
            <Text style={[styles.tableColHeader, { width: "30%" }]}>
              COST (KSh)
            </Text>
          </View>
          {addons.map((addon, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableColDescription, { width: "70%" }]}>
                {addon.name}
              </Text>
              <Text style={[styles.tableColAmount, { width: "30%" }]}>
                {formatCurrency(addon.price)}
              </Text>
            </View>
          ))}
          <View style={[styles.tableRow, styles.headerRow]}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              TOTAL ADDITIONAL ITEMS:
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(
                addons.reduce((sum, addon) => sum + addon.price, 0)
              )}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  const renderCalculationSummary = (summary: CalculationSummary) => {
    if (!summary) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COST BREAKDOWN SUMMARY</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.headerRow]}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              DIRECT COSTS
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              AMOUNT (KSh)
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Materials Cost
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.materials_cost)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Labor Cost
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.labor_cost)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Equipment Cost
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.equipment_cost)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Transport Cost
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.transport_costs)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Services Cost
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.services_cost)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Subcontractors Cost
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.subcontractors_cost)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Preliminaries Cost
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.preliminaries_cost)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Additional Items Cost
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.addons_cost)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Permit Cost
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.permit_cost)}
            </Text>
          </View>

          <View style={[styles.tableRow, styles.headerRow]}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              SUBTOTAL (Before Overhead & Contingency)
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.subtotal)}
            </Text>
          </View>

          <View style={[styles.tableRow, styles.headerRow]}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              INDIRECT COSTS
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              AMOUNT (KSh)
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Overhead ({summary.percentages?.[0]?.overhead || 0}%)
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.overhead_amount)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Contingency ({summary.percentages?.[0]?.contingency || 0}%)
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.contingency_amount)}
            </Text>
          </View>

          <View style={[styles.tableRow, styles.headerRow]}>
            <Text style={[styles.tableColDescription, { width: "70%" }]}>
              Profit ({summary.percentages?.[0]?.profit || 0}%)
            </Text>
            <Text style={[styles.tableColAmount, { width: "30%" }]}>
              {formatCurrency(summary.profit_amount)}
            </Text>
          </View>

          <View
            style={[
              styles.tableRow,
              styles.headerRow,
              { backgroundColor: "#3B82F6" },
            ]}
          >
            <Text
              style={[
                styles.tableColDescription,
                { width: "70%", color: "#FFFFFF" },
              ]}
            >
              GRAND TOTAL
            </Text>
            <Text
              style={[
                styles.tableColAmount,
                { width: "30%", color: "#FFFFFF" },
              ]}
            >
              {formatCurrency(summary.total_amount)}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <Document>
      <Page size="A4" style={styles.prelimPage}>
        <CompanyHeader />

        <View style={styles.header}>
          <Text style={styles.title}>BILL OF QUANTITIES</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.title}>{projectInfo.title || "PROJECT"}</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.subtitle}>
            {projectInfo.clientName || "CLIENT"}
          </Text>
          <Text style={styles.subtitle}>
            ({projectInfo.location || "LOCATION"})
          </Text>
        </View>

        <View style={styles.projectInfoContainer}>
          <Text style={styles.prelimSubtitle}>PROJECT INFORMATION:</Text>
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Client:</Text>
            <Text style={styles.projectInfoValue}>
              {projectInfo.clientName || "Not provided"}
            </Text>
          </View>
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Location:</Text>
            <Text style={styles.projectInfoValue}>
              {projectInfo.location || "Not provided"}
            </Text>
          </View>
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Project Type:</Text>
            <Text style={styles.projectInfoValue}>
              {projectInfo.projectType || "Not provided"}
            </Text>
          </View>
          {projectInfo.consultant && (
            <View style={styles.projectInfoRow}>
              <Text style={styles.projectInfoLabel}>Consultant:</Text>
              <Text style={styles.projectInfoValue}>
                {projectInfo.consultant}
              </Text>
            </View>
          )}
          {projectInfo.contractor && (
            <View style={styles.projectInfoRow}>
              <Text style={styles.projectInfoLabel}>Contractor:</Text>
              <Text style={styles.projectInfoValue}>
                {projectInfo.contractor}
              </Text>
            </View>
          )}
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Date:</Text>
            <Text style={styles.projectInfoValue}>
              {projectInfo.date || "Not provided"}
            </Text>
          </View>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>

      {preliminariesData.length > 0 && (
        <Page size="A4" style={styles.prelimPage}>
          <CompanyHeader />

          {/* Remove this duplicate title mapping - it shows all titles at once */}
          {/* {preliminariesData.map((items, index) => (
      <Text style={styles.prelimTitle}>{items.title}</Text>
    ))} */}

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableColHeader, { width: "10%" }]}>
                ITEM
              </Text>
              <Text
                style={[styles.tableColHeaderDescription, { width: "70%" }]}
              >
                DESCRIPTION
              </Text>
              <Text style={[styles.tableColHeader, { width: "20%" }]}>
                AMOUNT (KSh)
              </Text>
            </View>

            {preliminariesData.map((category, categoryIndex) => (
              <View key={`category-${categoryIndex}`}>
                {/* Category Header Row */}
                <View style={[styles.tableRow, { backgroundColor: "#F3F4F6" }]}>
                  <Text style={[styles.tableCol, { width: "10%" }]}></Text>
                  <Text
                    style={[
                      styles.tableColDescription,
                      { width: "70%", fontWeight: "bold" },
                    ]}
                  >
                    {category.title}
                  </Text>
                  <Text
                    style={[styles.tableColAmount, { width: "20%" }]}
                  ></Text>
                </View>

                {/* Category Items */}
                {category.items.map((item, itemIndex) => {
                  if (item.isHeader) {
                    return (
                      <View
                        style={[
                          styles.tableRow,
                          { backgroundColor: "#F3F4F6" },
                        ]}
                        key={`item-header-${categoryIndex}-${itemIndex}`}
                      >
                        <Text
                          style={[styles.tableCol, { width: "10%" }]}
                        ></Text>
                        <Text
                          style={[
                            styles.tableColDescription,
                            { width: "70%", fontWeight: "bold" },
                          ]}
                        >
                          {item.description}
                        </Text>
                        <Text
                          style={[styles.tableColAmount, { width: "20%" }]}
                        ></Text>
                      </View>
                    );
                  }
                  return (
                    <View
                      style={styles.tableRow}
                      key={`item-${categoryIndex}-${itemIndex}`}
                    >
                      <Text style={[styles.tableCol, { width: "10%" }]}>
                        {item.itemNo}
                      </Text>
                      <Text
                        style={[styles.tableColDescription, { width: "70%" }]}
                      >
                        {item.description}
                      </Text>
                      <Text style={[styles.tableColAmount, { width: "20%" }]}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}

            <View style={[styles.tableRow, { backgroundColor: "#F3F4F6" }]}>
              <Text
                style={[
                  styles.tableColDescription,
                  { width: "80%", fontWeight: "bold" },
                ]}
              >
                TOTAL FOR PRELIMINARIES:
              </Text>
              <Text
                style={[
                  styles.tableColAmount,
                  { width: "20%", fontWeight: "bold" },
                ]}
              >
                {formatCurrency(preliminariesTotal)}
              </Text>
            </View>
          </View>

          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
            fixed
          />
        </Page>
      )}

      {nonEmptySections.map((section, sectionIndex) => {
        const displayItems = section.items;
        const sectionTotal = calculateSectionTotal(section.items);
        const itemChunks = chunkArray(displayItems, 20);
        return itemChunks.map((chunk, chunkIndex) => (
          <Page
            size="A4"
            style={styles.page}
            key={`section-${sectionIndex}-chunk-${chunkIndex}`}
          >
            <CompanyHeader />

            {chunkIndex === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}

            <View style={styles.table}>
              {chunkIndex === 0 && (
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableColHeader, { width: "12%" }]}>
                    ITEM
                  </Text>
                  <Text
                    style={[styles.tableColHeaderDescription, { width: "48%" }]}
                  >
                    DESCRIPTION
                  </Text>
                  <Text style={[styles.tableColHeader, { width: "8%" }]}>
                    UNIT
                  </Text>
                  <Text style={[styles.tableColHeader, { width: "10%" }]}>
                    QTY
                  </Text>
                  <Text style={[styles.tableColHeader, { width: "11%" }]}>
                    RATE (KSh)
                  </Text>
                  <Text style={[styles.tableColHeader, { width: "11%" }]}>
                    AMOUNT (KSh)
                  </Text>
                </View>
              )}

              {chunk.map((item, itemIndex) => {
                if (item.isHeader) {
                  return (
                    <View
                      style={[styles.tableRow, { backgroundColor: "#F3F4F6" }]}
                      key={`header-${sectionIndex}-${chunkIndex}-${itemIndex}`}
                    >
                      <Text style={[styles.tableCol, { width: "12%" }]}></Text>
                      <Text
                        style={[
                          styles.tableColDescription,
                          { width: "48%", fontWeight: "bold" },
                        ]}
                      >
                        {item.description}
                      </Text>
                      <Text style={[styles.tableCol, { width: "8%" }]}></Text>
                      <Text style={[styles.tableCol, { width: "10%" }]}></Text>
                      <Text style={[styles.tableCol, { width: "11%" }]}></Text>
                      <Text
                        style={[styles.tableColAmount, { width: "11%" }]}
                      ></Text>
                    </View>
                  );
                }
                return (
                  <View
                    style={styles.tableRow}
                    key={`item-${sectionIndex}-${chunkIndex}-${itemIndex}`}
                  >
                    <Text style={[styles.tableCol, { width: "12%" }]}>
                      {item.itemNo}
                    </Text>
                    <Text
                      style={[styles.tableColDescription, { width: "48%" }]}
                    >
                      {item.description}
                    </Text>
                    <Text style={[styles.tableCol, { width: "8%" }]}>
                      {item.unit}
                    </Text>
                    <Text style={[styles.tableCol, { width: "10%" }]}>
                      {formatQuantity(item.quantity)}
                    </Text>
                    <Text style={[styles.tableCol, { width: "11%" }]}>
                      {formatCurrency(item.rate)}
                    </Text>
                    <Text style={[styles.tableColAmount, { width: "11%" }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                );
              })}
            </View>

            {chunkIndex === itemChunks.length - 1 && (
              <View style={styles.sectionTotalRow}>
                <Text style={styles.sectionTotalLabel}>
                  TOTAL FOR{" "}
                  {section.title.toUpperCase().replace("ELEMENT ", "")}:
                </Text>
                <Text style={styles.sectionTotalValue}>
                  {formatCurrency(sectionTotal)}
                </Text>
              </View>
            )}

            <View style={styles.boqFooter} fixed>
              <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
              <Text>{projectInfo.title}</Text>
              <Text>{projectInfo.clientName}</Text>
            </View>
          </Page>
        ));
      })}

      {consolidatedMaterials.length > 0 &&
        renderConsolidatedMaterials(consolidatedMaterials)}

      {renderSubcontractorsPage(subcontractors)}

      <Page size="A4" style={styles.page}>
        <CompanyHeader />
        <View style={styles.header}>
          <Text style={styles.title}>COMPREHENSIVE COST SUMMARY</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COST BREAKDOWN</Text>

          <View style={styles.table}>
            {preliminariesData.length > 0 && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableColDescription, { width: "70%" }]}>
                  Preliminaries:
                </Text>
                <Text style={[styles.tableColAmount, { width: "30%" }]}>
                  {formatCurrency(preliminariesTotal)}
                </Text>
              </View>
            )}

            {consolidatedMaterials.length > 0 && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableColDescription, { width: "70%" }]}>
                  Materials:
                </Text>
                <Text style={[styles.tableColAmount, { width: "30%" }]}>
                  {formatCurrency(
                    consolidatedMaterials.reduce((sum, m) => sum + m.amount, 0)
                  )}
                </Text>
              </View>
            )}

            {subcontractors.length > 0 && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableColDescription, { width: "70%" }]}>
                  Subcontractors:
                </Text>
                <Text style={[styles.tableColAmount, { width: "30%" }]}>
                  {formatCurrency(
                    subcontractors.reduce((sum, sub) => sum + sub.total, 0)
                  )}
                </Text>
              </View>
            )}

            <View style={[styles.tableRow, styles.headerRow]}>
              <Text style={[styles.tableColDescription, { width: "70%" }]}>
                SUBTOTAL:
              </Text>
              <Text style={[styles.tableColAmount, { width: "30%" }]}>
                {formatCurrency(
                  preliminariesTotal +
                    consolidatedMaterials.reduce(
                      (sum, m) => sum + m.amount,
                      0
                    ) +
                    subcontractors.reduce((sum, sub) => sum + sub.total, 0)
                )}
              </Text>
            </View>
          </View>
        </View>

        {calculationSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADDITIONAL COSTS & MARGINS</Text>

            <View style={styles.table}>
              {calculationSummary.overhead_amount > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableColDescription, { width: "70%" }]}>
                    Overhead (
                    {calculationSummary.percentages?.[0]?.overhead || 0}%):
                  </Text>
                  <Text style={[styles.tableColAmount, { width: "30%" }]}>
                    {formatCurrency(overhead_amount)}
                  </Text>
                </View>
              )}

              {calculationSummary.contingency_amount > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableColDescription, { width: "70%" }]}>
                    Contingency (
                    {calculationSummary.percentages?.[0]?.contingency || 0}%):
                  </Text>
                  <Text style={[styles.tableColAmount, { width: "30%" }]}>
                    {formatCurrency(contingency_amount)}
                  </Text>
                </View>
              )}

              {calculationSummary.labor_cost > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableColDescription, { width: "70%" }]}>
                    Labor(
                    {calculationSummary.percentages?.[0]?.labour || 0}%):
                  </Text>
                  <Text style={[styles.tableColAmount, { width: "30%" }]}>
                    {formatCurrency(labour)}
                  </Text>
                </View>
              )}

              {calculationSummary.permit_cost > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableColDescription, { width: "70%" }]}>
                    Permit(
                    {calculationSummary.percentages?.[0]?.permit || 0}%):
                  </Text>
                  <Text style={[styles.tableColAmount, { width: "30%" }]}>
                    {formatCurrency(permits)}
                  </Text>
                </View>
              )}

              {contractType && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableColDescription, { width: "70%" }]}>
                    Contract type:
                  </Text>
                  <Text style={[styles.tableColAmount, { width: "30%" }]}>
                    {contractType}
                  </Text>
                </View>
              )}

              {calculationSummary.profit_amount > 0 && (
                <View style={[styles.tableRow]}>
                  <Text style={[styles.tableColDescription, { width: "70%" }]}>
                    Profit Margin (
                    {calculationSummary.percentages?.[0]?.profit || 0}%):
                  </Text>
                  <Text style={[styles.tableColAmount, { width: "30%" }]}>
                    {formatCurrency(profit)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={[styles.section, { marginTop: 10 }]}>
          <View style={[styles.table, { border: "2pt solid #3B82F6" }]}>
            <View style={[styles.tableRow, { backgroundColor: "#3B82F6" }]}>
              <Text
                style={[
                  styles.tableColDescription,
                  { width: "70%", color: "#FFFFFF", fontWeight: "bold" },
                ]}
              >
                GRAND TOTAL:
              </Text>
              <Text
                style={[
                  styles.tableColAmount,
                  { width: "30%", color: "#FFFFFF", fontWeight: "bold" },
                ]}
              >
                {formatCurrency(
                  calculationSummary?.total_amount ||
                    preliminariesTotal +
                      consolidatedMaterials.reduce(
                        (sum, m) => sum + m.amount,
                        0
                      ) +
                      subcontractors.reduce((sum, sub) => sum + sub.total, 0) +
                      profit +
                      overhead_amount +
                      contingency_amount +
                      labour
                )}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { marginTop: 15 }]}>
          <Text style={[styles.prelimSubtitle, { marginBottom: 5 }]}>
            SUMMARY NOTES:
          </Text>
          <Text style={[styles.prelimContent, { fontSize: 9 }]}>
            • All amounts are in Kenyan Shillings (KES)
            {calculationSummary &&
              ` • Includes ${
                calculationSummary.percentages?.[0]?.profit || 0
              }% profit margin`}
            {calculationSummary &&
              calculationSummary.percentages?.[0]?.contingency > 0 &&
              ` • Includes ${calculationSummary.percentages?.[0]?.contingency}% contingency`}
            • Valid for 30 days from {projectInfo.date || "date of issue"}
          </Text>
          <Text style={[styles.boldText, { marginBottom: 5 }]}>
            Made using JTech AI <Target className="text-primary" />
          </Text>
        </View>

        <View style={styles.boqFooter} fixed>
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
          <Text>{projectInfo.title}</Text>
          <Text>{projectInfo.clientName}</Text>
        </View>
      </Page>
    </Document>
  );
};
export default PDFGenerator;
