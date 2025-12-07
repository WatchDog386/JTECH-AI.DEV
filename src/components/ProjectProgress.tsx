// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle,
  Clock,
  Play,
  Pause,
  Pencil,
  CalendarIcon,
  Loader2,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useQuotes } from "@/hooks/useQuotes";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
interface ProjectProgressProps {
  quoteId: string;
  quoteName: string;
  onQuoteUpdated?: () => void;
}
interface ProjectProgressData {
  id?: string;
  status:
    | "draft"
    | "planning"
    | "started"
    | "in_progress"
    | "completed"
    | "on_hold";
  progress_percentage: number;
  notes?: string;
  milestone_date?: string;
}
const ProjectProgress = ({
  quoteId,
  quoteName,
  onQuoteUpdated,
}: ProjectProgressProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const { fetchQuotes } = useQuotes();
  const [progressData, setProgressData] = useState<ProjectProgressData>({
    status: "planning",
    progress_percentage: 0,
    notes: "",
    milestone_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    fetchProjectProgress();
  }, [quoteId, user, location.key]);
  const fetchProjectProgress = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("progress_percentage, progress_notes, milestone_date, status")
        .eq("id", quoteId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        console.error("Error fetching quote progress:", error);
        return;
      }
      if (data) {
        setProgressData({
          status: data.status as
            | "draft"
            | "planning"
            | "started"
            | "in_progress"
            | "completed"
            | "on_hold",
          progress_percentage: data.progress_percentage || 0,
          notes: data.progress_notes || "",
          milestone_date: data.milestone_date || "",
        });
      }
    } catch (error) {
      console.error("Error fetching project progress:", error);
    } finally {
      setLoading(false);
    }
  };
  const updateProgress = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      const updateData = {
        status: progressData.status,
        progress_percentage: progressData.progress_percentage,
        progress_notes: progressData.notes || null,
        milestone_date: progressData.milestone_date || null,
      };
      const { error } = await supabase
        .from("quotes")
        .update(updateData)
        .eq("id", quoteId)
        .eq("user_id", user.id);
      if (error) {
        console.error("Error updating progress:", error);
        toast({
          title: "Update Failed",
          description: "Failed to update project progress",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Progress Updated",
        description: "Project progress has been updated successfully",
      });
      fetchProjectProgress();
      fetchQuotes();
      if (onQuoteUpdated) onQuoteUpdated();
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update project progress",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Pencil className="w-4 h-4" />;
      case "planning":
        return <CalendarIcon className="w-4 h-4" />;
      case "started":
        return <Play className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "on_hold":
        return <Pause className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "hover:bg-gray-100 bg-gray-100 text-gray-800";
      case "planning":
        return "hover:bg-purple-100 bg-purple-100 text-purple-800";
      case "started":
        return "hover:bg-blue-100 bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "completed":
        return "hover:bg-green-100 bg-green-100 text-green-800";
      case "on_hold":
        return "hover:bg-red-100 bg-red-100 text-red-800";
      default:
        return "hover:bg-gray-100 bg-gray-100 text-gray-800";
    }
  };
  const getBackColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-300/10";
      case "planning":
        return "bg-purple-300/10 ";
      case "started":
        return "bg-blue-300/10";
      case "in_progress":
        return "bg-amber-300/10 ";
      case "completed":
        return "bg-green-300/10";
      case "on_hold":
        return "bg-red-300/10";
      default:
        return "bg-gray-300/10";
    }
  };
  const getIndicatorColor = (status: string) => {
    switch (status) {
      case "draft":
        return "hover:bg-gray-800 bg-gray-800";
      case "planning":
        return "hover:bg-purple-800 bg-purple-800";
      case "started":
        return "hover:bg-blue-800 bg-blue-800";
      case "in_progress":
        return "hover:bg-amber-800 bg-amber-800";
      case "completed":
        return "hover:bg-green-800 bg-green-800";
      case "on_hold":
        return "hover:bg-red-800 bg-red-800";
      default:
        return "hover:bg-gray-800 bg-gray-800";
    }
  };
  if (loading) {
    return (
      <div className="pt-6 flex flex-col items-center justify-center text-center flex-1">
        <Loader2 className="animate-spin text-white rounded-full h-8 w-8" />
        <p className="text-white mt-5">Loading project progress...</p>
      </div>
    );
  }
  return (
    <>
      <CardHeader className={`${getBackColor(progressData.status)} rounded-lg`}>
        <CardTitle className="flex items-center justify-between">
          <span className="text-white">Project Progress - {quoteName}</span>
          <Badge className={getStatusColor(progressData.status)}>
            {getStatusIcon(progressData.status)}
            <span className="ml-1 capitalize">
              {progressData.status.replace("_", " ")}
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent
        className={`${getBackColor(progressData.status)} space-y-6 rounded-lg`}
      >
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-white">Progress Percentage</Label>
            <span
              className={`sm:text-2xl text-lg font-bold hover:bg-transparent ${getStatusColor(
                progressData.status
              )} bg-transparent`}
            >
              {progressData.progress_percentage}%
            </span>
          </div>
          <Progress
            indicatorColor={`${getIndicatorColor(progressData.status)} `}
            value={progressData.progress_percentage}
            className="w-full h-3 bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white" htmlFor="status">
              Project Status
            </Label>
            <Select
              value={progressData.status}
              onValueChange={(value: any) =>
                setProgressData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="started">Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white" htmlFor="percentage">
              Progress Percentage
            </Label>
            <Input
              id="percentage"
              type="number"
              min="0"
              max="100"
              value={progressData.progress_percentage}
              onChange={(e) =>
                setProgressData((prev) => ({
                  ...prev,
                  progress_percentage: Math.min(
                    100,
                    Math.max(0, parseInt(e.target.value) || 0)
                  ),
                }))
              }
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Label className="text-white" htmlFor="milestone">
            Next Milestone Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-[240px] justify-start text-left font-normal ${
                  !progressData.milestone_date && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {progressData.milestone_date
                  ? format(new Date(progressData.milestone_date), "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                className="glass"
                selected={
                  progressData.milestone_date
                    ? new Date(progressData.milestone_date)
                    : undefined
                }
                onSelect={(date) =>
                  setProgressData((prev) => ({
                    ...prev,
                    milestone_date: date ? date.toISOString() : "",
                  }))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="text-white" htmlFor="notes">
            Progress Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Add notes about current progress, challenges, or next steps..."
            value={progressData.notes}
            onChange={(e) =>
              setProgressData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={4}
          />
        </div>

        <Button
          onClick={updateProgress}
          disabled={updating}
          className="w-full text-white"
        >
          {updating ? "Updating..." : "Update Progress"}
        </Button>
      </CardContent>
    </>
  );
};
export default ProjectProgress;
