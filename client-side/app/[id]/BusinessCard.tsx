"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { Business } from "../lib/types";

export default function MapBusinessCard({ business }: { business: Business }) {
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
    <div className="relative w-full h-[45vh] rounded-2xl border border-gray-200 overflow-hidden shadow-md transition hover:shadow-xl">
      {/* Slika */}
      <Image
        src={(business.images && Array.isArray(business.images) && business.images[0]) || "https://dummyimage.com/720x540"}
        alt={business.name}
        fill
        className="object-cover w-full h-full rounded-2xl"
      />

      {/* Overlay sa detaljima */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/80 to-transparent p-5 flex flex-col gap-3 text-white rounded-b-2xl">
        <h3 className="text-[2.5vh] font-semibold">{business.name}</h3>
        <div className="flex items-center gap-2 text-[1.4vh] opacity-90">
          {business.categoryId}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[1.4vh] opacity-90">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span>{business.address}</span>
          </div>
          <span
            className={`text-[1.3vh] font-semibold ${isOpenNow(business.workingHours)
                ? "text-green-400"
                : "text-red-400"
              }`}
          >
            {isOpenNow(business.workingHours) ? "Open Now" : "Closed Now"}
          </span>
        </div>
      </div>
    </div>
  );
}
