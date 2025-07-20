import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BottomNavigation from "@/components/bottom-navigation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { WorkoutLog } from "@shared/schema";

const workoutSchema = z.object({
  workoutType: z.string().min(1, "Workout type is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  intensity: z.enum(["light", "moderate", "intense"]),
  caloriesBurned: z.number().min(0, "Calories burned must be at least 0"),
  notes: z.string().optional(),
});

export default function Workouts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workoutLogs } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: todayLogs } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workouts/today"],
  });

  const form = useForm<z.infer<typeof workoutSchema>>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      workoutType: "",
      duration: 0,
      intensity: "moderate",
      caloriesBurned: 0,
      notes: "",
    },
  });

  const workoutMutation = useMutation({
    mutationFn: async (data: z.infer<typeof workoutSchema>) => {
      // Calculate XP based on duration and intensity
      const intensityMultiplier = { light: 1, moderate: 1.5, intense: 2 };
      const xpGained = Math.floor(data.duration * intensityMultiplier[data.intensity] * 3);
      
      const response = await apiRequest("POST", "/api/workouts", {
        ...data,
        xpGained,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/character"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      
      toast({
        title: "Workout Completed!",
        description: "Great job! XP earned for your training!",
      });
      
      form.reset();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log workout",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof workoutSchema>) => {
    workoutMutation.mutate(data);
  };

  const todayTotals = todayLogs?.reduce(
    (totals, log) => ({
      totalDuration: totals.totalDuration + log.duration,
      totalCalories: totals.totalCalories + log.caloriesBurned,
      workoutCount: totals.workoutCount + 1,
    }),
    { totalDuration: 0, totalCalories: 0, workoutCount: 0 }
  ) || { totalDuration: 0, totalCalories: 0, workoutCount: 0 };

  const formatIntensity = (intensity: string) => {
    return intensity.charAt(0).toUpperCase() + intensity.slice(1);
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'light':
        return 'text-fantasy-green';
      case 'moderate':
        return 'text-fantasy-blue';
      case 'intense':
        return 'text-fantasy-purple';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-slate-900 min-h-screen fantasy-bg">
      <header className="p-4 glass-effect">
        <h1 className="text-2xl font-bold text-fantasy-purple flex items-center">
          <Dumbbell className="mr-2" />
          Training Grounds
        </h1>
        <p className="text-gray-300">Build strength and earn XP</p>
      </header>

      <main className="p-4 pb-20">
        {/* Today's Summary */}
        <Card className="mb-6 bg-slate-800 border-fantasy-purple">
          <CardHeader>
            <CardTitle className="text-fantasy-purple">Today's Training</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-fantasy-gold">{todayTotals.workoutCount}</div>
                <div className="text-xs text-gray-400">Workouts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-fantasy-blue">{todayTotals.totalDuration}</div>
                <div className="text-xs text-gray-400">Minutes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-fantasy-green">{todayTotals.totalCalories}</div>
                <div className="text-xs text-gray-400">Calories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Workout Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-6 bg-fantasy-purple hover:bg-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Log New Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-fantasy-purple">
            <DialogHeader>
              <DialogTitle className="text-fantasy-gold">Add Workout</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="workoutType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-light-text">Workout Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Running, Weight Training, Yoga" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-light-text">Duration (min)</FormLabel>
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
                    name="caloriesBurned"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-light-text">Calories Burned</FormLabel>
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

                <FormField
                  control={form.control}
                  name="intensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-light-text">Intensity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select intensity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="intense">Intense</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-light-text">Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How did it feel? Any achievements?"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-fantasy-purple hover:bg-purple-600"
                  disabled={workoutMutation.isPending}
                >
                  {workoutMutation.isPending ? "Logging..." : "Complete Workout"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Recent Workouts */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-light-text">Recent Workouts</h2>
          {workoutLogs?.slice(0, 10).map((log) => (
            <Card key={log.id} className="bg-slate-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-light-text">{log.workoutType}</h3>
                    <p className="text-sm text-gray-400">{log.duration} minutes</p>
                  </div>
                  <span className="text-fantasy-gold font-bold text-sm">+{log.xpGained} XP</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-medium ${getIntensityColor(log.intensity)}`}>
                    {formatIntensity(log.intensity)}
                  </span>
                  <span className="text-gray-400">{log.caloriesBurned} calories burned</span>
                </div>
                {log.notes && (
                  <p className="text-xs text-gray-500 mt-2 italic">{log.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}

          {(!workoutLogs || workoutLogs.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No workouts logged yet.</p>
              <p className="text-sm">Begin your training!</p>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation currentPath="/workouts" />
    </div>
  );
}
