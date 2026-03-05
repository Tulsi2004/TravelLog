"use client";

import { useState, useEffect } from "react";
import QuickLogRecorder from "@/components/QuickLogRecorder";
import RouteTemplateList from "@/components/RouteTemplateList";
import RouteTemplateForm from "@/components/RouteTemplateForm";
import { Zap, ArrowLeft } from "lucide-react";

export default function QuickLogPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRecorder, setShowRecorder] = useState(false);
  const [checkingActive, setCheckingActive] = useState(true);

  useEffect(() => {
    checkForActiveSession();
  }, []);

  const checkForActiveSession = async () => {
    try {
      const response = await fetch("/api/quick-logs");
      if (response.ok) {
        const data = await response.json();
        if (data.activeLog) {
          setShowRecorder(true);
        }
      }
    } catch (error) {
      console.error("Error checking for active session:", error);
    } finally {
      setCheckingActive(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleStartLog = () => {
    setShowRecorder(true);
    handleRefresh();
  };

  const handleCompleteLog = () => {
    setShowRecorder(false);
    handleRefresh();
  };

  if (checkingActive) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-2 rounded-lg">
              <Zap size={24} className="text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Quick Log</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Tap to record your journey stops in real-time
          </p>
        </div>
        {!showRecorder && (
          <div className="w-full sm:w-auto">
            <RouteTemplateForm onSuccess={handleRefresh} />
          </div>
        )}
      </div>

      {/* Content */}
      {showRecorder ? (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <button
            onClick={() => setShowRecorder(false)}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back to Templates</span>
          </button>
          <QuickLogRecorder key={refreshKey} onComplete={handleCompleteLog} />
        </div>
      ) : (
        <RouteTemplateList
          key={refreshKey}
          onDelete={handleRefresh}
          onStartLog={handleStartLog}
        />
      )}
    </div>
  );
}
