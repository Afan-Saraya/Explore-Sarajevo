"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { AttractiveLocation } from "../lib/types";
import { MapPin } from "lucide-react";
import ReactCardFlip from "react-card-flip";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
  attractive_locations: AttractiveLocation[];
}

export default function AttractiveLocations({ attractive_locations }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Ažuriranje vremena svake minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredLocations = selectedCategory
    ? attractive_locations.filter((b) => b.slug === selectedCategory)
    : attractive_locations;

  // Automatski flip i promjena seta kartica
  useEffect(() => {
    if (filteredLocations.length === 0) return;
    const flipInterval = setInterval(() => {
      setFlipped(true);
      setTimeout(() => {
        setVisibleIndex((prev) => (prev + 4) % filteredLocations.length);
        setFlipped(false);
      }, 700);
    }, 5000);
    return () => clearInterval(flipInterval);
  }, [filteredLocations.length]);

  const visibleLocations = filteredLocations.slice(visibleIndex, visibleIndex + 4);

  return (
    <div className="mt-4 text-black md:text-start text-center">
      {/* Naslov i strelice */}
      <div className="md:flex items-center justify-between px-5 mb-4 flex">
        <h2 className="text-2xl text-black font-bold">🔥 Atraktivne lokacije</h2>
        <div className="flex md:justify-end space-x-3" style={{ marginLeft: "auto" }}>
          <button
            onClick={() =>
              setVisibleIndex((prev) =>
                (prev - 4 + filteredLocations.length) % filteredLocations.length
              )
            }
            className="bg-purple-600 p-2 rounded-full shadow-md hover:bg-purple-500 transition-colors"
            aria-label="Previous"
          >
            <FaChevronLeft className="text-white" />
          </button>
          <button
            onClick={() =>
              setVisibleIndex((prev) => (prev + 4) % filteredLocations.length)
            }
            className="bg-purple-600 p-2 rounded-full shadow-md hover:bg-purple-500 transition-colors"
            aria-label="Next"
          >
            <FaChevronRight className="text-white" />
          </button>
        </div>
      </div>

      {/* Grid kartica */}
      <div
        className="
          grid 
          md:grid-cols-3 gap-2 md:gap-10
          grid-cols-2 max-sm:grid-cols-2
          overflow-x-auto md:overflow-visible 
          snap-x snap-mandatory
          scrollbar-hide
        "
      >
        {visibleLocations.map((b, index) => {
          const pairIndex = Math.floor(index / 2);
          const isEvenRow = pairIndex % 2 === 0;
          const isWideDesktop =
            (isEvenRow && index % 2 === 0) || (!isEvenRow && index % 2 === 1);
          const isWideMobile = index % 3 === 0;

          const backIndex = (visibleIndex + index + 4) % filteredLocations.length;
          const backLoc = filteredLocations[backIndex];

          return (
            <div
              key={b.id}
              className={`relative border border-gray-200 rounded-2xl snap-center
                ${isWideDesktop ? "md:col-span-2" : "md:col-span-1"}
                ${isWideMobile ? "col-span-2" : "col-span-1"}
              `}
            >
              <ReactCardFlip isFlipped={flipped} flipDirection="horizontal">
                {/* FRONT */}
                <div className="relative w-full h-[35vh] md:h-[45vh] rounded-2xl">
                  <Image
                    src={(b.images && Array.isArray(b.images) && b.images[0]) || "https://dummyimage.com/720x540"}
                    alt={b.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover w-full h-full rounded-2xl"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/80 to-transparent p-4 flex flex-col gap-2 text-white rounded-b-2xl">
                    <h3 className="text-[2vh] font-semibold">{b.name}</h3>
                    {b.categories && b.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {b.categories.map((cat) => (
                          <span key={cat.id} className="px-2 py-0.5 text-[1.1vh] bg-white/20 backdrop-blur-sm rounded-full">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                        <MapPin className="w-4 h-4" />
                        <span>{b.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BACK */}
                {backLoc && (
                  <div className="relative w-full h-[35vh] md:h-[45vh] rounded-2xl">
                    <Image
                      src={(backLoc.images && Array.isArray(backLoc.images) && backLoc.images[0]) || "https://dummyimage.com/720x540"}
                      alt={backLoc.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover w-full h-full rounded-2xl"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/80 to-transparent p-4 flex flex-col gap-2 text-white rounded-b-2xl">
                      <h3 className="text-[2vh] font-semibold">{backLoc.name}</h3>
                      {backLoc.categories && backLoc.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {backLoc.categories.map((cat) => (
                            <span key={cat.id} className="px-2 py-0.5 text-[1.1vh] bg-white/20 backdrop-blur-sm rounded-full">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                          <MapPin className="w-4 h-4" />
                          <span>{backLoc.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ReactCardFlip>
            </div>
          );
        })}
      </div>
    </div>
  );
}
