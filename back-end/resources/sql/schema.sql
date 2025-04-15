-- Execute all SQL statements, in sequential order, from the top of this file
-- to create the tables or to "reset" the database to the expected structure

DROP TABLE IF EXISTS recipes;

-- Create the recipes table
DROP TABLE IF EXISTS recipes;
CREATE TABLE recipes
(
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    title          VARCHAR(100) NOT NULL,
    category       varchar(50) Not NULL,
    contributor    VARCHAR(100) NOT NULL,
    ingredients    TEXT NOT NULL,
    instructions   TEXT NOT NULL
);
