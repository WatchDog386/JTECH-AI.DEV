// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useRebarCalculator,
  CalcInput,
  ElementTypes,
  RebarSize,
  RebarRow,
  createRebarSnapshot,
  RebarQSSettings,
  defaultRebarQSSettings,
  ReinforcementType,
  MESH_PROPERTIES,
  STANDARD_MESH_SHEETS,
  FootingType,
  TankType,
  RetainingWallType,
} from "@/hooks/useRebarCalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { Category } from "@/hooks/useConcreteCalculator";
import { Trash, Plus, Settings, Calculator, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Props {
  quote: any;
  setQuote: any;
  onExport?: (snapshotJson: string) => void;
  initialRows?: RebarRow[];
}

const sizeOptions: RebarSize[] = ["Y8", "Y10", "Y12", "Y16", "Y20", "Y25"];
const meshGrades = Object.keys(MESH_PROPERTIES);
const meshSheetOptions = STANDARD_MESH_SHEETS.map(
  (sheet) => `${sheet.width}m × ${sheet.length}m`
);
const tankTypes = ["septic", "underground", "overhead", "water", "circular"];
const makeDefaultRow = (): RebarRow => ({
  id: Math.random().toString(36).substr(2, 9),
  name: `Element`,
  element: "slab",
  length: "",
  width: "",
  depth: "",
  columnHeight: "",
  mainBarSpacing: "",
  distributionBarSpacing: "",
  stirrupSpacing: "",
  tieSpacing: "",
  mainBarsCount: "",
  distributionBarsCount: "",
  slabLayers: "",
  mainBarSize: "Y12",
  distributionBarSize: "Y12",
  stirrupSize: "Y8",
  tieSize: "Y8",
  category: "substructure",
  number: "1",
  // Mesh defaults
  reinforcementType: "individual_bars",
  meshGrade: "A142",
  meshSheetWidth: "2.4",
  meshSheetLength: "4.8",
  meshLapLength: "0.3",
  // Strip footing defaults
  footingType: "strip",
  longitudinalBars: "",
  transverseBars: "",
  topReinforcement: "",
  bottomReinforcement: "",
  // Tank specific defaults
  tankType: "septic",
  tankShape: "rectangular",
  wallThickness: "0.2",
  baseThickness: "0.2",
  coverThickness: "0.15",
  includeCover: true,
  wallVerticalBarSize: "Y12",
  wallHorizontalBarSize: "Y10",
  wallVerticalSpacing: "150",
  wallHorizontalSpacing: "200",
  baseMainBarSize: "Y12",
  baseDistributionBarSize: "Y10",
  baseMainSpacing: "150",
  baseDistributionSpacing: "200",
  coverMainBarSize: "Y10",
  coverDistributionBarSize: "Y8",
  coverMainSpacing: "200",
  coverDistributionSpacing: "250",
  // Retaining wall specific defaults
  retainingWallType: "cantilever",
  heelLength: "0.5",
  toeLength: "0.5",
  stemVerticalBarSize: "Y12",
  stemHorizontalBarSize: "Y10",
  stemVerticalSpacing: "150",
  stemHorizontalSpacing: "200",
});

function validateRow(row: RebarRow): string[] {
  const errs: string[] = [];

  // Basic validation for all elements
  if (!row.length || parseFloat(row.length) <= 0)
    errs.push("Length must be > 0");
  if (!row.width || parseFloat(row.width) <= 0) errs.push("Width must be > 0");

  const isPosInt = (v?: string) =>
    v !== undefined && !isNaN(parseFloat(v)) && parseFloat(v) > 0;

  if (row.reinforcementType === "individual_bars") {
    if (!row.depth || parseFloat(row.depth) <= 0)
      errs.push("Thickness/Depth must be > 0");
    if (row.element === "slab" || row.element === "foundation") {
      if (!isPosInt(row.mainBarSpacing))
        errs.push("Main bar spacing must be a positive number (mm)");
      if (!isPosInt(row.distributionBarSpacing))
        errs.push("Distribution bar spacing must be a positive number (mm)");
      if (
        row.slabLayers &&
        (parseFloat(row.slabLayers) < 1 || parseFloat(row.slabLayers) > 4)
      )
        errs.push("Slab layers must be between 1 and 4");
    }

    if (row.element === "beam") {
      if (!isPosInt(row.stirrupSpacing))
        errs.push("Stirrup spacing must be positive (mm)");
      if (!isPosInt(row.mainBarsCount))
        errs.push("Main bars count must be positive");
      if (!isPosInt(row.distributionBarsCount))
        errs.push("Distribution bars count must be positive");
    }

    if (row.element === "column") {
      if (!isPosInt(row.tieSpacing))
        errs.push("Tie spacing must be positive (mm)");
      if (!isPosInt(row.mainBarsCount))
        errs.push("Main bars count must be positive");
    }

    if (row.element === "strip-footing") {
      if (!isPosInt(row.mainBarSpacing))
        errs.push("Main bar spacing must be a positive number (mm)");
      if (!isPosInt(row.distributionBarSpacing))
        errs.push("Distribution bar spacing must be a positive number (mm)");
    }
    if (row.element === "tank") {
      if (!row.depth || parseFloat(row.depth) <= 0)
        errs.push("Tank height must be > 0");
      if (!row.wallThickness || parseFloat(row.wallThickness) <= 0)
        errs.push("Wall thickness must be > 0");
      if (!row.baseThickness || parseFloat(row.baseThickness) <= 0)
        errs.push("Base thickness must be > 0");
      if (
        row.includeCover &&
        (!row.coverThickness || parseFloat(row.coverThickness) <= 0)
      )
        errs.push("Cover thickness must be > 0 when cover is included");

      // Wall reinforcement validation
      if (!isPosInt(row.wallVerticalSpacing))
        errs.push("Wall vertical spacing must be positive (mm)");
      if (!isPosInt(row.wallHorizontalSpacing))
        errs.push("Wall horizontal spacing must be positive (mm)");

      // Base reinforcement validation
      if (!isPosInt(row.baseMainSpacing))
        errs.push("Base main spacing must be positive (mm)");
      if (!isPosInt(row.baseDistributionSpacing))
        errs.push("Base distribution spacing must be positive (mm)");

      // Cover reinforcement validation (if included)
      if (row.includeCover) {
        if (!isPosInt(row.coverMainSpacing))
          errs.push("Cover main spacing must be positive (mm)");
        if (!isPosInt(row.coverDistributionSpacing))
          errs.push("Cover distribution spacing must be positive (mm)");
      }
    }
    // In validateRow function, add retaining wall validation:
    if (row.element === "retaining-wall") {
      if (!row.depth || parseFloat(row.depth) <= 0)
        errs.push("Wall height must be > 0");
      if (!row.width || parseFloat(row.width) <= 0)
        errs.push("Base width must be > 0");
      if (!row.wallThickness || parseFloat(row.wallThickness) <= 0)
        errs.push("Stem thickness must be > 0");
      if (!row.baseThickness || parseFloat(row.baseThickness) <= 0)
        errs.push("Base thickness must be > 0");

      if (!isPosInt(row.stemVerticalSpacing))
        errs.push("Stem vertical spacing must be positive (mm)");
      if (!isPosInt(row.stemHorizontalSpacing))
        errs.push("Stem horizontal spacing must be positive (mm)");
      if (!isPosInt(row.baseMainSpacing))
        errs.push("Base main spacing must be positive (mm)");
      if (!isPosInt(row.baseDistributionSpacing))
        errs.push("Base distribution spacing must be positive (mm)");
    }
  } else {
    // Mesh validation - only allow for slabs and foundations
    if (
      row.element !== "slab" &&
      row.element !== "foundation" &&
      row.element !== "strip-footing"
    ) {
      errs.push(
        "Mesh reinforcement is only available for slabs and foundations"
      );
    } else {
      if (!row.meshGrade) errs.push("Mesh grade is required");
      if (!row.meshSheetWidth || parseFloat(row.meshSheetWidth) <= 0)
        errs.push("Sheet width must be > 0");
      if (!row.meshSheetLength || parseFloat(row.meshSheetLength) <= 0)
        errs.push("Sheet length must be > 0");
      if (!row.meshLapLength || parseFloat(row.meshLapLength) < 0)
        errs.push("Lap length must be >= 0");
    }
  }

  return errs;
}

export default function RebarCalculatorForm({
  quote,
  setQuote,
  onExport,
}: Props) {
  const rows = quote?.rebar_rows || [];
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const { profile } = useAuth();
  const [rowsState, setRowsState] = useState<RebarRow[]>(rows);

  useEffect(() => {
    if (Array.isArray(quote?.rebar_rows)) {
      setRowsState(quote.rebar_rows);
    } else {
      setRowsState([]);
    }
  }, [quote?.rebar_rows]);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DEBOUNCE_MS = 500;

  const pushRowsDebounced = useCallback(
    (nextRows: RebarRow[]) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setQuote((prev: any) => {
          const prevStr = JSON.stringify(prev?.rebar_rows ?? []);
          const nextStr = JSON.stringify(nextRows);
          if (prevStr === nextStr) return prev;
          return { ...prev, rebar_rows: nextRows };
        });
      }, DEBOUNCE_MS);
    },
    [setQuote]
  );

  const [qsSettings, setQsSettings] = useState<RebarQSSettings>(
    defaultRebarQSSettings
  );

  const updateQSSetting = <K extends keyof RebarQSSettings>(
    key: K,
    value: RebarQSSettings[K]
  ) => {
    setQsSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateRow = <K extends keyof RebarRow>(
    id: string,
    key: K,
    value: RebarRow[K]
  ) => {
    setRowsState((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, [key]: value } : r));
      pushRowsDebounced(next);
      return next;
    });
  };

  const addRow = () => {
    const newRow = makeDefaultRow();
    setRowsState((prev) => {
      const next = [...prev, newRow];
      pushRowsDebounced(next);
      return next;
    });
  };

  const removeRow = (id: string) => {
    setRowsState((prev) => {
      const next = prev.filter((r) => r.id !== id);
      pushRowsDebounced(next);
      return next;
    });
  };

  const { results, totals } = useRebarCalculator(
    rowsState,
    qsSettings,
    profile?.location || "Nairobi"
  );

  useEffect(() => {
    if (results.length === 0) {
      if (
        Array.isArray(quote?.rebar_materials) &&
        quote.rebar_materials.length
      ) {
        setQuote((prev: any) => ({ ...prev, rebar_materials: [] }));
      }
      return;
    }

    const lineItems = results.flatMap((r) => {
      if (r.reinforcementType === "mesh") {
        return [
          {
            rowId: r.id,
            name: `BRC Mesh - ${r.name} (${r.mainBarSize})`,
            quantity: r.meshResult?.netArea || 0,
            unit: "m²",
            unit_price: r.meshPricePerSqm || 0,
            total_price: r.meshTotalPrice || 0,
          },
        ];
      } else {
        return [
          {
            rowId: r.id,
            name: `Rebar - ${r.name} (${r.mainBarSize})`,
            quantity: r.totalWeightKg,
            unit: "kg",
            unit_price: r.pricePerKg,
            total_price: r.totalPrice,
          },
          {
            rowId: r.id,
            name: `Binding Wire - ${r.name}`,
            quantity: r.bindingWireWeightKg,
            unit: "kg",
            unit_price: r.pricePerKg,
            total_price: r.bindingWirePrice,
          },
        ];
      }
    });

    const totalsRows = [
      {
        rowId: "totals",
        name: "Total Reinforcement",
        quantity: totals.totalWeightKg,
        unit: "kg",
        unit_price: 0,
        total_price: totals.totalPrice,
      },
      ...(totals.bindingWireWeightKg > 0
        ? [
            {
              rowId: "totals",
              name: "Total Binding Wire",
              quantity: totals.bindingWireWeightKg,
              unit: "kg",
              unit_price: 0,
              total_price: totals.bindingWirePrice,
            },
          ]
        : []),
      {
        rowId: "totals",
        name: "Reinforcement Works Total",
        quantity: 1,
        unit: "ls",
        unit_price: 0,
        total_price: totals.totalPrice + totals.bindingWirePrice,
      },
    ];

    const nextItems = [...lineItems, ...totalsRows];
    const currItems = Array.isArray(quote?.rebar_materials)
      ? quote.rebar_materials
      : [];
    const same = JSON.stringify(currItems) === JSON.stringify(nextItems);
    if (!same) {
      setQuote((prev: any) => ({ ...prev, rebar_materials: nextItems }));
    }
  }, [results, totals, setQuote, quote?.rebar_materials]);

  const exportJSON = () => {
    const snapshot = createRebarSnapshot(rowsState, qsSettings);
    const json = JSON.stringify(snapshot, null, 2);
    if (onExport) onExport(json);
    else console.log("Rebar Project Snapshot:", json);
  };

  const getElementColor = (element: ElementTypes) => {
    const colors = {
      slab: "bg-blue-100 text-blue-800 border-blue-200",
      beam: "bg-green-100 text-green-800 border-green-200",
      column: "bg-purple-100 text-purple-800 border-purple-200",
      foundation: "bg-orange-100 text-orange-800 border-orange-200",
      "strip-footing": "bg-red-100 text-red-800 border-red-200",
      tank: "bg-cyan-100 text-cyan-800 border-cyan-200",
      "retaining-wall": "bg-amber-100 text-amber-800 border-amber-200",
    };
    return colors[element];
  };

  const getReinforcementTypeColor = (type: ReinforcementType) => {
    return type === "mesh"
      ? "bg-indigo-100 text-indigo-800 border-indigo-200"
      : "bg-amber-100 text-amber-800 border-amber-200";
  };

  const getTotalCost = useMemo(() => {
    return (totals.totalPrice || 0) + (totals.bindingWirePrice || 0);
  }, [totals]);

  const handleMeshSheetChange = (id: string, value: string) => {
    const [width, length] = value
      .split("×")
      .map((s) => s.replace("m", "").trim());
    updateRow(id, "meshSheetWidth", width);
    updateRow(id, "meshSheetLength", length);
  };

  const getCurrentMeshSheetValue = (row: RebarRow) => {
    return `${row.meshSheetWidth}m × ${row.meshSheetLength}m`;
  };

  // Auto-switch to individual bars if mesh is selected for non-slab/foundation elements
  useEffect(() => {
    setRowsState((prev) =>
      prev.map((row) => {
        if (
          row.reinforcementType === "mesh" &&
          row.element !== "slab" &&
          row.element !== "foundation" &&
          row.element !== "strip-footing"
        ) {
          return { ...row, reinforcementType: "individual_bars" };
        }
        if (row.element === "tank" && row.category !== "substructure") {
          return { ...row, category: "substructure" };
        }
        return row;
      })
    );
  }, [rowsState]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary dark:text-blue-100">
            <Calculator className="w-5 h-5" />
            Reinforcement Calculator Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="sm:p-6 p-1">
          <div className="grid grid-cols-2 md:grid-cols-4 items-center justify-center text-center justify-center gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-blue-700 font-medium">Total Length</div>
              <div className="text-lg font-bold text-primary dark:text-blue-600">
                {totals.totalLengthM?.toFixed(0) || 0} m
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-green-700 font-medium">Total Weight</div>
              <div className="text-lg font-bold text-green-900 dark:text-green-600">
                {totals.totalWeightKg?.toFixed(0) || 0} kg
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-purple-700 font-medium">Total Sheets</div>
              <div className="text-lg font-bold text-purple-900 dark:text-purple-600">
                {totals.totalSheets?.toFixed(0) || 0}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-orange-700 font-medium">Total Cost</div>
              <div className="text-lg font-bold text-orange-900 dark:text-orange-600">
                Ksh {Math.round(getTotalCost).toLocaleString()}
              </div>
            </div>
          </div>

          {totals.breakdown && totals.totalLengthM > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="text-sm text-blue-700 dark:text-blue-50 font-medium mb-2">
                Bar Length Breakdown:
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  Main Bars: {totals.breakdown.mainBarsLength?.toFixed(0)} m
                </div>
                <div>
                  Distribution:{" "}
                  {totals.breakdown.distributionBarsLength?.toFixed(0)} m
                </div>
                <div>
                  Stirrups: {totals.breakdown.stirrupsLength?.toFixed(0)} m
                </div>
                <div>Ties: {totals.breakdown.tiesLength?.toFixed(0)} m</div>
              </div>
            </div>
          )}

          {totals.meshArea > 0 && (
            <div className="mt-4 pt-4 border-t border-indigo-200">
              <div className="text-sm text-indigo-700 dark:text-indigo-50 font-medium mb-2">
                Mesh Area: {totals.meshArea?.toFixed(1)} m²
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-200 text-lg">
            <Settings className="w-5 h-5" />
            Professional QS Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General Settings</TabsTrigger>
              <TabsTrigger value="technical">Technical Settings</TabsTrigger>
              <TabsTrigger value="mesh">Mesh Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="wastage-rebar"
                    className="text-amber-800 dark:text-amber-100"
                  >
                    Rebar Wastage (%)
                  </Label>
                  <Input
                    id="wastage-rebar"
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={qsSettings.wastagePercent}
                    onChange={(e) =>
                      updateQSSetting(
                        "wastagePercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="border-amber-300 focus:border-amber-500"
                  />
                  <p className="text-xs text-amber-600">
                    Typical: 5-10% for cutting & handling
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="binding-wire"
                    className="text-amber-800 dark:text-amber-100"
                  >
                    Binding Wire (% of rebar weight)
                  </Label>
                  <Input
                    id="binding-wire"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={qsSettings.bindingWirePercent}
                    onChange={(e) =>
                      updateQSSetting(
                        "bindingWirePercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="border-amber-300 focus:border-amber-500"
                  />
                  <p className="text-xs text-amber-600">
                    Typical: 0.5-1% of total rebar weight
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="bar-length"
                    className="text-amber-800 dark:text-amber-100"
                  >
                    Standard Bar Length (m)
                  </Label>
                  <Input
                    id="bar-length"
                    type="number"
                    step="0.1"
                    min="6"
                    max="18"
                    value={qsSettings.standardBarLength}
                    onChange={(e) =>
                      updateQSSetting(
                        "standardBarLength",
                        parseFloat(e.target.value) || 12
                      )
                    }
                    className="border-amber-300 focus:border-amber-500"
                  />
                  <p className="text-xs text-amber-600">
                    Standard lengths: 12m or 18m
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lap-factor"
                    className="text-amber-800 dark:text-amber-100"
                  >
                    Lap Length Factor (× bar diameter)
                  </Label>
                  <Input
                    id="lap-factor"
                    type="number"
                    step="1"
                    min="30"
                    max="60"
                    value={qsSettings.lapLengthFactor}
                    onChange={(e) =>
                      updateQSSetting(
                        "lapLengthFactor",
                        parseFloat(e.target.value) || 40
                      )
                    }
                    className="border-amber-300 focus:border-amber-500"
                  />
                  <p className="text-xs text-amber-600">
                    Typical: 40d for compression, 50d for tension
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                  <div className="space-y-2">
                    <Label htmlFor="cover-slab">Slab Cover (m)</Label>
                    <Input
                      id="cover-slab"
                      type="number"
                      step="0.005"
                      min="0.015"
                      max="0.075"
                      value={qsSettings.slabCover}
                      onChange={(e) =>
                        updateQSSetting(
                          "slabCover",
                          parseFloat(e.target.value) || 0.02
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cover-beam">Beam Cover (m)</Label>
                    <Input
                      id="cover-beam"
                      type="number"
                      step="0.005"
                      min="0.02"
                      max="0.075"
                      value={qsSettings.beamCover}
                      onChange={(e) =>
                        updateQSSetting(
                          "beamCover",
                          parseFloat(e.target.value) || 0.025
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cover-column">Column Cover (m)</Label>
                    <Input
                      id="cover-column"
                      type="number"
                      step="0.005"
                      min="0.02"
                      max="0.075"
                      value={qsSettings.columnCover}
                      onChange={(e) =>
                        updateQSSetting(
                          "columnCover",
                          parseFloat(e.target.value) || 0.025
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cover-foundation">
                      Foundation Cover (m)
                    </Label>
                    <Input
                      id="cover-foundation"
                      type="number"
                      step="0.005"
                      min="0.03"
                      max="0.075"
                      value={qsSettings.foundationCover}
                      onChange={(e) =>
                        updateQSSetting(
                          "foundationCover",
                          parseFloat(e.target.value) || 0.04
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mesh" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="mesh-wastage"
                    className="text-indigo-800 dark:text-indigo-100"
                  >
                    Mesh Wastage (%)
                  </Label>
                  <Input
                    id="mesh-wastage"
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={qsSettings.meshWastagePercent}
                    onChange={(e) =>
                      updateQSSetting(
                        "meshWastagePercent",
                        parseFloat(e.target.value) || 5
                      )
                    }
                    className="border-indigo-300 focus:border-indigo-500"
                  />
                  <p className="text-xs text-indigo-600">
                    Typical: 5% for mesh cutting & handling
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="mesh-lap"
                    className="text-indigo-800 dark:text-indigo-100"
                  >
                    Standard Mesh Lap (m)
                  </Label>
                  <Input
                    id="mesh-lap"
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="0.5"
                    value={qsSettings.standardMeshLap}
                    onChange={(e) =>
                      updateQSSetting(
                        "standardMeshLap",
                        parseFloat(e.target.value) || 0.3
                      )
                    }
                    className="border-indigo-300 focus:border-indigo-500"
                  />
                  <p className="text-xs text-indigo-600">
                    Typical: 0.3m (300mm) lap length
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Reinforcement Elements</h3>
          <div className="flex gap-2 items-center">
            <Button
              onClick={addRow}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Element
            </Button>
          </div>
        </div>

        {rowsState.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300 bg-gray-50 dark:bg-gray-900">
            <CardContent className="py-8 text-center">
              <Calculator className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">
                No reinforcement elements yet
              </h4>
              <p className="text-gray-500 mb-4">
                Add your first element to get started with reinforcement
                calculations
              </p>
              <Button
                onClick={addRow}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add First Element
              </Button>
            </CardContent>
          </Card>
        )}

        {rowsState.map((row, i) => {
          const result = results.find((r) => r.id === row.id);
          const errors = validateRow(row);
          return (
            <Card
              key={row.id}
              className="border-l-4 border-l-blue-500 dark:border-l-blue-200 shadow-sm"
            >
              <CardContent className="p-6 space-y-4 sm:p-6 p-1">
                <div className="sm:flex flex-1 space-y-3 items-start justify-between">
                  <div className="sm:flex space-y-3 items-center gap-3 flex-1">
                    <Input
                      type="text"
                      value={row.name}
                      onChange={(e) =>
                        updateRow(row.id, "name", e.target.value)
                      }
                      placeholder="Element name (e.g., Ground Floor Slab)"
                      className="font-semibold text-lg pl-2 border-0 focus:ring-0 bg-transparent"
                    />
                    <Badge
                      variant="outline"
                      className={getElementColor(row.element)}
                    >
                      {row.element.toUpperCase().replace("_", " ")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getReinforcementTypeColor(
                        row.reinforcementType
                      )}
                    >
                      {row.reinforcementType === "mesh"
                        ? "BRC MESH"
                        : "INDIVIDUAL BARS"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 dark:bg-gray-900 mr-2"
                    >
                      {row.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Element Type</Label>
                    <Select
                      value={row.element}
                      onValueChange={(v) =>
                        updateRow(row.id, "element", v as ElementTypes)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slab">Slab</SelectItem>
                        <SelectItem value="beam">Beam</SelectItem>
                        <SelectItem value="column">Column</SelectItem>
                        <SelectItem value="foundation">Foundation</SelectItem>
                        <SelectItem value="strip-footing">
                          Strip Footing
                        </SelectItem>
                        <SelectItem value="tank">Tank</SelectItem>
                        <SelectItem value="retaining-wall">
                          Retaining Wall
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Reinforcement Type
                    </Label>
                    <Select
                      value={row.reinforcementType}
                      onValueChange={(v) =>
                        updateRow(
                          row.id,
                          "reinforcementType",
                          v as ReinforcementType
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual_bars">
                          Individual Bars
                        </SelectItem>
                        <SelectItem value="mesh">BRC Mesh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={row.number}
                      onChange={(e) =>
                        updateRow(row.id, "number", e.target.value)
                      }
                      placeholder="Number of items"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select
                      value={row.category}
                      onValueChange={(v) =>
                        updateRow(row.id, "category", v as Category)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="substructure">
                          Substructure
                        </SelectItem>
                        <SelectItem value="superstructure">
                          Superstructure
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {row.reinforcementType === "individual_bars" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Main Bar Size
                      </Label>
                      <Select
                        value={row.mainBarSize}
                        onValueChange={(v) =>
                          updateRow(row.id, "mainBarSize", v as RebarSize)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size} (Ø{size.substring(1)}mm)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {row.element === "column"
                          ? "Height (m)"
                          : row.element === "beam" ||
                            row.element === "strip-footing"
                          ? "Length (m)"
                          : "Length (m)"}
                      </Label>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={row.length}
                        onChange={(e) =>
                          updateRow(row.id, "length", e.target.value)
                        }
                        placeholder="e.g., 5.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {row.element === "slab" ||
                        row.element === "foundation" ||
                        row.element === "strip-footing"
                          ? "Width (m)"
                          : "Width (m)"}
                      </Label>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={row.width}
                        onChange={(e) =>
                          updateRow(row.id, "width", e.target.value)
                        }
                        placeholder="e.g., 0.3"
                      />
                    </div>
                  </div>
                )}

                {row.reinforcementType === "mesh" && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-indigo-700 dark:text-indigo-50">
                        Mesh Grade
                      </Label>
                      <Select
                        value={row.meshGrade}
                        onValueChange={(v) => updateRow(row.id, "meshGrade", v)}
                      >
                        <SelectTrigger className="border-indigo-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {meshGrades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade} ({MESH_PROPERTIES[grade]?.weightPerSqm}{" "}
                              kg/m²)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-indigo-700 dark:text-indigo-50">
                        Sheet Size
                      </Label>
                      <Select
                        value={getCurrentMeshSheetValue(row)}
                        onValueChange={(v) => handleMeshSheetChange(row.id, v)}
                      >
                        <SelectTrigger className="border-indigo-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {meshSheetOptions.map((sheet, index) => (
                            <SelectItem key={index} value={sheet}>
                              {sheet}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-indigo-700 dark:text-indigo-50">
                        Lap Length (m)
                      </Label>
                      <Input
                        type="number"
                        step="0.05"
                        min="0.1"
                        max="0.5"
                        value={row.meshLapLength}
                        onChange={(e) =>
                          updateRow(row.id, "meshLapLength", e.target.value)
                        }
                        className="border-indigo-300"
                        placeholder="0.3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-indigo-700 dark:text-indigo-50">
                        Area (m²)
                      </Label>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={row.length}
                        onChange={(e) =>
                          updateRow(row.id, "length", e.target.value)
                        }
                        placeholder="Length"
                        className="border-indigo-300"
                      />
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={row.width}
                        onChange={(e) =>
                          updateRow(row.id, "width", e.target.value)
                        }
                        placeholder="Width"
                        className="border-indigo-300 mt-1"
                      />
                    </div>
                  </div>
                )}

                {row.reinforcementType === "individual_bars" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {row.element === "slab" ||
                        row.element === "foundation" ||
                        row.element === "strip-footing"
                          ? "Thickness (m)"
                          : "Depth (m)"}
                      </Label>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={row.depth}
                        onChange={(e) =>
                          updateRow(row.id, "depth", e.target.value)
                        }
                        placeholder="e.g., 0.6"
                      />
                    </div>

                    {(row.element === "slab" ||
                      row.element === "foundation" ||
                      row.element === "strip-footing") && (
                      <div
                        className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 ${
                          row.element === "slab"
                            ? "bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-50"
                            : row.element === "foundation"
                            ? "bg-orange-100 dark:bg-orange-700 text-orange-700 dark:text-orange-50"
                            : "bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-50"
                        } rounded-lg`}
                      >
                        <div className="space-y-2">
                          <Label className="text-sm font-medium ">
                            Main Bar Spacing (mm)
                          </Label>
                          <Input
                            type="number"
                            min="50"
                            value={row.mainBarSpacing}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "mainBarSpacing",
                                e.target.value
                              )
                            }
                            placeholder="200"
                            className="border-blue-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium ">
                            Distribution Bar Spacing (mm)
                          </Label>
                          <Input
                            type="number"
                            min="50"
                            value={row.distributionBarSpacing}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "distributionBarSpacing",
                                e.target.value
                              )
                            }
                            placeholder="200"
                            className="border-blue-200"
                          />
                        </div>
                        {row.element === "slab" && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium ">
                              Layers
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max="4"
                              value={row.slabLayers}
                              onChange={(e) =>
                                updateRow(row.id, "slabLayers", e.target.value)
                              }
                              placeholder="1"
                              className="border-blue-200"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {row.element === "tank" && (
                      <div className="space-y-4">
                        {/* Tank Type and Shape */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-cyan-700 dark:text-cyan-50">
                              Tank Type
                            </Label>
                            <Select
                              value={row.tankType}
                              onValueChange={(v) =>
                                updateRow(row.id, "tankType", v as TankType)
                              }
                            >
                              <SelectTrigger className="border-cyan-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {tankTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() +
                                      type.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-cyan-700 dark:text-cyan-50">
                              Tank Shape
                            </Label>
                            <Select
                              value={row.tankShape}
                              onValueChange={(v) =>
                                updateRow(
                                  row.id,
                                  "tankShape",
                                  v as "rectangular" | "circular"
                                )
                              }
                            >
                              <SelectTrigger className="border-cyan-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rectangular">
                                  Rectangular
                                </SelectItem>
                                <SelectItem value="circular">
                                  Circular
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-cyan-700 dark:text-cyan-50">
                              Include Cover Slab
                            </Label>
                            <Select
                              value={row.includeCover ? "yes" : "no"}
                              onValueChange={(v) =>
                                updateRow(row.id, "includeCover", v === "yes")
                              }
                            >
                              <SelectTrigger className="border-cyan-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Tank Thickness Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-teal-50 dark:bg-teal-900 rounded-lg">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-teal-700 dark:text-teal-50">
                              Wall Thickness (m)
                            </Label>
                            <Input
                              type="number"
                              min="0.1"
                              step="0.05"
                              value={row.wallThickness}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "wallThickness",
                                  e.target.value
                                )
                              }
                              placeholder="0.2"
                              className="border-teal-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-teal-700 dark:text-teal-50">
                              Base Thickness (m)
                            </Label>
                            <Input
                              type="number"
                              min="0.1"
                              step="0.05"
                              value={row.baseThickness}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "baseThickness",
                                  e.target.value
                                )
                              }
                              placeholder="0.2"
                              className="border-teal-300"
                            />
                          </div>

                          {row.includeCover && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-teal-700 dark:text-teal-50">
                                Cover Thickness (m)
                              </Label>
                              <Input
                                type="number"
                                min="0.1"
                                step="0.05"
                                value={row.coverThickness}
                                onChange={(e) =>
                                  updateRow(
                                    row.id,
                                    "coverThickness",
                                    e.target.value
                                  )
                                }
                                placeholder="0.15"
                                className="border-teal-300"
                              />
                            </div>
                          )}
                        </div>

                        {/* Wall Reinforcement */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-indigo-700 dark:text-indigo-50">
                              Wall Vertical Bars
                            </Label>
                            <Select
                              value={row.wallVerticalBarSize}
                              onValueChange={(v) =>
                                updateRow(
                                  row.id,
                                  "wallVerticalBarSize",
                                  v as RebarSize
                                )
                              }
                            >
                              <SelectTrigger className="border-indigo-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sizeOptions.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-indigo-700 dark:text-indigo-50">
                              Wall Horizontal Bars
                            </Label>
                            <Select
                              value={row.wallHorizontalBarSize}
                              onValueChange={(v) =>
                                updateRow(
                                  row.id,
                                  "wallHorizontalBarSize",
                                  v as RebarSize
                                )
                              }
                            >
                              <SelectTrigger className="border-indigo-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sizeOptions.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-indigo-700 dark:text-indigo-50">
                              Vertical Spacing (mm)
                            </Label>
                            <Input
                              type="number"
                              min="50"
                              value={row.wallVerticalSpacing}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "wallVerticalSpacing",
                                  e.target.value
                                )
                              }
                              placeholder="150"
                              className="border-indigo-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-indigo-700 dark:text-indigo-50">
                              Horizontal Spacing (mm)
                            </Label>
                            <Input
                              type="number"
                              min="50"
                              value={row.wallHorizontalSpacing}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "wallHorizontalSpacing",
                                  e.target.value
                                )
                              }
                              placeholder="200"
                              className="border-indigo-300"
                            />
                          </div>
                        </div>

                        {/* Base Reinforcement */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-green-700 dark:text-green-50">
                              Base Main Bars
                            </Label>
                            <Select
                              value={row.baseMainBarSize}
                              onValueChange={(v) =>
                                updateRow(
                                  row.id,
                                  "baseMainBarSize",
                                  v as RebarSize
                                )
                              }
                            >
                              <SelectTrigger className="border-green-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sizeOptions.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-green-700 dark:text-green-50">
                              Base Distribution Bars
                            </Label>
                            <Select
                              value={row.baseDistributionBarSize}
                              onValueChange={(v) =>
                                updateRow(
                                  row.id,
                                  "baseDistributionBarSize",
                                  v as RebarSize
                                )
                              }
                            >
                              <SelectTrigger className="border-green-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sizeOptions.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-green-700 dark:text-green-50">
                              Main Spacing (mm)
                            </Label>
                            <Input
                              type="number"
                              min="50"
                              value={row.baseMainSpacing}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "baseMainSpacing",
                                  e.target.value
                                )
                              }
                              placeholder="150"
                              className="border-green-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-green-700 dark:text-green-50">
                              Distribution Spacing (mm)
                            </Label>
                            <Input
                              type="number"
                              min="50"
                              value={row.baseDistributionSpacing}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "baseDistributionSpacing",
                                  e.target.value
                                )
                              }
                              placeholder="200"
                              className="border-green-300"
                            />
                          </div>
                        </div>

                        {/* Cover Reinforcement (if included) */}
                        {row.includeCover && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-purple-700 dark:text-purple-50">
                                Cover Main Bars
                              </Label>
                              <Select
                                value={row.coverMainBarSize}
                                onValueChange={(v) =>
                                  updateRow(
                                    row.id,
                                    "coverMainBarSize",
                                    v as RebarSize
                                  )
                                }
                              >
                                <SelectTrigger className="border-purple-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {sizeOptions.map((size) => (
                                    <SelectItem key={size} value={size}>
                                      {size}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-purple-700 dark:text-purple-50">
                                Cover Distribution Bars
                              </Label>
                              <Select
                                value={row.coverDistributionBarSize}
                                onValueChange={(v) =>
                                  updateRow(
                                    row.id,
                                    "coverDistributionBarSize",
                                    v as RebarSize
                                  )
                                }
                              >
                                <SelectTrigger className="border-purple-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {sizeOptions.map((size) => (
                                    <SelectItem key={size} value={size}>
                                      {size}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-purple-700 dark:text-purple-50">
                                Main Spacing (mm)
                              </Label>
                              <Input
                                type="number"
                                min="50"
                                value={row.coverMainSpacing}
                                onChange={(e) =>
                                  updateRow(
                                    row.id,
                                    "coverMainSpacing",
                                    e.target.value
                                  )
                                }
                                placeholder="200"
                                className="border-purple-300"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-purple-700 dark:text-purple-50">
                                Distribution Spacing (mm)
                              </Label>
                              <Input
                                type="number"
                                min="50"
                                value={row.coverDistributionSpacing}
                                onChange={(e) =>
                                  updateRow(
                                    row.id,
                                    "coverDistributionSpacing",
                                    e.target.value
                                  )
                                }
                                placeholder="250"
                                className="border-purple-300"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {row.element === "retaining-wall" && (
                      <div className="space-y-4">
                        {/* Wall Type */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-orange-700 dark:text-orange-50">
                              Wall Type
                            </Label>
                            <Select
                              value={row.retainingWallType}
                              onValueChange={(v) =>
                                updateRow(
                                  row.id,
                                  "retainingWallType",
                                  v as RetainingWallType
                                )
                              }
                            >
                              <SelectTrigger className="border-orange-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cantilever">
                                  Cantilever
                                </SelectItem>
                                <SelectItem value="gravity">Gravity</SelectItem>
                                <SelectItem value="counterfort">
                                  Counterfort
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-orange-700 dark:text-orange-50">
                              Heel Length (m)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={row.heelLength}
                              onChange={(e) =>
                                updateRow(row.id, "heelLength", e.target.value)
                              }
                              className="border-orange-300"
                              placeholder="0.5"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-orange-700 dark:text-orange-50">
                              Toe Length (m)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={row.toeLength}
                              onChange={(e) =>
                                updateRow(row.id, "toeLength", e.target.value)
                              }
                              className="border-orange-300"
                              placeholder="0.5"
                            />
                          </div>
                        </div>

                        {/* Stem Reinforcement */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-blue-700 dark:text-blue-50">
                              Stem Vertical Bars
                            </Label>
                            <Select
                              value={row.stemVerticalBarSize}
                              onValueChange={(v) =>
                                updateRow(
                                  row.id,
                                  "stemVerticalBarSize",
                                  v as RebarSize
                                )
                              }
                            >
                              <SelectTrigger className="border-blue-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sizeOptions.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-blue-700 dark:text-blue-50">
                              Stem Horizontal Bars
                            </Label>
                            <Select
                              value={row.stemHorizontalBarSize}
                              onValueChange={(v) =>
                                updateRow(
                                  row.id,
                                  "stemHorizontalBarSize",
                                  v as RebarSize
                                )
                              }
                            >
                              <SelectTrigger className="border-blue-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sizeOptions.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-blue-700 dark:text-blue-50">
                              Vertical Spacing (mm)
                            </Label>
                            <Input
                              type="number"
                              min="50"
                              value={row.stemVerticalSpacing}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "stemVerticalSpacing",
                                  e.target.value
                                )
                              }
                              className="border-blue-300"
                              placeholder="150"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-blue-700 dark:text-blue-50">
                              Horizontal Spacing (mm)
                            </Label>
                            <Input
                              type="number"
                              min="50"
                              value={row.stemHorizontalSpacing}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "stemHorizontalSpacing",
                                  e.target.value
                                )
                              }
                              className="border-blue-300"
                              placeholder="200"
                            />
                          </div>
                        </div>

                        {/* Base Reinforcement */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-green-700 dark:text-green-50">
                              Base Main Bars
                            </Label>
                            <Select
                              value={row.baseMainBarSize}
                              onValueChange={(v) =>
                                updateRow(
                                  row.id,
                                  "baseMainBarSize",
                                  v as RebarSize
                                )
                              }
                            >
                              <SelectTrigger className="border-green-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sizeOptions.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-green-700 dark:text-green-50">
                              Base Distribution Bars
                            </Label>
                            <Select
                              value={row.baseDistributionBarSize}
                              onValueChange={(v) =>
                                updateRow(
                                  row.id,
                                  "baseDistributionBarSize",
                                  v as RebarSize
                                )
                              }
                            >
                              <SelectTrigger className="border-green-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sizeOptions.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-green-700 dark:text-green-50">
                              Main Spacing (mm)
                            </Label>
                            <Input
                              type="number"
                              min="50"
                              value={row.baseMainSpacing}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "baseMainSpacing",
                                  e.target.value
                                )
                              }
                              className="border-green-300"
                              placeholder="150"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-green-700 dark:text-green-50">
                              Distribution Spacing (mm)
                            </Label>
                            <Input
                              type="number"
                              min="50"
                              value={row.baseDistributionSpacing}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "baseDistributionSpacing",
                                  e.target.value
                                )
                              }
                              className="border-green-300"
                              placeholder="200"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {row.element === "beam" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-green-700 dark:text-green-50">
                            Main Bars Count
                          </Label>
                          <Input
                            type="number"
                            min="2"
                            value={row.mainBarsCount}
                            onChange={(e) =>
                              updateRow(row.id, "mainBarsCount", e.target.value)
                            }
                            placeholder="4"
                            className="border-green-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-green-700 dark:text-green-50">
                            Distribution Bars Count
                          </Label>
                          <Input
                            type="number"
                            min="2"
                            value={row.distributionBarsCount}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "distributionBarsCount",
                                e.target.value
                              )
                            }
                            placeholder="2"
                            className="border-green-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-green-700 dark:text-green-50">
                            Stirrup Spacing (mm)
                          </Label>
                          <Input
                            type="number"
                            min="50"
                            value={row.stirrupSpacing}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "stirrupSpacing",
                                e.target.value
                              )
                            }
                            placeholder="200"
                            className="border-green-200"
                          />
                        </div>
                      </div>
                    )}

                    {row.element === "column" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-purple-700  dark:text-purple-50">
                            Main Bars Count
                          </Label>
                          <Input
                            type="number"
                            min="4"
                            value={row.mainBarsCount}
                            onChange={(e) =>
                              updateRow(row.id, "mainBarsCount", e.target.value)
                            }
                            placeholder="4"
                            className="border-purple-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-purple-700 dark:text-purple-50">
                            Tie Spacing (mm)
                          </Label>
                          <Input
                            type="number"
                            min="50"
                            value={row.tieSpacing}
                            onChange={(e) =>
                              updateRow(row.id, "tieSpacing", e.target.value)
                            }
                            placeholder="250"
                            className="border-purple-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-purple-700 dark:text-purple-50">
                            Column Height (m)
                          </Label>
                          <Input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={row.columnHeight || row.length}
                            onChange={(e) =>
                              updateRow(row.id, "columnHeight", e.target.value)
                            }
                            placeholder="3.0"
                            className="border-purple-200"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {errors.length > 0 && (
                  <div className="rounded-md border border-red-300 bg-red-50 dark:bg-destructive p-4">
                    <div className="font-medium text-red-800 dark:text-red-100 mb-2">
                      Please fix the following issues:
                    </div>
                    <ul className="list-disc list-inside text-red-700 dark:text-red-50 text-sm space-y-1">
                      {errors.map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result && (
                  <Card
                    className={
                      result.reinforcementType === "mesh"
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 border-indigo-200"
                        : "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-green-200"
                    }
                  >
                    <CardContent className="p-4 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {result.reinforcementType === "mesh" ? (
                          <>
                            <div className="space-y-1">
                              <div className="text-indigo-700 dark:text-indigo-50 font-medium">
                                Total Sheets
                              </div>
                              <div className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                                {result.totalBars}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-indigo-700 dark:text-indigo-50 font-medium">
                                Net Area
                              </div>
                              <div className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                                {result.meshResult?.netArea.toFixed(1)} m²
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-indigo-700 dark:text-indigo-50 font-medium">
                                Total Weight
                              </div>
                              <div className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                                {result.totalWeightKg.toFixed(0)} kg
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-indigo-700 dark:text-indigo-50 font-medium">
                                Total Cost
                              </div>
                              <div className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                                Ksh{" "}
                                {Math.round(
                                  result.meshTotalPrice || 0
                                ).toLocaleString()}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-1">
                              <div className="text-green-700 dark:text-green-50 font-medium">
                                Total Bars
                              </div>
                              <div className="text-lg font-bold text-green-900  dark:text-green-100">
                                {result.totalBars}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-green-700 dark:text-green-50 font-medium">
                                Total Length
                              </div>
                              <div className="text-lg font-bold text-green-900 dark:text-green-100">
                                {result.totalLengthM.toFixed(0)} m
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-green-700 dark:text-green-50 font-medium">
                                Total Weight
                              </div>
                              <div className="text-lg font-bold text-green-900 dark:text-green-100">
                                {result.totalWeightKg.toFixed(0)} kg
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-green-700 dark:text-green-50 font-medium">
                                Total Cost
                              </div>
                              <div className="text-lg font-bold text-green-900 dark:text-green-100">
                                Ksh{" "}
                                {Math.round(
                                  result.totalPrice + result.bindingWirePrice
                                ).toLocaleString()}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {result.reinforcementType === "individual_bars" &&
                        result.weightBreakdownKg && (
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <div className="text-xs text-green-700 dark:text-green-50 font-medium mb-2">
                              Weight Breakdown (kg):
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              {result.weightBreakdownKg.mainBars !==
                                undefined && (
                                <div>
                                  Main Bars:{" "}
                                  {result.weightBreakdownKg.mainBars.toFixed(1)}
                                </div>
                              )}
                              {result.weightBreakdownKg.distributionBars !==
                                undefined ||
                                (0 && (
                                  <div>
                                    Distribution:{" "}
                                    {result.weightBreakdownKg.distributionBars.toFixed(
                                      1
                                    )}
                                  </div>
                                ))}
                              {result.weightBreakdownKg.stirrups !==
                                undefined ||
                                (0 && (
                                  <div>
                                    Stirrups:{" "}
                                    {result.weightBreakdownKg.stirrups.toFixed(
                                      1
                                    )}
                                  </div>
                                ))}
                              {result.weightBreakdownKg.ties !== undefined ||
                                (0 && (
                                  <div>
                                    Ties:{" "}
                                    {result.weightBreakdownKg.ties.toFixed(1)}
                                  </div>
                                ))}
                              <div>
                                Binding Wire:{" "}
                                {result.bindingWireWeightKg.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        )}

                      {result.reinforcementType === "mesh" &&
                        result.meshResult && (
                          <div className="mt-3 pt-3 border-t border-indigo-200">
                            <div className="text-xs text-indigo-700 dark:text-indigo-50 font-medium mb-2">
                              Mesh Details:
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              <div>Sheets: {result.meshResult.totalSheets}</div>
                              <div>
                                Lap Area: {result.meshResult.lapArea.toFixed(1)}{" "}
                                m²
                              </div>
                              <div>
                                Waste: {result.meshResult.wastePercentage}%
                              </div>
                              <div>
                                Price/m²: Ksh{" "}
                                {result.meshPricePerSqm?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}
                      {result && result.element === "tank" && (
                        <div className="mt-3 pt-3 border-t border-cyan-200">
                          <div className="text-xs text-cyan-700 dark:text-cyan-50 font-medium mb-2">
                            Tank Reinforcement Breakdown:
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                            {result.weightBreakdownKg.wallVerticalBars > 0 && (
                              <div>
                                Wall Vertical:{" "}
                                {result.weightBreakdownKg.wallVerticalBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.wallHorizontalBars >
                              0 && (
                              <div>
                                Wall Horizontal:{" "}
                                {result.weightBreakdownKg.wallHorizontalBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.baseMainBars > 0 && (
                              <div>
                                Base Main:{" "}
                                {result.weightBreakdownKg.baseMainBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.baseDistributionBars >
                              0 && (
                              <div>
                                Base Distribution:{" "}
                                {result.weightBreakdownKg.baseDistributionBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.coverMainBars > 0 && (
                              <div>
                                Cover Main:{" "}
                                {result.weightBreakdownKg.coverMainBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.coverDistributionBars >
                              0 && (
                              <div>
                                Cover Distribution:{" "}
                                {result.weightBreakdownKg.coverDistributionBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {result && result.element === "retaining-wall" && (
                        <div className="mt-3 pt-3 border-t border-amber-200">
                          <div className="text-xs text-amber-700 dark:text-amber-50 font-medium mb-2">
                            Retaining Wall Reinforcement Breakdown:
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                            {result.weightBreakdownKg.stemVerticalBars > 0 && (
                              <div>
                                Stem Vertical:{" "}
                                {result.weightBreakdownKg.stemVerticalBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.stemHorizontalBars >
                              0 && (
                              <div>
                                Stem Horizontal:{" "}
                                {result.weightBreakdownKg.stemHorizontalBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.baseMainBars > 0 && (
                              <div>
                                Base Main:{" "}
                                {result.weightBreakdownKg.baseMainBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.baseDistributionBars >
                              0 && (
                              <div>
                                Base Distribution:{" "}
                                {result.weightBreakdownKg.baseDistributionBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.heelMainBars > 0 && (
                              <div>
                                Heel Main:{" "}
                                {result.weightBreakdownKg.heelMainBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.heelDistributionBars >
                              0 && (
                              <div>
                                Heel Distribution:{" "}
                                {result.weightBreakdownKg.heelDistributionBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.toeMainBars > 0 && (
                              <div>
                                Toe Main:{" "}
                                {result.weightBreakdownKg.toeMainBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                            {result.weightBreakdownKg.toeDistributionBars >
                              0 && (
                              <div>
                                Toe Distribution:{" "}
                                {result.weightBreakdownKg.toeDistributionBars.toFixed(
                                  1
                                )}{" "}
                                kg
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
