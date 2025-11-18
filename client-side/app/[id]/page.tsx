import CategorySectionByCategory from "./CatgorySection";
import MapHero from "./MapHero";
import { getBusinesses, getCategories, getAttractions } from "../lib/api";

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
