"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AttractiveLocation } from "../lib/types";
import { MapPin, Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  attractive_locations: AttractiveLocation[];
}

export default function CategorySection({ attractive_locations }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const flipInterval = setInterval(() => {
      setTimeout(() => {
        setVisibleIndex((prev) => (prev + 4) % attractive_locations.length);
      }, 500);
      setFlipped(true);
      setTimeout(() => {
        setFlipped(false);
      }, 700);
    }, 5000);
    return () => clearInterval(flipInterval);
  }, [attractive_locations.length]);

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

  const visibleLocations = attractive_locations.slice(visibleIndex, visibleIndex + 4);

  return (
    <div className="mt-5 text-black md:text-start text-center">
      <h5 className="p-5 font-bold text-[5vh]">Preporučujemo</h5>

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

          return (
            <div
              key={b.id + "-front"}
              className={`
                perspective-1000 relative border border-gray-200 rounded-2xl snap-center
                ${isWideDesktop ? "md:col-span-2" : "md:col-span-1"}
                ${isWideMobile ? "col-span-2" : "col-span-1"}
              `}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-[35vh] md:h-[45vh] max-sm:aspect-[4/6] aspect-[16/10] transform-style-preserve-3d"
              >
                {/* Prednja strana */}
                <div className="absolute w-full h-full backface-hidden">
                  <Image
                    src={b.images?.[0] || "/assets/logosaraya-1.png"}
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
                    </div>
                  </div>
                </div>

                {/* Stražnja strana (novi biznis) */}
                {visibleLocations[(visibleIndex + index + 4) % visibleLocations.length] && (
                  <div key={visibleLocations[(visibleIndex + index + 4) % visibleLocations.length].id + "-back"} className="absolute w-full h-full rotateY-180 backface-hidden">
                    <Image
                      src={
                        visibleLocations[(visibleIndex + index + 4) % visibleLocations.length].images?.[0] ||
                        "https://dummyimage.com/720x540"
                      }
                      alt={
                        visibleLocations[(visibleIndex + index + 4) % visibleLocations.length].name
                      }
                      fill
                      className="object-cover w-full h-full rounded-2xl"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/80 to-transparent p-4 flex flex-col gap-2 text-white rounded-b-2xl">
                      <h3 className="text-[2vh] font-semibold">
                        {visibleLocations[(visibleIndex + index + 4) % visibleLocations.length].name}
                      </h3>
                      <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                        {visibleLocations[(visibleIndex + index + 4) % visibleLocations.length].categoryId}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {visibleLocations[(visibleIndex + index + 4) % visibleLocations.length].address}
                          </span>
                        </div>
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
