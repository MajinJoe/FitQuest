import { 
  characters, quests, activities, nutritionLogs, workoutLogs, achievements, foodDatabase,
  type Character, type InsertCharacter,
  type Quest, type InsertQuest,
  type Activity, type InsertActivity,
  type NutritionLog, type InsertNutritionLog,
  type WorkoutLog, type InsertWorkoutLog,
  type Achievement, type InsertAchievement,
  type FoodDatabaseItem, type InsertFoodDatabaseItem
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
  
  // Food Database methods
  searchFoodDatabase(query: string, category?: string): Promise<FoodDatabaseItem[]>;
  getFoodByBarcode(barcode: string): Promise<FoodDatabaseItem | undefined>;
  createFoodDatabaseItem(food: InsertFoodDatabaseItem): Promise<FoodDatabaseItem>;
  searchOpenFoodFacts(barcode: string): Promise<any>;
  importFromOpenFoodFacts(barcode: string, productData: any): Promise<FoodDatabaseItem>;
  getPopularFoods(limit?: number): Promise<FoodDatabaseItem[]>;
  getUserContributedFoods(characterId: number): Promise<FoodDatabaseItem[]>;
  incrementUsageCount(foodId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private characters: Map<number, Character>;
  private quests: Map<number, Quest>;
  private activities: Map<number, Activity>;
  private nutritionLogs: Map<number, NutritionLog>;
  private workoutLogs: Map<number, WorkoutLog>;
  private achievements: Map<number, Achievement>;
  private foodDatabaseItems: Map<number, FoodDatabaseItem>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.characters = new Map();
    this.quests = new Map();
    this.activities = new Map();
    this.nutritionLogs = new Map();
    this.workoutLogs = new Map();
    this.achievements = new Map();
    this.foodDatabaseItems = new Map();
    this.currentIds = {
      characters: 1,
      quests: 1,
      activities: 1,
      nutritionLogs: 1,
      workoutLogs: 1,
      achievements: 1,
      foodDatabase: 1,
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
}

export const storage = new MemStorage();
