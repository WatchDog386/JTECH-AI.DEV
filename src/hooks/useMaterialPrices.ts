// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
export interface SimpleMaterial {
  id?: string;
  type: "simple";
  name: string;
  unit: string;
  price: number;
  category: string;
  description?: string;
}
export interface StructuredMaterial {
  id?: string;
  type: "structured";
  name: string;
  unit: string;
  price: number;
  category: string;
  description?: string;
  variants: {
    type: string;
    sizes: string[];
    frame_options: string[];
    price_kes: Record<string, number>;
  }[];
  rebarVariants?: {
    size: string;
    diameter_mm: number;
    unit_weight_kg_per_m: number;
    price_kes_per_kg: number;
  }[];
}
export type MaterialBasePrice = SimpleMaterial | StructuredMaterial;
export interface RegionalMultiplier {
  id: string;
  region: string;
  multiplier: number;
  created_at: string;
  updated_at: string;
}
export const useMaterialPrices = () => {
  const [materials, setMaterials] = useState<MaterialBasePrice[]>([]);
  const [multipliers, setMultipliers] = useState<RegionalMultiplier[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user, profile } = useAuth();

  const fetchData = async () => {
    try {
      const [materialsResponse, multipliersResponse] = await Promise.all([
        supabase.from("material_base_prices").select("*").order("name"),
        supabase.from("regional_multipliers").select("*").order("region"),
      ]);
      if (materialsResponse.error) throw materialsResponse.error;
      if (multipliersResponse.error) throw multipliersResponse.error;
      setMaterials(materialsResponse.data || []);
      setMultipliers(multipliersResponse.data || []);
    } catch (error) {
      console.error("Error fetching material prices:", error);
    } finally {
      setLoading(false);
    }
  };
  const updateMaterialPrice = async (
    id: string,
    updates: Partial<MaterialBasePrice>
  ) => {
    try {
      const { error } = await supabase
        .from("material_base_prices")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error("Error updating material price:", error);
      toast({
        variant: "destructive",
        title: "Error updating price",
      });
      throw error;
    }
  };
  const updateRegionalMultiplier = async (id: string, multiplier: number) => {
    try {
      const { error } = await supabase
        .from("regional_multipliers")
        .update({ multiplier })
        .eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error("Error updating regional multiplier:", error);
      toast({
        variant: "destructive",
        title: "Error updating multiplier",
      });
      throw error;
    }
  };
  const createMaterial = async (
    material: Omit<MaterialBasePrice, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { error } = await supabase
        .from("material_base_prices")
        .insert([material]);
      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error("Error creating material:", error);
      toast({
        variant: "destructive",
        title: "Error creating material",
      });
      throw error;
    }
  };
  useEffect(() => {
    fetchData();
  }, [user, profile, location.key]);
  return {
    materials,
    multipliers,
    loading,
    updateMaterialPrice,
    updateRegionalMultiplier,
    createMaterial,
    refetch: fetchData,
  };
};
