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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isPopularDialogOpen, setIsPopularDialogOpen] = useState(false);
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
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
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests/active"] });
      
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
    
    // Close all discovery dialogs
    setIsSearchDialogOpen(false);
    setIsPopularDialogOpen(false);
    setIsRecipeDialogOpen(false);
    
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
    <div className="max-w-sm mx-auto fantasy-bg min-h-screen">
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
          <div className="grid grid-cols-4 gap-2">
            <button 
              className="rpg-button flex flex-col items-center p-3 text-center"
              onClick={() => setIsSearchDialogOpen(true)}
            >
              <Search className="w-5 h-5 mb-1" />
              <span className="text-xs rpg-text">Search</span>
            </button>
            <button 
              className="rpg-button flex flex-col items-center p-3 text-center" 
              onClick={() => setIsScannerOpen(true)}
            >
              <Camera className="w-5 h-5 mb-1" />
              <span className="text-xs rpg-text">Scan</span>
            </button>
            <button 
              className="rpg-button flex flex-col items-center p-3 text-center"
              onClick={() => setIsPopularDialogOpen(true)}
            >
              <TrendingUp className="w-5 h-5 mb-1" />
              <span className="text-xs rpg-text">Popular</span>
            </button>
            <button 
              className="rpg-button flex flex-col items-center p-3 text-center"
              onClick={() => setIsRecipeDialogOpen(true)}
            >
              <ChefHat className="w-5 h-5 mb-1" />
              <span className="text-xs rpg-text">Recipe</span>
            </button>
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
          <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-[90vw] max-h-[90vh] z-50 bg-parchment rounded-lg shadow-xl border border-wood-brown flex flex-col">
            <DialogHeader className="pb-4 border-b border-wood-brown/20 flex-shrink-0">
              <DialogTitle className="flex items-center gap-3 text-xl font-bold rpg-text text-wood-dark">
                <Apple className="w-6 h-6 text-fantasy-gold" />
                Add Meal
              </DialogTitle>
              <DialogDescription className="rpg-text opacity-70">
                Log your meal and gain XP for healthy eating
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto min-h-0 pr-2">
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
            </div>
          </DialogContent>
        </Dialog>

        {/* Food Search Dialog */}
        <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
          <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-4xl w-[95vw] max-h-[95vh] z-50 bg-parchment rounded-lg shadow-xl border border-wood-brown flex flex-col">
            <DialogHeader className="pb-4 border-b border-wood-brown/20 flex-shrink-0">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold rpg-text text-wood-dark">
                <Search className="w-8 h-8 text-fantasy-blue" />
                Food Database Search
              </DialogTitle>
              <DialogDescription className="rpg-text opacity-70">
                Search through thousands of foods from USDA and global databases
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto min-h-0 pr-2">
              <FoodDatabase onSelectFood={handleFoodSelection} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Popular Foods Dialog */}
        <Dialog open={isPopularDialogOpen} onOpenChange={setIsPopularDialogOpen}>
          <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-3xl w-[90vw] max-h-[90vh] z-50 bg-parchment rounded-lg shadow-xl border border-wood-brown flex flex-col">
            <DialogHeader className="pb-4 border-b border-wood-brown/20 flex-shrink-0">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold rpg-text text-wood-dark">
                <TrendingUp className="w-8 h-8 text-fantasy-purple" />
                Popular Foods in the Realm
              </DialogTitle>
              <DialogDescription className="rpg-text opacity-70">
                Quick access to foods commonly used by the community
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto min-h-0 pr-2">
              <PopularFoods onSelectFood={handleFoodSelection} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Recipe Creator Dialog */}
        <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
          <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-4xl w-[95vw] max-h-[95vh] z-50 bg-parchment rounded-lg shadow-xl border border-wood-brown flex flex-col">
            <DialogHeader className="pb-4 border-b border-wood-brown/20 flex-shrink-0">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold rpg-text text-wood-dark">
                <ChefHat className="w-8 h-8 text-fantasy-green" />
                Create Your Recipe
              </DialogTitle>
              <DialogDescription className="rpg-text opacity-70">
                Share your homemade recipes with the community and earn 25 XP
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto min-h-0 pr-2">
              <AddHomemadeFood onFoodAdded={handleHomemadeFoodAdded} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Recent Nutrition Logs */}
        <div className="rpg-card p-4">
          <h3 className="rpg-title text-fantasy-blue text-lg mb-4 text-center">Recent Meals</h3>
          <div className="space-y-3">
            {nutritionLogs && nutritionLogs.length > 0 ? (
              nutritionLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="rpg-card p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="rpg-title text-fantasy-gold">{log.foodName}</div>
                      <div className="rpg-text text-xs">{formatMealType(log.mealType)}</div>
                    </div>
                    <div className="text-right">
                      <div className="rpg-title text-fantasy-blue">{log.calories} cal</div>
                      <div className="rpg-text text-xs">
                        P:{log.protein}g C:{log.carbs}g F:{log.fat}g
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 rpg-text">
                <p>No meals logged yet</p>
                <p className="text-sm">Start your nutrition quest!</p>
              </div>
            )}
          </div>
        </div>
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