import Hero from "./Home/Hero";
import CategorySection from "./Home/CategorySection";
import FeaturedSection from "./Home/FeaturedSection";
import { AttractiveLocation, Business, Category } from "./lib/types";
import OurMission from "./Home/OurMission";
import DistrictSection from "./Home/DistricSection";
import OurPlace from "./Home/OurPlace";
import AttractiveLocations from "./Home/AttractiveLocations";

async function getData(): Promise<{ businesses: Business[]; categories: Category[]; attractive_locations: AttractiveLocation[] }> {
  const res = await fetch("http://localhost:3000/api", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Greška pri dohvaćanju podataka");
  }

  const data = await res.json();
  return {
    businesses: data.businesses,
    categories: data.categories,
    attractive_locations: data.attractive_locations
  };
}

export default async function HomePage() {
  const { businesses, categories, attractive_locations } = await getData();

  // prikazuj samo featured biznise
  const featured = businesses.filter((b) => b.featuredBusiness);

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
          <DistrictSection businesses={businesses} brandName="visit-bjelanica" />
        </section>
      </div>
      <OurPlace />
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-14 overflow-hidden">
        <AttractiveLocations attractive_locations={attractive_locations} />
      </section>
    </div>
  );
}
