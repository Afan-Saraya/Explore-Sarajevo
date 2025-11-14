-- Add missing columns to existing tables

-- Add missing columns to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS brand_id INTEGER;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Rename featured to featured_business in businesses
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='featured') THEN
        ALTER TABLE businesses RENAME COLUMN featured TO featured_business;
    END IF;
END $$;

-- Add brand_pdv to brands table (rename from pdv if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='brands' AND column_name='pdv') THEN
        ALTER TABLE brands RENAME COLUMN pdv TO brand_pdv;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='brands' AND column_name='brand_pdv') THEN
        ALTER TABLE brands ADD COLUMN brand_pdv TEXT;
    END IF;
END $$;

-- Rename featured to featured_location in attractions
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attractions' AND column_name='featured') THEN
        ALTER TABLE attractions RENAME COLUMN featured TO featured_location;
    END IF;
END $$;

-- Add date columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS date_range TSRANGE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='subevents')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='sub_events') THEN
        ALTER TABLE subevents RENAME TO sub_events;
    END IF;
END $$;

-- Add date columns to sub_events table
ALTER TABLE sub_events ADD COLUMN IF NOT EXISTS date_range TSRANGE;
ALTER TABLE sub_events ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE sub_events ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Add updated_at columns to tables if missing
ALTER TABLE brands ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE types ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE sub_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create missing join tables
CREATE TABLE IF NOT EXISTS business_types (
  business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
  type_id INTEGER REFERENCES types(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, type_id)
);

CREATE TABLE IF NOT EXISTS attraction_types (
  attraction_id INTEGER REFERENCES attractions(id) ON DELETE CASCADE,
  type_id INTEGER REFERENCES types(id) ON DELETE CASCADE,
  PRIMARY KEY (attraction_id, type_id)
);

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='subevent_categories')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='sub_event_categories') THEN
        ALTER TABLE subevent_categories RENAME TO sub_event_categories;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='subevent_types')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='sub_event_types') THEN
        ALTER TABLE subevent_types RENAME TO sub_event_types;
    END IF;
END $$;

-- Fix foreign keys in sub_event tables
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sub_event_categories' AND column_name='subevent_id') THEN
        ALTER TABLE sub_event_categories RENAME COLUMN subevent_id TO sub_event_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sub_event_types' AND column_name='subevent_id') THEN
        ALTER TABLE sub_event_types RENAME COLUMN subevent_id TO sub_event_id;
    END IF;
END $$;

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
