import { getBusinesses, getCategories, getAttractions } from "../lib/api";
import BusinessDetails from "./BusinessDetails";
import Hero from "./Hero";
import BusinessMap from "./Map";
import SimilarBusinesses from "./SimilarBusinesses";

interface BussinesPageProps {
  params: Promise<{ id: string }>;
}

export default async function BussinesPage({ params }: BussinesPageProps) {
  const { id } = await params;

  // Fetch data from Express backend API
  const [businesses, categories, attractive_locations] = await Promise.all([
    getBusinesses(),
    getCategories(),
    getAttractions()
  ]);

  console.log("Server params:", id, businesses);

  return (
    <div className="bg-white mt-13">
      <Hero categoryId={id} businesses={businesses} />
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-1 bg-white overflow-hidden">
        <BusinessDetails id={id} businesses={businesses} />
        <BusinessMap id={id} businesses={businesses} />
        <SimilarBusinesses id={id} businesses={businesses} />
      </section>
    </div>
  );
}
