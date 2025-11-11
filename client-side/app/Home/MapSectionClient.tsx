"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Business } from "../lib/types";

// Dinamički import react-leaflet sa SSR isključenim
const MapContainer = dynamic(
  async () => {
    const L = await import("leaflet");
    const { MapContainer, TileLayer, Marker, Popup, useMap } = await import("react-leaflet");

    const defaultIcon = new L.Icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -35],
    });

    // Omotaj u komponentu da možemo vratiti sve zajedno
    return function MapComponent({ businesses, activeCategory, selected, setSelected }: any) {
      const filteredBusinesses = activeCategory
        ? businesses.filter((b: Business) => b.categoryId === activeCategory)
        : businesses;

      const initial: [number, number] = [43.8563, 18.4131];

      const FitBounds = () => {
        const map = useMap();
        const locs = filteredBusinesses.map((b: Business) =>
          b.location.split(",").map(Number) as [number, number]
        );

        if (locs.length > 0) {
          map.fitBounds(locs as any, { padding: [50, 50] });
        } else {
          map.setView(initial, 13);
        }
        return null;
      };

      return (
        <MapContainer center={initial} zoom={13} scrollWheelZoom className="w-full h-full">
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />
          <FitBounds />
          {filteredBusinesses.map((b: Business) => {
            const loc = b.location.split(",").map(Number) as [number, number];
            return (
              <Marker
                key={b.id}
                position={loc}
                icon={defaultIcon}
                eventHandlers={{ click: () => setSelected(loc) }}
              >
                <Popup>
                  <strong>{b.name}</strong>
                  <br />
                  {b.description}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      );
    };
  },
  { ssr: false }
);

export default function MapSectionClient({ businesses }: { businesses: Business[] }) {
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const uniqueCategories = Array.from(new Set(businesses?.map((b) => b.categoryId) || []));

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

      <section className="relative w-full h-[60vh] rounded-2xl overflow-hidden">
        <MapContainer
          businesses={businesses}
          activeCategory={activeCategory}
          selected={selected}
          setSelected={setSelected}
        />
      </section>
    </>
  );
}
