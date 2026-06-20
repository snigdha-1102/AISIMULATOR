import * as fs from "fs/promises";
import * as path from "path";
import { IRepository, User, UserProfile, LifeAssessment, Habit, SimulationReport, WhatIfScenario } from "../interfaces/Repository";

export class LocalRepository implements IRepository {
  private dataDir: string;
  private usersFile: string;
  private profilesFile: string;
  private assessmentsFile: string;
  private habitsFile: string;
  private simulationsFile: string;
  private whatifsFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), "data");
    this.usersFile = path.join(this.dataDir, "users.json");
    this.profilesFile = path.join(this.dataDir, "profiles.json");
    this.assessmentsFile = path.join(this.dataDir, "assessments.json");
    this.habitsFile = path.join(this.dataDir, "habits.json");
    this.simulationsFile = path.join(this.dataDir, "simulations.json");
    this.whatifsFile = path.join(this.dataDir, "whatifs.json");
    
    this.initDir();
  }

  private async initDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await this.ensureFile(this.usersFile, "[]");
      await this.ensureFile(this.profilesFile, "[]");
      await this.ensureFile(this.assessmentsFile, "[]");
      await this.ensureFile(this.habitsFile, "[]");
      await this.ensureFile(this.simulationsFile, "[]");
      await this.ensureFile(this.whatifsFile, "[]");
    } catch (err) {
      console.error("Failed to initialize database directories", err);
    }
  }

  private async ensureFile(filePath: string, defaultContent: string) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, defaultContent, "utf-8");
    }
  }

  private async readData<T>(filePath: string): Promise<T[]> {
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as T[];
    } catch (err) {
      return [];
    }
  }

  private async writeData<T>(filePath: string, items: T[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(items, null, 2), "utf-8");
  }

  // Users
  async createUser(user: User): Promise<User> {
    const users = await this.readData<User>(this.usersFile);
    users.push(user);
    await this.writeData(this.usersFile, users);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.readData<User>(this.usersFile);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.readData<User>(this.usersFile);
    return users.find(u => u.id === id) || null;
  }

  // Profiles
  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const profiles = await this.readData<UserProfile>(this.profilesFile);
    const index = profiles.findIndex(p => p.userId === profile.userId);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    await this.writeData(this.profilesFile, profiles);
    return profile;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const profiles = await this.readData<UserProfile>(this.profilesFile);
    return profiles.find(p => p.userId === userId) || null;
  }

  // Assessments
  async saveAssessment(assessment: LifeAssessment): Promise<LifeAssessment> {
    const assessments = await this.readData<LifeAssessment>(this.assessmentsFile);
    const index = assessments.findIndex(a => a.userId === assessment.userId);
    if (index >= 0) {
      assessments[index] = assessment;
    } else {
      assessments.push(assessment);
    }
    await this.writeData(this.assessmentsFile, assessments);
    return assessment;
  }

  async getAssessment(userId: string): Promise<LifeAssessment | null> {
    const assessments = await this.readData<LifeAssessment>(this.assessmentsFile);
    return assessments.find(a => a.userId === userId) || null;
  }

  // Habits
  async saveHabit(habit: Habit): Promise<Habit> {
    const habits = await this.readData<Habit>(this.habitsFile);
    const index = habits.findIndex(h => h.id === habit.id && h.userId === habit.userId);
    if (index >= 0) {
      habits[index] = habit;
    } else {
      habits.push(habit);
    }
    await this.writeData(this.habitsFile, habits);
    return habit;
  }

  async getHabits(userId: string): Promise<Habit[]> {
    const habits = await this.readData<Habit>(this.habitsFile);
    return habits.filter(h => h.userId === userId);
  }

  async deleteHabit(userId: string, habitId: string): Promise<boolean> {
    const habits = await this.readData<Habit>(this.habitsFile);
    const filtered = habits.filter(h => !(h.userId === userId && h.id === habitId));
    if (filtered.length === habits.length) return false;
    await this.writeData(this.habitsFile, filtered);
    return true;
  }

  // Simulations
  async saveSimulation(simulation: SimulationReport): Promise<SimulationReport> {
    const simulations = await this.readData<SimulationReport>(this.simulationsFile);
    simulations.push(simulation);
    await this.writeData(this.simulationsFile, simulations);
    return simulation;
  }

  async getLatestSimulation(userId: string): Promise<SimulationReport | null> {
    const simulations = await this.readData<SimulationReport>(this.simulationsFile);
    const userSims = simulations.filter(s => s.userId === userId);
    if (userSims.length === 0) return null;
    // Sort by date descending
    userSims.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return userSims[0];
  }

  async getSimulationHistory(userId: string): Promise<SimulationReport[]> {
    const simulations = await this.readData<SimulationReport>(this.simulationsFile);
    return simulations
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // What-If Scenarios
  async saveWhatIf(whatif: WhatIfScenario): Promise<WhatIfScenario> {
    const whatifs = await this.readData<WhatIfScenario>(this.whatifsFile);
    whatifs.push(whatif);
    await this.writeData(this.whatifsFile, whatifs);
    return whatif;
  }

  async getWhatIfHistory(userId: string): Promise<WhatIfScenario[]> {
    const whatifs = await this.readData<WhatIfScenario>(this.whatifsFile);
    return whatifs
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
