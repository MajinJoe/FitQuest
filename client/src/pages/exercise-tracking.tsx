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
import { Dumbbell, Search, Plus, Play, Timer, Target, Zap } from "lucide-react";
import type { Exercise, WorkoutSession, ExerciseEntry } from "@shared/schema";

export default function ExerciseTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
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
      if (selectedCategory) params.append("category", selectedCategory);
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Dumbbell className="h-8 w-8" />
            Exercise Tracking
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your workouts with exercises from the Physical Activities Compendium
          </p>
        </div>
        
        {!activeSession ? (
          <Button onClick={startNewSession} size="lg" className="gap-2">
            <Play className="h-4 w-4" />
            Start Workout
          </Button>
        ) : (
          <div className="flex gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Timer className="h-3 w-3 mr-1" />
              Session Active
            </Badge>
            <Button onClick={endSession} variant="outline" size="sm">
              End Session
            </Button>
          </div>
        )}
      </div>

      {activeSession && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">Active Workout Session</CardTitle>
            <CardDescription>{activeSession.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{exerciseEntries.length}</div>
                <div className="text-sm text-muted-foreground">Exercises</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {exerciseEntries.reduce((sum, entry) => sum + entry.caloriesBurned, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((Date.now() - new Date(activeSession.createdAt).getTime()) / 60000)}
                </div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Exercises</TabsTrigger>
          <TabsTrigger value="sessions">Workout History</TabsTrigger>
          <TabsTrigger value="stats">Progress Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Exercises</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by exercise name or muscle group..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{workoutSessions.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Total Calories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {workoutSessions.reduce((sum, session) => sum + (session.totalCaloriesBurned || 0), 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {workoutSessions.filter(session => {
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return new Date(session.createdAt) > weekAgo;
                  }).length}
                </div>
                <p className="text-sm text-muted-foreground">sessions</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{exercise.name}</CardTitle>
            <CardDescription className="text-sm">{exercise.description}</CardDescription>
          </div>
          <Badge variant={exercise.category === "strength" ? "default" : "secondary"}>
            {exercise.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">MET Value:</span>
            <span className="font-medium">{exercise.metValue}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Tracking:</span>
            <span className="font-medium">
              {exercise.trackingType === "reps_sets" ? "Reps & Sets" : 
               exercise.trackingType === "time_distance" ? "Time & Distance" : "Time Only"}
            </span>
          </div>
          {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {exercise.muscleGroups.slice(0, 3).map((muscle) => (
                <Badge key={muscle} variant="outline" className="text-xs">
                  {muscle}
                </Badge>
              ))}
              {exercise.muscleGroups.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{exercise.muscleGroups.length - 3}
                </Badge>
              )}
            </div>
          )}
          <Button 
            className="w-full mt-3" 
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{session.name}</span>
          <Badge variant="outline">
            {new Date(session.createdAt).toLocaleDateString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">{session.totalDuration}</div>
            <div className="text-sm text-muted-foreground">minutes</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{session.totalCaloriesBurned}</div>
            <div className="text-sm text-muted-foreground">calories</div>
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log: {exercise.name}</CardTitle>
          <CardDescription>
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
                    <Label htmlFor="sets">Sets</Label>
                    <Input
                      id="sets"
                      type="number"
                      value={formData.sets || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, sets: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reps">Reps</Label>
                    <Input
                      id="reps"
                      type="text"
                      value={formData.reps || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, reps: e.target.value }))}
                      placeholder="e.g. 12,10,8"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.5"
                    value={formData.weight || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                    placeholder="Optional"
                  />
                </div>
              </>
            )}

            {exercise.trackingType === "time_distance" && (
              <>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="distance">Distance (miles)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={formData.distance || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, distance: parseFloat(e.target.value) }))}
                    placeholder="Optional"
                  />
                </div>
              </>
            )}

            {exercise.trackingType === "time_only" && (
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="How did it feel?"
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Logging..." : "Log Exercise"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}