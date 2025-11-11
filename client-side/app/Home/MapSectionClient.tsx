"use client";

import { useState, useMemo } from "react";
import { Business } from "../lib/types";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript
} from "@react-google-maps/api";

interface Props {
  businesses: Business[];
}

export default function MapSectionClient({ businesses }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Business | null>(null);

  // Google Maps API key
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const filteredBusinesses = useMemo(
    () =>
      activeCategory
        ? businesses.filter((b) => b.categoryId === activeCategory)
        : businesses,
    [activeCategory, businesses]
  );

  const uniqueCategories = useMemo(
    () => Array.from(new Set(businesses.map((b) => b.categoryId))),
    [businesses]
  );

  const mapCenter = { lat: 43.8563, lng: 18.4131 };

  if (loadError) return <div>Mapa nije dostupna</div>;
  if (!isLoaded) return <div>Učitavanje mape...</div>;

  return (
    <>
      <section className="relative flex flex-col items-center mt-[6vh] overflow-hidden">
        <div className="max-w-2xl mb-6 mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight uppercase">
            Istražite interesovanja na mapi Sarajeva
          </h2>
          <p className="text-gray-700 text-lg md:text-xl">
            Pregledajte lokalne firme, restorane i servise u vašoj blizini.
            Filtrirajte po kategorijama i pronađite tačno ono što tražite.
          </p>
        </div>

        {/* Filter kategorija */}
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
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          zoom={13}
          center={mapCenter}
          onLoad={(map) => {
            if (filteredBusinesses.length > 0) {
              const bounds = new window.google.maps.LatLngBounds();
              filteredBusinesses.forEach((b) => {
                const [lat, lng] = b.location.split(",").map(Number);
                bounds.extend({ lat, lng });
              });
              map.fitBounds(bounds);
            }
          }}
        >
          {filteredBusinesses.map((b) => {
            const [lat, lng] = b.location.split(",").map(Number);
            return (
              <Marker
                key={b.id}
                position={{ lat, lng }}
                onClick={() => setSelectedMarker(b)}
              />
            );
          })}

          {selectedMarker && (
            <InfoWindow
              position={{
                lat: Number(selectedMarker.location.split(",")[0]),
                lng: Number(selectedMarker.location.split(",")[1]),
              }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <h3 className="font-bold">{selectedMarker.name}</h3>
                <p>{selectedMarker.description}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </section>
    </>
  );
}
