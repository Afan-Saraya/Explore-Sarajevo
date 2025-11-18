-- Add featured_category column to categories table
ALTER TABLE categories ADD COLUMN featured_category BOOLEAN DEFAULT false;

-- Create index for featured categories
CREATE INDEX idx_categories_featured ON categories(featured_category);
