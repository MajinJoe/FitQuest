import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Apple, Camera, Search, TrendingUp, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from "@/components/bottom-navigation";
import BarcodeScanner from "@/components/barcode-scanner";
import FoodDatabase from "@/components/food-database";
import AddHomemadeFood from "@/components/add-homemade-food";
import PopularFoods from "@/components/popular-foods";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { NutritionLog, FoodDatabaseItem } from "@shared/schema";

const nutritionSchema = z.object({
  foodName: z.string().min(1, "Food name is required"),
  calories: z.number().min(1, "Calories must be at least 1"),
  protein: z.number().min(0, "Protein must be at least 0"),
  carbs: z.number().min(0, "Carbs must be at least 0"),
  fat: z.number().min(0, "Fat must be at least 0"),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
});

export default function Nutrition() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: nutritionLogs } = useQuery<NutritionLog[]>({
    queryKey: ["/api/nutrition"],
  });

  const { data: todayLogs } = useQuery<NutritionLog[]>({
    queryKey: ["/api/nutrition/today"],
  });

  const form = useForm<z.infer<typeof nutritionSchema>>({
    resolver: zodResolver(nutritionSchema),
    defaultValues: {
      foodName: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      mealType: "breakfast",
    },
  });

  const nutritionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof nutritionSchema>) => {
      const xpGained = Math.floor(data.calories / 10) + (data.protein > 0 ? 20 : 0);
      
      const response = await apiRequest("POST", "/api/nutrition", {
        ...data,
        xpGained,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/character"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      
      toast({
        title: "Meal Logged!",
        description: "XP gained for nutritious eating!",
      });
      
      form.reset();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log meal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof nutritionSchema>) => {
    nutritionMutation.mutate(data);
  };

  // Handle barcode scan result with enhanced feedback
  const handleBarcodeResult = (barcode: string, productData?: FoodDatabaseItem | null) => {
    if (productData) {
      form.setValue("foodName", productData.name);
      form.setValue("calories", productData.calories || 0);
      form.setValue("protein", productData.protein || 0);
      form.setValue("carbs", productData.carbs || 0);
      form.setValue("fat", productData.fat || 0);
      
      const sourceText = productData.source === "openfoodfacts" ? "imported from Open Food Facts" : "found in database";
      
      toast({
        title: `Product ${productData.source === "openfoodfacts" ? "Imported!" : "Found!"}`,
        description: `${productData.name}${productData.brand ? ` by ${productData.brand}` : ''} - ${sourceText}`,
      });
      
      setIsDialogOpen(true);
    } else {
      toast({
        title: "Product Not Found",
        description: `Barcode ${barcode} not found. Try adding it to the database!`,
        variant: "destructive",
      });
    }
    setIsScannerOpen(false);
  };

  // Handle food database selection with usage tracking
  const handleFoodSelection = (food: FoodDatabaseItem) => {
    form.setValue("foodName", food.name);
    form.setValue("calories", food.calories);
    form.setValue("protein", food.protein);
    form.setValue("carbs", food.carbs);
    form.setValue("fat", food.fat);
    
    // Track food usage for analytics
    fetch(`/api/food/${food.id}/use`, { method: 'POST' }).catch(console.error);
    
    toast({
      title: "Food Selected!",
      description: `${food.name} nutrition data loaded${food.isHomemade ? ' (homemade recipe)' : ''}`,
    });
    
    setIsDialogOpen(true);
  };

  // Handle newly added homemade food
  const handleHomemadeFoodAdded = (food: FoodDatabaseItem) => {
    handleFoodSelection(food);
    toast({
      title: "Homemade Food Added!",
      description: `"${food.name}" is now available in the community database (+25 XP)`,
    });
  };

  const todayTotals = todayLogs?.reduce(
    (totals, log) => ({
      calories: totals.calories + log.calories,
      protein: totals.protein + log.protein,
      carbs: totals.carbs + log.carbs,
      fat: totals.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const formatMealType = (mealType: string) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  return (
    <div className="max-w-sm mx-auto bg-slate-900 min-h-screen fantasy-bg">
      <div className="rpg-card m-4 p-4">
        <h1 className="rpg-title text-2xl flex items-center justify-center mb-2">
          <Apple className="mr-3 text-fantasy-green" size={28} />
          Nutrition Quest
        </h1>
        <p className="rpg-text text-center">Track meals, discover foods, and level up</p>
      </div>

      <main className="p-4 pb-20">
        {/* Today's Summary */}
        <div className="rpg-card mb-6 p-4">
          <h3 className="rpg-title text-fantasy-green text-lg mb-4 text-center">Today's Nutrition</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center rpg-card p-3">
              <div className="text-2xl font-bold text-fantasy-gold rpg-title">{todayTotals.calories}</div>
              <div className="rpg-text text-xs">Calories</div>
            </div>
            <div className="text-center rpg-card p-3">
              <div className="text-2xl font-bold text-fantasy-blue rpg-title">{todayTotals.protein}g</div>
              <div className="rpg-text text-xs">Protein</div>
            </div>
            <div className="text-center rpg-card p-3">
              <div className="text-2xl font-bold text-fantasy-purple rpg-title">{todayTotals.carbs}g</div>
              <div className="rpg-text text-xs">Carbs</div>
            </div>
            <div className="text-center rpg-card p-3">
              <div className="text-2xl font-bold text-yellow-600 rpg-title">{todayTotals.fat}g</div>
              <div className="rpg-text text-xs">Fat</div>
            </div>
          </div>
        </div>

        {/* Enhanced Food Discovery */}
        <div className="rpg-card mb-6 p-4">
          <h3 className="rpg-title text-fantasy-purple text-lg mb-4 text-center">Food Discovery</h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button className="rpg-button flex flex-col items-center p-3 text-center">
              <Search className="w-5 h-5 mb-1" />
              <span className="text-xs rpg-text">Search</span>
            </button>
            <button className="rpg-button flex flex-col items-center p-3 text-center" onClick={() => setIsScannerOpen(true)}>
              <Camera className="w-5 h-5 mb-1" />
              <span className="text-xs rpg-text">Scan</span>
            </button>
            <button className="rpg-button flex flex-col items-center p-3 text-center">
              <TrendingUp className="w-5 h-5 mb-1" />
              <span className="text-xs rpg-text">Popular</span>
            </button>
            <button className="rpg-button flex flex-col items-center p-3 text-center">
              <ChefHat className="w-5 h-5 mb-1" />
              <span className="text-xs rpg-text">Recipe</span>
            </button>
          </div>

          <div className="rpg-card p-4 mb-4">
            <FoodDatabase onSelectFood={handleFoodSelection} />
          </div>
        </div>

        <button 
          onClick={() => setIsDialogOpen(true)}
          className="w-full rpg-button p-4 text-lg rounded-lg mb-6"
        >
          <Plus className="w-5 h-5 mr-3" />
          Log New Meal
        </button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div style={{ display: 'none' }} />
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-fantasy-green">
            <DialogHeader>
              <DialogTitle className="text-fantasy-gold">Add Meal</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="foodName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-light-text">Food Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Grilled chicken salad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-light-text">Meal Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select meal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-light-text">Calories</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-light-text">Protein (g)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="carbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-light-text">Carbs (g)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-light-text">Fat (g)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-fantasy-gold hover:bg-yellow-600 text-slate-900" 
                  disabled={nutritionMutation.isPending}
                >
                  {nutritionMutation.isPending ? "Logging..." : "Log Meal & Gain XP"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Recent Nutrition Logs */}
        <Card className="bg-slate-800 border-fantasy-blue">
          <CardHeader>
            <CardTitle className="text-fantasy-blue">Recent Meals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nutritionLogs && nutritionLogs.length > 0 ? (
                nutritionLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-2 bg-slate-700 rounded">
                    <div>
                      <div className="font-medium text-fantasy-gold">{log.foodName}</div>
                      <div className="text-xs text-gray-400">{formatMealType(log.mealType)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-fantasy-blue font-medium">{log.calories} cal</div>
                      <div className="text-xs text-gray-400">
                        P:{log.protein}g C:{log.carbs}g F:{log.fat}g
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No meals logged yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <BarcodeScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanResult={handleBarcodeResult}
      />

      <BottomNavigation currentPath="/nutrition" />
    </div>
  );
}