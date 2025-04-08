-- Execute all SQL statements, in sequential order, from the top of this file
-- to create the tables or to "reset" the database to the expected structure


-- TODO: add your tables structure

DROP TABLE IF EXISTS recipes;

CREATE TABLE recipes
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title         VARCHAR(255),
    contributor   VARCHAR(255),
    category      VARCHAR(255),
    instructions  VARCHAR(255)

);
