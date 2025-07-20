import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BottomNavigation from "@/components/bottom-navigation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { NutritionLog } from "@shared/schema";

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

        {/* Add Meal Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-6 bg-fantasy-green hover:bg-green-600 text-white">
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
