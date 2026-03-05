"use client";

import { useState, useEffect } from "react";
import { Play, Trash2, MapPin, Clock, IndianRupee } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface RouteStop {
  id: string;
  name: string;
  order: number;
}

interface RouteTemplate {
  id: string;
  name: string;
  fromLocation: string;
  toLocation: string;
  transport: string;
  estimatedCost: number;
  stops: RouteStop[];
}

interface RouteTemplateListProps {
  onDelete: () => void;
  onStartLog: () => void;
}

const transportIcons: Record<string, string> = {
  bus: "🚌",
  train: "🚂",
  flight: "✈️",
  car: "🚗",
};

const transportColors: Record<string, string> = {
  bus: "bg-yellow-100 text-yellow-800",
  train: "bg-blue-100 text-blue-800",
  flight: "bg-zinc-100 text-zinc-800",
  car: "bg-green-100 text-green-800",
};

export default function RouteTemplateList({ onDelete, onStartLog }: RouteTemplateListProps) {
  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>(
    { open: false, id: "", name: "" }
  );
  const [resumeDialog, setResumeDialog] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/route-templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const startQuickLog = async (templateId: string) => {
    setStarting(templateId);
    try {
      const response = await fetch("/api/quick-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Handle active session error specifically
        if (error.error === "Active session exists") {
          setResumeDialog(true);
          return;
        }
        
        throw new Error(error.error || "Failed to start quick log");
      }

      onStartLog();
    } catch (error: any) {
      console.error("Error starting quick log:", error);
      alert(error.message || "Failed to start quick log");
    } finally {
      setStarting(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name });
  };

  const confirmDelete = async () => {
    const { id } = deleteDialog;

    setDeleting(id);
    try {
      const response = await fetch(`/api/route-templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete template");

      onDelete();
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-600"></div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
        <MapPin size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No route templates yet</h3>
        <p className="text-sm sm:text-base text-gray-500">Create your first route template to start quick logging!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Your Route Templates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{template.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      transportColors[template.transport] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <span>{transportIcons[template.transport] || "🚶"}</span>
                    <span className="capitalize">{template.transport}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(template.id, template.name)}
                disabled={deleting === template.id}
                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors disabled:opacity-50 touch-manipulation"
                title="Delete template"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <MapPin size={16} className="flex-shrink-0" />
              <span className="truncate">{template.fromLocation} → {template.toLocation}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{template.stops.length} stops</span>
              </div>
              {template.estimatedCost > 0 && (
                <div className="flex items-center gap-1">
                  <IndianRupee size={16} />
                  <span>₹{template.estimatedCost.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Stops Preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
              <div className="space-y-1">
                {template.stops.map((stop, idx) => (
                  <div key={stop.id} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="font-medium text-gray-400">{idx + 1}.</span>
                    <span className="flex-1">{stop.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => startQuickLog(template.id)}
              disabled={starting === template.id}
              className="w-full bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-900 hover:to-zinc-950 active:from-zinc-950 active:to-black text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-md"
            >
              <Play size={18} />
              <span>{starting === template.id ? "Starting..." : "Start Quick Log"}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete Template"
        description={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
      
      <ConfirmDialog
        open={resumeDialog}
        onOpenChange={setResumeDialog}
        title="Active Session Exists"
        description={`You have an unfinished Quick Log session.\n\n\u2022 Click Continue to resume your current session\n\u2022 Click Cancel to stay here\n\nTip: Complete or cancel your active session before starting a new one.`}
        onConfirm={onStartLog}
        confirmText="Continue"
        cancelText="Cancel"
      />
    </div>
  );
}
