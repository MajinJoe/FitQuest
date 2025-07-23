import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Calendar, Zap, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNavigation from "@/components/bottom-navigation";
import type { Activity, Character, NutritionLog, WorkoutLog } from "@shared/schema";

export default function Progress() {
  const { data: character } = useQuery<Character>({
    queryKey: ["/api/character"],
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: nutritionLogs } = useQuery<NutritionLog[]>({
    queryKey: ["/api/nutrition"],
  });

  const { data: workoutLogs } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: dailyStats } = useQuery({
    queryKey: ["/api/stats/daily"],
  });

  // Calculate weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyXP = activities?.filter(activity => 
    new Date(activity.createdAt) >= weekAgo
  ).reduce((sum, activity) => sum + activity.xpGained, 0) || 0;

  const weeklyWorkouts = workoutLogs?.filter(log => 
    new Date(log.createdAt) >= weekAgo
  ).length || 0;

  const weeklyMeals = nutritionLogs?.filter(log => 
    new Date(log.createdAt) >= weekAgo
  ).length || 0;

  const weeklyCalories = workoutLogs?.filter(log => 
    new Date(log.createdAt) >= weekAgo
  ).reduce((sum, log) => sum + log.caloriesBurned, 0) || 0;

  // Calculate streaks (simplified - consecutive days with activities)
  const getActivityStreak = () => {
    if (!activities || activities.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasActivity = activities.some(activity => {
        const activityDate = new Date(activity.createdAt);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === checkDate.getTime();
      });
      
      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = getActivityStreak();

  return (
    <div className="max-w-sm mx-auto fantasy-bg min-h-screen">
      <header className="p-4 glass-effect">
        <h1 className="rpg-title text-2xl flex items-center">
          <TrendingUp className="mr-2" />
          Progress Analytics
        </h1>
        <p className="rpg-text">Track your fitness journey</p>
      </header>

      <main className="p-4 pb-20 space-y-6">
        {/* Today's Summary */}
        {dailyStats && (
          <div className="rpg-card p-4">
            <h3 className="rpg-title text-fantasy-green text-lg mb-4 text-center flex items-center justify-center">
              <Calendar className="mr-2" />
              Today's Progress
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rpg-card">
                <div className="text-2xl rpg-title text-fantasy-gold">+{dailyStats.xpGained}</div>
                <div className="text-xs rpg-text">XP Earned</div>
              </div>
              <div className="text-center p-3 rpg-card">
                <div className="text-2xl rpg-title text-fantasy-blue">{dailyStats.caloriesBurned}</div>
                <div className="text-xs rpg-text">Calories Burned</div>
              </div>
              <div className="text-center p-3 rpg-card">
                <div className="text-2xl rpg-title text-fantasy-purple">
                  {dailyStats.workoutsCompleted}/{dailyStats.totalWorkouts}
                </div>
                <div className="text-xs rpg-text">Quests Done</div>
              </div>
              <div className="text-center p-3 rpg-card">
                <div className="text-2xl rpg-title text-fantasy-green">{currentStreak}</div>
                <div className="text-xs rpg-text">Day Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Summary */}
        <div className="rpg-card p-4">
          <h3 className="rpg-title text-fantasy-purple text-lg mb-4 text-center flex items-center justify-center">
            <Zap className="mr-2" />
            This Week
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rpg-card">
              <div className="text-2xl rpg-title text-fantasy-gold">+{weeklyXP}</div>
              <div className="text-xs rpg-text">Weekly XP</div>
            </div>
            <div className="text-center p-3 rpg-card">
              <div className="text-2xl rpg-title text-fantasy-purple">{weeklyWorkouts}</div>
              <div className="text-xs rpg-text">Workouts</div>
            </div>
            <div className="text-center p-3 rpg-card">
              <div className="text-2xl rpg-title text-fantasy-green">{weeklyMeals}</div>
              <div className="text-xs rpg-text">Meals Logged</div>
            </div>
            <div className="text-center p-3 rpg-card">
              <div className="text-2xl rpg-title text-fantasy-blue">{weeklyCalories}</div>
              <div className="text-xs rpg-text">Calories Burned</div>
            </div>
          </div>
        </div>

        {/* Character Progress */}
        {character && (
          <div className="rpg-card p-4">
            <h3 className="rpg-title text-fantasy-gold text-lg mb-4 text-center flex items-center justify-center">
              <Target className="mr-2" />
              Character Growth
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="rpg-text">Current Level</span>
                <span className="text-fantasy-gold rpg-title text-xl">{character.level}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="rpg-text">Total XP Earned</span>
                <span className="text-fantasy-blue rpg-title">{character.totalXP.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="rpg-text">XP to Next Level</span>
                <span className="text-fantasy-purple rpg-title">
                  {(character.nextLevelXP - character.currentXP).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="rpg-text">Days on Journey</span>
                <span className="text-fantasy-green rpg-title">
                  {Math.floor((Date.now() - new Date(character.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Motivation Message */}
        <div className="rpg-card p-6 text-center relative overflow-hidden">
          {/* Campfire background effect */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-orange-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-500 rounded-full animate-bounce"></div>
          </div>
          
          {/* Knight silhouette */}
          <div className="mb-4 relative z-10">
            <div className="text-4xl mb-2">🏰</div>
            <div className="text-2xl">⚔️</div>
          </div>
          
          <h3 className="rpg-title text-xl text-fantasy-gold mb-3 relative z-10">
            "Keep Going, Champion!"
          </h3>
          <div className="rpg-text text-sm italic relative z-10 max-w-xs mx-auto">
            {currentStreak > 0 
              ? `A wise knight by the campfire whispers: "Your ${currentStreak}-day journey grows stronger with each step, noble warrior."`
              : "An old knight speaks from beside the flickering flames: 'Every legend begins with courage to take the first step into darkness.'"
            }
          </div>
          
          {/* Decorative medieval elements */}
          <div className="flex justify-center mt-4 space-x-2 relative z-10">
            <div className="text-fantasy-gold opacity-70">⚡</div>
            <div className="text-fantasy-purple opacity-70">✨</div>
            <div className="text-fantasy-blue opacity-70">🛡️</div>
            <div className="text-fantasy-green opacity-70">🌟</div>
          </div>
        </div>
      </main>

      <BottomNavigation currentPath="/progress" />
    </div>
  );
}
