"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { Business } from "../lib/types";
import { Star } from "lucide-react";

interface HeroProps {
  categoryId: string;          
  businesses: Business[];      
}

export default function Hero({ categoryId, businesses }: HeroProps) {
  // Pronađi biznis preko slug-a
  const matchedBusiness = useMemo(() => {
    return businesses.find((b) => b.slug === categoryId);
  }, [businesses, categoryId]);

  useEffect(() => {
    console.log("Matched business:", matchedBusiness);
  }, [matchedBusiness]);

  if (!matchedBusiness) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-700">Biznis nije pronađen</h2>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[30vh] md:h-[60vh] rounded-2xl overflow-hidden">
      {/* Background image */}
      <Image
        src={(matchedBusiness.images && matchedBusiness.images[0]) || "https://dummyimage.com/1920x1080"}
        alt={matchedBusiness.name}
        fill
        priority
        className="object-cover"
      />

      {/* Bottom overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">

        {/* Business name */}
        <h1 className="text-4xl font-extrabold mb-2 drop-shadow-lg">
          {matchedBusiness.name}
        </h1>

        {/* Rating */}
        {matchedBusiness.rating && (
          <div className="flex items-center gap-2 text-lg font-semibold drop-shadow-md">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <span>{matchedBusiness.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
