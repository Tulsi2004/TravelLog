"use client";

import { useEffect, useState } from "react";
import { Clock, IndianRupee, TrendingUp, MapPin } from "lucide-react";

interface Analytics {
  totalHours: number;
  totalCost: number;
  mostUsedTransport: string;
  transportCounts: Record<string, number>;
  longestTrip: {
    duration: number;
    from: string;
    to: string;
    transport: string;
  } | null;
  totalTrips: number;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
        This Month&apos;s Analytics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Clock size={20} className="sm:w-6 sm:h-6" />
            <h3 className="text-sm sm:text-base font-semibold">Total Hours</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{analytics.totalHours.toFixed(1)}</p>
          <p className="text-xs sm:text-sm opacity-90 mt-1">Travel time</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <IndianRupee size={20} className="sm:w-6 sm:h-6" />
            <h3 className="text-sm sm:text-base font-semibold">Total Spent</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">₹{analytics.totalCost.toFixed(2)}</p>
          <p className="text-xs sm:text-sm opacity-90 mt-1">On travel</p>
        </div>

        <div className="bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <TrendingUp size={20} className="sm:w-6 sm:h-6" />
            <h3 className="text-sm sm:text-base font-semibold">Most Used</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold capitalize">{analytics.mostUsedTransport}</p>
          <p className="text-xs sm:text-sm opacity-90 mt-1">Transport type</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <MapPin size={20} className="sm:w-6 sm:h-6" />
            <h3 className="text-sm sm:text-base font-semibold">Total Trips</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{analytics.totalTrips}</p>
          <p className="text-xs sm:text-sm opacity-90 mt-1">This month</p>
        </div>
      </div>

      {analytics.longestTrip && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 sm:p-6 border border-indigo-200">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-indigo-600 sm:w-5 sm:h-5" />
            Longest Trip
          </h3>
          <div className="space-y-1 sm:space-y-2 text-gray-700">
            <p className="text-sm sm:text-base">
              <span className="font-medium">{analytics.longestTrip.from}</span> → 
              <span className="font-medium"> {analytics.longestTrip.to}</span>
            </p>
            <p className="text-xs sm:text-sm">
              {analytics.longestTrip.duration} hours via{" "}
              <span className="capitalize font-medium">{analytics.longestTrip.transport}</span>
            </p>
          </div>
        </div>
      )}

      {Object.keys(analytics.transportCounts).length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">Transport Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {Object.entries(analytics.transportCounts).map(([transport, count]) => (
              <div
                key={transport}
                className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200"
              >
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{count}</p>
                <p className="text-xs sm:text-sm text-gray-600 capitalize">{transport}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
