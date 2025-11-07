import Hero from "./Home/Hero";
import CategorySection from "./Home/CategorySection";
import FeaturedSection from "./Home/FeaturedSection";
import { Business, Category } from "./lib/types";

async function getData(): Promise<{ businesses: Business[]; categories: Category[] }> {
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
  };
}

export default async function HomePage() {
  const { businesses, categories } = await getData();

  // prikazuj samo featured biznise
  const featured = businesses.filter((b) => b.featuredBusiness);

  return (
    <div className="bg-white">
      <Hero />
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-4 bg-white overflow-hidden">
        <CategorySection categories={categories} />
        <FeaturedSection businesses={businesses} />
      </section>
    </div>
  );
}
