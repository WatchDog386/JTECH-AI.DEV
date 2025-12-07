// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

export type Json =
  | string
  | number
  | boolean
  | null
  | {
      [key: string]: Json | undefined;
    }
  | Json[];
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      pricing_data: {
        Row: {
          id: string;
          room_type_id: string;
          material_id: string;
          quantity_per_unit: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_type_id: string;
          material_id: string;
          quantity_per_unit: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_type_id?: string;
          material_id?: string;
          quantity_per_unit?: number;
          created_at?: string;
        };
      };
      room_types: {
        Row: {
          id: string;
          name: string;
          unit: "volume" | "area";
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          unit: "volume" | "area";
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          unit?: "volume" | "area";
          description?: string;
          created_at?: string;
        };
      };
      additional_services: {
        Row: {
          category: string | null;
          created_at: string;
          price: number;
          description: string | null;
          id: string;
          name: string;
          unit: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          price: number;
          description?: string | null;
          id?: string;
          name: string;
          unit?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          price?: number;
          description?: string | null;
          id?: string;
          name?: string;
          unit?: string;
        };
        Relationships: [];
      };
      addons: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          price?: number;
        };
        Relationships: [];
      };
      calendar_events: {
        Row: {
          created_at: string | null;
          description: string | null;
          event_date: string;
          event_time: string | null;
          id: string;
          title: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          event_date: string;
          event_time?: string | null;
          id?: string;
          title: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          event_date?: string;
          event_time?: string | null;
          id?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      client_reviews: {
        Row: {
          client_email: string;
          client_name: string;
          created_at: string | null;
          id: string;
          project_completion_date: string | null;
          quote_id: string | null;
          rating: number | null;
          review_text: string | null;
        };
        Insert: {
          client_email: string;
          client_name: string;
          created_at?: string | null;
          id?: string;
          project_completion_date?: string | null;
          quote_id?: string | null;
          rating?: number | null;
          review_text?: string | null;
        };
        Update: {
          client_email?: string;
          client_name?: string;
          created_at?: string | null;
          id?: string;
          project_completion_date?: string | null;
          quote_id?: string | null;
          rating?: number | null;
          review_text?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_reviews_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          }
        ];
      };
      equipment_types: {
        Row: {
          created_at: string;
          daily_rate: number;
          description: string | null;
          id: string;
          name: string;
          unit: string;
        };
        Insert: {
          created_at?: string;
          daily_rate: number;
          description?: string | null;
          id?: string;
          name: string;
          unit?: string;
        };
        Update: {
          created_at?: string;
          daily_rate?: number;
          description?: string | null;
          id?: string;
          name?: string;
          unit?: string;
        };
        Relationships: [];
      };
      labor_types: {
        Row: {
          created_at: string;
          daily_rate: number;
          id: string;
          name: string;
          unit: string;
        };
        Insert: {
          created_at?: string;
          daily_rate: number;
          id?: string;
          name: string;
          unit?: string;
        };
        Update: {
          created_at?: string;
          daily_rate?: number;
          id?: string;
          name?: string;
          unit?: string;
        };
        Relationships: [];
      };
      material_base_prices: {
        Row: {
          base_price: number;
          category: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          unit: string;
          updated_at: string | null;
        };
        Insert: {
          base_price: number;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          unit?: string;
          updated_at?: string | null;
        };
        Update: {
          base_price?: number;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          unit?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      materials: {
        Row: {
          base_price: number;
          created_at: string;
          id: string;
          name: string;
          unit: string;
        };
        Insert: {
          base_price: number;
          created_at?: string;
          id?: string;
          name: string;
          unit: string;
        };
        Update: {
          base_price?: number;
          created_at?: string;
          id?: string;
          name?: string;
          unit?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          company: string | null;
          completed_projects: number;
          created_at: string;
          email: string;
          id: string;
          is_admin: boolean;
          location: string | null;
          subscription_status: string;
          name: string;
          overall_profit_margin: number | null;
          phone: string | null;
          quotes_used: number;
          tier: string;
          total_projects: number;
          total_revenue: number;
          updated_at: string;
        };
        Insert: {
          company?: string | null;
          completed_projects?: number;
          created_at?: string;
          email: string;
          id: string;
          subscription_status?: string;
          is_admin?: boolean;
          location?: string | null;
          name: string;
          overall_profit_margin?: number | null;
          phone?: string | null;
          quotes_used?: number;
          tier?: string;
          total_projects?: number;
          total_revenue?: number;
          updated_at?: string;
        };
        Update: {
          company?: string | null;
          completed_projects?: number;
          created_at?: string;
          email?: string;
          id?: string;
          subscription_status?: string;
          is_admin?: boolean;
          location?: string | null;
          name?: string;
          overall_profit_margin?: number | null;
          phone?: string | null;
          quotes_used?: number;
          tier?: string;
          total_projects?: number;
          total_revenue?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          additional_services_cost: number | null;
          addons: Json | null;
          addons_cost: number;
          bathrooms: number | null;
          bedrooms: number | null;
          client_email: string | null;
          client_name: string;
          contract_type: string | null;
          created_at: string;
          custom_specs: string | null;
          distance_km: number | null;
          equipment_costs: number | null;
          floors: number | null;
          house_height: number | null;
          house_length: number | null;
          house_type: string | null;
          house_width: number | null;
          id: string;
          labor: Json | null;
          labor_cost: number;
          location: string;
          materials: Json | null;
          materials_cost: number;
          milestone_date: string | null;
          overall_profit_amount: number | null;
          plan_file_url: string | null;
          progress_notes: string | null;
          progress_percentage: number | null;
          project_type: string;
          region: string;
          equipment: Json | null;
          selected_services: Json | null;
          status: string;
          title: string;
          total_amount: number;
          total_volume: number | null;
          transport_costs: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          additional_services_cost?: number | null;
          addons?: Json | null;
          addons_cost?: number;
          bathrooms?: number | null;
          bedrooms?: number | null;
          client_email?: string | null;
          client_name: string;
          contract_type?: string | null;
          created_at?: string;
          custom_specs?: string | null;
          distance_km?: number | null;
          equipment_costs?: number | null;
          floors?: number | null;
          house_height?: number | null;
          house_length?: number | null;
          house_type?: string | null;
          house_width?: number | null;
          id?: string;
          labor?: Json | null;
          labor_cost?: number;
          location: string;
          materials?: Json | null;
          materials_cost?: number;
          milestone_date?: string | null;
          overall_profit_amount?: number | null;
          plan_file_url?: string | null;
          progress_notes?: string | null;
          progress_percentage?: number | null;
          project_type: string;
          region: string;
          selected_equipment?: Json | null;
          selected_services?: Json | null;
          status?: string;
          title: string;
          total_amount?: number;
          total_volume?: number | null;
          transport_costs?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          additional_services_cost?: number | null;
          addons?: Json | null;
          addons_cost?: number;
          bathrooms?: number | null;
          bedrooms?: number | null;
          client_email?: string | null;
          client_name?: string;
          contract_type?: string | null;
          created_at?: string;
          custom_specs?: string | null;
          distance_km?: number | null;
          equipment_costs?: number | null;
          floors?: number | null;
          house_height?: number | null;
          house_length?: number | null;
          house_type?: string | null;
          house_width?: number | null;
          id?: string;
          labor?: Json | null;
          labor_cost?: number;
          location?: string;
          materials?: Json | null;
          materials_cost?: number;
          milestone_date?: string | null;
          overall_profit_amount?: number | null;
          plan_file_url?: string | null;
          progress_notes?: string | null;
          progress_percentage?: number | null;
          project_type?: string;
          region?: string;
          selected_equipment?: Json | null;
          selected_services?: Json | null;
          status?: string;
          title?: string;
          total_amount?: number;
          total_volume?: number | null;
          transport_costs?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      regional_multipliers: {
        Row: {
          created_at: string | null;
          id: string;
          multiplier: number;
          region: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          multiplier?: number;
          region: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          multiplier?: number;
          region?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      room_material_requirements: {
        Row: {
          created_at: string | null;
          id: string;
          material_id: string | null;
          quantity_per_unit: number;
          room_type_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          material_id?: string | null;
          quantity_per_unit: number;
          room_type_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          material_id?: string | null;
          quantity_per_unit?: number;
          room_type_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "room_material_requirements_material_id_fkey";
            columns: ["material_id"];
            isOneToOne: false;
            referencedRelation: "material_base_prices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "room_material_requirements_room_type_id_fkey";
            columns: ["room_type_id"];
            isOneToOne: false;
            referencedRelation: "room_types";
            referencedColumns: ["id"];
          }
        ];
      };
      user_equipment_overrides: {
        Row: {
          created_at: string | null;
          custom_rate: number;
          equipment_id: string | null;
          id: string;
          region: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          custom_rate: number;
          equipment_id?: string | null;
          id?: string;
          region: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          custom_rate?: number;
          equipment_id?: string | null;
          id?: string;
          region?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_equipment_overrides_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "equipment_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_equipment_overrides_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_equipment_rates: {
        Row: {
          created_at: string;
          daily_rate: number;
          equipment_type_id: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          daily_rate: number;
          equipment_type_id: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          daily_rate?: number;
          equipment_type_id?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_equipment_rates_equipment_type_id_fkey";
            columns: ["equipment_type_id"];
            isOneToOne: false;
            referencedRelation: "equipment_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_equipment_rates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_labor_overrides: {
        Row: {
          created_at: string | null;
          custom_rate: number;
          id: string;
          labor_type_id: string | null;
          region: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          custom_rate: number;
          id?: string;
          labor_type_id?: string | null;
          region: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          custom_rate?: number;
          id?: string;
          labor_type_id?: string | null;
          region?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_labor_overrides_labor_type_id_fkey";
            columns: ["labor_type_id"];
            isOneToOne: false;
            referencedRelation: "labor_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_labor_overrides_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_material_prices: {
        Row: {
          created_at: string | null;
          custom_price: number;
          id: string;
          material_id: string | null;
          region: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          custom_price: number;
          id?: string;
          material_id?: string | null;
          region: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          custom_price?: number;
          id?: string;
          material_id?: string | null;
          region?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_material_prices_material_id_fkey";
            columns: ["material_id"];
            isOneToOne: false;
            referencedRelation: "material_base_prices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_material_prices_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_service_overrides: {
        Row: {
          created_at: string | null;
          custom_price: number;
          id: string;
          region: string;
          service_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          custom_price: number;
          id?: string;
          region: string;
          service_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          custom_price?: number;
          id?: string;
          region?: string;
          service_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_service_overrides_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "additional_services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_service_overrides_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_service_rates: {
        Row: {
          created_at: string;
          id: string;
          price: number;
          service_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          price: number;
          service_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          price?: number;
          service_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_service_rates_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "additional_services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_service_rates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_transport_rates: {
        Row: {
          base_cost: number;
          cost_per_km: number;
          created_at: string;
          id: string;
          region: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          base_cost?: number;
          cost_per_km: number;
          created_at?: string;
          id?: string;
          region: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          base_cost?: number;
          cost_per_km?: number;
          created_at?: string;
          id?: string;
          region?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_transport_rates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_contractor_price_table_if_not_exists: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      jwt_claims: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      send_review_email: {
        Args: {
          p_quote_id: string;
          p_client_email: string;
          p_client_name: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];
export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | {
        schema: keyof DatabaseWithoutInternals;
      },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;
export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | {
        schema: keyof DatabaseWithoutInternals;
      },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;
export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | {
        schema: keyof DatabaseWithoutInternals;
      },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;
export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | {
        schema: keyof DatabaseWithoutInternals;
      },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;
export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | {
        schema: keyof DatabaseWithoutInternals;
      },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
export const Constants = {
  public: {
    Enums: {},
  },
} as const;
