// API client for fetching data from Express backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetch all businesses with categories, types, and brands
 */
export async function getBusinesses() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/businesses`, {
      next: { revalidate: 60 }, // Cache for 60 seconds (ISR)
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch businesses: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
}

/**
 * Fetch all categories with subcategories (types)
 */
export async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/categories`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch categories: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch all attractions with categories
 */
export async function getAttractions() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/attractions`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch attractions: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching attractions:', error);
    return [];
  }
}

/**
 * Fetch active events with subevents
 */
export async function getEvents() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/events`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch events: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

/**
 * Fetch all brands
 */
export async function getBrands() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/brands`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch brands: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

/**
 * Fetch all types (subcategories)
 */
export async function getTypes() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/types`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch types: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching types:', error);
    return [];
  }
}

/**
 * Fetch subevents for a specific event or all subevents
 */
export async function getSubevents(eventId?: string) {
  try {
    const url = eventId 
      ? `${API_BASE_URL}/api/public/subevents?event_id=${eventId}`
      : `${API_BASE_URL}/api/public/subevents`;
      
    const res = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch subevents: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching subevents:', error);
    return [];
  }
}
