// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RebarSize } from "@/hooks/useRebarCalculator";
import { Building, DollarSign } from "lucide-react";
import { MasonryQSSettings } from "@/hooks/useMasonryCalculator";

interface MasonrySettingsProps {
  quoteData;
  setQuoteData;
  updatePercentageField;
}

// Define the financial modes interface
interface FinancialModes {
  labour: "percentage" | "fixed";
  overhead: "percentage" | "fixed";
  profit: "percentage" | "fixed";
  contingency: "percentage" | "fixed";
  permit_cost: "percentage" | "fixed";
}

export default function QSSettings({
  quoteData,
  setQuoteData,
  updatePercentageField,
}: MasonrySettingsProps) {
  const qsSettings = quoteData.qsSettings;

  // Initialize financial modes from quoteData or use defaults
  const [financialModes, setFinancialModes] = useState<FinancialModes>(
    () =>
      quoteData.qsSettings?.financialModes || {
        labour: "percentage",
        overhead: "percentage",
        profit: "percentage",
        contingency: "percentage",
        permit_cost: "percentage",
      }
  );

  const [localSettings, setLocalSettings] = useState<MasonryQSSettings>(() => ({
    wastageConcrete: 5,
    wastageReinforcement: 4,
    wastageMasonry: 3,
    wastageRoofing: 7,
    wastageFinishes: 8,
    wastageElectricals: 2,
    wastagePlumbing: 3,
    wastageWater: 5,
    clientProvidesWater: true,
    cementWaterRatio: "0.5",
    sandMoistureContentPercent: 4,
    otherSiteWaterAllowanceLM3: 5,
    aggregateMoistureContentPercent: 4,
    aggregateAbsorptionPercent: 1.5,
    curingWaterRateLM2PerDay: 5,
    curingDays: 3,
    mortarJointThicknessM: 0.01,
    includesLintels: true,
    includesReinforcement: false,
    includesDPC: true,
    includesScaffolding: true,
    includesMovementJoints: false,
    includesWasteRemoval: true,
    lintelDepth: 0.15,
    lintelWidth: 0.2,
    reinforcementSpacing: 3,
    verticalReinforcementSpacing: 1.2,
    DPCWidth: 0.225,
    movementJointSpacing: 6,
    scaffoldingDailyRate: 150,
    wasteRemovalRate: 800,
    concreteMixRatio: "1:2:4",
    concreteWaterCementRatio: 0.5,
    lintelRebarSize: "Y12",
    verticalRebarSize: "Y12",
    bedJointRebarSize: "Y8",
    // Include financial fixed values
    labour_fixed: quoteData.qsSettings?.labour_fixed || 0,
    overhead_fixed: quoteData.qsSettings?.overhead_fixed || 0,
    profit_fixed: quoteData.qsSettings?.profit_fixed || 0,
    contingency_fixed: quoteData.qsSettings?.contingency_fixed || 0,
    permit_cost_fixed: quoteData.qsSettings?.permit_cost_fixed || 0,
    // Include financial modes
    financialModes: quoteData.qsSettings?.financialModes || {
      labour: "percentage",
      overhead: "percentage",
      profit: "percentage",
      contingency: "percentage",
      permit_cost: "percentage",
    },
    ...quoteData.qsSettings, // Spread existing settings to override defaults
  }));

  const onSettingsChange = useCallback((newSettings: MasonryQSSettings) => {
    setQuoteData((prev) => ({
      ...prev,
      qsSettings: newSettings,
    }));
  }, []);

  const handleChange = (key: keyof MasonryQSSettings, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSettingsChange(updated);
  };

  const handleNumericChange = (key: keyof MasonryQSSettings, value: string) => {
    const numValue = parseFloat(value);
    handleChange(key, isNaN(numValue) ? 0 : numValue);
  };

  const handleReset = () => {
    const defaultSettings: MasonryQSSettings = {
      wastageConcrete: 5,
      wastageReinforcement: 4,
      wastageMasonry: 3,
      wastageWater: 5,
      wastageRoofing: 7,
      wastageFinishes: 8,
      wastageElectricals: 2,
      wastagePlumbing: 3,
      clientProvidesWater: true,
      cementWaterRatio: "0.5",
      sandMoistureContentPercent: 4,
      otherSiteWaterAllowanceLM3: 5,
      aggregateMoistureContentPercent: 4,
      aggregateAbsorptionPercent: 1.5,
      curingWaterRateLM2PerDay: 5,
      curingDays: 3,
      mortarJointThicknessM: 0.01,
      includesLintels: true,
      includesReinforcement: false,
      includesDPC: true,
      includesScaffolding: true,
      includesMovementJoints: false,
      includesWasteRemoval: true,
      lintelDepth: 0.15,
      lintelWidth: 0.2,
      reinforcementSpacing: 3,
      verticalReinforcementSpacing: 1.2,
      DPCWidth: 0.225,
      movementJointSpacing: 6,
      scaffoldingDailyRate: 150,
      wasteRemovalRate: 800,
      concreteMixRatio: "1:2:4",
      concreteWaterCementRatio: 0.5,
      lintelRebarSize: "Y12",
      verticalRebarSize: "Y12",
      bedJointRebarSize: "Y8",
      labour_fixed: 0,
      overhead_fixed: 0,
      profit_fixed: 0,
      contingency_fixed: 0,
      permit_cost_fixed: 0,
      financialModes: {
        labour: "percentage",
        overhead: "percentage",
        profit: "percentage",
        contingency: "percentage",
        permit_cost: "percentage",
      },
    };
    setLocalSettings(defaultSettings);
    setFinancialModes(defaultSettings.financialModes);
    onSettingsChange(defaultSettings);
  };

  const houseTypes = [
    { value: "Bungalow", label: "Bungalow" },
    { value: "Maisonette", label: "Maisonette" },
    { value: "Apartment", label: "Apartment" },
    { value: "Villa", label: "Villa" },
    { value: "Townhouse", label: "Townhouse" },
    { value: "Warehouse", label: "Warehouse" },
    { value: "Mansion", label: "Mansion" },
  ];

  const handleValueChange = (field: keyof FinancialModes, value: string) => {
    const numericValue = parseFloat(value) || 0;

    if (financialModes[field] === "percentage") {
      if (field === "permit_cost") {
        // Update permit_cost in main quote data
        setQuoteData((prev) => ({
          ...prev,
          permit_cost: numericValue,
        }));
      } else {
        // Update percentage fields
        updatePercentageField(field, numericValue);
      }
    } else {
      // Fixed mode - update in qsSettings
      const fixedField = `${field}_fixed` as keyof MasonryQSSettings;
      const updatedSettings = {
        ...localSettings,
        [fixedField]: numericValue,
      };
      setLocalSettings(updatedSettings);
      onSettingsChange(updatedSettings);
    }
  };

  const handleModeChange = (
    field: keyof FinancialModes,
    newMode: "percentage" | "fixed"
  ) => {
    const updatedModes = {
      ...financialModes,
      [field]: newMode,
    };

    setFinancialModes(updatedModes);

    // Update modes in settings
    const updatedSettings = {
      ...localSettings,
      financialModes: updatedModes,
    };
    setLocalSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  const getValue = (field: keyof FinancialModes) => {
    if (financialModes[field] === "percentage") {
      return field === "permit_cost"
        ? quoteData.permit_cost || ""
        : quoteData?.percentages[0]?.[field] || "";
    } else {
      const fixedField = `${field}_fixed` as keyof MasonryQSSettings;
      return localSettings[fixedField] || "";
    }
  };

  const renderInput = (field: keyof FinancialModes, label: string) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <Label className="text-xs text-gray-600 dark:text-gray-300">
          {label} {financialModes[field] === "percentage" ? "%" : "(KSh)"}
        </Label>
        <Select
          value={financialModes[field]}
          onValueChange={(value: "percentage" | "fixed") =>
            handleModeChange(field, value)
          }
        >
          <SelectTrigger className="w-[80px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">%</SelectItem>
            <SelectItem value="fixed">KSh</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Input
        type="number"
        min="0"
        placeholder={financialModes[field] === "percentage" ? "10" : "50000"}
        value={getValue(field)}
        onChange={(e) => handleValueChange(field, e.target.value)}
        className="text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-6 overflow-y-auto p-1">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">QS Settings</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:space-y-0 space-y-6 md:grid-cols-2 ">
        <Card className="md:mr-2 mr-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Building className="w-5 h-5" />
              House Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label
                htmlFor="houseType"
                className="text-gray-900 dark:text-white"
              >
                House Type *
              </Label>
              <Select
                required
                value={quoteData.house_type}
                onValueChange={(value) =>
                  setQuoteData((prev) => ({
                    ...prev,
                    house_type: value,
                  }))
                }
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Select house type" />
                </SelectTrigger>
                <SelectContent>
                  {houseTypes.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="floors" className="text-gray-900 dark:text-white">
                Floors *
              </Label>
              <Input
                id="floors"
                placeholder="Number of floors"
                type="number"
                min="0"
                value={quoteData.floors}
                required
                onChange={(e) => {
                  setQuoteData((prev) => ({
                    ...prev,
                    floors: parseFloat(e.target.value),
                  }));
                }}
                className=""
              />
            </div>
          </CardContent>
        </Card>
        <Card className="md:ml-2 ml-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <DollarSign className="w-5 h-5" />
              Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {renderInput("labour", "Labor")}
              {renderInput("overhead", "Overhead")}
              {renderInput("profit", "Profit")}
              {renderInput("contingency", "Contingency")}
            </div>
            {renderInput("permit_cost", "Permit Cost")}
          </CardContent>
        </Card>
      </div>

      {/* Water Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Water Settings</CardTitle>
          <CardDescription>
            Configure water calculations and ratios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="client-provides-water"
                checked={localSettings.clientProvidesWater}
                onCheckedChange={(checked) =>
                  handleChange("clientProvidesWater", checked === true)
                }
              />
              <Label htmlFor="client-provides-water">
                Client provides water
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="wastage-water-percent">Wastage Water (%)</Label>
                <Input
                  id="water-wastage-percent"
                  type="number"
                  value={localSettings.wastageWater}
                  onChange={(e) => handleChange("wastageWater", e.target.value)}
                  placeholder="e.g., 0.5"
                />
              </div>
              <div>
                <Label htmlFor="cement-water-ratio">
                  Mortar Water-Cement Ratio
                </Label>
                <Input
                  id="cement-water-ratio"
                  type="text"
                  value={localSettings.cementWaterRatio}
                  onChange={(e) =>
                    handleChange("cementWaterRatio", e.target.value)
                  }
                  placeholder="e.g., 0.5"
                />
              </div>
              <div>
                <Label htmlFor="sand-moisture">Sand Moisture Content (%)</Label>
                <Input
                  id="sand-moisture"
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={localSettings.sandMoistureContentPercent}
                  onChange={(e) =>
                    handleNumericChange(
                      "sandMoistureContentPercent",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="other-water">Other Site Water (L/m³)</Label>
                <Input
                  id="other-water"
                  type="number"
                  step="1"
                  min="0"
                  value={localSettings.otherSiteWaterAllowanceLM3}
                  onChange={(e) =>
                    handleNumericChange(
                      "otherSiteWaterAllowanceLM3",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="curing-water">Curing Water (L/m²/day)</Label>
                <Input
                  id="curing-water"
                  type="number"
                  step="1"
                  min="0"
                  value={localSettings.curingWaterRateLM2PerDay}
                  onChange={(e) =>
                    handleNumericChange(
                      "curingWaterRateLM2PerDay",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="aggregate-moisture">
                  Aggregate Moisture (%)
                </Label>
                <Input
                  id="aggregate-moisture"
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={localSettings.aggregateMoistureContentPercent}
                  onChange={(e) =>
                    handleNumericChange(
                      "aggregateMoistureContentPercent",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="aggregate-absorption">
                  Aggregate Absorption (%)
                </Label>
                <Input
                  id="aggregate-absorption"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={localSettings.aggregateAbsorptionPercent}
                  onChange={(e) =>
                    handleNumericChange(
                      "aggregateAbsorptionPercent",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="curing-days">Curing Days</Label>
                <Input
                  id="curing-days"
                  type="number"
                  step="1"
                  min="0"
                  max="14"
                  value={localSettings.curingDays}
                  onChange={(e) =>
                    handleNumericChange("curingDays", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional QS Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Professional QS Elements</CardTitle>
          <CardDescription>
            Toggle which professional elements to include in calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-lintels"
                checked={localSettings.includesLintels}
                onCheckedChange={(checked) =>
                  handleChange("includesLintels", checked === true)
                }
              />
              <Label htmlFor="includes-lintels">Include Lintels</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-reinforcement"
                checked={localSettings.includesReinforcement}
                onCheckedChange={(checked) =>
                  handleChange("includesReinforcement", checked === true)
                }
              />
              <Label htmlFor="includes-reinforcement">
                Include Reinforcement
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-scaffolding"
                checked={localSettings.includesScaffolding}
                onCheckedChange={(checked) =>
                  handleChange("includesScaffolding", checked === true)
                }
              />
              <Label htmlFor="includes-scaffolding">Include Scaffolding</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-movement-joints"
                checked={localSettings.includesMovementJoints}
                onCheckedChange={(checked) =>
                  handleChange("includesMovementJoints", checked === true)
                }
              />
              <Label htmlFor="includes-movement-joints">
                Include Movement Joints
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-waste-removal"
                checked={localSettings.includesWasteRemoval}
                onCheckedChange={(checked) =>
                  handleChange("includesWasteRemoval", checked === true)
                }
              />
              <Label htmlFor="includes-waste-removal">
                Include Waste Removal
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concrete & Reinforcement Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Concrete & Reinforcement Settings</CardTitle>
          <CardDescription>
            Configure concrete mix and reinforcement details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="concrete-mix-ratio">
                  Concrete Mix Ratio (C:S:B)
                </Label>
                <Input
                  id="concrete-mix-ratio"
                  type="text"
                  value={localSettings.concreteMixRatio}
                  onChange={(e) =>
                    handleChange("concreteMixRatio", e.target.value)
                  }
                  placeholder="e.g., 1:2:4"
                />
              </div>
              <div>
                <Label htmlFor="concrete-water-cement-ratio">
                  Concrete Water-Cement Ratio
                </Label>
                <Input
                  id="concrete-water-cement-ratio"
                  type="number"
                  step="0.05"
                  min="0.4"
                  max="0.6"
                  value={localSettings.concreteWaterCementRatio}
                  onChange={(e) =>
                    handleNumericChange(
                      "concreteWaterCementRatio",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="lintel-rebar-size">Lintel Rebar Size</Label>
                <Select
                  value={localSettings.lintelRebarSize}
                  onValueChange={(value: RebarSize) =>
                    handleChange("lintelRebarSize", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y8">Y8 (8mm)</SelectItem>
                    <SelectItem value="Y10">Y10 (10mm)</SelectItem>
                    <SelectItem value="Y12">Y12 (12mm)</SelectItem>
                    <SelectItem value="Y16">Y16 (16mm)</SelectItem>
                    <SelectItem value="Y20">Y20 (20mm)</SelectItem>
                    <SelectItem value="Y25">Y25 (25mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vertical-rebar-size">Vertical Rebar Size</Label>
                <Select
                  value={localSettings.verticalRebarSize}
                  onValueChange={(value: RebarSize) =>
                    handleChange("verticalRebarSize", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y8">Y8 (8mm)</SelectItem>
                    <SelectItem value="Y10">Y10 (10mm)</SelectItem>
                    <SelectItem value="Y12">Y12 (12mm)</SelectItem>
                    <SelectItem value="Y16">Y16 (16mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bedjoint-rebar-size">
                  Bed Joint Rebar Size
                </Label>
                <Select
                  value={localSettings.bedJointRebarSize}
                  onValueChange={(value: RebarSize) =>
                    handleChange("bedJointRebarSize", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y8">Y8 (8mm)</SelectItem>
                    <SelectItem value="Y10">Y10 (10mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions & Spacing */}
      <Card>
        <CardHeader>
          <CardTitle>Dimensions & Spacing</CardTitle>
          <CardDescription>
            Configure structural dimensions and spacing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="lintel-width">Lintel Width (m)</Label>
              <Input
                id="lintel-width"
                type="number"
                step="0.01"
                min="0.1"
                max="0.3"
                value={localSettings.lintelWidth}
                onChange={(e) =>
                  handleNumericChange("lintelWidth", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="lintel-depth">Lintel Depth (m)</Label>
              <Input
                id="lintel-depth"
                type="number"
                step="0.01"
                min="0.1"
                max="0.3"
                value={localSettings.lintelDepth}
                onChange={(e) =>
                  handleNumericChange("lintelDepth", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="reinforcement-spacing">
                Bed Joint Spacing (courses)
              </Label>
              <Input
                id="reinforcement-spacing"
                type="number"
                step="1"
                min="1"
                max="6"
                value={localSettings.reinforcementSpacing}
                onChange={(e) =>
                  handleNumericChange("reinforcementSpacing", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="vertical-reinforcement-spacing">
                Vertical Rebar Spacing (m)
              </Label>
              <Input
                id="vertical-reinforcement-spacing"
                type="number"
                step="0.1"
                min="0.6"
                max="2.0"
                value={localSettings.verticalReinforcementSpacing}
                onChange={(e) =>
                  handleNumericChange(
                    "verticalReinforcementSpacing",
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="dpc-width">DPC Width (m)</Label>
              <Input
                id="dpc-width"
                type="number"
                step="0.01"
                min="0.1"
                max="0.5"
                value={localSettings.DPCWidth}
                onChange={(e) =>
                  handleNumericChange("DPCWidth", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="movement-joint-spacing">
                Movement Joint Spacing (m)
              </Label>
              <Input
                id="movement-joint-spacing"
                type="number"
                step="0.1"
                min="3"
                max="12"
                value={localSettings.movementJointSpacing}
                onChange={(e) =>
                  handleNumericChange("movementJointSpacing", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="mortar-joint-thickness">
                Mortar Joint Thickness (m)
              </Label>
              <Input
                id="mortar-joint-thickness"
                type="number"
                step="0.001"
                min="0.005"
                max="0.02"
                value={localSettings.mortarJointThicknessM}
                onChange={(e) =>
                  handleNumericChange("mortarJointThicknessM", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rates & Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Rates & Costs</CardTitle>
          <CardDescription>
            Configure daily rates and removal costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scaffolding-rate">
                Scaffolding Rate (Ksh/day)
              </Label>
              <Input
                id="scaffolding-rate"
                type="number"
                step="10"
                min="0"
                value={localSettings.scaffoldingDailyRate}
                onChange={(e) =>
                  handleNumericChange("scaffoldingDailyRate", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="waste-removal-rate">
                Waste Removal Rate (Ksh/m³)
              </Label>
              <Input
                id="waste-removal-rate"
                type="number"
                step="50"
                min="0"
                value={localSettings.wasteRemovalRate}
                onChange={(e) =>
                  handleNumericChange("wasteRemovalRate", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
