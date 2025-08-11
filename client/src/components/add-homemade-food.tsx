import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChefHat, Camera, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FoodDatabaseItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

interface AddHomemadeFoodProps {
  onFoodAdded: (food: FoodDatabaseItem) => void;
}

export default function AddHomemadeFood({ onFoodAdded }: AddHomemadeFoodProps) {
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
    <div>
      <div className="text-center mb-6">
        <p className="rpg-text opacity-70">Share your homemade recipes with the community!</p>
        <p className="text-xs rpg-text opacity-60 mt-1">Earn +25 XP for each contribution</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="rpg-text">Food Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-parchment/10" placeholder="My Special Recipe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="servingSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="rpg-text">Serving Size</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-parchment/10" placeholder="1 cup, 100g, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="rpg-text">Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-parchment/10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nutrition Info */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="rpg-text">Calories</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      className="bg-parchment/10"
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormLabel className="rpg-text">Protein (g)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      className="bg-parchment/10"
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormLabel className="rpg-text">Carbs (g)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      className="bg-parchment/10"
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormLabel className="rpg-text">Fat (g)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      className="bg-parchment/10"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="rpg-text text-sm font-medium">Tags (Optional)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-fantasy-purple text-white border-fantasy-purple'
                      : 'rpg-button text-xs'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Recipe */}
          <FormField
            control={form.control}
            name="recipe"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="rpg-text">Recipe (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    className="bg-parchment/10"
                    placeholder="Share your recipe steps..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full rpg-button bg-fantasy-gold hover:bg-fantasy-gold/80 text-wood-dark" 
            disabled={createFoodMutation.isPending}
          >
            {createFoodMutation.isPending ? "Adding Recipe..." : "Add Recipe & Earn 25 XP"}
          </Button>
        </form>
      </Form>
    </div>
  );
}