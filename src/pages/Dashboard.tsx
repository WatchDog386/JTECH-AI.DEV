// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  FileText,
  Eye,
  BarChart,
  Settings,
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Star,
  Clock,
  CheckCircle,
  Workflow,
  PersonStanding,
  PersonStandingIcon,
  LayoutDashboard,
  Zap,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuotes } from "@/hooks/useQuotes";
import { useClientReviews } from "@/hooks/useClientReviews";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import Calculator from "@/components/Calculator";
import Reports from "@/components/Reports";
import Calendar from "@/components/Calendar";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// RISA Color Palette (Matching index.tsx)
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748";
const RISA_LIGHT_GRAY = "#F5F7FA";
const RISA_MEDIUM_GRAY = "#E2E8F0";

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const { quotes, loading: quotesLoading } = useQuotes();
  const { reviews, averageRating, totalReviews } = useClientReviews();
  const { events } = useCalendarEvents();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCalculator, setShowCalculator] = useState(false);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalQuotesValue: 0,
    completedProjects: 0,
    activeProjects: 0,
    pendingQuotes: 0,
    upcomingEvents: [],
    recentQuotes: [],
    allQuotes: [],
  });
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    const fetchAndSet = async () => {
      if (!hasLoadedOnce.current) {
        // Optional: UI loading state already handled by quotesLoading
      }
      await fetchDashboardData();
      if (!hasLoadedOnce.current) {
        hasLoadedOnce.current = true;
      }
    };
    fetchAndSet();
  }, [user, location.key]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return value.toString();
  };

  const fetchDashboardData = async () => {
    try {
      const { data: quotes, error: quotesError } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", profile.id);
      if (quotesError) throw quotesError;

      const { data: events, error: eventsError } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", profile.id);
      if (eventsError) throw eventsError;

      const totalQuotesValue = quotes.reduce(
        (sum, quote) => sum + quote.total_amount,
        0
      );
      const completedProjects = quotes.filter(
        (quote) => quote.status === "completed"
      ).length;
      const activeProjects = quotes.filter((quote) =>
        ["started", "in_progress"].includes(quote.status)
      ).length;
      const pendingQuotes = quotes.filter(
        (quote) => quote.status === "draft"
      ).length;
      const upcomingEvents = events
        .filter((event) => new Date(event.event_date) >= new Date())
        .sort(
          (a, b) =>
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        )
        .slice(0, 3);
      const recentQuotes = quotes
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
        .slice(0, 5);
      const allQuotes = quotes.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setDashboardData({
        totalQuotesValue,
        completedProjects,
        activeProjects,
        pendingQuotes,
        upcomingEvents,
        recentQuotes,
        allQuotes,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 hover:bg-gray-300",
      planning: "bg-purple-100 text-purple-800 hover:bg-purple-300",
      started: "bg-blue-100 text-blue-800 hover:bg-blue-300",
      in_progress: "bg-amber-100 text-amber-800 hover:bg-amber-300",
      completed: "bg-green-100 text-green-800 hover:bg-green-300",
      on_hold: "bg-red-100 text-red-800 hover:bg-red-300",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 hover:bg-gray-100 text-gray-800"
    );
  };

  if (!user) {
    navigate("/auth");
  }

  if (quotesLoading) {
    return (
      <div className="min-h-screen grid flex grid-sets-2 items-center justify-center">
        <Loader2 className="animate-spin rounded-full h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen inset-0 scrollbar-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-4 animate-fade-in">
          <div className="sm:flex flex-1 justify-between items-center">
            <div>
              <div className="sm:text-2xl items-center text-xl flex font-bold bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
                <LayoutDashboard className="sm:w-7 sm:h-7 mr-2 text-primary dark:text-white" />
                Welcome back, {profile?.name}!
              </div>
              <p className="text-sm sm:text-lg bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-400 dark:to-purple-400 text-transparent bg-clip-text mt-2">
                Here's what's happening with your construction business today.
              </p>
            </div>
            <Button
              onClick={() => setShowCalculator(true)}
              className="text-sm px-5 py-4 rounded-xl sm:mt-0 mt-4 shadow-lg bg-primary animate-bounce-gentle hover:shadow-2xl transition-transform duration-300 text-white"
            >
              ⚡ Quick Calculator
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 ${
            profile.tier === "Free" ? "lg:grid-cols-3" : "lg:grid-cols-3"
          } gap-6`}
        >
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotes Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl text-lg font-bold">
                KSh {formatCurrency(dashboardData.totalQuotesValue).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.allQuotes.length} quotes generated
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl text-lg font-bold">
                {dashboardData.activeProjects}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.pendingQuotes} pending approval
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl text-lg font-bold">
                {dashboardData.completedProjects}
              </div>
              <p className="text-xs text-muted-foreground">Projects finished</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in mt-5">
          <TabsList
            className={`grid w-full ${
              profile.tier === "Professional" ? "grid-cols-3" : "grid-cols-2"
            } ${profile.tier === "Free" ? "grid-cols-1" : "grid-cols-3"} mb-6`}
          >
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            {profile.tier === "Professional" && (
              <TabsTrigger value="reports" className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
            )}
            {profile.tier !== "Free" && (
              <TabsTrigger value="calendar" className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Quotes */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Recent Quotes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentQuotes.length > 0 ? (
                      dashboardData.recentQuotes.map((quote) => (
                        <div
                          key={quote.id}
                          className="flex items-center justify-between p-4 glass border border-gray-300 dark:border-gray-600/40 rounded-lg hover:shadow-lg transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{quote.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {quote.client_name} • {quote.location}
                            </p>
                            <p className="text-sm font-medium mt-1">
                              KSh {formatCurrency(quote.total_amount).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex">
                            {profile.tier !== "Free" && (
                              <Badge className={getStatusColor(quote.status)}>
                                {quote.status.charAt(0).toUpperCase() +
                                  quote.status.slice(1).replace("_", " ")}
                              </Badge>
                            )}
                            <Button
                              className="ml-3 bg-primary hover:bg-primary/90 hover:text-white text-white hover:dark:bg-primary/60 dark:bg-primary/20"
                              onClick={() => navigate("/quotes/all")}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium text-lg mb-2">No quotes yet</h3>
                        <p className="text-muted-foreground">Create your first quote to get started!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar: Events + Quick Actions */}
              <div>
                {profile.tier !== "Free" && (
                  <div className="space-y-6 mb-5">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Clock className="w-5 h-5 mr-2" />
                          Upcoming Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dashboardData.upcomingEvents.length > 0 ? (
                          <div className="space-y-3">
                            {dashboardData.upcomingEvents.map((event) => (
                              <div
                                key={event.id}
                                className="p-3 border-t dark:border-white/20 rounded"
                              >
                                <div className="font-medium text-sm">{event.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(event.event_date), "MMM d, yyyy")}
                                  {event.event_time && ` at ${event.event_time}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No upcoming events</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                      <Zap className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/quotes/new")}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 bg-white dark:bg-gray-700/30 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">New Quote</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCalculator(true)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 bg-white dark:bg-gray-700/30 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">Cost Calculator</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </motion.button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {profile.tier !== "Free" && (
            <TabsContent value="reports">
              <Reports />
            </TabsContent>
          )}
          {profile.tier !== "Free" && (
            <TabsContent value="calendar">
              <Calendar />
            </TabsContent>
          )}
        </Tabs>

        <Calculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      </div>
    </div>
  );
};

export default Dashboard;