import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, Apple, Check, Globe } from "lucide-react";
import type { FoodDatabaseItem } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchOpenFoodFacts, searchUSDAFoodDatabase } from "@/lib/foodService";

interface InlineFoodDatabaseProps {
  onSelectFood: (food: FoodDatabaseItem) => void;
}

export default function InlineFoodDatabase({ onSelectFood }: InlineFoodDatabaseProps) {
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

  // Search Open Food Facts API (secondary external source)
  const { data: openFoodFactsResults, isLoading: openFoodFactsLoading } = useQuery<any[]>({
    queryKey: ['openfoodfacts', searchTerm],
    queryFn: () => searchOpenFoodFacts(searchTerm),
    enabled: searchTerm.length >= 3,
    staleTime: 15 * 60 * 1000,
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "packaged", label: "Packaged Foods" },
    { value: "fresh", label: "Fresh Foods" },
    { value: "beverages", label: "Beverages" },
    { value: "snacks", label: "Snacks" },
    { value: "homemade", label: "Homemade" },
    { value: "restaurants", label: "Restaurants" },
  ];

  // Combine and format results from external APIs
  const globalResults: any[] = [
    ...(usdaResults || []).map((food: any) => ({
      id: `usda_${food.fdcId}`,
      name: food.description,
      brand: food.brandOwner || null,
      category: "packaged",
      servingSize: "100g",
      calories: food.foodNutrients?.find((n: any) => n.nutrientId === 1008)?.value || 0,
      protein: food.foodNutrients?.find((n: any) => n.nutrientId === 1003)?.value || 0,
      carbs: food.foodNutrients?.find((n: any) => n.nutrientId === 1005)?.value || 0,
      fat: food.foodNutrients?.find((n: any) => n.nutrientId === 1004)?.value || 0,
      fiber: food.foodNutrients?.find((n: any) => n.nutrientId === 1079)?.value || 0,
      sugar: food.foodNutrients?.find((n: any) => n.nutrientId === 2000)?.value || 0,
      sodium: food.foodNutrients?.find((n: any) => n.nutrientId === 1093)?.value || 0,
      source: "usda",
      verified: true,
      isFromUSDA: true,
      createdAt: new Date(),
      barcode: null,
      sourceId: null,
      contributedBy: null,
      isHomemade: false,
      usageCount: 0,
      allergens: null,
      tags: null,
      recipe: null,
      ingredients: null,
      imageUrl: null,
      updatedAt: new Date(),
    })),
    ...(openFoodFactsResults || []).map((food: any) => ({
      id: `off_${food.code}`,
      name: food.product_name || 'Unknown Product',
      brand: food.brands || null,
      category: "packaged",
      servingSize: "100g",
      calories: Math.round((food.nutriments?.energy_kcal_100g || 0)),
      protein: Math.round((food.nutriments?.proteins_100g || 0) * 10) / 10,
      carbs: Math.round((food.nutriments?.carbohydrates_100g || 0) * 10) / 10,
      fat: Math.round((food.nutriments?.fat_100g || 0) * 10) / 10,
      fiber: Math.round((food.nutriments?.fiber_100g || 0) * 10) / 10,
      sugar: Math.round((food.nutriments?.sugars_100g || 0) * 10) / 10,
      sodium: Math.round((food.nutriments?.sodium_100g || 0) * 10) / 10,
      source: "openfoodfacts",
      verified: true,
      barcode: food.code,
      isFromUSDA: false,
      createdAt: new Date(),
      sourceId: null,
      contributedBy: null,
      isHomemade: false,
      usageCount: 0,
      allergens: null,
      tags: null,
      recipe: null,
      ingredients: null,
      imageUrl: null,
      updatedAt: new Date(),
    }))
  ];

  const handleFoodSelect = (food: FoodDatabaseItem | any) => {
    onSelectFood(food);
  };

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search for foods (e.g., 'Miss Vickie's', 'Panera')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-fantasy-purple text-gray-800"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-white border-fantasy-purple text-gray-800">
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

      {searchTerm.length >= 2 && (
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-parchment-dark">
            <TabsTrigger value="local" className="text-gray-800">Local Database</TabsTrigger>
            <TabsTrigger value="global" className="text-gray-800">Global Search</TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="max-h-96 overflow-y-auto space-y-2 mt-4">
            {localLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Searching local database...</p>
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
                <p className="text-gray-600">Searching USDA & Global Databases...</p>
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
                  sourceType={(food as any).isFromUSDA ? "USDA" : "Open Food Facts"}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      {searchTerm.length < 2 && (
        <div className="text-center py-8 text-gray-500">
          <Apple className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Start typing to search foods</p>
          <p className="text-sm mt-1">Search local database and global nutrition sources</p>
        </div>
      )}
    </div>
  );
}

// Separate component for food result cards
interface FoodResultCardProps {
  food: FoodDatabaseItem;
  onSelect: (food: FoodDatabaseItem) => void;
  isFromExternalSource?: boolean;
  sourceType?: string;
}

function FoodResultCard({ food, onSelect, isFromExternalSource = false, sourceType }: FoodResultCardProps) {
  return (
    <div 
      className="flex items-center justify-between p-4 rounded-lg border border-fantasy-purple bg-white hover:bg-parchment cursor-pointer transition-colors"
      onClick={() => onSelect(food)}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-medium text-gray-800">{food.name}</h4>
          {food.brand && (
            <span className="text-xs text-gray-600 bg-parchment-dark px-2 py-1 rounded">
              {food.brand}
            </span>
          )}
          {isFromExternalSource && (
            <Badge variant="outline" className="text-xs border-fantasy-gold text-fantasy-gold">
              <Globe className="w-3 h-3 mr-1" />
              {sourceType}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="text-fantasy-gold font-medium">{food.calories} cal</span>
          <span>P: {food.protein}g</span>
          <span>C: {food.carbs}g</span>
          <span>F: {food.fat}g</span>
        </div>
        
        {food.servingSize && (
          <div className="text-xs text-gray-500 mt-1">
            Per {food.servingSize}
          </div>
        )}
      </div>
      
      <div className="ml-4">
        <div className="w-8 h-8 rounded-full bg-fantasy-green flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}