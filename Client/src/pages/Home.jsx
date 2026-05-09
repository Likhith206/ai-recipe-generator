import { useNavigate } from "react-router-dom";
import { useRecipe } from "../context/RecipeContext";
import ImageUploader from "../components/ImageUploader";
import IngredientList from "../components/IngredientList";
import DietaryFilter from "../components/DietaryFilter";
import SuggestionsList from "../components/SuggestionsList";
import Loader from "../components/Loader";

function Home() {
  const navigate = useNavigate();
  const {
    ingredients, loading, error, setError,
    generateRecipe, getRecipeSuggestions, suggestions,
    setRecipe, dietaryPreference
  } = useRecipe();

  const handleGenerateRecipe = async () => {
    try {
      const recipe = await generateRecipe();
      if (recipe) navigate("/recipe");
    } catch (err) {
      // Error handled in context
    }
  };

  const handleGetSuggestions = async () => {
    try {
      await getRecipeSuggestions();
    } catch (err) {
      // Error handled in context
    }
  };

  const handleSelectSuggestion = async (title) => {
    try {
      const recipe = await generateRecipe(ingredients, dietaryPreference, title);
      if (recipe) navigate("/recipe");
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <h1>What's in Your Fridge?</h1>
        <p>Upload a photo of your ingredients and let AI create delicious recipes for you</p>
      </header>

      <ImageUploader />

      {ingredients.length > 0 && (
        <>
          <IngredientList />
          <DietaryFilter />
          
          <div className="action-section">
            <button 
              className="primary-btn" 
              onClick={handleGenerateRecipe}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Full Recipe"}
            </button>
            <button 
              className="secondary-btn" 
              onClick={handleGetSuggestions}
              disabled={loading}
            >
              Get More Suggestions
            </button>
          </div>
        </>
      )}

      {loading && ingredients.length > 0 && <Loader message="Chef AI is thinking..." />}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {suggestions.length > 0 && !loading && (
        <SuggestionsList 
          suggestions={suggestions} 
          onSelect={handleSelectSuggestion} 
        />
      )}
    </div>
  );
}

export default Home;