// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  FolderPlus,
  Type,
  GripVertical,
  RefreshCw,
  Brain,
  AlertCircle,
} from "lucide-react";
import { BOQItem, BOQSection } from "@/types/boq";
import { supabase } from "@/integrations/supabase/client";

interface BOQBuilderProps {
  quoteData: any;
  onBOQUpdate: (boqData: BOQSection[]) => void;
}

const BOQBuilder = ({ quoteData, onBOQUpdate }: BOQBuilderProps) => {
  const [boqSections, setBoqSections] = useState<BOQSection[]>([]);
  const [editingItem, setEditingItem] = useState<{
    sectionIndex: number;
    itemIndex: number;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMethod, setGenerationMethod] = useState<
    "existing" | "ai" | "local" | "mock" | "none"
  >("none");
  const [lastError, setLastError] = useState<string | null>(null);

  // Safe array access helper
  const getSafeArray = (data: any): BOQSection[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.boqSections && Array.isArray(data.boqSections))
      return data.boqSections;
    if (data.boq_data && Array.isArray(data.boq_data)) return data.boq_data;
    return [];
  };

  // Initialize BOQ from existing quoteData or generate new only if empty
  useEffect(() => {
    const initializeBOQ = async () => {
      if (!quoteData || Object.keys(quoteData).length === 0) {
        setBoqSections([]);
        onBOQUpdate([]);
        setGenerationMethod("none");
        return;
      }

      // Check if quoteData already has BOQ sections
      const existingSections = getSafeArray(quoteData);
      if (existingSections.length > 0) {
        setBoqSections(existingSections);
        onBOQUpdate(existingSections);
        setGenerationMethod("existing");
        return;
      }

      // Only generate new BOQ if there's no existing data AND user hasn't manually added sections
      if (boqSections.length === 0) {
        setIsGenerating(true);
        setLastError(null);

        try {
          const { data: boq } = await supabase.functions.invoke(
            "generate-boq-ai",
            {
              body: quoteData,
            }
          );

          const newSections = JSON.parse(boq);
          if (newSections.length > 0) {
            setBoqSections(newSections);
            onBOQUpdate(newSections);
            setGenerationMethod("ai");
          } else {
            throw new Error("No BOQ data generated");
          }
        } catch (error) {
          console.error("AI BOQ generation failed:", error);
          setLastError("AI generation failed, using fallback data");
          // Set fallback empty sections
          const fallbackSections: BOQSection[] = [
            {
              title: "Default Section",
              items: [],
            },
          ];
          setBoqSections(fallbackSections);
          onBOQUpdate(fallbackSections);
          setGenerationMethod("local");
        } finally {
          setIsGenerating(false);
        }
      }
    };

    initializeBOQ();
  }, [quoteData]);

  const regenerateWithAI = async () => {
    setIsGenerating(true);
    setLastError(null);

    try {
      const { data: newBOQ, error } = await supabase.functions.invoke(
        "generate-boq-ai",
        {
          body: quoteData,
        }
      );
      if (error) {
        throw error;
      }

      const newSections = JSON.parse(newBOQ);
      if (newBOQ) {
        setBoqSections(newSections);
        onBOQUpdate(newSections);
        setGenerationMethod("ai");
        setLastError(null);
      } else {
        throw new Error("No BOQ data generated");
      }
    } catch (error) {
      console.error("Regeneration failed:", error);
      setLastError(
        error instanceof Error ? error.message : "Regeneration failed"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const updateItem = (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => {
    const newSections = [...boqSections];
    const item = newSections[sectionIndex].items[itemIndex];

    if (field === "quantity" || field === "rate") {
      const numValue = parseFloat(value) || 0;
      item[field] = numValue;

      if (!item.isHeader) {
        item.amount = (item.quantity || 0) * (item.rate || 0);
      }
    } else {
      item[field] = value;
    }

    setBoqSections(newSections);
    onBOQUpdate(newSections);
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...boqSections];
    newSections[sectionIndex].items.splice(itemIndex, 1);
    setBoqSections(newSections);
    onBOQUpdate(newSections);
  };

  const addCustomItem = (sectionIndex: number) => {
    const newSections = [...boqSections];
    const section = newSections[sectionIndex];

    newSections[sectionIndex].items.push({
      itemNo: `${sectionIndex + 1}.${section.items.length + 1}`,
      description: "Custom Item - Please edit",
      unit: "No",
      quantity: 1,
      rate: 0,
      amount: 0,
      category: section.title,
      element: "Custom",
      isHeader: false,
    });

    setBoqSections(newSections);
    onBOQUpdate(newSections);
  };

  const addHeaderItem = (sectionIndex: number) => {
    const newSections = [...boqSections];
    newSections[sectionIndex].items.push({
      itemNo: "",
      description: "Section Header - Please edit",
      unit: "",
      quantity: 0,
      rate: 0,
      amount: 0,
      category: newSections[sectionIndex].title,
      element: "Header",
      isHeader: true,
    });
    setBoqSections(newSections);
    onBOQUpdate(newSections);
  };

  const addCustomSection = () => {
    const newSections = [
      ...boqSections,
      {
        title: `Custom Section ${boqSections.length + 1}`,
        items: [],
      },
    ];
    setBoqSections(newSections);
    onBOQUpdate(newSections);
  };

  const updateSectionTitle = (sectionIndex: number, title: string) => {
    const newSections = [...boqSections];
    newSections[sectionIndex].title = title;
    setBoqSections(newSections);
    onBOQUpdate(newSections);
  };

  const removeSection = (sectionIndex: number) => {
    if (boqSections.length <= 1) return;
    const newSections = [...boqSections];
    newSections.splice(sectionIndex, 1);
    setBoqSections(newSections);
    onBOQUpdate(newSections);
  };

  const calculateSectionTotal = (items: BOQItem[]): number => {
    return items.reduce((total, item) => {
      if (item.isHeader) return total;
      return total + (item.amount || 0);
    }, 0);
  };

  const calculateGrandTotal = (): number => {
    return boqSections.reduce((total, section) => {
      return total + calculateSectionTotal(section.items);
    }, 0);
  };

  // Safe rendering - ensure boqSections is always an array
  const safeSections = Array.isArray(boqSections) ? boqSections : [];

  if (isGenerating) {
    return (
      <div className="flex flex-col justify-center items-center p-8 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <div className="text-center">
          <div className="font-semibold">Generating Professional BOQ</div>
        </div>
      </div>
    );
  }

  if (safeSections.length === 0 && !isGenerating) {
    return (
      <div className="flex flex-col justify-center items-center p-8 space-y-4">
        <Brain className="w-12 h-12 text-muted-foreground" />
        <div className="text-center">
          <div className="font-semibold">No BOQ Data Available</div>
          <div className="text-sm text-muted-foreground mb-4">
            {lastError
              ? `Error: ${lastError}`
              : "Insufficient data to generate BOQ"}
          </div>
          <Button onClick={regenerateWithAI} disabled={isGenerating}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate BOQ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex flex-1 sm:space-y-0 space-y-1 justify-between items-center">
        <div className="flex space-x-2">
          <Button className="text-white" onClick={addCustomSection}>
            <FolderPlus className="w-4 h-4 mr-2" /> Add Section
          </Button>
          <Button
            variant="outline"
            onClick={regenerateWithAI}
            disabled={isGenerating}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate with AI
          </Button>
        </div>
        <div className="sm:flex flex-1 items-center space-x-2">
          {lastError && (
            <div className="flex items-center text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {lastError}
            </div>
          )}
          <div
            className={`px-2 py-1 rounded-full text-sm ${
              generationMethod === "existing"
                ? "bg-green-100 text-green-800"
                : generationMethod === "ai"
                ? "bg-green-100 text-green-800"
                : generationMethod === "local"
                ? "bg-blue-100 text-blue-800"
                : generationMethod === "mock"
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {generationMethod === "ai" || generationMethod === "existing" ? (
              <Brain className="w-3 h-3 inline mr-1" />
            ) : null}
            {generationMethod.toUpperCase()}
          </div>
        </div>
      </div>

      {/* BOQ Sections Rendering - Using safeSections */}
      {safeSections.map((section, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Input
              value={section.title}
              onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
              className="bg-background text-lg font-semibold border-none focus:ring-0"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSection(sectionIndex)}
              disabled={safeSections.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item No.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate (KSh)</TableHead>
                  <TableHead>Amount (KSh)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items?.map((item, itemIndex) => (
                  <TableRow
                    key={itemIndex}
                    className={`
                      ${item.isHeader ? "bg-muted/50 font-semibold" : ""}
                      ${item.isHeader ? "" : "hover:bg-muted/30"}
                    `}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!item.isHeader && (
                          <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        {item.itemNo}
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingItem?.sectionIndex === sectionIndex &&
                      editingItem?.itemIndex === itemIndex ? (
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(
                              sectionIndex,
                              itemIndex,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div className={item.isHeader ? "font-semibold" : ""}>
                          {item.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? (
                        ""
                      ) : editingItem?.sectionIndex === sectionIndex &&
                        editingItem?.itemIndex === itemIndex ? (
                        <Select
                          value={item.unit}
                          onValueChange={(value) =>
                            updateItem(sectionIndex, itemIndex, "unit", value)
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="m²">m²</SelectItem>
                            <SelectItem value="m³">m³</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Lm">Lm</SelectItem>
                            <SelectItem value="Roll">Roll</SelectItem>
                            <SelectItem value="Liter">Liter</SelectItem>
                            <SelectItem value="Sum">Sum</SelectItem>
                            <SelectItem value="Bag">Bag</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        item.unit
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? (
                        ""
                      ) : editingItem?.sectionIndex === sectionIndex &&
                        editingItem?.itemIndex === itemIndex ? (
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              sectionIndex,
                              itemIndex,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-20"
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? (
                        ""
                      ) : editingItem?.sectionIndex === sectionIndex &&
                        editingItem?.itemIndex === itemIndex ? (
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(
                              sectionIndex,
                              itemIndex,
                              "rate",
                              e.target.value
                            )
                          }
                          className="w-24"
                        />
                      ) : (
                        item.rate?.toLocaleString()
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isHeader ? "" : item.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (
                              editingItem?.sectionIndex === sectionIndex &&
                              editingItem?.itemIndex === itemIndex
                            ) {
                              setEditingItem(null);
                            } else {
                              setEditingItem({ sectionIndex, itemIndex });
                            }
                          }}
                        >
                          {editingItem?.sectionIndex === sectionIndex &&
                          editingItem?.itemIndex === itemIndex ? (
                            <Save className="w-4 h-4" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(sectionIndex, itemIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="bg-muted font-semibold">
                  <TableCell colSpan={5} className="text-right">
                    Section Total:
                  </TableCell>
                  <TableCell className="font-bold">
                    KSh{" "}
                    {calculateSectionTotal(
                      section.items || []
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addCustomItem(sectionIndex)}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addHeaderItem(sectionIndex)}
              >
                <Type className="w-4 h-4 mr-2" /> Add Header
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-primary/10 border-primary">
        <CardHeader>
          <CardTitle className="text-primary">Grand Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            KSh {calculateGrandTotal().toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BOQBuilder;
