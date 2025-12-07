// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
interface ProtectedRouteProps {
  children: React.ReactNode;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { refreshProfile } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className=" rounded-2xl border-0 shadow-2xl">
          <CardContent className="pt-6 text-center">
            <Loader2 className="sm:w-7 sm:h-7 animate-spin mx-auto mb-4" />
            <h2 className="sm:text-2xl text-lg font-bold mb-4">Loading...</h2>
            <p className="text-muted-foreground">
              Please wait while we authenticate you.
            </p>
            <p className="text-muted-foreground text-sm">
              If this takes too long please refresh page manually.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};
export default ProtectedRoute;
