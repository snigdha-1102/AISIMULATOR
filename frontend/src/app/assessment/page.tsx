"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";
import { GlassCard } from "../../components/GlassCard";
import { 
  User, Heart, Briefcase, DollarSign, Users, Award, 
  ChevronRight, ChevronLeft, Save, Sparkles, CheckCircle 
} from "lucide-react";

export default function AssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Demographics
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "male",
    country: "",
    education: "",
    occupation: "",
    income: "",
    relationshipStatus: "single"
  });

  // Steps 2-6: Life Assessment fields
  const [health, setHealth] = useState({
    sleepHours: 7,
    exerciseFrequency: "3-4-times-a-week",
    waterIntake: 2,
    dietQuality: "average",
    stressLevel: "moderate"
  });

  const [career, setCareer] = useState({
    currentRole: "",
    experience: "",
    skills: "", // Will split by comma
    certifications: "", // Will split by comma
    learningHabits: "Read articles occasionally"
  });

  const [finance, setFinance] = useState({
    savings: "",
    investments: "",
    debt: "",
    monthlySpending: ""
  });

  const [relationships, setRelationships] = useState({
    familyConnection: "moderate",
    friends: "few",
    socialActivity: "moderate"
  });

  const [growth, setGrowth] = useState({
    booksRead: 4,
    coursesCompleted: 2,
    productivityLevel: "moderate"
  });

  const [goals, setGoals] = useState({
    careerGoals: "",
    financialGoals: "",
    healthGoals: "",
    personalGoals: ""
  });

  // Enforce authentication check
  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push("/");
    } else {
      // Pre-populate if they already filled out profile/assessment
      const loadExisting = async () => {
        try {
          const existingProfile = await api.getProfile();
          if (existingProfile) {
            setProfile({
              name: existingProfile.name || "",
              age: String(existingProfile.age || ""),
              gender: existingProfile.gender || "male",
              country: existingProfile.country || "",
              education: existingProfile.education || "",
              occupation: existingProfile.occupation || "",
              income: String(existingProfile.income || ""),
              relationshipStatus: existingProfile.relationshipStatus || "single"
            });
          }
          const existingAssessment = await api.getAssessment();
          if (existingAssessment) {
            setHealth(existingAssessment.health || health);
            setCareer({
              currentRole: existingAssessment.career?.currentRole || "",
              experience: String(existingAssessment.career?.experience || ""),
              skills: existingAssessment.career?.skills?.join(", ") || "",
              certifications: existingAssessment.career?.certifications?.join(", ") || "",
              learningHabits: existingAssessment.career?.learningHabits || ""
            });
            setFinance({
              savings: String(existingAssessment.finance?.savings || ""),
              investments: String(existingAssessment.finance?.investments || ""),
              debt: String(existingAssessment.finance?.debt || ""),
              monthlySpending: String(existingAssessment.finance?.monthlySpending || "")
            });
            setRelationships(existingAssessment.relationships || relationships);
            setGrowth(existingAssessment.growth || growth);
            setGoals(existingAssessment.goals || goals);
          }
        } catch {}
      };
      loadExisting();
    }
  }, []);

  const nextStep = () => {
    // Basic validation
    if (currentStep === 1) {
      if (!profile.name || !profile.age || !profile.occupation) {
        setError("Name, Age, and Occupation are required.");
        return;
      }
    }
    setError("");
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setError("");
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Save profile
      await api.saveProfile({
        ...profile,
        age: Number(profile.age),
        income: Number(profile.income || 0)
      });

      // 2. Save Assessment
      const parsedSkills = career.skills.split(",").map(s => s.trim()).filter(Boolean);
      const parsedCerts = career.certifications.split(",").map(c => c.trim()).filter(Boolean);
      
      const assessmentData = {
        health,
        career: {
          ...career,
          experience: Number(career.experience || 0),
          skills: parsedSkills,
          certifications: parsedCerts
        },
        finance: {
          income: Number(profile.income || 0),
          savings: Number(finance.savings || 0),
          investments: Number(finance.investments || 0),
          debt: Number(finance.debt || 0),
          monthlySpending: Number(finance.monthlySpending || 0)
        },
        relationships,
        growth,
        goals
      };

      await api.saveAssessment(assessmentData);
      
      // Navigate to Habit Tracker Step
      router.push("/habits");

    } catch (err: any) {
      setError(err.message || "Failed to save assessment profile");
    } finally {
      setLoading(false);
    }
  };

  const stepsMeta = [
    { title: "Profile", icon: User },
    { title: "Health", icon: Heart },
    { title: "Career", icon: Briefcase },
    { title: "Finance", icon: DollarSign },
    { title: "Growth", icon: Users },
    { title: "Goals", icon: Award }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-purple-500/20 text-purple-400 bg-purple-500/5 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 3 of 4 — Life Assessment Wizard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Map Your Present Self</h1>
        <p className="text-gray-400 text-sm mt-1 max-w-xl mx-auto">
          Provide detailed inputs about your lifestyle metrics. The multi-agent simulator analyzes these values to project your financial, biological, and vocational curves.
        </p>
      </div>

      {/* Progress Stepper Bar */}
      <div className="flex justify-between items-center mb-8 px-4">
        {stepsMeta.map((s, idx) => {
          const Icon = s.icon;
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center relative z-10">
                <button
                  onClick={() => stepNum < currentStep && setCurrentStep(stepNum)}
                  disabled={stepNum >= currentStep}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    isActive 
                      ? "border-purple-500 bg-purple-950/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                      : isCompleted
                      ? "border-emerald-500 bg-emerald-950/20 text-emerald-400"
                      : "border-white/5 bg-white/2 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </button>
                <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${isActive ? "text-purple-400" : isCompleted ? "text-emerald-400" : "text-gray-500"}`}>
                  {s.title}
                </span>
              </div>
              {idx < stepsMeta.length - 1 && (
                <div className={`flex-1 h-[2px] mx-2 -mt-6 transition-all duration-500 ${currentStep > stepNum ? "bg-emerald-500/40" : "bg-white/5"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Area */}
      <GlassCard className="border border-white/5 bg-slate-950/40 relative overflow-hidden" hoverEffect={false}>
        {error && (
          <div className="p-3 mb-6 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* STEP 1: DEMOGRAPHICS */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-white mb-1">Personal Demographics</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Provide basic details to establish your profile.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Alex"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={e => setProfile({ ...profile, age: e.target.value })}
                  placeholder="e.g. 28"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Gender</label>
                <select
                  value={profile.gender}
                  onChange={e => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full glass-input text-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-Binary</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Country of Residence</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={e => setProfile({ ...profile, country: e.target.value })}
                  placeholder="e.g. United States"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Education Level</label>
                <input
                  type="text"
                  value={profile.education}
                  onChange={e => setProfile({ ...profile, education: e.target.value })}
                  placeholder="e.g. Bachelor's in CS"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Current Occupation</label>
                <input
                  type="text"
                  value={profile.occupation}
                  onChange={e => setProfile({ ...profile, occupation: e.target.value })}
                  placeholder="e.g. Product Manager"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Annual Income ($ USD)</label>
                <input
                  type="number"
                  value={profile.income}
                  onChange={e => setProfile({ ...profile, income: e.target.value })}
                  placeholder="e.g. 75000"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Relationship Status</label>
                <select
                  value={profile.relationshipStatus}
                  onChange={e => setProfile({ ...profile, relationshipStatus: e.target.value })}
                  className="w-full glass-input text-sm"
                >
                  <option value="single">Single</option>
                  <option value="relationship">In a Relationship</option>
                  <option value="married">Married</option>
                  <option value="complicated">It's Complicated</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: HEALTH */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-white mb-1">Biological & Health Outlook</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Provide basic details to establish your physical and mental baseline.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Average Sleep Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={health.sleepHours}
                  onChange={e => setHealth({ ...health, sleepHours: Number(e.target.value) })}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Exercise Frequency</label>
                <select
                  value={health.exerciseFrequency}
                  onChange={e => setHealth({ ...health, exerciseFrequency: e.target.value })}
                  className="w-full glass-input text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="3-4-times-a-week">3-4 times a week</option>
                  <option value="1-2-times-a-week">1-2 times a week</option>
                  <option value="rarely">Rarely / Sedentary</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Water Intake (Liters/day)</label>
                <input
                  type="number"
                  step="0.5"
                  value={health.waterIntake}
                  onChange={e => setHealth({ ...health, waterIntake: Number(e.target.value) })}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Diet Quality</label>
                <select
                  value={health.dietQuality}
                  onChange={e => setHealth({ ...health, dietQuality: e.target.value })}
                  className="w-full glass-input text-sm"
                >
                  <option value="excellent">Excellent (Whole foods, strict boundaries)</option>
                  <option value="average">Average (Balanced, some processed items)</option>
                  <option value="poor">Poor (Fast food dominant, irregular)</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Stress Level</label>
                <select
                  value={health.stressLevel}
                  onChange={e => setHealth({ ...health, stressLevel: e.target.value })}
                  className="w-full glass-input text-sm"
                >
                  <option value="low">Low (Relaxed lifestyle, manageable strain)</option>
                  <option value="moderate">Moderate (Standard work pressure)</option>
                  <option value="high">High (Constant anxiety, heavy burden)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: CAREER */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-white mb-1">Vocational & Career Status</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Map your professional capabilities, skill matrices, and certifications.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Specific Role Title</label>
                <input
                  type="text"
                  value={career.currentRole}
                  onChange={e => setCareer({ ...career, currentRole: e.target.value })}
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Professional Experience (Years)</label>
                <input
                  type="number"
                  value={career.experience}
                  onChange={e => setCareer({ ...career, experience: e.target.value })}
                  placeholder="e.g. 5"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Skill Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={career.skills}
                  onChange={e => setCareer({ ...career, skills: e.target.value })}
                  placeholder="React, Typescript, AWS, NodeJS, Product Strategy"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Certifications (Comma-separated)</label>
                <input
                  type="text"
                  value={career.certifications}
                  onChange={e => setCareer({ ...career, certifications: e.target.value })}
                  placeholder="AWS Solutions Architect, PMP, Scrum Master"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Daily Study / Learning Habits</label>
                <input
                  type="text"
                  value={career.learningHabits}
                  onChange={e => setCareer({ ...career, learningHabits: e.target.value })}
                  placeholder="Read articles for 30 minutes every morning"
                  className="w-full glass-input text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 4: FINANCE */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-white mb-1">Financial Metrics</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Map your wealth holdings, debt profiles, and spending thresholds.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Total Savings ($ USD)</label>
                <input
                  type="number"
                  value={finance.savings}
                  onChange={e => setFinance({ ...finance, savings: e.target.value })}
                  placeholder="e.g. 15000"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Total Investments ($ USD)</label>
                <input
                  type="number"
                  value={finance.investments}
                  onChange={e => setFinance({ ...finance, investments: e.target.value })}
                  placeholder="e.g. 25000"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Total Outstanding Debt ($ USD)</label>
                <input
                  type="number"
                  value={finance.debt}
                  onChange={e => setFinance({ ...finance, debt: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Monthly Spending ($ USD)</label>
                <input
                  type="number"
                  value={finance.monthlySpending}
                  onChange={e => setFinance({ ...finance, monthlySpending: e.target.value })}
                  placeholder="e.g. 3500"
                  className="w-full glass-input text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 5: GROWTH & RELATIONSHIPS */}
          {currentStep === 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-white mb-1">Relationships & Growth Metrics</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Map your connections, social settings, and continuous improvement indicators.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Family Connection Strength</label>
                <select
                  value={relationships.familyConnection}
                  onChange={e => setRelationships({ ...relationships, familyConnection: e.target.value })}
                  className="w-full glass-input text-sm"
                >
                  <option value="strong">Strong (Frequent contact, supportive)</option>
                  <option value="moderate">Moderate (Standard contacts, friendly)</option>
                  <option value="weak">Weak / Distant</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Friend Group Scale</label>
                <select
                  value={relationships.friends}
                  onChange={e => setRelationships({ ...relationships, friends: e.target.value })}
                  className="w-full glass-input text-sm"
                >
                  <option value="many">Large circle (Active social scene)</option>
                  <option value="few">Few close friends (Quality over quantity)</option>
                  <option value="none">Isolated / Rebuilding</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Books Read (Last 12 Months)</label>
                <input
                  type="number"
                  value={growth.booksRead}
                  onChange={e => setGrowth({ ...growth, booksRead: Number(e.target.value) })}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Courses/Bootcamps Completed</label>
                <input
                  type="number"
                  value={growth.coursesCompleted}
                  onChange={e => setGrowth({ ...growth, coursesCompleted: Number(e.target.value) })}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Self-Perceived Productivity Level</label>
                <select
                  value={growth.productivityLevel}
                  onChange={e => setGrowth({ ...growth, productivityLevel: e.target.value })}
                  className="w-full glass-input text-sm"
                >
                  <option value="high">High (Structured tasks, minimal friction)</option>
                  <option value="moderate">Moderate (Standard productivity, some procrastination)</option>
                  <option value="low">Low (Heavy procrastination, unfocused)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 6: GOALS */}
          {currentStep === 6 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-white mb-1">Target Goals (10-Year Horizon)</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Establish the reference targets so the AI Coach evaluates performance gaps.</p>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Career Goals</label>
                <input
                  type="text"
                  value={goals.careerGoals}
                  onChange={e => setGoals({ ...goals, careerGoals: e.target.value })}
                  placeholder="e.g. Become a CTO or start a tech consulting firm"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Financial Goals</label>
                <input
                  type="text"
                  value={goals.financialGoals}
                  onChange={e => setGoals({ ...goals, financialGoals: e.target.value })}
                  placeholder="e.g. Achieve financial independence with $1M in investments"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Health Goals</label>
                <input
                  type="text"
                  value={goals.healthGoals}
                  onChange={e => setGoals({ ...goals, healthGoals: e.target.value })}
                  placeholder="e.g. Maintain athletic stamina, exercise 4x weekly"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Personal/Growth Goals</label>
                <input
                  type="text"
                  value={goals.personalGoals}
                  onChange={e => setGoals({ ...goals, personalGoals: e.target.value })}
                  placeholder="e.g. Publish a technical handbook, read 24 books annually"
                  className="w-full glass-input text-sm"
                />
              </div>
            </div>
          )}

          {/* Nav Controls */}
          <div className="flex justify-between items-center border-t border-white/5 pt-6 mt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
              className="flex items-center gap-1 px-4 py-2.5 rounded-lg glass-btn-secondary text-gray-400 hover:text-white text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed outline-none"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1 px-5 py-2.5 rounded-lg glass-btn text-white text-xs font-bold transition-all outline-none"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-[0_4px_15px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition-all outline-none"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profiles & Proceed</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </GlassCard>
    </div>
  );
}
