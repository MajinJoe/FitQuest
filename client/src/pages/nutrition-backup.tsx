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
      // Calculate XP based on calories (simple formula)
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
      // Auto-fill form with scanned product data
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
      <header className="p-4 glass-effect">
        <h1 className="text-2xl font-bold text-fantasy-gold flex items-center">
          <Apple className="mr-2" />
          Nutrition Sanctum
        </h1>
        <p className="text-gray-300">Track your nutritious adventures</p>
      </header>

      <main className="p-4 pb-20">
        {/* Today's Summary */}
        <Card className="mb-6 bg-slate-800 border-fantasy-green">
          <CardHeader>
            <CardTitle className="text-fantasy-green">Today's Nutrition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-fantasy-gold">{todayTotals.calories}</div>
                <div className="text-xs text-gray-400">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-fantasy-blue">{todayTotals.protein}g</div>
                <div className="text-xs text-gray-400">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-fantasy-purple">{todayTotals.carbs}g</div>
                <div className="text-xs text-gray-400">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{todayTotals.fat}g</div>
                <div className="text-xs text-gray-400">Fat</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Food Discovery */}
        <Card className="mb-6 bg-slate-800 border-fantasy-purple">
          <CardHeader>
            <CardTitle className="text-fantasy-purple">Food Discovery</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="search">
                  <Search className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="scan">
                  <Camera className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="popular">
                  <TrendingUp className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="homemade">
                  <ChefHat className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search">
                <FoodDatabase onSelectFood={handleFoodSelection} />
              </TabsContent>

              <TabsContent value="scan">
                <Button 
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full bg-fantasy-blue hover:bg-blue-600 text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Product Barcode
                </Button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Scans real products and imports from Open Food Facts
                </p>
              </TabsContent>

              <TabsContent value="popular">
                <PopularFoods onSelectFood={handleFoodSelection} />
              </TabsContent>

              <TabsContent value="homemade">
                <AddHomemadeFood onFoodAdded={handleHomemadeFoodAdded} />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Add your recipes to the community database
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-fantasy-green hover:bg-green-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Log New Meal
            </Button>
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
                  className="w-full bg-fantasy-green hover:bg-green-600"
                  disabled={nutritionMutation.isPending}
                >
                  {nutritionMutation.isPending ? "Logging..." : "Log Meal"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>

        {/* Barcode Scanner */}
        <BarcodeScanner 
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanResult={handleBarcodeResult}
        />

        {/* Recent Meals */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-light-text">Recent Meals</h2>
          {nutritionLogs?.slice(0, 10).map((log) => (
            <Card key={log.id} className="bg-slate-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-light-text">{log.foodName}</h3>
                    <p className="text-sm text-fantasy-green">{formatMealType(log.mealType)}</p>
                  </div>
                  <span className="text-fantasy-gold font-bold text-sm">+{log.xpGained} XP</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-400">
                  <div>{log.calories} cal</div>
                  <div>{log.protein}g protein</div>
                  <div>{log.carbs}g carbs</div>
                  <div>{log.fat}g fat</div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!nutritionLogs || nutritionLogs.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <Apple className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No meals logged yet.</p>
              <p className="text-sm">Start your nutrition journey!</p>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation currentPath="/nutrition" />
    </div>
  );
}
