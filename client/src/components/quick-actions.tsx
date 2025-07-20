import { Apple, Dumbbell, Droplets, Trophy, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuickActions() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const xpGainMutation = useMutation({
    mutationFn: async (data: { amount: number; description: string }) => {
      const response = await apiRequest("POST", "/api/character/xp", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/character"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      
      // Show XP notification
      const event = new CustomEvent('showXPGain', { 
        detail: { amount: data.xpGained, leveledUp: data.leveledUp, newLevel: data.character?.level }
      });
      window.dispatchEvent(event);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to gain XP",
        variant: "destructive",
      });
    },
  });

  const handleWaterIntake = () => {
    xpGainMutation.mutate({
      amount: 10,
      description: "Added a glass of water - Hydration quest progress",
    });
  };

  return (
    <section className="mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center text-light-text">
        <Zap className="text-fantasy-gold mr-2" />
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => navigate('/nutrition')}
          className="bg-gradient-to-br from-fantasy-green to-green-600 rounded-xl p-4 text-center hover:from-green-500 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
        >
          <Apple className="w-8 h-8 mx-auto mb-2" />
          <div className="font-semibold">Log Meal</div>
          <div className="text-xs opacity-80">Gain XP</div>
        </button>
        
        <button 
          onClick={() => navigate('/workouts')}
          className="bg-gradient-to-br from-fantasy-purple to-purple-600 rounded-xl p-4 text-center hover:from-purple-500 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          <Dumbbell className="w-8 h-8 mx-auto mb-2" />
          <div className="font-semibold">Start Workout</div>
          <div className="text-xs opacity-80">Begin Quest</div>
        </button>
        
        <button 
          onClick={handleWaterIntake}
          disabled={xpGainMutation.isPending}
          className="bg-gradient-to-br from-fantasy-blue to-blue-600 rounded-xl p-4 text-center hover:from-blue-500 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
        >
          <Droplets className="w-8 h-8 mx-auto mb-2" />
          <div className="font-semibold">Add Water</div>
          <div className="text-xs opacity-80">Quick Log</div>
        </button>
        
        <button 
          onClick={() => navigate('/character')}
          className="bg-gradient-to-br from-fantasy-gold to-yellow-600 rounded-xl p-4 text-center hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105"
        >
          <Trophy className="w-8 h-8 mx-auto mb-2" />
          <div className="font-semibold">Achievements</div>
          <div className="text-xs opacity-80">View Rewards</div>
        </button>
      </div>
    </section>
  );
}
