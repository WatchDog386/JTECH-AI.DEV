// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Clock, MapPin, User, Building2 } from "lucide-react";
import { exportQuote } from "@/utils/exportUtils";
import { toast } from "@/hooks/use-toast";

interface QuoteExportDialogProps {
  quote: any;
  open: boolean;
  contractorName: string;
  companyName: string;
  onOpenChange: (open: boolean) => void;
  logoUrl: string;
}

export const QuoteExportDialog = ({
  quote,
  open,
  onOpenChange,
  contractorName,
  companyName,
  logoUrl,
}: QuoteExportDialogProps) => {
  const [exportType, setExportType] = useState<"client" | "contractor">(
    "contractor"
  );
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "docx">(
    "pdf"
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const success = await exportQuote({
        format: exportFormat,
        audience: exportType,
        quote,
        projectInfo: {
          title: quote.title,
          date: new Date().toLocaleDateString(),
          clientName: quote.client_name,
          clientEmail: quote.client_email,
          location: quote.location,
          projectType: quote.project_type,
          houseType: quote.house_type,
          region: quote.region,
          floors: quote.floors,
          companyName,
          logoUrl,
        },
      });

      toast({
        title: success
          ? "Document generated successfully"
          : "Error generating document",
        description: success
          ? "Your file has been downloaded"
          : "Please try again",
        variant: success ? "default" : "destructive",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error generating document",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      onOpenChange(false);
    }
  };

  return (
    <div className="space-y-6">
      {isProcessing ? (
        <div className="flex flex-col items-center justify-center space-y-3 bg-green-50 dark:bg-green-900 border border-green-400 rounded-lg p-4">
          <Clock className="w-8 h-8 text-green-600 dark:text-green-300 animate-spin" />
          <p className="text-green-700 dark:text-green-400 font-semibold text-center text-lg">
            Processing your Document...
          </p>
          <p className="text-green-700 dark:text-green-400 text-sm text-center">
            This may take a few seconds. Please do not close the dialog.
          </p>
        </div>
      ) : (
        <>
          {/* Quote Info Section */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2 border border-muted">
            <h3 className="text-lg font-semibold text-white">Quote Summary</h3>
            <div className="text-sm dark:text-gray-300 text-white space-y-1">
              <p className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />{" "}
                <span className="font-medium">Project:</span>{" "}
                {quote?.title || "—"}
              </p>
              <p className="flex items-center gap-2">
                <User className="w-4 h-4" />{" "}
                <span className="font-medium">Client:</span>{" "}
                {quote?.client_name || "—"}
              </p>
              <p className="flex items-center gap-2">
                <User className="w-4 h-4" />{" "}
                <span className="font-medium">Contractor:</span>{" "}
                {contractorName || "—"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />{" "}
                <span className="font-medium">Location:</span>{" "}
                {quote?.location || "—"}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" />{" "}
                <span className="font-medium">Date:</span>{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <div>
              <Label className="text-white">Export Type</Label>
              <Select
                onValueChange={(value: "client" | "contractor") =>
                  setExportType(value)
                }
                value={exportType}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select export type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client-Friendly</SelectItem>
                  <SelectItem value="contractor">
                    Full Contractor BOQ
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-gray-300 text-sm mt-1">
                {exportType === "client"
                  ? "Simplified version without cost breakdowns"
                  : "Detailed version with all cost calculations"}
              </p>
            </div>

            <div>
              <Label className="text-white">File Format</Label>
              <Select
                onValueChange={(value: "pdf" | "excel" | "docx") =>
                  setExportFormat(value)
                }
                value={exportFormat}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="docx">Docx (.docx)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExport}
              className="w-full text-white flex items-center justify-center space-x-2"
              disabled={isProcessing}
            >
              <Download className="w-5 h-5" />
              <span>
                {isProcessing
                  ? "Generating..."
                  : `Download ${exportFormat.toUpperCase()}`}
              </span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
