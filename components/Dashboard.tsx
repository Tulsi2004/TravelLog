"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import TravelLogForm from "@/components/TravelLogForm";
import TravelLogList from "@/components/TravelLogList";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import QuickLogPage from "@/components/QuickLogPage";
import { Plane, Zap, BarChart3, List } from "lucide-react";

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

type TabType = "quick-log" | "logs" | "analytics";

export default function Dashboard() {
  const [logs, setLogs] = useState<TravelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("quick-log");

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/travel-logs");
      if (!response.ok) throw new Error("Failed to fetch travel logs");
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching travel logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const tabs = [
    { id: "quick-log" as TabType, label: "Quick Log", icon: Zap },
    { id: "analytics" as TabType, label: "Analytics", icon: BarChart3 },
    { id: "logs" as TabType, label: "Travel Logs", icon: List },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100">{/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <Plane size={24} className="text-white sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                  Travel Tracker
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Track your journeys and analyze your travel patterns
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-20 sm:pb-8">
        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar bg-white rounded-xl p-2 shadow-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all touch-manipulation ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-zinc-800 to-zinc-900 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Quick Log Tab */}
          {activeTab === "quick-log" && (
            <QuickLogPage key={refreshKey} />
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    View your travel statistics and insights
                  </p>
                </div>
              </div>
              <AnalyticsDashboard key={refreshKey} />
            </>
          )}

          {/* Travel Logs Tab */}
          {activeTab === "logs" && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Travel Logs</h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Manage your complete travel history
                  </p>
                </div>
                <div className="w-full sm:w-auto">
                  <TravelLogForm onSuccess={handleRefresh} />
                </div>
              </div>

              {loading ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading travel logs...</p>
                </div>
              ) : (
                <TravelLogList logs={logs} onDelete={handleRefresh} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 md:mt-16 py-6 sm:py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p className="text-sm sm:text-base">© 2026 Travel Timeline Tracker. Track your adventures. 🌍</p>
        </div>
      </footer>
    </div>
  );
}
