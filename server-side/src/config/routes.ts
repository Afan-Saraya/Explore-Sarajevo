// Route constants
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',

  // Dashboard
  DASHBOARD: '/',

  // Explore Sarajevo
  BRANDS: '/brands',
  BUSINESSES: '/businesses',
  ATTRACTIONS: '/attractions',
  EVENTS: '/events',
  SUBEVENTS: '/subevents',
  CATEGORIES: '/categories',
  TYPES: '/types',

  // Hotspot
  HOTSPOT_GLOBAL: '/hotspot/global',
  HOTSPOT_HERO_VIDEO: '/hotspot/hero-video',
  HOTSPOT_CHIPS: '/hotspot/chips',
  HOTSPOT_HERO_BANNER: '/hotspot/hero-banner',
  HOTSPOT_BLOCKS: '/hotspot/blocks',
  HOTSPOT_FOOTER: '/hotspot/footer',
  HOTSPOT_EDITORS_PICKS: '/hotspot/editors-picks',
  HOTSPOT_DISCOVERY: '/hotspot/discovery',
  HOTSPOT_QUICK_FUN: '/hotspot/quick-fun',
  HOTSPOT_UTILITIES: '/hotspot/utilities',
  HOTSPOT_SECTIONS: '/hotspot/sections',

  // Pametno Odabrano
  PAMETNO_FEATURED: '/pametno/featured',
  PAMETNO_SMART_DEVICES: '/pametno/smart-devices',
  PAMETNO_POWER_OF_SOUND: '/pametno/power-of-sound',
  PAMETNO_HOME_EXPERIENCES: '/pametno/home-experiences',
  PAMETNO_CONTROL_FINGERTIPS: '/pametno/control-fingertips',
  PAMETNO_CAPTURE_MOMENT: '/pametno/capture-moment',
  PAMETNO_VISUAL_ELEGANCE: '/pametno/visual-elegance',

  // Uploads
  UPLOADS: '/uploads',
} as const;

// Helper functions
export const getRouteByFeature = (feature: string): string => {
  const routeMap: Record<string, string> = {
    brands: ROUTES.BRANDS,
    businesses: ROUTES.BUSINESSES,
    attractions: ROUTES.ATTRACTIONS,
    events: ROUTES.EVENTS,
    subevents: ROUTES.SUBEVENTS,
    categories: ROUTES.CATEGORIES,
    types: ROUTES.TYPES,
    global: ROUTES.HOTSPOT_GLOBAL,
    'hero-video': ROUTES.HOTSPOT_HERO_VIDEO,
    chips: ROUTES.HOTSPOT_CHIPS,
    'hero-banner': ROUTES.HOTSPOT_HERO_BANNER,
    blocks: ROUTES.HOTSPOT_BLOCKS,
    footer: ROUTES.HOTSPOT_FOOTER,
    'editors-picks': ROUTES.HOTSPOT_EDITORS_PICKS,
    discovery: ROUTES.HOTSPOT_DISCOVERY,
    'quick-fun': ROUTES.HOTSPOT_QUICK_FUN,
    utilities: ROUTES.HOTSPOT_UTILITIES,
    sections: ROUTES.HOTSPOT_SECTIONS,
    featured: ROUTES.PAMETNO_FEATURED,
    'smart-devices': ROUTES.PAMETNO_SMART_DEVICES,
    'power-of-sound': ROUTES.PAMETNO_POWER_OF_SOUND,
    'home-experiences': ROUTES.PAMETNO_HOME_EXPERIENCES,
    'control-fingertips': ROUTES.PAMETNO_CONTROL_FINGERTIPS,
    'capture-moment': ROUTES.PAMETNO_CAPTURE_MOMENT,
    'visual-elegance': ROUTES.PAMETNO_VISUAL_ELEGANCE,
  };

  return routeMap[feature] || ROUTES.DASHBOARD;
};
