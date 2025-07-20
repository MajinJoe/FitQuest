import { 
  characters, quests, activities, nutritionLogs, workoutLogs, achievements,
  type Character, type InsertCharacter,
  type Quest, type InsertQuest,
  type Activity, type InsertActivity,
  type NutritionLog, type InsertNutritionLog,
  type WorkoutLog, type InsertWorkoutLog,
  type Achievement, type InsertAchievement
} from "@shared/schema";

export interface IStorage {
  // Character methods
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined>;
  
  // Quest methods
  getCharacterQuests(characterId: number): Promise<Quest[]>;
  getActiveQuests(characterId: number): Promise<Quest[]>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  updateQuest(id: number, updates: Partial<Quest>): Promise<Quest | undefined>;
  
  // Activity methods
  getCharacterActivities(characterId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Nutrition methods
  getCharacterNutritionLogs(characterId: number): Promise<NutritionLog[]>;
  getTodayNutritionLogs(characterId: number): Promise<NutritionLog[]>;
  createNutritionLog(log: InsertNutritionLog): Promise<NutritionLog>;
  
  // Workout methods
  getCharacterWorkoutLogs(characterId: number): Promise<WorkoutLog[]>;
  getTodayWorkoutLogs(characterId: number): Promise<WorkoutLog[]>;
  createWorkoutLog(log: InsertWorkoutLog): Promise<WorkoutLog>;
  
  // Achievement methods
  getCharacterAchievements(characterId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

export class MemStorage implements IStorage {
  private characters: Map<number, Character>;
  private quests: Map<number, Quest>;
  private activities: Map<number, Activity>;
  private nutritionLogs: Map<number, NutritionLog>;
  private workoutLogs: Map<number, WorkoutLog>;
  private achievements: Map<number, Achievement>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.characters = new Map();
    this.quests = new Map();
    this.activities = new Map();
    this.nutritionLogs = new Map();
    this.workoutLogs = new Map();
    this.achievements = new Map();
    this.currentIds = {
      characters: 1,
      quests: 1,
      activities: 1,
      nutritionLogs: 1,
      workoutLogs: 1,
      achievements: 1,
    };
    
    // Create default character and quests
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default character
    const defaultCharacter: Character = {
      id: 1,
      name: "Sir FitKnight",
      level: 23,
      currentXP: 2847,
      nextLevelXP: 3200,
      avatarUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      class: "Warrior of Wellness",
      totalXP: 23000,
      createdAt: new Date(),
    };
    this.characters.set(1, defaultCharacter);
    this.currentIds.characters = 2;

    // Create default quests
    const defaultQuests: Quest[] = [
      {
        id: 1,
        characterId: 1,
        name: "The Cardio Caverns",
        description: "Complete 30 minutes of cardio exercise",
        type: "cardio",
        targetValue: 30,
        currentProgress: 18,
        xpReward: 150,
        isCompleted: false,
        isDaily: true,
        difficulty: "normal",
        createdAt: new Date(),
      },
      {
        id: 2,
        characterId: 1,
        name: "Nutrition Sanctum",
        description: "Log all meals and hit protein target",
        type: "nutrition",
        targetValue: 100,
        currentProgress: 85,
        xpReward: 100,
        isCompleted: false,
        isDaily: true,
        difficulty: "normal",
        createdAt: new Date(),
      },
      {
        id: 3,
        characterId: 1,
        name: "Hydration Haven",
        description: "Drink 8 glasses of water today",
        type: "hydration",
        targetValue: 8,
        currentProgress: 5,
        xpReward: 50,
        isCompleted: false,
        isDaily: true,
        difficulty: "easy",
        createdAt: new Date(),
      },
    ];
    
    defaultQuests.forEach(quest => {
      this.quests.set(quest.id, quest);
    });
    this.currentIds.quests = 4;

    // Create some default activities
    const defaultActivities: Activity[] = [
      {
        id: 1,
        characterId: 1,
        type: "nutrition",
        description: "Logged breakfast - Oatmeal with berries",
        xpGained: 45,
        metadata: { calories: 350, mealType: "breakfast" },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 2,
        characterId: 1,
        type: "workout",
        description: "Completed morning run - 5.2km",
        xpGained: 180,
        metadata: { duration: 35, caloriesBurned: 420 },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: 3,
        characterId: 1,
        type: "achievement",
        description: "Achievement Unlocked: Weekly Warrior",
        xpGained: 500,
        metadata: { achievementName: "Weekly Warrior" },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      },
    ];
    
    defaultActivities.forEach(activity => {
      this.activities.set(activity.id, activity);
    });
    this.currentIds.activities = 4;
  }

  // Character methods
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = this.currentIds.characters++;
    const character: Character = {
      ...insertCharacter,
      id,
      createdAt: new Date(),
    };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: number, updates: Partial<Character>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;
    
    const updatedCharacter = { ...character, ...updates };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  // Quest methods
  async getCharacterQuests(characterId: number): Promise<Quest[]> {
    return Array.from(this.quests.values()).filter(quest => quest.characterId === characterId);
  }

  async getActiveQuests(characterId: number): Promise<Quest[]> {
    return Array.from(this.quests.values()).filter(
      quest => quest.characterId === characterId && !quest.isCompleted
    );
  }

  async createQuest(insertQuest: InsertQuest): Promise<Quest> {
    const id = this.currentIds.quests++;
    const quest: Quest = {
      ...insertQuest,
      id,
      createdAt: new Date(),
    };
    this.quests.set(id, quest);
    return quest;
  }

  async updateQuest(id: number, updates: Partial<Quest>): Promise<Quest | undefined> {
    const quest = this.quests.get(id);
    if (!quest) return undefined;
    
    const updatedQuest = { ...quest, ...updates };
    this.quests.set(id, updatedQuest);
    return updatedQuest;
  }

  // Activity methods
  async getCharacterActivities(characterId: number, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.characterId === characterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentIds.activities++;
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Nutrition methods
  async getCharacterNutritionLogs(characterId: number): Promise<NutritionLog[]> {
    return Array.from(this.nutritionLogs.values())
      .filter(log => log.characterId === characterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTodayNutritionLogs(characterId: number): Promise<NutritionLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.nutritionLogs.values())
      .filter(log => 
        log.characterId === characterId && 
        log.createdAt >= today
      );
  }

  async createNutritionLog(insertLog: InsertNutritionLog): Promise<NutritionLog> {
    const id = this.currentIds.nutritionLogs++;
    const log: NutritionLog = {
      ...insertLog,
      id,
      createdAt: new Date(),
    };
    this.nutritionLogs.set(id, log);
    return log;
  }

  // Workout methods
  async getCharacterWorkoutLogs(characterId: number): Promise<WorkoutLog[]> {
    return Array.from(this.workoutLogs.values())
      .filter(log => log.characterId === characterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTodayWorkoutLogs(characterId: number): Promise<WorkoutLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.workoutLogs.values())
      .filter(log => 
        log.characterId === characterId && 
        log.createdAt >= today
      );
  }

  async createWorkoutLog(insertLog: InsertWorkoutLog): Promise<WorkoutLog> {
    const id = this.currentIds.workoutLogs++;
    const log: WorkoutLog = {
      ...insertLog,
      id,
      createdAt: new Date(),
    };
    this.workoutLogs.set(id, log);
    return log;
  }

  // Achievement methods
  async getCharacterAchievements(characterId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.characterId === characterId)
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentIds.achievements++;
    const achievement: Achievement = {
      ...insertAchievement,
      id,
      unlockedAt: new Date(),
    };
    this.achievements.set(id, achievement);
    return achievement;
  }
}

export const storage = new MemStorage();
