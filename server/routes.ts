import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCharacterSchema, insertQuestSchema, insertActivitySchema,
  insertNutritionLogSchema, insertWorkoutLogSchema, insertAchievementSchema,
  insertFoodDatabaseSchema
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
        .filter(activity => activity.metadata && activity.metadata.caloriesBurned)
        .reduce((sum, activity) => sum + (activity.metadata!.caloriesBurned as number), 0);
      
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
      const food = await storage.getFoodByBarcode(barcode);
      
      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }
      
      res.json(food);
    } catch (error) {
      res.status(500).json({ message: "Failed to get food by barcode" });
    }
  });

  app.post("/api/food", async (req, res) => {
    try {
      const foodData = insertFoodDatabaseSchema.parse(req.body);
      const food = await storage.createFoodDatabaseItem(foodData);
      res.status(201).json(food);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create food item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
