import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, Apple, Database, Check, Globe } from "lucide-react";
import type { FoodDatabaseItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchOpenFoodFacts, searchUSDAFoodDatabase } from "@/lib/foodService";

interface FoodDatabaseProps {
  onSelectFood: (food: FoodDatabaseItem) => void;
}

export default function FoodDatabase({ onSelectFood }: FoodDatabaseProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Database className="w-4 h-4 mr-2" />
          Search Food Database
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-green-500" />
            Food Database Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Controls */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for foods (e.g., 'Miss Vickie's', 'Panera')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
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
          {searchTerm.length < 2 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Enter at least 2 characters to search</p>
              <p className="text-sm mt-1">Search local database + Open Food Facts</p>
            </div>
          ) : (
            <Tabs defaultValue="local" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="local" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Local ({localResults?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="global" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Global ({globalResults?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="local" className="max-h-96 overflow-y-auto space-y-2 mt-4">
                {localLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Searching local database...</p>
                  </div>
                ) : !localResults || localResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No local foods found</p>
                    <p className="text-sm mt-1">Try the Global tab for worldwide products</p>
                  </div>
                ) : (
                  localResults.map((food) => (
                    <FoodResultCard key={food.id} food={food} onSelect={handleFoodSelect} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="global" className="max-h-96 overflow-y-auto space-y-2 mt-4">
                {(usdaLoading || openFoodFactsLoading) ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Searching USDA & Global Databases...</p>
                  </div>
                ) : !globalResults || globalResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No global foods found</p>
                    <p className="text-sm mt-1">Try different search terms</p>
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
      </DialogContent>
    </Dialog>
  );
}

// Separate component for food result cards
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
  return (
    <Card className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => onSelect(food)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{food.name}</h3>
            {food.brand && (
              <p className="text-sm text-gray-600 font-medium">{food.brand}</p>
            )}
            <p className="text-xs text-gray-500">{food.servingSize}</p>
          </div>
          <div className="flex items-center gap-2">
            {isFromExternalSource && (
              <Badge variant="default" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {sourceType}
              </Badge>
            )}
            {food.verified && (
              <Badge variant="secondary" className="text-xs">
                <Check className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize">
              {food.category}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="font-semibold text-orange-600">{food.calories}</p>
            <p className="text-xs text-gray-500">calories</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-blue-600">{food.protein}g</p>
            <p className="text-xs text-gray-500">protein</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-yellow-600">{food.carbs}g</p>
            <p className="text-xs text-gray-500">carbs</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-purple-600">{food.fat}g</p>
            <p className="text-xs text-gray-500">fat</p>
          </div>
        </div>
        
        {(food.fiber || food.sugar || food.sodium) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex gap-4 text-xs text-gray-600">
              {food.fiber ? <span>Fiber: {food.fiber}g</span> : null}
              {food.sugar ? <span>Sugar: {food.sugar}g</span> : null}
              {food.sodium ? <span>Sodium: {food.sodium}mg</span> : null}
            </div>
          </div>
        )}

        {isFromExternalSource && food.ingredients && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600 line-clamp-2">
              <span className="font-medium">Ingredients:</span> {food.ingredients}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}