"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { format } from "date-fns";

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
  stops: RouteStop[];
}

interface LoggedStop {
  stopName: string;
  timestamp: string;
}

interface QuickLog {
  id: string;
  template: RouteTemplate;
  stops: LoggedStop[];
  date: string;
}

interface QuickLogRecorderProps {
  onComplete: () => void;
}

export default function QuickLogRecorder({ onComplete }: QuickLogRecorderProps) {
  const [activeLog, setActiveLog] = useState<QuickLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    checkActiveLog();
  }, []);

  const checkActiveLog = async () => {
    try {
      const response = await fetch("/api/quick-logs");
      if (!response.ok) throw new Error("Failed to fetch active log");
      
      const data = await response.json();
      setActiveLog(data.activeLog);
    } catch (error) {
      console.error("Error checking active log:", error);
    } finally {
      setLoading(false);
    }
  };

  const logStop = async (stopName: string) => {
    if (!activeLog || recording) return;
    
    setRecording(true);
    try {
      const response = await fetch(`/api/quick-logs/${activeLog.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stopName,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error("Failed to log stop");
      
      const updatedLog = await response.json();
      setActiveLog(updatedLog);
    } catch (error) {
      console.error("Error logging stop:", error);
      alert("Failed to log stop");
    } finally {
      setRecording(false);
    }
  };

  const completeLog = async () => {
    if (!activeLog) return;
    
    if (!confirm("Complete this journey and save as travel log?")) return;

    try {
      const response = await fetch(`/api/quick-logs/${activeLog.id}`, {
        method: "PUT",
      });

      if (!response.ok) throw new Error("Failed to complete log");
      
      alert("Journey completed and saved!");
      setActiveLog(null);
      onComplete();
    } catch (error) {
      console.error("Error completing log:", error);
      alert("Failed to complete log");
    }
  };

  const cancelLog = async () => {
    if (!activeLog) return;
    
    if (!confirm("Cancel this logging session?")) return;

    try {
      const response = await fetch(`/api/quick-logs/${activeLog.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to cancel log");
      
      setActiveLog(null);
    } catch (error) {
      console.error("Error canceling log:", error);
      alert("Failed to cancel log");
    }
  };

  const getNextStop = () => {
    if (!activeLog) return null;
    
    const loggedStopNames = activeLog.stops.map((s: LoggedStop) => s.stopName);
    return activeLog.template.stops.find((s: RouteStop) => !loggedStopNames.includes(s.name));
  };

  const isStopLogged = (stopName: string) => {
    return activeLog?.stops.some((s: LoggedStop) => s.stopName === stopName);
  };

  const getStopTime = (stopName: string) => {
    const stop = activeLog?.stops.find((s: LoggedStop) => s.stopName === stopName);
    return stop ? format(new Date(stop.timestamp), "HH:mm") : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!activeLog) {
    return (
      <div className="text-center py-8 px-4">
        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 mb-4">No active logging session</p>
        <p className="text-sm text-gray-500">Start a new session to begin tracking</p>
      </div>
    );
  }

  const nextStop = getNextStop();
  const progress = (activeLog.stops.length / activeLog.template.stops.length) * 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-700 to-zinc-900 rounded-xl p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{activeLog.template.name}</h2>
        <div className="flex items-center gap-2 text-sm sm:text-base opacity-90">
          <MapPin size={16} />
          <span>{activeLog.template.fromLocation} → {activeLog.template.toLocation}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs sm:text-sm mb-1">
            <span>Progress</span>
            <span>{activeLog.stops.length} / {activeLog.template.stops.length} stops</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Next Stop Highlight */}
      {nextStop && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
          <p className="text-sm font-medium text-yellow-800 mb-2">Next Stop:</p>
          <button
            onClick={() => logStop(nextStop.name)}
            disabled={recording}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 active:from-yellow-600 active:to-orange-600 text-gray-900 font-bold py-6 sm:py-8 px-4 rounded-xl text-lg sm:text-2xl shadow-lg transform transition-all active:scale-95 disabled:opacity-50 touch-manipulation"
          >
            <div className="flex flex-col items-center gap-2">
              <span>{nextStop.name}</span>
              <span className="text-sm sm:text-base font-normal opacity-80">Tap to record time</span>
            </div>
          </button>
        </div>
      )}

      {/* All Stops */}
      <div className="space-y-2 sm:space-y-3">
        {activeLog.template.stops.map((stop: RouteStop) => {
          const logged = isStopLogged(stop.name);
          const time = getStopTime(stop.name);
          
          return (
            <button
              key={stop.id}
              onClick={() => !logged && logStop(stop.name)}
              disabled={logged || recording}
              className={`w-full p-4 sm:p-5 rounded-xl border-2 transition-all touch-manipulation ${
                logged
                  ? "bg-green-50 border-green-300"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md active:scale-98"
              } ${logged ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {logged ? (
                      <CheckCircle2 size={24} className="text-green-600" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                  <span className={`text-left font-medium truncate ${
                    logged ? "text-green-900" : "text-gray-700"
                  }`}>
                    {stop.name}
                  </span>
                </div>
                {time && (
                  <div className="flex items-center gap-1 text-green-700 font-semibold flex-shrink-0 ml-2">
                    <Clock size={16} />
                    <span className="text-sm sm:text-base">{time}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <button
          onClick={cancelLog}
          className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold py-4 rounded-xl transition-colors touch-manipulation"
        >
          <XCircle size={20} />
          <span>Cancel</span>
        </button>
        <button
          onClick={completeLog}
          disabled={activeLog.stops.length < 2}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          <CheckCircle2 size={20} />
          <span>Complete</span>
        </button>
      </div>
    </div>
  );
}
