"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Business } from "../lib/types";
import { MapPin } from "lucide-react";
import ReactCardFlip from "react-card-flip";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
  businesses: Business[];
  brandName: string;
}

export default function DistrictSection({ businesses, brandName }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const minVisible = 4; // minimalno 4 kartice

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredByBrand = businesses.filter((b) => {
    if (b.brandSlug) return b.brandSlug.toLowerCase() === brandName.toLowerCase();
    if (b.brandName) return b.brandName.toLowerCase() === brandName.toLowerCase();
    if (typeof b.brandId === "string") return b.brandId.toLowerCase() === brandName.toLowerCase();
    return false;
  });

  const filteredBusinesses = selectedCategory
    ? filteredByBrand.filter((b) => b.slug === selectedCategory)
    : filteredByBrand;

  const visibleBusinesses = filteredBusinesses.slice(
    visibleIndex,
    visibleIndex + minVisible
  );

  // Dopuni kartice ako ih nema dovoljno
  while (visibleBusinesses.length < minVisible && filteredBusinesses.length > 0) {
    visibleBusinesses.push(filteredBusinesses[visibleBusinesses.length % filteredBusinesses.length]);
  }

  function isOpenNow(workingHours?: string) {
    if (!workingHours) return false;
    const now = new Date();
    const [start, end] = workingHours.split("-");
    if (!start || !end) return false;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const totalNow = now.getHours() * 60 + now.getMinutes();
    const totalStart = sh * 60 + sm;
    const totalEnd = eh * 60 + em;
    return totalNow >= totalStart && totalNow <= totalEnd;
  }

  // Flip interval identičan CategorySection
  useEffect(() => {
    if (filteredBusinesses.length <= minVisible) return;
    const flipInterval = setInterval(() => {
      setFlipped(true);
      setTimeout(() => {
        setVisibleIndex((prev) => (prev + minVisible) % filteredBusinesses.length);
        setFlipped(false);
      }, 700);
    }, 5000);
    return () => clearInterval(flipInterval);
  }, [filteredBusinesses.length]);

  return (
    <div className="mt-5 text-black md:text-start text-center">
      <Image
        src="/assets/visitBjelasnicaLogo.png"
        width={400}
        height={40}
        alt=""
      />

      {/* Naslov i strelice */}
      <div className="md:flex items-center justify-between px-5 mb-4 flex">
        <div className="flex md:justify-end space-x-3" style={{ marginLeft: "auto" }}>
          <button
            onClick={() =>
              setVisibleIndex((prev) =>
                (prev - minVisible + filteredBusinesses.length) % filteredBusinesses.length
              )
            }
            className="bg-purple-600 p-2 rounded-full shadow-md hover:bg-purple-500 transition-colors"
            aria-label="Previous"
          >
            <FaChevronLeft className="text-white" />
          </button>
          <button
            onClick={() =>
              setVisibleIndex((prev) => (prev + minVisible) % filteredBusinesses.length)
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
        {visibleBusinesses.map((b, index) => {
          const pairIndex = Math.floor(index / 2);
          const isEvenRow = pairIndex % 2 === 0;
          const isWideDesktop =
            (isEvenRow && index % 2 === 0) || (!isEvenRow && index % 2 === 1);
          const isWideMobile = index % 3 === 0;

          const backIndex = (visibleIndex + index + minVisible) % filteredBusinesses.length;
          const backBiz = filteredBusinesses[backIndex];

          return (
            <div
              key={`${b.id}-${index}`}
              className={`relative border border-gray-200 rounded-2xl snap-center
                ${isWideDesktop ? "md:col-span-2" : "md:col-span-1"}
                ${isWideMobile ? "col-span-2" : "col-span-1"}
              `}
            >
              <ReactCardFlip isFlipped={flipped && !!backBiz} flipDirection="horizontal">
                {/* FRONT */}
                <div className="relative w-full h-[35vh] md:h-[45vh] max-sm:aspect-[4/6] aspect-[16/10] rounded-2xl">
                  <Image
                    src={(b.images && Array.isArray(b.images) && b.images[0]) || "https://dummyimage.com/720x540"}
                    alt={b.name}
                    fill
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
                  <div className="relative w-full h-[35vh] md:h-[45vh] max-sm:aspect-[4/6] aspect-[16/10] rounded-2xl">
                    <Image
                      src={(backBiz.images && Array.isArray(backBiz.images) && backBiz.images[0]) || "https://dummyimage.com/720x540"}
                      alt={backBiz.name}
                      fill
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
