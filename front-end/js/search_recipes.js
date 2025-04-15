document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const categorySelect = document.getElementById('category-select');
    const searchResults = document.getElementById('search-results');

    // Load categories when the page loads
    loadCategories();

    // Add event listeners
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    categorySelect.addEventListener('change', function() {
        if (this.value) {
            searchByCategory(this.value);
        } else if (searchInput.value) {
            // If there's text in the search box, perform that search
            performSearch();
        } else {
            // Clear results if no category selected and no search text
            clearResults();
            displayMessage('Please enter a search term or select a category.');
        }
    });

    // Function to load all categories
    function loadCategories() {
        fetch('http://localhost:8080/categories')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(categories => {
                // Clear existing options except the first one
                while (categorySelect.options.length > 1) {
                    categorySelect.remove(1);
                }

                // Add new options
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading categories:', error);
            });
    }

    // Function to perform search
    function performSearch() {
        const searchTerm = searchInput.value.trim();

        if (!searchTerm) {
            clearResults();
            displayMessage('Please enter a search term.');
            return;
        }

        // Reset category select
        categorySelect.value = '';

        fetch(`http://localhost:8080/search?q=${encodeURIComponent(searchTerm)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(recipes => {
                displayResults(recipes, `Search results for "${searchTerm}"`);
            })
            .catch(error => {
                console.error('Error searching recipes:', error);
                displayMessage('Error searching recipes. Please try again later.');
            });
    }

    // Function to search by category
    function searchByCategory(category) {
        fetch(`http://localhost:8080/category/${encodeURIComponent(category)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(recipes => {
                displayResults(recipes, `Recipes in category "${category}"`);
            })
            .catch(error => {
                console.error('Error fetching category recipes:', error);
                displayMessage('Error fetching recipes. Please try again later.');
            });
    }

    // Function to display results
    function displayResults(recipes, headerText) {
        clearResults();

        if (recipes.length === 0) {
            displayMessage('No recipes found.');
            return;
        }

        const header = document.createElement('h2');
        header.textContent = headerText;
        header.style.gridColumn = '1 / -1';
        searchResults.appendChild(header);

        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';

            recipeCard.innerHTML = `
                <h3>${recipe.title}</h3>
                <p><strong>Category:</strong> ${recipe.category}</p>
                <p><strong>Contributor:</strong> ${recipe.contributor}</p>
                <a href="recipe_detail.html?id=${recipe.id}" class="view-recipe">View Recipe</a>
            `;

            searchResults.appendChild(recipeCard);
        });
    }

    // Function to clear results
    function clearResults() {
        searchResults.innerHTML = '';
    }

    // Function to display a message
    function displayMessage(message) {
        const messageElement = document.createElement('p');
        messageElement.className = message.includes('No recipes') ? 'no-results' : 'initial-message';
        messageElement.textContent = message;
        searchResults.appendChild(messageElement);
    }
});