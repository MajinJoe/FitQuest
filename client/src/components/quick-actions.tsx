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
    <section className="mb-6 px-4">
      <div className="rpg-card p-4 mb-4">
        <h2 className="rpg-title text-xl flex items-center justify-center">
          <Zap className="text-fantasy-gold mr-3" size={24} />
          Quick Actions
        </h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => navigate('/nutrition')}
          className="rpg-card rpg-button p-4 text-center hover:scale-105 transition-all duration-300"
        >
          <Apple className="w-10 h-10 mx-auto mb-2 text-fantasy-green" />
          <div className="rpg-text font-bold">Log Meal</div>
          <div className="rpg-text text-xs">Gain XP</div>
        </button>
        
        <button 
          onClick={() => navigate('/workouts')}
          className="rpg-card rpg-button p-4 text-center hover:scale-105 transition-all duration-300"
        >
          <Dumbbell className="w-10 h-10 mx-auto mb-2 text-fantasy-purple" />
          <div className="rpg-text font-bold">Start Workout</div>
          <div className="rpg-text text-xs">Begin Quest</div>
        </button>
        
        <button 
          onClick={handleWaterIntake}
          disabled={xpGainMutation.isPending}
          className="rpg-card rpg-button p-4 text-center hover:scale-105 transition-all duration-300 disabled:opacity-50"
        >
          <Droplets className="w-10 h-10 mx-auto mb-2 text-fantasy-blue" />
          <div className="rpg-text font-bold">Add Water</div>
          <div className="rpg-text text-xs">+10 XP</div>
        </button>
        
        <button 
          onClick={() => navigate('/character')}
          className="rpg-card rpg-button p-4 text-center hover:scale-105 transition-all duration-300"
        >
          <Trophy className="w-10 h-10 mx-auto mb-2 text-fantasy-gold" />
          <div className="rpg-text font-bold">Achievements</div>
          <div className="rpg-text text-xs">View Progress</div>
        </button>
      </div>
    </section>
  );
}
