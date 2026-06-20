"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { GlassCard } from "../components/GlassCard";
import {
  Sparkles, Mail, ArrowRight, ChevronRight, Activity, Cpu,
  ShieldCheck, RefreshCw, CheckCircle, KeyRound, AlertTriangle
} from "lucide-react";

type AuthStep = "email" | "otp" | "success";

export default function LandingPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isAlreadyAuth, setIsAlreadyAuth] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (api.isAuthenticated()) setIsAlreadyAuth(true);
  }, []);

  // Countdown for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // --- STEP 1: Send OTP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await api.sendOtp(email);
      setStep("otp");
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- OTP input handlers ---
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // single digit
    setOtp(newOtp);
    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 filled
    if (newOtp.every((d) => d !== "") && value) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
      handleVerifyOtp(pasted);
    }
  };

  // --- STEP 2: Verify OTP ---
  const handleVerifyOtp = async (otpString?: string) => {
    const code = otpString || otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.verifyOtp(email, code);
      setStep("success");
      setSuccessMsg("Authenticated! Redirecting to your dashboard...");
      setTimeout(async () => {
        try {
          await api.getProfile();
          router.push("/dashboard");
        } catch {
          router.push("/assessment");
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // --- Resend OTP ---
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      await api.sendOtp(email);
      setResendCooldown(60);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-10rem)]">

      {/* LEFT: Product Hero */}
      <div className="lg:col-span-7 space-y-6 text-left">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/20 text-purple-400 bg-purple-500/5 text-xs font-semibold uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen AI Life Simulation Core</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
        >
          Simulate your{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">
            destiny
          </span>{" "}
          based on your habits
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl"
        >
          Your daily habits dictate your 10-year trajectory. Future Self Simulator
          aggregates 10 AI Agents to analyze your routines and write detailed chronicles
          of your possible futures — Career, Health, Finance, and beyond.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4"
        >
          {[
            { icon: Cpu, color: "text-purple-400", title: "Multi-Agent Projection", desc: "Health, Career & Finance specialists run simultaneous analysis pipelines." },
            { icon: Activity, color: "text-indigo-400", title: "Timeline A, B, C Engine", desc: "Compare current routines against +20% and fully optimized micro-habit paths." },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/2 border border-white/5 flex items-center justify-center shrink-0">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">{title}</h3>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {isAlreadyAuth && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pt-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="glass-btn flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

      {/* RIGHT: Auth Card */}
      <div className="lg:col-span-5 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-indigo-600/10 blur-xl rounded-3xl" />

        <GlassCard className="relative border border-white/5" delay={0.2} hoverEffect={false}>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            {(["email", "otp", "success"] as AuthStep[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-500 ${step === s || (s === "email" && step !== "email") || (s === "otp" && step === "success") ? "bg-purple-500 text-white" : "bg-white/5 text-gray-500"}`}>
                  {(s === "email" && step !== "email") || (s === "otp" && step === "success") ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 rounded transition-all duration-500 ${(i === 0 && step !== "email") || (i === 1 && step === "success") ? "bg-purple-500" : "bg-white/5"}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ---- STEP 1: Email Input ---- */}
            {step === "email" && (
              <motion.div key="email-step" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Secure OTP Sign-In</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">Enter your email</h2>
                  <p className="text-gray-400 text-xs mt-1">
                    We'll send a one-time code. No password needed — ever.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                      <input
                        id="email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full glass-input pl-10 text-sm"
                        required
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-lg glass-btn text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send One-Time Code</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 mt-6 pt-4 border-t border-white/5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>No passwords stored. OTP-only secure authentication.</span>
                </div>
              </motion.div>
            )}

            {/* ---- STEP 2: OTP Input ---- */}
            {step === "otp" && (
              <motion.div key="otp-step" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Enter OTP</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">Check your inbox</h2>
                  <p className="text-gray-400 text-xs mt-1">
                    We sent a 6-digit code to{" "}
                    <span className="text-purple-300 font-semibold">{email}</span>
                  </p>
                </div>

                {/* 6-box OTP input */}
                <div className="flex gap-2 justify-center mb-6" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border transition-all duration-200 outline-none bg-white/5 text-white
                        ${digit ? "border-purple-500 bg-purple-500/10 shadow-[0_0_12px_rgba(139,92,246,0.2)]" : "border-white/10 focus:border-purple-500/60 focus:bg-white/8"}`}
                      disabled={loading}
                    />
                  ))}
                </div>

                <button
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.some((d) => d === "")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg glass-btn text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Sign In</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between mt-4 text-xs">
                  <button
                    onClick={() => { setStep("email"); setError(""); setOtp(["","","","","",""]); }}
                    className="text-gray-500 hover:text-gray-300 transition-colors outline-none"
                  >
                    ← Change email
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="text-purple-400 hover:text-purple-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors font-semibold outline-none"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>

                <p className="text-[10px] text-gray-600 text-center mt-4">
                  OTP expires in 10 minutes. Check spam folder if not received.
                </p>
              </motion.div>
            )}

            {/* ---- STEP 3: Success ---- */}
            {step === "success" && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h2 className="text-xl font-extrabold text-white">Authentication Successful!</h2>
                <p className="text-gray-400 text-sm">{successMsg}</p>
                <div className="flex items-center justify-center gap-2 text-purple-400 text-xs animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Initializing your simulation environment...</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}
