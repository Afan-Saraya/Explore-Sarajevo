"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Business } from "../lib/types";
import { MapPin } from "lucide-react";
import ReactCardFlip from "react-card-flip";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
  businesses: Business[];
}

export default function CategorySection({ businesses }: Props) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const featuredBusinesses = businesses.filter((b) => b.featuredBusiness === true);

  const uniqueCategories = Array.from(
    new Set(
      featuredBusinesses
        .map((b) => b.categoryId)
        .filter((cat): cat is string => cat !== undefined)
    )
  );

  const filteredBusinesses = selectedCategory
    ? featuredBusinesses.filter((b) => b.categoryId === selectedCategory)
    : featuredBusinesses;

  // Automatski flip
  useEffect(() => {
    const flipInterval = setInterval(() => {
      setFlipped(true);
      setTimeout(() => {
        setVisibleIndex((prev) => (prev + 4) % filteredBusinesses.length);
        setFlipped(false);
      }, 700);
    }, 5000);
    return () => clearInterval(flipInterval);
  }, [filteredBusinesses.length]);

  function isOpenNow(workingHours?: string) {
    if (!workingHours) return false;
    const currentTime = new Date();
    const nowH = currentTime.getHours();
    const nowM = currentTime.getMinutes();
    const [start, end] = workingHours.split("-");
    if (!start || !end) return false;
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const nowTotal = nowH * 60 + nowM;
    return nowTotal >= startTotal && nowTotal <= endTotal;
  }

  const visibleBusinesses = filteredBusinesses.slice(visibleIndex, visibleIndex + 4);

  return (
    <div className="mt-15 text-black md:text-start text-center">
      {/* Naslov i strelice */}
      <div className="md:flex items-center justify-between px-5 mb-4 flex">
        <h2 className="text-2xl text-black font-bold">🌟 Preporučeno</h2>
        <div className="flex md:justify-end space-x-3" style={{ marginLeft: 'auto' }}>
          <button
            onClick={() =>
              setVisibleIndex((prev) =>
                (prev - 4 + filteredBusinesses.length) % filteredBusinesses.length
              )
            }
            className="bg-purple-600 p-2 rounded-full shadow-md hover:bg-purple-500 transition-colors"
            aria-label="Previous"
          >
            <FaChevronLeft className="text-white" />
          </button>
          <button
            onClick={() =>
              setVisibleIndex((prev) => (prev + 4) % filteredBusinesses.length)
            }
            className="bg-purple-600 p-2 rounded-full shadow-md hover:bg-purple-500 transition-colors"
            aria-label="Next"
          >
            <FaChevronRight className="text-white" />
          </button>
        </div>
      </div>

      {/* Filter dugmad */}
      {uniqueCategories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          <button
            key="all"
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-[1.5vh] font-medium border ${
              selectedCategory === null
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            } transition`}
          >
            Sve
          </button>
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-[1.5vh] font-medium border ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              } transition`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid kartica */}
      <div
        className="
          grid 
          md:grid-cols-3 gap-2 md:gap-3
          grid-cols-2 max-sm:grid-cols-2
          overflow-x-auto md:overflow-visible 
          snap-x snap-mandatory
          scrollbar-hide
        "
      >
        {visibleBusinesses.map((b, index) => {
          const pairIndex = Math.floor(index / 2);
          const isEvenRow = pairIndex % 2 === 0;
          const isWideDesktop =
            (isEvenRow && index % 2 === 0) || (!isEvenRow && index % 2 === 1);
          const isWideMobile = index % 3 === 0;

          const backIndex = (visibleIndex + index + 4) % filteredBusinesses.length;
          const backBiz = filteredBusinesses[backIndex];

          return (
            <div
              key={b.id}
              onClick={() => router.push(`/${b.slug}`)}
              className={`
                cursor-pointer
                perspective-1000 relative border border-gray-200 rounded-2xl snap-center
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
                    <div className="flex items-center gap-2 text-[1.3vh] opacity-90">{b.categoryId}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                        <MapPin className="w-4 h-4" />
                        <span>{b.address}</span>
                      </div>
                      <span
                        className={`text-[1.3vh] font-semibold ${
                          isOpenNow(b.workingHours) ? "text-green-400" : "text-red-500"
                        }`}
                      >
                        {isOpenNow(b.workingHours) ? "Open Now" : "Closed Now"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BACK */}
                {backBiz && (
                  <div className="relative w-full h-[35vh] md:h-[45vh] rounded-2xl">
                    <Image
                      src={(backBiz.images && Array.isArray(backBiz.images) && backBiz.images[0]) || "https://dummyimage.com/720x540"}
                      alt={backBiz.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover w-full h-full rounded-2xl"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/80 to-transparent p-4 flex flex-col gap-2 text-white rounded-b-2xl">
                      <h3 className="text-[2vh] font-semibold">{backBiz.name}</h3>
                      <div className="flex items-center gap-2 text-[1.3vh] opacity-90">{backBiz.categoryId}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                          <MapPin className="w-4 h-4" />
                          <span>{backBiz.address}</span>
                        </div>
                        <span
                          className={`text-[1.3vh] font-semibold ${
                            isOpenNow(backBiz.workingHours) ? "text-green-400" : "text-red-500"
                          }`}
                        >
                          {isOpenNow(backBiz.workingHours) ? "Open Now" : "Closed Now"}
                        </span>
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
