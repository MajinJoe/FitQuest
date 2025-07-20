import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/bottom-navigation";
import { Dumbbell, Search, Plus, Play, Timer, Target, Zap } from "lucide-react";
import type { Exercise, WorkoutSession, ExerciseEntry } from "@shared/schema";

export default function ExerciseTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch exercises from Physical Activities Compendium
  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      const response = await fetch(`/api/exercises?${params}`);
      if (!response.ok) throw new Error("Failed to fetch exercises");
      return response.json();
    },
  });

  // Search exercises
  const { data: searchResults = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/exercises/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Failed to search exercises");
      return response.json();
    },
    enabled: searchQuery.length > 2,
  });

  // Fetch workout sessions
  const { data: workoutSessions = [] } = useQuery<WorkoutSession[]>({
    queryKey: ["/api/workout-sessions"],
  });

  // Create workout session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: { name: string; notes?: string }) => {
      const response = await fetch("/api/workout-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sessionData,
          totalDuration: 0,
          totalCaloriesBurned: 0,
          xpGained: 0,
        }),
      });
      if (!response.ok) throw new Error("Failed to create workout session");
      return response.json();
    },
    onSuccess: (session) => {
      setActiveSession(session);
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
      toast({ title: "Workout session started!", description: "Ready to log exercises" });
    },
  });

  // Add exercise entry mutation
  const addExerciseMutation = useMutation({
    mutationFn: async (entryData: {
      exerciseId: number;
      reps?: string;
      sets?: number;
      weight?: number;
      duration?: number;
      distance?: number;
      notes?: string;
    }) => {
      if (!activeSession) throw new Error("No active workout session");
      
      // Calculate calories based on MET value
      const exercise = exercises.find(e => e.id === entryData.exerciseId);
      const caloriesBurned = exercise ? calculateCalories(exercise, entryData.duration || 30) : 100;
      
      const response = await fetch("/api/exercise-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...entryData,
          workoutSessionId: activeSession.id,
          caloriesBurned,
        }),
      });
      if (!response.ok) throw new Error("Failed to add exercise");
      return response.json();
    },
    onSuccess: (entry) => {
      setExerciseEntries(prev => [...prev, entry]);
      setCurrentExercise(null);
      toast({ title: "Exercise logged!", description: "Great work, keep it up!" });
    },
  });

  const calculateCalories = (exercise: Exercise, durationMinutes: number) => {
    const metValue = parseFloat(exercise.metValue);
    const bodyWeight = 70; // kg - default weight
    const durationHours = durationMinutes / 60;
    return Math.round(metValue * bodyWeight * durationHours);
  };

  const startNewSession = () => {
    const sessionName = `Workout - ${new Date().toLocaleDateString()}`;
    createSessionMutation.mutate({ name: sessionName });
  };

  const endSession = async () => {
    if (!activeSession) return;
    
    // Calculate total calories and duration
    const totalCalories = exerciseEntries.reduce((sum, entry) => sum + entry.caloriesBurned, 0);
    const totalDuration = exerciseEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    
    // Update session with totals
    await fetch(`/api/workout-sessions/${activeSession.id}`, {
      method: "PATCH", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalDuration,
        totalCaloriesBurned: totalCalories,
        xpGained: Math.round(totalCalories * 0.5), // 0.5 XP per calorie
      }),
    });

    setActiveSession(null);
    setExerciseEntries([]);
    queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
    toast({ title: "Workout completed!", description: `Burned ${totalCalories} calories` });
  };

  const displayedExercises = searchQuery.trim() ? searchResults : exercises;

  return (
    <div className="max-w-sm mx-auto bg-slate-900 min-h-screen relative overflow-hidden">
      {/* Background Fantasy Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-2 h-2 bg-fantasy-gold rounded-full animate-ping"></div>
        <div className="absolute top-32 right-8 w-1 h-1 bg-fantasy-purple rounded-full animate-pulse"></div>
        <div className="absolute top-64 left-6 w-1.5 h-1.5 bg-fantasy-green rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 right-12 w-2 h-2 bg-fantasy-gold rounded-full animate-ping delay-1000"></div>
      </div>

      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-light-text flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-fantasy-gold" />
              Exercise Tracking
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Track workouts with Physical Activities Compendium
            </p>
          </div>
          
          {!activeSession ? (
            <Button 
              onClick={startNewSession} 
              disabled={createSessionMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2"
            >
              <Play className="h-4 w-4" />
              Start Workout
            </Button>
          ) : (
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1 bg-green-900 text-green-300">
                <Timer className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <Button onClick={endSession} variant="outline" size="sm" className="border-gray-600 text-gray-300">
                End Session
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 pb-20">
        {activeSession && (
          <Card className="border-green-800 bg-green-950/30 mb-4">
            <CardHeader>
              <CardTitle className="text-green-300">Active Workout Session</CardTitle>
              <CardDescription className="text-gray-400">{activeSession.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{exerciseEntries.length}</div>
                  <div className="text-sm text-gray-500">Exercises</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {exerciseEntries.reduce((sum, entry) => sum + entry.caloriesBurned, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Calories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round((Date.now() - new Date(activeSession.createdAt).getTime()) / 60000)}
                  </div>
                  <div className="text-sm text-gray-500">Minutes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="browse" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-fantasy-gold">Browse Exercises</TabsTrigger>
            <TabsTrigger value="sessions" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-fantasy-gold">Workout History</TabsTrigger>
            <TabsTrigger value="stats" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-fantasy-gold">Progress Stats</TabsTrigger>
          </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search" className="text-gray-300">Search Exercises</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search by exercise name or muscle group..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600 text-gray-200 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="w-48">
              <Label className="text-gray-300">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-gray-200">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercisesLoading ? (
              <div className="col-span-full text-center py-8">Loading exercises...</div>
            ) : displayedExercises.length === 0 ? (
              <div className="col-span-full text-center py-8">
                {searchQuery ? "No exercises found for your search" : "No exercises available"}
              </div>
            ) : (
              displayedExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onSelect={setCurrentExercise}
                  canLog={!!activeSession}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="space-y-4">
            {workoutSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No workout sessions yet. Start your first workout!</p>
              </div>
            ) : (
              workoutSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-light-text">
                  <Target className="h-5 w-5 text-fantasy-gold" />
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-fantasy-gold">{workoutSessions.length}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-light-text">
                  <Zap className="h-5 w-5 text-fantasy-purple" />
                  Total Calories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-fantasy-purple">
                  {workoutSessions.reduce((sum, session) => sum + (session.totalCaloriesBurned || 0), 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-light-text">
                  <Timer className="h-5 w-5 text-fantasy-green" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-fantasy-green">
                  {workoutSessions.filter(session => {
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return new Date(session.createdAt) > weekAgo;
                  }).length}
                </div>
                <p className="text-sm text-gray-400">sessions</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </main>

      <BottomNavigation currentPath="/exercises" />

      {/* Exercise Logging Modal */}
      {currentExercise && (
        <ExerciseLoggingModal
          exercise={currentExercise}
          onClose={() => setCurrentExercise(null)}
          onSubmit={(data) => addExerciseMutation.mutate({ exerciseId: currentExercise.id, ...data })}
          isLoading={addExerciseMutation.isPending}
        />
      )}
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ 
  exercise, 
  onSelect, 
  canLog 
}: { 
  exercise: Exercise; 
  onSelect: (exercise: Exercise) => void;
  canLog: boolean;
}) {
  return (
    <Card className="bg-slate-800 border-slate-700 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-light-text">{exercise.name}</CardTitle>
            <CardDescription className="text-sm text-gray-400">{exercise.description}</CardDescription>
          </div>
          <Badge variant={exercise.category === "strength" ? "default" : "secondary"} 
                 className={exercise.category === "strength" ? "bg-blue-600 text-white" : "bg-purple-600 text-white"}>
            {exercise.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">MET Value:</span>
            <span className="font-medium text-gray-200">{exercise.metValue}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Tracking:</span>
            <span className="font-medium text-gray-200">
              {exercise.trackingType === "reps_sets" ? "Reps & Sets" : 
               exercise.trackingType === "time_distance" ? "Time & Distance" : "Time Only"}
            </span>
          </div>
          {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {exercise.muscleGroups.slice(0, 3).map((muscle) => (
                <Badge key={muscle} variant="outline" className="text-xs border-gray-600 text-gray-300">
                  {muscle}
                </Badge>
              ))}
              {exercise.muscleGroups.length > 3 && (
                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                  +{exercise.muscleGroups.length - 3}
                </Badge>
              )}
            </div>
          )}
          <Button 
            className={`w-full mt-3 ${canLog 
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white" 
              : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
            onClick={() => onSelect(exercise)}
            disabled={!canLog}
          >
            <Plus className="h-4 w-4 mr-2" />
            {canLog ? "Add to Workout" : "Start Session to Log"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Session Card Component
function SessionCard({ session }: { session: WorkoutSession }) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-light-text">
          <span>{session.name}</span>
          <Badge variant="outline" className="border-gray-600 text-gray-300">
            {new Date(session.createdAt).toLocaleDateString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-fantasy-green">{session.totalDuration}</div>
            <div className="text-sm text-gray-400">minutes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-fantasy-purple">{session.totalCaloriesBurned}</div>
            <div className="text-sm text-gray-400">calories</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Exercise Logging Modal Component
function ExerciseLoggingModal({
  exercise,
  onClose,
  onSubmit,
  isLoading
}: {
  exercise: Exercise;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<{
    sets?: number;
    reps?: string;
    weight?: number;
    duration?: number;
    distance?: number;
    notes?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-light-text">Log: {exercise.name}</CardTitle>
          <CardDescription className="text-gray-400">
            {exercise.trackingType === "reps_sets" ? "Enter reps, sets, and weight" :
             exercise.trackingType === "time_distance" ? "Enter time and distance" : "Enter duration"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {exercise.trackingType === "reps_sets" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="sets" className="text-gray-300">Sets</Label>
                    <Input
                      id="sets"
                      type="number"
                      value={formData.sets || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, sets: parseInt(e.target.value) }))}
                      className="bg-slate-700 border-slate-600 text-gray-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reps" className="text-gray-300">Reps</Label>
                    <Input
                      id="reps"
                      type="text"
                      value={formData.reps || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, reps: e.target.value }))}
                      placeholder="e.g. 12,10,8"
                      className="bg-slate-700 border-slate-600 text-gray-200 placeholder-gray-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="weight" className="text-gray-300">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.5"
                    value={formData.weight || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                    placeholder="Optional"
                    className="bg-slate-700 border-slate-600 text-gray-200 placeholder-gray-500"
                  />
                </div>
              </>
            )}

            {exercise.trackingType === "time_distance" && (
              <>
                <div>
                  <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="bg-slate-700 border-slate-600 text-gray-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="distance" className="text-gray-300">Distance (miles)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={formData.distance || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, distance: parseFloat(e.target.value) }))}
                    placeholder="Optional"
                    className="bg-slate-700 border-slate-600 text-gray-200 placeholder-gray-500"
                  />
                </div>
              </>
            )}

            {exercise.trackingType === "time_only" && (
              <div>
                <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="bg-slate-700 border-slate-600 text-gray-200"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes" className="text-gray-300">Notes (optional)</Label>
              <Input
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="How did it feel?"
                className="bg-slate-700 border-slate-600 text-gray-200 placeholder-gray-500"
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-600 text-gray-300 hover:bg-slate-700">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                {isLoading ? "Logging..." : "Log Exercise"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}