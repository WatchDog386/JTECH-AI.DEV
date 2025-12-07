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
  Zap,
  Cpu,
  Lightbulb,
  CircuitBoard,
} from "lucide-react";
import useElectricalCalculator, {
  ElectricalSystem,
  ElectricalSystemType,
  CableType,
  OutletType,
  LightingType,
  InstallationMethod,
} from "@/hooks/useElectricalCalculator";
import { MasonryQSSettings } from "@/hooks/useMasonryCalculator";
import { Checkbox } from "./ui/checkbox";

interface ElectricalCalculatorProps {
  electricalSystems: ElectricalSystem[];
  materialPrices: any[];
  onElectricalSystemsUpdate?: (systems: ElectricalSystem[]) => void;
  readonly?: boolean;
  setQuoteData?: (data: any) => void;
  quote: any;
}

const SYSTEM_TYPES: { value: ElectricalSystemType; label: string }[] = [
  { value: "lighting", label: "Lighting" },
  { value: "power", label: "Power" },
  { value: "data", label: "Data" },
  { value: "security", label: "Security" },
  { value: "cctv", label: "CCTV" },
  { value: "fire-alarm", label: "Fire Alarm" },
  { value: "access-control", label: "Access Control" },
  { value: "av-systems", label: "AV Systems" },
  { value: "emergency-lighting", label: "Emergency Lighting" },
  { value: "renewable-energy", label: "Renewable Energy" },
];

const CABLE_TYPES: { value: CableType; label: string }[] = [
  { value: "NYM-J", label: "NYM-J" },
  { value: "PVC/PVC", label: "PVC/PVC" },
  { value: "XLPE", label: "XLPE" },
  { value: "MICC", label: "MICC" },
  { value: "SWA", label: "SWA" },
  { value: "Ethernet", label: "Ethernet" },
  { value: "Data-CAT6", label: "Data CAT6" },
  { value: "Fiber-Optic", label: "Fiber Optic" },
  { value: "Coaxial", label: "Coaxial" },
];

const OUTLET_TYPES: { value: OutletType; label: string }[] = [
  { value: "power-socket", label: "Power Socket" },
  { value: "light-switch", label: "Light Switch" },
  { value: "dimmer-switch", label: "Dimmer Switch" },
  { value: "data-port", label: "Data Port" },
  { value: "tv-point", label: "TV Point" },
  { value: "telephone", label: "Telephone" },
  { value: "usb-charger", label: "USB Charger" },
  { value: "gpo", label: "GPO" },
];

const commonOutletRatings = [6, 10, 13, 16, 20, 25, 32, 40, 45, 63];

const LIGHTING_TYPES: { value: LightingType; label: string }[] = [
  { value: "led-downlight", label: "LED Downlight" },
  { value: "fluorescent", label: "Fluorescent" },
  { value: "halogen", label: "Halogen" },
  { value: "emergency-light", label: "Emergency Light" },
  { value: "floodlight", label: "Floodlight" },
  { value: "street-light", label: "Street Light" },
  { value: "decorative", label: "Decorative" },
];

const LIGHTING_WATTAGE = [3, 5, 7, 9, 12, 15, 18, 20, 24, 30, 36, 40, 50, 60];

const CONTROL_TYPES = [
  { value: "switch", label: "Switch" },
  { value: "dimmer", label: "Dimmer" },
  { value: "sensor", label: "Sensor" },
  { value: "smart", label: "Smart" },
];

const INSTALLATION_METHODS: { value: InstallationMethod; label: string }[] = [
  { value: "surface", label: "Surface" },
  { value: "concealed", label: "Concealed" },
  { value: "underground", label: "Underground" },
  { value: "trunking", label: "Trunking" },
];

const commonCableSizes = [
  1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150,
];
const GANG_OPTIONS = [1, 2, 3, 4];
const VOLTAGE_OPTIONS = [230, 400];

export default function ElectricalCalculator({
  electricalSystems,
  materialPrices,
  onElectricalSystemsUpdate,
  readonly = false,
  setQuoteData,
  quote,
}: ElectricalCalculatorProps) {
  const { calculations, totals, calculateAll } = useElectricalCalculator(
    electricalSystems,
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
  const [filterType, setFilterType] = useState<ElectricalSystemType | "all">(
    "all"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ElectricalSystem | null>(null);

  const filteredCalculations = useMemo(() => {
    return calculations?.filter((calc) => {
      const matchesSearch =
        calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.systemType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === "all" || calc.systemType === filterType;
      return matchesSearch && matchesType;
    });
  }, [calculations, searchTerm, filterType]);

  useEffect(() => {
    setQuoteData((prev: any) => ({
      ...prev,
      electrical_systems: electricalSystems,
    }));
  }, [electricalSystems, setEditForm]);

  const handleAddSystem = () => {
    const newSystem: ElectricalSystem = {
      id: `electrical-${Date.now()}`,
      name: "New Electrical System",
      systemType: "power",
      cables: [],
      outlets: [],
      lighting: [],
      distributionBoards: [],
      protectionDevices: [],
      voltage: 230,
    };

    if (onElectricalSystemsUpdate) {
      onElectricalSystemsUpdate([...electricalSystems, newSystem]);
    }
    setEditingId(newSystem.id);
    setEditForm(newSystem);
  };

  const handleEdit = (calc: any) => {
    const system = electricalSystems.find((s) => s.id === calc.id);
    if (system) {
      setEditingId(calc.id);
      setEditForm({ ...system });
    }
  };

  const handleSaveEdit = () => {
    if (!editForm || !editingId) return;

    const updatedSystems = electricalSystems.map((system) =>
      system.id === editingId ? editForm : system
    );

    if (onElectricalSystemsUpdate) {
      onElectricalSystemsUpdate(updatedSystems);
    }
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this electrical system?"))
      return;

    const updatedSystems = electricalSystems.filter(
      (system) => system.id !== id
    );
    if (onElectricalSystemsUpdate) {
      onElectricalSystemsUpdate(updatedSystems);
    }
  };

  const handleEditFormChange = (field: keyof ElectricalSystem, value: any) => {
    if (!editForm) return;
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const addCable = () => {
    if (!editForm) return;
    const newCable = {
      id: `cable-${Date.now()}`,
      type: "NYM-J" as CableType,
      size: 2.5,
      length: 0,
      quantity: 1,
      circuit: "L1",
      protection: "PVC Conduit",
      installationMethod: "concealed" as InstallationMethod,
    };
    setEditForm((prev) =>
      prev ? { ...prev, cables: [...prev.cables, newCable] } : null
    );
  };

  const updateCable = (cableId: string, field: string, value: any) => {
    if (!editForm) return;
    const updatedCables = editForm.cables.map((cable) =>
      cable.id === cableId ? { ...cable, [field]: value } : cable
    );
    setEditForm((prev) => (prev ? { ...prev, cables: updatedCables } : null));
  };

  const removeCable = (cableId: string) => {
    if (!editForm) return;
    const updatedCables = editForm.cables.filter(
      (cable) => cable.id !== cableId
    );
    setEditForm((prev) => (prev ? { ...prev, cables: updatedCables } : null));
  };

  const addOutlet = () => {
    if (!editForm) return;
    const newOutlet = {
      id: `outlet-${Date.now()}`,
      type: "power-socket" as OutletType,
      count: 1,
      location: "",
      circuit: "L1",
      rating: 16,
      gang: 1,
      mounting: "flush" as const,
    };
    setEditForm((prev) =>
      prev ? { ...prev, outlets: [...prev.outlets, newOutlet] } : null
    );
  };

  const updateOutlet = (outletId: string, field: string, value: any) => {
    if (!editForm) return;
    const updatedOutlets = editForm.outlets.map((outlet) =>
      outlet.id === outletId ? { ...outlet, [field]: value } : outlet
    );
    setEditForm((prev) => (prev ? { ...prev, outlets: updatedOutlets } : null));
  };

  const removeOutlet = (outletId: string) => {
    if (!editForm) return;
    const updatedOutlets = editForm.outlets.filter(
      (outlet) => outlet.id !== outletId
    );
    setEditForm((prev) => (prev ? { ...prev, outlets: updatedOutlets } : null));
  };

  const addLighting = () => {
    if (!editForm) return;
    const newLighting = {
      id: `lighting-${Date.now()}`,
      type: "led-downlight" as LightingType,
      count: 1,
      location: "",
      circuit: "L1",
      wattage: 12,
      controlType: "switch" as const,
      emergency: false,
    };
    setEditForm((prev) =>
      prev ? { ...prev, lighting: [...prev.lighting, newLighting] } : null
    );
  };

  const updateLighting = (lightingId: string, field: string, value: any) => {
    if (!editForm) return;
    const updatedLighting = editForm.lighting.map((light) =>
      light.id === lightingId ? { ...light, [field]: value } : light
    );
    setEditForm((prev) =>
      prev ? { ...prev, lighting: updatedLighting } : null
    );
  };

  const removeLighting = (lightingId: string) => {
    if (!editForm) return;
    const updatedLighting = editForm.lighting.filter(
      (light) => light.id !== lightingId
    );
    setEditForm((prev) =>
      prev ? { ...prev, lighting: updatedLighting } : null
    );
  };

  const addDistributionBoard = () => {
    if (!editForm) return;
    const newDB = {
      id: `db-${Date.now()}`,
      type: "sub" as const,
      circuits: 12,
      rating: 63,
      mounting: "surface" as const,
      accessories: ["Main Switch", "RCD"],
    };
    setEditForm((prev) =>
      prev
        ? { ...prev, distributionBoards: [...prev.distributionBoards, newDB] }
        : null
    );
  };

  const updateDistributionBoard = (dbId: string, field: string, value: any) => {
    if (!editForm) return;
    const updatedDBs = editForm.distributionBoards.map((db) =>
      db.id === dbId ? { ...db, [field]: value } : db
    );
    setEditForm((prev) =>
      prev ? { ...prev, distributionBoards: updatedDBs } : null
    );
  };

  const removeDistributionBoard = (dbId: string) => {
    if (!editForm) return;
    const updatedDBs = editForm.distributionBoards.filter(
      (db) => db.id !== dbId
    );
    setEditForm((prev) =>
      prev ? { ...prev, distributionBoards: updatedDBs } : null
    );
  };

  const getSystemColor = (type: ElectricalSystemType) => {
    const colors = {
      lighting: "bg-yellow-100 text-yellow-800",
      power: "bg-red-100 text-red-800",
      data: "bg-blue-100 text-blue-800",
      security: "bg-purple-100 text-purple-800",
      cctv: "bg-indigo-100 text-indigo-800",
      "fire-alarm": "bg-red-100 text-red-800",
      "access-control": "bg-green-100 text-green-800",
      "av-systems": "bg-pink-100 text-pink-800",
      "emergency-lighting": "bg-orange-100 text-orange-800",
      "renewable-energy": "bg-emerald-100 text-emerald-800",
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

  const formatPower = (power: number) => {
    return `${power.toFixed(1)} kW`;
  };

  const formatEfficiency = (efficiency: number) => {
    return `${efficiency.toFixed(1)}%`;
  };

  const exportToCSV = () => {
    const headers = [
      "System",
      "Type",
      "Cable Length",
      "Outlets",
      "Lighting",
      "Power Load",
      "Material Cost",
      "Labor Cost",
      "Total Cost",
      "Man Hours",
    ];
    const csvData = calculations.map((calc) => [
      calc.name,
      calc.systemType,
      calc.totalCableLength,
      calc.totalOutlets,
      calc.totalLighting,
      calc.powerLoad,
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
    link.download = "electrical-calculations.csv";
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
              <CircuitBoard className="h-4 w-4" />
              Total Cable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatLength(totals.totalCableLength)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totals.totalOutlets + totals.totalLighting} points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Power Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPower(totals.totalPowerLoad)}
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <CardTitle>Electrical Systems Calculation</CardTitle>
              <CardDescription>
                Professional quantity surveying for electrical installations
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Label className="items-center space-x-2"> </Label>
              Wastage Allowance (%)
              <Input
                type="number"
                value={qsSettings.wastageElectricals ?? 1}
                step="1"
                min="1"
                className="sm:max-w-xs max-w-none"
                onChange={(e) =>
                  onSettingsChange({
                    ...qsSettings,
                    wastageElectricals: parseFloat(e.target.value),
                  })
                }
                placeholder="Electrical wastage (%)"
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
                onValueChange={(value: ElectricalSystemType | "all") =>
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
                <CardTitle className="text-lg">
                  Edit Electrical System
                </CardTitle>
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
                      placeholder="e.g., Main Power Distribution"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-type">System Type</Label>
                    <Select
                      value={editForm.systemType}
                      onValueChange={(value: ElectricalSystemType) =>
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

                  <div>
                    <Label htmlFor="edit-voltage">Voltage</Label>
                    <Select
                      value={editForm.voltage.toString()}
                      onValueChange={(value) =>
                        handleEditFormChange("voltage", parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOLTAGE_OPTIONS.map((voltage) => (
                          <SelectItem key={voltage} value={voltage.toString()}>
                            {voltage}V
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cables Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg font-semibold">Cables</Label>
                    <Button onClick={addCable} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Cable
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {editForm.cables.map((cable) => (
                      <div
                        key={cable.id}
                        className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg"
                      >
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={cable.type}
                            onValueChange={(value: CableType) =>
                              updateCable(cable.id, "type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CABLE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Size (mm²)</Label>
                          <Select
                            value={String(cable.size)}
                            onValueChange={(value) =>
                              updateCable(cable.id, "size", parseFloat(value))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonCableSizes.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                  {size} mm²
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
                            value={cable.length}
                            onChange={(e) =>
                              updateCable(
                                cable.id,
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
                            value={cable.quantity}
                            onChange={(e) =>
                              updateCable(
                                cable.id,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>

                        <div>
                          <Label>Installation</Label>
                          <Select
                            value={cable.installationMethod}
                            onValueChange={(value: InstallationMethod) =>
                              updateCable(cable.id, "installationMethod", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {INSTALLATION_METHODS.map((method) => (
                                <SelectItem
                                  key={method.value}
                                  value={method.value}
                                >
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end">
                          <Button
                            onClick={() => removeCable(cable.id)}
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

                {/* Outlets Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg font-semibold">Outlets</Label>
                    <Button onClick={addOutlet} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Outlet
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {editForm.outlets.map((outlet) => (
                      <div
                        key={outlet.id}
                        className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg"
                      >
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={outlet.type}
                            onValueChange={(value: OutletType) =>
                              updateOutlet(outlet.id, "type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OUTLET_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Gang</Label>
                          <Select
                            value={outlet.gang.toString()}
                            onValueChange={(value) =>
                              updateOutlet(outlet.id, "gang", parseInt(value))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {GANG_OPTIONS.map((gang) => (
                                <SelectItem key={gang} value={gang.toString()}>
                                  {gang}-gang
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Rating (A)</Label>
                          <Select
                            value={String(outlet.rating)}
                            onValueChange={(value) =>
                              updateOutlet(outlet.id, "rating", parseInt(value))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonOutletRatings.map((rating) => (
                                <SelectItem
                                  key={rating}
                                  value={rating.toString()}
                                >
                                  {rating} A
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Location</Label>
                          <Input
                            value={outlet.location}
                            onChange={(e) =>
                              updateOutlet(
                                outlet.id,
                                "location",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Living Room"
                          />
                        </div>

                        <div>
                          <Label>Count</Label>
                          <Input
                            type="number"
                            min="1"
                            value={outlet.count}
                            onChange={(e) =>
                              updateOutlet(
                                outlet.id,
                                "count",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            onClick={() => removeOutlet(outlet.id)}
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

                {/* Lighting Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg font-semibold">Lighting</Label>
                    <Button onClick={addLighting} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lighting
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {editForm.lighting.map((light) => (
                      <div
                        key={light.id}
                        className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg"
                      >
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={light.type}
                            onValueChange={(value: LightingType) =>
                              updateLighting(light.id, "type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LIGHTING_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Wattage</Label>
                          <Select
                            value={String(light.wattage)}
                            onValueChange={(value) =>
                              updateLighting(
                                light.id,
                                "wattage",
                                parseInt(value)
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select wattage" />
                            </SelectTrigger>
                            <SelectContent>
                              {LIGHTING_WATTAGE.map((w) => (
                                <SelectItem key={w} value={String(w)}>
                                  {w} W
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Control</Label>
                          <Select
                            value={light.controlType}
                            onValueChange={(value) =>
                              updateLighting(light.id, "controlType", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CONTROL_TYPES.map((control) => (
                                <SelectItem
                                  key={control.value}
                                  value={control.value}
                                >
                                  {control.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Location</Label>
                          <Input
                            value={light.location}
                            onChange={(e) =>
                              updateLighting(
                                light.id,
                                "location",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Kitchen"
                          />
                        </div>

                        <div>
                          <Label>Count</Label>
                          <Input
                            type="number"
                            min="1"
                            value={light.count}
                            onChange={(e) =>
                              updateLighting(
                                light.id,
                                "count",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>

                        <div className="flex items-end">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`emergency-${light.id}`}
                              checked={light.emergency}
                              onCheckedChange={(checked) =>
                                updateLighting(
                                  light.id,
                                  "emergency",
                                  checked === true
                                )
                              }
                            />
                            <Label htmlFor={`emergency-${light.id}`}>
                              Emergency
                            </Label>
                          </div>
                          <Button
                            onClick={() => removeLighting(light.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => {
                      setEditingId(null);
                      setEditForm(null);
                    }}
                    variant="outline"
                  >
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
                  <TableHead className="text-right">Cable</TableHead>
                  <TableHead className="text-right">Outlets</TableHead>
                  <TableHead className="text-right">Lighting</TableHead>
                  <TableHead className="text-right">Power Load</TableHead>
                  <TableHead className="text-right">Material Cost</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Efficiency</TableHead>
                  {!readonly && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={readonly ? 10 : 11}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No electrical systems found.{" "}
                      {!readonly && "Add your first system to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalculations?.map((calc) => (
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
                        {formatLength(calc.totalCableLength)}
                      </TableCell>
                      <TableCell className="text-right">
                        {calc.totalOutlets}
                      </TableCell>
                      <TableCell className="text-right">
                        {calc.totalLighting}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPower(calc.powerLoad)}
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
                            Cable:{" "}
                            {formatEfficiency(calc.efficiency.cableUtilization)}
                          </span>
                          <span>
                            Circuit:{" "}
                            {formatEfficiency(
                              calc.efficiency.circuitEfficiency
                            )}
                          </span>
                          <span>
                            Energy:{" "}
                            {formatEfficiency(calc.efficiency.energyEfficiency)}
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
          {filteredCalculations?.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Systems:</span>{" "}
                  {filteredCalculations?.length}
                </div>
                <div>
                  <span className="font-medium">Total Cable:</span>{" "}
                  {formatLength(totals.totalCableLength)}
                </div>
                <div>
                  <span className="font-medium">Total Load:</span>{" "}
                  {formatPower(totals.totalPowerLoad)}
                </div>
                <div className="font-semibold">
                  <span>Grand Total:</span> {formatCurrency(totals.totalCost)}
                </div>
              </div>

              {/* Breakdown */}
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="font-medium">Cables:</span>{" "}
                  {formatCurrency(totals.breakdown.cables)}
                </div>
                <div>
                  <span className="font-medium">Outlets:</span>{" "}
                  {formatCurrency(totals.breakdown.outlets)}
                </div>
                <div>
                  <span className="font-medium">Lighting:</span>{" "}
                  {formatCurrency(totals.breakdown.lighting)}
                </div>
                <div>
                  <span className="font-medium">Distribution:</span>{" "}
                  {formatCurrency(totals.breakdown.distribution)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
