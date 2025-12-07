// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { pdf } from "@react-pdf/renderer";
import React from "react";
import { BOQSection } from "@/types/boq";
import {
  AdvancedMaterialExtractor,
  MaterialSchedule,
} from "./advancedMaterialExtractor";
import { MaterialConsolidator } from "./materialConsolidator";
import PDFGeneratorComponent from "@/components/PDFGenerator";
interface ProjectInfo {
  title: string;
  companyName: string;
  clientName: string;
  clientEmail: string;
  location: string;
  projectType: string;
  houseType: string;
  region: string;
  floors: number;
  date: string;
  logoUrl: string;
}
const exportBOQPDF = async (
  boqData: BOQSection[],
  projectInfo: ProjectInfo,
  preliminaries: any[],
  quote: any,
  isClientExport: boolean = false
): Promise<boolean> => {
  try {
    let materialSchedule: any[] = [];
    if (
      quote?.concrete_materials ||
      quote?.rebar_calculations ||
      quote?.rooms
    ) {
      try {
        const rawSchedule: MaterialSchedule =
          await AdvancedMaterialExtractor.extractWithGemini(quote);
        materialSchedule = MaterialConsolidator.consolidateAllMaterials(
          Object.values(rawSchedule).flat()
        );
      } catch (error) {
        console.warn(
          "AI extraction failed, falling back to local extraction:",
          error
        );
        const rawSchedule = AdvancedMaterialExtractor.extractLocally(quote);
        materialSchedule = MaterialConsolidator.consolidateAllMaterials(
          Object.values(rawSchedule).flat()
        );
      }
    }
    const pdfReactElement = React.createElement(PDFGeneratorComponent, {
      boqData,
      projectInfo,
      preliminariesData: preliminaries,
      materialSchedule,
      equipmentItems: quote.equipment,
      additionalServices: quote.services,
      calculationSummary: quote,
      subcontractors: quote.subcontractors,
      addons: quote.addons,
      transportCost: quote.transport_costs,
      contractType: quote.contract_type,
      profit: quote.profit_amount,
      contingency_amount: quote.contingency_amount,
      overhead_amount: quote.overhead_amount,
      labour: quote.labor_cost,
      permits: quote.permit_cost,
      isClientExport,
    });
    const blob = await pdf(pdfReactElement as any).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filenameTitle = projectInfo.title
      .replace(/[^a-z0-9_\-\s]/gi, "_")
      .replace(/\s+/g, "_");
    link.href = url;
    link.download = `BOQ_${filenameTitle}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    return true;
  } catch (error) {
    console.error("Error generating or downloading PDF:", error);
    return false;
  }
};
export { exportBOQPDF };
export type { ProjectInfo };
