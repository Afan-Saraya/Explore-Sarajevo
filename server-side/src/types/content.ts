export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Type {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_brand_id?: number;
  parent_brand_name?: string;
  brand_pdv?: string;
  business_id?: string;
  business_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Business {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  location?: string;
  telephone?: string;
  website?: string;
  rating?: number;
  working_hours?: string;
  featured_business?: boolean;
  brand_id?: number;
  brand_name?: string;
  media?: string[];
  categories?: Category[];
  types?: Type[];
  category_ids?: number[];
  type_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface Attraction {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  location?: string;
  featured_location?: boolean;
  categories?: Category[];
  types?: Type[];
  category_ids?: number[];
  type_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: number;
  name: string;
  slug: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: 'draft' | 'published' | 'archived';
  show_date_range?: boolean;
  categories?: Category[];
  types?: Type[];
  category_ids?: number[];
  type_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface SubEvent {
  id: number;
  event_id: number;
  event_name?: string;
  description: string;
  start_date?: string;
  end_date?: string;
  status: 'draft' | 'published';
  show_event?: boolean;
  categories?: Category[];
  types?: Type[];
  category_ids?: number[];
  type_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface UploadedFile {
  name: string;
  url: string;
  path: string;
}
