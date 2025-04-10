console.log('sample.js is executing...');

//TODO: Add any functions that interact with the API and update the HTML by manipulating the DOM
document.addEventListener("DOMContentLoaded", () => {
    const recipeList = document.getElementById("recipe-list");

    fetch('/api/recipes') // Adjust to match your actual backend route
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                recipeList.innerHTML = "<p>No recipes found.</p>";
                return;
            }

            const list = document.createElement("ul");

            data.forEach(recipe => {
                const item = document.createElement("li");
                item.innerHTML = `<strong>${recipe.title}</strong><br>${recipe.description}`;
                list.appendChild(item);
            });

            recipeList.innerHTML = "<h2>All Recipes</h2>";
            recipeList.appendChild(list);
        })
        .catch(error => {
            recipeList.innerHTML = "<p>Error loading recipes.</p>";
            console.error("Error fetching recipes:", error);
        });
});
