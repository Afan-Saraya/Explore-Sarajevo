-- Add display_order column to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial display_order values based on id (existing order)
UPDATE businesses SET display_order = id WHERE display_order = 0;

-- Create index for sorting performance
CREATE INDEX IF NOT EXISTS idx_businesses_display_order ON businesses(display_order);
