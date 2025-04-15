console.log('view_recipes.js is executing...');

const div_list_of_recipes = document.getElementById("list_of_recipes");

async function getAndDisplayAllRecipes() {
    console.log('getAndDisplayAllRecipes - START');

    const API_URL = "http://localhost:8080/recipes";  // Endpoint to get all recipes

    div_list_of_recipes.innerHTML = "Calling the API to get the list of recipes...";

    try {
        const response = await fetch(API_URL);
        console.log({ response });
        console.log(`response.status = ${response.status}`);
        console.log(`response.statusText = ${response.statusText}`);
        console.log(`response.ok = ${response.ok}`);

        if (response.ok) {
            div_list_of_recipes.innerHTML = "Retrieved the recipes successfully, now we just need to process them...";

            const listOfRecipesAsJSON = await response.json();
            console.log({ listOfRecipes: listOfRecipesAsJSON });

            displayRecipes(listOfRecipesAsJSON);
        } else {
            div_list_of_recipes.innerHTML = '<p class="failure">ERROR: failed to retrieve the recipes.</p>';
        }
    } catch (error) {
        console.error(error);
        div_list_of_recipes.innerHTML = '<p class="failure">ERROR: failed to connect to the API to fetch the recipes data.</p>';
    }

    console.log('getAndDisplayAllRecipes - END');
}

function displayRecipes(listOfRecipesAsJSON) {
    div_list_of_recipes.innerHTML = '';  // Clear any existing content

    if (listOfRecipesAsJSON.length === 0) {
        div_list_of_recipes.innerHTML = '<p>No recipes available.</p>';
        return;
    }

    const ul = document.createElement('ul');
    for (const recipe of listOfRecipesAsJSON) {
        console.log({ recipe });
        const li = document.createElement('li');
        li.innerHTML = `<a href="recipe-detail.html?id=${recipe.id}">${recipe.title}</a>`;
        ul.appendChild(li);
    }

    div_list_of_recipes.appendChild(ul);
}

// Call the function to fetch and display recipes on page load
getAndDisplayAllRecipes();
