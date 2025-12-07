// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Check, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
export interface tiers {
  id: number;
  name: string;
  price: number;
  period: string;
  features: [];
  popular: boolean;
}
const TiersTab = ({ refreshKey }: { refreshKey: number }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tiers, setTiers] = useState<tiers[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [editedPrices, setEditedPrices] = useState<Record<number, number>>({});
  useEffect(() => {
    const fetchTiers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tiers")
        .select("*")
        .order("id");
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch tiers",
          variant: "destructive",
        });
      } else {
        setTiers(data || []);
      }
      setLoading(false);
    };
    fetchTiers();
  }, [refreshKey, user, location.key]);
  const savePrice = async (tierId: number) => {
    const newPrice = editedPrices[tierId];
    if (newPrice === undefined) return;
    const { error } = await supabase
      .from("tiers")
      .update({ price: newPrice })
      .eq("id", tierId);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Tier price updated successfully",
      });
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Subscription Tiers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 mb-3">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="grid grid-cols-3  rounded-lg items-center gap-4 py-4"
          >
            <div className="text-center font-medium">{tier.name}</div>
            <ul className="flex flex-col items-center space-y-2">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex flex-col items-center space-y-2">
              <Input
                type="number"
                min="0"
                value={editedPrices[tier.id] ?? tier.price}
                onChange={(e) =>
                  setEditedPrices({
                    ...editedPrices,
                    [tier.id]: parseInt(e.target.value) || 0,
                  })
                }
                className="w-24 text-center"
              />
              <Button
                className="text-white"
                size="sm"
                onClick={() => savePrice(tier.id)}
              >
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
export default TiersTab;
