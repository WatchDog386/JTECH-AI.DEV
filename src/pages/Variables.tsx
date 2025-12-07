// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserTransportRate, useUserSettings } from "@/hooks/useUserSettings";
import { useDynamicPricing } from "@/hooks/useDynamicPricing";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Settings,
  DollarSign,
  Wrench,
  Truck,
  Users,
  Building,
  Plus,
  Edit,
  Save,
  Loader2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import renderMaterialEditor from "@/components/RenderMaterialEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const Variables = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [services, setServices] = useState<any[]>([]);
  const {
    equipmentTypes,
    additionalServices,
    equipmentRates,
    serviceRates,
    updateEquipmentRate,
    updateTransportRate,
    updateServiceRate,
    updateSubcontractorRate,
  } = useUserSettings();
  const {
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    updateMaterialPrice,
    getEffectiveMaterialPrice,
    getEffectiveMaterialPriceSingle,
    updateMaterialPriceSingle,
  } = useDynamicPricing();
  const [tempValues, setTempValues] = useState<{
    [key: string]: number | string;
  }>({});
  const fetchRates = async () => {
    setLoading(true);
    const { data: baseServices, error: baseError } = await supabase
      .from("subcontractor_prices")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_subcontractor_rates")
      .select("service_id, price")
      .eq("user_id", profile.id);
    if (baseError) console.error("Base rates error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);
    const merged = baseServices.map((service) => {
      const userRate = overrides?.find((o) => o.service_id === service.id);
      const rate = userRate
        ? Number(userRate.price)
        : service.price != null
        ? Number(service.price)
        : 0;
      return {
        ...service,
        price: rate,
        unit: service.unit ?? "unit",
        source: userRate ? "user" : service.price != null ? "base" : "none",
      };
    });
    setServices(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (user && profile !== null) {
      fetchTransportRates();
      fetchRates();
    }
  }, [user, profile, location.key]);

  type SaveType =
    | "material"
    | "equipment"
    | "service"
    | "subcontractor"
    | "transport"
    | "material_no_type";
  const [transportRates, setTransportRates] = useState<UserTransportRate[]>([]);

  const fetchTransportRates = useCallback(async () => {
    const { data: baseRates, error: baseError } = await supabase
      .from("transport_rates")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_transport_rates")
      .select("region, cost_per_km, base_cost")
      .eq("user_id", profile.id);
    if (baseError) console.error("Base transport rates error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);
    const allRegions = [
      "Nairobi",
      "Mombasa",
      "Kisumu",
      "Nakuru",
      "Eldoret",
      "Thika",
      "Machakos",
    ];
    const merged = allRegions.map((region) => {
      const base = baseRates.find(
        (r) => r.region.toLowerCase() === region.toLowerCase()
      );
      const userRate = overrides?.find(
        (o) => o.region.toLowerCase() === region.toLowerCase()
      );
      return {
        id: profile.id,
        region,
        cost_per_km: userRate?.cost_per_km ?? base?.cost_per_km ?? 50,
        base_cost: userRate?.base_cost ?? base?.base_cost ?? 500,
        source: userRate ? "user" : base ? "base" : "default",
      };
    });
    setTransportRates(merged);
  }, [user, location.key]);

  const handleSaveEquipment = async (
    equipmentTypeId: string,
    rate: number,
    quantity: number,
    unit: string
  ) => {
    setLoading(true);
    try {
      await updateEquipmentRate(equipmentTypeId, rate, quantity, unit);
      // Clear temp values for this equipment after successful save
      setTempValues((prev) => {
        const newValues = { ...prev };
        delete newValues[`equipment-rate-${equipmentTypeId}`];
        delete newValues[`equipment-quantity-${equipmentTypeId}`];
        delete newValues[`equipment-unit-${equipmentTypeId}`];
        return newValues;
      });
      toast({
        title: "Success",
        description: "Equipment rate updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update equipment rate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (
    material_type: string | undefined,
    type: SaveType,
    id: string,
    name: string,
    value: any,
    index?: number
  ) => {
    setLoading(true);
    try {
      const userRegion = profile?.location || "Nairobi";
      switch (type) {
        case "material_no_type":
          await updateMaterialPriceSingle(id, name, value, userRegion);
          break;
        case "material":
          await updateMaterialPrice(
            material_type,
            id,
            userRegion,
            value,
            index
          );
          break;
        case "service":
          await updateServiceRate(id, value);
          break;
        case "subcontractor":
          await updateSubcontractorRate(id, value);
          await fetchRates();
          break;
        case "transport": {
          const [region, field] = id.split("-");
          const currentRate = transportRates.find((r) => r.region === region);
          if (field === "km") {
            await updateTransportRate(
              region,
              value,
              currentRate?.base_cost || 500
            );
          } else {
            await updateTransportRate(
              region,
              currentRate?.cost_per_km || 50,
              value
            );
          }
          fetchTransportRates();
          break;
        }
      }
      toast({
        title: "Success",
        description: "Variable updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update variable",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  if (!user) {
    navigate("/auth");
  }
  return (
    <div className=" scrollbar-hide min-h-screen animate-fade-in">
      <div className="container  scrollbar-hide mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="sm:text-2xl text-xl font-bold flex items-center bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
            <Settings className="sm:w-7 sm:h-7 mr-3 text-primary dark:text-white" />
            Variables & Pricing
          </h1>
          <p className="text-sm sm:text-lg bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-400 dark:to-purple-900 bg-clip-text text-transparent mt-2">
            Configure all pricing variables and settings for your construction
            projects
          </p>
        </div>

        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full grid-cols-5 md:gap-2 mb-2 h-full">
            {[
              { value: "materials", icon: Building, label: "Materials" },
              { value: "equipment", icon: Wrench, label: "Equipment" },
              { value: "transport", icon: Truck, label: "Transport" },
              { value: "services", icon: Plus, label: "Services" },
              { value: "subcontractors", icon: Users, label: "Subcontractors" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex flex-col sm:flex-row items-center justify-center p-2 sm:p-2 text-sm"
              >
                <tab.icon className="w-4 h-4 sm:mr-2 sm:mb-0" />
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent
            value="materials"
            className="space-y-3 sm:space-y-4 animate-fade-in"
          >
            <Card className=" animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Building className="w-5 h-5 sm:w-5 sm:h-5 mr-2" />
                  Material Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 p-3 sm:p-4 bg-blue-50 dark:bg-primary/20 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                    <strong>Region:</strong> {profile?.location || "Nairobi"} -
                    Prices shown include regional multipliers for base prices.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {materialBasePrices.map((material) => {
                    const userRegion = profile?.location || "Nairobi";
                    const userOverride = userMaterialPrices.find(
                      (p) =>
                        p.material_id === material.id && p.region === userRegion
                    );
                    const effectivePrice = getEffectiveMaterialPriceSingle(
                      material.id,
                      userRegion
                    );
                    const isCustomPrice = !!userOverride;
                    return (
                      <Card key={material.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <h4 className="font-medium">{material.name}</h4>
                              {material.description && (
                                <p className="text-xs text-muted-foreground">
                                  {material.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge
                                className="text-gray-700"
                                variant="secondary"
                              >
                                {material.unit}
                              </Badge>
                              {isCustomPrice && (
                                <Badge
                                  variant="outline"
                                  className="ml-1 text-xs"
                                >
                                  Custom
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {![
                              "Bricks",
                              "Doors",
                              "Windows",
                              "DPC",
                              "Rebar",
                              "Window Frames",
                              "Door Frames",
                              "Ceiling",
                              "Cable",
                              "Flooring",
                              "Accesories",
                              "BRC Mesh",
                              "Fasteners",
                              "Fixtures",
                              "Glazing",
                              "Insulation",
                              "Paint",
                              "Sealant",
                              "Pipes",
                              "Outlets",
                              "Insulation",
                              "Joinery",
                              "Lighting",
                              "Roof-Covering",
                              "Timber",
                              "UnderLayment",
                              "Wall-Finishes",
                            ].includes(material.name) && (
                              <div className="text-sm text-muted-foreground">
                                Base: KSh {material.price.toLocaleString()}
                                {!isCustomPrice && (
                                  <span className="text-xs ml-1">
                                    (
                                    {regionalMultipliers.find(
                                      (r) => r.region === userRegion
                                    )?.multiplier || 1}
                                    )
                                  </span>
                                )}
                              </div>
                            )}
                            {![
                              "Bricks",
                              "Doors",
                              "Windows",
                              "Rebar",
                              "Window Frames",
                              "Door Frames",
                              "Ceiling",
                              "Sealant",
                              "Cable",
                              "Flooring",
                              "Accesories",
                              "BRC Mesh",
                              "Fasteners",
                              "Fixtures",
                              "DPC",
                              "Glazing",
                              "Insulation",
                              "Paint",
                              "Pipes",
                              "Outlets",
                              "Insulation",
                              "Joinery",
                              "Lighting",
                              "Roof-Covering",
                              "Timber",
                              "UnderLayment",
                              "Wall-Finishes",
                            ].includes(material.name) && (
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder={effectivePrice.toLocaleString()}
                                  onChange={(e) =>
                                    setTempValues({
                                      ...tempValues,
                                      [`material-${material.id}`]:
                                        parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="flex-1"
                                />
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleSave(
                                      undefined,
                                      "material_no_type",
                                      material.id,
                                      material.name,
                                      tempValues[`material-${material.id}`] ||
                                        effectivePrice,
                                      0
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <Save className="w-4 h-4 text-white" />
                                </Button>
                              </div>
                            )}
                            {![
                              "Bricks",
                              "Doors",
                              "Windows",
                              "Rebar",
                              "Window Frames",
                              "Door Frames",
                              "Ceiling",
                              "Cable",
                              "Flooring",
                              "Sealant",
                              "DPC",
                              "Accesories",
                              "BRC Mesh",
                              "Fasteners",
                              "Fixtures",
                              "Glazing",
                              "Insulation",
                              "Paint",
                              "Pipes",
                              "Outlets",
                              "Insulation",
                              "Joinery",
                              "Lighting",
                              "Roof-Covering",
                              "Timber",
                              "UnderLayment",
                              "Wall-Finishes",
                            ].includes(material.name) && (
                              <div className="text-xs text-emerald-600 font-medium">
                                Current: KSh {effectivePrice.toLocaleString()}
                              </div>
                            )}
                          </div>
                          {renderMaterialEditor(
                            material,
                            tempValues,
                            setTempValues,
                            handleSave,
                            materialBasePrices,
                            userMaterialPrices,
                            regionalMultipliers,
                            userRegion,
                            getEffectiveMaterialPrice
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4 animate-fade-in">
            <Card className="animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  Equipment Daily Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipmentTypes.map((equipment) => {
                    const userRate = equipmentRates.find(
                      (r) => r.equipment_type_id === equipment.id
                    );
                    const currentRate = userRate
                      ? userRate.rate_per_unit
                      : equipment.rate_per_unit;
                    const usageQuantity = userRate
                      ? userRate.usage_quantity
                      : equipment.usage_quantity;
                    const usageUnit = userRate
                      ? userRate.usage_unit
                      : equipment.usage_unit;

                    // Get current temp values for this equipment
                    const tempRate = tempValues[
                      `equipment-rate-${equipment.id}`
                    ] as number | undefined;
                    const tempQuantity = tempValues[
                      `equipment-quantity-${equipment.id}`
                    ] as number | undefined;
                    const tempUnit = tempValues[
                      `equipment-unit-${equipment.id}`
                    ] as string | undefined;

                    const displayRate =
                      tempRate !== undefined ? tempRate : currentRate;
                    const displayQuantity =
                      tempQuantity !== undefined ? tempQuantity : usageQuantity;
                    const displayUnit =
                      tempUnit !== undefined ? tempUnit : usageUnit;

                    return (
                      <Card key={equipment.id} className="card-hover">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{equipment.name}</h4>
                            <Badge
                              className="text-gray-700"
                              variant="secondary"
                            >
                              KSh {displayRate?.toLocaleString()}/{displayUnit}
                            </Badge>
                          </div>
                          {equipment.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {equipment.description}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`rate-${equipment.id}`}>
                                Rate (KSh)
                              </Label>
                              <Input
                                id={`rate-${equipment.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  tempRate !== undefined
                                    ? tempRate
                                    : currentRate || ""
                                }
                                onChange={(e) =>
                                  setTempValues({
                                    ...tempValues,
                                    [`equipment-rate-${equipment.id}`]:
                                      parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="flex-1"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`unit-${equipment.id}`}>
                                Unit
                              </Label>
                              <Select
                                value={tempUnit || usageUnit || "day"}
                                onValueChange={(value) =>
                                  setTempValues({
                                    ...tempValues,
                                    [`equipment-unit-${equipment.id}`]: value,
                                  })
                                }
                              >
                                <SelectTrigger id={`unit-${equipment.id}`}>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hour">Hour</SelectItem>
                                  <SelectItem value="day">Day</SelectItem>
                                  <SelectItem value="week">Week</SelectItem>
                                  <SelectItem value="month">Month</SelectItem>
                                  <SelectItem value="unit">Unit</SelectItem>
                                  <SelectItem value="trip">Trip</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-end space-y-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  const rateToSave =
                                    tempRate !== undefined
                                      ? tempRate
                                      : currentRate;
                                  const quantityToSave =
                                    tempQuantity !== undefined
                                      ? tempQuantity
                                      : usageQuantity;
                                  const unitToSave =
                                    tempUnit !== undefined
                                      ? tempUnit
                                      : usageUnit;

                                  handleSaveEquipment(
                                    equipment.id,
                                    rateToSave,
                                    quantityToSave,
                                    unitToSave
                                  );
                                }}
                                disabled={loading}
                                className="w-full text-white"
                              >
                                {loading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 mr-1" />
                                    Save
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                          {(tempRate !== undefined ||
                            tempQuantity !== undefined ||
                            tempUnit !== undefined) && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Unsaved changes
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transport" className="space-y-4 animate-fade-in">
            <Card className="animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Transport Rates by Region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-blue-50 dark:bg-primary/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Your Region:</strong>{" "}
                    {profile?.location || "Not set"} - Transport rates shown for
                    all regions. Custom prices will override defaults.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transportRates.map((rate) => {
                    const costPerKm = rate ? rate.cost_per_km : 50;
                    const baseCost = rate ? rate.base_cost : 500;
                    return (
                      <Card key={rate.region} className="card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{rate.region}</h4>
                            {rate.region === profile?.location && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Your Region
                              </span>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm">
                                Cost per KM (KSh)
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder={costPerKm.toLocaleString()}
                                  onChange={(e) =>
                                    setTempValues({
                                      ...tempValues,
                                      [`transport-${rate.region}-km`]:
                                        parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="flex-1"
                                />
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleSave(
                                      undefined,
                                      "transport",
                                      `${rate.region}-km`,
                                      "name",
                                      tempValues[
                                        `transport-${rate.region}-km`
                                      ] || costPerKm,
                                      0
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <Save className="w-4 h-4 text-white" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm">Base Cost (KSh)</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder={baseCost.toLocaleString()}
                                  onChange={(e) =>
                                    setTempValues({
                                      ...tempValues,
                                      [`transport-${rate.region}-base`]:
                                        parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="flex-1"
                                />
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleSave(
                                      undefined,
                                      "transport",
                                      `${rate.region}-base`,
                                      "name",
                                      tempValues[
                                        `transport-${rate.region}-base`
                                      ] || baseCost,
                                      0
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <Save className="w-4 h-4 text-white" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4 animate-fade-in">
            <Card className=" animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Additional Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {additionalServices.map((service) => {
                    const userRate = serviceRates.find(
                      (r) => r.service_id === service.id
                    );
                    const currentPrice = userRate
                      ? userRate.price
                      : service.price;
                    return (
                      <Card key={service.id} className=" card-hover">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{service.name}</h4>
                            <Badge
                              className="text-gray-700"
                              variant="secondary"
                            >
                              {service.category}
                            </Badge>
                          </div>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="0"
                              placeholder={currentPrice.toLocaleString()}
                              onChange={(e) =>
                                setTempValues({
                                  ...tempValues,
                                  [`service-${service.id}`]:
                                    parseFloat(e.target.value) || 0,
                                })
                              }
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() =>
                                handleSave(
                                  undefined,
                                  "service",
                                  service.id,
                                  "name",
                                  tempValues[`service-${service.id}`] ||
                                    currentPrice,
                                  0
                                )
                              }
                              disabled={loading}
                            >
                              <Save className="w-4 h-4 text-white" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="subcontractors"
            className="space-y-4 animate-fade-in"
          >
            <Card className=" animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Subcontractor Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((sub) => (
                    <Card key={sub.id} className=" card-hover">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{sub.name}</h4>
                          <Badge className="text-gray-700" variant="secondary">
                            KSh {Number(sub.price || 0).toLocaleString()}/
                            {sub.unit ?? "unit"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder={sub.price.toLocaleString() || 0}
                            onChange={(e) =>
                              setTempValues({
                                ...tempValues,
                                [sub.id]: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              handleSave(
                                undefined,
                                "subcontractor",
                                sub.id,
                                tempValues[sub.id] || sub.rate,
                                0
                              )
                            }
                            disabled={loading}
                          >
                            <Save className="w-4 h-4 text-white" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default Variables;
