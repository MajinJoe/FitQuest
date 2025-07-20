import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, Apple, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  verified: boolean;
}

interface FoodDatabaseProps {
  onSelectFood: (food: FoodItem) => void;
}

export default function FoodDatabase({ onSelectFood }: FoodDatabaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock food database - in real app would connect to USDA FoodData Central or similar
  const mockFoodDatabase: FoodItem[] = [
    {
      id: "1",
      name: "Chicken Breast",
      brand: "Generic",
      servingSize: "100g",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      verified: true
    },
    {
      id: "2", 
      name: "Brown Rice",
      brand: "Generic",
      servingSize: "1 cup cooked (195g)",
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
      fiber: 4,
      verified: true
    },
    {
      id: "3",
      name: "Greek Yogurt",
      brand: "Chobani",
      servingSize: "170g container",
      calories: 100,
      protein: 18,
      carbs: 6,
      fat: 0,
      sugar: 4,
      verified: true
    },
    {
      id: "4",
      name: "Avocado",
      brand: "Generic",
      servingSize: "1 medium (150g)",
      calories: 234,
      protein: 3,
      carbs: 12,
      fat: 21,
      fiber: 10,
      verified: true
    },
    {
      id: "5",
      name: "Oatmeal",
      brand: "Quaker",
      servingSize: "1 cup prepared",
      calories: 154,
      protein: 6,
      carbs: 28,
      fat: 3,
      fiber: 4,
      verified: true
    },
    {
      id: "6",
      name: "Salmon Fillet",
      brand: "Generic",
      servingSize: "100g",
      calories: 208,
      protein: 25,
      carbs: 0,
      fat: 12,
      verified: true
    },
    {
      id: "7",
      name: "Banana",
      brand: "Generic",
      servingSize: "1 medium (118g)",
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      fiber: 3,
      sugar: 14,
      verified: true
    },
    {
      id: "8",
      name: "Almonds",
      brand: "Generic",
      servingSize: "28g (23 almonds)",
      calories: 164,
      protein: 6,
      carbs: 6,
      fat: 14,
      fiber: 4,
      verified: true
    }
  ];

  const categories = [
    { id: "all", name: "All Foods" },
    { id: "protein", name: "Protein" },
    { id: "carbs", name: "Carbs" },
    { id: "fruits", name: "Fruits" },
    { id: "dairy", name: "Dairy" },
    { id: "nuts", name: "Nuts & Seeds" }
  ];

  // Filter foods based on search and category
  const filteredFoods = mockFoodDatabase.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (food.brand && food.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === "all") return matchesSearch;
    
    // Simple category filtering based on food characteristics
    const categoryMatch = {
      protein: food.protein > 15,
      carbs: food.carbs > 20,
      fruits: food.name.toLowerCase().includes('banana') || food.name.toLowerCase().includes('apple'),
      dairy: food.name.toLowerCase().includes('yogurt') || food.name.toLowerCase().includes('milk'),
      nuts: food.name.toLowerCase().includes('almond') || food.name.toLowerCase().includes('nut')
    }[selectedCategory] || false;
    
    return matchesSearch && categoryMatch;
  });

  const handleSelectFood = (food: FoodItem) => {
    onSelectFood(food);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full border-fantasy-green text-fantasy-green hover:bg-fantasy-green hover:text-white"
        >
          <Database className="w-4 h-4 mr-2" />
          Food Database
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-slate-800 border-fantasy-green max-w-md mx-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-fantasy-gold flex items-center">
            <Database className="mr-2" />
            Food Database
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-fantasy-green" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
          
          {/* Food Results */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredFoods.map(food => (
              <Card 
                key={food.id} 
                className="bg-slate-700 border-gray-600 cursor-pointer hover:border-fantasy-green transition-colors"
                onClick={() => handleSelectFood(food)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-light-text">{food.name}</h3>
                      {food.brand && (
                        <p className="text-sm text-gray-400">{food.brand}</p>
                      )}
                      <p className="text-xs text-fantasy-blue">{food.servingSize}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {food.verified && (
                        <Badge className="bg-fantasy-green text-black text-xs">
                          Verified
                        </Badge>
                      )}
                      <span className="text-fantasy-gold font-bold">{food.calories} cal</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                    <div>
                      <span className="text-fantasy-blue font-medium">{food.protein}g</span> protein
                    </div>
                    <div>
                      <span className="text-fantasy-purple font-medium">{food.carbs}g</span> carbs
                    </div>
                    <div>
                      <span className="text-yellow-400 font-medium">{food.fat}g</span> fat
                    </div>
                  </div>
                  
                  {(food.fiber || food.sugar) && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-1">
                      {food.fiber && <div>Fiber: {food.fiber}g</div>}
                      {food.sugar && <div>Sugar: {food.sugar}g</div>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {filteredFoods.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Apple className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No foods found</p>
                <p className="text-sm">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
          
          {/* Database Info */}
          <Card className="bg-gradient-to-r from-fantasy-blue to-blue-800 border-fantasy-blue">
            <CardContent className="p-3">
              <p className="text-xs text-light-text">
                💡 <strong>Pro Tip:</strong> Use the barcode scanner or search by brand name for accurate nutrition data
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}