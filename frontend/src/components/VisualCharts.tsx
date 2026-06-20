"use client";

import React, { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// Mounting helper to avoid SSR mismatch
const withSSRCheck = <P extends object>(Component: React.ComponentType<P>) => {
  return function SSRCheckedComponent(props: P) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return (
        <div className="w-full h-[300px] flex items-center justify-center rounded-xl bg-slate-950/20 border border-white/5">
          <div className="text-gray-400 text-sm animate-pulse">Initializing Visualization Core...</div>
        </div>
      );
    }
    return <Component {...props} />;
  };
};

// 1. RADAR CHART: FUTURE READINESS SCORES
interface RadarData {
  healthScore: number;
  careerScore: number;
  financeScore: number;
  relationshipScore: number;
  growthScore: number;
}

export const ReadinessRadar = withSSRCheck(({ scores }: { scores: RadarData }) => {
  const data = [
    { subject: "Health", score: scores.healthScore },
    { subject: "Career", score: scores.careerScore },
    { subject: "Finance", score: scores.financeScore },
    { subject: "Relationships", score: scores.relationshipScore },
    { subject: "Personal Growth", score: scores.growthScore },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </radialGradient>
        </defs>
        <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6b7280" }} axisLine={false} />
        <Radar
          name="Future Readiness"
          dataKey="score"
          stroke="#8b5cf6"
          fill="url(#radarGlow)"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
});

// 2. LINE CHART: FINANCE / WEALTH TRAJECTORY OVER YEARS
interface TrajectoryData {
  year: string;
  "Timeline A (Current)": number;
  "Timeline B (+20%)": number;
  "Timeline C (Optimized)": number;
}

export const FinanceProjection = withSSRCheck(({ startIncome, startSavings }: { startIncome: number; startSavings: number }) => {
  // Synthesize timeline trajectories based on values
  const data: TrajectoryData[] = [
    {
      year: "Present",
      "Timeline A (Current)": startSavings,
      "Timeline B (+20%)": startSavings,
      "Timeline C (Optimized)": startSavings,
    },
    {
      year: "Year 1",
      "Timeline A (Current)": Math.round(startSavings + (startIncome * 0.1)),
      "Timeline B (+20%)": Math.round(startSavings + (startIncome * 0.15)),
      "Timeline C (Optimized)": Math.round(startSavings + (startIncome * 0.25)),
    },
    {
      year: "Year 5",
      "Timeline A (Current)": Math.round(startSavings + (startIncome * 0.1 * 5 * 1.05)),
      "Timeline B (+20%)": Math.round(startSavings + (startIncome * 0.18 * 5 * 1.15)),
      "Timeline C (Optimized)": Math.round(startSavings + (startIncome * 0.3 * 5 * 1.3)),
    },
    {
      year: "Year 10",
      "Timeline A (Current)": Math.round(startSavings + (startIncome * 0.1 * 10 * 1.1)),
      "Timeline B (+20%)": Math.round(startSavings + (startIncome * 0.2 * 10 * 1.35)),
      "Timeline C (Optimized)": Math.round(startSavings + (startIncome * 0.35 * 10 * 1.7)),
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
        <XAxis dataKey="year" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} />
        <YAxis 
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
          tick={{ fill: "#9ca3af", fontSize: 11 }} 
          axisLine={false} 
        />
        <Tooltip
          contentStyle={{ background: "rgba(10, 11, 18, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px" }}
          labelStyle={{ color: "#fff", fontWeight: "bold" }}
          formatter={(value: any) => [`$${value.toLocaleString()}`, "Savings"]}
        />
        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
        <Line type="monotone" dataKey="Timeline A (Current)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="Timeline B (+20%)" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="Timeline C (Optimized)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
});

// 3. BAR CHART: TIMELINE COMPARISON
export const TimelineCompareBar = withSSRCheck(({ readinessScore, healthScore, careerScore, financeScore }: { readinessScore: number, healthScore: number, careerScore: number, financeScore: number }) => {
  const data = [
    {
      metric: "Readiness",
      "Timeline A (Current)": Math.max(20, Math.round(readinessScore - 10)),
      "Timeline B (+20%)": readinessScore,
      "Timeline C (Optimized)": Math.min(100, Math.round(readinessScore + 12)),
    },
    {
      metric: "Health Score",
      "Timeline A (Current)": Math.max(15, Math.round(healthScore - 8)),
      "Timeline B (+20%)": healthScore,
      "Timeline C (Optimized)": Math.min(100, Math.round(healthScore + 15)),
    },
    {
      metric: "Career Growth",
      "Timeline A (Current)": Math.max(20, Math.round(careerScore - 15)),
      "Timeline B (+20%)": careerScore,
      "Timeline C (Optimized)": Math.min(100, Math.round(careerScore + 20)),
    },
    {
      metric: "Wealth Score",
      "Timeline A (Current)": Math.max(10, Math.round(financeScore - 12)),
      "Timeline B (+20%)": financeScore,
      "Timeline C (Optimized)": Math.min(100, Math.round(financeScore + 25)),
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
        <XAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "rgba(10, 11, 18, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px" }}
          labelStyle={{ color: "#fff" }}
        />
        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
        <Bar dataKey="Timeline A (Current)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Timeline B (+20%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Timeline C (Optimized)" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});

// 4. BAR CHART: RISK ANALYSIS (Burnout, Stagnation, etc.)
export const RiskAnalysisBar = withSSRCheck(({ probabilities }: { probabilities: any }) => {
  const data = [
    { risk: "Burnout", Probability: probabilities.burnout, color: "#ef4444" },
    { risk: "Career Stagnate", Probability: probabilities.careerChange ? 100 - probabilities.promotion : 50, color: "#f59e0b" },
    { risk: "Health Decline", Probability: 100 - probabilities.healthImprovement, color: "#ec4899" },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart layout="vertical" data={data} margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} />
        <YAxis type="category" dataKey="risk" tick={{ fill: "#f3f4f6", fontSize: 11 }} width={100} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "rgba(10, 11, 18, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
          labelStyle={{ color: "#fff" }}
        />
        <Bar dataKey="Probability" radius={[0, 4, 4, 0]} fill="#ff3366">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

// 5. BAR CHART: HABIT CONSISTENCY
export const HabitConsistencyChart = withSSRCheck(({ habits }: { habits: any[] }) => {
  if (!habits || habits.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-gray-500 italic">
        No habits tracked yet.
      </div>
    );
  }

  const data = habits.map(h => ({
    name: h.name.substring(0, 15),
    Consistency: h.consistencyScore,
    type: h.type
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: "rgba(10, 11, 18, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
        />
        <Bar dataKey="Consistency" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});
