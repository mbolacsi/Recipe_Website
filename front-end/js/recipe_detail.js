document.addEventListener('DOMContentLoaded', async function() {
    const recipeId = new URLSearchParams(window.location.search).get('id');
    const divRecipeDetails = document.getElementById('recipe-details');

    if (!recipeId) {
        divRecipeDetails.innerHTML = '<p>Error: No recipe ID provided.</p>';
        return;
    }

    const API_URL = `http://localhost:8080/recipes/${recipeId}`;  // Endpoint to get a single recipe

    try {
        const response = await fetch(API_URL);
        console.log({ response });
        console.log(`response.status = ${response.status}`);
        console.log(`response.statusText = ${response.statusText}`);
        console.log(`response.ok = ${response.ok}`);

        if (response.ok) {
            const recipe = await response.json();
            console.log({ recipe });

            // Display recipe details
            displayRecipeDetails(recipe);
        } else {
            divRecipeDetails.innerHTML = '<p class="failure">ERROR: Failed to fetch recipe details.</p>';
        }
    } catch (error) {
        console.error(error);
        divRecipeDetails.innerHTML = '<p class="failure">ERROR: Failed to connect to the API to fetch the recipe details.</p>';
    }
});

function displayRecipeDetails(recipe) {
    const divRecipeDetails = document.getElementById('recipe-details');

    divRecipeDetails.innerHTML = `
        <h2>${recipe.title}</h2>
        <p><strong>Ingredients:</strong></p>
        <ul>
            ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
        <p><strong>Instructions:</strong></p>
        <p>${recipe.instructions}</p>
        <p><strong>Preparation Time:</strong> ${recipe.prepTime} minutes</p>
    `;
}
