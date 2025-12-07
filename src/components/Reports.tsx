// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  DollarSign,
  FileText,
  CheckCircle,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useQuotes } from "@/hooks/useQuotes";
import { useClientReviews } from "@/hooks/useClientReviews";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
const Reports = () => {
  const { user } = useAuth();
  const { quotes, fetchQuotes, loading: quotesLoading } = useQuotes();
  const location = useLocation();
  const {
    reviews,
    averageRating,
    loading: reviewsLoading,
  } = useClientReviews();
  const [refreshing, setRefreshing] = useState(false);
  const userQuotes = useMemo(() => {
    if (!user) return [];
    return quotes.filter((quote) => quote.user_id === user.id);
  }, [quotes, user, location.key]);
  const formatCurrency = (value: number) => {
    if (value >= 1000000)
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (value >= 1000)
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    return value.toString();
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchQuotes()]);
    setRefreshing(false);
  };
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    });
    const monthlyStats: {
      [key: string]: {
        quotes: number;
        revenue: number;
      };
    } = {};
    months.forEach((m) => {
      monthlyStats[m] = { quotes: 0, revenue: 0 };
    });
    userQuotes.forEach((quote) => {
      const date = new Date(quote.created_at);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].quotes += 1;
        if (quote.status !== "draft") {
          monthlyStats[monthKey].revenue += quote.profit_amount;
        }
      }
    });
    return months.map((m) => ({
      name: m,
      quotes: monthlyStats[m].quotes,
      revenue: monthlyStats[m].revenue,
    }));
  }, [userQuotes]);
  const statusData = useMemo(() => {
    const statusCounts = userQuotes.reduce(
      (acc, quote) => {
        acc[quote.status] = (acc[quote.status] || 0) + 1;
        return acc;
      },
      {} as {
        [key: string]: number;
      }
    );
    const colors = {
      planning: "#490bf5ff",
      completed: "#059669",
      in_progress: "#b35f2fff",
      started: "#3b82f6",
      on_hold: "#fd0000ff",
      draft: "#6b7280",
    };
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
      value: count,
      color: colors[status as keyof typeof colors] || "#6b7280",
    }));
  }, [userQuotes, location.key]);
  const activeProjects = userQuotes.filter((q) =>
    ["started", "in_progress"].includes(q.status)
  );
  const completedProjects = userQuotes.filter((q) => q.status === "completed");
  const totalRevenue = userQuotes
    .filter((q) => q.status !== "draft")
    .reduce((sum, q) => sum + q.profit_amount, 0);
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="sm:text-2xl text-lg font-bold">Reports Dashboard</h1>
        <Button
          className="text-white"
          onClick={handleRefresh}
          disabled={refreshing || quotesLoading || reviewsLoading}
        >
          {refreshing || quotesLoading || reviewsLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />{" "}
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2 text-white" /> Refresh
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className=" card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="sm:w-7 sm:h-7 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Quotes
                </p>
                <p className="sm:text-2xl text-lg font-bold">
                  {userQuotes.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className=" card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="sm:w-8 sm:h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Projects
                </p>
                <p className="sm:text-2xl text-lg font-bold">
                  {activeProjects.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className=" card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="sm:w-8 sm:h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="sm:text-2xl text-lg font-bold">
                  KSh {formatCurrency(totalRevenue).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className=" card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="sm:w-8 sm:h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="sm:text-2xl text-lg font-bold">
                  {completedProjects.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {userQuotes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    labelClassName="text-black rounded-lg"
                    formatter={(value) => [
                      `KSh ${formatCurrency(Number(value))}`,
                      "Revenue",
                    ]}
                  />
                  <Bar
                    className="rounded-lg"
                    dataKey="revenue"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader>
              <CardTitle>Project Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {monthlyData.length > 0 && (
            <Card className=" lg:col-span-2">
              <CardHeader>
                <CardTitle>Quote Generation Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      labelClassName="text-black rounded-lg"
                      formatter={(value) => [`${value}`, "Quotes"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="quotes"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
export default Reports;
