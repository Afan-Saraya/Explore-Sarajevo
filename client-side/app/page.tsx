import Hero from "./Home/Hero";
import CategorySection from "./Home/CategorySection";
import FeaturedSection from "./Home/FeaturedSection";
import OurMission from "./Home/OurMission";
import DistrictSection from "./Home/DistricSection";
import OurPlace from "./Home/OurPlace";
import AttractiveLocations from "./Home/AttractiveLocations";
import MapSectionClient from "./Home/MapSectionClient";
import { getBusinesses, getCategories, getAttractions } from "./lib/api";

export default async function HomePage() {
  // Fetch data from Express backend API
  const [businesses, categories, attractive_locations] = await Promise.all([
    getBusinesses(),
    getCategories(),
    getAttractions()
  ]);

  // prikazuj samo featured biznise
  const featured = businesses.filter((b: { featuredBusiness: any; }) => b.featuredBusiness);

  return (
    <div className="bg-white">
      <Hero />
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-14 bg-white overflow-hidden">
        <CategorySection categories={categories} />
        <FeaturedSection businesses={businesses} />
      </section>
      <OurMission />
      <div style={{ backgroundImage: 'url("/assets/visitBjelasnica.jpg")' }}>
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-14 overflow-hidden">
          <DistrictSection businesses={businesses} brandName="visit-bjelasnica" />
        </section>
      </div>
      <OurPlace />
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-2 overflow-hidden">
        <AttractiveLocations attractive_locations={attractive_locations} />
        <MapSectionClient businesses={businesses} />
      </section>
    </div>
  );
}
