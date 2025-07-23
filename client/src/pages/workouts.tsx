import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Dumbbell, Play, Clock, Flame, Target, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from "@/components/bottom-navigation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { WorkoutLog, WorkoutTemplate } from "@shared/schema";

const workoutSchema = z.object({
  workoutType: z.string().min(1, "Workout type is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  intensity: z.enum(["light", "moderate", "intense"]),
  caloriesBurned: z.number().min(0, "Calories burned must be at least 0"),
  notes: z.string().optional(),
});

export default function Workouts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("log");
  const [templateFilter, setTemplateFilter] = useState({ category: "", difficulty: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workoutLogs } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: todayLogs } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workouts/today"],
  });

  const { data: workoutTemplates } = useQuery<WorkoutTemplate[]>({
    queryKey: ["/api/workout-templates", templateFilter.category, templateFilter.difficulty],
    queryFn: () => {
      const params = new URLSearchParams();
      if (templateFilter.category && templateFilter.category !== 'all') params.append('category', templateFilter.category);
      if (templateFilter.difficulty && templateFilter.difficulty !== 'all') params.append('difficulty', templateFilter.difficulty);
      return fetch(`/api/workout-templates?${params}`).then(res => res.json());
    },
  });

  const { data: searchResults } = useQuery<WorkoutTemplate[]>({
    queryKey: ["/api/workout-templates/search", searchQuery],
    queryFn: () => {
      if (!searchQuery.trim()) return [];
      return fetch(`/api/workout-templates/search?q=${encodeURIComponent(searchQuery)}`).then(res => res.json());
    },
    enabled: searchQuery.trim().length > 0,
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

  const startTemplateMutation = useMutation({
    mutationFn: async (template: WorkoutTemplate) => {
      // Increment usage count for the template
      await apiRequest("POST", `/api/workout-templates/${template.id}/use`, {});
      
      // Calculate XP based on estimated duration and average intensity (moderate)
      const xpGained = Math.floor(template.estimatedDuration * 1.5 * 3);
      
      const response = await apiRequest("POST", "/api/workouts", {
        workoutType: template.name,
        duration: template.estimatedDuration,
        intensity: "moderate" as const,
        caloriesBurned: template.estimatedCaloriesBurn,
        xpGained,
        notes: `Completed preset workout: ${template.description}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/character"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-templates"] });
      
      toast({
        title: "Workout Completed!",
        description: "Awesome! You earned XP for completing this preset workout!",
      });
      
      setSelectedTemplate(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete workout",
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
    <div className="max-w-sm mx-auto fantasy-bg min-h-screen">
      <div className="rpg-card m-4 p-4">
        <h1 className="rpg-title text-2xl flex items-center justify-center mb-2">
          <Dumbbell className="mr-3 text-fantasy-purple" size={28} />
          Training Grounds
        </h1>
        <p className="rpg-text text-center">Build strength and earn XP</p>
      </div>

      <main className="p-4 pb-20">
        {/* Today's Summary */}
        <div className="rpg-card mb-6 p-4">
          <h3 className="rpg-title text-fantasy-purple text-lg mb-4 text-center">Today's Training</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rpg-card p-3">
              <div className="text-2xl font-bold text-fantasy-gold rpg-title">{todayTotals.workoutCount}</div>
              <div className="rpg-text text-xs">Workouts</div>
            </div>
            <div className="rpg-card p-3">
              <div className="text-2xl font-bold text-fantasy-blue rpg-title">{todayTotals.totalDuration}</div>
              <div className="rpg-text text-xs">Minutes</div>
            </div>
            <div className="rpg-card p-3">
              <div className="text-2xl font-bold text-fantasy-green rpg-title">{todayTotals.totalCalories}</div>
              <div className="rpg-text text-xs">Calories</div>
            </div>
          </div>
        </div>

        {/* Workout Tabs */}
        <div className="rpg-card mb-6 p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button 
              onClick={() => setActiveTab("log")}
              className={`rpg-button p-3 text-center ${activeTab === "log" ? "bg-fantasy-purple text-white" : ""}`}
            >
              <span className="rpg-text text-sm">Log</span>
            </button>
            <button 
              onClick={() => setActiveTab("presets")}
              className={`rpg-button p-3 text-center ${activeTab === "presets" ? "bg-fantasy-purple text-white" : ""}`}
            >
              <span className="rpg-text text-sm">Presets</span>
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`rpg-button p-3 text-center ${activeTab === "history" ? "bg-fantasy-purple text-white" : ""}`}
            >
              <span className="rpg-text text-sm">History</span>
            </button>
          </div>

          {/* Log Workout Tab */}
          {activeTab === "log" && (
            <div className="mt-4">
              <button 
                onClick={() => setIsDialogOpen(true)}
                className="w-full rpg-button p-4 text-lg rounded-lg mb-6"
              >
                <Plus className="w-5 h-5 mr-3" />
                Log New Workout
              </button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <div style={{ display: 'none' }} />
                </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md h-[85vh] max-h-[600px] p-0 rpg-card border-fantasy-purple overflow-hidden">
                <DialogHeader className="p-4 pb-2 border-b border-fantasy-purple/30">
                  <DialogTitle className="text-fantasy-gold rpg-title text-lg">Add Workout</DialogTitle>
                  <DialogDescription className="text-gray-700 rpg-text">
                    Log your completed workout to earn XP and track your progress.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4 overflow-y-auto flex-1">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="workoutType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Workout Type</FormLabel>
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
                            <FormLabel className="text-gray-700">Duration (min)</FormLabel>
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
                            <FormLabel className="text-gray-700">Calories Burned</FormLabel>
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
                          <FormLabel className="text-gray-700">Intensity</FormLabel>
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
                          <FormLabel className="text-gray-700">Notes (optional)</FormLabel>
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
                </div>
              </DialogContent>
            </Dialog>
            </div>
          )}

          {/* Preset Workouts Tab */}
          {activeTab === "presets" && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search workouts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800 border-gray-700 text-gray-700"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select
                    value={templateFilter.category}
                    onValueChange={(value) => setTemplateFilter(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="flex-1 bg-slate-800 border-gray-700">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={templateFilter.difficulty}
                    onValueChange={(value) => setTemplateFilter(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger className="flex-1 bg-slate-800 border-gray-700">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Workout Templates Grid */}
              <div className="space-y-3">
                {(searchQuery ? searchResults : workoutTemplates)?.map((template) => (
                  <Card key={template.id} className="bg-slate-800 border-gray-700 hover:border-fantasy-purple transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-fantasy-gold mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-300 mb-2">{template.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="text-xs border-fantasy-purple text-fantasy-purple">
                              {template.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-fantasy-blue text-fantasy-blue">
                              {template.difficulty}
                            </Badge>
                            {template.equipment && template.equipment.length > 0 && (
                              <Badge variant="outline" className="text-xs border-fantasy-green text-fantasy-green">
                                {template.equipment.join(', ')}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {template.estimatedDuration}min
                            </div>
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4" />
                              {template.estimatedCaloriesBurn} cal
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {template.targetMuscles?.slice(0, 2).join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => startTemplateMutation.mutate(template)}
                        disabled={startTemplateMutation.isPending}
                        className="w-full bg-fantasy-purple hover:bg-purple-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {startTemplateMutation.isPending ? "Starting..." : "Start Workout"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
                {(searchQuery ? searchResults : workoutTemplates)?.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No workout templates found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-700">Recent Workouts</h2>
              {workoutLogs?.slice(0, 10).map((log) => (
                <Card key={log.id} className="bg-slate-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-fantasy-gold">{log.workoutType}</h3>
                        <p className="text-sm text-gray-400">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getIntensityColor(log.intensity)}>
                        {formatIntensity(log.intensity)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-fantasy-blue font-bold">{log.duration}</div>
                        <div className="text-gray-400 text-xs">Minutes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-fantasy-green font-bold">{log.caloriesBurned}</div>
                        <div className="text-gray-400 text-xs">Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-fantasy-purple font-bold">{log.xpGained}</div>
                        <div className="text-gray-400 text-xs">XP</div>
                      </div>
                    </div>
                    
                    {log.notes && (
                      <p className="text-sm text-gray-300 mt-3 italic">"{log.notes}"</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {(!workoutLogs || workoutLogs.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No workouts logged yet</p>
                  <p className="text-sm">Start your fitness journey today!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation currentPath="/workouts" />
    </div>
  );
}
