import RecipeCard from "./RecipeCard";

function RecipeDisplay({ recipe }) {
  if (!recipe) return null;

  return (
    <div className="recipe-display">
      <RecipeCard recipe={recipe} hideAction={true} />

      <div className="recipe-section">
        <h3>Ingredients</h3>
        <ul className="ingredients-list">
          {recipe.ingredients.map((ing, idx) => (
            <li key={idx}>
              <span className="ing-name">{ing.name}</span>
              {ing.quantity && <span className="ing-quantity"> — {ing.quantity}</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="recipe-section">
        <h3>Instructions</h3>
        <div className="instructions-list">
          {recipe.instructions.map((step, idx) => (
            <div key={idx} className="instruction-step">
              <span className="step-number">Step {step.step || idx + 1}</span>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {recipe.nutrition && (
        <div className="recipe-section">
          <h3>Nutrition Information</h3>
          <div className="nutrition-grid">
            {Object.entries(recipe.nutrition).map(([key, value]) => (
              <div key={key} className="nutrition-item">
                <span className="nutrition-label">{key}</span>
                <span className="nutrition-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recipe.servingSuggestions && recipe.servingSuggestions.length > 0 && (
        <div className="recipe-section">
          <h3>Serving Suggestions</h3>
          <ul className="suggestions-list">
            {recipe.servingSuggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RecipeDisplay;