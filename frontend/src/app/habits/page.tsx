"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";
import { GlassCard } from "../../components/GlassCard";
import { HabitConsistencyChart } from "../../components/VisualCharts";
import { 
  Sparkles, Plus, Trash2, Calendar, Clock, 
  TrendingUp, Play, AlertTriangle, HeartHandshake, ShieldAlert
} from "lucide-react";

export default function HabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningSimulation, setRunningSimulation] = useState(false);
  const [error, setError] = useState("");

  // New habit form fields
  const [name, setName] = useState("");
  const [type, setType] = useState<"positive" | "negative">("positive");
  const [frequency, setFrequency] = useState("daily");
  const [duration, setDuration] = useState("30");
  const [consistencyScore, setConsistencyScore] = useState("70");

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push("/");
      return;
    }
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await api.getHabits();
      setHabits(data);
    } catch (err: any) {
      setError(err.message || "Failed to load habits");
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const newHabit = await api.createHabit({
        name: name.trim(),
        type,
        frequency,
        duration: Number(duration),
        consistencyScore: Number(consistencyScore)
      });
      setHabits(prev => [...prev, newHabit]);
      
      // Reset form
      setName("");
      setDuration("30");
      setConsistencyScore("70");
    } catch (err: any) {
      setError(err.message || "Failed to create habit");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await api.deleteHabit(id);
      setHabits(prev => prev.filter(h => h.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete habit");
    }
  };

  const handleTriggerSimulation = async () => {
    setRunningSimulation(true);
    setError("");
    
    try {
      await api.runSimulation();
      // Simulation success, route to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Simulation runtime encountered an error. Check logs.");
      setRunningSimulation(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Simulation Trigger Overlay Loader */}
      <AnimatePresence>
        {runningSimulation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
          >
            <div className="max-w-md space-y-6">
              {/* Spinning core */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-indigo-500/10 border-b-indigo-500 animate-spin [animation-direction:reverse]" />
                <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-white">Running Future Simulation...</h2>
                <p className="text-purple-300/80 text-sm font-semibold animate-pulse uppercase tracking-wider">
                  Stage 1: Profile Analysis & Demographic Audit
                </p>
                <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed mt-2">
                  Please wait. Profile, Career, Finance, and Health AI agents are evaluating habit trajectories and compiling 1, 5, and 10-year timelines.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/20 text-purple-400 bg-purple-500/5 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 4 of 4 — Habit Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Declare Your Daily Routines</h1>
        <p className="text-gray-400 text-sm mt-1 max-w-xl mx-auto">
          Add both positive and negative habits. The AI simulation engine adjusts your timeline outcomes based on their consistency and compound effects.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold max-w-4xl mx-auto flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Habit Addition & Consistency Overview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Form */}
            <GlassCard className="border border-white/5 bg-slate-950/40" hoverEffect={false}>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                <span>Track New Habit</span>
              </h3>
              <p className="text-gray-400 text-xs mb-4">Register habits that shape your lifestyle.</p>
              
              <form onSubmit={handleAddHabit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Habit Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Coding study, Reading, Smoking"
                    className="w-full glass-input text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Type</label>
                    <select
                      value={type}
                      onChange={e => setType(e.target.value as any)}
                      className="w-full glass-input text-sm"
                    >
                      <option value="positive">Positive (+)</option>
                      <option value="negative">Negative (-)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Frequency</label>
                    <select
                      value={frequency}
                      onChange={e => setFrequency(e.target.value)}
                      className="w-full glass-input text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Duration (min)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="w-full glass-input text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Consistency (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={consistencyScore}
                      onChange={e => setConsistencyScore(e.target.value)}
                      className="w-full glass-input text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center gap-1 py-2.5 rounded-lg glass-btn text-white text-xs font-bold transition-all outline-none"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Habit Routine</span>
                    </>
                  )}
                </button>
              </form>
            </GlassCard>

            {/* Consistency Chart */}
            <GlassCard className="border border-white/5 bg-slate-950/40" hoverEffect={false}>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>Consistency Spread</span>
              </h3>
              <p className="text-gray-400 text-xs mb-4">Visual distribution of habit consistency values.</p>
              
              <HabitConsistencyChart habits={habits} />
            </GlassCard>
          </div>

          {/* Trigger Button Card */}
          <div className="glass-card-interactive border border-white/5 rounded-2xl p-6 bg-gradient-to-r from-purple-950/15 via-slate-950/30 to-indigo-950/15 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 max-w-xl text-left">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Ready to compile your Future Self Model?</span>
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                The simulator will process your profile metadata, assessment values, and habit consistencies to generate 3 custom pathways (Timeline A, B, C), compute burnout risk scores, and write letters from your future.
              </p>
            </div>
            <button
              onClick={handleTriggerSimulation}
              disabled={habits.length === 0}
              className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white font-extrabold text-sm shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_25px_rgba(139,92,246,0.45)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 outline-none"
            >
              <span>Run AI Future Simulation</span>
              <Play className="w-4 h-4 fill-white" />
            </button>
          </div>
        </div>

        {/* Existing Habits List (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="border border-white/5 bg-slate-950/40" hoverEffect={false}>
            <h3 className="text-lg font-bold text-white mb-1">
              Active Habits ({habits.length})
            </h3>
            <p className="text-gray-400 text-xs mb-4">Currently registered routines for modeling.</p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {habits.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs italic">
                  No habits defined. Add your first routine above (e.g. daily coding or running).
                </div>
              ) : (
                habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex gap-2.5 items-start">
                      <div className="mt-1 shrink-0">
                        {habit.type === "positive" ? (
                          <HeartHandshake className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-white leading-tight">{habit.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {habit.frequency}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {habit.duration}m
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500">Consistency</span>
                        <p className={`font-mono text-xs font-bold ${habit.consistencyScore > 75 ? "text-emerald-400" : habit.consistencyScore > 40 ? "text-indigo-400" : "text-rose-400"}`}>
                          {habit.consistencyScore}%
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="text-gray-500 hover:text-rose-400 p-1.5 rounded hover:bg-white/4 transition-all outline-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
        
      </div>
    </div>
  );
}
