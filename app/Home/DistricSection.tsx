"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Business } from "../lib/types";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  businesses: Business[];
  brandName: string; // 👈 novi prop
}

export default function DistrictSection({ businesses, brandName }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Update vremena svake minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Filtriraj samo biznise koji imaju brandName isti kao prop
  const filteredByBrand = businesses.filter(
    (b) => b.brandId?.toLowerCase() === brandName.toLowerCase()
  );

  const filteredBusinesses = selectedCategory
    ? filteredByBrand.filter((b) => b.slug === selectedCategory)
    : filteredByBrand;

  // Flip animacija
  useEffect(() => {
    if (filteredBusinesses.length === 0) return;
    const flipInterval = setInterval(() => {
      setTimeout(() => {
        setVisibleIndex((prev) => (prev + 4) % filteredBusinesses.length);
      }, 500);
      setFlipped(true);
      setTimeout(() => {
        setFlipped(false);
      }, 700);
    }, 5000);
    return () => clearInterval(flipInterval);
  }, [filteredBusinesses.length]);

  // Provjera da li je otvoreno
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

  const visibleBusinesses = filteredBusinesses.slice(visibleIndex, visibleIndex + 4);

  return (
    <div className="mt-5 text-black md:text-start text-center">
      <Image className="p-5" src="/assets/visitBjelasnicaLogo.png" width={400} height={40} alt="" />

      {/* Filter dugmad */}
      {filteredBusinesses.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              selectedCategory === null
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            } transition`}
          >
            Sve
          </button>
          {filteredBusinesses.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedCategory(b.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                selectedCategory === b.slug
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              } transition`}
            >
              {b.categoryId}
            </button>
          ))}
        </div>
      )}

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

          const backIndex = (visibleIndex + index + 4) % filteredBusinesses.length;
          const backBiz = filteredBusinesses[backIndex];

          return (
            <div
              key={b.id}
              className={`perspective-1000 relative border border-gray-200 rounded-2xl snap-center
                ${isWideDesktop ? "md:col-span-2" : "md:col-span-1"}
                ${isWideMobile ? "col-span-2" : "col-span-1"}`}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-[35vh] md:h-[45vh] max-sm:aspect-[4/6] aspect-[16/10] transform-style-preserve-3d"
              >
                {/* Prednja strana */}
                <div className="absolute w-full h-full backface-hidden">
                  <Image
                    src={b.images[0] || "https://dummyimage.com/720x540"}
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

                {/* Stražnja strana */}
                {backBiz && (
                  <div className="absolute w-full h-full rotateY-180 backface-hidden">
                    <Image
                      src={backBiz.images[0] || "https://dummyimage.com/720x540"}
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
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
