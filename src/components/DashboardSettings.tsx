// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Settings, Truck, Wrench, Plus, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
const DashboardSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const {
    loading: settingsLoading,
    equipmentTypes,
    equipmentRates,
    transportRates,
    additionalServices,
    serviceRates,
    updateEquipmentRate,
    updateTransportRate,
    updateServiceRate,
  } = useUserSettings();
  const [tempValues, setTempValues] = useState<{
    [key: string]: number;
  }>({});
  const handleUpdateEquipmentRate = async (
    equipmentTypeId: string,
    rate: number
  ) => {
    setLoading(true);
    const { error } = await updateEquipmentRate(equipmentTypeId, rate);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update equipment rate",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Equipment rate updated successfully",
      });
    }
    setLoading(false);
  };
  const handleUpdateTransportRate = async (
    region: string,
    costPerKm: number,
    baseCost: number
  ) => {
    setLoading(true);
    const { error } = await updateTransportRate(region, costPerKm, baseCost);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update transport rate",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transport rate updated successfully",
      });
    }
    setLoading(false);
  };
  const handleUpdateServiceRate = async (serviceId: string, price: number) => {
    setLoading(true);
    const { error } = await updateServiceRate(serviceId, price);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update service rate",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Service rate updated successfully",
      });
    }
    setLoading(false);
  };
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="w-6 h-6" />
        <h2 className="sm:text-2xl text-lg font-bold">Settings & Rates</h2>
      </div>

      <Tabs defaultValue="equipment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-4">
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="w-5 h-5 mr-2" />
                Equipment Daily Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {equipmentTypes.map((equipmentType) => {
                const userRate = equipmentRates.find(
                  (r) => r.equipment_type_id === equipmentType.id
                );
                const currentRate = userRate
                  ? userRate.total_cost
                  : equipmentType.total_cost;
                return (
                  <div
                    key={equipmentType.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{equipmentType.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Current: KSh {currentRate.toLocaleString()}/day
                      </p>
                      {equipmentType.description && (
                        <p className="text-xs text-muted-foreground">
                          {equipmentType.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        placeholder={currentRate.toLocaleString()}
                        className="w-32"
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [`equipment-${equipmentType.id}`]:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <Button
                        size="sm"
                        className="text-white"
                        onClick={() =>
                          handleUpdateEquipmentRate(
                            equipmentType.id,
                            tempValues[`equipment-${equipmentType.id}`] ||
                              currentRate
                          )
                        }
                        disabled={loading}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport" className="space-y-4">
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Transport Rates by Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[profile.location].map((region) => {
                const rate = transportRates.find((r) => r.region === region);
                const costPerKm = rate ? rate.cost_per_km : 50;
                const baseCost = rate ? rate.base_cost : 500;
                return (
                  <div key={region} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{region}</h4>
                        <p className="text-sm text-muted-foreground">
                          KSh {costPerKm}/km + KSh {baseCost} base
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cost per KM (KSh)</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder={costPerKm.toLocaleString()}
                          onChange={(e) =>
                            setTempValues({
                              ...tempValues,
                              [`transport-km-${region}`]:
                                parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Base Cost (KSh)</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder={baseCost.toLocaleString()}
                          onChange={(e) =>
                            setTempValues({
                              ...tempValues,
                              [`transport-base-${region}`]:
                                parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button
                      className="mt-4 text-white"
                      size="sm"
                      onClick={() =>
                        handleUpdateTransportRate(
                          region,
                          tempValues[`transport-km-${region}`] || costPerKm,
                          tempValues[`transport-base-${region}`] || baseCost
                        )
                      }
                      disabled={loading}
                    >
                      Update Transport Rate
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Additional Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {additionalServices.map((service) => {
                const userRate = serviceRates.find(
                  (r) => r.service_id === service.id
                );
                const currentPrice = userRate ? userRate.price : service.price;
                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Current: KSh {currentPrice.toLocaleString()}
                      </p>
                      {service.description && (
                        <p className="text-xs text-muted-foreground">
                          {service.description}
                        </p>
                      )}
                      <span className="text-xs text-black bg-secondary px-2 py-1 rounded">
                        {service.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        className="w-32"
                        placeholder={currentPrice.toLocaleString()}
                        onChange={(e) =>
                          setTempValues({
                            ...tempValues,
                            [`service-${service.id}`]:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <Button
                        size="sm"
                        className="text-white"
                        onClick={() =>
                          handleUpdateServiceRate(
                            service.id,
                            tempValues[`service-${service.id}`] || currentPrice
                          )
                        }
                        disabled={loading}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default DashboardSettings;
