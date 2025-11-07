"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Business } from "../lib/types";

interface Props {
  businesses: Business[];
}

export default function CategorySection({ businesses }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = selectedCategory
    ? businesses.filter((cat) => cat.slug === selectedCategory)
    : businesses;

  return (
    <div className="mt-5 text-black md:text-start text-center">
      <h5 className="p-5 font-bold text-[5vh]">Preporučujemo</h5>

      {/* Filter dugmad */}
      {businesses.length > 1 && (
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

          {businesses.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                selectedCategory === cat.slug
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              } transition`}
            >
              {cat.categoryId}
            </button>
          ))}
        </div>
      )}

      {/* Grid kategorija */}
      <div
        className="
          grid 
          md:grid-cols-3 gap-10 
          grid-cols-2 overflow-x-auto md:overflow-visible 
          snap-x snap-mandatory
          scrollbar-hide
        "
      >
        {filteredCategories.map((cat, index) => {
          const pairIndex = Math.floor(index / 2);
          const isEvenRow = pairIndex % 2 === 0;
          const isWide =
            (isEvenRow && index % 2 === 0) ||
            (!isEvenRow && index % 2 === 1);

          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className={`
                relative flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all hover:scale-[1.02]
                ${isWide ? "md:col-span-2 md:flex-row" : "md:col-span-1"}
                snap-center
              `}
            >
              {/* Slika */}
              <div
                className={`relative ${
                  isWide ? "md:w-2/3" : "h-auto"
                } aspect-[16/10]`}
              >
                <Image
                  src={cat.images[0] || "https://dummyimage.com/720x540"}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Tekst */}
              <div
                className={`relative p-6 flex flex-col justify-center ${
                  isWide ? "md:w-1/3" : ""
                }`}
              >
                <h3 className="text-xl font-semibold text-black mb-2">
                  {cat.name}
                </h3>
                <p className="text-gray-700 mb-3">{cat.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
