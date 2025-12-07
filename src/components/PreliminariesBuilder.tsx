// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  RefreshCw,
  Brain,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PrelimItem {
  itemNo: string;
  description: string;
  amount: number;
  isHeader?: boolean;
  source: "ai" | "user";
}

interface PrelimSection {
  title: string;
  items: PrelimItem[];
}

interface PreliminariesBuilderProps {
  quoteData: any;
  onPreliminariesUpdate: (sections: PrelimSection[]) => void;
  onSaveToQuote: (sections: PrelimSection[]) => void;
}

const PreliminariesBuilder = ({
  quoteData,
  onPreliminariesUpdate,
  onSaveToQuote,
}: PreliminariesBuilderProps) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{
    sectionIndex: number;
    itemIndex: number;
  } | null>(null);

  // Initialize sections from quoteData or create empty
  const initialSections: PrelimSection[] = useMemo(() => {
    const prelims = quoteData?.preliminaries;
    if (Array.isArray(prelims) && prelims.length > 0) {
      return JSON.parse(JSON.stringify(prelims));
    }
    return [{ title: "General Preliminaries", items: [] }];
  }, [quoteData?.preliminaries, user]);

  const [sections, setSections] = useState<PrelimSection[]>(initialSections);

  // Update local state when initialSections changes (on quoteData change)
  useEffect(() => {
    // Only load preliminaries from quoteData on first mount
    if (sections.length === 0 && initialSections.length > 0) {
      setSections(initialSections);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onSaveToQuote(sections);
  }, [sections]);

  const generateWithAI = async () => {
    if (!quoteData || Object.keys(quoteData).length === 0) {
      setLastError("No project data available for AI generation");
      return;
    }

    setIsGenerating(true);
    setLastError(null);

    try {
      const { data: aiSections } = await supabase.functions.invoke(
        "generate-preliminaries",
        {
          body: { quoteData },
        }
      );

      // Merge AI sections with existing user sections
      const mergedSections = mergeSectionsWithAI(sections, aiSections);

      setSections(mergedSections);
      updateSections(mergedSections);
    } catch (error) {
      console.error("Gemini AI generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const mergeSectionsWithAI = (
    existingSections: PrelimSection[],
    aiSections: PrelimSection[]
  ): PrelimSection[] => {
    // For each existing section, keep user items and replace AI items
    const mergedSections = existingSections.map((section) => {
      const userItems = section.items.filter((item) => item.source === "user");
      const aiSection = aiSections?.find(
        (aiSec) => aiSec.title === section.title
      );

      if (aiSection) {
        return {
          ...section,
          items: [...userItems, ...aiSection.items],
        };
      }
      return section;
    });

    // Add any new AI sections that don't exist in current sections
    aiSections?.forEach((aiSection) => {
      if (!mergedSections.find((sec) => sec.title === aiSection.title)) {
        mergedSections.push(aiSection);
      }
    });

    return mergedSections;
  };

  const calculateSectionTotal = (items: PrelimItem[]): number =>
    items.reduce((sum, i) => (i.isHeader ? sum : sum + (i.amount || 0)), 0);

  const calculateGrandTotal = (): number =>
    sections.reduce((sum, s) => sum + calculateSectionTotal(s.items), 0);

  const updateSectionTitle = (sectionIndex: number, title: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].title = title;
    setSections(newSections);
    updateSections(newSections);
  };

  const updateItem = (
    sectionIndex: number,
    itemIndex: number,
    field: keyof PrelimItem,
    value: any
  ) => {
    const newSections = [...sections];
    const item = newSections[sectionIndex].items[itemIndex];

    if (field === "amount") {
      item.amount = parseFloat(value) || 0;
    } else {
      (item as any)[field] = value;
    }

    // Mark as user input when edited
    if (field !== "source") {
      item.source = "user";
    }

    setSections(newSections);
    updateSections(newSections);
  };

  const updateSections = (newSections: PrelimSection[]) => {
    onPreliminariesUpdate(newSections);
    onSaveToQuote(newSections);
  };

  const addItem = (sectionIndex: number) => {
    const newSections = [...sections];
    const newItemNo = `P${
      newSections[sectionIndex].items.filter((i) => !i.isHeader).length + 1
    }`;
    newSections[sectionIndex].items.push({
      itemNo: newItemNo,
      description: "",
      amount: 0,
      source: "user",
    });
    setSections(newSections);
    updateSections(newSections);
  };

  const addHeader = (sectionIndex: number) => {
    const newSections = [...sections];
    const newItemNo = `HDR-${
      newSections[sectionIndex].items.filter((i) => i.isHeader).length + 1
    }`;
    newSections[sectionIndex].items.push({
      itemNo: newItemNo,
      description: "New Heading/Note",
      amount: 0,
      isHeader: true,
      source: "user",
    });
    setSections(newSections);
    updateSections(newSections);
  };

  const addSection = () => {
    const newSections = [
      ...sections,
      { title: `Section ${sections.length + 1}`, items: [] },
    ];
    setSections(newSections);
    updateSections(newSections);
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.splice(itemIndex, 1);
    setSections(newSections);
    updateSections(newSections);
  };

  const removeSection = (sectionIndex: number) => {
    if (sections.length <= 1) return;
    const newSections = [...sections];
    newSections.splice(sectionIndex, 1);
    setSections(newSections);
    updateSections(newSections);
  };

  const toggleEdit = (sectionIndex: number, itemIndex: number) => {
    setEditingItem((prev) => {
      if (
        prev?.sectionIndex === sectionIndex &&
        prev?.itemIndex === itemIndex
      ) {
        // When saving edits, ensure item is marked as user input
        const newSections = [...sections];
        const item = newSections[sectionIndex].items[itemIndex];
        if (item.source === "ai") {
          item.source = "user";
          updateSections(newSections);
        }
        return null;
      }
      return { sectionIndex, itemIndex };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button onClick={addSection} className="text-white">
            <FolderPlus className="w-4 h-4 mr-2" /> Add Section
          </Button>
          <Button
            onClick={generateWithAI}
            disabled={isGenerating}
            variant="outline"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? "Generating..." : "Generate with AI"}
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          {lastError && (
            <div className="flex items-center text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {lastError}
            </div>
          )}
        </div>
      </div>

      {isGenerating && (
        <div className="flex justify-center items-center p-4">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Generating preliminaries with AI...</span>
        </div>
      )}

      {sections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="">
          <CardHeader className="flex flex-row items-center justify-between">
            <Input
              value={section.title}
              onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
              className="bg-background text-lg font-semibold border-none focus:ring-0"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSection(sectionIndex)}
              disabled={sections.length <= 1}
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
                  <TableHead>Amount (KSh)</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((item, itemIndex) => {
                  const isEditing =
                    editingItem?.sectionIndex === sectionIndex &&
                    editingItem?.itemIndex === itemIndex;
                  return (
                    <TableRow
                      key={`${sectionIndex}-${itemIndex}-${item.itemNo}`}
                      className={
                        item.isHeader
                          ? "bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold"
                          : ""
                      }
                    >
                      <TableCell>{item.isHeader ? "" : item.itemNo}</TableCell>
                      <TableCell>
                        {isEditing ? (
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
                          <span>{item.description}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.isHeader ? (
                          ""
                        ) : isEditing ? (
                          <Input
                            type="number"
                            value={item.amount || 0}
                            onChange={(e) =>
                              updateItem(
                                sectionIndex,
                                itemIndex,
                                "amount",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          `KSh ${(item.amount || 0).toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.source === "ai"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.source === "ai" ? "AI" : "User"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEdit(sectionIndex, itemIndex)}
                          >
                            {isEditing ? (
                              <Save size={16} />
                            ) : (
                              <Edit size={16} />
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(sectionIndex, itemIndex)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {section.items.length > 0 && (
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2} className="text-right">
                      Section Total:
                    </TableCell>
                    <TableCell>
                      KSh{" "}
                      {calculateSectionTotal(section.items).toLocaleString()}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="grid grid-cols-1 sm:grid-cols-2 sm:space-x-2 sm:space-y-0 space-y-1 mt-4">
              <Button variant="outline" onClick={() => addItem(sectionIndex)}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
              <Button variant="outline" onClick={() => addHeader(sectionIndex)}>
                <Type className="w-4 h-4 mr-2" /> Add Header/Note
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {sections.length > 0 && sections.some((s) => s.items.length > 0) && (
        <Card className="bg-primary/10 border-primary dark:border-blue-300">
          <CardHeader>
            <CardTitle className="text-primary dark:text-blue-300">
              Grand Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary dark:text-blue-300">
              KSh {calculateGrandTotal().toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PreliminariesBuilder;
