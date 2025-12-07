// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Settings,
  TrendingUp,
  Calendar,
  DraftingCompass,
  ArrowLeft,
  Edit,
  Save,
  Crown,
  Shield,
  CreditCard,
  Shell,
  ImageUpIcon,
  LucidePersonStanding,
  Camera,
  Check,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { motion } from "framer-motion";

// RISA Color Palette (from Index.tsx)
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748";
const RISA_LIGHT_GRAY = "#F5F7FA";

const Profile = () => {
  const navigate = useNavigate();
  const { profile, user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    company: profile?.company || "",
    location: profile?.location || "",
    avatar_url: profile?.avatar_url || "",
  });

  useEffect(() => {
    if (profile?.avatar_url) {
      downloadImage(profile.avatar_url);
    } else {
      setAvatarUrl(null);
    }
  }, [profile]);

  async function downloadImage(path: string) {
    try {
      if (path.startsWith("http")) {
        setAvatarUrl(path);
        return;
      }
      const { data, error } = await supabase.storage
        .from("profile-photos")
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      if (path) {
        setAvatarUrl(path);
      }
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return value.toString();
  };

  const [tierLimits, setTierLimits] = useState<{
    [key: string]: {
      price: number;
      limit: number;
      features: string[];
    };
  }>({});

  const [stats, setStats] = useState({
    total_projects: 0,
    completed_projects: 0,
    total_revenue: 0,
    completionRate: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardStats(profile.id).then(setStats);
    }
  }, [user]);

  const fetchDashboardStats = async (userId: string) => {
    const { data, error } = await supabase
      .from("quotes")
      .select("status, profit_amount")
      .eq("user_id", userId);
    if (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        total_projects: 0,
        completed_projects: 0,
        total_revenue: 0,
        completionRate: 0,
      };
    }
    const total_projects = data.length;
    const completed_projects = data.filter((q) => q.status === "completed").length;
    const total_revenue = data.reduce((sum, q) => sum + (q.profit_amount || 0), 0);
    const completionRate = total_projects > 0 ? (completed_projects / total_projects) * 100 : 0;
    return {
      total_projects,
      completed_projects,
      total_revenue,
      completionRate,
    };
  };

  useEffect(() => {
    const fetchTiers = async () => {
      const { data, error } = await supabase.from("tiers").select("*");
      if (error) {
        console.error("Failed to fetch tiers:", error);
        return;
      }
      const limits = data.reduce((acc: any, tier: any) => {
        acc[tier.name] = {
          limit: tier.quotes_limit,
          price: tier.price,
          features: tier.features || [],
        };
        return acc;
      }, {});
      setTierLimits(limits);
    };
    fetchTiers();
  }, [user]);

  const tierData = profile?.tier
    ? tierLimits[profile.tier as keyof typeof tierLimits]
    : null;

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    try {
      await updateProfile({ ...formData, avatar_url: url });
      setShowAvatarUpload(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  if (!user) {
    navigate("/auth");
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-8 w-8" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Loading Profile...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we load your profile.
          </p>
        </div>
      </div>
    );
  }

  const getTierImage = (tier: string) => {
    switch (tier) {
      case "Free":
        return <Shell className="w-6 h-6" />;
      case "Intermediate":
        return <Crown className="w-6 h-6" />;
      case "Professional":
        return <Shield className="w-6 h-6" />;
      default:
        return <span className="text-sm font-medium">{tier}</span>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Free":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Free</Badge>;
      case "Intermediate":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Intermediate</Badge>;
      case "Professional":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Professional</Badge>;
      default:
        return <Badge>{tier}</Badge>;
    }
  };

  const quotaUsagePercentage =
    profile?.quotes_used && profile?.tier && tierLimits[profile.tier]
      ? (profile.quotes_used / tierLimits[profile.tier].limit) * 100
      : 0;

  const projectCompletionRate =
    stats.total_projects > 0 ? (stats.completed_projects / stats.total_projects) * 100 : 0;

  return (
    <div className="min-h-screen animate-fade-in smooth-transition">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between items-start">
          <div>
            <h1 className="sm:text-3xl items-center text-2xl flex font-bold bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
              <LucidePersonStanding className="sm:w-7 sm:h-7 mr-2 text-primary dark:text-white" />
              Profile
            </h1>
            <p className="text-sm sm:text-lg bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-400 dark:to-purple-400 text-transparent bg-clip-text mt-2">
              Manage your account and subscription
            </p>
          </div>
          <Button
            className="text-white"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            {isEditing ? (
              <Save className="w-4 h-4 mr-2 text-white" />
            ) : (
              <Edit className="w-4 h-4 mr-2 text-white" />
            )}
            {isEditing ? "Save" : "Edit Profile"}
          </Button>
        </div>

        {/* Avatar Upload Modal */}
        {showAvatarUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <ProfilePictureUpload
              currentAvatarUrl={avatarUrl || undefined}
              onUploadComplete={handleAvatarUpload}
              onCancel={() => setShowAvatarUpload(false)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Personal Info & Stats */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="text-2xl">
                        <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 text-white"
                      onClick={() => setShowAvatarUpload(true)}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAvatarUpload(true)}
                    className="mt-2 border text-primary dark:text-white hover:text-primary hover:bg-primary/20"
                  >
                    Update company logo
                  </Button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={isEditing ? formData.name : profile.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} disabled />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={isEditing ? formData.phone : profile.phone || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={isEditing ? formData.company : profile.company || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={isEditing ? formData.location : profile.location || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your location"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats Card (for non-Free users) */}
            {profile.tier !== "Free" && stats.total_projects > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_projects}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed_projects}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.round(stats.completionRate)}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        KSh {formatCurrency(stats.total_revenue)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <span>Project Completion Rate</span>
                    <span>{Math.round(projectCompletionRate)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        projectCompletionRate >= 75
                          ? "bg-green-500"
                          : projectCompletionRate >= 50
                          ? "bg-blue-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${projectCompletionRate}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar: Plan & Account Info */}
          <div className="space-y-6">
            {/* Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col items-center">
                  <span className="text-lg font-semibold">Current Plan</span>
                  <div className="flex items-center space-x-3 mt-2">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        profile.tier === "Free"
                          ? "bg-green-100 text-green-700"
                          : profile.tier === "Intermediate"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {getTierImage(profile.tier)}
                    </div>
                  </div>
                  {profile.tier}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="sm:text-2xl text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {profile.tier === "Free" ? "Free" : `KSh ${tierData?.price?.toLocaleString() || "0"}`}
                    </p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>

                  {profile.tier !== "Professional" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Quotes Used</span>
                        <span>
                          {profile?.quotes_used ?? 0}/{tierLimits[profile?.tier]?.limit ?? 0}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            quotaUsagePercentage >= 75 ? "bg-red-500" : quotaUsagePercentage >= 50 ? "bg-blue-500" : "bg-green-500"
                          }`}
                          style={{ width: `${quotaUsagePercentage}%` }}
                        ></div>
                      </div>
                      {quotaUsagePercentage >= 75 && (
                        <p className="text-sm text-red-600">Running low on quotes!</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-md">Features:</h4>
                    {tierData?.features?.length ? (
                      tierData.features.map((feature, idx) => (
                        <li key={idx} className="flex text-sm items-center">
                          <CheckCircle className="w-4 h-4 dark:text-green-500 text-green-700 mr-2" />
                          {feature}
                        </li>
                      ))
                    ) : (
                      <p className="text-sm text-red-500">No features found</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Member since:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last updated:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account type:</span>
                  <span className="text-gray-900 dark:text-white">{profile.is_admin ? "Administrator" : "User"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Quotes used:</span>
                  <span className="text-gray-900 dark:text-white">{profile.quotes_used}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;