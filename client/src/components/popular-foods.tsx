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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Popular Foods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!popularFoods || popularFoods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Popular Foods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No popular foods yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Popular Foods
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {popularFoods.slice(0, 8).map((food) => (
            <div 
              key={food.id} 
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectFood(food)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{food.name}</h4>
                  {food.isHomemade && (
                    <ChefHat className="w-3 h-3 text-orange-500" />
                  )}
                  {food.brand && (
                    <span className="text-xs text-gray-500">• {food.brand}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>{food.calories} cal</span>
                  <span>{food.protein}g protein</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{food.usageCount}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {food.category}
                  </Badge>
                  {food.tags?.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="text-right">
                <Button size="sm" variant="ghost">
                  Use
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}