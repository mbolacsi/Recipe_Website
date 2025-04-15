let express = require('express');
let router = express.Router();
const db = require("./../db");

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
