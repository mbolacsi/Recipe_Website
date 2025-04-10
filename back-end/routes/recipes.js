let express = require('express');
let router = express.Router();
const db = require("./../db"); // Import your database utility

/**
 * GET /recipes
 * Get a list of all recipes
 * @return {Array} List of recipes
 */
router.get("/recipes", async function (req, res) {
    try {
        const listOfRecipes = await db.getAllRecipes(); // Function to fetch all recipes from DB
        console.log("listOfRecipes:", listOfRecipes);

        // Send the list of recipes as JSON
        res.json(listOfRecipes);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});

/**
 * GET /recipes/:id
 * Get a specific recipe by its ID
 * @param {number} id - The recipe's unique identifier
 * @return {Object} The recipe object
 */
router.get("/recipes/:id", async function (req, res) {
    try {
        const recipeId = req.params.id;
        const recipe = await db.getRecipeById(recipeId); // Fetch a specific recipe by ID

        if (recipe) {
            res.json(recipe); // Return the recipe as JSON
        } else {
            res.status(404).json({ "error": "Recipe not found" });
        }
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});

/**
 * POST /recipes
 * Add a new recipe
 * @param {Object} body - The recipe details (title, contributor, ingredients, etc.)
 * @return {Object} The added recipe
 */
router.post("/recipes", async function (req, res) {
    try {
        const { title, contributor, ingredients_and_instructions } = req.body;

        if (!title || !contributor || !ingredients_and_instructions) {
            return res.status(400).json({ "error": "Missing required fields" });
        }

        const newRecipe = {
            title,
            contributor,
            ingredients_and_instructions
        };

        const addedRecipe = await db.addRecipe(newRecipe); // Insert the recipe into the DB

        res.status(201).json(addedRecipe); // Return the added recipe with a 201 status
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});

/**
 * PUT /recipes/:id
 * Update an existing recipe
 * @param {number} id - The recipe's unique identifier
 * @param {Object} body - The updated recipe details
 * @return {Object} The updated recipe
 */
router.put("/recipes/:id", async function (req, res) {
    try {
        const recipeId = req.params.id;
        const { title, contributor, ingredients_and_instructions } = req.body;

        if (!title || !contributor || !ingredients_and_instructions) {
            return res.status(400).json({ "error": "Missing required fields" });
        }

        const updatedRecipe = {
            title,
            contributor,
            ingredients_and_instructions
        };

        const recipe = await db.updateRecipe(recipeId, updatedRecipe); // Update recipe in DB

        if (recipe) {
            res.json(recipe); // Return the updated recipe as JSON
        } else {
            res.status(404).json({ "error": "Recipe not found" });
        }
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});

/**
 * DELETE /recipes/:id
 * Delete a recipe by its ID
 * @param {number} id - The recipe's unique identifier
 * @return {Object} A confirmation message
 */
router.delete("/recipes/:id", async function (req, res) {
    try {
        const recipeId = req.params.id;
        const deletedRecipe = await db.deleteRecipe(recipeId); // Delete recipe from DB

        if (deletedRecipe) {
            res.json({ "message": "Recipe deleted successfully" });
        } else {
            res.status(404).json({ "error": "Recipe not found" });
        }
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});

module.exports = router;
