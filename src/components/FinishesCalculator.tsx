// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Plus, Trash2, Edit } from "lucide-react";
import useUniversalFinishesCalculator, {
  FinishElement,
  FinishCategory,
  FinishCalculation,
} from "@/hooks/useUniversalFinishesCalculator";
import { MasonryQSSettings } from "@/hooks/useMasonryCalculator";

interface FinishesCalculatorProps {
  finishes: FinishElement[];
  materialPrices: any[];
  onFinishesUpdate?: (finishes: FinishElement[]) => void;
  readonly?: boolean;
  setQuoteData?: (data: any) => void;
  quote?: any;
}

const FINISH_CATEGORIES: { value: FinishCategory; label: string }[] = [
  { value: "flooring", label: "Flooring" },
  { value: "ceiling", label: "Ceiling" },
  { value: "wall-finishes", label: "Wall Finishes" },
  { value: "paint", label: "Painting" },
  { value: "glazing", label: "Glazing" },
  { value: "joinery", label: "Joinery" },
];

const COMMON_MATERIALS = {
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
    "Smooth Stucco",
  ],
  paint: ["Emulsion", "Enamel", "Weatherproof", "Textured", "Metallic"],
  glazing: [
    "Clear Glass",
    "Tinted Glass",
    "Tempered Glass",
    "Laminated Glass",
    "Double Glazing",
  ],
  joinery: [
    "Solid Wood",
    "Plywood",
    "MDF",
    "Melamine",
    "Laminate",
    "Steel",
    "Aluminum",
  ],
};

export default function FinishesCalculator({
  finishes,
  materialPrices,
  onFinishesUpdate,
  readonly = false,
  setQuoteData,
  quote,
}: FinishesCalculatorProps) {
  const { calculations, totals, calculateAll, wastagePercentage } =
    useUniversalFinishesCalculator(
      finishes,
      materialPrices,
      quote,
      setQuoteData
    );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<FinishCategory | "all">(
    "all"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FinishElement | null>(null);

  const qsSettings = quote?.qsSettings as MasonryQSSettings;
  const onSettingsChange = useCallback(
    (newSettings: MasonryQSSettings) => {
      setQuoteData?.((prev: any) => ({
        ...prev,
        qsSettings: newSettings,
      }));
    },
    [setQuoteData]
  );

  // Filter calculations based on search and category
  const filteredCalculations = useMemo(() => {
    return calculations.filter((calc) => {
      const matchesSearch =
        calc.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || calc.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [calculations, searchTerm, filterCategory]);

  const handleAddFinish = () => {
    const newFinish: FinishElement = {
      id: `finish-${Date.now()}`,
      category: "flooring",
      material: "Ceramic Tiles",
      area: 0,
      unit: "m²",
      quantity: 0,
      location: "",
    };

    if (onFinishesUpdate) {
      onFinishesUpdate([...finishes, newFinish]);
    }
    setEditingId(newFinish.id);
    setEditForm(newFinish);
  };

  useEffect(() => {
    setQuoteData((prev: any) => ({
      ...prev,
      finishes: finishes,
    }));
  }, [finishes, setEditForm]);

  const handleEdit = (calc: FinishCalculation) => {
    const finish = finishes.find((f) => f.id === calc.id);
    if (finish) {
      setEditingId(calc.id);
      setEditForm({ ...finish });
    }
  };

  const handleSaveEdit = () => {
    if (!editForm || !editingId) return;

    const updatedFinishes = finishes.map((finish) =>
      finish.id === editingId ? editForm : finish
    );

    if (onFinishesUpdate) {
      onFinishesUpdate(updatedFinishes);
    }
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this finish item?")) return;

    const updatedFinishes = finishes.filter((finish) => finish.id !== id);
    if (onFinishesUpdate) {
      onFinishesUpdate(updatedFinishes);
    }
  };

  const handleEditFormChange = (field: keyof FinishElement, value: any) => {
    if (!editForm) return;

    setEditForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const getCategoryColor = (category: FinishCategory) => {
    const colors = {
      flooring: "bg-blue-100 text-blue-800",
      ceiling: "bg-green-100 text-green-800",
      "wall-finishes": "bg-purple-100 text-purple-800",
      paint: "bg-orange-100 text-orange-800",
      glazing: "bg-cyan-100 text-cyan-800",
      joinery: "bg-amber-100 text-amber-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatQuantity = (quantity: number, unit: string) => {
    if (unit === "pcs") {
      return Math.round(quantity).toString();
    }
    return quantity.toFixed(2);
  };

  const exportToCSV = () => {
    const headers = [
      "Category",
      "Material",
      "Quantity",
      "Adjusted Quantity",
      "Unit",
      "Unit Rate",
      "Material Cost",
      "Material Cost (with Wastage)",
      "Total Cost",
      "Total Cost (with Wastage)",
      "Wastage %",
      "Wastage Quantity",
      "Wastage Cost",
    ];
    const csvData = calculations.map((calc) => [
      calc.category,
      calc.material,
      calc.quantity,
      calc.adjustedQuantity,
      calc.unit,
      calc.unitRate,
      calc.materialCost,
      calc.materialCostWithWastage,
      calc.totalCost,
      calc.totalCostWithWastage,
      calc.wastage.percentage * 100,
      calc.wastage.wastageQuantity,
      calc.wastage.totalWastageCost,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finishes-calculations.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.totalArea.toFixed(2)} m²
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Material Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.totalMaterialCostWithWastage)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.totalCostWithWastage)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <CardTitle>Finishes Calculation</CardTitle>
              <CardDescription>
                Manage and calculate finishes materials and costs
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Label
                htmlFor="wastage-finishes"
                className="text-sm whitespace-nowrap"
              >
                Wastage Allowance (%)
              </Label>
              <Input
                id="wastage-finishes"
                type="number"
                value={qsSettings?.wastageFinishes ?? 10}
                step="1"
                min="1"
                max="50"
                className="sm:max-w-xs max-w-none"
                onChange={(e) =>
                  onSettingsChange({
                    ...qsSettings,
                    wastageFinishes: parseFloat(e.target.value),
                  })
                }
                placeholder="10"
              />
              {!readonly && (
                <Button onClick={handleAddFinish} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Finish
                </Button>
              )}
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="w-full sm:w-48">
              <Label htmlFor="category-filter" className="sr-only">
                Filter by category
              </Label>
              <Select
                value={filterCategory}
                onValueChange={(value: FinishCategory | "all") =>
                  setFilterCategory(value)
                }
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {FINISH_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Edit Form */}
          {editingId && editForm && (
            <Card className="mb-6 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">Edit Finish Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={editForm.category}
                      onValueChange={(value: FinishCategory) =>
                        handleEditFormChange("category", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FINISH_CATEGORIES.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-material">Material</Label>
                    <Select
                      value={editForm.material}
                      onValueChange={(value) =>
                        handleEditFormChange("material", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_MATERIALS[editForm.category]?.map(
                          (material) => (
                            <SelectItem key={material} value={material}>
                              {material}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-location">Location (Optional)</Label>
                    <Input
                      id="edit-location"
                      value={editForm.location || ""}
                      onChange={(e) =>
                        handleEditFormChange("location", e.target.value)
                      }
                      placeholder="e.g., Living Room, Kitchen"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-quantity">Quantity</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.quantity}
                      onChange={(e) =>
                        handleEditFormChange(
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-unit">Unit</Label>
                    <Select
                      value={editForm.unit}
                      onValueChange={(value: "m²" | "m" | "pcs") =>
                        handleEditFormChange("unit", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m²">Square Meters (m²)</SelectItem>
                        <SelectItem value="m">Meters (m)</SelectItem>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button onClick={handleCancelEdit} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calculations Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Adjusted Qty</TableHead>
                  <TableHead className="text-right">Unit Rate</TableHead>
                  <TableHead className="text-right">Material Cost</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  {!readonly && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={readonly ? 9 : 10}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No finishes found.{" "}
                      {!readonly &&
                        "Add your first finish item to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalculations.map((calc) => {
                    const finish = finishes.find((f) => f.id === calc.id);
                    return (
                      <TableRow key={calc.id}>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getCategoryColor(calc.category)}
                          >
                            {FINISH_CATEGORIES.find(
                              (c) => c.value === calc.category
                            )?.label || calc.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {calc.material}
                        </TableCell>
                        <TableCell>{finish?.location || "-"}</TableCell>
                        <TableCell className="text-right">
                          {formatQuantity(calc.quantity, calc.unit)} {calc.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col">
                            <span>
                              {formatQuantity(calc.adjustedQuantity, calc.unit)}{" "}
                              {calc.unit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(calc.unitRate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col">
                            <span>
                              {formatCurrency(calc.materialCostWithWastage)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <div className="flex flex-col">
                            <span>
                              {formatCurrency(calc.totalCostWithWastage)}
                            </span>
                          </div>
                        </TableCell>
                        {!readonly && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(calc)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(calc.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {filteredCalculations.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Items:</span>{" "}
                  {filteredCalculations.length}
                </div>
                <div>
                  <span className="font-medium">Total Quantity:</span>{" "}
                  {totals.totalAdjustedQuantity.toFixed(2)}
                </div>
                <div className="font-semibold">
                  <span>Grand Total:</span>{" "}
                  {formatCurrency(totals.totalCostWithWastage)}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="font-medium">Materials:</span>{" "}
                  {formatCurrency(totals.totalMaterialCostWithWastage)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
