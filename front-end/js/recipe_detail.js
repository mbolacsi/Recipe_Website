document.addEventListener('DOMContentLoaded', function() {
    const divRecipeDetails = document.getElementById('recipe_detail');

    // Extract recipe ID
    const recipeId = new URLSearchParams(window.location.search).get('id');
    if (!recipeId) {
        divRecipeDetails.innerHTML = '<p class="failure">Error: Recipe ID is missing in the URL.</p>';
        return;
    }

    const API_URL = `http://localhost:8080/recipe_detail/${recipeId}`;

    function displayRecipeDetails(recipe) {
        const ingredientsArray = recipe.ingredients
            ? recipe.ingredients.split(/[\n,]+/).map(i => i.trim()).filter(Boolean)
            : [];

        // build the main detail plus contributor at the end
        divRecipeDetails.innerHTML = `
      <h2>${recipe.title}</h2>

      <p><strong>Ingredients:</strong></p>
      <ul>
        ${
            ingredientsArray.length
                ? ingredientsArray.map(i => `<li>${i}</li>`).join('')
                : '<li>No ingredients listed.</li>'
        }
      </ul>

      <p><strong>Instructions:</strong></p>
      <p>${recipe.instructions || 'No instructions available.'}</p>

      <!-- Contributor inside the same container -->
      <p class="contributor">
        <strong>Contributor:</strong> ${recipe.contributor || 'Unknown'}
      </p>
    `;
    }

    async function fetchRecipeDetails() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                divRecipeDetails.innerHTML = '<p class="failure">Error: Failed to fetch recipe details.</p>';
                return;
            }
            const recipe = await response.json();
            displayRecipeDetails(recipe);
        } catch (err) {
            divRecipeDetails.innerHTML = `<p class="failure">Error: ${err.message}</p>`;
        }
    }

    fetchRecipeDetails();
});
