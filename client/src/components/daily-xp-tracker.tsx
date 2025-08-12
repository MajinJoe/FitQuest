import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Zap, AlertTriangle, CheckCircle } from "lucide-react";

interface DailyXpData {
  tracking: {
    userId: number;
    characterId: number;
    date: string;
    nutritionXp: number;
    workoutXp: number;
    hydrationXp: number;
    questCompletionXp: number;
    totalDailyXp: number;
    breakfastEntries: number;
    lunchEntries: number;
    dinnerEntries: number;
    snackEntries: number;
  };
  caps: {
    MEAL_ENTRY_XP: number;
    BREAKFAST_ENTRIES_MAX: number;
    LUNCH_ENTRIES_MAX: number;
    DINNER_ENTRIES_MAX: number;
    SNACK_ENTRIES_MAX: number;
    NUTRITION_DAILY_CAP: number;
    WORKOUT_DAILY_CAP: number;
    HYDRATION_DAILY_CAP: number;
  };
}

export default function DailyXpTracker() {
  const { data: xpData, isLoading } = useQuery<DailyXpData>({
    queryKey: ["/api/xp/daily"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading || !xpData) {
    return (
      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-200">
            <Clock className="w-4 h-4 mr-2 inline" />
            Daily XP Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-amber-200 rounded w-3/4"></div>
            <div className="h-2 bg-amber-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { tracking, caps } = xpData;
  
  // Calculate progress percentages
  const nutritionProgress = (tracking.nutritionXp / caps.NUTRITION_DAILY_CAP) * 100;
  const workoutProgress = (tracking.workoutXp / caps.WORKOUT_DAILY_CAP) * 100;
  const hydrationProgress = (tracking.hydrationXp / caps.HYDRATION_DAILY_CAP) * 100;

  // Check meal entry limits
  const mealLimits = [
    { type: "breakfast", current: tracking.breakfastEntries, max: caps.BREAKFAST_ENTRIES_MAX },
    { type: "lunch", current: tracking.lunchEntries, max: caps.LUNCH_ENTRIES_MAX },
    { type: "dinner", current: tracking.dinnerEntries, max: caps.DINNER_ENTRIES_MAX },
    { type: "snacks", current: tracking.snackEntries, max: caps.SNACK_ENTRIES_MAX },
  ];

  const isNearCap = (current: number, max: number) => current / max >= 0.8;
  const isCapped = (current: number, max: number) => current >= max;

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
      <CardHeader className="flex flex-row items-center space-y-0 pb-3">
        <div className="flex items-center flex-1">
          <Zap className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
          <CardTitle className="text-base font-semibold text-amber-800 dark:text-amber-200">
            Daily XP Progress
          </CardTitle>
        </div>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
          {tracking.totalDailyXp} XP Today
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Category Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Nutrition</span>
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {tracking.nutritionXp}/{caps.NUTRITION_DAILY_CAP} XP
              </span>
            </div>
            <Progress 
              value={nutritionProgress} 
              className="h-2"
              data-testid="progress-nutrition-xp"
            />
            {nutritionProgress >= 100 && (
              <div className="flex items-center mt-1 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Daily nutrition XP cap reached
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Workouts</span>
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {tracking.workoutXp}/{caps.WORKOUT_DAILY_CAP} XP
              </span>
            </div>
            <Progress 
              value={workoutProgress} 
              className="h-2"
              data-testid="progress-workout-xp"
            />
            {workoutProgress >= 100 && (
              <div className="flex items-center mt-1 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Daily workout XP cap reached
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Hydration</span>
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {tracking.hydrationXp}/{caps.HYDRATION_DAILY_CAP} XP
              </span>
            </div>
            <Progress 
              value={hydrationProgress} 
              className="h-2"
              data-testid="progress-hydration-xp"
            />
          </div>
        </div>

        {/* Meal Entry Limits */}
        <div className="border-t border-amber-200 dark:border-amber-800 pt-3">
          <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-2">
            Meal Entry Limits ({caps.MEAL_ENTRY_XP} XP per entry)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {mealLimits.map(({ type, current, max }) => (
              <div key={type} className="flex items-center justify-between text-xs">
                <span className="capitalize text-amber-700 dark:text-amber-300">{type}</span>
                <div className="flex items-center space-x-1">
                  <span 
                    className={`${
                      isCapped(current, max) 
                        ? "text-red-600 dark:text-red-400 font-medium" 
                        : isNearCap(current, max)
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {current}/{max}
                  </span>
                  {isCapped(current, max) && (
                    <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                  )}
                  {current > 0 && current < max && (
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Reset Info */}
        <div className="text-center pt-2 border-t border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Limits reset daily at midnight
          </p>
        </div>
      </CardContent>
    </Card>
  );
}