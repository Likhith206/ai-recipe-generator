const { ai } = require("../config/gemini");
const Recipe = require("../models/Recipe");

// ── POST /api/recipes/analyze ────────────────────────────────
const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const prompt = 'Analyze this food image carefully. Identify all visible ingredients, food items, or dishes. Return ONLY a JSON array of ingredient names. Example: ["tomato", "onion", "chicken", "rice"]. If this is a prepared dish, identify the dish name and its likely ingredients.';

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: req.file.mimetype,
                            data: req.file.buffer.toString("base64")
                        }
                    }
                ]
            }
        ]
    });

    if (!result.candidates || result.candidates.length === 0) {
        throw new Error("No response generated from AI. It might be blocked by safety filters.");
    }

    const text = result.candidates[0].content.parts[0].text;

    // Parse JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    let ingredients = [];

    if (jsonMatch) {
      try {
        ingredients = JSON.parse(jsonMatch[0]);
      } catch {
        ingredients = text
          .replace(/[\[\]"]/g, "")
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean);
      }
    }

    res.json({ ingredients, rawResponse: text });
  } catch (error) {
    console.error("Image analysis error:", error);
    if (error.status === 429) {
        return res.status(429).json({ error: "Rate limit reached. Please wait a minute before trying again." });
    }
    res.status(500).json({ error: "Failed to analyze image: " + error.message });
  }
};

// ── POST /api/recipes/generate ───────────────────────────────
const generateRecipe = async (req, res) => {
  try {
    const { ingredients, dietaryPreference } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "Ingredients are required" });
    }

    const dietFilter = dietaryPreference
      ? `The recipe MUST be ${dietaryPreference}-friendly.`
      : "";

    const prompt = `You are a professional chef and nutritionist. Based on these ingredients: ${ingredients.join(", ")}.
${dietFilter}

Generate a detailed recipe in the following JSON format:
{
  "title": "Recipe Name",
  "ingredients": [{"name": "ingredient name", "quantity": "amount needed"}],
  "instructions": [{"step": 1, "description": "Step description"}],
  "nutrition": {
    "calories": "approximate calories per serving",
    "protein": "protein in grams",
    "carbs": "carbs in grams",
    "fat": "fat in grams",
    "fiber": "fiber in grams"
  },
  "servings": "number of servings",
  "prepTime": "preparation time",
  "cookTime": "cooking time",
  "difficulty": "Easy/Medium/Hard",
  "dietaryTags": ["applicable tags from: vegan, vegetarian, keto, gluten-free, dairy-free, low-carb, high-protein, paleo"],
  "servingSuggestions": ["suggestion 1", "suggestion 2"]
}`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
    });

    if (!result.candidates || result.candidates.length === 0) {
        throw new Error("No recipe generated from AI.");
    }

    const text = result.candidates[0].content.parts[0].text;
    const recipe = JSON.parse(text);

    // Attach the original detected ingredients
    recipe.detectedIngredients = ingredients;

    res.json({ recipe });
  } catch (error) {
    console.error("Recipe generation error:", error);
    res.status(500).json({ error: "Failed to generate recipe: " + error.message });
  }
};

// ── POST /api/recipes/suggestions ───────────────────────────
const generateMultipleRecipes = async (req, res) => {
  try {
    const { ingredients, dietaryPreference } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "Ingredients are required" });
    }

    const dietFilter = dietaryPreference
      ? `All recipes MUST be ${dietaryPreference}-friendly.`
      : "";

    const prompt = `You are a professional chef. Based on these ingredients: ${ingredients.join(", ")}.
${dietFilter}

Suggest 3 different recipes that can be made. Return ONLY a JSON array:
[
  {
    "title": "Recipe Name",
    "description": "Brief 1-line description",
    "difficulty": "Easy/Medium/Hard",
    "cookTime": "estimated time",
    "dietaryTags": ["applicable tags"]
  }
]`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
    });

    if (!result.candidates || result.candidates.length === 0) {
        throw new Error("No suggestions generated from AI.");
    }

    const text = result.candidates[0].content.parts[0].text;
    const suggestions = JSON.parse(text);

    res.json({ suggestions });
  } catch (error) {
    console.error("Multiple recipe error:", error);
    res.status(500).json({ error: "Failed to generate suggestions: " + error.message });
  }
};

// ── POST /api/recipes/save ───────────────────────────────────
const saveRecipe = async (req, res) => {
  try {
    const saved = await Recipe.create(req.body);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Save recipe error:", error);
    res.status(500).json({ error: "Failed to save recipe" });
  }
};

// ── GET /api/recipes/saved ───────────────────────────────────
const getSavedRecipes = async (req, res) => {
  try {
    const { diet, difficulty, search } = req.query;
    const filter = {};

    if (diet) {
      filter.dietaryTags = diet;
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    if (search) {
      filter.title = search;
    }

    const recipes = await Recipe.find(filter);
    res.json(recipes);
  } catch (error) {
    console.error("Get recipes error:", error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
};

// ── GET /api/recipes/saved/:id ───────────────────────────────
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    console.error("Get recipe error:", error);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
};

// ── DELETE /api/recipes/saved/:id ────────────────────────────
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Delete recipe error:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
};

module.exports = {
  analyzeImage,
  generateRecipe,
  generateMultipleRecipes,
  saveRecipe,
  getSavedRecipes,
  getRecipeById,
  deleteRecipe,
};
