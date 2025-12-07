// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuotes } from "@/hooks/useQuotes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ProjectProgress from "@/components/ProjectProgress";
import {
  Search,
  Eye,
  FileText,
  TrendingUp,
  Building2,
  MapPin,
  Calendar,
  Trash2,
  Pen,
  Target,
  Loader2,
} from "lucide-react";
import { QuoteExportDialog } from "@/components/QuoteExportDialog";
const ViewAllQuotes = () => {
  const { fetchQuotes, quotes, loading, deleteQuote } = useQuotes();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [selectedQuoteForExport, setSelectedQuoteForExport] =
    useState<any>(null);
  const [deletingQuote, setDeletingQuote] = useState<string | null>(null);
  const [quotesRefreshKey, setQuotesRefreshKey] = useState(0);
  const getStatusColor = (status: string) => {
    switch (status) {
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
  useEffect(() => {
    if (user && profile !== null) {
      fetchQuotes();
    }
  }, [fetchQuotes, user, profile, location.key, quotesRefreshKey]);
  const [filteredQuotes, setFilteredQuotes] = useState<any[]>([]);
  useEffect(() => {
    const result = quotes
      .filter((quote) => {
        const belongsToUser = quote.user_id === profile?.id;
        const matchesSearch =
          quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quote.client_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || quote.status === statusFilter;
        return belongsToUser && matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    setFilteredQuotes(result);
  }, [quotes, profile, searchTerm, statusFilter]);
  const handleDeleteQuote = async (quoteId: string, quoteTitle: string) => {
    setDeletingQuote(quoteId);
    try {
      const success = await deleteQuote(quoteId);
      if (success) {
        toast({
          title: "Quote Deleted",
          description: `"${quoteTitle}" has been deleted successfully.`,
        });
      } else {
        throw new Error("Failed to delete quote");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete quote",
        variant: "destructive",
      });
    } finally {
      setDeletingQuote(null);
    }
  };
  const contractorName =
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "Unknown Contractor";
  const companyName = profile?.company || "";
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return value.toString();
  };
  if (!user) {
    navigate("/auth");
  }
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin rounded-full h-8 w-8"></Loader2>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="sm:text-2xl text-xl font-bold flex items-center gap-3 bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
              <Building2 className="sm:w-7 sm:h-7 text-primary dark:text-white" />
              All Construction Quotes
            </h1>
            <p className="text-sm sm:text-lg bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-400 dark:to-purple-400  text-transparent bg-clip-text mt-2">
              Manage and track all your construction quotes with ease
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Badge variant="secondary" className="px-3 py-1 text-gray-700">
              Total: {filteredQuotes.length}
            </Badge>
          </div>
        </div>

        <Card className=" mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search quotes by title or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 h-11">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {filteredQuotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">
                  No quotes found matching your criteria.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filter settings.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredQuotes.map((quote) => {
              const formattedDate =
                new Date(quote.updated_at).toLocaleDateString("en-KE", {
                  timeZone: "Africa/Nairobi",
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }) +
                " at " +
                new Date(quote.updated_at).toLocaleTimeString("en-KE", {
                  timeZone: "Africa/Nairobi",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
              return (
                <Card key={quote.id} className=" hover:shadow-lg shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 sm:flex flex-1 items-center gap-2">
                          <div className="flex gap-2">
                            <Building2 className="w-5 h-5 text-primary dark:text-white" />
                            {quote.title}
                          </div>
                          <p className="font-normal text-sm">
                            Last Update: {formattedDate}
                          </p>
                        </CardTitle>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Client:</span>{" "}
                            {quote.client_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {quote.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(quote.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        {profile.tier !== "Free" && (
                          <Badge className={getStatusColor(quote.status)}>
                            {quote.status.charAt(0).toUpperCase() +
                              quote.status.slice(1).replace("_", " ")}
                          </Badge>
                        )}
                        <div className="text-right">
                          <div className="sm:text-2xl text-lg font-bold text-primary dark:text-white">
                            KSh{" "}
                            {formatCurrency(
                              quote.total_amount
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="dark:bg-gray-900">
                        <CardContent className="text-center p-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            Materials
                          </div>
                          <div className="text-lg font-semibold text-green-600">
                            KSh{" "}
                            {formatCurrency(
                              quote.materials_cost
                            ).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="dark:bg-gray-900">
                        <CardContent className="text-center p-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            Labor
                          </div>
                          <div className="text-lg font-semibold text-blue-600">
                            KSh{" "}
                            {formatCurrency(quote.labor_cost).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="dark:bg-gray-900">
                        <CardContent className="text-center p-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            Add-ons
                          </div>
                          <div className="text-lg font-semibold text-purple-600">
                            KSh{" "}
                            {formatCurrency(
                              quote.additional_services_cost
                            ).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {quote.custom_specs && (
                      <Card className="dark:bg-gray-900 mb-6">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">
                            Custom Specifications
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {quote.custom_specs}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none"
                            onClick={() => setSelectedQuote(quote)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Building2 className="w-5 h-5" />
                              Quote Details - {quote.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-white">
                                <strong>Client:</strong> {quote.client_name}
                              </div>
                              <div className="text-white">
                                <strong>Email:</strong>{" "}
                                {quote.client_email || "Not provided"}
                              </div>
                              <div className="text-white">
                                <strong>Location:</strong> {quote.location}
                              </div>
                              <div className="text-white">
                                <strong>Region:</strong> {quote.region}
                              </div>
                              <div className="text-white">
                                <strong>Project Type:</strong>{" "}
                                {quote.project_type}
                              </div>
                              {profile.tier !== "Free" && (
                                <div>
                                  <strong className="text-white">
                                    Status:
                                  </strong>
                                  <Badge
                                    className={`ml-2 ${getStatusColor(
                                      quote.status
                                    )}`}
                                  >
                                    {quote.status.charAt(0).toUpperCase() +
                                      quote.status.slice(1).replace("_", " ")}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {quote.masonry_materials &&
                              quote.masonry_materials.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3 text-white">
                                    Materials
                                  </h4>
                                  <div className="space-y-2">
                                    {quote.masonry_materials.map(
                                      (material: any, index: number) => (
                                        <div
                                          key={index}
                                          className="flex justify-between items-center p-3 rounded"
                                        >
                                          <div>
                                            <span className="font-medium text-white">
                                              {material.name}
                                            </span>
                                            <span className="text-white ml-2 text-white/70">
                                              ({material.quantity}{" "}
                                              {material.unit})
                                            </span>
                                          </div>
                                          <span className="font-semibold text-white">
                                            KSh{" "}
                                            {formatCurrency(
                                              material.total_price || 0
                                            ).toLocaleString()}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {quote.equipment && quote.equipment.length > 0 && (
                              <div className="flex justify-between">
                                <p className="text-white">
                                  <strong>Equipment costs</strong>
                                </p>
                                <p className="text-white">
                                  <strong>
                                    KSh{" "}
                                    {formatCurrency(quote.equipment_costs) || 0}
                                  </strong>
                                </p>
                              </div>
                            )}
                            {quote.transport_costs > 0 && (
                              <div className="flex justify-between">
                                <p className="text-white">
                                  <strong>Transport costs</strong>
                                </p>
                                <p className="text-white">
                                  <strong>
                                    KSh {formatCurrency(quote.transport_costs)}
                                  </strong>
                                </p>
                              </div>
                            )}
                            {quote.additional_services_cost > 0 && (
                              <div className="flex justify-between">
                                <p className="text-white">
                                  <strong>Additonal services</strong>
                                </p>
                                <p className="text-white">
                                  <strong>
                                    KSh{" "}
                                    {formatCurrency(
                                      quote.additional_services_cost
                                    )}
                                  </strong>
                                </p>
                              </div>
                            )}
                            {quote.addons_cost > 0 && (
                              <div className="flex justify-between">
                                <p className="text-white">
                                  <strong>Subcontractor costs</strong>
                                </p>
                                <p className="text-white">
                                  <strong>
                                    KSh {formatCurrency(quote.addons_cost) || 0}
                                  </strong>
                                </p>
                              </div>
                            )}
                            {quote.materials_cost > 0 && (
                              <div className="flex justify-between">
                                <p className="text-white">
                                  <strong>Materials</strong>
                                </p>
                                <p className="text-white">
                                  <strong>
                                    KSh{" "}
                                    {formatCurrency(quote.materials_cost) || 0}
                                  </strong>
                                </p>
                              </div>
                            )}
                            {quote.permit_cost > 0 && (
                              <div className="flex justify-between">
                                <p className="text-white">
                                  <strong>Permit costs</strong>
                                </p>
                                <p className="text-white">
                                  <strong>
                                    KSh {formatCurrency(quote.permit_cost) || 0}
                                  </strong>
                                </p>
                              </div>
                            )}
                            {quote.overhead_amount > 0 && (
                              <div className="flex justify-between">
                                <p className="text-white">
                                  <strong>Overhead amount</strong>
                                </p>
                                <p className="text-white">
                                  <strong>
                                    KSh{" "}
                                    {formatCurrency(quote.overhead_amount) || 0}
                                  </strong>
                                </p>
                              </div>
                            )}
                            {quote.contingency_amount > 0 && (
                              <div className="flex justify-between">
                                <p className="text-white">
                                  <strong>Contingency</strong>
                                </p>
                                <p className="text-white">
                                  <strong>
                                    KSh{" "}
                                    {formatCurrency(quote.contingency_amount) ||
                                      0}
                                  </strong>
                                </p>
                              </div>
                            )}
                            {quote.labor_cost > 0 && (
                              <div className="flex justify-between">
                                <p className="text-white">
                                  <strong>Labour</strong>
                                </p>
                                <p className="text-white">
                                  <strong>
                                    KSh {formatCurrency(quote.labor_cost) || 0}
                                  </strong>
                                </p>
                              </div>
                            )}
                            {quote.profit_amount > 0 && (
                              <div className="flex justify-between">
                                <p className="text-white">
                                  <strong>Profit</strong>
                                </p>
                                <p className="text-white">
                                  <strong>
                                    KSh{" "}
                                    {formatCurrency(quote.profit_amount) || 0}
                                  </strong>
                                </p>
                              </div>
                            )}
                            {quote.total_amount > 0 && (
                              <div className="flex justify-between">
                                <p className="text-white">
                                  <strong>Total</strong>
                                </p>
                                <p className="text-white">
                                  <strong>
                                    KSh{" "}
                                    {formatCurrency(quote.total_amount) || 0}
                                  </strong>
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {profile.tier !== "Free" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className=" flex-1 sm:flex-none"
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Progress
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogTitle></DialogTitle>
                            <ProjectProgress
                              quoteId={quote.id}
                              quoteName={quote.title}
                              onQuoteUpdated={() =>
                                setQuotesRefreshKey((k) => k + 1)
                              }
                            />
                          </DialogContent>
                        </Dialog>
                      )}

                      <Dialog>
                        <DialogTitle></DialogTitle>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedQuoteForExport(quote)}
                            className="text-white flex-1 sm:flex-none bg-gradient-to-r from-primary to-blue-700 hover:from-primary/40 hover:to-primary/90"
                          >
                            <FileText className="w-4 h-4 mr-2 text-white" />
                            Generate BOQ
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          {selectedQuoteForExport && (
                            <QuoteExportDialog
                              open={!!selectedQuoteForExport}
                              onOpenChange={(open) => {
                                if (!open) setSelectedQuoteForExport(null);
                              }}
                              quote={selectedQuoteForExport}
                              contractorName={contractorName}
                              companyName={companyName}
                              logoUrl={profile.avatar_url}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      {profile.tier !== "Free" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate("/quotes/new", { state: { quote } })
                          }
                          className="text-white flex-1 sm:flex-none bg-gradient-to-r from-green-800 to-green-600 hover:from-green-900 hover:to-green-700"
                        >
                          <Pen className="w-4 h-4 mr-2 text-white" />
                          Edit Quote
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingQuote === quote.id}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deletingQuote === quote.id
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{quote.title}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteQuote(quote.id, quote.title)
                              }
                              className="bg-red-600 hover:bg-red-200 hover:text-red-800 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default ViewAllQuotes;
