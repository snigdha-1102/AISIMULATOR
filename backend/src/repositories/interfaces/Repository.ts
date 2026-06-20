export interface User {
  id: string;
  email: string;
  passwordHash?: string; // only used in local mock mode
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  age: number;
  gender: string;
  country: string;
  education: string;
  occupation: string;
  income: number;
  relationshipStatus: string;
}

export interface LifeAssessment {
  userId: string;
  health: {
    sleepHours: number;
    exerciseFrequency: string; // e.g. "daily", "3-4-times-a-week", "rarely"
    waterIntake: number; // liters
    dietQuality: string; // "poor", "average", "excellent"
    stressLevel: string; // "low", "moderate", "high"
  };
  career: {
    currentRole: string;
    experience: number; // years
    skills: string[];
    certifications: string[];
    learningHabits: string;
  };
  finance: {
    income: number;
    savings: number;
    investments: number;
    debt: number;
    monthlySpending: number;
  };
  relationships: {
    familyConnection: string; // "weak", "moderate", "strong"
    friends: string;
    socialActivity: string;
  };
  growth: {
    booksRead: number;
    coursesCompleted: number;
    productivityLevel: string;
  };
  goals: {
    careerGoals: string;
    financialGoals: string;
    healthGoals: string;
    personalGoals: string;
  };
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  type: "positive" | "negative";
  frequency: string; // e.g. "daily", "weekly"
  duration: number; // minutes per session
  consistencyScore: number; // 0-100
  createdAt: string;
}

export interface PredictionProbabilities {
  promotion: number;
  incomeGrowth: number;
  financialIndependence: number;
  burnout: number;
  careerChange: number;
  businessSuccess: number;
  healthImprovement: number;
}

export interface TimelineOutcome {
  career: string;
  wealth: number;
  health: string;
  relationships: string;
  happiness: number; // 0-100
  lifeSatisfaction: number; // 0-100
  futureReadiness: number; // 0-100
}

export interface TimelineData {
  timelineA: { "1yr": TimelineOutcome; "5yr": TimelineOutcome; "10yr": TimelineOutcome };
  timelineB: { "1yr": TimelineOutcome; "5yr": TimelineOutcome; "10yr": TimelineOutcome };
  timelineC: { "1yr": TimelineOutcome; "5yr": TimelineOutcome; "10yr": TimelineOutcome };
}

export interface FutureStory {
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

export interface FutureAvatar {
  name: string;
  age: number;
  profession: string;
  city: string;
  income: number;
  personalityTraits: string[];
  topAchievements: string[];
  futureMotto: string;
}

export interface SimulationReport {
  id: string;
  userId: string;
  scores: {
    healthScore: number;
    careerScore: number;
    financeScore: number;
    relationshipScore: number;
    growthScore: number;
    riskScore: number;
    futureReadinessScore: number;
  };
  probabilities: PredictionProbabilities;
  stories: FutureStory[];
  avatar: FutureAvatar;
  letter: string; // Letter from Future Self
  regrets: Array<{ regret: string; why: string; howToAvoid: string }>;
  opportunities: Array<{ opportunity: string; impact: string; rank: number }>;
  recommendations: Array<{ action: string; category: string; impact: string }>;
  createdAt: string;
}

export interface WhatIfScenario {
  id: string;
  userId: string;
  query: string;
  outcome: string; // Textual analysis of the timeline deviation
  scoresChange: {
    healthScore: number;
    careerScore: number;
    financeScore: number;
    relationshipScore: number;
    growthScore: number;
    futureReadinessScore: number;
  };
  createdAt: string;
}

export interface IRepository {
  // Users
  createUser(user: User): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;

  // Profiles
  saveProfile(profile: UserProfile): Promise<UserProfile>;
  getProfile(userId: string): Promise<UserProfile | null>;

  // Assessments
  saveAssessment(assessment: LifeAssessment): Promise<LifeAssessment>;
  getAssessment(userId: string): Promise<LifeAssessment | null>;

  // Habits
  saveHabit(habit: Habit): Promise<Habit>;
  getHabits(userId: string): Promise<Habit[]>;
  deleteHabit(userId: string, habitId: string): Promise<boolean>;

  // Simulations
  saveSimulation(simulation: SimulationReport): Promise<SimulationReport>;
  getLatestSimulation(userId: string): Promise<SimulationReport | null>;
  getSimulationHistory(userId: string): Promise<SimulationReport[]>;

  // What-If Scenarios
  saveWhatIf(whatif: WhatIfScenario): Promise<WhatIfScenario>;
  getWhatIfHistory(userId: string): Promise<WhatIfScenario[]>;
}
