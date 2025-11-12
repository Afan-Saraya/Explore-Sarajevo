import { AttractiveLocation, Business, Category } from "../lib/types";
import CategorySectionByCategory from "./CatgorySection";
import MapHero from "./MapHero";

// app/[id]/page.tsx
interface CategoryPageProps {
  params: Promise<{ id: string }>; 
}

async function getData(): Promise<{ businesses: Business[]; categories: Category[]; attractive_locations: AttractiveLocation[] }> {
  const res = await fetch("https://mocki.io/v1/e84cbca4-1ede-47e6-8954-799d2371d6b1", {
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const { businesses, categories, attractive_locations } = await getData();

  // prikazuj samo featured biznise
  const featured = businesses.filter((b) => b.featuredBusiness);

  console.log("Server params:", id);

  return (
    <div className="bg-white">
      <MapHero businesses={businesses} categoryId={id} />
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-1 bg-white overflow-hidden">
      <CategorySectionByCategory businesses={businesses} categoryId={id} categories={categories} />
      </section>
    </div>
  );
}
