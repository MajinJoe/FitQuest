import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCharacterSchema, insertQuestSchema, insertActivitySchema,
  insertNutritionLogSchema, insertWorkoutLogSchema, insertAchievementSchema,
  insertFoodDatabaseSchema, insertWorkoutTemplateSchema,
  insertExerciseSchema, insertWorkoutSessionSchema, insertExerciseEntrySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const characterId = 1; // Default character for demo

  // Character routes
  app.get("/api/character", async (req, res) => {
    try {
      const character = await storage.getCharacter(characterId);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to get character" });
    }
  });

  app.patch("/api/character", async (req, res) => {
    try {
      const updateSchema = insertCharacterSchema.partial();
      const updates = updateSchema.parse(req.body);
      const character = await storage.updateCharacter(characterId, updates);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update character" });
    }
  });

  // Quest routes
  app.get("/api/quests", async (req, res) => {
    try {
      const quests = await storage.getCharacterQuests(characterId);
      res.json(quests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quests" });
    }
  });

  app.get("/api/quests/active", async (req, res) => {
    try {
      const quests = await storage.getActiveQuests(characterId);
      res.json(quests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get active quests" });
    }
  });

  app.post("/api/quests", async (req, res) => {
    try {
      const questData = insertQuestSchema.parse({
        ...req.body,
        characterId,
      });
      const quest = await storage.createQuest(questData);
      res.status(201).json(quest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quest" });
    }
  });

  app.patch("/api/quests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertQuestSchema.partial();
      const updates = updateSchema.parse(req.body);
      const quest = await storage.updateQuest(id, updates);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }
      res.json(quest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update quest" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getCharacterActivities(characterId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse({
        ...req.body,
        characterId,
      });
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  // Nutrition routes
  app.get("/api/nutrition", async (req, res) => {
    try {
      const logs = await storage.getCharacterNutritionLogs(characterId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get nutrition logs" });
    }
  });

  app.get("/api/nutrition/today", async (req, res) => {
    try {
      const logs = await storage.getTodayNutritionLogs(characterId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get today's nutrition logs" });
    }
  });

  app.post("/api/nutrition", async (req, res) => {
    try {
      const nutritionData = insertNutritionLogSchema.parse({
        ...req.body,
        characterId,
      });
      const log = await storage.createNutritionLog(nutritionData);
      
      // Create activity for XP gain
      await storage.createActivity({
        characterId,
        type: "nutrition",
        description: `Logged ${nutritionData.mealType} - ${nutritionData.foodName}`,
        xpGained: nutritionData.xpGained,
        metadata: { 
          calories: nutritionData.calories,
          mealType: nutritionData.mealType 
        },
      });

      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create nutrition log" });
    }
  });

  // Workout routes
  app.get("/api/workouts", async (req, res) => {
    try {
      const logs = await storage.getCharacterWorkoutLogs(characterId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workout logs" });
    }
  });

  app.get("/api/workouts/today", async (req, res) => {
    try {
      const logs = await storage.getTodayWorkoutLogs(characterId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get today's workout logs" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutLogSchema.parse({
        ...req.body,
        characterId,
      });
      const log = await storage.createWorkoutLog(workoutData);
      
      // Create activity for XP gain
      await storage.createActivity({
        characterId,
        type: "workout",
        description: `Completed ${workoutData.workoutType} - ${workoutData.duration} min`,
        xpGained: workoutData.xpGained,
        metadata: { 
          duration: workoutData.duration,
          caloriesBurned: workoutData.caloriesBurned 
        },
      });

      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout log" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getCharacterAchievements(characterId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  // Daily stats calculation
  app.get("/api/stats/daily", async (req, res) => {
    try {
      const todayActivities = await storage.getCharacterActivities(characterId, 50);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysActivities = todayActivities.filter(activity => 
        activity.createdAt >= today
      );

      const xpGained = todaysActivities.reduce((sum, activity) => sum + activity.xpGained, 0);
      const caloriesBurned = todaysActivities
        .filter(activity => activity.metadata && typeof activity.metadata === 'object' && 'caloriesBurned' in activity.metadata)
        .reduce((sum, activity) => sum + (activity.metadata as any).caloriesBurned, 0);
      
      const workoutsCompleted = todaysActivities.filter(activity => 
        activity.type === "workout"
      ).length;

      res.json({
        xpGained,
        caloriesBurned,
        workoutsCompleted,
        totalWorkouts: 3, // Target for the day
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get daily stats" });
    }
  });

  // XP gain endpoint
  app.post("/api/character/xp", async (req, res) => {
    try {
      const { amount, description } = req.body;
      if (!amount || !description) {
        return res.status(400).json({ message: "Amount and description required" });
      }

      const character = await storage.getCharacter(characterId);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      let newCurrentXP = character.currentXP + amount;
      let newLevel = character.level;
      let nextLevelXP = character.nextLevelXP;
      let leveledUp = false;

      // Check for level up
      while (newCurrentXP >= nextLevelXP) {
        newCurrentXP -= nextLevelXP;
        newLevel++;
        nextLevelXP = Math.floor(100 * Math.pow(1.5, newLevel - 1));
        leveledUp = true;
      }

      const updatedCharacter = await storage.updateCharacter(characterId, {
        currentXP: newCurrentXP,
        level: newLevel,
        nextLevelXP,
        totalXP: character.totalXP + amount,
      });

      // Create activity
      await storage.createActivity({
        characterId,
        type: "xp_gain",
        description,
        xpGained: amount,
      });

      res.json({
        character: updatedCharacter,
        leveledUp,
        xpGained: amount,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to gain XP" });
    }
  });

  // Food Database routes
  app.get("/api/food/search", async (req, res) => {
    try {
      const { q: query, category } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const foods = await storage.searchFoodDatabase(
        query, 
        category && typeof category === 'string' ? category : undefined
      );
      
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to search food database" });
    }
  });

  app.get("/api/food/barcode/:barcode", async (req, res) => {
    try {
      const { barcode } = req.params;
      
      // First check our local database
      let food = await storage.getFoodByBarcode(barcode);
      
      if (!food) {
        // Try to fetch from Open Food Facts
        const openFoodFactsData = await storage.searchOpenFoodFacts(barcode);
        
        if (openFoodFactsData) {
          // Import the product from Open Food Facts
          food = await storage.importFromOpenFoodFacts(barcode, openFoodFactsData);
          
          res.json({
            ...food,
            isNewImport: true,
            source: "openfoodfacts"
          });
          return;
        }
        
        return res.status(404).json({ 
          message: "Product not found in database or Open Food Facts",
          barcode 
        });
      }
      
      // Increment usage count for existing foods
      await storage.incrementUsageCount(food.id);
      
      res.json(food);
    } catch (error) {
      console.error('Barcode lookup error:', error);
      res.status(500).json({ message: "Failed to get food by barcode" });
    }
  });

  app.post("/api/food", async (req, res) => {
    try {
      const foodData = insertFoodDatabaseSchema.parse({
        ...req.body,
        contributedBy: req.body.contributedBy || characterId, // Default to current character
        source: req.body.source || "user",
      });
      
      const food = await storage.createFoodDatabaseItem(foodData);
      
      // Award XP for contributing to the database
      await storage.createActivity({
        characterId,
        type: "food_contribution",
        description: `Added "${food.name}" to the food database`,
        xpGained: 25,
        metadata: { foodId: food.id, isHomemade: food.isHomemade },
      });
      
      res.status(201).json(food);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create food item" });
    }
  });

  app.get("/api/food/popular", async (req, res) => {
    try {
      const { limit } = req.query;
      const popularFoods = await storage.getPopularFoods(
        limit ? parseInt(limit as string) : 20
      );
      res.json(popularFoods);
    } catch (error) {
      res.status(500).json({ message: "Failed to get popular foods" });
    }
  });

  app.get("/api/food/user-contributions", async (req, res) => {
    try {
      const userFoods = await storage.getUserContributedFoods(characterId);
      res.json(userFoods);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user contributions" });
    }
  });

  app.post("/api/food/:id/use", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementUsageCount(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to increment usage count" });
    }
  });

  // Workout Template routes
  app.get("/api/workout-templates", async (req, res) => {
    try {
      const { category, difficulty } = req.query;
      const templates = await storage.getWorkoutTemplates(
        category && typeof category === 'string' ? category : undefined,
        difficulty && typeof difficulty === 'string' ? difficulty : undefined
      );
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workout templates" });
    }
  });

  app.get("/api/workout-templates/search", async (req, res) => {
    try {
      const { q: query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const templates = await storage.searchWorkoutTemplates(query);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to search workout templates" });
    }
  });

  app.get("/api/workout-templates/popular", async (req, res) => {
    try {
      const { limit } = req.query;
      const popularTemplates = await storage.getPopularWorkoutTemplates(
        limit ? parseInt(limit as string) : 10
      );
      res.json(popularTemplates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get popular workout templates" });
    }
  });

  app.get("/api/workout-templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getWorkoutTemplateById(parseInt(id));
      
      if (!template) {
        return res.status(404).json({ message: "Workout template not found" });
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workout template" });
    }
  });

  app.post("/api/workout-templates", async (req, res) => {
    try {
      const templateData = insertWorkoutTemplateSchema.parse(req.body);
      const template = await storage.createWorkoutTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout template" });
    }
  });

  app.post("/api/workout-templates/:id/use", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementWorkoutTemplateUsage(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to increment workout template usage" });
    }
  });

  app.get("/api/wger/exercises", async (req, res) => {
    try {
      const exercises = await storage.fetchWgerWorkouts();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WGER exercises" });
    }
  });

  app.post("/api/wger/import", async (req, res) => {
    try {
      const { exerciseData } = req.body;
      
      if (!exerciseData) {
        return res.status(400).json({ message: "Exercise data required" });
      }
      
      const template = await storage.importFromWger(exerciseData);
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to import from WGER" });
    }
  });

  // Exercise routes (Physical Activities Compendium)
  app.get("/api/exercises", async (req, res) => {
    try {
      const { category } = req.query;
      const exercises = await storage.getExercises(category as string);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exercises" });
    }
  });

  app.get("/api/exercises/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }
      const exercises = await storage.searchExercises(q);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to search exercises" });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const exercise = await storage.getExerciseById(parseInt(id));
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exercise" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  // Workout Session routes
  app.get("/api/workout-sessions", async (req, res) => {
    try {
      const sessions = await storage.getCharacterWorkoutSessions(characterId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workout sessions" });
    }
  });

  app.get("/api/workout-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getWorkoutSessionById(parseInt(id));
      
      if (!session) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workout session" });
    }
  });

  app.post("/api/workout-sessions", async (req, res) => {
    try {
      const sessionData = insertWorkoutSessionSchema.parse({
        ...req.body,
        characterId,
      });
      const session = await storage.createWorkoutSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout session" });
    }
  });

  // Exercise Entry routes
  app.get("/api/workout-sessions/:sessionId/exercises", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const entries = await storage.getExerciseEntriesBySession(parseInt(sessionId));
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exercise entries" });
    }
  });

  app.post("/api/exercise-entries", async (req, res) => {
    try {
      const entryData = insertExerciseEntrySchema.parse(req.body);
      const entry = await storage.createExerciseEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exercise entry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
