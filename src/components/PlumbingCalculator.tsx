// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit,
  Gauge,
  Clock,
  Zap,
} from "lucide-react";
import usePlumbingCalculator, {
  PlumbingSystem,
  PlumbingSystemType,
  PipeMaterial,
  FixtureType,
} from "@/hooks/usePlumbingCalculator";
import { MasonryQSSettings } from "@/hooks/useMasonryCalculator";

interface PlumbingCalculatorProps {
  plumbingSystems: PlumbingSystem[];
  materialPrices: any[];
  onPlumbingSystemsUpdate?: (systems: PlumbingSystem[]) => void;
  readonly?: boolean;
  setQuoteData?: (data: any) => void;
  quote?: any;
}

const SYSTEM_TYPES: { value: PlumbingSystemType; label: string }[] = [
  { value: "water-supply", label: "Water Supply" },
  { value: "drainage", label: "Drainage" },
  { value: "sewage", label: "Sewage" },
  { value: "rainwater", label: "Rainwater" },
  { value: "hot-water", label: "Hot Water" },
  { value: "fire-fighting", label: "Fire Fighting" },
  { value: "gas-piping", label: "Gas Piping" },
  { value: "irrigation", label: "Irrigation" },
];

const PIPE_MATERIALS: { value: PipeMaterial; label: string }[] = [
  { value: "PVC-u", label: "PVC-U" },
  { value: "PVC-c", label: "PVC-C" },
  { value: "copper", label: "Copper" },
  { value: "PEX", label: "PEX" },
  { value: "galvanized-steel", label: "Galvanized Steel" },
  { value: "HDPE", label: "HDPE" },
  { value: "PPR", label: "PPR" },
  { value: "cast-iron", label: "Cast Iron" },
  { value: "vitrified-clay", label: "Vitrified Clay" },
];
const pipeDiameters = [15, 20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 160, 200];

const FIXTURE_TYPES: { value: FixtureType; label: string }[] = [
  { value: "water-closet", label: "Water Closet" },
  { value: "urinal", label: "Urinal" },
  { value: "lavatory", label: "Lavatory" },
  { value: "kitchen-sink", label: "Kitchen Sink" },
  { value: "shower", label: "Shower" },
  { value: "bathtub", label: "Bathtub" },
  { value: "bidet", label: "Bidet" },
  { value: "floor-drain", label: "Floor Drain" },
  { value: "cleanout", label: "Cleanout" },
  { value: "hose-bib", label: "Hose Bib" },
];

const QUALITY_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxury" },
];

export default function PlumbingCalculator({
  plumbingSystems,
  materialPrices,
  onPlumbingSystemsUpdate,
  readonly = false,
  setQuoteData,
  quote,
}: PlumbingCalculatorProps) {
  const { calculations, totals, calculateAll } = usePlumbingCalculator(
    plumbingSystems,
    materialPrices,
    quote,
    setQuoteData
  );

  const qsSettings = quote.qsSettings as MasonryQSSettings;
  const onSettingsChange = useCallback(
    (newSettings: MasonryQSSettings) => {
      setQuoteData((prev) => ({
        ...prev,
        qsSettings: newSettings,
      }));
    },
    [setQuoteData]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<PlumbingSystemType | "all">(
    "all"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PlumbingSystem | null>(null);

  useEffect(() => {
    setQuoteData((prev: any) => ({
      ...prev,
      plumbing_systems: plumbingSystems,
    }));
  }, [plumbingSystems, setEditForm]);

  const filteredCalculations = useMemo(() => {
    return calculations.filter((calc) => {
      const matchesSearch =
        calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.systemType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === "all" || calc.systemType === filterType;
      return matchesSearch && matchesType;
    });
  }, [calculations, searchTerm, filterType]);

  const handleAddSystem = () => {
    const newSystem: PlumbingSystem = {
      id: `plumbing-${Date.now()}`,
      name: "New Plumbing System",
      systemType: "water-supply",
      pipes: [],
      fixtures: [],
      tanks: [],
      pumps: [],
      fittings: [],
    };

    if (onPlumbingSystemsUpdate) {
      onPlumbingSystemsUpdate([...plumbingSystems, newSystem]);
    }
    setEditingId(newSystem.id);
    setEditForm(newSystem);
  };

  const handleEdit = (calc: any) => {
    const system = plumbingSystems.find((s) => s.id === calc.id);
    if (system) {
      setEditingId(calc.id);
      setEditForm({ ...system });
    }
  };

  const handleSaveEdit = () => {
    if (!editForm || !editingId) return;

    const updatedSystems = plumbingSystems.map((system) =>
      system.id === editingId ? editForm : system
    );

    if (onPlumbingSystemsUpdate) {
      onPlumbingSystemsUpdate(updatedSystems);
    }
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this plumbing system?"))
      return;

    const updatedSystems = plumbingSystems.filter((system) => system.id !== id);
    if (onPlumbingSystemsUpdate) {
      onPlumbingSystemsUpdate(updatedSystems);
    }
  };

  const handleEditFormChange = (field: keyof PlumbingSystem, value: any) => {
    if (!editForm) return;
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const addPipe = () => {
    if (!editForm) return;
    const newPipe = {
      id: `pipe-${Date.now()}`,
      material: "PVC-u" as PipeMaterial,
      diameter: 20,
      length: 0,
      quantity: 1,
    };
    setEditForm((prev) =>
      prev ? { ...prev, pipes: [...prev.pipes, newPipe] } : null
    );
  };

  const updatePipe = (pipeId: string, field: string, value: any) => {
    if (!editForm) return;
    const updatedPipes = editForm.pipes.map((pipe) =>
      pipe.id === pipeId ? { ...pipe, [field]: value } : pipe
    );
    setEditForm((prev) => (prev ? { ...prev, pipes: updatedPipes } : null));
  };

  const removePipe = (pipeId: string) => {
    if (!editForm) return;
    const updatedPipes = editForm.pipes.filter((pipe) => pipe.id !== pipeId);
    setEditForm((prev) => (prev ? { ...prev, pipes: updatedPipes } : null));
  };

  const addFixture = () => {
    if (!editForm) return;
    const newFixture = {
      id: `fixture-${Date.now()}`,
      type: "water-closet" as FixtureType,
      count: 1,
      location: "",
      quality: "standard" as const,
      connections: { waterSupply: true, drainage: true, vent: false },
    };
    setEditForm((prev) =>
      prev ? { ...prev, fixtures: [...prev.fixtures, newFixture] } : null
    );
  };

  const updateFixture = (fixtureId: string, field: string, value: any) => {
    if (!editForm) return;
    const updatedFixtures = editForm.fixtures.map((fixture) =>
      fixture.id === fixtureId ? { ...fixture, [field]: value } : fixture
    );
    setEditForm((prev) =>
      prev ? { ...prev, fixtures: updatedFixtures } : null
    );
  };

  const removeFixture = (fixtureId: string) => {
    if (!editForm) return;
    const updatedFixtures = editForm.fixtures.filter(
      (fixture) => fixture.id !== fixtureId
    );
    setEditForm((prev) =>
      prev ? { ...prev, fixtures: updatedFixtures } : null
    );
  };

  const getSystemColor = (type: PlumbingSystemType) => {
    const colors = {
      "water-supply": "bg-blue-100 text-blue-800",
      drainage: "bg-green-100 text-green-800",
      sewage: "bg-red-100 text-red-800",
      rainwater: "bg-cyan-100 text-cyan-800",
      "hot-water": "bg-orange-100 text-orange-800",
      "fire-fighting": "bg-red-100 text-red-800",
      "gas-piping": "bg-yellow-100 text-yellow-800",
      irrigation: "bg-emerald-100 text-emerald-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLength = (length: number) => {
    return `${length.toFixed(1)} m`;
  };

  const formatEfficiency = (efficiency: number) => {
    return `${efficiency.toFixed(1)}%`;
  };

  const exportToCSV = () => {
    const headers = [
      "System",
      "Type",
      "Pipe Length",
      "Fixtures",
      "Material Cost",
      "Labor Cost",
      "Total Cost",
      "Man Hours",
    ];
    const csvData = calculations.map((calc) => [
      calc.name,
      calc.systemType,
      calc.totalPipeLength,
      calc.totalFixtures,
      calc.materialCost,
      calc.totalCost,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plumbing-calculations.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Total Pipe Length
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatLength(totals.totalPipeLength)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totals.totalFixtures} fixtures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Material Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.totalMaterialCost)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.totalCost)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Plumbing Systems Calculation</CardTitle>
              <CardDescription>
                Professional quantity surveying for plumbing installations
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Label className="items-center space-x-2">
                {" "}
                Wastage Allowance (%)
              </Label>
              <Input
                type="number"
                value={qsSettings?.wastagePlumbing ?? 1}
                step="1"
                min="1"
                className="max-w-xs"
                onChange={(e) =>
                  onSettingsChange({
                    ...qsSettings,
                    wastagePlumbing: parseFloat(e.target.value),
                  })
                }
                placeholder="Plumbing wastage (%)"
              />
              {!readonly && (
                <Button onClick={handleAddSystem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add System
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
                  placeholder="Search systems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="w-full sm:w-48">
              <Label htmlFor="system-filter" className="sr-only">
                Filter by system type
              </Label>
              <Select
                value={filterType}
                onValueChange={(value: PlumbingSystemType | "all") =>
                  setFilterType(value)
                }
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  {SYSTEM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
                <CardTitle className="text-lg">Edit Plumbing System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">System Name</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) =>
                        handleEditFormChange("name", e.target.value)
                      }
                      placeholder="e.g., Main Water Supply"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-type">System Type</Label>
                    <Select
                      value={editForm.systemType}
                      onValueChange={(value: PlumbingSystemType) =>
                        handleEditFormChange("systemType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SYSTEM_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pipes Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg font-semibold">Pipes</Label>
                    <Button onClick={addPipe} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Pipe
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {editForm.pipes.map((pipe) => (
                      <div
                        key={pipe.id}
                        className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-lg"
                      >
                        <div>
                          <Label>Material</Label>
                          <Select
                            value={pipe.material}
                            onValueChange={(value: PipeMaterial) =>
                              updatePipe(pipe.id, "material", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PIPE_MATERIALS.map((material) => (
                                <SelectItem
                                  key={material.value}
                                  value={material.value}
                                >
                                  {material.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Diameter (mm)</Label>
                          <Select
                            value={pipe.diameter?.toString()}
                            onValueChange={(value) =>
                              updatePipe(pipe.id, "diameter", parseInt(value))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select diameter" />
                            </SelectTrigger>
                            <SelectContent>
                              {pipeDiameters.map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                  {size} mm
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Length (m)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={pipe.length}
                            onChange={(e) =>
                              updatePipe(
                                pipe.id,
                                "length",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={pipe.quantity}
                            onChange={(e) =>
                              updatePipe(
                                pipe.id,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            onClick={() => removePipe(pipe.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixtures Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg font-semibold">Fixtures</Label>
                    <Button onClick={addFixture} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Fixture
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {editForm.fixtures.map((fixture) => (
                      <div
                        key={fixture.id}
                        className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-lg"
                      >
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={fixture.type}
                            onValueChange={(value: FixtureType) =>
                              updateFixture(fixture.id, "type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIXTURE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Quality</Label>
                          <Select
                            value={fixture.quality}
                            onValueChange={(
                              value: "standard" | "premium" | "luxury"
                            ) => updateFixture(fixture.id, "quality", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {QUALITY_OPTIONS.map((quality) => (
                                <SelectItem
                                  key={quality.value}
                                  value={quality.value}
                                >
                                  {quality.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Location</Label>
                          <Input
                            value={fixture.location}
                            onChange={(e) =>
                              updateFixture(
                                fixture.id,
                                "location",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Bathroom 1"
                          />
                        </div>

                        <div>
                          <Label>Count</Label>
                          <Input
                            type="number"
                            min="1"
                            value={fixture.count}
                            onChange={(e) =>
                              updateFixture(
                                fixture.id,
                                "count",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            onClick={() => removeFixture(fixture.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
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
                  <TableHead>System</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Pipe Length</TableHead>
                  <TableHead className="text-right">Fixtures</TableHead>
                  <TableHead className="text-right">Material Cost</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Efficiency</TableHead>
                  {!readonly && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={readonly ? 8 : 9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No plumbing systems found.{" "}
                      {!readonly && "Add your first system to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalculations.map((calc) => (
                    <TableRow key={calc.id}>
                      <TableCell className="font-medium">{calc.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getSystemColor(calc.systemType)}
                        >
                          {SYSTEM_TYPES.find((t) => t.value === calc.systemType)
                            ?.label || calc.systemType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatLength(calc.totalPipeLength)}
                      </TableCell>
                      <TableCell className="text-right">
                        {calc.totalFixtures}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(calc.materialCost)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(calc.totalCost)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col text-xs">
                          <span>
                            Material:{" "}
                            {formatEfficiency(
                              calc.efficiency.materialUtilization
                            )}
                          </span>
                          <span>
                            Install:{" "}
                            {formatEfficiency(
                              calc.efficiency.installationEfficiency
                            )}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {filteredCalculations.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Systems:</span>{" "}
                  {filteredCalculations.length}
                </div>
                <div>
                  <span className="font-medium">Total Pipes:</span>{" "}
                  {formatLength(totals.totalPipeLength)}
                </div>
                <div>
                  <span className="font-medium">Total Fixtures:</span>{" "}
                  {totals.totalFixtures}
                </div>
                <div className="font-semibold">
                  <span>Grand Total:</span> {formatCurrency(totals.totalCost)}
                </div>
              </div>

              {/* Breakdown */}
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="font-medium">Pipes:</span>{" "}
                  {formatCurrency(totals.breakdown.pipes)}
                </div>
                <div>
                  <span className="font-medium">Fixtures:</span>{" "}
                  {formatCurrency(totals.breakdown.fixtures)}
                </div>
                <div>
                  <span className="font-medium">Fittings:</span>{" "}
                  {formatCurrency(totals.breakdown.fittings)}
                </div>
                <div>
                  <span className="font-medium">Accessories:</span>{" "}
                  {formatCurrency(totals.breakdown.accessories)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  function handleCancelEdit(): void {
    setEditingId(null);
    setEditForm(null);
  }
}
