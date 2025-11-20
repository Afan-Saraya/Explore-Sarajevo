import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import CategoriesPage from '@/pages/categories/CategoriesPage';
import TypesPage from '@/pages/types/TypesPage';
import SectionsPage from '@/pages/sections/SectionsPage';
import BrandsPage from '@/pages/brands/BrandsPage';
import BusinessesPage from '@/pages/businesses/BusinessesPage';
import AttractionsPage from '@/pages/attractions/AttractionsPage';
import EventsPage from '@/pages/events/EventsPage';
import SubEventsPage from '@/pages/sub-events/SubEventsPage';
import HeroVideoPage from '@/pages/hero-video/HeroVideoPage';
import ChipsPage from '@/pages/chips/ChipsPage';
import HeroBannerPage from '@/pages/hero-banner/HeroBannerPage';
import BlocksPage from '@/pages/blocks/BlocksPage';
import UploadsPage from '@/pages/uploads/UploadsPage';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/types" element={<TypesPage />} />
                <Route path="/sections" element={<SectionsPage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/businesses" element={<BusinessesPage />} />
                <Route path="/attractions" element={<AttractionsPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/sub-events" element={<SubEventsPage />} />
                <Route path="/hero-video" element={<HeroVideoPage />} />
                <Route path="/chips" element={<ChipsPage />} />
                <Route path="/hero-banner" element={<HeroBannerPage />} />
                <Route path="/blocks" element={<BlocksPage />} />
                <Route path="/uploads" element={<UploadsPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
