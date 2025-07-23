import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChefHat, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FoodDatabaseItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const homemadeFoodSchema = z.object({
  name: z.string().min(1, "Food name is required"),
  category: z.string().min(1, "Category is required"),
  servingSize: z.string().min(1, "Serving size is required"),
  calories: z.number().min(0, "Calories must be positive"),
  protein: z.number().min(0, "Protein must be positive"),
  carbs: z.number().min(0, "Carbs must be positive"),
  fat: z.number().min(0, "Fat must be positive"),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  recipe: z.string().optional(),
  ingredients: z.string().optional(),
  tags: z.string().optional(),
  imageUrl: z.string().optional(),
});

interface InlineAddHomemadeFoodProps {
  onFoodAdded: (food: FoodDatabaseItem) => void;
}

export default function InlineAddHomemadeFood({ onFoodAdded }: InlineAddHomemadeFoodProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof homemadeFoodSchema>>({
    resolver: zodResolver(homemadeFoodSchema),
    defaultValues: {
      name: "",
      category: "",
      servingSize: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      recipe: "",
      ingredients: "",
      tags: "",
      imageUrl: "",
    },
  });

  const createFoodMutation = useMutation({
    mutationFn: async (data: z.infer<typeof homemadeFoodSchema>) => {
      const foodData = {
        ...data,
        isHomemade: true,
        source: "user",
        verified: false,
        tags: selectedTags,
        allergens: null,
        barcode: null,
        sourceId: null,
      };

      const response = await apiRequest("POST", "/api/food", foodData);
      return response.json();
    },
    onSuccess: (newFood) => {
      queryClient.invalidateQueries({ queryKey: ["/api/food/search"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food/user-contributions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Homemade Food Added!",
        description: `"${newFood.name}" has been added to the database. You earned 25 XP!`,
      });

      onFoodAdded(newFood);
      form.reset();
      setSelectedTags([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add homemade food",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "homemade", label: "Homemade Meals" },
    { value: "snacks", label: "Homemade Snacks" },
    { value: "bakery", label: "Baked Goods" },
    { value: "beverages", label: "Drinks" },
    { value: "desserts", label: "Desserts" },
    { value: "soups", label: "Soups & Stews" },
  ];

  const commonTags = [
    "vegan", "vegetarian", "gluten-free", "dairy-free", "keto", "low-carb",
    "high-protein", "healthy", "comfort-food", "family-recipe", "quick",
    "meal-prep", "spicy", "sweet", "savory"
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const onSubmit = (data: z.infer<typeof homemadeFoodSchema>) => {
    createFoodMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-800">Food Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Grandma's Chocolate Chip Cookies" 
                      {...field} 
                      className="bg-white border-fantasy-purple text-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800">Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-fantasy-purple text-gray-800">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="servingSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800">Serving Size *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 1 cup, 2 pieces" 
                        {...field} 
                        className="bg-white border-fantasy-purple text-gray-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Nutrition Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-fantasy-gold">Nutrition Facts (per serving)</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800">Calories *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-white border-fantasy-purple text-gray-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800">Protein (g) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-white border-fantasy-purple text-gray-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800">Carbohydrates (g) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-white border-fantasy-purple text-gray-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800">Fat (g) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-white border-fantasy-purple text-gray-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-fantasy-purple" />
              <span className="text-gray-800 font-medium">Tags (optional)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedTags.includes(tag) 
                      ? "bg-fantasy-purple text-white" 
                      : "border-fantasy-purple text-fantasy-purple hover:bg-fantasy-purple hover:text-white"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-800">Ingredients (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List the main ingredients..."
                      {...field}
                      className="bg-white border-fantasy-purple text-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-800">Recipe/Instructions (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your recipe or cooking instructions..."
                      {...field}
                      className="bg-white border-fantasy-purple text-gray-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-fantasy-gold hover:bg-yellow-600 text-slate-900 font-medium" 
            disabled={createFoodMutation.isPending}
          >
            {createFoodMutation.isPending ? (
              <>
                <Plus className="w-4 h-4 mr-2 animate-spin" />
                Adding to Database...
              </>
            ) : (
              <>
                <ChefHat className="w-4 h-4 mr-2" />
                Add to Community Database (+25 XP)
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}