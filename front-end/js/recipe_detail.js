document.addEventListener('DOMContentLoaded', function() {
    const divRecipeDetails = document.getElementById('recipe_detail');

    // Extract the recipe ID from the URL
    const recipeId = new URLSearchParams(window.location.search).get('id');

    if (!recipeId) {
        divRecipeDetails.innerHTML = '<p class="failure">Error: Recipe ID is missing in the URL.</p>';
        return;
    }

    // API URL to fetch recipe details based on the ID
    const API_URL = `http://localhost:8080/recipe_detail/${recipeId}`;

    // Function to display recipe details
    function displayRecipeDetails(recipe) {
        // Prepare the ingredients array (split and clean the ingredients if needed)
        const ingredientsArray = recipe.ingredients ? recipe.ingredients.split(/[\n,]+/).map(item => item.trim()).filter(Boolean) : [];

        // Populate the recipe details into the div
        divRecipeDetails.innerHTML = `
            <h2>${recipe.title}</h2>
            <p><strong>Category:</strong> ${recipe.category}</p>
            <p><strong>Contributor:</strong> ${recipe.contributor || 'Unknown'}</p>
            
            <p><strong>Ingredients:</strong></p>
            <ul>
                ${ingredientsArray.length > 0 ? ingredientsArray.map(ingredient => `<li>${ingredient}</li>`).join('') : '<li>No ingredients listed.</li>'}
            </ul>
            
            <p><strong>Instructions:</strong></p>
            <p>${recipe.instructions || 'No instructions available.'}</p>
        `;
    }

    // Fetch the recipe details from the API
    async function fetchRecipeDetails() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                divRecipeDetails.innerHTML = '<p class="failure">Error: Failed to fetch recipe details.</p>';
                return;
            }

            const recipe = await response.json();
            if (!recipe || !recipe.title) {
                divRecipeDetails.innerHTML = '<p class="failure">Error: Recipe not found.</p>';
                return;
            }

            displayRecipeDetails(recipe);
        } catch (error) {
            divRecipeDetails.innerHTML = `<p class="failure">Error: ${error.message}</p>`;
        }
    }

    fetchRecipeDetails();
});
