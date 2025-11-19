"use client";

import { Map, Marker } from "pigeon-maps";
import { useState, useEffect, useMemo } from "react";
import { Business, Category } from "../../lib/types";
import MapBusinessCard from "./BusinessCard";
import ReactCardFlip from "react-card-flip";

export default function MapHero({
  businesses,
  categoryId,
  categories,
}: {
  businesses: Business[];
  categoryId: string;
  categories: Category[];
}) {
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState<[number, number]>([43.8563, 18.4131]);
  const [mapHeight, setMapHeight] = useState(400);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMapHeight(window.innerHeight * 0.55);
    }
  }, []);

  const filteredBusinesses = useMemo(() => {
    if (!categoryId) return businesses;
    // Find the category by slug
    const currentCategory = categories.find((cat) => cat.slug === categoryId);
    if (!currentCategory) return [];
    // Filter businesses that have this category in their categories array
    return businesses.filter((b) => {
      if (b.categories && Array.isArray(b.categories)) {
        return b.categories.some((cat) => cat.id === currentCategory.id);
      }
      return false;
    });
  }, [businesses, categoryId, categories]);

  useEffect(() => {
    if (filteredBusinesses.length === 0) return;

    const businessesWithLocation = filteredBusinesses.filter((b) => b.location);
    if (businessesWithLocation.length === 0) return;

    const lats = businessesWithLocation.map((b) =>
      Number(b.location!.split(",")[0])
    );
    const lngs = businessesWithLocation.map((b) =>
      Number(b.location!.split(",")[1])
    );

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

  const handleMarkerClick = (b: Business) => {
    if (selectedBusiness?.id === b.id) {
      setSelectedBusiness(null);
      setFlipped(false);
    } else {
      setSelectedBusiness(b);
      setFlipped(true);
    }
  };

  return (
    <div className="w-full mt-10">
      {/* 🗺️ Mapa */}
      <section className="relative w-full overflow-hidden rounded-none">
        <Map center={center} zoom={zoom} height={mapHeight}>
          {filteredBusinesses
            .filter((b) => b.location)
            .map((b) => {
              const [lat, lng] = b.location!.split(",").map(Number);
              return (
                <Marker
                  key={b.id}
                  anchor={[lat, lng]}
                  color={selectedBusiness?.id === b.id ? "#a855f7" : "#9333ea"}
                  onClick={() => handleMarkerClick(b)}
                />
              );
            })}
        </Map>
      </section>

      {/* 📋 Kliknuti biznis (flip kartica preko cijelog reda) */}
      <div className="mt-4 px-4 md:px-8">
        <ReactCardFlip isFlipped={flipped} flipDirection="horizontal">
          {/* FRONT: prazno */}
          <div className="w-full"></div>

          {/* BACK: kartica */}
          {selectedBusiness && (
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-14 overflow-hidden">
              <MapBusinessCard business={selectedBusiness} />
            </section>
          )}
        </ReactCardFlip>
      </div>
    </div>
  );
}