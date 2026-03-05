"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

interface TravelLogFormProps {
  onSuccess: () => void;
}

export default function TravelLogForm({ onSuccess }: TravelLogFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    startTime: "",
    endTime: "",
    transport: "bus",
    cost: "",
    expense: "",
    notes: "",
  });

  // transport types are now managed remotely so that users can add new ones
  const [transportOptions, setTransportOptions] = useState<string[]>([]);
  const [customTransport, setCustomTransport] = useState("");

  // load transport types from server when component mounts
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/travel-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create travel log");

      // Reset form
      setFormData({
        fromLocation: "",
        toLocation: "",
        startTime: "",
        endTime: "",
        transport: "bus",
        cost: "",
        expense: "",
        notes: "",
      });
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating travel log:", error);
      alert("Failed to create travel log");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

  return (
    <div className="w-full sm:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-900 active:bg-zinc-950 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors touch-manipulation"
      >
        <Plus size={20} />
        <span className="whitespace-nowrap">Add Travel Log</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">New Travel Log</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="sm:hidden text-gray-500 hover:text-gray-700 p-2 -mr-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <input
                    type="text"
                    name="fromLocation"
                    value={formData.fromLocation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Starting location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <input
                    type="text"
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Destination"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transport
                  </label>
                  <select
                    name="transport"
                    value={formData.transport}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {transportOptions.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                  {/* allow adding a new transport type inline */}
                  <div className="mt-2 flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Add transport"
                      value={customTransport}
                      onChange={(e) => setCustomTransport(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddTransport}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      disabled={!customTransport.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost (₹)
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense (₹)
                  </label>
                  <input
                    type="number"
                    name="expense"
                    value={formData.expense}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 py-3 sm:py-3 rounded-lg font-semibold transition-colors touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-900 active:bg-zinc-950 text-white py-3 sm:py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                >
                  {loading ? "Creating..." : "Create Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
