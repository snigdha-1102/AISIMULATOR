"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";
import { GlassCard } from "../../components/GlassCard";
import { 
  Sparkles, HelpCircle, Send, RefreshCw, 
  CheckCircle, BarChart3, Clock, AlertTriangle 
} from "lucide-react";

export default function WhatIfPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [latestResult, setLatestResult] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [baselineScores, setBaselineScores] = useState<any | null>(null);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push("/");
      return;
    }
    loadBaseline();
    loadHistory();
  }, []);

  const loadBaseline = async () => {
    try {
      const latest = await api.getLatestSimulation();
      if (latest) {
        setBaselineScores(latest.scores);
      }
    } catch {}
  };

  const loadHistory = async () => {
    try {
      const data = await api.getWhatIfHistory();
      setHistory(data);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const result = await api.runWhatIf(query.trim());
      setLatestResult(result);
      setHistory(prev => [result, ...prev]);
      setQuery("");
    } catch (err: any) {
      setError(err.message || "What-If simulation failed to compile. Verify backend configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/20 text-purple-400 bg-purple-500/5 text-xs font-semibold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Premium Feature — What-If Simulator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Fork Your Future Timeline</h1>
        <p className="text-gray-400 text-sm mt-1 max-w-xl mx-auto">
          Type custom life decisions or pivots. The What-If Agent parses the changes and computes alternative score-deltas and chronicles.
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
        
        {/* Left Side: Input & Results (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Query Input Card */}
          <GlassCard className="border border-white/5 bg-slate-950/40" hoverEffect={false}>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Pivot Query Input</span>
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Enter any life decision, habit change, or career move you are considering.
            </p>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. What if I learn AI and switch to Product Design in 6 months?"
                className="flex-1 glass-input text-sm"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg glass-btn text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all outline-none"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Simulate</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
            
            {/* Example Queries */}
            <div className="flex flex-wrap gap-2 mt-4 text-[10px] text-gray-500">
              <span>Quick Templates:</span>
              <button onClick={() => setQuery("What if I start a side-hustle startup?")} className="hover:text-purple-400 transition-colors">"start a startup"</button>
              <span>•</span>
              <button onClick={() => setQuery("What if I move abroad to London?")} className="hover:text-purple-400 transition-colors">"move abroad"</button>
              <span>•</span>
              <button onClick={() => setQuery("What if I invest 30% of my income?")} className="hover:text-purple-400 transition-colors">"invest 30%"</button>
              <span>•</span>
              <button onClick={() => setQuery("What if I exercise daily?")} className="hover:text-purple-400 transition-colors">"exercise daily"</button>
            </div>
          </GlassCard>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {latestResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Textual Outcome Card */}
                <GlassCard className="border border-purple-500/10 bg-purple-950/5 relative overflow-hidden" hoverEffect={false}>
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="border-b border-white/5 pb-4 mb-4 text-left">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Simulated Chronicle</span>
                    <h3 className="text-lg font-extrabold text-white mt-0.5">"{latestResult.query}"</h3>
                  </div>
                  
                  <p className="text-gray-300 text-sm leading-relaxed text-left whitespace-pre-line italic bg-slate-950/40 p-4 rounded-xl border border-white/5">
                    {latestResult.outcome}
                  </p>
                </GlassCard>

                {/* Score Comparison grid */}
                <GlassCard className="border border-white/5 bg-slate-950/40" hoverEffect={false}>
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <BarChart3 className="w-4.5 h-4.5 text-indigo-400" />
                    <span>Score Impact Matrix</span>
                  </h3>
                  <p className="text-gray-400 text-xs mb-4">Comparing baseline curves against this scenario deviation.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.keys(latestResult.scoresChange).map((key) => {
                      const label = key.replace("Score", "").replace("future", "Future ");
                      const revised = latestResult.scoresChange[key];
                      const original = baselineScores ? baselineScores[key] : 70;
                      const delta = revised - original;

                      return (
                        <div key={key} className="p-4 rounded-xl bg-white/2 border border-white/5 flex flex-col justify-between text-left">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
                          <div className="flex items-end justify-between mt-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-extrabold text-white">{revised}</span>
                              <span className="text-[10px] text-gray-500">vs {original}</span>
                            </div>
                            {delta !== 0 && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                delta > 0 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                              }`}>
                                {delta > 0 ? `+${delta}` : delta}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: History Sidebar (4 columns) */}
        <div className="lg:col-span-4 space-y-6 text-left">
          <GlassCard className="border border-white/5 bg-slate-950/40" hoverEffect={false}>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Simulation Logs</span>
            </h3>
            <p className="text-gray-400 text-xs mb-4 font-normal">Past custom forks analyzed during this session.</p>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs italic">
                  No What-If logs found. Trigger your first prompt on the left.
                </div>
              ) : (
                history.map((h, i) => (
                  <button
                    key={h.id || i}
                    onClick={() => setLatestResult(h)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-300 outline-none flex gap-2.5 items-start ${
                      latestResult?.id === h.id 
                        ? "border-purple-500/40 bg-purple-950/15" 
                        : "border-white/5 bg-white/2 hover:bg-white/4"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">"{h.query}"</h4>
                      <span className="text-[9px] text-gray-500 block mt-1">
                        {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
