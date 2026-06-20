"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Inline type to avoid importing from the backend
interface FutureStory {
  timeline: "A" | "B" | "C";
  years: 1 | 5 | 10;
  career: string;
  income: number;
  lifestyle: string;
  relationships: string;
  health: string;
  mentalState: string;
  achievements: string[];
  failures: string[];
  unexpectedEvent: string;
}
import { Briefcase, Heart, Award, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

interface TimelineViewProps {
  stories: FutureStory[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ stories }) => {
  const [activeTimeline, setActiveTimeline] = useState<"A" | "B" | "C">("B");

  const timelineConfig = {
    A: {
      label: "Timeline A (Current)",
      desc: "If you continue with your current habits, saving rates, and stress patterns.",
      color: "border-rose-500/30 text-rose-400 bg-rose-500/5",
      badge: "border-rose-500/20 text-rose-400 bg-rose-500/10",
      accent: "#f43f5e"
    },
    B: {
      label: "Timeline B (+20%)",
      desc: "If you improve learning, sleep, exercise, and saving habits moderately (+20%).",
      color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/5",
      badge: "border-indigo-500/20 text-indigo-400 bg-indigo-500/10",
      accent: "#6366f1"
    },
    C: {
      label: "Timeline C (Aggressive)",
      desc: "If you optimize routines aggressively—daily coding/learning, diet, and compound saving.",
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
      badge: "border-emerald-500/20 text-emerald-400 bg-emerald-500/10",
      accent: "#10b981"
    }
  };

  // Filter and sort stories for the active timeline (1yr, 5yr, 10yr)
  const currentStories = stories
    .filter(s => s.timeline === activeTimeline)
    .sort((a, b) => a.years - b.years);

  return (
    <div className="w-full">
      {/* Selector Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {(["A", "B", "C"] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTimeline(t)}
            className={`flex-1 text-left p-4 rounded-xl border transition-all duration-300 outline-none ${
              activeTimeline === t
                ? `border-[rgba(139,92,246,0.6)] bg-purple-950/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]`
                : "border-white/5 bg-white/2 hover:bg-white/4"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm tracking-wide uppercase">{timelineConfig[t].label}</span>
              <span className={`text-xs px-2 py-0.5 rounded border ${timelineConfig[t].badge}`}>
                {t === "A" ? "Baseline" : t === "B" ? "Recommended" : "Accelerated"}
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">{timelineConfig[t].desc}</p>
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l border-white/10 pl-6 md:pl-10 ml-4 space-y-12">
        <AnimatePresence mode="wait">
          {currentStories.map((story, index) => (
            <motion.div
              key={`${activeTimeline}-${story.years}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              {/* Chronological Circle Indicator */}
              <div
                className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full border-2 bg-slate-950 flex items-center justify-center"
                style={{ borderColor: timelineConfig[activeTimeline].accent }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: timelineConfig[activeTimeline].accent }}
                />
              </div>

              {/* Story Content Block */}
              <div className="glass-card-interactive rounded-2xl p-6 border border-white/5 bg-slate-950/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-4 mb-4">
                  <div>
                    <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Milestone Projection</span>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">
                      {story.years} Year Future ({2026 + story.years})
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Projected Income</span>
                    <p className="text-lg font-mono font-bold text-emerald-400">
                      ${story.income.toLocaleString()}/yr
                    </p>
                  </div>
                </div>

                {/* Grid for Life Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Career & Lifestyle */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Briefcase className="w-4 h-4 text-purple-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Career Path</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{story.career}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Lifestyle & Environment</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{story.lifestyle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Health & Relationships */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Health & Well-being</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{story.health}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Mental State</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{story.mentalState}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accomplishments & Events Footer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-4 text-xs">
                  {/* Achievements */}
                  <div className="md:col-span-1">
                    <div className="flex items-center gap-1.5 mb-1.5 text-emerald-400 font-bold">
                      <Award className="w-3.5 h-3.5" />
                      <span>Key Achievements</span>
                    </div>
                    <ul className="space-y-1 text-gray-400 list-disc list-inside">
                      {story.achievements.length > 0 ? (
                        story.achievements.map((a, i) => <li key={i}>{a}</li>)
                      ) : (
                        <li>Steady baseline maintenance</li>
                      )}
                    </ul>
                  </div>

                  {/* Failures */}
                  <div className="md:col-span-1">
                    <div className="flex items-center gap-1.5 mb-1.5 text-rose-400 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Potential Setbacks</span>
                    </div>
                    <ul className="space-y-1 text-gray-400 list-disc list-inside">
                      {story.failures.length > 0 ? (
                        story.failures.map((f, i) => <li key={i}>{f}</li>)
                      ) : (
                        <li>No major setbacks predicted</li>
                      )}
                    </ul>
                  </div>

                  {/* Unexpected Event */}
                  <div className="md:col-span-1 bg-white/2 rounded-lg p-2.5 border border-white/5">
                    <h5 className="font-bold text-purple-300 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>Unexpected Event</span>
                    </h5>
                    <p className="text-gray-400 leading-relaxed">{story.unexpectedEvent}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TimelineView;
