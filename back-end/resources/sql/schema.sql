DROP TABLE IF EXISTS recipes;

-- Create the recipes table
CREATE TABLE recipes
(
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    title          VARCHAR(100) NOT NULL,
    contributor    VARCHAR(100) NOT NULL,
    ingredients    TEXT NOT NULL,
    instructions   TEXT NOT NULL
);