"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Business, Category } from "../../lib/types";
import { MapPin } from "lucide-react";
import ReactCardFlip from "react-card-flip";

interface Props {
  businesses: Business[];
  categoryId: string;
  categories: Category[];
}

export default function CatgorySection({ businesses, categoryId, categories }: Props) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const currentCategory = categories.find((cat) => cat.slug === categoryId);

  const filteredBusinesses = businesses.filter((b) => 
    b.categories?.some((cat) => cat.id === currentCategory?.id)
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
    const now = new Date();
    const nowTotal = now.getHours() * 60 + now.getMinutes();
    const [start, end] = workingHours.split("-");
    if (!start || !end) return false;
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    return nowTotal >= startTotal && nowTotal <= endTotal;
  }

  // 🔹 Generiši 4 biznisa po flipu
  const visibleBusinesses = [];
  for (let i = 0; i < 4; i++) {
    const idx = (visibleIndex + i) % filteredBusinesses.length;
    if (filteredBusinesses[idx]) visibleBusinesses.push(filteredBusinesses[idx]);
  }

  // 🔹 Ukloni duplicate po id da se key ne ponavlja
  const uniqueVisibleBusinesses = visibleBusinesses.filter(
    (b, index, self) => index === self.findIndex((t) => t.id === b.id)
  );

  return (
    <div className="mt-0 text-black md:text-start text-center">
      <div className="md:flex items-center justify-between p-5 pb-1 flex">
        <div className="flex md:justify-end space-x-3 pb-5 md:pb-0" style={{ marginLeft: 'auto' }}>
          <button
            onClick={() =>
              setVisibleIndex((prev) =>
                (prev - 4 + filteredBusinesses.length) % filteredBusinesses.length
              )
            }
            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-800 transition-all duration-200"
          >
            ◀
          </button>
          <button
            onClick={() =>
              setVisibleIndex((prev) => (prev + 4) % filteredBusinesses.length)
            }
            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-800 transition-all duration-200"
          >
            ▶
          </button>
        </div>
      </div>

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
        {uniqueVisibleBusinesses.map((b, index) => {
          const isFlipped = flippedIndexes.includes((visibleIndex + index) % filteredBusinesses.length);
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
              className={`
                perspective-1000 relative border border-gray-200 rounded-2xl snap-center
                ${isWideDesktop ? "md:col-span-2" : "md:col-span-1"}
                ${isWideMobile ? "col-span-2" : "col-span-1"}
              `}
            >
              <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                {/* FRONT */}
                <div key={`front-${b.id}`} className="relative w-full h-[35vh] md:h-[45vh] rounded-2xl">
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
                        className={`text-[1.3vh] font-semibold ${isOpenNow(b.workingHours) ? "text-green-400" : "text-red-500"}`}
                      >
                        {isOpenNow(b.workingHours) ? "Open Now" : "Closed Now"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BACK */}
                {backBiz && backBiz.id !== b.id && (
                  <div key={`back-${backBiz.id}`} className="relative w-full h-[35vh] md:h-[45vh] rounded-2xl">
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
                          className={`text-[1.3vh] font-semibold ${isOpenNow(backBiz.workingHours) ? "text-green-400" : "text-red-500"}`}
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
