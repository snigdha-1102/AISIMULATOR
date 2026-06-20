import { orchestrator } from "../services/ai/Orchestrator";
import { UserProfile, LifeAssessment, Habit } from "../repositories/interfaces/Repository";
import * as dotenv from "dotenv";

dotenv.config();

async function runTest() {
  console.log("Starting Multi-Agent Simulation Pipeline Test...");
  
  const mockProfile: UserProfile = {
    userId: "test-user-123",
    name: "Alex Dev",
    age: 28,
    gender: "non-binary",
    country: "Canada",
    education: "B.Sc. Computer Science",
    occupation: "Software Engineer",
    income: 85000,
    relationshipStatus: "single"
  };

  const mockAssessment: LifeAssessment = {
    userId: "test-user-123",
    health: {
      sleepHours: 6.5,
      exerciseFrequency: "3-4-times-a-week",
      waterIntake: 1.8,
      dietQuality: "average",
      stressLevel: "moderate"
    },
    career: {
      currentRole: "Mid-level Fullstack Dev",
      experience: 5,
      skills: ["React", "NodeJS", "Typescript", "Git"],
      certifications: ["AWS Certified Developer"],
      learningHabits: "Read blogs and code side projects occasionally"
    },
    finance: {
      income: 85000,
      savings: 12000,
      investments: 5000,
      debt: 15000,
      monthlySpending: 4500
    },
    relationships: {
      familyConnection: "moderate",
      friends: "few",
      socialActivity: "low"
    },
    growth: {
      booksRead: 4,
      coursesCompleted: 2,
      productivityLevel: "moderate"
    },
    goals: {
      careerGoals: "Become a Senior Architect or Tech Lead in 3 years",
      financialGoals: "Pay off student debt and purchase a condo",
      healthGoals: "Run a half-marathon and build better sleeping habits",
      personalGoals: "Learn Spanish and read 12 books a year"
    },
    updatedAt: new Date().toISOString()
  };

  const mockHabits: Habit[] = [
    {
      id: "habit-1",
      userId: "test-user-123",
      name: "Daily Coding",
      type: "positive",
      frequency: "daily",
      duration: 60,
      consistencyScore: 80,
      createdAt: new Date().toISOString()
    },
    {
      id: "habit-2",
      userId: "test-user-123",
      name: "Late night screen time",
      type: "negative",
      frequency: "daily",
      duration: 120,
      consistencyScore: 90,
      createdAt: new Date().toISOString()
    }
  ];

  try {
    const report = await orchestrator.runLifeSimulation("test-user-123", mockProfile, mockAssessment, mockHabits);
    console.log("\n✅ SIMULATION COMPLETED SUCCESSFULLY!");
    console.log("-------------------------------------");
    console.log("ID:", report.id);
    console.log("Scores:", JSON.stringify(report.scores, null, 2));
    console.log("Probabilities:", JSON.stringify(report.probabilities, null, 2));
    console.log("Avatar:", JSON.stringify(report.avatar, null, 2));
    console.log("\nFirst Story Timeline A (1 Year):");
    const firstA = report.stories.find(s => s.timeline === "A" && s.years === 1);
    console.log(firstA ? firstA.career : "Not found");
    console.log("\nLetter Preview:");
    console.log(report.letter.substring(0, 150) + "...");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

runTest();
