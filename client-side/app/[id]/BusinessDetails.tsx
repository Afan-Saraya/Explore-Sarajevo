"use client";

import Image from "next/image";
import { Business } from "../lib/types";
import { MapPin, Clock, Globe, Phone, Star } from "lucide-react";

interface Props {
  id: string;               // slug iz URL-a
  businesses: Business[];   // lista svih biznisa
}

export default function BusinessDetails({ id, businesses }: Props) {
  // Pronađi biznis po slug-u
  const business = businesses.find((b) => b.slug === id);

  if (!business) {
    return (
      <div className="text-center py-10 text-gray-600">
        Business not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">

      {/* MAIN CONTENT */}
      <div className="md:col-span-2 space-y-10">

        {/* ABOUT */}
        <section>
          <h2 className="text-2xl text-black font-bold mb-3">📝 About</h2>
          <p className="text-gray-700 leading-relaxed">
            {business.description || "No description available."}
          </p>
        </section>

        {/* CATEGORIES */}
        <section>
          <h2 className="text-2xl text-black font-bold mb-3">🏷️ Categories & Types</h2>
          <div className="flex flex-wrap gap-3">
            {business.categories?.map((cat, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {typeof cat === "string" ? cat : cat.name}
              </span>
            ))}

            {business.types?.map((type, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {type}
              </span>
            ))}
          </div>
        </section>

        {/* MORE IMAGES */}
        {business.images && business.images.length > 1 && (
          <section>
            <h2 className="text-2xl font-bold mb-3">📷 More Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {business.images.slice(1).map((img, i) => (
                <div key={i} className="relative h-40 rounded-xl overflow-hidden">
                  <Image
                    src={img}
                    alt={`${business.name}-image-${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* SIDEBAR */}
      <aside className="space-y-6">

        {/* QUICK INFO CARD */}
        <div className="p-6 bg-gray-100 rounded-2xl shadow-sm space-y-3">
          <h3 className="text-xl text-black font-semibold">📍 Quick Info</h3>

          {business.address && (
            <p className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-500" />
              {business.address}
            </p>
          )}

          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <Phone className="w-5 h-5" />
              {business.phone}
            </a>
          )}

          {business.website && (
            <a
              href={business.website}
              target="_blank"
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <Globe className="w-5 h-5" />
              {business.website}
            </a>
          )}

          <p className="flex items-center gap-2 text-gray-700">
            <Clock className="w-5 h-5 text-gray-500" />
            {business.working_hours || "Mon-Fri 9AM-5PM"}
          </p>

          <p className="text-gray-700">
            Status:{" "}
            <span className={business.working_hours ? "text-green-500" : "text-red-500"}>
              {business.working_hours ? "Open" : "Closed"}
            </span>
          </p>
        </div>

        {/* RATING */}
        {business.rating && (
          <div className="p-6 text-black bg-gray-100 rounded-2xl shadow-sm flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <span className="text-xl font-bold">{business.rating}</span>
          </div>
        )}

        {/* BRAND */}
        {business.brandName && (
          <div className="p-6 text-black bg-gray-100 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold mb-1">🏢 Brand</h3>
            <p className="text-gray-700">{business.brandName}</p>
          </div>
        )}

      </aside>
    </div>
  );
}
