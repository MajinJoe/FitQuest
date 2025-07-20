import type { FoodDatabaseItem } from "@shared/schema";

// USDA Food Database Central API
export async function searchUSDAFoodDatabase(query: string): Promise<any[]> {
  try {
    // USDA FoodData Central API - public access, no key required for basic search
    const searchResponse = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&dataType=Foundation,SR%20Legacy&pageSize=20&api_key=DEMO_KEY`
    );

    if (!searchResponse.ok) {
      console.error('USDA API error:', searchResponse.status);
      return [];
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.foods) {
      return [];
    }

    return searchData.foods
      .filter((food: any) => 
        food.description && 
        food.foodNutrients && 
        food.foodNutrients.length > 0
      )
      .slice(0, 15)
      .map((food: any) => {
        const nutrients = extractUSDANutrients(food.foodNutrients);
        
        return {
          id: `usda_${food.fdcId}`,
          name: cleanUSDAFoodName(food.description),
          brand: food.brandOwner || food.marketClass || null,
          category: mapUSDACategory(food.foodCategory || food.description),
          servingSize: "100g", // USDA data is per 100g
          calories: Math.round(nutrients.calories || 0),
          protein: Math.round(nutrients.protein || 0),
          carbs: Math.round(nutrients.carbs || 0),
          fat: Math.round(nutrients.fat || 0),
          fiber: Math.round(nutrients.fiber || 0),
          sugar: Math.round(nutrients.sugar || 0),
          sodium: Math.round(nutrients.sodium || 0),
          verified: true,
          barcode: null,
          source: "usda",
          sourceId: food.fdcId.toString(),
          contributedBy: null,
          imageUrl: null,
          ingredients: food.ingredients || null,
          allergens: null,
          isHomemade: false,
          recipe: null,
          tags: extractUSDATagsFromFood(food),
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          isFromUSDA: true,
        };
      });
  } catch (error) {
    console.error('Error searching USDA Food Database:', error);
    return [];
  }
}

function extractUSDANutrients(foodNutrients: any[]) {
  const nutrients = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  foodNutrients.forEach((nutrient: any) => {
    const nutrientId = nutrient.nutrient?.id;
    const value = nutrient.amount || 0;

    switch (nutrientId) {
      case 1008: // Energy (calories)
        nutrients.calories = value;
        break;
      case 1003: // Protein
        nutrients.protein = value;
        break;
      case 1005: // Carbohydrates
        nutrients.carbs = value;
        break;
      case 1004: // Total lipid (fat)
        nutrients.fat = value;
        break;
      case 1079: // Fiber
        nutrients.fiber = value;
        break;
      case 2000: // Sugars, total
        nutrients.sugar = value;
        break;
      case 1093: // Sodium
        nutrients.sodium = value;
        break;
    }
  });

  return nutrients;
}

function cleanUSDAFoodName(description: string): string {
  return description
    .toLowerCase()
    .split(',')[0] // Take first part before comma
    .replace(/\b\w/g, l => l.toUpperCase()) // Title case
    .replace(/\s+/g, ' ') // Clean up spaces
    .trim();
}

function mapUSDACategory(categoryOrDescription: string): string {
  if (!categoryOrDescription) return "food";
  const text = categoryOrDescription.toLowerCase();
  
  if (text.includes("dairy") || text.includes("milk") || text.includes("cheese") || text.includes("yogurt")) return "dairy";
  if (text.includes("fruit")) return "produce";
  if (text.includes("vegetable")) return "produce";
  if (text.includes("meat") || text.includes("poultry") || text.includes("fish") || text.includes("seafood")) return "protein";
  if (text.includes("bread") || text.includes("cereal") || text.includes("grain")) return "grains";
  if (text.includes("snack") || text.includes("chip") || text.includes("cookie")) return "snacks";
  if (text.includes("beverage") || text.includes("juice") || text.includes("soda")) return "beverages";
  
  return "food";
}

function extractUSDATagsFromFood(food: any): string[] {
  const tags: string[] = [];
  
  if (food.dataType) {
    tags.push(food.dataType.toLowerCase().replace(/\s+/g, '-'));
  }
  
  if (food.foodCategory) {
    const cleanCategory = food.foodCategory.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 15);
    if (cleanCategory) tags.push(cleanCategory);
  }

  // Add nutritional tags based on content
  const nutrients = extractUSDANutrients(food.foodNutrients || []);
  if (nutrients.protein > 15) tags.push("high-protein");
  if (nutrients.fiber > 5) tags.push("high-fiber");
  if (nutrients.sodium < 140) tags.push("low-sodium");
  
  return tags.slice(0, 4);
}

export async function searchOpenFoodFacts(query: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`
    );
    
    if (!response.ok) {
      console.error('Open Food Facts API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.products) {
      return [];
    }

    return data.products
      .filter((p: any) => 
        p.product_name && 
        p.nutriments && 
        (p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal'])
      )
      .slice(0, 10)
      .map((p: any) => ({
        id: `off_${p.code}`, // Temporary ID for Open Food Facts products
        name: p.product_name || "Unknown Product",
        brand: p.brands?.split(',')[0]?.trim() || null,
        category: mapOpenFoodFactsCategory(p.categories),
        servingSize: p.serving_size || "100g",
        calories: Math.round(p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal'] || 0),
        protein: Math.round(p.nutriments.proteins_100g || p.nutriments.proteins || 0),
        carbs: Math.round(p.nutriments.carbohydrates_100g || p.nutriments.carbohydrates || 0),
        fat: Math.round(p.nutriments.fat_100g || p.nutriments.fat || 0),
        fiber: Math.round(p.nutriments.fiber_100g || p.nutriments.fiber || 0),
        sugar: Math.round(p.nutriments.sugars_100g || p.nutriments.sugars || 0),
        sodium: Math.round((p.nutriments.sodium_100g || p.nutriments.sodium || 0) * 1000), // Convert g to mg
        verified: true,
        barcode: p.code,
        source: "openfoodfacts",
        sourceId: p.code,
        contributedBy: null,
        imageUrl: p.image_url || null,
        ingredients: p.ingredients_text || null,
        allergens: p.allergens_tags?.join(', ') || null,
        isHomemade: false,
        recipe: null,
        tags: extractTagsFromOpenFoodFacts(p),
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFromOpenFoodFacts: true, // Flag to identify these as external results
      }));
  } catch (error) {
    console.error('Error searching Open Food Facts:', error);
    return [];
  }
}

function mapOpenFoodFactsCategory(categories: string): string {
  if (!categories) return "food";
  const categoryStr = categories.toLowerCase();
  
  if (categoryStr.includes("snack")) return "snacks";
  if (categoryStr.includes("bread") || categoryStr.includes("bakery")) return "bakery";
  if (categoryStr.includes("dairy") || categoryStr.includes("milk") || categoryStr.includes("cheese")) return "dairy";
  if (categoryStr.includes("fruit") || categoryStr.includes("vegetable")) return "produce";
  if (categoryStr.includes("beverage") || categoryStr.includes("drink")) return "beverages";
  if (categoryStr.includes("meat") || categoryStr.includes("fish")) return "protein";
  
  return "food";
}

function extractTagsFromOpenFoodFacts(productData: any): string[] {
  const tags: string[] = [];
  
  if (productData.labels_tags) {
    productData.labels_tags.slice(0, 3).forEach((label: string) => {
      const cleanLabel = label.replace('en:', '').replace(/-/g, ' ');
      if (cleanLabel.length < 20) {
        tags.push(cleanLabel);
      }
    });
  }
  
  if (productData.categories_tags) {
    productData.categories_tags.slice(0, 2).forEach((cat: string) => {
      const cleanCat = cat.replace('en:', '').replace(/-/g, ' ');
      if (cleanCat.length < 15) {
        tags.push(cleanCat);
      }
    });
  }
  
  return tags.slice(0, 5);
}