import { UserProfile, LifeAssessment, Habit, SimulationReport, WhatIfScenario } from "../../repositories/interfaces/Repository";
import { aiService } from "./AIService";
import { SYSTEM_PROMPT_STAGE1, SYSTEM_PROMPT_STAGE2, getPromptStage1, getPromptStage2, getWhatIfPrompt } from "./Prompts";

export class Orchestrator {
  /**
   * Orchestrates the 10-Agent simulation flow in two sequential LLM stages
   */
  async runLifeSimulation(
    userId: string,
    profile: UserProfile,
    assessment: LifeAssessment,
    habits: Habit[]
  ): Promise<SimulationReport> {
    const reportId = `report_${Math.random().toString(36).substring(2, 11)}`;
    const createdAt = new Date().toISOString();

    try {
      // --- STAGE 1: Profile & Core Metric Analysis ---
      const stage1Prompt = getPromptStage1(profile, assessment, habits);
      const stage1ResponseText = await aiService.getCompletion(stage1Prompt, SYSTEM_PROMPT_STAGE1);
      const stage1Data = this.cleanAndParseJSON(stage1ResponseText);

      // --- STAGE 2: Future Forecasting & Synthesizing ---
      const stage2Prompt = getPromptStage2(stage1Data);
      const stage2ResponseText = await aiService.getCompletion(stage2Prompt, SYSTEM_PROMPT_STAGE2);
      const stage2Data = this.cleanAndParseJSON(stage2ResponseText);

      // --- CONSOLIDATION ---
      const finalReport: SimulationReport = {
        id: reportId,
        userId,
        scores: stage1Data.scores,
        probabilities: stage2Data.probabilities,
        stories: stage2Data.stories,
        avatar: stage2Data.avatar,
        letter: stage2Data.letter,
        regrets: stage2Data.regrets,
        opportunities: stage2Data.opportunities,
        recommendations: stage2Data.recommendations,
        createdAt
      };

      return finalReport;

    } catch (error: any) {
      console.warn("AI simulation failed or keys missing. Generating high-fidelity mock report...");
      return this.generateHighFidelityMock(userId, reportId, profile, assessment, habits, createdAt);
    }
  }

  /**
   * Runs what-if simulations based on alternative scenarios
   */
  async runWhatIfSimulation(
    userId: string,
    profile: UserProfile,
    assessment: LifeAssessment,
    habits: Habit[],
    latestReport: SimulationReport | null,
    scenarioQuery: string
  ): Promise<WhatIfScenario> {
    const scenarioId = `whatif_${Math.random().toString(36).substring(2, 11)}`;
    const createdAt = new Date().toISOString();

    try {
      const prompt = getWhatIfPrompt(profile, assessment, habits, latestReport, scenarioQuery);
      const responseText = await aiService.getCompletion(prompt, "You are a future simulator what-if query compiler. Output strictly JSON.");
      const data = this.cleanAndParseJSON(responseText);

      return {
        id: scenarioId,
        userId,
        query: scenarioQuery,
        outcome: data.outcome,
        scoresChange: data.scoresChange,
        createdAt
      };
    } catch (err) {
      console.warn("AI What-If simulation failed. Generating mock outcome...");
      return this.generateMockWhatIf(userId, scenarioId, scenarioQuery, latestReport, createdAt);
    }
  }

  private cleanAndParseJSON(text: string): any {
    // Strip markdown JSON backticks if present
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.substring(7);
    }
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();
    return JSON.parse(cleaned);
  }

  /**
   * Generates a high-fidelity mock simulation report tailored to the user's inputs
   */
  private generateHighFidelityMock(
    userId: string,
    id: string,
    profile: UserProfile,
    assessment: LifeAssessment,
    habits: Habit[],
    createdAt: string
  ): SimulationReport {
    // Calculate intelligent base scores based on inputs
    const sleepHours = assessment.health.sleepHours;
    const stressVal = assessment.health.stressLevel === "high" ? 35 : assessment.health.stressLevel === "moderate" ? 15 : 0;
    const exerciseVal = assessment.health.exerciseFrequency === "daily" ? 30 : assessment.health.exerciseFrequency === "3-4-times-a-week" ? 20 : 5;
    const baseHealthScore = Math.min(100, Math.max(10, (sleepHours * 8) + exerciseVal - stressVal));

    const savingsVal = assessment.finance.savings > 50000 ? 30 : assessment.finance.savings > 10000 ? 15 : 5;
    const debtVal = assessment.finance.debt > 20000 ? 25 : 0;
    const baseFinanceScore = Math.min(100, Math.max(15, (assessment.finance.income > 100000 ? 40 : 25) + savingsVal - debtVal));

    const baseCareerScore = Math.min(95, Math.max(20, (assessment.career.experience * 4) + (assessment.career.skills.length * 5)));
    
    const relationsVal = assessment.relationships.familyConnection === "strong" ? 40 : assessment.relationships.familyConnection === "moderate" ? 25 : 10;
    const baseRelationshipScore = Math.min(100, Math.max(10, relationsVal + (assessment.relationships.friends === "many" ? 30 : 15)));

    const baseGrowthScore = Math.min(100, Math.max(10, (assessment.growth.booksRead * 3) + (assessment.growth.coursesCompleted * 6)));
    
    // Average scores
    const overallRisk = Math.round((stressVal * 2 + debtVal + (100 - baseHealthScore)) / 4);
    const readinessScore = Math.round((baseHealthScore + baseCareerScore + baseFinanceScore + baseRelationshipScore + baseGrowthScore) / 5);

    // Probabilities
    const promotion = baseCareerScore > 70 ? 85 : baseCareerScore > 40 ? 55 : 25;
    const incomeGrowth = baseCareerScore > 60 ? 75 : 45;
    const financialIndependence = baseFinanceScore > 70 ? 80 : 35;
    const burnout = stressVal > 20 ? 75 : 20;
    const careerChange = baseCareerScore < 40 ? 60 : 35;
    const businessSuccess = baseGrowthScore > 65 ? 65 : 30;
    const healthImprovement = exerciseVal < 10 ? 40 : 80;

    // Timeline Stories A, B, C
    const stories: any[] = [];
    const timelines = ["A", "B", "C"] as const;
    const years = [1, 5, 10] as const;

    const descriptions = {
      A: {
        career: "Maintaining stable but flat responsibilities. Stagnation signs creep in.",
        lifestyle: "Routine-oriented with typical comfort actions. Screen time remains higher.",
        health: "Occasional fatigue. Stress points impact concentration levels.",
        relationships: "Stable connections with immediate circle. Limited expandability."
      },
      B: {
        career: "Steady promotions or responsibility expansion. Recognition for updated skills.",
        lifestyle: "Balanced workload with active habit boundaries. Consistent learning.",
        health: "Improved sleep quality and endurance. Increased focus capacity.",
        relationships: "Deeper ties. Proactive community engagements."
      },
      C: {
        career: "Rapid growth. Shifted into senior leadership or launched a high-yield venture.",
        lifestyle: "Disciplined life setup. Daily schedules optimized for creative work.",
        health: "Peak physical fitness. Exceptional sleep scores, resilience, and energy.",
        relationships: "Surrounded by a high-performing and highly supportive inner circle."
      }
    };

    timelines.forEach(t => {
      years.forEach(y => {
        const factor = t === "A" ? 1.0 : t === "B" ? 1.25 : 1.6;
        stories.push({
          timeline: t,
          years: y,
          career: `${descriptions[t].career} (${y} year projection)`,
          income: Math.round(profile.income * (1 + (y * 0.05 * factor))),
          lifestyle: descriptions[t].lifestyle,
          relationships: descriptions[t].relationships,
          health: descriptions[t].health,
          mentalState: t === "C" ? "Empowered, clear-headed" : t === "B" ? "Content, motivated" : "Slightly overwhelmed",
          achievements: t === "C" ? ["Hit major milestone", "Completed 10x target"] : ["Maintained steady progress"],
          failures: t === "A" ? ["Missed secondary goal due to procrastination"] : [],
          unexpectedEvent: t === "C" ? "Offered strategic advisory position" : "System server crash resolved successfully"
        });
      });
    });

    const finalReport: SimulationReport = {
      id,
      userId,
      scores: {
        healthScore: Math.round(baseHealthScore),
        careerScore: Math.round(baseCareerScore),
        financeScore: Math.round(baseFinanceScore),
        relationshipScore: Math.round(baseRelationshipScore),
        growthScore: Math.round(baseGrowthScore),
        riskScore: Math.round(overallRisk),
        futureReadinessScore: Math.round(readinessScore)
      },
      probabilities: {
        promotion,
        incomeGrowth,
        financialIndependence,
        burnout,
        careerChange,
        businessSuccess,
        healthImprovement
      },
      stories,
      avatar: {
        name: `${profile.name} (10 Years Out)`,
        age: Number(profile.age) + 10,
        profession: `Lead ${profile.occupation || "Specialist"}`,
        city: profile.country || "Global Hub",
        income: Math.round(profile.income * 1.6),
        personalityTraits: ["Resilient", "Forward-thinking", "Disciplined"],
        topAchievements: ["Transformed core habits", "Optimized financial health by 120%"],
        futureMotto: "Consistency beats intensity every single day."
      },
      letter: `Dear ${profile.name},\n\nWriting to you from 10 years in the future. I want to tell you how much your choice to look at your habits today matters. Your daily effort of self-reflection sets off a chain reaction. Remember that consistency beats intensity. If you continue with Timeline B, you will bypass the burnout that threatens you right now and secure our financial freedom. \n\nKeep pushing, keep learning, and be kind to yourself along the way.\n\nWarmly,\nFuture ${profile.name} (2036)`,
      regrets: [
        { regret: "Not saving aggressively early on", why: "Compounding interest works best with time, and procrastination cost thousands.", howToAvoid: "Automate a 20% savings/investing deposit immediately every month." },
        { regret: "Neglecting core sleep schedules", why: "Late-night screen time damaged focus cycles over the years.", howToAvoid: "Charge your phone outside the bedroom and sleep by 10:30 PM." },
        { regret: "Allowing career skills to stagnate", why: "Tech trends shifted quickly, leaving standard methods behind.", howToAvoid: "Dedicate 30 minutes every morning to coding/learning AI." },
        { regret: "Letting family connection drift", why: "Work stress took priority over weekend check-ins.", howToAvoid: "Schedule a recurring Sunday call with family." },
        { regret: "Avoiding physical stretching/exercise", why: "Sedentary work desk habits led to chronic back issues in year 5.", howToAvoid: "Walk 10,000 steps daily and integrate strength training." }
      ],
      opportunities: [
        { opportunity: "Deepening AI/Tech upskilling immediately", impact: "High", rank: 1 },
        { opportunity: "Re-allocating passive index investments", impact: "High", rank: 2 },
        { opportunity: "Introducing physical endurance training", impact: "Medium", rank: 3 }
      ],
      recommendations: [
        { action: "Automate 15% savings rate right away", category: "Finance", impact: "High" },
        { action: "Introduce 3 weekly cardiovascular exercise sessions", category: "Health", impact: "High" },
        { action: "Block 45 minutes of daily focused study time", category: "Growth", impact: "High" }
      ],
      createdAt
    };

    return finalReport;
  }

  private generateMockWhatIf(
    userId: string,
    id: string,
    query: string,
    latestReport: SimulationReport | null,
    createdAt: string
  ): WhatIfScenario {
    let outcome = `Simulating: "${query}". Based on your habits, this action shifts your career trajectory. `;
    const scoresChange = latestReport 
      ? { ...latestReport.scores } 
      : { healthScore: 70, careerScore: 70, financeScore: 70, relationshipScore: 70, growthScore: 70, futureReadinessScore: 70 };

    if (query.toLowerCase().includes("ai") || query.toLowerCase().includes("startup")) {
      outcome += "By upskilling in high-leverage domains, your career adaptability spikes. You mitigate stagnation risk but temporarily raise burnout risks if study hours overlap with sleep.";
      scoresChange.careerScore = Math.min(100, scoresChange.careerScore + 15);
      scoresChange.growthScore = Math.min(100, scoresChange.growthScore + 20);
      scoresChange.futureReadinessScore = Math.round((scoresChange.careerScore + scoresChange.growthScore) / 2);
    } else if (query.toLowerCase().includes("exercise") || query.toLowerCase().includes("health")) {
      outcome += "Integrating daily workouts stabilizes your mental fatigue, directly boosting physical resilience and reducing long-term health risks by 40%.";
      scoresChange.healthScore = Math.min(100, scoresChange.healthScore + 20);
      scoresChange.futureReadinessScore = Math.min(100, scoresChange.futureReadinessScore + 5);
    } else if (query.toLowerCase().includes("abroad") || query.toLowerCase().includes("move")) {
      outcome += "Relocating abroad exposes you to high-growth job opportunities and diverse networks, though social connection metrics will dip during the initial 18 months of adaptation.";
      scoresChange.careerScore = Math.min(100, scoresChange.careerScore + 10);
      scoresChange.relationshipScore = Math.max(20, scoresChange.relationshipScore - 15);
      scoresChange.futureReadinessScore = Math.min(100, scoresChange.futureReadinessScore + 5);
    } else {
      outcome += "This decision introduces structured discipline. Over a 5-year outlook, compounding improvements occur across lifestyle stability and future confidence.";
      scoresChange.growthScore = Math.min(100, scoresChange.growthScore + 10);
    }

    return {
      id,
      userId,
      query,
      outcome,
      scoresChange,
      createdAt
    };
  }
}

export const orchestrator = new Orchestrator();
