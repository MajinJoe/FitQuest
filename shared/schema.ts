import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: integer("level").notNull().default(1),
  currentXP: integer("current_xp").notNull().default(0),
  nextLevelXP: integer("next_level_xp").notNull().default(100),
  avatarUrl: text("avatar_url").notNull().default("https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"),
  class: text("class").notNull().default("Warrior of Wellness"),
  totalXP: integer("total_xp").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'cardio', 'nutrition', 'hydration', 'strength'
  targetValue: integer("target_value").notNull(),
  currentProgress: integer("current_progress").notNull().default(0),
  xpReward: integer("xp_reward").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  isDaily: boolean("is_daily").notNull().default(true),
  difficulty: text("difficulty").notNull().default("normal"), // 'easy', 'normal', 'hard'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  type: text("type").notNull(), // 'nutrition', 'workout', 'hydration'
  description: text("description").notNull(),
  xpGained: integer("xp_gained").notNull(),
  metadata: json("metadata"), // Additional data like calories, duration, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nutritionLogs = pgTable("nutrition_logs", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  foodName: text("food_name").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull().default(0),
  carbs: integer("carbs").notNull().default(0),
  fat: integer("fat").notNull().default(0),
  mealType: text("meal_type").notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
  xpGained: integer("xp_gained").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutLogs = pgTable("workout_logs", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  workoutType: text("workout_type").notNull(),
  duration: integer("duration").notNull(), // in minutes
  intensity: text("intensity").notNull(), // 'light', 'moderate', 'intense'
  caloriesBurned: integer("calories_burned").notNull(),
  xpGained: integer("xp_gained").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").notNull(),
  icon: text("icon").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const foodDatabase = pgTable("food_database", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  category: text("category").notNull(), // 'snacks', 'bakery', 'restaurant', 'produce', etc.
  servingSize: text("serving_size").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull().default(0),
  carbs: integer("carbs").notNull().default(0),
  fat: integer("fat").notNull().default(0),
  fiber: integer("fiber").default(0),
  sugar: integer("sugar").default(0),
  sodium: integer("sodium").default(0), // in mg
  verified: boolean("verified").notNull().default(true),
  barcode: text("barcode"), // UPC/EAN for barcode scanning
  source: text("source").notNull().default("manual"), // 'openfoodfacts', 'user', 'manual', 'admin'
  sourceId: text("source_id"), // External ID from Open Food Facts or other APIs
  contributedBy: integer("contributed_by"), // Character ID who added this food
  imageUrl: text("image_url"), // Product or meal photo
  ingredients: text("ingredients"), // Comma-separated list
  allergens: text("allergens"), // Common allergens present
  isHomemade: boolean("is_homemade").notNull().default(false),
  recipe: text("recipe"), // For homemade meals
  tags: text("tags").array(), // Searchable tags like 'vegan', 'gluten-free', etc.
  usageCount: integer("usage_count").notNull().default(0), // Track popularity
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

export const insertQuestSchema = createInsertSchema(quests).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertNutritionLogSchema = createInsertSchema(nutritionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertFoodDatabaseSchema = createInsertSchema(foodDatabase).omit({
  id: true,
  createdAt: true,
});

// Types
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type NutritionLog = typeof nutritionLogs.$inferSelect;
export type InsertNutritionLog = z.infer<typeof insertNutritionLogSchema>;

export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type FoodDatabaseItem = typeof foodDatabase.$inferSelect;
export type InsertFoodDatabaseItem = z.infer<typeof insertFoodDatabaseSchema>;
