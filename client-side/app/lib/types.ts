// src/lib/types.ts

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  icon: any;
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  subcategories?: Subcategory[]; // podkategorije su sada dio svake glavne kategorije
}

export interface Business {
  subcategory: Subcategory | null; // bolje tipizirano
  id: string;
  name: string;
  slug: string;
  categoryId: string; // ID podkategorije
  parentCategoryId: string; // ID glavne kategorije
  brandId: string | null;
  description: string;
  address: string;
  location: string; // "lat,long"
  rating: number;
  workingHours: string;
  images: string[];
  phone?: string;
  website?: string;
  featuredBusiness?: boolean;
}

export interface AttractiveLocation {
  id: string;
  name: string;
  slug: string;
  categoryId: string; // tip atrakcije npr. history, nature, adventure
  description: string;
  address: string;
  location: string; // "lat,long"
  images: string[];
  featuredLocation?: boolean;
}

export interface ApiResponse {
  businesses: Business[];
  categories: Category[];
  attractiveLocations: AttractiveLocation[];
}

// Hotspot Blocks & Sets
export interface HotspotBlock {
  id: string; // unique per block
  image?: File | string; // File (new upload) or existing image URL
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface HotspotBlockSetStyles {
  blockBackground: string; // rgba(...)
  titleColor: string; // rgba(...)
  descriptionColor: string; // rgba(...)
  buttonBackground: string; // rgba(...)
  buttonTextColor: string; // rgba(...)
}

export interface HotspotBlockSet {
  id: string; // unique per set
  blocks: HotspotBlock[];
  styles: HotspotBlockSetStyles;
}

export interface HotspotPayload {
  sets: HotspotBlockSet[];
}
