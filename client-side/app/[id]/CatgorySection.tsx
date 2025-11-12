"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Business, Category } from "../lib/types";
import { MapPin } from "lucide-react";
import ReactCardFlip from "react-card-flip";

interface Props {
  businesses: Business[];
  categoryId: string;
  categories: Category[];
}

export default function CategorySectionByCategory({ businesses, categoryId, categories }: Props) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Filtriraj po kategoriji i featured
  const categoryDescription = categories.filter(
    (b) => b.id === categoryId
  )

  const filteredBusinesses = businesses.filter(
    (b) => b.categoryId === categoryId
  );

  // 🔄 Flip interval
  useEffect(() => {
    const flipInterval = setInterval(() => {
      const nextIndex = (visibleIndex + 4) % filteredBusinesses.length;
      const newFlipped: number[] = [];
      for (let i = 0; i < 4; i++) {
        const idx = (visibleIndex + i) % filteredBusinesses.length;
        if (idx >= filteredBusinesses.length) break;
        newFlipped.push(idx);
      }
      setFlippedIndexes(newFlipped);
      setTimeout(() => {
        setVisibleIndex(nextIndex);
        setFlippedIndexes([]);
      }, 700);
    }, 5000);
    return () => clearInterval(flipInterval);
  }, [visibleIndex, filteredBusinesses.length]);

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

  // 🔹 Generiši 4 biznisa po flipu, zadnji „page“ može imati < 4
  const visibleBusinesses = [];
  for (let i = 0; i < 4; i++) {
    const idx = (visibleIndex + i) % filteredBusinesses.length;
    if (filteredBusinesses[idx]) visibleBusinesses.push(filteredBusinesses[idx]);
  }

  return (
    <div className="mt-0 text-black md:text-start text-center">
      <div className="md:flex items-center justify-between p-5 pb-1">
        <div>
          <h5 className="p-5 pb-1 font-bold text-[5vh]">{categoryId}</h5>
          <p className="pb-5 text-[2vh]">{categoryDescription[0].description}</p>
        </div>
        {/* Strelice za flip */}
        <div className="flex justify-center md:justify-end space-x-3 pb-5 md:pb-0">
          <button
            onClick={() =>
              setVisibleIndex((prev) =>
                (prev - 4 + filteredBusinesses.length) % filteredBusinesses.length
              )
            }
            className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-800 transition-all duration-200"
          >
            ◀
          </button>
          <button
            onClick={() =>
              setVisibleIndex((prev) => (prev + 4) % filteredBusinesses.length)
            }
            className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-800 transition-all duration-200"
          >
            ▶
          </button>
        </div>
      </div>
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
          const isFlipped = flippedIndexes.includes((visibleIndex + index) % filteredBusinesses.length);
          const pairIndex = Math.floor(index / 2);
          const isEvenRow = pairIndex % 2 === 0;
          const isWideDesktop =
            (isEvenRow && index % 2 === 0) || (!isEvenRow && index % 2 === 1);
          const isWideMobile = index % 3 === 0;

          // BACK kartica (uzeti sljedeći po redu)
          const backIndex = (visibleIndex + index + 4) % filteredBusinesses.length;
          const backBiz = filteredBusinesses[backIndex];

          return (
            <div
              key={b.id}
              className={`
                perspective-1000 relative border border-gray-200 rounded-2xl snap-center
                ${isWideDesktop ? "md:col-span-2" : "md:col-span-1"}
                ${isWideMobile ? "col-span-2" : "col-span-1"}
              `}
            >
              <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                {/* FRONT */}
                <div className="relative w-full h-[35vh] md:h-[45vh] rounded-2xl">
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
                        className={`text-[1.3vh] font-semibold ${isOpenNow(b.workingHours)
                          ? "text-green-400"
                          : "text-red-500"
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
                          className={`text-[1.3vh] font-semibold ${isOpenNow(backBiz.workingHours)
                            ? "text-green-400"
                            : "text-red-500"
                            }`}
                        >
                          {isOpenNow(backBiz.workingHours)
                            ? "Open Now"
                            : "Closed Now"}
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
