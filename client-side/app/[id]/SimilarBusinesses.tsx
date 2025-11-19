"use client";

import { useState, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Business } from "../lib/types";

interface Props {
  id: string;              // slug trenutnog biznisa
  businesses: Business[];  // svi biznisi
}

export default function SimilarBusinessesCarousel({ id, businesses }: Props) {
  const currentBusiness = businesses.find((b) => b.slug === id);

  if (!currentBusiness) return null;

  // Filtriraj slične biznise po kategoriji ili tipu
  const similar = businesses.filter((b) => {
    if (b.slug === id) return false;

    const categoryMatch = b.categories?.some((c) =>
      currentBusiness.categories?.some((cc) => cc.name === c.name)
    );

    const typeMatch = b.types?.some((t) =>
      currentBusiness.types?.includes(t)
    );

    return categoryMatch || typeMatch;
  });

  if (similar.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) setItemsPerView(1);
      else setItemsPerView(3);
    };
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev >= similar.length - itemsPerView ? 0 : prev + 1
    );
  }, [similar.length, itemsPerView]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? similar.length - itemsPerView : prev - 1
    );
  }, [similar.length, itemsPerView]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const translatePercent = 100 / itemsPerView;

  // Funkcija za open/closed status
  const isOpenNow = (workingHours?: string) => {
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
  };

  return (
    <section
      className="relative w-full max-w-7xl mx-auto px-4 py-8"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Naslov i strelice */}
      <div className="flex items-center mb-4">
        <h2 className="text-2xl text-black font-bold">💡 Similar Businesses</h2>
        <div className="ml-auto flex gap-2">
          <button
            onClick={prevSlide}
            className="bg-purple-600 p-2 rounded-full shadow-md hover:bg-purple-500 transition-colors"
            aria-label="Previous"
          >
            <FaChevronLeft className="text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="bg-purple-600 p-2 rounded-full shadow-md hover:bg-purple-500 transition-colors"
            aria-label="Next"
          >
            <FaChevronRight className="text-white" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden relative">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * translatePercent}%)` }}
        >
          {similar.map((b) => (
            <Link
              key={b.id}
              href={`/${b.slug}`}
              className={`flex-shrink-0 px-2 md:px-4 ${
                itemsPerView === 1 ? "w-full" : "w-1/3"
              }`}
            >
              <div className="relative w-full h-[35vh] md:h-[45vh] rounded-2xl overflow-hidden group">
                <Image
                  src={b.images?.[0] || "https://dummyimage.com/720x540"}
                  alt={b.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover w-full h-full rounded-2xl transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/80 to-transparent p-4 flex flex-col gap-2 text-white rounded-b-2xl">
                  <h3 className="text-[2vh] font-semibold">{b.name}</h3>
                  <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                    {b.categories?.map((cat, i) => (
                      <span key={i}>{cat.name}</span>
                    ))}
                  </div>
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
            </Link>
          ))}
        </div>
      </div>

      {/* Navigacione tačke */}
      <div className="flex justify-center mt-4 space-x-2">
        {similar.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              idx === currentIndex ? "bg-purple-600" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
