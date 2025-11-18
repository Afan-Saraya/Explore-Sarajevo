import { useState, useEffect } from 'react';
import { businessesApi } from '@/api/businessesApi';
import { attractionsApi } from '@/api/attractionsApi';
import { eventsApi } from '@/api/eventsApi';
import { categoriesApi } from '@/api/categoriesApi';

// Get current site from localStorage
const getCurrentSite = () => {
  return localStorage.getItem('currentSite') || 'explore-sarajevo';
};

export default function DashboardPage() {
  const [currentSite, setCurrentSite] = useState(getCurrentSite());
  const [stats, setStats] = useState({
    businesses: 0,
    attractions: 0,
    events: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for site changes
    const handleStorageChange = () => {
      setCurrentSite(getCurrentSite());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('site-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('site-changed', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    loadStats();
  }, [currentSite]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      if (currentSite === 'explore-sarajevo') {
        const [businesses, attractions, events, categories] = await Promise.all([
          businessesApi.getAll(),
          attractionsApi.getAll(),
          eventsApi.getAll(),
          categoriesApi.getAll(),
        ]);

        setStats({
          businesses: businesses.length,
          attractions: attractions.length,
          events: events.length,
          categories: categories.length,
        });
      } else {
        // For other sites, set stats to 0 for now
        setStats({
          businesses: 0,
          attractions: 0,
          events: 0,
          categories: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderExploreSarajevoDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Businesses</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '...' : stats.businesses}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Attractions</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '...' : stats.attractions}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Events</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '...' : stats.events}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Categories</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '...' : stats.categories}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Explore Sarajevo CMS</h2>
        <p className="text-gray-600">
          Use the sidebar navigation to manage your content. You can create and edit categories, types, 
          brands, businesses, attractions, events, and upload media files.
        </p>
      </div>
    </>
  );

  const renderHotspotDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Hero Video</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '...' : '1'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Chips</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '...' : '0'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Blocks</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '...' : '0'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Hotspot CMS</h2>
        <p className="text-gray-600">
          Manage your Hotspot content including hero videos, chips, banners, blocks, and curated selections.
        </p>
      </div>
    </>
  );

  const renderPametnoOdabranoDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Smart Devices</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '...' : '0'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Audio Products</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '...' : '0'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Home Experiences</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '...' : '0'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Pametno Odabrano CMS</h2>
        <p className="text-gray-600">
          Manage featured products and experiences across all categories of smart technology.
        </p>
      </div>
    </>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {currentSite === 'explore-sarajevo' && 'Explore Sarajevo Dashboard'}
        {currentSite === 'hotspot' && 'Hotspot Dashboard'}
        {currentSite === 'pametno-odabrano' && 'Pametno Odabrano Dashboard'}
      </h1>
      
      {currentSite === 'explore-sarajevo' && renderExploreSarajevoDashboard()}
      {currentSite === 'hotspot' && renderHotspotDashboard()}
      {currentSite === 'pametno-odabrano' && renderPametnoOdabranoDashboard()}
    </div>
  );
}
