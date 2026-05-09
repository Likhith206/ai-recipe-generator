const { supabase } = require("../config/db");

const RECIPES_TABLE = "recipes";

// Helper to map DB snake_case to JS camelCase
const mapRecipe = (dbRecipe) => {
  if (!dbRecipe) return null;
  return {
    id: dbRecipe.id,
    title: dbRecipe.title,
    ingredients: dbRecipe.ingredients,
    instructions: dbRecipe.instructions,
    nutrition: dbRecipe.nutrition,
    servings: dbRecipe.servings,
    prepTime: dbRecipe.prep_time,
    cookTime: dbRecipe.cook_time,
    difficulty: dbRecipe.difficulty,
    dietaryTags: dbRecipe.dietary_tags,
    servingSuggestions: dbRecipe.serving_suggestions,
    createdAt: dbRecipe.created_at,
    updatedAt: dbRecipe.updated_at,
  };
};

// Create a new recipe
const create = async (recipeData) => {
  try {
    const recipe = {
      title: recipeData.title,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      nutrition: recipeData.nutrition,
      servings: recipeData.servings,
      prep_time: recipeData.prepTime,
      cook_time: recipeData.cookTime,
      difficulty: recipeData.difficulty,
      dietary_tags: recipeData.dietaryTags,
      serving_suggestions: recipeData.servingSuggestions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(RECIPES_TABLE)
      .insert([recipe])
      .select();

    if (error) throw new Error(error.message);
    return mapRecipe(data[0]);
  } catch (error) {
    throw new Error(`Failed to create recipe: ${error.message}`);
  }
};

// Find recipes with filtering
const find = async (filter = {}) => {
  try {
    let query = supabase.from(RECIPES_TABLE).select("*");

    // Apply filters
    if (filter.dietaryTags) {
      query = query.contains("dietary_tags", [filter.dietaryTags]);
    }

    if (filter.difficulty) {
      query = query.eq("difficulty", filter.difficulty);
    }

    if (filter.title) {
      query = query.ilike("title", `%${filter.title}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(mapRecipe);
  } catch (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
};

// Find a single recipe by ID
const findById = async (id) => {
  try {
    const { data, error } = await supabase
      .from(RECIPES_TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw new Error(error.message);
    return mapRecipe(data);
  } catch (error) {
    throw new Error(`Failed to fetch recipe: ${error.message}`);
  }
};

// Update a recipe
const findByIdAndUpdate = async (id, updateData) => {
  try {
    const updates = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(RECIPES_TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    throw new Error(`Failed to update recipe: ${error.message}`);
  }
};

// Delete a recipe
const findByIdAndDelete = async (id) => {
  try {
    const { data, error } = await supabase
      .from(RECIPES_TABLE)
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    throw new Error(`Failed to delete recipe: ${error.message}`);
  }
};

module.exports = {
  create,
  find,
  findById,
  findByIdAndUpdate,
  findByIdAndDelete,
};