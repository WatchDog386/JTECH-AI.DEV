// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Calculator from "@/components/Calculator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  User,
  LogOut,
  Moon,
  Sun,
  Shield,
  Crown,
  Calculator as CalculatorIcon,
  Plus,
  BarChart,
  Settings,
  Eye,
  Menu,
  X,
  Star,
  ThumbsUp,
  Shell,
  Building,
  Building2,
  DoorOpen,
  DraftingCompass,
  Target,
  ChevronDown,
  Settings2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
} from "./ui/alert-dialog";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSubAlert, setShowSubAlert] = useState(true);

  const handleSignOut = async () => {
    setTimeout(async () => {
      await signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate("/");
    });
  };
  const isActive = (path: string) => location.pathname === path;
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart },
    { path: "/quotes/new", label: "New Quote", icon: Building2 },
    { path: "/quotes/all", label: "All Quotes", icon: Eye },
    { path: "/variables", label: "Variables", icon: Settings },
  ];
  if (location.pathname === "/" || location.pathname === "/auth") {
    return null;
  }
  const getTierImage = (tier: string) => {
    switch (tier) {
      case "Free":
        return <Shell className="w-4 h-4" />;
      case "Intermediate":
        return <Crown className="w-4 h-4" />;
      case "Professional":
        return <Shield className="w-4 h-4" />;
      default:
        return <span className="text-sm font-medium">{tier}</span>;
    }
  };
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Free":
        return (
          <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
            <Shell className="w-3 h-3 mr-1" /> Free
          </Badge>
        );
      case "Intermediate":
        return (
          <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Crown className="w-3 h-3 mr-1" /> Intermediate
          </Badge>
        );
      case "Professional":
        return (
          <Badge className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-100">
            <Shield className="w-3 h-3 mr-1" /> Professional
          </Badge>
        );
      default:
        return <Badge>{tier}</Badge>;
    }
  };
  return (
    <>
      <nav className="fixed sticky top-0 z-50 glass border-b shadow-sm">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-1">
              <div className="p-2 bg-transparent rounded-lg group-hover:scale-102 transition-transform">
                <Target className="w-5 h-5 text-primary dark:text-white" />
              </div>
              <span className="text-lg md:sm:text-xl max-md:hidden text-lg font-bold text-primary dark:text-white">
                JTech AI
              </span>
            </div>

            {user && (
              <div className="hidden md:flex ml-auto items-center space-x-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <Button
                        onClick={() => navigate(item.path)}
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className={`relative font-medium transition-colors duration-500 ${
                          isActive(item.path)
                            ? " text-white shadow-lg"
                            : " dark:text-gray-300"
                        } px-4`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden ml-2 xl:inline">
                          {item.label}
                        </span>
                      </Button>
                    </motion.div>
                  );
                })}
                <Button
                  variant="ghost"
                  onClick={() => setIsCalculatorOpen(true)}
                  className="card-hover"
                >
                  <CalculatorIcon className="w-4 h-4" />
                </Button>

                <Badge className="bg-transparent hover:bg-transparent">
                  {getTierBadge(profile?.tier)}
                </Badge>
              </div>
            )}

            <div className="flex items-center ml-auto space-x-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  profile?.tier === "Free"
                    ? "bg-green-100 text-green-700"
                    : profile?.tier === "Intermediate"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {getTierImage(profile?.tier)}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="card-hover"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Menu className="w-4 h-4" />
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div>
                        <Button variant="ghost" className=" rounded-xl">
                          <Avatar className="w-6 h-6 items-center">
                            <AvatarImage
                              src={profile?.avatar_url || undefined}
                            />
                            <AvatarFallback className="text-2xl">
                              <User className="w-4 h-4"></User>
                            </AvatarFallback>
                          </Avatar>
                          <span className="max-w-32 truncate">
                            {profile?.name || user.email}
                          </span>
                          <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800 rounded-xl p-2"
                    >
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {profile?.name || user.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        <div className="mt-2">
                          {getTierBadge(profile?.tier)}
                        </div>
                      </div>

                      <DropdownMenuItem
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:bg-blue-200 hover:text-background dark:text-gray-300 dark:hover:bg-primary/40 dark:hover:text-white transition-colors  duration-200"
                      >
                        <div className="rounded-lg bg-blue-100 dark:bg-primary/30 items-center">
                          <Avatar className="w-8 h-8 items-center justify-center text-center">
                            <AvatarImage
                              src={profile?.avatar_url || undefined}
                            />
                            <AvatarFallback className="items-center justify-center text-center">
                              <User className="w-4 h-4 justify-center text-center text-blue-600 dark:text-blue-400"></User>
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-medium">Profile</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Manage your account
                          </p>
                        </div>
                      </DropdownMenuItem>

                      {profile?.is_admin && (
                        <DropdownMenuItem
                          onClick={() => navigate("/admin")}
                          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:bg-blue-200 hover:text-background dark:text-gray-300 dark:hover:bg-primary/40 dark:hover:text-white transition-colors duration-200"
                        >
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-primary/30">
                            <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">Admin Dashboard</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              System administration
                            </p>
                          </div>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-700" />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-red-600 hover:bg-red-200 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors duration-200">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium">Sign Out</p>
                              <p className="text-xs text-red-500 dark:text-red-400">
                                End your session
                              </p>
                            </div>
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                              <LogOut className="w-5 h-5 text-red-500" />
                              Confirm Sign Out
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                              Are you sure you want to sign out as{" "}
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {profile?.name || user.email}
                              </span>
                              ? You will need to sign in again to access your
                              account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleSignOut}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign Out
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  className="text-white"
                  asChild
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {user && isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-slide-down">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`justify-start ${
                        isActive(item.path) ? "bg-primary text-white" : ""
                      }`}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate(item.path);
                      }}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCalculatorOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <CalculatorIcon className="w-4 h-4 mr-2" />
                  Calculator
                </Button>
              </div>
            </div>
          )}
        </div>
        {user &&
          profile?.subscription_status !== "active" &&
          showSubAlert &&
          (() => {
            const status = profile?.subscription_status?.toLowerCase();

            const statusConfig = {
              expired: {
                bg: "bg-yellow-50 dark:bg-yellow-900/30",
                border: "border-yellow-200 dark:border-yellow-700",
                text: "text-yellow-800 dark:text-yellow-200",
                icon: (
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-300" />
                ),
                message:
                  "Your subscription has expired. Please renew to continue using premium features.",
              },
              cancelled: {
                bg: "bg-red-50 dark:bg-red-900/30",
                border: "border-red-200 dark:border-red-700",
                text: "text-red-800 dark:text-red-200",
                icon: (
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-300" />
                ),
                message:
                  "Your subscription was cancelled. Update your plan to regain access.",
              },
              inactive: {
                bg: "bg-gray-50 dark:bg-gray-900/30",
                border: "border-gray-200 dark:border-gray-700",
                text: "text-gray-800 dark:text-gray-200",
                icon: (
                  <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                ),
                message:
                  "Your subscription is inactive. Please reactivate your plan.",
              },
              pending: {
                bg: "bg-blue-50 dark:bg-blue-900/30",
                border: "border-blue-200 dark:border-blue-700",
                text: "text-blue-800 dark:text-blue-200",
                icon: (
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                ),
                message:
                  "Your subscription is pending confirmation. It will activate once payment is verified.",
              },
            }[status] || {
              bg: "bg-neutral-50 dark:bg-neutral-900/30",
              border: "border-neutral-200 dark:border-neutral-700",
              text: "text-neutral-800 dark:text-neutral-200",
              icon: (
                <AlertCircle className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              ),
              message:
                "Your subscription status is unknown. Please check your billing details.",
            };

            return (
              <div
                className={`w-full ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} py-2 px-4 flex items-center justify-between text-sm animate-slide-down`}
              >
                <div className="flex items-center space-x-2">
                  {statusConfig.icon}
                  <span>{statusConfig.message}</span>
                </div>
                <button
                  onClick={() => setShowSubAlert(false)}
                  className="hover:opacity-70 transition"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            );
          })()}
      </nav>
      <Calculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </>
  );
};

export default Navbar;
