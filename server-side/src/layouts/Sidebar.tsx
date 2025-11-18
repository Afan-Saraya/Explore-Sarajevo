import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderTree, 
  Tag, 
  Store, 
  Building2, 
  MapPin, 
  Calendar,
  CalendarDays,
  ChevronDown,
  Video,
  Sparkles,
  Image,
  Grid3x3,
  Star,
  Compass,
  Zap,
  Wrench,
  Smartphone,
  Volume2,
  Home,
  Hand,
  Camera,
  Monitor,
  LayoutGrid
} from 'lucide-react';

const sites = [
  { id: 'explore-sarajevo', name: 'Explore Sarajevo' },
  { id: 'hotspot', name: 'Hotspot' },
  { id: 'pametno-odabrano', name: 'Pametno Odabrano' },
];

const navigationBySite = {
  'explore-sarajevo': [
    { section: 'DASHBOARD', items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]},
    { section: 'CONTENT', items: [
      { name: 'Brands', href: '/brands', icon: Store },
      { name: 'Businesses', href: '/businesses', icon: Building2 },
      { name: 'Attractions', href: '/attractions', icon: MapPin },
      { name: 'Events', href: '/events', icon: Calendar },
      { name: 'Sub-events', href: '/sub-events', icon: CalendarDays },
    ]},
    { section: 'TAXONOMIES', items: [
      { name: 'Categories', href: '/categories', icon: FolderTree },
      { name: 'Types', href: '/types', icon: Tag },
    ]},
  ],
  'hotspot': [
    // TODO: Remove redirect once Hotspot pages are complete
    // Temporarily redirecting to external admin panel
    { section: 'DASHBOARD', items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]},
    { section: 'GLOBAL', items: [
      { name: 'Hero Video', href: '/hero-video', icon: Video },
      { name: 'Chips', href: '/chips', icon: Sparkles },
      { name: 'Hero Banner', href: '/hero-banner', icon: Image },
      { name: 'Blocks', href: '/blocks', icon: Grid3x3 },
      { name: 'Footer', href: '/footer', icon: LayoutGrid },
    ]},
    { section: 'SELECTIONS', items: [
      { name: 'Editors Picks', href: '/editors-picks', icon: Star },
      { name: 'Discovery', href: '/discovery', icon: Compass },
      { name: 'Quick Fun', href: '/quick-fun', icon: Zap },
      { name: 'Utilities', href: '/utilities', icon: Wrench },
    ]},
  ],
  'pametno-odabrano': [
    { section: 'DASHBOARD', items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]},
    { section: 'FEATURED', items: [
      { name: 'Smart Devices', href: '/smart-devices', icon: Smartphone },
      { name: 'Power of Sound', href: '/power-of-sound', icon: Volume2 },
      { name: 'Home full of experiences', href: '/home-experiences', icon: Home },
      { name: 'Control at your fingertips', href: '/control-fingertips', icon: Hand },
      { name: 'Capture every moment', href: '/capture-moment', icon: Camera },
      { name: 'Visual elegance', href: '/visual-elegance', icon: Monitor },
    ]},
  ],
};

export default function Sidebar() {
  const [currentSite, setCurrentSite] = useState(() => {
    const savedSite = localStorage.getItem('currentSite');
    return sites.find(site => site.id === savedSite) || sites[0];
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSiteChange = (site: typeof sites[0]) => {
    // TODO: Remove this redirect once Hotspot pages are complete
    if (site.id === 'hotspot') {
      window.location.href = 'https://hs.sarayasolutions.com/admin/';
      return;
    }
    
    setCurrentSite(site);
    localStorage.setItem('currentSite', site.id);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('site-changed'));
    setIsDropdownOpen(false);
  };

  const currentNavigation = navigationBySite[currentSite.id as keyof typeof navigationBySite];

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <div className="h-16 bg-gray-800 p-3">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <span className="font-semibold text-sm">{currentSite.name}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 w-58 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            {sites.map((site) => (
              <button
                key={site.id}
                onClick={() => handleSiteChange(site)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                  currentSite.id === site.id ? 'text-white bg-gray-700' : 'text-gray-300'
                }`}
              >
                {site.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {currentNavigation.map((section) => (
          <div key={section.section}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
