"use client";

import { useState } from "react";
import { format, differenceInHours } from "date-fns";
import { Trash2, MapPin, Clock, IndianRupee } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface TravelLog {
  id: string;
  fromLocation: string;
  toLocation: string;
  startTime: string;
  endTime: string;
  transport: string;
  cost: number;
  notes: string | null;
}

interface TravelLogListProps {
  logs: TravelLog[];
  onDelete: () => void;
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

export default function TravelLogList({ logs, onDelete }: TravelLogListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>(
    { open: false, id: "" }
  );

  const handleDelete = async (id: string) => {
    setDeleteDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    const { id } = deleteDialog;

    setDeleting(id);
    try {
      const response = await fetch(`/api/travel-logs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete travel log");

      onDelete();
    } catch (error) {
      console.error("Error deleting travel log:", error);
      alert("Failed to delete travel log");
    } finally {
      setDeleting(null);
    }
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
        <MapPin size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No travel logs yet</h3>
        <p className="text-sm sm:text-base text-gray-500">Start tracking your journeys by adding your first travel log!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Travel History</h2>
      
      <div className="space-y-3 sm:space-y-4">
        {logs.map((log) => {
          const duration = differenceInHours(
            new Date(log.endTime),
            new Date(log.startTime)
          );

          return (
            <div
              key={log.id}
              className="border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 ${
                        transportColors[log.transport] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <span>{transportIcons[log.transport] || "🚶"}</span>
                      <span className="capitalize">{log.transport}</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-2 mb-2">
                    <MapPin size={16} className="text-gray-500 flex-shrink-0 mt-0.5 sm:w-[18px] sm:h-[18px]" />
                    <p className="text-base sm:text-lg font-semibold text-gray-800 break-words">
                      {log.fromLocation} → {log.toLocation}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock size={14} className="text-gray-400 flex-shrink-0 sm:w-4 sm:h-4" />
                      <span className="truncate">{format(new Date(log.startTime), "MMM d, yyyy HH:mm")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Clock size={14} className="text-gray-400 flex-shrink-0 sm:w-4 sm:h-4" />
                      <span>{duration} hours</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <IndianRupee size={14} className="text-gray-400 flex-shrink-0 sm:w-4 sm:h-4" />
                      <span className="font-semibold">₹{log.cost.toFixed(2)}</span>
                    </div>
                  </div>

                  {log.notes && (
                    <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 rounded p-2 sm:p-3 mt-2">
                      {log.notes}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(log.id)}
                  disabled={deleting === log.id}
                  className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors disabled:opacity-50 touch-manipulation"
                  title="Delete log"
                  aria-label="Delete travel log"
                >
                  <Trash2 size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete Travel Log"
        description="Are you sure you want to delete this travel log? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
