// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Calculator } from "lucide-react";

export interface EarthworkItem {
  id: string;
  type: string;
  length: string;
  width: string;
  depth: string;
  volume: string;
  material: string;
}

interface EarthworksFormProps {
  earthworks: EarthworkItem[];
  setEarthworks: (earthworks: EarthworkItem[]) => void;
  excavationRates: any;
  setQuoteData?: (data: any) => void;
  quote?;
}

const EarthworksForm: React.FC<EarthworksFormProps> = ({
  earthworks,
  setEarthworks,
  excavationRates,
  setQuoteData,
  quote,
}) => {
  // Calculate volume based on dimensions
  const calculateVolume = (
    length: string,
    width: string,
    depth: string
  ): string => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const d = parseFloat(depth) || 0;
    return (l * w * d).toFixed(3);
  };

  // Get the earthwork rate price
  const getEarthworkRate = (): number => {
    const earthworkRate = excavationRates.find((m) =>
      m.name?.toLowerCase().includes("earthwork")
    );
    return earthworkRate?.price || earthworkRate?.rate || 0;
  };

  useEffect(() => {
    setQuoteData((prev: any) => ({
      ...prev,
      earthwork: earthworks,
    }));
  }, [earthworks]);

  // Calculate price for an earthwork item
  const calculatePrice = (item: EarthworkItem): number => {
    const rate = getEarthworkRate();
    const volume = parseFloat(item.volume) || 0;
    return volume * rate;
  };

  // Calculate total price for all earthworks
  const calculateTotalPrice = (): number => {
    return earthworks.reduce((total, item) => total + calculatePrice(item), 0);
  };

  // Update earthwork item
  const updateEarthwork = (
    id: string,
    field: keyof EarthworkItem,
    value: string
  ) => {
    setEarthworks(
      earthworks.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate volume if dimensions change
          if (field === "length" || field === "width" || field === "depth") {
            updatedItem.volume = calculateVolume(
              field === "length" ? value : item.length,
              field === "width" ? value : item.width,
              field === "depth" ? value : item.depth
            );
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Add new earthwork item
  const addEarthwork = () => {
    const newEarthwork: EarthworkItem = {
      id: `earthwork-${Date.now()}`,
      type: "foundation-excavation",
      length: "",
      width: "",
      depth: "",
      volume: "0",
      material: "soil",
    };
    setEarthworks([...earthworks, newEarthwork]);
  };

  // Remove earthwork item
  const removeEarthwork = (id: string) => {
    setEarthworks(earthworks.filter((item) => item.id !== id));
  };

  // Earthwork types and materials
  const earthworkTypes = [
    { value: "foundation-excavation", label: "Foundation Excavation" },
    { value: "trench-excavation", label: "Trench Excavation" },
    { value: "bulk-excavation", label: "Bulk Excavation" },
    { value: "topsoil-removal", label: "Topsoil Removal" },
    { value: "site-leveling", label: "Site Leveling" },
    { value: "backfilling", label: "Backfilling" },
  ];

  const materials = [
    { value: "soil", label: "Soil" },
    { value: "clay", label: "Clay" },
    { value: "rock", label: "Rock" },
    { value: "sand", label: "Sand" },
    { value: "mixed", label: "Mixed Material" },
  ];

  const earthworkRate = getEarthworkRate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <Calculator className="w-5 h-5" />
          Earthworks Calculation
        </h3>

        {/* Earthworks List */}
        <div className="space-y-4">
          {earthworks.map((earthwork, index) => (
            <Card key={earthwork.id} className="p-6">
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Earthwork Item #{index + 1}
                  </h4>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeEarthwork(earthwork.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Earthwork Type */}
                  <div className="space-y-2">
                    <Label htmlFor={`type-${earthwork.id}`}>
                      Earthwork Type
                    </Label>
                    <Select
                      value={earthwork.type}
                      onValueChange={(value) =>
                        updateEarthwork(earthwork.id, "type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {earthworkTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Material Type */}
                  <div className="space-y-2">
                    <Label htmlFor={`material-${earthwork.id}`}>Material</Label>
                    <Select
                      value={earthwork.material}
                      onValueChange={(value) =>
                        updateEarthwork(earthwork.id, "material", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material) => (
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

                  {/* Dimensions */}
                  <div className="space-y-2">
                    <Label htmlFor={`length-${earthwork.id}`}>Length (m)</Label>
                    <Input
                      id={`length-${earthwork.id}`}
                      type="number"
                      step="0.1"
                      min="0"
                      value={earthwork.length}
                      onChange={(e) =>
                        updateEarthwork(earthwork.id, "length", e.target.value)
                      }
                      placeholder="0.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`width-${earthwork.id}`}>Width (m)</Label>
                    <Input
                      id={`width-${earthwork.id}`}
                      type="number"
                      step="0.1"
                      min="0"
                      value={earthwork.width}
                      onChange={(e) =>
                        updateEarthwork(earthwork.id, "width", e.target.value)
                      }
                      placeholder="0.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`depth-${earthwork.id}`}>Depth (m)</Label>
                    <Input
                      id={`depth-${earthwork.id}`}
                      type="number"
                      step="0.1"
                      min="0"
                      value={earthwork.depth}
                      onChange={(e) =>
                        updateEarthwork(earthwork.id, "depth", e.target.value)
                      }
                      placeholder="0.0"
                    />
                  </div>

                  {/* Calculated Values */}
                  <div className="space-y-2">
                    <Label htmlFor={`volume-${earthwork.id}`}>
                      Volume (m³)
                    </Label>
                    <Input
                      id={`volume-${earthwork.id}`}
                      type="text"
                      value={earthwork.volume}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-600 font-medium"
                    />
                  </div>

                  {/* Price Calculation */}
                  <div className="space-y-2">
                    <Label htmlFor={`price-${earthwork.id}`}>
                      Unit Price (KES/m³)
                    </Label>
                    <Input
                      id={`price-${earthwork.id}`}
                      type="text"
                      value={earthworkRate.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`total-${earthwork.id}`}>
                      Total Cost (KES)
                    </Label>
                    <Input
                      id={`total-${earthwork.id}`}
                      type="text"
                      value={calculatePrice(earthwork).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-600 font-medium text-green-600 dark:text-green-400"
                    />
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Calculation: {earthwork.volume}m³ × KES{" "}
                    {earthworkRate.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    /m³ = KES{" "}
                    {calculatePrice(earthwork).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Earthwork Button */}
        <Button onClick={addEarthwork} className="mt-4" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Earthwork Item
        </Button>

        {/* Total Summary */}
        {earthworks.length > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Total Earthworks Cost
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {earthworks.length} item(s) • Total Volume:{" "}
                    {earthworks
                      .reduce(
                        (total, item) => total + parseFloat(item.volume),
                        0
                      )
                      .toFixed(3)}
                    m³
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    KES{" "}
                    {calculateTotalPrice().toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default EarthworksForm;
