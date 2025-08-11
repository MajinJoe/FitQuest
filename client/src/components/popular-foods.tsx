import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, Clock, ChefHat } from "lucide-react";
import type { FoodDatabaseItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PopularFoodsProps {
  onSelectFood: (food: FoodDatabaseItem) => void;
}

export default function PopularFoods({ onSelectFood }: PopularFoodsProps) {
  const { data: popularFoods, isLoading } = useQuery<FoodDatabaseItem[]>({
    queryKey: ["/api/food/popular"],
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  if (isLoading) {
    return (
      <div className="rpg-card p-4">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-parchment/30 rounded rpg-card"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!popularFoods || popularFoods.length === 0) {
    return (
      <div className="text-center py-8 rpg-text">
        <p>No popular foods yet</p>
        <p className="text-sm mt-1">Share some recipes to build the community!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {popularFoods.slice(0, 8).map((food) => (
        <div 
          key={food.id} 
          className="rpg-card p-3 hover:bg-parchment/50 cursor-pointer transition-colors flex items-center justify-between"
          onClick={() => onSelectFood(food)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm rpg-text">{food.name}</h4>
              {food.isHomemade && (
                <ChefHat className="w-3 h-3 text-fantasy-gold" />
              )}
              {food.brand && (
                <span className="text-xs rpg-text opacity-60">• {food.brand}</span>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs rpg-text opacity-70">
              <span className="text-fantasy-gold">{food.calories} cal</span>
              <span className="text-fantasy-blue">{food.protein}g protein</span>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{food.usageCount || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs capitalize border-wood-brown text-wood-dark">
                {food.category}
              </Badge>
              {food.tags?.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs bg-fantasy-purple/20 text-fantasy-purple">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="text-right">
            <Button size="sm" variant="ghost" className="rpg-button text-xs">
              Use
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}