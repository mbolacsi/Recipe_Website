let express = require('express');
let router = express.Router();
const db = require("./../db");

router.use(express.json());

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
        const categories = await db.getAllCategoryNames();
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

/**
 * GET /recipes/:id
 * Get a single recipe by ID
 */
router.get("/recipe_detail/:id", async function (req, res) {
    try {
        const recipeId = req.params.id;

        const recipe = await db.getRecipeById(recipeId);

        if (recipe) {
            res.send(recipe);
        } else {
            res.status(404).json({ error: "Recipe not found" });
        }
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * POST /recipes
 * Add a new recipe.
 * Expects a JSON body with { title, category, contributor, ingredients, instructions }
 */
router.post("/recipes", async function (req, res) {
    try {
        const { title, category, contributor, ingredients, instructions } = req.body;
        console.log("Received recipe data:", req.body);

        // validation
        if (!title || !category || !contributor || !ingredients || !instructions) {
            return res
                .status(400)
                .json({ error: "Missing one or more required fields." });
        }

        const newId = await db.addRecipe({
            title,
            category,
            contributor,
            ingredients,
            instructions,
        });

        // 201 Created, return the new row’s ID
        res.status(201).json({ id: newId });
    } catch (err) {
        console.error("Error adding recipe:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * DELETE /recipes/:id
 * Delete a recipe by ID.
 */
router.delete("/recipes/:id", async function (req, res) {
    try {
        const recipeId = req.params.id;

        const wasDeleted = await db.deleteRecipeById(recipeId);

        if (wasDeleted) {
            res.status(200).json({ message: "Recipe deleted successfully" });
        } else {
            res.status(404).json({ error: "Recipe not found" });
        }
    } catch (err) {
        console.error("Error deleting recipe:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;