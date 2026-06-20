"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "../services/api";
import { Sparkles, BarChart2, Activity, HelpCircle, LogOut, ChevronRight } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");

  // Sync authentication state
  useEffect(() => {
    const checkAuth = () => {
      const auth = api.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        setEmail(localStorage.getItem("authEmail") || "User");
      }
    };
    
    // Initial check
    checkAuth();
    
    // Check periodically or on path change
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleSignOut = () => {
    api.signOut();
    setIsAuthenticated(false);
    router.push("/");
  };

  // Hide nav items on auth pages
  const isLandingPage = pathname === "/";

  return (
    <nav className="glass-panel border-b border-white/5 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 outline-none group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <span className="text-white font-extrabold tracking-wider text-sm sm:text-base bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-gray-400">
                FUTURE SELF
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          {isAuthenticated && !isLandingPage && (
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname === "/dashboard" ? "text-purple-400 font-semibold" : "text-gray-400 hover:text-white"
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/assessment"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname === "/assessment" ? "text-purple-400 font-semibold" : "text-gray-400 hover:text-white"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Life Assessment</span>
              </Link>
              <Link
                href="/habits"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname === "/habits" ? "text-purple-400 font-semibold" : "text-gray-400 hover:text-white"
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Habit Tracker</span>
              </Link>
              <Link
                href="/whatif"
                className={`flex items-center gap-1.5 transition-colors ${
                  pathname === "/whatif" ? "text-purple-400 font-semibold" : "text-gray-400 hover:text-white"
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>What-If</span>
              </Link>
            </div>
          )}

          {/* User Section / Sign Out */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-gray-400 font-medium">
                  {email.substring(0, email.indexOf("@")) || email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 text-xs font-semibold bg-rose-500/5 hover:bg-rose-500/10 transition-all outline-none"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              pathname !== "/" && (
                <Link
                  href="/"
                  className="flex items-center gap-1 px-4 py-2 rounded-lg glass-btn text-white text-xs font-bold transition-all outline-none"
                >
                  <span>Access Platform</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Subnavigation (visible only on mobile and when logged in) */}
      {isAuthenticated && !isLandingPage && (
        <div className="md:hidden flex items-center justify-around h-12 border-t border-white/5 bg-slate-950/20 text-xs px-2">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-0.5 ${
              pathname === "/dashboard" ? "text-purple-400 font-semibold" : "text-gray-400"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/assessment"
            className={`flex flex-col items-center gap-0.5 ${
              pathname === "/assessment" ? "text-purple-400 font-semibold" : "text-gray-400"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Assessment</span>
          </Link>
          <Link
            href="/habits"
            className={`flex flex-col items-center gap-0.5 ${
              pathname === "/habits" ? "text-purple-400 font-semibold" : "text-gray-400"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Habits</span>
          </Link>
          <Link
            href="/whatif"
            className={`flex flex-col items-center gap-0.5 ${
              pathname === "/whatif" ? "text-purple-400 font-semibold" : "text-gray-400"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>What-If</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
