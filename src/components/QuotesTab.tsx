// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  TrendingUp,
  Calendar,
  Pencil,
  Play,
  Clock,
  CheckCircle,
  Pause,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { Badge } from "./ui/badge";

const QuotesTab = ({ refreshKey }: { refreshKey: number }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);

      // First, let's try a simpler approach without specifying the foreign key name
      const { data: quotesData, error: quotesError } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (quotesError) {
        console.error("Error fetching quotes:", quotesError);
        toast({
          title: "Error",
          description: "Failed to fetch quotes",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // If we have quotes, fetch the associated profiles
      if (quotesData && quotesData.length > 0) {
        const userIds = quotesData
          .map((quote) => quote.user_id)
          .filter(Boolean);

        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name, email")
            .in("id", userIds);

          if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
          }

          // Combine quotes with their profiles
          const quotesWithProfiles = quotesData.map((quote) => {
            const profile =
              profilesData?.find((p) => p.id === quote.user_id) || null;
            return {
              ...quote,
              profile: profile,
            };
          });

          setQuotes(quotesWithProfiles);
        } else {
          setQuotes(quotesData.map((quote) => ({ ...quote, profile: null })));
        }
      } else {
        setQuotes([]);
      }

      setLoading(false);
    };

    fetchQuotes();
  }, [refreshKey, user, location.key, toast]);

  const filteredQuotes = quotes.filter((q) => {
    const profileName = q.profile?.name || "";
    const matchesSearch = profileName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "draft":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "planning":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "started":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "in_progress":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "on_hold":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Pencil className="w-4 h-4" />;
      case "planning":
        return <Calendar className="w-4 h-4" />;
      case "started":
        return <Play className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "on_hold":
        return <Pause className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return value.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "hover:bg-gray-400 bg-gray-800";
      case "planning":
        return "hover:bg-purple-400 bg-purple-800";
      case "started":
        return "hover:bg-blue-400 bg-blue-800";
      case "in_progress":
        return "hover:bg-amber-400 bg-amber-800";
      case "completed":
        return "hover:bg-green-400 bg-green-800";
      case "on_hold":
        return "hover:bg-red-400 bg-red-800";
      default:
        return "hover:bg-gray-400 bg-gray-800";
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
        <CardTitle>All Quotes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contractor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="started">Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredQuotes.length === 0 && (
          <p className="text-center text-muted-foreground">No quotes found</p>
        )}

        <div className="grid w-full grid-cols-1 md:grid-cols-2">
          {filteredQuotes.map((quote) => (
            <Card
              key={quote.id}
              className="border rounded-lg p-4 m-2 space-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">Quote #{quote.id}</p>
                  <p className="font-medium">{quote.title}</p>
                  <p>Contractor: {quote.profile?.name || "Unknown"}</p>
                  <p>Email: {quote.profile?.email || "N/A"}</p>

                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />{" "}
                    {new Date(quote.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Status:
                    <Badge className={getTierBadge(quote.status)}>
                      {quote.status.charAt(0).toUpperCase() +
                        quote.status.slice(1).replace("_", " ")}
                    </Badge>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    KSh {formatCurrency(quote.total_amount).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Progress: {quote.progress_percentage || 0}%
                </p>
                <Progress
                  indicatorColor={`${getStatusColor(quote.status)} `}
                  value={quote.progress_percentage}
                  className="w-full h-3 bg-blue-50 dark:bg-white/80"
                />
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotesTab;
