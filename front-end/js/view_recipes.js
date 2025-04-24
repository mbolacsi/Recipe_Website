console.log('view_recipes.js is executing...');

const div_list_of_recipes = document.getElementById("list_of_recipes");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const categorySelect = document.getElementById("category-select");
const recipeHeading = document.getElementById("recipe-heading");
const deleteModeButton = document.getElementById("delete-mode-button"); // The delete mode button

let allRecipes = [];
let isDeleteModeActive = false;
let selectedRecipeId = null;

// On page load
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    getAndDisplayAllRecipes();

    // Event listeners
    searchButton.addEventListener("click", filterRecipes);
    searchInput.addEventListener("keypress", e => {
        if (e.key === "Enter") filterRecipes();
    });
    categorySelect.addEventListener("change", filterRecipes);
    deleteModeButton.addEventListener("click", toggleDeleteMode); // Toggle delete mode
});

// Load all categories into dropdown
function loadCategories() {
    fetch("http://localhost:8080/categories")
        .then(res => res.json())
        .then(categories => {
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        })
        .catch(err => console.error("Error loading categories:", err));
}

// Fetch all recipes
async function getAndDisplayAllRecipes() {
    console.log("getAndDisplayAllRecipes - START");

    const API_URL = "http://localhost:8080/recipes";

    div_list_of_recipes.innerHTML = "Calling the API to get the list of recipes...";

    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            allRecipes = data;
            updateHeading();  // Set heading on first load
            displayRecipes(allRecipes);
        } else {
            div_list_of_recipes.innerHTML = '<p class="failure">ERROR: failed to retrieve the recipes.</p>';
        }
    } catch (error) {
        console.error(error);
        div_list_of_recipes.innerHTML = '<p class="failure">ERROR: failed to connect to the API to fetch the recipes data.</p>';
    }

    console.log("getAndDisplayAllRecipes - END");
}

// Filter recipes based on search/category
function filterRecipes() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categorySelect.value;

    let filtered = allRecipes;

    if (searchTerm) {
        filtered = filtered.filter(recipe =>
            recipe.title.toLowerCase().includes(searchTerm)
        );
    }

    if (selectedCategory) {
        filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    updateHeading(selectedCategory, searchTerm);
    displayRecipes(filtered);
}

function displayRecipes(recipes) {
    div_list_of_recipes.innerHTML = "";

    if (recipes.length === 0) {
        div_list_of_recipes.innerHTML = "<p>No recipes found.</p>";
        return;
    }

    const ul = document.createElement("ul");

    recipes.forEach(recipe => {
        const li = document.createElement("li");
        li.style.marginBottom = "1.5rem";
        li.setAttribute('data-id', recipe.id); // Store the recipe id in a data attribute

        const link = document.createElement("a");
        link.textContent = recipe.title;

        if (isDeleteModeActive) {
            li.classList.add('delete-selectable');
            li.addEventListener("click", (e) => {
                e.preventDefault();
                selectRecipeForDeletion(recipe.id);
            });
        } else {
            // In normal mode, allow the link to work
            link.href = `recipe_detail.html?id=${recipe.id}`;
        }

        li.appendChild(link);
        ul.appendChild(li);
    });

    div_list_of_recipes.appendChild(ul);
}

// Update heading text based on filters
function updateHeading(category = "", searchTerm = "") {
    if (searchTerm) {
        recipeHeading.textContent = `Search Results for "${searchTerm}"`;
    } else if (category) {
        recipeHeading.textContent = `${category}`;
    } else {
        recipeHeading.textContent = "All Recipes";
    }
}


function toggleDeleteMode() {
    isDeleteModeActive = !isDeleteModeActive;
    deleteModeButton.textContent = isDeleteModeActive ? "Cancel Delete Mode" : "Activate Delete Mode";
    displayRecipes(allRecipes);
}

function selectRecipeForDeletion(recipeId) {
    selectedRecipeId = recipeId;
    const selectedRecipe = document.querySelector(`[data-id="${recipeId}"]`);
    selectedRecipe.classList.toggle('selected-for-deletion');

    if (selectedRecipe.classList.contains('selected-for-deletion')) {
        // If selected, ask for confirmation to delete
        const confirmDelete = confirm("Are you sure you want to delete this recipe?");
        if (confirmDelete) {
            deleteRecipe(recipeId); // Proceed with delete action
        } else {
            selectedRecipe.classList.remove('selected-for-deletion');
        }
    } else {
        selectedRecipe.classList.remove('selected-for-deletion');
    }
}


async function deleteRecipe(recipeId) {
    const API_URL = `http://localhost:8080/recipes/${recipeId}`;

    fetch(API_URL, {
        method: "DELETE",
    })
        .then(response => {
            if (response.ok) {
                alert('Recipe deleted successfully!');
                isDeleteModeActive = false;
                deleteModeButton.textContent = "Activate Delete Mode";
                getAndDisplayAllRecipes();
            } else {
                alert('Failed to delete the recipe. Please try again.');
            }
        })
        .catch(error => {
            console.error("Error deleting recipe:", error);
            alert('Failed to delete the recipe. Please try again.');
        });
}
