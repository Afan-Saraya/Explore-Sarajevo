// src/lib/types.ts

export interface Business {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
}

export interface ApiResponse {
  businesses: Business[];
  categories: Category[];
}
