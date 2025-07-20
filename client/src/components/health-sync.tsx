import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Footprints, Scale, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface HealthData {
  steps: number;
  heartRate: number;
  caloriesBurned: number;
  distanceWalked: number; // in km
  activeMinutes: number;
  weight?: number;
  lastSynced: Date;
}

export default function HealthSync() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const xpGainMutation = useMutation({
    mutationFn: async (data: { amount: number; description: string }) => {
      const response = await apiRequest("POST", "/api/character/xp", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/character"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      
      // Show XP notification
      const event = new CustomEvent('showXPGain', { 
        detail: { amount: data.xpGained, leveledUp: data.leveledUp, newLevel: data.character?.level }
      });
      window.dispatchEvent(event);
    },
  });

  // Check if Web Health API is available (experimental)
  const checkHealthAPISupport = () => {
    return 'navigator' in window && 'permissions' in navigator;
  };

  // Mock health data sync (in real app, would connect to actual health APIs)
  const syncHealthData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate realistic mock health data
      const mockData: HealthData = {
        steps: Math.floor(Math.random() * 5000) + 3000,
        heartRate: Math.floor(Math.random() * 40) + 60,
        caloriesBurned: Math.floor(Math.random() * 300) + 200,
        distanceWalked: Math.round((Math.random() * 3 + 1) * 100) / 100,
        activeMinutes: Math.floor(Math.random() * 60) + 30,
        weight: Math.round((Math.random() * 20 + 60) * 10) / 10,
        lastSynced: new Date(),
      };
      
      setHealthData(mockData);
      setIsConnected(true);
      
      // Calculate XP based on health achievements
      let totalXP = 0;
      const achievements = [];
      
      if (mockData.steps >= 10000) {
        totalXP += 100;
        achievements.push("10K Steps Master");
      } else if (mockData.steps >= 5000) {
        totalXP += 50;
        achievements.push("Active Walker");
      }
      
      if (mockData.activeMinutes >= 60) {
        totalXP += 75;
        achievements.push("Activity Champion");
      }
      
      if (mockData.caloriesBurned >= 400) {
        totalXP += 60;
        achievements.push("Calorie Crusher");
      }
      
      if (totalXP > 0) {
        xpGainMutation.mutate({
          amount: totalXP,
          description: `Health sync completed - ${achievements.join(", ")}`,
        });
      }
      
      toast({
        title: "Health Data Synced!",
        description: `Earned ${totalXP} XP from your daily activities`,
      });
      
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to connect to health services",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectHealthServices = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would request permissions for health data
      if (checkHealthAPISupport()) {
        await syncHealthData();
      } else {
        // Fallback for browsers without health API support
        toast({
          title: "Health Services",
          description: "Using demo mode - connect your fitness tracker for real data",
        });
        await syncHealthData();
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please check your health app permissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastSynced = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full border-fantasy-blue text-fantasy-blue hover:bg-fantasy-blue hover:text-white"
        >
          <Heart className="w-4 h-4 mr-2" />
          Health Sync
          {isConnected && <Badge className="ml-2 bg-fantasy-green">Connected</Badge>}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-slate-800 border-fantasy-blue max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-fantasy-gold flex items-center">
            <Heart className="mr-2" />
            Health Integration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isConnected ? (
            <Card className="bg-slate-700 border-gray-600">
              <CardContent className="p-6 text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 text-fantasy-blue" />
                <p className="text-light-text mb-4">
                  Connect your fitness tracker or health app to automatically sync activity data and earn bonus XP
                </p>
                <Button 
                  onClick={connectHealthServices}
                  disabled={isLoading}
                  className="w-full bg-fantasy-blue hover:bg-blue-600"
                >
                  {isLoading ? "Connecting..." : "Connect Health Services"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Health Data Overview */}
              <Card className="bg-slate-700 border-fantasy-green">
                <CardHeader className="pb-3">
                  <CardTitle className="text-fantasy-green text-lg flex items-center justify-between">
                    Today's Health Data
                    <Badge className="bg-fantasy-green text-black">
                      {healthData && formatLastSynced(healthData.lastSynced)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {healthData && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Footprints className="w-4 h-4 text-fantasy-blue" />
                          <div>
                            <div className="font-bold text-light-text">{healthData.steps.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">Steps</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-red-400" />
                          <div>
                            <div className="font-bold text-light-text">{healthData.heartRate} bpm</div>
                            <div className="text-xs text-gray-400">Heart Rate</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-fantasy-gold" />
                          <div>
                            <div className="font-bold text-light-text">{healthData.caloriesBurned}</div>
                            <div className="text-xs text-gray-400">Calories</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-fantasy-purple" />
                          <div>
                            <div className="font-bold text-light-text">{healthData.activeMinutes}m</div>
                            <div className="text-xs text-gray-400">Active</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-600">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Distance Walked</span>
                          <span className="font-bold text-fantasy-green">{healthData.distanceWalked} km</span>
                        </div>
                        {healthData.weight && (
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-400">Weight</span>
                            <span className="font-bold text-fantasy-blue">{healthData.weight} kg</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              {/* Sync Actions */}
              <div className="space-y-2">
                <Button 
                  onClick={syncHealthData}
                  disabled={isLoading}
                  className="w-full bg-fantasy-green hover:bg-green-600"
                >
                  {isLoading ? "Syncing..." : "Sync Now"}
                </Button>
                
                <Button 
                  onClick={() => {
                    setIsConnected(false);
                    setHealthData(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Disconnect
                </Button>
              </div>
            </>
          )}
          
          {/* Health Tips */}
          <Card className="bg-gradient-to-r from-fantasy-purple to-purple-800 border-fantasy-purple">
            <CardContent className="p-4">
              <h3 className="font-semibold text-light-text mb-2">💡 Health Tips</h3>
              <ul className="text-xs text-gray-200 space-y-1">
                <li>• 10,000+ steps = 100 XP bonus</li>
                <li>• 60+ active minutes = 75 XP bonus</li>
                <li>• 400+ calories burned = 60 XP bonus</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}