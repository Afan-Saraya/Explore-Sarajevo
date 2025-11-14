-- Create tables based on provided spreadsheet
-- Run with: node db/migrate.js

-- Content table (for CMS items)
CREATE TABLE IF NOT EXISTS content (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  address TEXT,
  location TEXT,
  category_id INTEGER,
  parent_category_id INTEGER,
  brand_id INTEGER,
  phone TEXT,
  website TEXT,
  rating NUMERIC,
  working_hours TEXT,
  featured_business BOOLEAN DEFAULT FALSE,
  featured_location BOOLEAN DEFAULT FALSE,
  images JSONB DEFAULT '[]'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Businesses
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  address TEXT,
  location TEXT,
  rating NUMERIC,
  working_hours TEXT,
  media JSONB,
  telephone TEXT,
  website TEXT,
  description TEXT,
  brand_id INTEGER,
  featured_business BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  media JSONB,
  business_id TEXT,
  parent_brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
  brand_pdv TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Types
CREATE TABLE IF NOT EXISTS types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Attractions
CREATE TABLE IF NOT EXISTS attractions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  media JSONB,
  address TEXT,
  location TEXT,
  featured_location BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  media JSONB,
  date_range TSRANGE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  show_date_range BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sub-events
CREATE TABLE IF NOT EXISTS sub_events (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  name TEXT,
  slug TEXT,
  description TEXT,
  media JSONB,
  date_range TSRANGE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  show_event BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Many-to-many join tables
CREATE TABLE IF NOT EXISTS business_categories (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, category_id)
);

CREATE TABLE IF NOT EXISTS business_types (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  type_id INTEGER REFERENCES types(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, type_id)
);

CREATE TABLE IF NOT EXISTS category_types (
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  type_id INTEGER REFERENCES types(id) ON DELETE CASCADE,
  PRIMARY KEY (category_id, type_id)
);

CREATE TABLE IF NOT EXISTS attraction_categories (
  attraction_id INTEGER REFERENCES attractions(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (attraction_id, category_id)
);

CREATE TABLE IF NOT EXISTS attraction_types (
  attraction_id INTEGER REFERENCES attractions(id) ON DELETE CASCADE,
  type_id INTEGER REFERENCES types(id) ON DELETE CASCADE,
  PRIMARY KEY (attraction_id, type_id)
);

CREATE TABLE IF NOT EXISTS event_categories (
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, category_id)
);

CREATE TABLE IF NOT EXISTS event_types (
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  type_id INTEGER REFERENCES types(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, type_id)
);

CREATE TABLE IF NOT EXISTS sub_event_categories (
  sub_event_id INTEGER REFERENCES sub_events(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (sub_event_id, category_id)
);

CREATE TABLE IF NOT EXISTS sub_event_types (
  sub_event_id INTEGER REFERENCES sub_events(id) ON DELETE CASCADE,
  type_id INTEGER REFERENCES types(id) ON DELETE CASCADE,
  PRIMARY KEY (sub_event_id, type_id)
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_business_slug ON businesses (slug);
CREATE INDEX IF NOT EXISTS idx_brand_slug ON brands (slug);
CREATE INDEX IF NOT EXISTS idx_category_slug ON categories (slug);
CREATE INDEX IF NOT EXISTS idx_type_slug ON types (slug);
CREATE INDEX IF NOT EXISTS idx_attraction_slug ON attractions (slug);
CREATE INDEX IF NOT EXISTS idx_event_slug ON events (slug);
