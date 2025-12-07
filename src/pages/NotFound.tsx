// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth");
  }

  return (
    <div className="min-h-screen animate-fade-in flex items-center justify-center p-4 smooth-transition">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl border-0 shadow-2xl overflow-hidden">
          <CardContent className="pt-10 pb-8 px-6 text-center">
            {/* Icon with Gradient */}
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 rounded-xl">
                <Target className="sm:w-12 sm:h-12 w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Headings */}
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-primary dark:from-white dark:via-blue-200 dark:to-purple-900 bg-clip-text text-transparent mb-3">
              404
            </h1>

            <h2 className="sm:text-2xl text-xl font-bold text-foreground mb-4">
              Page Not Found
            </h2>

            <p className="text-muted-foreground mb-8 px-2">
              The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/")}
                className="bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="rounded-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>

          {/* Decorative Bottom Accent */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-700" />
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 uppercase tracking-widest">
          © 2025 Jeff. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;