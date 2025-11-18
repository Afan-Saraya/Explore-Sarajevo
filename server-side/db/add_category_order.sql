-- Add display_order column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial display_order values based on id (existing order)
UPDATE categories SET display_order = id WHERE display_order = 0;

-- Create index for sorting performance
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
