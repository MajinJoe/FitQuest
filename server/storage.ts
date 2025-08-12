import { 
  users, characters, quests, activities, nutritionLogs, workoutLogs, achievements, foodDatabase, workoutTemplates,
  exercises, workoutSessions, exerciseEntries,
  type User, type InsertUser, type UpdateUserProfile,
  type Character, type InsertCharacter,
  type Quest, type InsertQuest,
  type Activity, type InsertActivity,
  type NutritionLog, type InsertNutritionLog,
  type WorkoutLog, type InsertWorkoutLog,
  type Achievement, type InsertAchievement,
  type FoodDatabaseItem, type InsertFoodDatabaseItem,
  type WorkoutTemplate, type InsertWorkoutTemplate,
  type Exercise, type InsertExercise,
  type WorkoutSession, type InsertWorkoutSession,
  type ExerciseEntry, type InsertExerciseEntry
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, updates: UpdateUserProfile): Promise<User | undefined>;
  
  // Character methods
  getCharacter(id: number): Promise<Character | undefined>;
  getCharacterByUserId(userId: number): Promise<Character | undefined>;
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
  
  // Food Database methods
  searchFoodDatabase(query: string, category?: string): Promise<FoodDatabaseItem[]>;
  getFoodByBarcode(barcode: string): Promise<FoodDatabaseItem | undefined>;
  createFoodDatabaseItem(food: InsertFoodDatabaseItem): Promise<FoodDatabaseItem>;
  searchOpenFoodFacts(barcode: string): Promise<any>;
  importFromOpenFoodFacts(barcode: string, productData: any): Promise<FoodDatabaseItem>;
  getPopularFoods(limit?: number): Promise<FoodDatabaseItem[]>;
  getUserContributedFoods(characterId: number): Promise<FoodDatabaseItem[]>;
  incrementUsageCount(foodId: number): Promise<void>;
  
  // Workout Template methods
  getWorkoutTemplates(category?: string, difficulty?: string): Promise<WorkoutTemplate[]>;
  getWorkoutTemplateById(id: number): Promise<WorkoutTemplate | undefined>;
  createWorkoutTemplate(template: InsertWorkoutTemplate): Promise<WorkoutTemplate>;
  searchWorkoutTemplates(query: string): Promise<WorkoutTemplate[]>;
  getPopularWorkoutTemplates(limit?: number): Promise<WorkoutTemplate[]>;
  incrementWorkoutTemplateUsage(templateId: number): Promise<void>;
  fetchWgerWorkouts(): Promise<any>;
  importFromWger(workoutData: any): Promise<WorkoutTemplate>;

  // Exercise methods (Physical Activities Compendium)
  getExercises(category?: string): Promise<Exercise[]>;
  getExerciseById(id: number): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  searchExercises(query: string): Promise<Exercise[]>;

  // Workout Session methods
  getCharacterWorkoutSessions(characterId: number): Promise<WorkoutSession[]>;
  getWorkoutSessionById(id: number): Promise<WorkoutSession | undefined>;
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  updateWorkoutSession(id: number, updates: Partial<InsertWorkoutSession>): Promise<WorkoutSession | undefined>;
  
  // Exercise Entry methods
  getExerciseEntriesBySession(sessionId: number): Promise<ExerciseEntry[]>;
  createExerciseEntry(entry: InsertExerciseEntry): Promise<ExerciseEntry>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private quests: Map<number, Quest>;
  private activities: Map<number, Activity>;
  private nutritionLogs: Map<number, NutritionLog>;
  private workoutLogs: Map<number, WorkoutLog>;
  private achievements: Map<number, Achievement>;
  private foodDatabaseItems: Map<number, FoodDatabaseItem>;
  private workoutTemplates: Map<number, WorkoutTemplate>;
  private exercises: Map<number, Exercise>;
  private workoutSessions: Map<number, WorkoutSession>;
  private exerciseEntries: Map<number, ExerciseEntry>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.quests = new Map();
    this.activities = new Map();
    this.nutritionLogs = new Map();
    this.workoutLogs = new Map();
    this.achievements = new Map();
    this.foodDatabaseItems = new Map();
    this.workoutTemplates = new Map();
    this.exercises = new Map();
    this.workoutSessions = new Map();
    this.exerciseEntries = new Map();
    this.currentIds = {
      users: 1,
      characters: 1,
      quests: 1,
      activities: 1,
      nutritionLogs: 1,
      workoutLogs: 1,
      achievements: 1,
      foodDatabase: 1,
      workoutTemplates: 1,
      exercises: 1,
      workoutSessions: 1,
      exerciseEntries: 1,
    };
    
    // Create default user, character and quests
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "FitHero",
      email: "fithero@example.com",
      profileImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(1, defaultUser);
    this.currentIds.users = 2;

    // Create default character
    const defaultCharacter: Character = {
      id: 1,
      userId: 1,
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

    // Create default quests (starting from 0 progress)
    const defaultQuests: Quest[] = [
      {
        id: 1,
        characterId: 1,
        name: "The Cardio Caverns",
        description: "Complete 30 minutes of cardio exercise",
        type: "cardio",
        targetValue: 30,
        currentProgress: 0,
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
        currentProgress: 0,
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
        currentProgress: 0,
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

    // Initialize food database with real food items
    this.initializeFoodDatabase();
  }

  private initializeFoodDatabase() {
    const foodItems: FoodDatabaseItem[] = [
      // Miss Vickie's Products
      {
        id: 1,
        name: "Original Recipe Kettle Cooked Potato Chips",
        brand: "Miss Vickie's",
        category: "snacks",
        servingSize: "1 oz (28g)",
        calories: 160,
        protein: 2,
        carbs: 15,
        fat: 10,
        fiber: 1,
        sugar: 1,
        sodium: 160,
        verified: true,
        barcode: "060410039236",
        source: "admin",
        sourceId: null,
        contributedBy: null,
        imageUrl: null,
        ingredients: "Potatoes, vegetable oil, sea salt",
        allergens: null,
        isHomemade: false,
        recipe: null,
        tags: ["kettle-cooked", "snack", "crunchy"],
        usageCount: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Sea Salt & Vinegar Kettle Cooked Chips",
        brand: "Miss Vickie's",
        category: "snacks",
        servingSize: "1 oz (28g)",
        calories: 160,
        protein: 2,
        carbs: 15,
        fat: 10,
        fiber: 1,
        sugar: 0,
        sodium: 200,
        verified: true,
        barcode: "060410039243",
        source: "admin",
        sourceId: null,
        contributedBy: null,
        imageUrl: null,
        ingredients: "Potatoes, vegetable oil, sea salt, vinegar powder",
        allergens: null,
        isHomemade: false,
        recipe: null,
        tags: ["kettle-cooked", "tangy", "snack"],
        usageCount: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "Jalapeño Kettle Cooked Chips",
        brand: "Miss Vickie's",
        category: "snacks",
        servingSize: "1 oz (28g)",
        calories: 160,
        protein: 2,
        carbs: 15,
        fat: 10,
        fiber: 1,
        sugar: 1,
        sodium: 170,
        verified: true,
        barcode: "060410039250",
        createdAt: new Date(),
      },
      // Panera Bread Products
      {
        id: 4,
        name: "Green Goddess Cobb Salad with Chicken",
        brand: "Panera",
        category: "restaurant",
        servingSize: "1 full salad",
        calories: 570,
        protein: 40,
        carbs: 21,
        fat: 38,
        fiber: 8,
        sugar: 9,
        sodium: 1380,
        verified: true,
        barcode: null,
        createdAt: new Date(),
      },
      {
        id: 5,
        name: "Broccoli Cheddar Soup",
        brand: "Panera",
        category: "restaurant",
        servingSize: "1 cup (8 oz)",
        calories: 290,
        protein: 11,
        carbs: 20,
        fat: 20,
        fiber: 3,
        sugar: 8,
        sodium: 1040,
        verified: true,
        barcode: null,
        createdAt: new Date(),
      },
      {
        id: 6,
        name: "Turkey Sandwich on Artisan Ciabatta",
        brand: "Panera",
        category: "restaurant",
        servingSize: "1 whole sandwich",
        calories: 520,
        protein: 28,
        carbs: 52,
        fat: 22,
        fiber: 3,
        sugar: 8,
        sodium: 1570,
        verified: true,
        barcode: null,
        createdAt: new Date(),
      },
      {
        id: 7,
        name: "Plain Bagel",
        brand: "Panera",
        category: "bakery",
        servingSize: "1 bagel",
        calories: 280,
        protein: 11,
        carbs: 56,
        fat: 2,
        fiber: 2,
        sugar: 6,
        sodium: 540,
        verified: true,
        barcode: null,
        createdAt: new Date(),
      },
      {
        id: 8,
        name: "Iced Coffee - Medium",
        brand: "Panera",
        category: "beverages",
        servingSize: "16 fl oz",
        calories: 5,
        protein: 1,
        carbs: 1,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 10,
        verified: true,
        barcode: null,
        createdAt: new Date(),
      },
      // Additional popular foods
      {
        id: 9,
        name: "Greek Yogurt - Plain",
        brand: "Chobani",
        category: "dairy",
        servingSize: "1 container (170g)",
        calories: 100,
        protein: 18,
        carbs: 6,
        fat: 0,
        fiber: 0,
        sugar: 4,
        sodium: 60,
        verified: true,
        barcode: "894700010045",
        createdAt: new Date(),
      },
      {
        id: 10,
        name: "Organic Bananas",
        brand: "Generic",
        category: "produce",
        servingSize: "1 medium banana (118g)",
        calories: 105,
        protein: 1,
        carbs: 27,
        fat: 0,
        fiber: 3,
        sugar: 14,
        sodium: 1,
        verified: true,
        barcode: null,
        createdAt: new Date(),
      }
    ];

    foodItems.forEach(item => {
      this.foodDatabaseItems.set(item.id, item);
    });
    this.currentIds.foodDatabase = foodItems.length + 1;

    // Initialize default workout templates
    const workoutTemplates: WorkoutTemplate[] = [
      {
        id: 1,
        name: "Push-Up Power",
        description: "Classic bodyweight upper body workout focusing on chest, shoulders, and triceps",
        category: "strength",
        difficulty: "beginner",
        estimatedDuration: 15,
        estimatedCaloriesBurn: 120,
        exercises: [
          { name: "Push-ups", sets: 3, reps: 10, restTime: 60 },
          { name: "Incline Push-ups", sets: 2, reps: 8, restTime: 60 },
          { name: "Wall Push-ups", sets: 2, reps: 15, restTime: 45 }
        ],
        equipment: [],
        targetMuscles: ["chest", "shoulders", "triceps"],
        source: "custom",
        sourceId: null,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        instructions: "Start with wall push-ups to warm up, then progress to incline push-ups, and finish with regular push-ups. Focus on proper form over speed.",
        tags: ["bodyweight", "upper-body", "no-equipment", "home"],
        usageCount: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Cardio Blast",
        description: "High-intensity interval training to boost cardiovascular fitness",
        category: "cardio",
        difficulty: "intermediate",
        estimatedDuration: 20,
        estimatedCaloriesBurn: 250,
        exercises: [
          { name: "Jumping Jacks", duration: 45, restTime: 15 },
          { name: "High Knees", duration: 30, restTime: 15 },
          { name: "Burpees", reps: 5, restTime: 30 },
          { name: "Mountain Climbers", duration: 30, restTime: 15 }
        ],
        equipment: [],
        targetMuscles: ["full-body", "cardiovascular"],
        source: "custom",
        sourceId: null,
        imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        instructions: "Perform each exercise for the specified time/reps, rest between exercises. Complete 3-4 rounds total.",
        tags: ["cardio", "hiit", "full-body", "no-equipment"],
        usageCount: 72,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "Strength Foundation",
        description: "Basic strength training workout using dumbbells",
        category: "strength",
        difficulty: "beginner",
        estimatedDuration: 30,
        estimatedCaloriesBurn: 180,
        exercises: [
          { name: "Dumbbell Squats", sets: 3, reps: 12, restTime: 90 },
          { name: "Dumbbell Chest Press", sets: 3, reps: 10, restTime: 90 },
          { name: "Dumbbell Rows", sets: 3, reps: 10, restTime: 90 },
          { name: "Dumbbell Shoulder Press", sets: 2, reps: 8, restTime: 60 }
        ],
        equipment: ["dumbbells"],
        targetMuscles: ["legs", "chest", "back", "shoulders"],
        source: "custom",
        sourceId: null,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        instructions: "Use moderate weight that allows you to complete all reps with good form. Rest 90 seconds between sets.",
        tags: ["strength", "dumbbells", "full-body", "gym"],
        usageCount: 38,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: "Flexibility Flow",
        description: "Gentle stretching routine to improve flexibility and mobility",
        category: "flexibility",
        difficulty: "beginner",
        estimatedDuration: 15,
        estimatedCaloriesBurn: 60,
        exercises: [
          { name: "Cat-Cow Stretch", duration: 60, restTime: 0 },
          { name: "Downward Dog", duration: 30, restTime: 15 },
          { name: "Child's Pose", duration: 45, restTime: 0 },
          { name: "Hip Flexor Stretch", duration: 30, restTime: 15 },
          { name: "Shoulder Rolls", reps: 10, restTime: 0 }
        ],
        equipment: ["yoga-mat"],
        targetMuscles: ["full-body", "core", "back"],
        source: "custom",
        sourceId: null,
        imageUrl: "https://images.unsplash.com/photo-1506629905963-b3b54d45043d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        instructions: "Move slowly and breathe deeply. Hold each stretch for the specified time and never force a movement.",
        tags: ["flexibility", "yoga", "stretching", "recovery"],
        usageCount: 29,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    workoutTemplates.forEach(template => {
      this.workoutTemplates.set(template.id, template);
    });
    this.currentIds.workoutTemplates = workoutTemplates.length + 1;

    // Initialize exercises from Physical Activities Compendium
    this.initializeExerciseDatabase();
  }

  private initializeExerciseDatabase() {
    // Common strength training exercises with MET values from the compendium
    const exerciseData: Exercise[] = [
      {
        id: 1,
        name: "Bicep Curls",
        category: "strength",
        metValue: "6.0", // Resistance training, multiple exercises, 8-15 reps
        compendiumCode: "02054",
        description: "Resistance (weight) training, multiple exercises, 8-15 reps at varied resistance",
        trackingType: "reps_sets",
        muscleGroups: ["biceps", "arms"],
        equipment: ["dumbbells"],
        instructions: "Stand with feet shoulder-width apart, curl weights toward shoulders",
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Push-ups",
        category: "strength",
        metValue: "7.5", // Calisthenics, vigorous effort
        compendiumCode: "02020",
        description: "Calisthenics (e.g., pushups, sit ups, pull-ups, jumping jacks, burpees, battling ropes), vigorous effort",
        trackingType: "reps_sets",
        muscleGroups: ["chest", "shoulders", "triceps"],
        equipment: [],
        instructions: "Start in plank position, lower body to ground, push back up",
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "Squats",
        category: "strength",
        metValue: "5.0", // Resistance training, squats, deadlift
        compendiumCode: "02052",
        description: "Resistance (weight) training, squats, deadlift, slow or explosive effort",
        trackingType: "reps_sets",
        muscleGroups: ["quadriceps", "glutes", "legs"],
        equipment: [],
        instructions: "Stand with feet shoulder-width apart, lower hips back and down, return to standing",
        createdAt: new Date(),
      },
      // Cardio exercises
      {
        id: 4,
        name: "Stationary Bike",
        category: "cardio",
        metValue: "6.8", // Bicycling, stationary, general
        compendiumCode: "01200",
        description: "Bicycling, stationary, general",
        trackingType: "time_distance",
        muscleGroups: ["legs", "cardiovascular"],
        equipment: ["stationary bike"],
        instructions: "Maintain steady pace, adjust resistance as needed",
        createdAt: new Date(),
      },
      {
        id: 5,
        name: "Treadmill Running",
        category: "cardio",
        metValue: "8.0", // Running, general
        compendiumCode: "12030",
        description: "Running, general",
        trackingType: "time_distance",
        muscleGroups: ["legs", "cardiovascular"],
        equipment: ["treadmill"],
        instructions: "Start with warm-up, maintain consistent pace",
        createdAt: new Date(),
      },
      {
        id: 6,
        name: "Stairmaster",
        category: "cardio",
        metValue: "9.3", // Stair treadmill ergometer, general
        compendiumCode: "02065",
        description: "Stair treadmill ergometer, general",
        trackingType: "time_only",
        muscleGroups: ["legs", "glutes", "cardiovascular"],
        equipment: ["stairmaster"],
        instructions: "Step at consistent rate, use handrails for balance only",
        createdAt: new Date(),
      },
      // More strength exercises
      {
        id: 7,
        name: "Bench Press",
        category: "strength",
        metValue: "6.0", // Resistance training, vigorous effort
        compendiumCode: "02050",
        description: "Resistance (weight lifting - free weight, nautilus or universal-type), power lifting or body building, vigorous effort",
        trackingType: "reps_sets",
        muscleGroups: ["chest", "shoulders", "triceps"],
        equipment: ["barbell", "bench"],
        instructions: "Lie on bench, lower bar to chest, press up to full extension",
        createdAt: new Date(),
      },
      {
        id: 8,
        name: "Deadlift",
        category: "strength", 
        metValue: "5.0", // Resistance training, squats, deadlift
        compendiumCode: "02052",
        description: "Resistance (weight) training, squats, deadlift, slow or explosive effort",
        trackingType: "reps_sets",
        muscleGroups: ["back", "glutes", "hamstrings"],
        equipment: ["barbell"],
        instructions: "Keep back straight, lift with legs and hips, not back",
        createdAt: new Date(),
      }
    ];

    exerciseData.forEach(exercise => {
      this.exercises.set(exercise.id, exercise);
    });
    this.currentIds.exercises = exerciseData.length + 1;
  }

  // User methods
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfile(id: number, updates: UpdateUserProfile): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { 
      ...user, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Character methods
  async getCharacterByUserId(userId: number): Promise<Character | undefined> {
    return Array.from(this.characters.values()).find(character => character.userId === userId);
  }
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

  async createActivity(insertActivity: InsertActivity, updateQuests = true): Promise<Activity> {
    const id = this.currentIds.activities++;
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    
    // Update quest progress based on activity type (skip for quest completion activities)
    if (updateQuests && activity.type !== "quest") {
      await this.updateQuestProgress(activity.characterId, activity.type, activity.metadata);
    }
    
    return activity;
  }

  // Update quest progress when activities are logged
  private async updateQuestProgress(characterId: number, activityType: string, metadata: any): Promise<void> {
    const activeQuests = Array.from(this.quests.values())
      .filter(quest => quest.characterId === characterId && !quest.isCompleted);

    for (const quest of activeQuests) {
      let progressToAdd = 0;

      // Map activity types to quest types and calculate progress
      switch (quest.type) {
        case "cardio":
          if (activityType === "workout") {
            // Any workout counts toward cardio progress (add duration in minutes)
            if (metadata?.duration) {
              progressToAdd = metadata.duration;
            }
          }
          break;
        
        case "nutrition":
          if (activityType === "nutrition") {
            // Count protein grams for nutrition quest (adjust based on quest description)
            if (quest.name.includes("protein") && metadata?.protein) {
              progressToAdd = metadata.protein;
            } else if (metadata?.calories) {
              // For general nutrition goals, count calories
              progressToAdd = Math.floor(metadata.calories / 10); // Scale down calories for progress
            }
          }
          break;
        
        case "hydration":
          if (activityType === "hydration") {
            progressToAdd = 1; // Add 1 glass of water
          }
          break;
        
        case "strength":
          if (activityType === "workout" && 
              (metadata?.workoutType === "strength" || 
               metadata?.workoutType === "resistance" ||
               metadata?.workoutType === "weightlifting")) {
            progressToAdd = metadata.duration || 1; // Add workout duration or session count
          }
          break;
      }

      // Update quest progress
      if (progressToAdd > 0) {
        const newProgress = Math.min(quest.currentProgress + progressToAdd, quest.targetValue);
        const wasCompleted = quest.isCompleted;
        const isNowCompleted = newProgress >= quest.targetValue;

        await this.updateQuest(quest.id, {
          currentProgress: newProgress,
          isCompleted: isNowCompleted
        });

        // If quest was just completed, award XP and log completion activity
        if (!wasCompleted && isNowCompleted) {
          await this.awardQuestCompletionXP(characterId, quest);
        }
      }
    }
  }

  private async awardQuestCompletionXP(characterId: number, quest: Quest): Promise<void> {
    // Award XP for quest completion
    const character = await this.getCharacter(characterId);
    if (character) {
      await this.updateCharacterXP(characterId, quest.xpReward);
      
      // Log quest completion activity (don't update quests to avoid recursion)
      await this.createActivity({
        userId: 1, // Default user for demo
        characterId,
        type: "quest",
        description: `Quest Completed: ${quest.name}`,
        xpGained: quest.xpReward,
        metadata: { questId: quest.id, questName: quest.name }
      }, false);
    }
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

  // Food Database methods
  async searchFoodDatabase(query: string, category?: string): Promise<FoodDatabaseItem[]> {
    const searchTerms = query.toLowerCase().split(' ');
    
    return Array.from(this.foodDatabaseItems.values())
      .filter(food => {
        // Filter by category if specified
        if (category && category !== 'all' && food.category !== category) {
          return false;
        }
        
        // Search in name and brand
        const searchText = `${food.name} ${food.brand || ''}`.toLowerCase();
        
        // Check if all search terms are found in the food name or brand
        return searchTerms.every(term => searchText.includes(term));
      })
      .sort((a, b) => {
        // Sort by relevance - exact brand matches first, then alphabetical
        const aMatch = searchTerms.some(term => (a.brand || '').toLowerCase().includes(term));
        const bMatch = searchTerms.some(term => (b.brand || '').toLowerCase().includes(term));
        
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        
        return a.name.localeCompare(b.name);
      });
  }

  async getFoodByBarcode(barcode: string): Promise<FoodDatabaseItem | undefined> {
    return Array.from(this.foodDatabaseItems.values())
      .find(food => food.barcode === barcode);
  }

  async createFoodDatabaseItem(insertFood: InsertFoodDatabaseItem): Promise<FoodDatabaseItem> {
    const id = this.currentIds.foodDatabase++;
    const food: FoodDatabaseItem = {
      ...insertFood,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.foodDatabaseItems.set(id, food);
    return food;
  }

  async searchOpenFoodFacts(barcode: string): Promise<any> {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        return data.product;
      }
      return null;
    } catch (error) {
      console.error('Error fetching from Open Food Facts:', error);
      return null;
    }
  }

  async importFromOpenFoodFacts(barcode: string, productData: any): Promise<FoodDatabaseItem> {
    const nutriments = productData.nutriments || {};
    
    const food: FoodDatabaseItem = {
      id: this.currentIds.foodDatabase++,
      name: productData.product_name || `Product ${barcode}`,
      brand: productData.brands?.split(',')[0]?.trim() || null,
      category: this.mapOpenFoodFactsCategory(productData.categories),
      servingSize: productData.serving_size || "100g",
      calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
      protein: Math.round(nutriments.proteins_100g || nutriments.proteins || 0),
      carbs: Math.round(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0),
      fat: Math.round(nutriments.fat_100g || nutriments.fat || 0),
      fiber: Math.round(nutriments.fiber_100g || nutriments.fiber || 0),
      sugar: Math.round(nutriments.sugars_100g || nutriments.sugars || 0),
      sodium: Math.round((nutriments.sodium_100g || nutriments.sodium || 0) * 1000), // Convert g to mg
      verified: true,
      barcode,
      source: "openfoodfacts",
      sourceId: barcode,
      contributedBy: null,
      imageUrl: productData.image_url || null,
      ingredients: productData.ingredients_text || null,
      allergens: productData.allergens_tags?.join(', ') || null,
      isHomemade: false,
      recipe: null,
      tags: this.extractTagsFromOpenFoodFacts(productData),
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.foodDatabaseItems.set(food.id, food);
    return food;
  }

  private mapOpenFoodFactsCategory(categories: string): string {
    if (!categories) return "food";
    const categoryStr = categories.toLowerCase();
    
    if (categoryStr.includes("snack")) return "snacks";
    if (categoryStr.includes("bread") || categoryStr.includes("bakery")) return "bakery";
    if (categoryStr.includes("dairy") || categoryStr.includes("milk") || categoryStr.includes("cheese")) return "dairy";
    if (categoryStr.includes("fruit") || categoryStr.includes("vegetable")) return "produce";
    if (categoryStr.includes("beverage") || categoryStr.includes("drink")) return "beverages";
    if (categoryStr.includes("meat") || categoryStr.includes("fish")) return "protein";
    
    return "food";
  }

  private extractTagsFromOpenFoodFacts(productData: any): string[] {
    const tags: string[] = [];
    
    if (productData.labels_tags) {
      productData.labels_tags.forEach((label: string) => {
        const cleanLabel = label.replace('en:', '').replace(/-/g, ' ');
        if (cleanLabel.length < 20) { // Only short, relevant tags
          tags.push(cleanLabel);
        }
      });
    }
    
    if (productData.categories_tags) {
      productData.categories_tags.slice(0, 3).forEach((cat: string) => {
        const cleanCat = cat.replace('en:', '').replace(/-/g, ' ');
        if (cleanCat.length < 15) {
          tags.push(cleanCat);
        }
      });
    }
    
    return tags.slice(0, 5); // Limit to 5 tags
  }

  async getPopularFoods(limit = 20): Promise<FoodDatabaseItem[]> {
    return Array.from(this.foodDatabaseItems.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  async getUserContributedFoods(characterId: number): Promise<FoodDatabaseItem[]> {
    return Array.from(this.foodDatabaseItems.values())
      .filter(food => food.contributedBy === characterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async incrementUsageCount(foodId: number): Promise<void> {
    const food = this.foodDatabaseItems.get(foodId);
    if (food) {
      food.usageCount++;
      food.updatedAt = new Date();
      this.foodDatabaseItems.set(foodId, food);
    }
  }

  // Workout Template methods
  async getWorkoutTemplates(category?: string, difficulty?: string): Promise<WorkoutTemplate[]> {
    let templates = Array.from(this.workoutTemplates.values());
    
    if (category) {
      templates = templates.filter(template => template.category === category);
    }
    
    if (difficulty) {
      templates = templates.filter(template => template.difficulty === difficulty);
    }
    
    return templates.sort((a, b) => b.usageCount - a.usageCount);
  }

  async getWorkoutTemplateById(id: number): Promise<WorkoutTemplate | undefined> {
    return this.workoutTemplates.get(id);
  }

  async createWorkoutTemplate(insertTemplate: InsertWorkoutTemplate): Promise<WorkoutTemplate> {
    const id = this.currentIds.workoutTemplates++;
    const template: WorkoutTemplate = {
      ...insertTemplate,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workoutTemplates.set(id, template);
    return template;
  }

  async searchWorkoutTemplates(query: string): Promise<WorkoutTemplate[]> {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return Array.from(this.workoutTemplates.values())
      .filter(template => {
        const searchText = `${template.name} ${template.description} ${template.tags?.join(' ') || ''}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      })
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  async getPopularWorkoutTemplates(limit = 10): Promise<WorkoutTemplate[]> {
    return Array.from(this.workoutTemplates.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  async incrementWorkoutTemplateUsage(templateId: number): Promise<void> {
    const template = this.workoutTemplates.get(templateId);
    if (template) {
      template.usageCount++;
      template.updatedAt = new Date();
      this.workoutTemplates.set(templateId, template);
    }
  }

  async fetchWgerWorkouts(): Promise<any> {
    try {
      // WGER API endpoint for workouts/exercises
      const response = await fetch('https://wger.de/api/v2/exercise/?language=2&limit=20');
      const data = await response.json();
      
      if (data.results) {
        return data.results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching from WGER API:', error);
      return [];
    }
  }

  async importFromWger(workoutData: any): Promise<WorkoutTemplate> {
    const template: WorkoutTemplate = {
      id: this.currentIds.workoutTemplates++,
      name: workoutData.name || `WGER Exercise ${workoutData.id}`,
      description: workoutData.description || "Exercise from WGER database",
      category: this.mapWgerCategory(workoutData.category),
      difficulty: "intermediate", // Default since WGER doesn't specify
      estimatedDuration: 20, // Default estimate
      estimatedCaloriesBurn: 150, // Default estimate
      exercises: [{
        name: workoutData.name,
        sets: 3,
        reps: 12,
        restTime: 60,
        description: workoutData.description
      }],
      equipment: workoutData.equipment?.map((eq: any) => eq.name) || [],
      targetMuscles: workoutData.muscles?.map((muscle: any) => muscle.name) || [],
      source: "wger",
      sourceId: workoutData.id?.toString(),
      imageUrl: null,
      instructions: workoutData.description || "",
      tags: ["wger", "exercise"],
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workoutTemplates.set(template.id, template);
    return template;
  }

  private mapWgerCategory(categoryId: number): string {
    // WGER category mapping
    const categoryMap: { [key: number]: string } = {
      1: "strength", // Arms
      2: "strength", // Legs
      3: "strength", // Abs
      4: "strength", // Chest
      5: "strength", // Back
      6: "strength", // Shoulders
      7: "cardio",   // Calves
      8: "strength"  // Generic
    };
    
    return categoryMap[categoryId] || "strength";
  }

  // Exercise methods (Physical Activities Compendium)
  async getExercises(category?: string): Promise<Exercise[]> {
    let exercises = Array.from(this.exercises.values());
    
    if (category) {
      exercises = exercises.filter(exercise => exercise.category === category);
    }
    
    return exercises.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = this.currentIds.exercises++;
    const exercise: Exercise = {
      ...insertExercise,
      id,
      createdAt: new Date(),
    };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return Array.from(this.exercises.values())
      .filter(exercise => {
        const searchText = `${exercise.name} ${exercise.description} ${exercise.muscleGroups?.join(' ') || ''}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Workout Session methods
  async getCharacterWorkoutSessions(characterId: number): Promise<WorkoutSession[]> {
    return Array.from(this.workoutSessions.values())
      .filter(session => session.characterId === characterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getWorkoutSessionById(id: number): Promise<WorkoutSession | undefined> {
    return this.workoutSessions.get(id);
  }

  async createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    const id = this.currentIds.workoutSessions++;
    const session: WorkoutSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      notes: insertSession.notes || null,
      xpGained: insertSession.xpGained || 0,
      totalDuration: insertSession.totalDuration || 0,
      totalCaloriesBurned: insertSession.totalCaloriesBurned || 0,
    };
    this.workoutSessions.set(id, session);
    return session;
  }

  async updateWorkoutSession(id: number, updates: Partial<InsertWorkoutSession>): Promise<WorkoutSession | undefined> {
    const session = this.workoutSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession: WorkoutSession = {
      ...session,
      ...updates,
      id,
    };
    this.workoutSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Exercise Entry methods
  async getExerciseEntriesBySession(sessionId: number): Promise<ExerciseEntry[]> {
    return Array.from(this.exerciseEntries.values())
      .filter(entry => entry.workoutSessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createExerciseEntry(insertEntry: InsertExerciseEntry): Promise<ExerciseEntry> {
    const id = this.currentIds.exerciseEntries++;
    const entry: ExerciseEntry = {
      ...insertEntry,
      id,
      createdAt: new Date(),
      duration: insertEntry.duration || null,
      notes: insertEntry.notes || null,
      sets: insertEntry.sets || null,
      reps: insertEntry.reps || null,
      weight: insertEntry.weight || null,
      distance: insertEntry.distance || null,
      intensity: insertEntry.intensity || null,
      elevation: insertEntry.elevation || null,
    };
    this.exerciseEntries.set(id, entry);
    return entry;
  }
}

export const storage = new MemStorage();
