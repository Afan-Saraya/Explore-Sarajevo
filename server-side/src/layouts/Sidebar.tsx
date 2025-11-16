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
  Upload,
  ChevronDown
} from 'lucide-react';

const sites = [
  { id: 'explore-sarajevo', name: 'Explore Sarajevo' },
  { id: 'hotspot', name: 'Hotspot' },
  { id: 'pametno-odabrano', name: 'Pametno Odabrano' },
];

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Types', href: '/types', icon: Tag },
  { name: 'Brands', href: '/brands', icon: Store },
  { name: 'Businesses', href: '/businesses', icon: Building2 },
  { name: 'Attractions', href: '/attractions', icon: MapPin },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Uploads', href: '/uploads', icon: Upload },
];

export default function Sidebar() {
  const [currentSite, setCurrentSite] = useState(sites[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                onClick={() => {
                  setCurrentSite(site);
                  setIsDropdownOpen(false);
                }}
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
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
