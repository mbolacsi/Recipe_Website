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

async function getAllRecipes() {
    const sql = `SELECT id, title, category, contributor, ingredients, instructions FROM recipes;`;
    return await runQueryEach(sql);
}

async function searchRecipesByTitle(searchTerm) {
    const sql = `
        SELECT id, title, category, contributor, ingredients, instructions
        FROM recipes
        WHERE title LIKE ?
        ORDER BY title;
    `;
    return await runQueryEach(sql, [`%${searchTerm}%`]);
}

async function getRecipesByCategory(category) {
    const sql = `
        SELECT id, title, category, contributor, ingredients, instructions
        FROM recipes
        WHERE category = ?
        ORDER BY title;
    `;
    return await runQueryEach(sql, [category]);
}

async function getAllCategoryNames() {
    const sql = `SELECT DISTINCT category FROM recipes ORDER BY category;`;
    const rows = await runQueryEach(sql);
    return rows.map(row => row.category);
}

// these functions will be available from other files that import this module
module.exports = {
    getAllRecipes,
    searchRecipesByTitle,
    getRecipesByCategory,
    getAllCategoryNames,
};
