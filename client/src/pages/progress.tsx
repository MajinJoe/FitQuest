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
    <div className="max-w-sm mx-auto bg-slate-900 min-h-screen fantasy-bg">
      <header className="p-4 glass-effect">
        <h1 className="text-2xl font-bold text-fantasy-blue flex items-center">
          <TrendingUp className="mr-2" />
          Progress Analytics
        </h1>
        <p className="text-gray-300">Track your fitness journey</p>
      </header>

      <main className="p-4 pb-20 space-y-6">
        {/* Today's Summary */}
        {dailyStats && (
          <Card className="bg-slate-800 border-fantasy-green">
            <CardHeader>
              <CardTitle className="text-fantasy-green flex items-center">
                <Calendar className="mr-2" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700 rounded-lg">
                  <div className="text-2xl font-bold text-fantasy-gold">+{dailyStats.xpGained}</div>
                  <div className="text-xs text-gray-400">XP Earned</div>
                </div>
                <div className="text-center p-3 bg-slate-700 rounded-lg">
                  <div className="text-2xl font-bold text-fantasy-blue">{dailyStats.caloriesBurned}</div>
                  <div className="text-xs text-gray-400">Calories Burned</div>
                </div>
                <div className="text-center p-3 bg-slate-700 rounded-lg">
                  <div className="text-2xl font-bold text-fantasy-purple">
                    {dailyStats.workoutsCompleted}/{dailyStats.totalWorkouts}
                  </div>
                  <div className="text-xs text-gray-400">Quests Done</div>
                </div>
                <div className="text-center p-3 bg-slate-700 rounded-lg">
                  <div className="text-2xl font-bold text-fantasy-green">{currentStreak}</div>
                  <div className="text-xs text-gray-400">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Summary */}
        <Card className="bg-slate-800 border-fantasy-purple">
          <CardHeader>
            <CardTitle className="text-fantasy-purple flex items-center">
              <Zap className="mr-2" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-fantasy-gold">+{weeklyXP}</div>
                <div className="text-xs text-gray-400">Weekly XP</div>
              </div>
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-fantasy-purple">{weeklyWorkouts}</div>
                <div className="text-xs text-gray-400">Workouts</div>
              </div>
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-fantasy-green">{weeklyMeals}</div>
                <div className="text-xs text-gray-400">Meals Logged</div>
              </div>
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-fantasy-blue">{weeklyCalories}</div>
                <div className="text-xs text-gray-400">Calories Burned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Character Progress */}
        {character && (
          <Card className="bg-slate-800 border-fantasy-gold">
            <CardHeader>
              <CardTitle className="text-fantasy-gold flex items-center">
                <Target className="mr-2" />
                Character Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-light-text">Current Level</span>
                  <span className="text-fantasy-gold font-bold text-xl">{character.level}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-light-text">Total XP Earned</span>
                  <span className="text-fantasy-blue font-bold">{character.totalXP.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-light-text">XP to Next Level</span>
                  <span className="text-fantasy-purple font-bold">
                    {(character.nextLevelXP - character.currentXP).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-light-text">Days on Journey</span>
                  <span className="text-fantasy-green font-bold">
                    {Math.floor((Date.now() - new Date(character.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivation Message */}
        <Card className="bg-gradient-to-br from-fantasy-purple to-purple-800 border-fantasy-gold">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-fantasy-gold mb-2">Keep Going, Champion!</h3>
            <p className="text-light-text">
              {currentStreak > 0 
                ? `You're on a ${currentStreak}-day streak! Your dedication is paying off.`
                : "Every journey begins with a single step. Start your streak today!"
              }
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation currentPath="/progress" />
    </div>
  );
}
