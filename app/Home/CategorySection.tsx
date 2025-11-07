"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Category } from "../lib/types";

interface Props {
  categories: Category[];
}

export default function CategorySection({ categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = selectedCategory
    ? categories.filter((cat) => cat.slug === selectedCategory)
    : categories;

  return (
    <div
      className="
        grid 
        grid-cols-2
        auto-rows-[10vh]
        gap-1
        md:grid-cols-3 md:gap-2 md:auto-rows-[25vh]
      "
    >
      {filteredCategories.map((cat, index) => {
        const positionInGroup = index % 5;
        const isTall = positionInGroup === 0;

        return (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className={`
              relative overflow-hidden rounded-2xl border border-gray-200
              hover:scale-[1.02] hover:shadow-xl transition-all
              ${isTall ? "row-span-2" : "row-span-1"}
              md:row-span-1 md:col-span-1
              ${positionInGroup === 0 ? "md:col-span-2" : ""}
            `}
          >
            {/* Slika */}
            <Image
              src={cat.coverImage || "https://dummyimage.com/720x540"}
              alt={cat.name}
              fill
              className="object-cover"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Tekst u sredini */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
              <h3 className="text-2xl md:text-3xl font-semibold mb-2">
                {cat.name}
              </h3>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
