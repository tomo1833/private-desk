-- Add product_name column to expenses table if it doesn't exist
-- This should be run manually with: sqlite3 data/database.sqlite < scripts/migrate-database.sql

-- First, check if the column exists by attempting to add it
-- SQLite will ignore the ALTER TABLE if the column already exists in newer versions
-- For older versions, you might get an error which can be ignored

ALTER TABLE expenses ADD COLUMN product_name TEXT;