// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { exportBOQPDF } from "./exportBOQPDF";
import { generateQuoteExcel } from "./excelGenerator";
import { generateQuoteDOCX } from "./doxGenerator";
import {
  AdvancedMaterialExtractor,
  MaterialSchedule,
} from "@/utils/advancedMaterialExtractor";
import { MaterialConsolidator } from "@/utils/materialConsolidator";
export interface ExportOptions {
  format: "pdf" | "excel" | "docx";
  audience: "client" | "contractor";
  quote: any;
  projectInfo: ProjectInfo;
  logoUrl?: string;
}
export interface ProjectInfo {
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
  companyTagline?: string;
  consultant?: string;
  contractor?: string;
  drawingReference?: string;
  boqReference?: string;
}
export const exportQuote = async (options: ExportOptions): Promise<boolean> => {
  try {
    const { format, audience, quote, projectInfo, logoUrl } = options;
    let materialSchedule: any[] = [];
    if (format !== "pdf") {
      if (
        quote?.concrete_materials ||
        quote?.rebar_calculations ||
        quote?.rooms ||
        quote?.boq_data
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
          try {
            const rawSchedule = AdvancedMaterialExtractor.extractLocally(quote);
            materialSchedule = MaterialConsolidator.consolidateAllMaterials(
              Object.values(rawSchedule).flat()
            );
          } catch (localError) {
            console.error("Local extraction also failed:", localError);
          }
        }
      } else {
        if (Array.isArray(quote?.materialSchedule)) {
          materialSchedule = quote.materialSchedule;
        } else {
        }
      }
    }
    const enrichedQuote = {
      ...quote,
      materialSchedule,
    };
    switch (format) {
      case "pdf":
        return await exportBOQPDF(
          quote.boq_data,
          {
            ...projectInfo,
          },
          quote.preliminaries,
          quote,
          audience === "client"
        );
      case "excel":
        await generateQuoteExcel({
          quote: enrichedQuote,
          isClientExport: audience === "client",
        });
        return true;
      case "docx":
        await generateQuoteDOCX({
          quote: enrichedQuote,
          projectInfo: {
            ...projectInfo,
          },
          isClientExport: audience === "client",
        });
        return true;
      default:
        console.warn("Unknown export format:", format);
        return false;
    }
  } catch (error) {
    console.error("Error exporting document:", error);
    return false;
  }
};
