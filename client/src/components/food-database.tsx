import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, Apple, Database, Check, Globe } from "lucide-react";
import type { FoodDatabaseItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchOpenFoodFacts, searchUSDAFoodDatabase } from "@/lib/foodService";

interface FoodDatabaseProps {
  onSelectFood: (food: FoodDatabaseItem) => void;
}

export default function FoodDatabase({ onSelectFood }: FoodDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Search local food database using API
  const { data: localResults, isLoading: localLoading } = useQuery<FoodDatabaseItem[]>({
    queryKey: ['/api/food/search', searchTerm, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: searchTerm,
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      });
      
      const response = await fetch(`/api/food/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search food database');
      }
      return response.json();
    },
    enabled: searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  // Search USDA Food Database (primary external source)
  const { data: usdaResults, isLoading: usdaLoading } = useQuery<any[]>({
    queryKey: ['usda', searchTerm],
    queryFn: () => searchUSDAFoodDatabase(searchTerm),
    enabled: searchTerm.length >= 3,
    staleTime: 15 * 60 * 1000, // Cache longer for external API
  });

  // Search Open Food Facts database (secondary source)
  const { data: openFoodFactsResults, isLoading: openFoodFactsLoading } = useQuery<any[]>({
    queryKey: ['openfoodfacts', searchTerm],
    queryFn: () => searchOpenFoodFacts(searchTerm),
    enabled: searchTerm.length >= 3,
    staleTime: 10 * 60 * 1000,
  });

  // Combine external results with USDA taking priority
  const globalResults = [
    ...(usdaResults || []),
    ...(openFoodFactsResults || []).filter(off => 
      !(usdaResults || []).some(usda => 
        usda.name.toLowerCase().includes(off.name.toLowerCase().substring(0, 10))
      )
    )
  ].slice(0, 20);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "snacks", label: "Snacks" },
    { value: "restaurant", label: "Restaurant" },
    { value: "bakery", label: "Bakery" },
    { value: "dairy", label: "Dairy" },
    { value: "produce", label: "Produce" },
    { value: "beverages", label: "Beverages" },
  ];

  const handleFoodSelect = async (food: FoodDatabaseItem | any) => {
    // If it's from external source, save it to our database first
    if (food.isFromUSDA || food.isFromOpenFoodFacts) {
      try {
        const response = await fetch('/api/food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...food,
            source: food.isFromUSDA ? 'usda' : 'openfoodfacts',
            contributedBy: null,
          }),
        });
        
        if (response.ok) {
          const savedFood = await response.json();
          onSelectFood(savedFood);
        } else {
          // If save fails, still use the food data
          onSelectFood(food);
        }
      } catch (error) {
        console.error('Error saving external food item:', error);
        onSelectFood(food);
      }
    } else {
      onSelectFood(food);
    }
    
    setSearchTerm("");
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Search Controls */}
      <div className="flex gap-3 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search for foods (e.g., 'Miss Vickie's', 'Panera')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-parchment/10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-parchment/10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Results with Tabs */}
      <div className="flex-1 min-h-0">
        {searchTerm.length < 2 ? (
          <div className="text-center py-12 rpg-text opacity-70">
            <Database className="w-16 h-16 mx-auto mb-6 text-fantasy-blue/50" />
            <p className="text-lg mb-2">Enter at least 2 characters to search</p>
            <p className="text-sm">Search local database + USDA + Open Food Facts</p>
          </div>
        ) : (
          <Tabs defaultValue="local" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="local" className="flex items-center gap-2 rpg-button">
                <Database className="w-4 h-4" />
                Local ({localResults?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="global" className="flex items-center gap-2 rpg-button">
                <Globe className="w-4 h-4" />
                Global ({globalResults?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="local" className="space-y-2 mt-4 flex-1 overflow-y-auto pr-2">
              {localLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-fantasy-blue" />
                  <p className="rpg-text">Searching local database...</p>
                </div>
              ) : !localResults || localResults.length === 0 ? (
                <div className="text-center py-12 rpg-text opacity-70">
                  <p className="text-lg mb-2">No local foods found</p>
                  <p className="text-sm">Try the Global tab for worldwide products</p>
                </div>
              ) : (
                localResults.map((food) => (
                  <FoodResultCard key={food.id} food={food} onSelect={handleFoodSelect} />
                ))
              )}
            </TabsContent>

            <TabsContent value="global" className="space-y-2 mt-4 flex-1 overflow-y-auto pr-2">
              {(usdaLoading || openFoodFactsLoading) ? (
                <div className="text-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-fantasy-green" />
                  <p className="rpg-text">Searching USDA & Global Databases...</p>
                </div>
              ) : !globalResults || globalResults.length === 0 ? (
                <div className="text-center py-12 rpg-text opacity-70">
                  <p className="text-lg mb-2">No global foods found</p>
                  <p className="text-sm">Try different search terms</p>
                </div>
              ) : (
                globalResults.map((food, index) => (
                  <FoodResultCard 
                    key={`global_${index}`} 
                    food={food} 
                    onSelect={handleFoodSelect}
                    isFromExternalSource={true}
                    sourceType={food.isFromUSDA ? "USDA" : "Open Food Facts"}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// Enhanced FoodResultCard with RPG styling and defensive programming
function FoodResultCard({ 
  food, 
  onSelect, 
  isFromExternalSource = false,
  sourceType = "Local"
}: { 
  food: any; 
  onSelect: (food: any) => void;
  isFromExternalSource?: boolean;
  sourceType?: string;
}) {
  // Defensive check - don't render if essential data is missing
  if (!food || !food.name || food.name.trim().length === 0) {
    console.warn('Skipping food item with missing name:', food);
    return null;
  }

  // Ensure nutrition values are numbers and not negative
  const safeCalories = Math.max(0, parseInt(food.calories) || 0);
  const safeProtein = Math.max(0, parseInt(food.protein) || 0);
  const safeCarbs = Math.max(0, parseInt(food.carbs) || 0);
  const safeFat = Math.max(0, parseInt(food.fat) || 0);

  return (
    <Card className="rpg-card hover:bg-fantasy-gold/10 cursor-pointer transition-all duration-200 border-wood-light/20 hover:border-fantasy-gold/50" 
          onClick={() => onSelect(food)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="rpg-text font-bold truncate text-lg">{food.name.trim()}</h3>
            {food.brand && food.brand.trim() && (
              <p className="text-sm text-fantasy-blue font-semibold truncate">{food.brand.trim()}</p>
            )}
            <p className="text-xs rpg-text opacity-60 mt-1">
              {food.servingSize && food.servingSize.trim() ? food.servingSize.trim() : "100g"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {isFromExternalSource && (
              <Badge variant="default" className="text-xs font-semibold bg-fantasy-purple">
                <Globe className="w-3 h-3 mr-1" />
                {sourceType}
              </Badge>
            )}
            {food.verified && (
              <Badge variant="secondary" className="text-xs bg-fantasy-green">
                <Check className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize font-medium border-wood-light">
              {food.category || "food"}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 text-sm">
          <div className="text-center p-2 bg-fantasy-gold/20 rounded-lg">
            <p className="font-bold text-fantasy-gold text-lg">{safeCalories}</p>
            <p className="text-xs rpg-text opacity-70 font-medium">calories</p>
          </div>
          <div className="text-center p-2 bg-fantasy-blue/20 rounded-lg">
            <p className="font-bold text-fantasy-blue text-lg">{safeProtein}g</p>
            <p className="text-xs rpg-text opacity-70 font-medium">protein</p>
          </div>
          <div className="text-center p-2 bg-fantasy-green/20 rounded-lg">
            <p className="font-bold text-fantasy-green text-lg">{safeCarbs}g</p>
            <p className="text-xs rpg-text opacity-70 font-medium">carbs</p>
          </div>
          <div className="text-center p-2 bg-fantasy-purple/20 rounded-lg">
            <p className="font-bold text-fantasy-purple text-lg">{safeFat}g</p>
            <p className="text-xs rpg-text opacity-70 font-medium">fat</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}