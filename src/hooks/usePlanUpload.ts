// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
export interface PlanAnalysis {
  floors: number;
  rooms: Array<{
    name: string;
    length: number;
    width: number;
    height?: number;
    doors?: number;
    windows?: number;
  }>;
}
export const usePlanUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();
  const uploadPlan = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const uniqueName = `${uuidv4()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("plans")
        .upload(uniqueName, file, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from("plans")
        .getPublicUrl(uniqueName);
      const publicUrl = publicUrlData.publicUrl;
      toast({
        title: "Plan Uploaded",
        description: "Plan file uploaded successfully",
      });
      return publicUrl;
    } catch (error) {
      console.error("Error uploading plan:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload plan file",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };
  const analyzePlan = async (url: string): Promise<PlanAnalysis | null> => {
    setAnalyzing(true);
    try {
      const response = await fetch(
        "http://192.168.0.100:8000/api/plan/upload",
        {
          method: "POST",
          body: JSON.stringify({ file_url: url }),
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to analyze plan");
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error analyzing plan:", error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze plan. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setAnalyzing(false);
    }
  };
  const deletePlan = async (publicUrl: string): Promise<boolean> => {
    try {
      const url = new URL(publicUrl);
      const pathname = decodeURIComponent(url.pathname);
      const filePath = pathname.split("/plans/")[1];
      if (!filePath) {
        throw new Error("Invalid URL: Could not extract file path");
      }
      const { error } = await supabase.storage.from("plans").remove([filePath]);
      if (error) throw error;
      toast({
        title: "Plan Deleted",
        description: "The plan has been removed from storage.",
      });
      return true;
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Delete Failed",
        description: "Could not delete the plan file.",
        variant: "destructive",
      });
      return false;
    }
  };
  return {
    uploadPlan,
    analyzePlan,
    deletePlan,
    uploading,
    analyzing,
  };
};
