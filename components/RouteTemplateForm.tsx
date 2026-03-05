"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface RouteTemplateFormProps {
  onSuccess: () => void;
}

export default function RouteTemplateForm({ onSuccess }: RouteTemplateFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fromLocation: "",
    toLocation: "",
    transport: "train",
    estimatedCost: "",
    estimatedExpense: "",
  });
  const [stops, setStops] = useState<string[]>(["Left Home", "Reached Station"]);
  const [newStop, setNewStop] = useState("");

  const [transportOptions, setTransportOptions] = useState<string[]>([]);
  const [customTransport, setCustomTransport] = useState("");

  useEffect(() => {
    fetch("/api/transport-types")
      .then((r) => r.json())
      .then((data) => {
        const names = Array.isArray(data) ? data.map((t: any) => t.name) : [];
        if (names.length) {
          setTransportOptions(names);
          setFormData((prev) => ({ ...prev, transport: names[0] }));
        }
      })
      .catch((err) => console.error("Failed to load transport types", err));
  }, []);

  const handleAddTransport = async () => {
    const name = customTransport.trim();
    if (!name) return;
    try {
      const res = await fetch("/api/transport-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to add transport type");
      const newType = await res.json();
      setTransportOptions((prev) => [...prev, newType.name]);
      setFormData((prev) => ({ ...prev, transport: newType.name }));
      setCustomTransport("");
    } catch (err) {
      console.error(err);
      alert("Could not add transport type");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (stops.length < 2) {
      alert("Please add at least 2 stops");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/route-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          stops,
        }),
      });

      if (!response.ok) throw new Error("Failed to create template");

      setFormData({
        name: "",
        fromLocation: "",
        toLocation: "",
        transport: "train",
        estimatedCost: "",
        estimatedExpense: "",
      });
      setStops(["Left Home", "Reached Station"]);
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const addStop = () => {
    if (newStop.trim()) {
      setStops([...stops, newStop.trim()]);
      setNewStop("");
    }
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const moveStop = (index: number, direction: "up" | "down") => {
    const newStops = [...stops];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= stops.length) return;
    
    [newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]];
    setStops(newStops);
  };

  return (
    <div className="w-full sm:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-900 hover:to-zinc-950 active:from-zinc-950 active:to-black text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors touch-manipulation shadow-lg"
      >
        <Plus size={20} />
        <span className="whitespace-nowrap">Create Route Template</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create Route Template</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 -mr-2"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                  placeholder="e.g., Home to Office"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Location *
                  </label>
                  <input
                    type="text"
                    value={formData.fromLocation}
                    onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                    placeholder="Home"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Location *
                  </label>
                  <input
                    type="text"
                    value={formData.toLocation}
                    onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                    placeholder="Office"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transport
                  </label>
                  <select
                    value={formData.transport}
                    onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                  >
                    {transportOptions.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Add transport"
                      value={customTransport}
                      onChange={(e) => setCustomTransport(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddTransport}
                      className="px-3 py-1 bg-zinc-800 text-white rounded-lg hover:bg-zinc-900 disabled:opacity-50"
                      disabled={!customTransport.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Expense (₹)
                </label>
                <input
                  type="number"
                  value={formData.estimatedExpense}
                  onChange={(e) => setFormData({ ...formData, estimatedExpense: e.target.value })}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Stops */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Journey Stops * (in order)
                </label>
                <div className="space-y-2 mb-3">
                  {stops.map((stop, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                      <span className="flex-1 text-sm">{stop}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveStop(index, "up")}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStop(index, "down")}
                          disabled={index === stops.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStop}
                    onChange={(e) => setNewStop(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addStop())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                    placeholder="Add new stop..."
                  />
                  <button
                    type="button"
                    onClick={addStop}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-900 hover:to-zinc-950 active:from-zinc-950 active:to-black text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                >
                  {loading ? "Creating..." : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
