-- ============================================
-- EXPLORE SARAJEVO - FULL SPECIFICATION MIGRATION
-- ============================================
-- This migration adds missing fields to match the specification
-- Based on existing advanced schema structure
-- ============================================

-- ============================================
-- 1. ENHANCE SECTIONS TABLE
-- ============================================
-- Add missing fields to existing sections table
ALTER TABLE sections ADD COLUMN IF NOT EXISTS domain TEXT; -- For partner sites like visitbjelasnica.com
ALTER TABLE sections ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE sections ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_sections_slug ON sections(slug);
CREATE INDEX IF NOT EXISTS idx_sections_display_order ON sections(display_order);
CREATE INDEX IF NOT EXISTS idx_sections_is_active ON sections(is_active);

-- ============================================
-- 2. ADD CATEGORY_ID TO TYPES (Types are subcategories)
-- ============================================
ALTER TABLE types ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_types_category_id ON types(category_id);

-- ============================================
-- 3. ADD ADDITIONAL FIELDS TO BUSINESSES
-- ============================================
-- Additional useful fields
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS price_range TEXT; -- e.g., "$", "$$", "$$$"
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS social_media JSONB; -- {facebook, instagram, twitter, etc}

-- ============================================
-- 4. ADD ADDITIONAL FIELDS TO ATTRACTIONS
-- ============================================
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS price_info TEXT; -- e.g., "Free", "5 KM", "10-20 KM"
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS opening_hours TEXT;
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS website TEXT;

CREATE INDEX IF NOT EXISTS idx_attractions_display_order ON attractions(display_order);

-- ============================================
-- 5. ADD ADDITIONAL FIELDS TO EVENTS
-- ============================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS price_info TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS location TEXT; -- Physical location/venue
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_url TEXT;

CREATE INDEX IF NOT EXISTS idx_events_display_order ON events(display_order);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);

-- ============================================
-- 6. ADD DISPLAY ORDER & ICON TO CATEGORIES
-- ============================================
-- display_order and featured_category already exist, just add icon
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT; -- URL or icon identifier

-- ============================================
-- 7. ADD DISPLAY ORDER TO TYPES
-- ============================================
ALTER TABLE types ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_types_display_order ON types(display_order);

-- ============================================
-- 8. ENHANCE SUB_EVENTS TABLE
-- ============================================
ALTER TABLE sub_events ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE sub_events ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE sub_events ADD COLUMN IF NOT EXISTS price_info TEXT;

CREATE INDEX IF NOT EXISTS idx_sub_events_display_order ON sub_events(display_order);
CREATE INDEX IF NOT EXISTS idx_sub_events_start_date ON sub_events(start_date);

-- ============================================
-- 9. ADD UNIQUE CONSTRAINT TO SECTIONS SLUG & INSERT DEFAULT SECTIONS
-- ============================================
-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sections_slug_key'
    ) THEN
        ALTER TABLE sections ADD CONSTRAINT sections_slug_key UNIQUE (slug);
    END IF;
END $$;

-- Insert default sections only if they don't exist
INSERT INTO sections (name, slug, description, display_order, is_active, featured)
SELECT 'Explore Sarajevo', 'explore-sarajevo', 'Discover the heart of Sarajevo - attractions, businesses, and events across the city', 1, true, true
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug = 'explore-sarajevo');

INSERT INTO sections (name, slug, description, domain, display_order, is_active, featured)
SELECT 'Visit Bjelašnica', 'visit-bjelasnica', 'Explore Bjelašnica mountain - outdoor activities, accommodation, and dining', 'visitbjelasnica.com', 2, true, true
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE slug = 'visit-bjelasnica');

-- ============================================
-- 10. SET INITIAL DISPLAY ORDERS
-- ============================================
-- Set display_order based on current ID for existing records

-- Businesses (already has display_order)
UPDATE businesses SET display_order = id WHERE display_order = 0;

-- Attractions (just added display_order)
UPDATE attractions SET display_order = id WHERE display_order = 0;

-- Events (just added display_order)
UPDATE events SET display_order = id WHERE display_order = 0;

-- Categories (already has display_order)
UPDATE categories SET display_order = id WHERE display_order = 0;

-- Types (just added display_order)
UPDATE types SET display_order = id WHERE display_order = 0;

-- Sub events (just added display_order)
UPDATE sub_events SET display_order = id WHERE display_order = 0;

-- Sections (just added display_order)
UPDATE sections SET display_order = id WHERE display_order = 0;

-- ============================================
-- 11. CREATE HELPFUL VIEWS (OPTIONAL)
-- ============================================

-- View for all places with their sections
CREATE OR REPLACE VIEW places_with_sections AS
SELECT 
  'business' as place_type,
  b.id,
  b.name,
  b.slug,
  b.description,
  b.featured_business as featured,
  b.display_order,
  array_agg(DISTINCT s.slug) FILTER (WHERE s.slug IS NOT NULL) as section_slugs,
  array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as category_names
FROM businesses b
LEFT JOIN section_businesses sb ON b.id = sb.business_id
LEFT JOIN sections s ON sb.section_id = s.id
LEFT JOIN business_categories bc ON b.id = bc.business_id
LEFT JOIN categories c ON bc.category_id = c.id
GROUP BY b.id, b.name, b.slug, b.description, b.featured_business, b.display_order

UNION ALL

SELECT 
  'attraction' as place_type,
  a.id,
  a.name,
  a.slug,
  a.description,
  a.featured_location as featured,
  a.display_order,
  array_agg(DISTINCT s.slug) FILTER (WHERE s.slug IS NOT NULL) as section_slugs,
  array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as category_names
FROM attractions a
LEFT JOIN section_attractions sa ON a.id = sa.attraction_id
LEFT JOIN sections s ON sa.section_id = s.id
LEFT JOIN attraction_categories ac ON a.id = ac.attraction_id
LEFT JOIN categories c ON ac.category_id = c.id
GROUP BY a.id, a.name, a.slug, a.description, a.featured_location, a.display_order

UNION ALL

SELECT 
  'event' as place_type,
  e.id,
  e.name,
  e.slug,
  e.description,
  false as featured,
  e.display_order,
  array_agg(DISTINCT s.slug) FILTER (WHERE s.slug IS NOT NULL) as section_slugs,
  array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as category_names
FROM events e
LEFT JOIN section_events se ON e.id = se.event_id
LEFT JOIN sections s ON se.section_id = s.id
LEFT JOIN event_categories ec ON e.id = ec.event_id
LEFT JOIN categories c ON ec.category_id = c.id
GROUP BY e.id, e.name, e.slug, e.description, e.display_order;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Summary of changes:
-- ✅ Enhanced sections table (domain, display_order, is_active)
-- ✅ Linked types to categories (category_id)
-- ✅ Added display_order to attractions, events, types, sub_events
-- ✅ Added useful metadata fields (price_info, contact info, social media, etc)
-- ✅ Created indexes for performance
-- ✅ Created helpful view for unified place queries
-- ✅ Inserted 2 default sections
-- 
-- NOTE: Your schema already has advanced highlight/premium system in junction tables:
-- - section_businesses, section_attractions, section_events have is_highlight, is_premium
-- - business_categories, attraction_categories, event_categories have is_highlight, is_premium
-- This is actually BETTER than the spec - it allows context-specific highlights!
-- ============================================
