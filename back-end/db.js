const util = require("util");
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();

// TODO: create a SQLite data source in IntelliJ with the name: "./back-end/cs208_project.sqlite"

// Do not change this name. The 'cs208_project.sqlite' will be created in the same folder as db.js
const SQLITE_FILE_NAME = "cs208_project.sqlite";


let db;

// If the run environment is 'test', we create an ephemeral (in memory) SQLite database that will
//   - create tables using the structure defined in the schema file: './resources/sql/schema.sql'
//   - populate the tables with data from the seeds file: './resources/sql/seeds.sql'
// Once the tests complete (i.e., finish running), this in memory SQLite database will be deleted automatically
//
// However, if the environment is not 'test' (e.g., the environment is 'development') then the application will use
// the SQLite database specified in the SQLITE_FILE_NAME
if (process.env.NODE_ENV === "test")
{
    console.log("Creating an in memory SQLite database for running the test suite...");

    const contentOfSchemaSQLFile = fs.readFileSync("./resources/sql/schema.sql", "utf8");
    const contentOfSeedsSQLFile = fs.readFileSync("./resources/sql/seeds.sql", "utf8");

    // Creates a connection to an in-memory SQLite database
    db = new sqlite3.Database(":memory:", function(err)
    {
        if (err)
        {
            return console.error(err.message);
        }

        // Enable enforcement of foreign keys constraints in the SQLite database every time we run the tests
        db.get("PRAGMA foreign_keys = ON;");

        console.log(`Connected to the ':memory:' SQLite database.`);
        console.log("Creating the tables from the 'schema.sql' file...");
        console.log("Populating them with data from the 'seeds.sql' file...");
        db.serialize(function()
        {
            // the serialize method ensures that the SQL queries from the exec calls are executed sequentially
            // (i.e., one after the other instead of being executed in parallel)
            db.exec(contentOfSchemaSQLFile);
            db.exec(contentOfSeedsSQLFile);
        });
    });
}
else
{
    // This is the default environment (e.g., 'development')

    // Create a connection to the SQLite database file specified in SQLITE_FILE_NAME
    db = new sqlite3.Database("./" + SQLITE_FILE_NAME, function(err)
    {
        if (err)
        {
            return console.error(err.message);
        }

        // Enable enforcement of foreign keys constraints in the SQLite database every time we start the application
        db.get("PRAGMA foreign_keys = ON;");

        console.log(`Connected to the '${SQLITE_FILE_NAME}' SQLite database for development.`);
    });
}

/**
 * Executes a SQLite query using `db.each`, collecting all rows into an array.
 * This function is useful for SELECT queries that return multiple rows.
 * It wraps the `db.each` method in a Promise, making it easier to use with async/await.
 *
 * @example
 * const rows = await runQueryEach("SELECT * FROM recipes WHERE category = ?", ["Dessert"]);
 */
function runQueryEach(sql, params = []) {
    return new Promise((resolve, reject) => {
        const results = [];
        db.each(sql, params, (err, row) => {
            if (err) return reject(err);
            results.push(row);
        }, () => resolve(results));
    });
}

/**
 * Retrieves all recipes from the database.
 * This function selects all columns from the 'recipes' table.
 *
 * @returns {Promise<Array>} A Promise that resolves with an array of all recipes.
 */
async function getAllRecipes() {
    const sql = `SELECT id, title, category, contributor, ingredients, instructions FROM recipes;`;
    return await runQueryEach(sql);
}

/**
 * Retrieves a recipe by its ID from the database.
 * This function selects a recipe based on the provided ID.
 *
 * @param {number} id - The ID of the recipe to be retrieved.
 * @returns {Promise<Object|null>} A Promise that resolves with the recipe object, or null if not found.
 */
async function getRecipeById(id) {
    const sql = `
        SELECT id, title, category, contributor, ingredients, instructions
        FROM recipes
        WHERE id = ?;
    `;
    const results = await runQueryEach(sql, [id]);
    return results[0]; // Return single recipe or undefined
}

/**
 * Searches for recipes by their title.
 * This function allows for a partial search, returning recipes whose title contains the search term.
 *
 * @param {string} searchTerm - The term to search for in the recipe title.
 * @returns {Promise<Array>} A Promise that resolves with an array of matching recipes.
 */
async function searchRecipesByTitle(searchTerm) {
    const sql = `
        SELECT id, title, category, contributor, ingredients, instructions
        FROM recipes
        WHERE title LIKE ?
        ORDER BY title;
    `;
    return await runQueryEach(sql, [`%${searchTerm}%`]);
}

/**
 * Retrieves all recipes from a specific category.
 * This function selects recipes based on the provided category name.
 *
 * @param {string} category - The category of recipes to be retrieved.
 * @returns {Promise<Array>} A Promise that resolves with an array of recipes in the specified category.
 */
async function getRecipesByCategory(category) {
    const sql = `
        SELECT id, title, category, contributor, ingredients, instructions
        FROM recipes
        WHERE category = ?
        ORDER BY title;
    `;
    return await runQueryEach(sql, [category]);
}

/**
 * Retrieves the distinct categories of recipes.
 * This function returns a list of all unique recipe categories, ordered alphabetically.
 *
 * @returns {Promise<Array>} A Promise that resolves with an array of category names.
 */
async function getAllCategoryNames() {
    const sql = `SELECT DISTINCT category FROM recipes ORDER BY category;`;
    const rows = await runQueryEach(sql);
    return rows.map(row => row.category);
}

/**
 * Adds a new recipe to the database.
 * This function inserts a new recipe into the 'recipes' table.
 *
 * @param {Object} recipe - The recipe to be added.
 * @param {string} recipe.title - The title of the recipe.
 * @param {string} recipe.category - The category of the recipe.
 * @param {string} recipe.contributor - The contributor of the recipe.
 * @param {string} recipe.ingredients - The ingredients of the recipe.
 * @param {string} recipe.instructions - The instructions for the recipe.
 * @returns {Promise<number>} A Promise that resolves with the ID of the newly inserted recipe.
 */
async function addRecipe(recipe) {
    const sql = `
        INSERT INTO recipes (title, category, contributor, ingredients, instructions)
        VALUES (?, ?, ?, ?, ?);
    `;

    return new Promise((resolve, reject) => {
        db.run(sql, [recipe.title, recipe.category, recipe.contributor, recipe.ingredients, recipe.instructions], function(err) {
            if (err) return reject(err);
            resolve(this.lastID); // return the ID of the inserted row
        });
    });
}


/**
 * Deletes a recipe by its ID.
 * This function removes the recipe from the 'recipes' table based on the provided ID.
 *
 * @param {number} id - The ID of the recipe to be deleted.
 * @returns {Promise<boolean>} A Promise that resolves with true if a row was deleted, false otherwise.
 */
async function deleteRecipeById(id) {
    const sql = `DELETE FROM recipes WHERE id = ?;`;

    return new Promise((resolve, reject) => {
        db.run(sql, [id], function(err) {
            if (err) return reject(err);
            resolve(this.changes > 0); // returns true if a row was deleted, false otherwise
        });
    });
}

// these functions will be available from other files that import this module
module.exports = {
    getAllRecipes,
    getRecipeById,
    searchRecipesByTitle,
    getRecipesByCategory,
    getAllCategoryNames,
    addRecipe,
    deleteRecipeById,
};
