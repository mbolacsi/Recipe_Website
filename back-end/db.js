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


// Function to fetch all recipes
function getAllRecipes() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, title, category, contributor, ingredients, instructions FROM recipes;`;
        let listOfRecipes = [];

        // Print table header for the recipes table
        printTableHeader(["id", "title", "category", "contributor", "ingredients", "instructions"]);

        db.each(sql, (err, row) => {
            if (err) {
                return reject(err);
            }

            const recipe = {
                id: row.id,
                title: row.title,
                category: row.category,
                contributor: row.contributor,
                ingredients: row.ingredients,
                instructions: row.instructions
            };

            // Log the row in a table-like format
            console.log(util.format("| %d | %s | %s | %s | %s | %s |", recipe.id, recipe.title, recipe.category, recipe.contributor, recipe.ingredients, recipe.instructions));

            listOfRecipes.push(recipe);
        }, () => {
            resolve(listOfRecipes);
        });
    });
}

function getRecipeWithId(id) {
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            const sql =
                `SELECT id, title, category, contributor, ingredients, instructions
                 FROM recipes
                 WHERE id = ?;`;

            function callbackAfterReturnedRowIsProcessed(err, row) {
                if (err) {
                    reject(err);
                    return;
                }

                if (!row) {
                    resolve(null);  // No recipe found with this id
                    return;
                }

                const recipe = {
                    id: row.id,
                    title: row.title,
                    category: row.category,
                    contributor: row.contributor,
                    ingredients: row.ingredients,
                    instructions: row.instructions
                };

                console.log("Fetched recipe:", recipe);
                resolve(recipe);
            }

            db.get(sql, [id], callbackAfterReturnedRowIsProcessed);
        });
    });
}

function printTableHeader(listOfColumnNames)
{
    let buffer = "| ";
    for (const columnName of listOfColumnNames)
    {
        buffer += columnName + " | ";
    }
    console.log(buffer);
    console.log("-".repeat(80));
}


// TODO: export the functions that will be used in other files
// these functions will be available from other files that import this module
module.exports = {
    getAllRecipes,
    getRecipeWithId,
};
