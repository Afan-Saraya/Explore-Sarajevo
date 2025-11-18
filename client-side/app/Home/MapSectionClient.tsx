"use client";

import { Map, Marker, Overlay } from "pigeon-maps";
import { useState, useMemo, useEffect } from "react";
import { Business } from "../lib/types";

export default function MapSectionClient({ businesses }: { businesses: Business[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState<[number, number]>([43.8563, 18.4131]);

  const uniqueCategories = Array.from(new Set(businesses.map((b) => b.categoryId).filter((cat): cat is string => Boolean(cat))));

  const filteredBusinesses = useMemo(() => {
    return activeCategory
      ? businesses.filter((b) => b.categoryId === activeCategory)
      : businesses;
  }, [activeCategory, businesses]);

  // Automatski centriraj i zumiraj kada se promijeni kategorija
  useEffect(() => {
    if (filteredBusinesses.length === 0) {
      setCenter([43.8563, 18.4131]);
      setZoom(13);
      return;
    }

    const lats = filteredBusinesses.filter(b => b.location).map((b) => Number(b.location!.split(",")[0]));
    const lngs = filteredBusinesses.filter(b => b.location).map((b) => Number(b.location!.split(",")[1]));

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    setCenter([midLat, midLng]);

    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    if (maxDiff < 0.01) setZoom(15);
    else if (maxDiff < 0.05) setZoom(13);
    else if (maxDiff < 0.1) setZoom(12);
    else setZoom(11);
  }, [filteredBusinesses]);

  return (
    <>
      {/* Naslov i filteri */}
      <section className="relative flex flex-col mt-[6vh] overflow-hidden">
        <h5 className="p-5 font-bold text-black text-[5vh]">Istražite interesovanja na mapi Sarajeva</h5>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <button
            key="map-all"
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 text-sm rounded-full border transition ${
              !activeCategory
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            Sve
          </button>
          {uniqueCategories.map((cat, index) => (
            <button
              key={`map-cat-${cat}-${index}`}
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
        <Map height={600} center={center} zoom={zoom}>
          {filteredBusinesses.filter(b => b.location).map((b) => {
            const [lat, lng] = b.location!.split(",").map(Number);
            return (
              <Marker
                key={b.id}
                anchor={[lat, lng]}
                onClick={() => setSelectedBusiness(b)}
                color="#9333ea" // 💜 Purple marker
              />
            );
          })}

          {selectedBusiness && selectedBusiness.location && (
            <Overlay
              anchor={selectedBusiness.location.split(",").map(Number) as [number, number]}
              offset={[120, 80]}
            >
              <div className="bg-white p-3 rounded-xl shadow-lg border text-sm w-[260px] relative">
                {/* Zatvori */}
                <button
                  onClick={() => setSelectedBusiness(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>

                {/* Slika */}
                {selectedBusiness.images && Array.isArray(selectedBusiness.images) && selectedBusiness.images[0] && (
                  <img
                    src={selectedBusiness.images[0]}
                    alt={selectedBusiness.name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}

                {/* Tekstualni dio */}
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  {selectedBusiness.name}
                </h3>
                <p className="text-gray-700 text-xs mb-2">{selectedBusiness.description}</p>
                <p className="text-gray-600 text-xs mb-1">
                  📍 {selectedBusiness.address}
                </p>
                <p className="text-gray-600 text-xs mb-1">
                  🕓 {selectedBusiness.workingHours}
                </p>
                <p className="text-gray-600 text-xs mb-1">
                  ⭐ {selectedBusiness.rating}
                </p>
                {selectedBusiness.phone && (
                  <p className="text-gray-600 text-xs mb-1">
                    ☎️ {selectedBusiness.phone}
                  </p>
                )}
                {selectedBusiness.website && (
                  <a
                    href={selectedBusiness.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 text-xs font-medium hover:underline"
                  >
                    🌐 Posjeti web stranicu
                  </a>
                )}
              </div>
            </Overlay>
          )}
        </Map>
      </section>
    </>
  );
}
