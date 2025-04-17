let express = require('express');
let router = express.Router();
const db = require("./../db");


/**
 * http://localhost:8080/recipes
 * GET /samples
 *
 * @return a list of samples (extracted from the samples table in the database) as JSON
 */
router.get("/recipes", async function (req, res)
{
    try
    {
        const listOfRecipes = await db.getAllRecipes();
        console.log("listOfSamples:", listOfRecipes);

        // this automatically converts the array of samples to JSON and returns it to the client
        res.send(listOfRecipes);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});

/**
 * GET /recipes/:id
 * http://localhost:8080/recipes/id
 * Returns a single recipe by ID
 */
router.get("/recipes/:id", async function (req, res) {
    try {
        const id = req.params.id;
        console.log("id = " + id);

        const recipe_id = await db.getRecipeWithId(id);
        console.log("recipeID:", recipe_id);

        if (recipe_id == null) {
            console.log("No recipe with id " + id + " exists.");

            // return 404 status code (i.e., error that the recipe was not found)
            res.status(404).json({"error": "recipe with id " + id + " not found"});
            return;
        }

        // this automatically converts the student object to JSON and returns it to the client
        res.send(recipe_id);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({"error": "Internal Server Error"});
    }
});


/**
 * GET /search?q=searchterm
 * Search recipes by title
 */
router.get("/search", async function (req, res) {
    try {
        const searchTerm = req.query.q || '';

        const recipes = await db.searchRecipesByTitle(searchTerm);
        console.log(`Found ${recipes.length} recipes matching: ${searchTerm}`);

        res.send(recipes);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({"error": "Internal Server Error"});
    }
});

/**
 * GET /categories
 * Get all unique categories
 */
router.get("/categories", async function (req, res) {
    try {
        const categories = await db.getAllCategories();
        console.log(`Found ${categories.length} categories`);

        res.send(categories);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({"error": "Internal Server Error"});
    }
});

/**
 * GET /category/:categoryName
 * Get recipes by category
 */
router.get("/category/:categoryName", async function (req, res) {
    try {
        const categoryName = req.params.categoryName;

        const recipes = await db.getRecipesByCategory(categoryName);
        console.log(`Found ${recipes.length} recipes in category: ${categoryName}`);

        res.send(recipes);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({"error": "Internal Server Error"});
    }
});

module.exports = router;