"use client";

import { Map, Marker, Overlay } from "pigeon-maps";
import { useState, useMemo } from "react";
import { Business } from "../lib/types";

export default function MapSectionClient({ businesses }: { businesses: Business[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const uniqueCategories = Array.from(new Set(businesses.map((b) => b.categoryId)));

  const filteredBusinesses = useMemo(() => {
    return activeCategory
      ? businesses.filter((b) => b.categoryId === activeCategory)
      : businesses;
  }, [activeCategory, businesses]);

  const defaultCenter: [number, number] = [43.8563, 18.4131];
  const mapCenter =
    selected ||
    (filteredBusinesses.length > 0
      ? filteredBusinesses.reduce(
          (acc, b) => {
            const [lat, lng] = b.location.split(",").map(Number);
            return [acc[0] + lat / filteredBusinesses.length, acc[1] + lng / filteredBusinesses.length];
          },
          [0, 0]
        ) as [number, number]
      : defaultCenter);

  return (
    <>
      <section className="relative flex flex-col items-center mt-[6vh] overflow-hidden">
        <div className="max-w-2xl mb-6 mx-auto text-center relative z-2">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight uppercase">
            Istražite interesovanja na mapi Sarajeva
          </h2>
          <p className="text-gray-700 text-lg md:text-xl">
            Pregledajte lokalne firme, restorane i servise u vašoj blizini.
            Filtrirajte po kategorijama i pronađite tačno ono što tražite.
          </p>
        </div>

        {/* Dugmad za kategorije */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 text-sm rounded-full border transition ${
              !activeCategory
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            Sve
          </button>
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-full border transition ${
                activeCategory === cat
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Mapa */}
      <section className="relative w-full h-[60vh] rounded-2xl overflow-hidden">
        <Map
          height={600}
          defaultCenter={defaultCenter}
          center={mapCenter}
          defaultZoom={13}
          zoom={14}
        >
          {filteredBusinesses.map((b) => {
            const [lat, lng] = b.location.split(",").map(Number);
            return (
              <Marker
                key={b.id}
                anchor={[lat, lng]}
                onClick={() => setSelected([lat, lng])}
              />
            );
          })}

          {selected &&
            filteredBusinesses.map((b) => {
              const [lat, lng] = b.location.split(",").map(Number);
              if (lat === selected[0] && lng === selected[1]) {
                return (
                  <Overlay key={b.id} anchor={[lat, lng]} offset={[120, 80]}>
                    <div className="bg-white p-3 rounded-xl shadow-lg border text-sm w-[220px]">
                      <h3 className="font-semibold text-gray-900">{b.name}</h3>
                      <p className="text-gray-700 text-xs">{b.description}</p>
                      <p className="text-gray-500 text-xs mt-1">{b.address}</p>
                    </div>
                  </Overlay>
                );
              }
              return null;
            })}
        </Map>
      </section>
    </>
  );
}
