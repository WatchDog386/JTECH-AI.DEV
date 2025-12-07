// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  calculateConcrete,
  ConcreteRow,
  useConcreteCalculator,
  ElementType,
  FoundationStep,
  WaterproofingDetails,
  SepticTankDetails,
  UndergroundTankDetails,
  SoakPitDetails,
  SoakawayDetails,
} from "@/hooks/useConcreteCalculator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Trash, Plus } from "lucide-react";
import { Material } from "@/hooks/useQuoteCalculations";
import { useAuth } from "@/contexts/AuthContext";
import { RegionalMultiplier } from "@/hooks/useDynamicPricing";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import useMasonryCalculator, {
  MasonryQSSettings,
} from "@/hooks/useMasonryCalculator";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Props {
  quote: any;
  setQuote: (updater: (prev: any) => any) => void | ((next: any) => void);
  materialBasePrices;
  userMaterialPrices;
  getEffectiveMaterialPrice;
}

export default function ConcreteCalculatorForm({
  quote,
  setQuote,
  materialBasePrices,
  userMaterialPrices,
  getEffectiveMaterialPrice,
}: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const { user, profile } = useAuth();
  const [regionalMultipliers, setRegionalMultipliers] = useState<
    RegionalMultiplier[]
  >([]);
  const userRegion = profile?.location;

  const qsSettings = quote.qsSettings as MasonryQSSettings;

  const onSettingsChange = useCallback(
    (newSettings: MasonryQSSettings) => {
      setQuote((prev) => ({
        ...prev,
        qsSettings: newSettings,
      }));
    },
    [setQuote]
  );

  useEffect(() => {
    const loadMultipliers = async () => {
      const { data } = await supabase.from("regional_multipliers").select("*");
      if (data) setRegionalMultipliers(data);
    };
    loadMultipliers();
  }, []);

  const makeFoundationRow = useCallback((): ConcreteRow => {
    const id = Math.random().toString(36).substr(2, 9);
    return {
      id,
      name: `Element ${id}`,
      element: "foundation",
      length: quote.foundationDetails?.length || "",
      width: quote.foundationDetails?.width || "",
      height: quote.foundationDetails?.height || "",
      mix: "",
      category: "substructure",
      number: "1",
      hasMasonryWall: false,
      foundationType: quote.foundationDetails?.foundationType,
      masonryBlockType: quote.foundationDetails?.masonryBlockType || "",
      masonryBlockDimensions:
        quote.foundationDetails?.masonryBlockDimensions || "",
      masonryWallThickness: quote.foundationDetails?.masonryWallThickness || "",
      masonryWallHeight: quote.foundationDetails?.masonryWallHeight || "",
      masonryWallPerimeter: quote.foundationDetails?.totalPerimeter || "",
      isSteppedFoundation: false,
      foundationSteps: [],
      waterproofing: {
        includesDPC: false,
        includesPolythene: false,
        includesWaterproofing: false,
      },
    };
  }, [quote.foundationDetails]);

  const makeDefaultRow = useCallback((): ConcreteRow => {
    const id = Math.random().toString(36).substr(2, 9);
    return {
      id,
      name: `Element ${id}`,
      element: "slab",
      length: "",
      width: "",
      height: "",
      mix: "",
      category: "superstructure",
      number: "1",
      hasMasonryWall: false,
      foundationType: "",
      masonryBlockType: "",
      masonryBlockDimensions: "",
      masonryWallThickness: "",
      masonryWallHeight: "",
      masonryWallPerimeter: 0,
      isSteppedFoundation: false,
      foundationSteps: [],
      waterproofing: {
        includesDPC: false,
        includesPolythene: false,
        includesWaterproofing: false,
      },
    };
  }, []);

  const [rows, setRows] = useState<ConcreteRow[]>([]);

  useEffect(() => {
    if (Array.isArray(quote?.concrete_rows)) {
      setRows(quote.concrete_rows);
    } else {
      setRows([]);
    }
  }, [quote?.concrete_rows]);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DEBOUNCE_MS = 500;

  const pushRowsDebounced = useCallback(
    (nextRows: ConcreteRow[]) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setQuote((prev: any) => {
          const prevStr = JSON.stringify(prev?.concrete_rows ?? []);
          const nextStr = JSON.stringify(nextRows);
          if (prevStr === nextStr) return prev;
          return { ...prev, concrete_rows: nextRows };
        });
      }, DEBOUNCE_MS);
    },
    [setQuote]
  );

  const updateRow = useCallback(
    <K extends keyof ConcreteRow>(
      id: string,
      key: K,
      value: ConcreteRow[K]
    ) => {
      setRows((prev) => {
        const next = prev.map((r) =>
          r.id === id ? { ...r, [key]: value } : r
        );
        pushRowsDebounced(next);
        return next;
      });
    },
    [pushRowsDebounced]
  );

  const addRow = useCallback(() => {
    const newRow = makeDefaultRow();
    setRows((prev) => {
      const next = [...prev, newRow];
      setQuote((qPrev: any) => ({ ...qPrev, concrete_rows: next }));
      return next;
    });
  }, [makeDefaultRow, setQuote]);

  const addFoundationRow = useCallback(() => {
    const newRow = makeFoundationRow();
    setRows((prev) => {
      const next = [...prev, newRow];
      setQuote((qPrev: any) => ({ ...qPrev, concrete_rows: next }));
      return next;
    });
  }, [makeFoundationRow, setQuote]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasFoundationRow = quote.concrete_rows?.some(
        (row: ConcreteRow) => row.element === "foundation"
      );
      const hasFoundationDetails = quote.foundationDetails?.totalPerimeter;

      if (hasFoundationDetails && !hasFoundationRow) {
        addFoundationRow();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [quote.concrete_rows, quote.foundationDetails, addFoundationRow]);

  const removeRow = useCallback(
    (id: string) => {
      setRows((prev) => {
        const next = prev.filter((r) => r.id !== id);
        setQuote((qPrev: any) => ({ ...qPrev, concrete_rows: next }));
        return next;
      });
    },
    [setQuote]
  );

  const fetchMaterials = useCallback(async () => {
    if (!profile?.id) return;

    const { data: baseMaterials } = await supabase
      .from("material_base_prices")
      .select("*");

    const { data: overrides } = await supabase
      .from("user_material_prices")
      .select("material_id, region, price")
      .eq("user_id", profile.id);

    const userRegion = profile?.location || "Nairobi";
    const multiplier =
      regionalMultipliers.find((r) => r.region === userRegion)?.multiplier || 1;

    const merged =
      baseMaterials?.map((material) => {
        const userRate = overrides?.find(
          (o) => o.material_id === material.id && o.region === userRegion
        );
        const materialP = (material.price || 0) * multiplier;
        const price = userRate ? userRate.price : materialP ?? 0;
        return {
          ...material,
          price,
          source: userRate ? "user" : material.price != null ? "base" : "none",
        };
      }) || [];

    setMaterials(merged);
  }, [profile, regionalMultipliers]);

  useEffect(() => {
    if (user && profile !== null) {
      fetchMaterials();
    }
  }, [user, profile, fetchMaterials]);

  const { results, totals, calculateConcreteRateForRow } =
    useConcreteCalculator(rows, materials, qsSettings, quote);

  const cementMat = materials.find((m) => m.name?.toLowerCase() === "cement");
  const sandMat = materials.find((m) => m.name?.toLowerCase() === "sand");
  const ballastMat = materials.find((m) => m.name?.toLowerCase() === "ballast");
  const aggregateMat = materials.find(
    (m) => m.name?.toLowerCase() === "aggregate"
  );
  const formworkMat = materials.find(
    (m) => m.name?.toLowerCase() === "formwork"
  );
  const waterMat = materials.find((m) => m.name?.toLowerCase() === "water");
  const dpcMat = materials.find(
    (m) =>
      m.name?.toLowerCase().includes("dpc") ||
      m.name?.toLowerCase().includes("damp")
  );
  const polytheneMat = materials.find(
    (m) =>
      m.name?.toLowerCase().includes("polythene") ||
      m.name?.toLowerCase().includes("dpm")
  );
  const waterproofingMat = materials.find(
    (m) =>
      m.name?.toLowerCase().includes("waterproof") ||
      m.name?.toLowerCase().includes("bituminous")
  );
  const gravelMat = materials.find((m) =>
    m.name?.toLowerCase().includes("gravel")
  );

  const foundationMasonryType =
    rows.find((r) => r.masonryBlockType?.toLocaleLowerCase())
      ?.masonryBlockType || "Standard Block";

  const foundationBlockPrice = useMasonryCalculator({
    setQuote,
    quote,
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    userRegion,
    getEffectiveMaterialPrice,
  });

  const foundationBlockMat = foundationBlockPrice.getMaterialPrice(
    "Bricks",
    foundationMasonryType
  );

  const addFoundationStep = useCallback(
    (rowId: string) => {
      const newStep: FoundationStep = {
        id: Math.random().toString(36).substr(2, 9),
        length: "",
        width: "",
        depth: "",
        offset: "",
      };
      setRows((prev) => {
        const next = prev.map((row) => {
          if (row.id === rowId) {
            const currentSteps = row.foundationSteps || [];
            return {
              ...row,
              foundationSteps: [...currentSteps, newStep],
            };
          }
          return row;
        });
        pushRowsDebounced(next);
        return next;
      });
    },
    [pushRowsDebounced]
  );

  const updateFoundationStep = useCallback(
    (
      rowId: string,
      stepId: string,
      field: keyof FoundationStep,
      value: string
    ) => {
      setRows((prev) => {
        const next = prev.map((row) => {
          if (row.id === rowId) {
            const updatedSteps = row.foundationSteps?.map((step) =>
              step.id === stepId ? { ...step, [field]: value } : step
            );
            return { ...row, foundationSteps: updatedSteps };
          }
          return row;
        });
        pushRowsDebounced(next);
        return next;
      });
    },
    [pushRowsDebounced]
  );

  const removeFoundationStep = useCallback(
    (rowId: string, stepId: string) => {
      setRows((prev) => {
        const next = prev.map((row) => {
          if (row.id === rowId) {
            const filteredSteps = row.foundationSteps?.filter(
              (step) => step.id !== stepId
            );
            return { ...row, foundationSteps: filteredSteps };
          }
          return row;
        });
        pushRowsDebounced(next);
        return next;
      });
    },
    [pushRowsDebounced]
  );

  const handleElementChange = useCallback(
    (id: string, element: ElementType) => {
      updateRow(id, "element", element);

      if (element !== "staircase") {
        updateRow(id, "staircaseDetails", undefined);
      }
      if (
        !["septic-tank", "underground-tank", "water-tank"].includes(element)
      ) {
        updateRow(id, "tankDetails", undefined);
        updateRow(id, "septicTankDetails", undefined);
        updateRow(id, "undergroundTankDetails", undefined);
      }
      if (element !== "foundation") {
        updateRow(id, "hasConcreteBed", false);
        updateRow(id, "hasAggregateBed", false);
        updateRow(id, "hasMasonryWall", false);
        updateRow(id, "isSteppedFoundation", false);
        updateRow(id, "foundationSteps", []);
      }
      if (!["soak-pit", "soakaway"].includes(element)) {
        updateRow(id, "soakPitDetails", undefined);
        updateRow(id, "soakawayDetails", undefined);
      }
    },
    [updateRow]
  );

  const initializeSpecializedDetails = useCallback(
    (row: ConcreteRow) => {
      if (row.element === "septic-tank" && !row.septicTankDetails) {
        updateRow(row.id, "septicTankDetails", {
          capacity: "10",
          numberOfChambers: 2,
          wallThickness: "0.2",
          baseThickness: "0.25",
          coverType: "slab",
          includesBaffles: true,
          includesManhole: true,
          manholeSize: "0.6",
          depth: "1.5",
        });
      }
      if (row.element === "underground-tank" && !row.undergroundTankDetails) {
        updateRow(row.id, "undergroundTankDetails", {
          capacity: "5",
          wallThickness: "0.2",
          baseThickness: "0.25",
          coverType: "slab",
          includesManhole: true,
          manholeSize: "0.6",
          waterProofingRequired: true,
        });
      }
      if (row.element === "soak-pit" && !row.soakPitDetails) {
        updateRow(row.id, "soakPitDetails", {
          diameter: "1.2",
          depth: "2.5",
          wallThickness: "0.15",
          baseThickness: "0.2",
          liningType: "brick",
          includesGravel: true,
          gravelDepth: "0.3",
          includesGeotextile: true,
        });
      }
      if (row.element === "soakaway" && !row.soakawayDetails) {
        updateRow(row.id, "soakawayDetails", {
          length: "2.0",
          width: "1.5",
          depth: "2.0",
          wallThickness: "0.15",
          baseThickness: "0.2",
          includesGravel: true,
          gravelDepth: "0.3",
          includesPerforatedPipes: true,
        });
      }
    },
    [updateRow]
  );

  const renderSpecializedFields = (row: ConcreteRow) => {
    switch (row.element) {
      case "staircase":
        return (
          <div className="grid sm:grid-cols-3 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <Input
              type="number"
              value={row.staircaseDetails?.riserHeight || ""}
              onChange={(e) =>
                updateRow(row.id, "staircaseDetails", {
                  ...row.staircaseDetails,
                  riserHeight: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Riser Height (m)"
              step="0.01"
            />
            <Input
              type="number"
              value={row.staircaseDetails?.treadWidth || ""}
              onChange={(e) =>
                updateRow(row.id, "staircaseDetails", {
                  ...row.staircaseDetails,
                  treadWidth: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Tread Width (m)"
              step="0.01"
            />
            <Input
              type="number"
              value={row.staircaseDetails?.numberOfSteps || ""}
              onChange={(e) =>
                updateRow(row.id, "staircaseDetails", {
                  ...row.staircaseDetails,
                  numberOfSteps: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Number of Steps"
              min="1"
            />
          </div>
        );

      case "septic-tank":
        initializeSpecializedDetails(row);
        return (
          <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-md">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200">
              Septic Tank Details
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Capacity (m³)</Label>
                <Input
                  type="number"
                  value={row.septicTankDetails?.capacity || ""}
                  onChange={(e) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      capacity: e.target.value,
                    })
                  }
                  placeholder="10"
                  step="1"
                  min="5"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Number of Chambers
                </Label>
                <Select
                  value={
                    row.septicTankDetails?.numberOfChambers?.toString() || "2"
                  }
                  onValueChange={(value) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      numberOfChambers: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Chamber</SelectItem>
                    <SelectItem value="2">2 Chambers</SelectItem>
                    <SelectItem value="3">3 Chambers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Wall Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.septicTankDetails?.wallThickness || ""}
                  onChange={(e) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      wallThickness: e.target.value,
                    })
                  }
                  placeholder="0.2"
                  step="0.05"
                  min="0.15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Base Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.septicTankDetails?.baseThickness || ""}
                  onChange={(e) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      baseThickness: e.target.value,
                    })
                  }
                  placeholder="0.25"
                  step="0.05"
                  min="0.2"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.septicTankDetails?.includesBaffles || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      includesBaffles: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Baffles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.septicTankDetails?.includesManhole || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      includesManhole: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Manhole</Label>
              </div>
            </div>
          </div>
        );

      case "underground-tank":
        initializeSpecializedDetails(row);
        return (
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              Underground Tank Details
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Capacity (m³)</Label>
                <Input
                  type="number"
                  value={row.undergroundTankDetails?.capacity || ""}
                  onChange={(e) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      capacity: e.target.value,
                    })
                  }
                  placeholder="5"
                  step="1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Wall Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.undergroundTankDetails?.wallThickness || ""}
                  onChange={(e) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      wallThickness: e.target.value,
                    })
                  }
                  placeholder="0.2"
                  step="0.05"
                  min="0.15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Base Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.undergroundTankDetails?.baseThickness || ""}
                  onChange={(e) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      baseThickness: e.target.value,
                    })
                  }
                  placeholder="0.25"
                  step="0.05"
                  min="0.2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cover Type</Label>
                <Select
                  value={row.undergroundTankDetails?.coverType || "slab"}
                  onValueChange={(value) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      coverType: value as "slab" | "precast" | "none",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slab">Concrete Slab</SelectItem>
                    <SelectItem value="precast">Precast</SelectItem>
                    <SelectItem value="none">No Cover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.undergroundTankDetails?.includesManhole || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      includesManhole: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Manhole</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={
                    row.undergroundTankDetails?.waterProofingRequired || false
                  }
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      waterProofingRequired: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Waterproofing Required</Label>
              </div>
            </div>
          </div>
        );

      case "soak-pit":
        initializeSpecializedDetails(row);
        return (
          <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200">
              Soak Pit Details
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Diameter (m)</Label>
                <Input
                  type="number"
                  value={row.soakPitDetails?.diameter || ""}
                  onChange={(e) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      diameter: e.target.value,
                    })
                  }
                  placeholder="1.2"
                  step="0.1"
                  min="0.5"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Depth (m)</Label>
                <Input
                  type="number"
                  value={row.soakPitDetails?.depth || ""}
                  onChange={(e) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      depth: e.target.value,
                    })
                  }
                  placeholder="2.5"
                  step="0.1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Wall Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.soakPitDetails?.wallThickness || "0.15"}
                  onChange={(e) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      wallThickness: e.target.value,
                    })
                  }
                  placeholder="0.15"
                  step="0.05"
                  min="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Base Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.soakPitDetails?.baseThickness || "0.2"}
                  onChange={(e) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      baseThickness: e.target.value,
                    })
                  }
                  placeholder="0.2"
                  step="0.05"
                  min="0.15"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Lining Type</Label>
                <Select
                  value={row.soakPitDetails?.liningType || "brick"}
                  onValueChange={(value) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      liningType: value as "brick" | "concrete" | "precast",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brick">Brick Lining</SelectItem>
                    <SelectItem value="concrete">Concrete Lining</SelectItem>
                    <SelectItem value="precast">Precast Rings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.soakPitDetails?.includesGravel || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      includesGravel: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Gravel Backfill</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.soakPitDetails?.includesGeotextile || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      includesGeotextile: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Geotextile</Label>
              </div>
            </div>
            {row.soakPitDetails?.includesGravel && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gravel Depth (m)</Label>
                <Input
                  type="number"
                  value={row.soakPitDetails?.gravelDepth || "0.3"}
                  onChange={(e) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      gravelDepth: e.target.value,
                    })
                  }
                  placeholder="0.3"
                  step="0.1"
                  min="0.1"
                />
              </div>
            )}
          </div>
        );

      case "soakaway":
        initializeSpecializedDetails(row);
        return (
          <div className="space-y-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-md">
            <h4 className="font-semibold text-teal-800 dark:text-teal-200">
              Soakaway Details
            </h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Length (m)</Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.length || ""}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      length: e.target.value,
                    })
                  }
                  placeholder="2.0"
                  step="0.1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Width (m)</Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.width || ""}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      width: e.target.value,
                    })
                  }
                  placeholder="1.5"
                  step="0.1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Depth (m)</Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.depth || ""}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      depth: e.target.value,
                    })
                  }
                  placeholder="2.0"
                  step="0.1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Wall Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.wallThickness || "0.15"}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      wallThickness: e.target.value,
                    })
                  }
                  placeholder="0.15"
                  step="0.05"
                  min="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Base Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.baseThickness || "0.2"}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      baseThickness: e.target.value,
                    })
                  }
                  placeholder="0.2"
                  step="0.05"
                  min="0.15"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.soakawayDetails?.includesGravel || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      includesGravel: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Gravel Backfill</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={
                    row.soakawayDetails?.includesPerforatedPipes || false
                  }
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      includesPerforatedPipes: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Perforated Pipes</Label>
              </div>
            </div>
            {row.soakawayDetails?.includesGravel && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gravel Depth (m)</Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.gravelDepth || "0.3"}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      gravelDepth: e.target.value,
                    })
                  }
                  placeholder="0.3"
                  step="0.1"
                  min="0.1"
                />
              </div>
            )}
          </div>
        );

      case "water-tank":
        return (
          <div className="grid sm:grid-cols-3 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <Input
              type="number"
              value={row.tankDetails?.capacity || ""}
              onChange={(e) =>
                updateRow(row.id, "tankDetails", {
                  ...row.tankDetails,
                  capacity: e.target.value,
                })
              }
              placeholder="Capacity (m³)"
              step="0.1"
            />
            <Input
              type="number"
              value={row.tankDetails?.wallThickness || ""}
              onChange={(e) =>
                updateRow(row.id, "tankDetails", {
                  ...row.tankDetails,
                  wallThickness: e.target.value,
                })
              }
              placeholder="Wall Thickness (m)"
              step="0.01"
            />
            <Select
              value={row.tankDetails?.coverType || "slab"}
              onValueChange={(value) =>
                updateRow(row.id, "tankDetails", {
                  ...row.tankDetails,
                  coverType: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Cover Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slab">Concrete Slab</SelectItem>
                <SelectItem value="precast">Precast</SelectItem>
                <SelectItem value="none">No Cover</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "retaining-wall":
        return (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <Label className="text-sm font-medium">
              Retaining Wall Configuration
            </Label>
            <div className="grid sm:grid-cols-2 gap-2 mt-2">
              <Input
                type="number"
                value={row.reinforcement?.mainBarSpacing || ""}
                onChange={(e) =>
                  updateRow(row.id, "reinforcement", {
                    ...row.reinforcement,
                    mainBarSpacing: e.target.value,
                  })
                }
                placeholder="Main Bar Spacing (mm)"
              />
              <Input
                type="number"
                value={row.reinforcement?.distributionBarSpacing || ""}
                onChange={(e) =>
                  updateRow(row.id, "reinforcement", {
                    ...row.reinforcement,
                    distributionBarSpacing: e.target.value,
                  })
                }
                placeholder="Distribution Bar Spacing (mm)"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSteppedFoundation = (row: ConcreteRow) => {
    if (!row.isSteppedFoundation) return null;

    return (
      <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-purple-800 dark:text-purple-200">
            Stepped Foundation Details
          </h4>
          <Button
            type="button"
            onClick={() => addFoundationStep(row.id)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Step
          </Button>
        </div>

        {row.foundationSteps?.map((step, index) => (
          <div
            key={step.id}
            className="grid sm:grid-cols-5 gap-2 p-3 bg-white dark:bg-gray-800 rounded border"
          >
            <div className="flex items-center">
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-800"
              >
                Step {index + 1}
              </Badge>
            </div>
            <Input
              type="number"
              value={step.length}
              onChange={(e) =>
                updateFoundationStep(row.id, step.id, "length", e.target.value)
              }
              placeholder="Length (m)"
              step="0.1"
            />
            <Input
              type="number"
              value={step.width}
              onChange={(e) =>
                updateFoundationStep(row.id, step.id, "width", e.target.value)
              }
              placeholder="Width (m)"
              step="0.1"
            />
            <Input
              type="number"
              value={step.depth}
              onChange={(e) =>
                updateFoundationStep(row.id, step.id, "depth", e.target.value)
              }
              placeholder="Depth (m)"
              step="0.05"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                value={step.offset}
                onChange={(e) =>
                  updateFoundationStep(
                    row.id,
                    step.id,
                    "offset",
                    e.target.value
                  )
                }
                placeholder="Offset (m)"
                step="0.1"
              />
              <Button
                type="button"
                onClick={() => removeFoundationStep(row.id, step.id)}
                variant="destructive"
                size="sm"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {(!row.foundationSteps || row.foundationSteps.length === 0) && (
          <p className="text-sm text-gray-500 text-center py-4">
            No steps added yet. Click "Add Step" to create stepped foundation.
          </p>
        )}
      </div>
    );
  };

  const renderWaterproofing = (row: ConcreteRow) => {
    return (
      <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
        <h4 className="font-semibold text-green-800 dark:text-green-200">
          Waterproofing & DPC Details
        </h4>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={row.waterproofing?.includesDPC || false}
              onCheckedChange={(checked) =>
                updateRow(row.id, "waterproofing", {
                  ...row.waterproofing,
                  includesDPC: checked === true,
                })
              }
            />
            <Label className="text-sm font-medium">Include DPC</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={row.waterproofing?.includesPolythene || false}
              onCheckedChange={(checked) =>
                updateRow(row.id, "waterproofing", {
                  ...row.waterproofing,
                  includesPolythene: checked === true,
                })
              }
            />
            <Label className="text-sm font-medium">
              Include Polythene Sheet
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={row.waterproofing?.includesWaterproofing || false}
              onCheckedChange={(checked) =>
                updateRow(row.id, "waterproofing", {
                  ...row.waterproofing,
                  includesWaterproofing: checked === true,
                })
              }
            />
            <Label className="text-sm font-medium">Include Waterproofing</Label>
          </div>
        </div>

        {row.waterproofing?.includesDPC && (
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">DPC Width (m)</Label>
              <Input
                type="number"
                value={row.waterproofing?.dpcWidth || "0.225"}
                onChange={(e) =>
                  updateRow(row.id, "waterproofing", {
                    ...row.waterproofing,
                    dpcWidth: e.target.value,
                  })
                }
                placeholder="0.225"
                step="0.01"
                min="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">DPC Material</Label>
              <Select
                value={row.waterproofing?.dpcMaterial || "bituminous"}
                onValueChange={(value) =>
                  updateRow(row.id, "waterproofing", {
                    ...row.waterproofing,
                    dpcMaterial: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bituminous">Bituminous Felt</SelectItem>
                  <SelectItem value="polythene">Polythene Sheet</SelectItem>
                  <SelectItem value="pvc">PVC Membrane</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {row.waterproofing?.includesPolythene && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Polythene Gauge</Label>
            <Select
              value={row.waterproofing?.polytheneGauge || "1000g"}
              onValueChange={(value) =>
                updateRow(row.id, "waterproofing", {
                  ...row.waterproofing,
                  polytheneGauge: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000g">1000 Gauge</SelectItem>
                <SelectItem value="1200g">1200 Gauge</SelectItem>
                <SelectItem value="1500g">1500 Gauge</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {row.waterproofing?.includesWaterproofing && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Waterproofing Type</Label>
            <Select
              value={row.waterproofing?.waterproofingType || "bituminous"}
              onValueChange={(value) =>
                updateRow(row.id, "waterproofing", {
                  ...row.waterproofing,
                  waterproofingType: value as
                    | "bituminous"
                    | "crystalline"
                    | "membrane",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bituminous">Bituminous Coating</SelectItem>
                <SelectItem value="crystalline">
                  Crystalline Waterproofing
                </SelectItem>
                <SelectItem value="membrane">Waterproof Membrane</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (!cementMat || !sandMat || !ballastMat) return;

    if (results.length === 0) {
      if (
        Array.isArray(quote?.concrete_materials) &&
        quote.concrete_materials.length
      ) {
        setQuote((prev: any) => ({ ...prev, concrete_materials: [] }));
      }
      return;
    }

    const masonryPrice = foundationBlockMat;
    const lineItems = results.flatMap((r) => {
      const rowItems: any[] = [
        {
          rowId: r.id,
          name: `Cement (${r.name})`,
          quantity: r.grossCementBags,
          unit_price: cementMat.price,
          total_price: r.grossCementBags * cementMat.price,
        },
        {
          rowId: r.id,
          name: `Sand (${r.name})`,
          quantity: r.grossSandM3,
          unit_price: sandMat.price,
          total_price: r.grossSandM3 * sandMat.price,
        },
        {
          rowId: r.id,
          name: `Ballast (${r.name})`,
          quantity: r.grossStoneM3,
          unit_price: ballastMat.price,
          total_price: r.grossStoneM3 * ballastMat.price,
        },
        {
          rowId: r.id,
          name: `Formwork (${r.name})`,
          quantity: r.formworkM2,
          unit_price: formworkMat?.price || 0,
          total_price: Math.round(r.formworkM2 * (formworkMat?.price || 0)),
        },
        {
          rowId: r.id,
          name: `Aggregate (${r.name})`,
          quantity: r.aggregateVolume || 0,
          unit_price: aggregateMat?.price || 0,
          total_price: Math.round(
            (r.aggregateVolume || 0) * (aggregateMat?.price || 0)
          ),
        },
      ];

      if (r.dpcCost && r.dpcCost > 0) {
        rowItems.push({
          rowId: r.id,
          name: `DPC (${r.name})`,
          quantity: r.dpcArea || 0,
          unit_price: dpcMat?.price || 50,
          total_price: Math.round(r.dpcCost),
        });
      }

      if (r.polytheneCost && r.polytheneCost > 0) {
        rowItems.push({
          rowId: r.id,
          name: `Polythene Sheet (${r.name})`,
          quantity: r.polytheneArea || 0,
          unit_price: polytheneMat?.price || 30,
          total_price: Math.round(r.polytheneCost),
        });
      }

      if (r.waterproofingCost && r.waterproofingCost > 0) {
        rowItems.push({
          rowId: r.id,
          name: `Waterproofing (${r.name})`,
          quantity: r.waterproofingArea || 0,
          unit_price: waterproofingMat?.price || 80,
          total_price: Math.round(r.waterproofingCost),
        });
      }

      if (r.gravelCost && r.gravelCost > 0) {
        rowItems.push({
          rowId: r.id,
          name: `Gravel (${r.name})`,
          quantity: r.gravelVolume || 0,
          unit_price: gravelMat?.price || 0,
          total_price: Math.round(r.gravelCost),
        });
      }

      if (!qsSettings.clientProvidesWater) {
        rowItems.push({
          rowId: r.id,
          name: `Water (${r.name})`,
          quantity: r.grossWaterRequiredL,
          unit_price: waterMat?.price || 0,
          total_price: (r.grossWaterRequiredL / 1000) * (waterMat?.price || 0),
        });
      }

      if (r.grossMortarCementBags && r.grossMortarCementBags > 0) {
        rowItems.push({
          rowId: r.id,
          name: `${r.name} - Mortar Cement`,
          quantity: r.grossMortarCementBags,
          unit_price: cementMat.price,
          total_price: Math.round(r.grossMortarCementBags * cementMat.price),
        });
        rowItems.push({
          rowId: r.id,
          name: `${r.name} - Mortar Sand`,
          quantity: r.grossMortarSandM3 || 0,
          unit_price: sandMat.price,
          total_price: Math.round((r.grossMortarSandM3 || 0) * sandMat.price),
        });
      }

      rowItems.push({
        rowId: r.id,
        name: `Concrete Total`,
        rate: r.unitRate,
        quantity: Math.round(r.totalVolume),
        total_price: r.totalConcreteCost,
      });

      if (r.bedVolume && r.bedVolume > 0) {
        rowItems.push({
          rowId: r.id,
          name: `Bed Total`,
          rate: r.unitRate,
          quantity: Math.round(r.bedVolume),
          total_price: r.bedVolume * r.unitRate,
        });
      }

      const totalRowCost =
        r.totalConcreteCost +
        (r.grossTotalBlocks && r.grossTotalBlocks > 0
          ? Math.round(r.grossTotalBlocks * masonryPrice)
          : 0);

      rowItems.push({
        rowId: r.id,
        name: "Total items",
        quantity: Math.round(r.totalVolume),
        total_price: totalRowCost,
      });

      return rowItems;
    });

    const totalsRows = [
      {
        rowId: "totals",
        name: "Total Cement (Concrete + Mortar)",
        quantity: totals.cement + (totals.mortarCementBags || 0),
        unit_price: cementMat.price,
        total_price: Math.round(
          (totals.cement + (totals.mortarCementBags || 0)) * cementMat.price
        ),
      },
      {
        rowId: "totals",
        name: "Total Sand (Concrete + Mortar)",
        quantity: totals.sand + (totals.mortarSandM3 || 0),
        unit_price: sandMat.price,
        total_price: Math.round(
          (totals.sand + (totals.mortarSandM3 || 0)) * sandMat.price
        ),
      },
      {
        rowId: "totals",
        name: "Total Ballast",
        quantity: totals.stone,
        unit_price: ballastMat.price,
        total_price: Math.round(totals.stone * ballastMat.price),
      },
      {
        rowId: "totals",
        name: "Total Formwork",
        quantity: totals.formworkM2,
        unit_price: formworkMat?.price || 0,
        total_price: Math.round(totals.formworkM2 * (formworkMat?.price || 0)),
      },
      {
        rowId: "totals",
        name: "Total Aggregate",
        quantity: totals.aggregateVolume || 0,
        unit_price: aggregateMat?.price || 0,
        total_price: Math.round(
          (totals.aggregateVolume || 0) * (aggregateMat?.price || 0)
        ),
      },
      ...(!qsSettings.clientProvidesWater
        ? [
            {
              rowId: "totals",
              name: "Total Water",
              quantity: totals.waterRequired,
              unit_price: waterMat?.price || 0,
              total_price: Math.round(totals.waterCost),
            },
          ]
        : []),
      ...(masonryPrice && totals.totalBlocks > 0
        ? [
            {
              rowId: "totals",
              name: `Total ${foundationMasonryType}`,
              quantity: totals.totalBlocks,
              unit_price: masonryPrice,
              total_price: Math.round(totals.totalBlocks * masonryPrice),
            },
          ]
        : []),
      ...(totals.dpcCost > 0
        ? [
            {
              rowId: "totals",
              name: "Total DPC",
              quantity: totals.dpcArea,
              unit_price: dpcMat?.price || 50,
              total_price: Math.round(totals.dpcCost),
            },
          ]
        : []),
      ...(totals.polytheneCost > 0
        ? [
            {
              rowId: "totals",
              name: "Total Polythene Sheet",
              quantity: totals.polytheneArea,
              unit_price: polytheneMat?.price || 30,
              total_price: Math.round(totals.polytheneCost),
            },
          ]
        : []),
      ...(totals.waterproofingCost > 0
        ? [
            {
              rowId: "totals",
              name: "Total Waterproofing",
              quantity: totals.waterproofingArea,
              unit_price: waterproofingMat?.price || 80,
              total_price: Math.round(totals.waterproofingCost),
            },
          ]
        : []),
      ...(totals.gravelCost > 0
        ? [
            {
              rowId: "totals",
              name: "Total Gravel",
              quantity: totals.gravelVolume,
              unit_price: gravelMat?.price || 0,
              total_price: Math.round(totals.gravelCost),
            },
          ]
        : []),
      {
        rowId: "totals",
        name: "Concrete Rate (Avg.)",
        quantity: 1,
        unit_price: Math.round(totals.materialCost / (totals.volume || 1)),
        total_price: Math.round(totals.materialCost / (totals.volume || 1)),
      },
      {
        rowId: "totals",
        name: "Concrete Total Cost",
        quantity: Math.round(totals.volume),
        unit_price: 0,
        total_price: Math.round(totals.materialCost),
      },
      {
        rowId: "totals",
        name: "Grand Total (All Materials)",
        quantity: rows[0]?.number || 1,
        total_price: Math.round(totals.totalCost),
      },
    ];

    const nextItems = [...lineItems, ...totalsRows];
    const currItems = Array.isArray(quote?.concrete_materials)
      ? quote.concrete_materials
      : [];
    const same = JSON.stringify(currItems) === JSON.stringify(nextItems);

    if (!same) {
      setQuote((prev: any) => ({ ...prev, concrete_materials: nextItems }));
    }
  }, [
    results,
    cementMat,
    sandMat,
    ballastMat,
    aggregateMat,
    formworkMat,
    waterMat,
    dpcMat,
    polytheneMat,
    waterproofingMat,
    gravelMat,
    totals,
    setQuote,
    quote?.concrete_materials,
    rows,
    qsSettings,
    foundationBlockMat,
    foundationMasonryType,
  ]);

  useEffect(() => {
    setQuote((prev: any) => ({ ...prev, qsSettings: qsSettings }));
  }, [qsSettings, setQuote]);

  return (
    <div className="space-y-4 p-1 rounded-lg">
      <h2 className="text-xl font-bold">Concrete & Foundation Calculator</h2>
      <Label className="mt-5 items-center space-x-2">
        {" "}
        Wastage Allowance (%)
        <Input
          type="number"
          value={qsSettings.wastageConcrete ?? 1}
          step="1"
          min="1"
          className="max-w-xs"
          onChange={(e) =>
            onSettingsChange({
              ...qsSettings,
              wastageConcrete: parseFloat(e.target.value),
            })
          }
          placeholder="Concrete wastage (%)"
        />
      </Label>

      {!qsSettings.clientProvidesWater && totals.waterRequired > 0 && (
        <div className="mb-3 p-3 bg-green-50 border border-blue-200 dark:bg-green-500/30 dark:border-green-500/50 rounded-lg">
          <p className="text-sm text-green-800 dark:text-white font-medium">
            💧 Water Cost Calculation:
          </p>
          <div className="text-sm text-green-700 dark:text-white mt-1 space-y-1">
            <div>
              • Water Required: {totals.waterRequired?.toFixed(0)} liters
            </div>
            <div>• Water-Cement Ratio: {qsSettings.cementWaterRatio}:1</div>
            <div>
              • Water Price: Ksh {(waterMat?.price || 0).toLocaleString()} per
              m³
            </div>
            <div className="font-semibold mt-1">
              • Total Water Cost: Ksh {(totals.waterCost || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {qsSettings.clientProvidesWater && totals.waterRequired > 0 && (
        <div className="mb-3 p-2 bg-green-50 border border-blue-200 dark:bg-green-500/30 dark:border-green-500/50 rounded-lg">
          <p className="text-sm">
            💧 Water required: {totals.waterRequired?.toFixed(0)} liters (Client
            provided - no cost included)
          </p>
        </div>
      )}

      {rows.length === 0 && <p>No elements yet. Add an item below</p>}

      {rows.map((row) => {
        const result = results.find((r) => r.id === row.id);
        return (
          <Card
            key={row.id}
            className="p-4 border dark:border-white/20 border-primary/40 rounded-lg space-y-2"
          >
            <div className="grid sm:grid-cols-4 gap-2">
              <Input
                type="text"
                value={row.name}
                onChange={(e) => updateRow(row.id, "name", e.target.value)}
                placeholder="Name (e.g. Slab 1)"
              />
              <Select
                value={row.element}
                onValueChange={(value) =>
                  handleElementChange(row.id, value as ElementType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select element" />
                </SelectTrigger>
                <SelectContent>
                  {/* Basic Elements */}
                  <SelectItem value="slab">Slab</SelectItem>
                  <SelectItem value="beam">Beam</SelectItem>
                  <SelectItem value="column">Column</SelectItem>
                  <SelectItem value="ring-beam">Ring Beam</SelectItem>
                  <SelectItem value="staircase">Staircase</SelectItem>
                  <SelectItem value="ramp">Ramp</SelectItem>
                  <SelectItem value="paving">Paving</SelectItem>
                  <SelectItem value="kerb">Kerb</SelectItem>

                  {/* Foundation Elements */}
                  <SelectItem value="foundation">Foundation</SelectItem>
                  <SelectItem value="strip-footing">Strip Footing</SelectItem>
                  <SelectItem value="raft-foundation">
                    Raft Foundation
                  </SelectItem>
                  <SelectItem value="pile-cap">Pile Cap</SelectItem>

                  {/* Underground Systems */}
                  <SelectItem value="soak-pit">Soak Pit</SelectItem>
                  <SelectItem value="soakaway">Soakaway</SelectItem>
                  <SelectItem value="septic-tank">Septic Tank</SelectItem>
                  <SelectItem value="underground-tank">
                    Underground Tank
                  </SelectItem>
                  <SelectItem value="water-tank">Water Tank</SelectItem>

                  {/* Wall Elements */}
                  <SelectItem value="retaining-wall">Retaining Wall</SelectItem>

                  {/* Civil Works */}
                  <SelectItem value="culvert">Culvert</SelectItem>
                  <SelectItem value="drainage-channel">
                    Drainage Channel
                  </SelectItem>
                  <SelectItem value="manhole">Manhole</SelectItem>
                  <SelectItem value="inspection-chamber">
                    Inspection Chamber
                  </SelectItem>
                  <SelectItem value="swimming-pool">Swimming Pool</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={row.category}
                onValueChange={(value) =>
                  updateRow(row.id, "category", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent defaultValue={"substructure"}>
                  <SelectItem value="substructure">Substructure</SelectItem>
                  <SelectItem value="superstructure">Superstructure</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => removeRow(row.id)} variant="destructive">
                <Trash className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-4 gap-2">
              <Input
                type="number"
                value={row.length}
                onChange={(e) => updateRow(row.id, "length", e.target.value)}
                placeholder={"Length (m)"}
              />
              <Input
                type="number"
                value={row.width}
                onChange={(e) => updateRow(row.id, "width", e.target.value)}
                placeholder={"Width (m)"}
              />
              <Input
                type="number"
                value={row.height}
                step="0.1"
                onChange={(e) => updateRow(row.id, "height", e.target.value)}
                placeholder={"Height/Thickness (m)"}
              />
              <Input
                type="number"
                value={row.number}
                step="1"
                min="1"
                defaultValue="1"
                onChange={(e) => updateRow(row.id, "number", e.target.value)}
                placeholder="Number of items"
              />
            </div>

            {renderSpecializedFields(row)}

            {renderWaterproofing(row)}

            {row.element === "foundation" && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`stepped-${row.id}`}
                      checked={row.isSteppedFoundation || false}
                      onCheckedChange={(checked) =>
                        updateRow(
                          row.id,
                          "isSteppedFoundation",
                          checked === true
                        )
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`stepped-${row.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Stepped Foundation
                    </Label>
                  </div>
                </div>

                {renderSteppedFoundation(row)}

                <div className="grid sm:grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`bed-${row.id}`}
                      checked={row.hasConcreteBed || false}
                      onCheckedChange={(checked) =>
                        updateRow(row.id, "hasConcreteBed", checked === true)
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`bed-${row.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Include Concrete Bed (Blinding)
                    </Label>
                  </div>

                  {row.hasConcreteBed && (
                    <Input
                      type="number"
                      value={row.bedDepth || ""}
                      onChange={(e) =>
                        updateRow(row.id, "bedDepth", e.target.value)
                      }
                      placeholder="Concrete bed depth (m)"
                      step="0.05"
                      min="0.05"
                      max="0.3"
                    />
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`aggregate-${row.id}`}
                      checked={row.hasAggregateBed || false}
                      onCheckedChange={(checked) =>
                        updateRow(row.id, "hasAggregateBed", checked === true)
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`aggregate-${row.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Include Aggregate Bed
                    </Label>
                  </div>

                  {row.hasAggregateBed && (
                    <Input
                      type="number"
                      value={row.aggregateDepth || ""}
                      onChange={(e) =>
                        updateRow(row.id, "aggregateDepth", e.target.value)
                      }
                      placeholder="Aggregate depth (m)"
                      step="0.05"
                      min="0.05"
                      max="0.3"
                    />
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`masonry-${row.id}`}
                      checked={row.hasMasonryWall || false}
                      onCheckedChange={(checked) =>
                        updateRow(row.id, "hasMasonryWall", checked === true)
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`masonry-${row.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Include Masonry Wall (Blocks/Stone)
                    </Label>
                  </div>

                  {row.hasMasonryWall && (
                    <>
                      <Select
                        value={row.masonryBlockType}
                        onValueChange={(value) =>
                          updateRow(row.id, "masonryBlockType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Block/Stone Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard Block">
                            Standard Block
                          </SelectItem>
                          <SelectItem value="Rubble Stone">
                            Rubble Stone
                          </SelectItem>
                          <SelectItem value="Dressed Stone">
                            Dressed Stone
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="text"
                        value={row.masonryBlockDimensions || "0.4x0.2x0.2"}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "masonryBlockDimensions",
                            e.target.value
                          )
                        }
                        placeholder="Block Dimensions (LxWxH in m)"
                      />
                      <Input
                        type="number"
                        value={row.masonryWallThickness || ""}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "masonryWallThickness",
                            e.target.value
                          )
                        }
                        placeholder="Wall Thickness (m, e.g., 0.2)"
                        step="0.05"
                        min="0.1"
                      />
                      <Input
                        type="number"
                        value={row.masonryWallHeight || ""}
                        onChange={(e) =>
                          updateRow(row.id, "masonryWallHeight", e.target.value)
                        }
                        placeholder="Wall Height (m, e.g., 1.0)"
                        step="0.1"
                        min="0.1"
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {result && (
              <div className="mt-2 text-sm">
                <p>
                  <b>Total Concrete Volume:</b> {result.totalVolume.toFixed(2)}{" "}
                  m³
                </p>
                <p>
                  <b>Concrete Rate:</b> Ksh {result.unitRate.toFixed(0)}/m³
                </p>
                <p>
                  <b>Concrete Cost:</b> Ksh{" "}
                  {Math.round(result.totalConcreteCost).toLocaleString()}
                </p>

                {(result.dpcCost ||
                  result.polytheneCost ||
                  result.waterproofingCost) > 0 && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <h4 className="font-semibold mb-2">Waterproofing Costs:</h4>
                    {result.dpcCost > 0 && (
                      <p>
                        <b>DPC:</b> {result.dpcArea?.toFixed(2)} m² — Ksh{" "}
                        {Math.round(result.dpcCost).toLocaleString()}
                      </p>
                    )}
                    {result.polytheneCost > 0 && (
                      <p>
                        <b>Polythene:</b> {result.polytheneArea?.toFixed(2)} m²
                        — Ksh{" "}
                        {Math.round(result.polytheneCost).toLocaleString()}
                      </p>
                    )}
                    {result.waterproofingCost > 0 && (
                      <p>
                        <b>Waterproofing:</b>{" "}
                        {result.waterproofingArea?.toFixed(2)} m² — Ksh{" "}
                        {Math.round(result.waterproofingCost).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {result.gravelVolume > 0 && (
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                    <h4 className="font-semibold mb-2">Gravel Backfill:</h4>
                    <p>
                      <b>Gravel Volume:</b> {result.gravelVolume.toFixed(2)} m³
                      — Ksh{" "}
                      {Math.round(result.gravelCost || 0).toLocaleString()}
                    </p>
                  </div>
                )}

                {result.element === "foundation" && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-800/40 rounded-md">
                    <h4 className="font-semibold mb-2">Foundation Workings:</h4>

                    {result.steppedFoundationVolume > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold">
                          Stepped Foundation Volume:{" "}
                          {result.steppedFoundationVolume.toFixed(2)} m³
                        </h4>
                      </div>
                    )}

                    {result.bedVolume > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold">
                          Concrete Bed Workings:
                        </h4>
                        <p>
                          <b>Bed Area:</b> {result.bedArea?.toFixed(2)} m²
                        </p>
                        <p>
                          <b>Bed Volume:</b> {result.bedVolume?.toFixed(2)} m³
                        </p>
                        <p>
                          <b>Bed Cost:</b> Ksh{" "}
                          {Math.round(
                            result.bedVolume * calculateConcreteRateForRow(row)
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {result.aggregateVolume > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold">
                          Aggregate Bed Workings:
                        </h4>
                        <p>
                          <b>Aggregate Area:</b>{" "}
                          {result.aggregateArea?.toFixed(2)} m²
                        </p>
                        <p>
                          <b>Aggregate Volume:</b>{" "}
                          {result.aggregateVolume?.toFixed(2)} m³
                        </p>
                        <p>
                          <b>Aggregate Cost:</b> Ksh{" "}
                          {Math.round(
                            result.aggregateVolume * (aggregateMat?.price || 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {result.grossTotalBlocks > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold">
                          Masonry Wall Workings:
                        </h4>
                        <p>
                          <b>Blocks/Stones:</b>{" "}
                          {Math.ceil(result.grossTotalBlocks).toLocaleString()}{" "}
                          units
                        </p>
                        <p>
                          <b>Mortar Cement:</b>{" "}
                          {result.grossMortarCementBags?.toFixed(1)} bags
                        </p>
                        <p>
                          <b>Mortar Sand:</b>{" "}
                          {result.grossMortarSandM3?.toFixed(2)} m³
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2">
                  <h4 className="font-semibold">Material Breakdown:</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                    (Cement, sand, ballast, water, aggregate are included in the
                    concrete rate)
                  </p>
                  <p>
                    <b>Cement:</b> {result.netCementBags.toFixed(1)} bags (net)
                    → {result.grossCementBags.toFixed(1)} bags (gross) —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.grossCementBags * (cementMat?.price || 0)
                      ).toLocaleString()}
                    </b>
                  </p>
                  <p>
                    <b>Sand:</b> {result.netSandM3.toFixed(2)} m³ (net) →{" "}
                    {result.grossSandM3.toFixed(2)} m³ (gross) —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.grossSandM3 * (sandMat?.price || 0)
                      ).toLocaleString()}
                    </b>
                  </p>
                  <p>
                    <b>Ballast:</b> {result.netStoneM3.toFixed(2)} m³ (net) →{" "}
                    {result.grossStoneM3.toFixed(2)} m³ (gross) —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.grossStoneM3 * (ballastMat?.price || 0)
                      ).toLocaleString()}
                    </b>
                  </p>
                  <p>
                    <b>Formwork:</b> {result.formworkM2.toFixed(2)} m² —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.formworkM2 * (formworkMat?.price || 0)
                      ).toLocaleString()}
                    </b>
                  </p>

                  {!qsSettings.clientProvidesWater && (
                    <p>
                      <b>Water:</b> {result.netWaterRequiredL?.toFixed(0)} L
                      (net) → {result.grossWaterRequiredL?.toFixed(0)} L (gross)
                      —{" "}
                      <b>
                        Ksh {Math.round(result.waterCost || 0).toLocaleString()}
                      </b>
                    </p>
                  )}

                  <div className="ml-4 mt-1 p-2 bg-card dark:bg-primary/20 rounded-lg text-xs">
                    <p>
                      <b>Water Breakdown:</b>
                    </p>
                    <p>• Mixing: {result.waterMixingL?.toFixed(0)} L</p>
                    <p>• Curing: {result.waterCuringL?.toFixed(0)} L</p>
                    <p>• Other uses: {result.waterOtherL?.toFixed(0)} L</p>
                    <p>
                      • Aggregate adjustment:{" "}
                      {result.waterAggregateAdjustmentL?.toFixed(0)} L
                    </p>
                  </div>

                  {result.grossTotalBlocks > 0 && (
                    <>
                      <p>
                        <b>{row.masonryBlockType || "Blocks"}:</b>{" "}
                        {Math.ceil(result.netTotalBlocks || 0).toLocaleString()}{" "}
                        units (net) →{" "}
                        {Math.ceil(
                          result.grossTotalBlocks || 0
                        ).toLocaleString()}{" "}
                        units (gross) —{" "}
                        <b>
                          Ksh{" "}
                          {Math.round(
                            result.grossTotalBlocks * (foundationBlockMat || 0)
                          ).toLocaleString()}
                        </b>
                      </p>
                      <p>
                        <b>Mortar Cement:</b>{" "}
                        {result.netMortarCementBags?.toFixed(1)} bags (net) →{" "}
                        {result.grossMortarCementBags?.toFixed(1)} bags (gross)
                        —{" "}
                        <b>
                          Ksh{" "}
                          {Math.round(
                            result.grossMortarCementBags *
                              (cementMat?.price || 0)
                          ).toLocaleString()}
                        </b>
                      </p>
                      <p>
                        <b>Mortar Sand:</b> {result.netMortarSandM3?.toFixed(2)}{" "}
                        m³ (net) → {result.grossMortarSandM3?.toFixed(2)} m³
                        (gross) —{" "}
                        <b>
                          Ksh{" "}
                          {Math.round(
                            result.grossMortarSandM3 * (sandMat?.price || 0)
                          ).toLocaleString()}
                        </b>
                      </p>
                    </>
                  )}

                  {result.gravelVolume > 0 && (
                    <p>
                      <b>Gravel:</b> {result.gravelVolume.toFixed(2)} m³ —{" "}
                      <b>
                        Ksh{" "}
                        {Math.round(result.gravelCost || 0).toLocaleString()}
                      </b>
                    </p>
                  )}

                  <div className="ml-4 mt-1 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-xs">
                    <p>
                      <b>Cost Breakdown:</b>
                    </p>
                    <p>
                      • Material Cost: Ksh{" "}
                      {Math.round(result.materialCost || 0).toLocaleString()}
                    </p>
                    <p>
                      • Total Cost: Ksh{" "}
                      {Math.round(
                        result.totalConcreteCost || 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      <Button onClick={addRow} className="px-4 py-2 text-white">
        + Add Element
      </Button>

      <Card className="p-4 border rounded-lg mt-4">
        <h3 className="font-bold">Totals</h3>
        <p>
          <b>Total Concrete Volume:</b> {totals?.volume?.toFixed(2)} m³
        </p>
        <p>
          <b>Total Cement (Concrete):</b> {totals?.cement?.toFixed(1)} bags —{" "}
          <b>
            Ksh{" "}
            {Math.round(
              totals?.cement * (cementMat?.price || 0)
            ).toLocaleString()}
          </b>
        </p>
        <p>
          <b>Total Sand (Concrete):</b> {totals.sand?.toFixed(2)} m³ —{" "}
          <b>
            Ksh{" "}
            {Math.round(totals.sand * (sandMat?.price || 0)).toLocaleString()}
          </b>
        </p>
        <p>
          <b>Total Ballast:</b> {totals.stone?.toFixed(2)} m³ —{" "}
          <b>
            Ksh{" "}
            {Math.round(
              totals.stone * (ballastMat?.price || 0)
            ).toLocaleString()}
          </b>
        </p>
        <p>
          <b>Total Formwork:</b> {totals.formworkM2?.toFixed(2)} m² —{" "}
          <b>
            Ksh{" "}
            {Math.round(
              totals.formworkM2 * (formworkMat?.price || 0)
            ).toLocaleString()}
          </b>
        </p>

        {!qsSettings.clientProvidesWater && totals.waterCost > 0 && (
          <p>
            <b>Total Water:</b> {totals.waterRequired?.toFixed(0)} liters —{" "}
            <b>Ksh {Math.round(totals.waterCost || 0).toLocaleString()}</b>
          </p>
        )}

        {totals.totalBlocks > 0 && (
          <>
            <p>
              <b>Total {foundationMasonryType}:</b>{" "}
              {Math.ceil(totals.totalBlocks).toLocaleString()} units —{" "}
              <b>
                Ksh{" "}
                {Math.round(
                  totals.totalBlocks * (foundationBlockMat || 0)
                ).toLocaleString()}
              </b>
            </p>
            <p>
              <b>Total Mortar Cement:</b> {totals.mortarCementBags?.toFixed(1)}{" "}
              bags —{" "}
              <b>
                Ksh{" "}
                {Math.round(
                  totals.mortarCementBags * (cementMat?.price || 0)
                ).toLocaleString()}
              </b>
            </p>
            <p>
              <b>Total Mortar Sand:</b> {totals.mortarSandM3?.toFixed(2)} m³ —{" "}
              <b>
                Ksh{" "}
                {Math.round(
                  totals.mortarSandM3 * (sandMat?.price || 0)
                ).toLocaleString()}
              </b>
            </p>
          </>
        )}

        {totals.dpcCost > 0 && (
          <p>
            <b>Total DPC:</b> {totals.dpcArea?.toFixed(2)} m² —{" "}
            <b>Ksh {Math.round(totals.dpcCost).toLocaleString()}</b>
          </p>
        )}

        {totals.polytheneCost > 0 && (
          <p>
            <b>Total Polythene Sheet:</b> {totals.polytheneArea?.toFixed(2)} m²
            — <b>Ksh {Math.round(totals.polytheneCost).toLocaleString()}</b>
          </p>
        )}

        {totals.waterproofingCost > 0 && (
          <p>
            <b>Total Waterproofing:</b> {totals.waterproofingArea?.toFixed(2)}{" "}
            m² —{" "}
            <b>Ksh {Math.round(totals.waterproofingCost).toLocaleString()}</b>
          </p>
        )}

        {totals.gravelCost > 0 && (
          <p>
            <b>Total Gravel:</b> {totals.gravelVolume?.toFixed(2)} m³ —{" "}
            <b>Ksh {Math.round(totals.gravelCost).toLocaleString()}</b>
          </p>
        )}

        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
          <p>
            <b>Cost Breakdown:</b>
          </p>
          <p>
            • Total Material Cost: Ksh{" "}
            {Math.round(totals.totalCost || 0).toLocaleString()}
          </p>
        </div>

        <p className="mt-2 font-bold text-lg">
          Grand Total (All Materials): Ksh{" "}
          {Math.round(totals.totalCost || 0).toLocaleString()}
        </p>
      </Card>
    </div>
  );
}
