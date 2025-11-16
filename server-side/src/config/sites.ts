export type SiteId = 'explore-sarajevo' | 'hotspot' | 'pametno-odabrano';

export interface SiteConfig {
  id: SiteId;
  name: string;
  description: string;
  features: string[];
}

export const sites: Record<SiteId, SiteConfig> = {
  'explore-sarajevo': {
    id: 'explore-sarajevo',
    name: 'Explore Sarajevo',
    description: 'Tourism and business directory for Sarajevo',
    features: [
      'brands',
      'businesses',
      'attractions',
      'events',
      'subevents',
      'categories',
      'types',
    ],
  },
  'hotspot': {
    id: 'hotspot',
    name: 'Hotspot',
    description: 'Interactive city guide and experiences',
    features: [
      'global',
      'hero-video',
      'chips',
      'hero-banner',
      'blocks',
      'footer',
      'editors-picks',
      'discovery',
      'quick-fun',
      'utilities',
      'sections',
    ],
  },
  'pametno-odabrano': {
    id: 'pametno-odabrano',
    name: 'Pametno Odabrano',
    description: 'Smart shopping guide and recommendations',
    features: [
      'featured',
      'smart-devices',
      'power-of-sound',
      'home-experiences',
      'control-fingertips',
      'capture-moment',
      'visual-elegance',
    ],
  },
};

export const getSiteById = (id: SiteId): SiteConfig => {
  return sites[id];
};

export const getAllSites = (): SiteConfig[] => {
  return Object.values(sites);
};
