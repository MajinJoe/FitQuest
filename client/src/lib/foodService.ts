import type { FoodDatabaseItem } from "@shared/schema";

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