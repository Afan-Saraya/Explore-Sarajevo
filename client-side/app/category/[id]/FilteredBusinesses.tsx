"use client";

import Image from "next/image";
import { useState } from "react";
import { Business } from "../../lib/types";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Category } from "../../lib/types";

interface Props {
  businesses: Business[];
  categoryId: string; // <— PRIMAŠ SLUG ILI ID
  categories: Category[];
}

export default function FilteredBusinesses({ businesses, categoryId, categories }: Props) {
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);

  // -----------------------------------------------------
  // 🔍 1) LOGOVI ZA PROVJERU
  // -----------------------------------------------------
  console.log("➡️ ALL BUSINESSES:", businesses);

  // -----------------------------------------------------
  // 🔍 2) Filtriraj biznise samo iz te kategorije (slug -> id)
  // -----------------------------------------------------
  const currentCategory = categories.find((c) => c.slug === categoryId);
  const categoryBusinesses = businesses.filter((b) =>
    b.categories?.some((c) => c.id === currentCategory?.id)
  );

  console.log("➡️ BUSINESSES FROM CATEGORY:", categoryBusinesses);

  // -----------------------------------------------------
  // 🔍 3) Jedinstveni tipovi iz biznisa u kategoriji
  // -----------------------------------------------------
  const uniqueTypes = Array.from(
    new Set(
      categoryBusinesses.flatMap((b) =>
        b.types ? b.types.map((t) => t.name) : []
      )
    )
  );

  console.log("➡️ UNIQUE TYPES IN THIS CATEGORY:", uniqueTypes);

  // -----------------------------------------------------
  // 🔍 4) Filtriranje po tipu
  // -----------------------------------------------------
  const filteredBusinesses = selectedType
    ? categoryBusinesses.filter((b) =>
        b.types?.some((t) => t.name === selectedType)
      )
    : categoryBusinesses;

  console.log("➡️ FILTERED BUSINESSES BY TYPE:", filteredBusinesses);

  // Otvoreno / zatvoreno helper
  function isOpenNow(workingHours?: string) {
    if (!workingHours) return false;
    const now = new Date();
    const [start, end] = workingHours.split("-");
    if (!start || !end) return false;

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    return nowMin >= startMin && nowMin <= endMin;
  }

  const visibleCards = filteredBusinesses.slice(visibleIndex, visibleIndex + 100);

  const total = filteredBusinesses.length;

  return (
    <div className="mt-10 text-black md:text-start text-center">

      {/* ————————————————————— */}
      {/* HEADER + STREVICE   */}
      {/* ————————————————————— */}
      <div className="md:flex items-center justify-between px-5 mb-4 flex">
        <h2 className="text-2xl font-bold">🌟 Preporučeno</h2>

        <div className="flex space-x-3" style={{ marginLeft: "auto" }}>
          <button
            onClick={() => {
              if (total === 0) return;
              setVisibleIndex((prev) => (prev - 4 + total) % total);
            }}
            className="bg-purple-600 p-2 rounded-full shadow hover:bg-purple-500 transition"
            disabled={total === 0}
          >
            <FaChevronLeft className="text-white" />
          </button>

          <button
            onClick={() => {
              if (total === 0) return;
              setVisibleIndex((prev) => (prev + 4) % total);
            }}
            className="bg-purple-600 p-2 rounded-full shadow hover:bg-purple-500 transition"
            disabled={total === 0}
          >
            <FaChevronRight className="text-white" />
          </button>
        </div>
      </div>

      {/* ————————————————————— */}
      {/* FILTER TIPOVA        */}
      {/* ————————————————————— */}
      {uniqueTypes.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => {
              setSelectedType(null);
              setVisibleIndex(0);
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              selectedType === null
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            } transition`}
          >
            Sve
          </button>

          {uniqueTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setVisibleIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                selectedType === type
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              } transition`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* ————————————————————— */}
      {/* GRID KARTICA (bez flip animacije) */}
      {/* ————————————————————— */}
      <div
        className="
          grid 
          md:grid-cols-3 gap-2 md:gap-3
          grid-cols-2
          overflow-x-auto md:overflow-visible 
          snap-x snap-mandatory
          scrollbar-hide
        "
      >
        {visibleCards.map((b) => {
          return (
            <div
              key={b.id}
              onClick={() => router.push(`/${b.slug}`)}
              className="cursor-pointer relative border border-gray-200 rounded-2xl snap-center"
            >
              <div className="relative w-full h-[35vh] md:h-[45vh] rounded-2xl overflow-hidden">
                <Image
                  src={
                    b.images?.[0] ??
                    "https://dummyimage.com/720x540"
                  }
                  alt={b.name}
                  fill
                  className="object-cover rounded-2xl"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4 text-white rounded-b-2xl">
                  <h3 className="text-[2vh] font-semibold">{b.name}</h3>

                  <div className="flex flex-wrap gap-1 text-[1.3vh] opacity-90">
                    {b.types?.map((t) => (
                      <span key={t.id} className="bg-white/20 px-2 py-0.5 rounded-full">
                        {t.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                      <MapPin className="w-4 h-4" />
                      {b.address}
                    </div>

                    <span
                      className={`text-[1.3vh] font-semibold ${
                        isOpenNow(b.workingHours)
                          ? "text-green-400"
                          : "text-red-500"
                      }`}
                    >
                      {isOpenNow(b.workingHours) ? "Open Now" : "Closed"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
