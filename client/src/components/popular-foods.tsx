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
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-parchment/50 rounded-lg rpg-card border border-wood-light/30"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!popularFoods || popularFoods.length === 0) {
    return (
      <div className="text-center py-12 rpg-text">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-fantasy-purple/50" />
        <p className="text-xl mb-2">No popular foods yet</p>
        <p className="text-sm opacity-70">Share some recipes to build the community!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto">
      {popularFoods.slice(0, 12).map((food, index) => (
        <Card 
          key={food.id} 
          className="rpg-card hover:bg-fantasy-gold/10 cursor-pointer transition-all duration-200 border-wood-light/30 hover:border-fantasy-gold/50 hover:shadow-lg"
          onClick={() => onSelectFood(food)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {/* Ranking Badge */}
                  <div className="flex-shrink-0">
                    <Badge 
                      variant="default" 
                      className={`text-xs font-bold ${
                        index === 0 ? 'bg-fantasy-gold text-wood-dark' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-fantasy-purple text-white'
                      }`}
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg rpg-text truncate">{food.name}</h4>
                      {food.isHomemade && (
                        <ChefHat className="w-4 h-4 text-fantasy-green flex-shrink-0" />
                      )}
                    </div>
                    
                    {food.brand && (
                      <p className="text-sm text-fantasy-blue font-semibold truncate">{food.brand}</p>
                    )}
                  </div>
                </div>
                
                {/* Nutrition Stats */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="text-center p-2 bg-fantasy-gold/20 rounded">
                    <p className="font-bold text-fantasy-gold text-sm">{food.calories}</p>
                    <p className="text-xs rpg-text opacity-60">cal</p>
                  </div>
                  <div className="text-center p-2 bg-fantasy-blue/20 rounded">
                    <p className="font-bold text-fantasy-blue text-sm">{food.protein}g</p>
                    <p className="text-xs rpg-text opacity-60">protein</p>
                  </div>
                  <div className="text-center p-2 bg-fantasy-green/20 rounded">
                    <p className="font-bold text-fantasy-green text-sm">{food.carbs}g</p>
                    <p className="text-xs rpg-text opacity-60">carbs</p>
                  </div>
                  <div className="text-center p-2 bg-fantasy-purple/20 rounded">
                    <p className="font-bold text-fantasy-purple text-sm">{food.fat}g</p>
                    <p className="text-xs rpg-text opacity-60">fat</p>
                  </div>
                </div>
                
                {/* Popularity Stats */}
                <div className="flex items-center gap-4 text-xs rpg-text opacity-70 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{food.usageCount || 0} uses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Trending</span>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs capitalize border-wood-brown text-wood-dark">
                    {food.category}
                  </Badge>
                  {food.tags?.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-fantasy-purple/20 text-fantasy-purple">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Use Button */}
              <div className="ml-4 flex-shrink-0">
                <Button 
                  size="sm" 
                  className="rpg-button bg-fantasy-gold hover:bg-fantasy-gold/80 text-wood-dark font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFood(food);
                  }}
                >
                  Use Food
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}