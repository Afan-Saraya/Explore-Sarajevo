import CatgorySection from "./CatgorySection";
import Map from "./Map";
import { getBusinesses, getCategories, getAttractions } from "../../lib/api";
import Hero from "./Hero";
import FilteredBusinesses from "./FilteredBusinesses";

// app/[id]/page.tsx
interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;

  // Fetch data from Express backend API
  const [businesses, categories, attractive_locations] = await Promise.all([
    getBusinesses(),
    getCategories(),
    getAttractions()
  ]);

  console.log("Server params:", id, businesses);

  return (
    <div className="bg-white">
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-1 bg-white overflow-hidden">
        <Hero categories={categories} categoryId={id} businesses={businesses} />
        <Map businesses={businesses} categoryId={id} categories={categories} />
        <CatgorySection businesses={businesses} categoryId={id} categories={categories} />
        <FilteredBusinesses businesses={businesses} categoryId={id} categories={categories} />
      </section>
    </div>
  );
}
