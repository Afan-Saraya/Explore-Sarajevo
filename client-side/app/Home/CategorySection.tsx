"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Category } from "../lib/types";
import { Utensils, BedDouble, ShieldPlus, PartyPopper, Bike } from "lucide-react";

interface Props {
  categories: Category[];
}

/**
 * Interaktivni grid layout s dinamičnim rasporedom, ikonicama i zaštitom od "praznih redova".
 */
export default function CategorySection({ categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = selectedCategory
    ? categories.filter((cat) => cat.slug === selectedCategory)
    : categories;

  // helper za ikone na osnovu kategorije
  const getIcon = (slug: string) => {
    switch (slug) {
      case "accommodation":
        return <BedDouble className="w-7 h-7 mb-2 text-white/90" />;
      case "health":
        return <ShieldPlus className="w-7 h-7 mb-2 text-white/90" />;
      case "food-drink":
        return <Utensils className="w-7 h-7 mb-2 text-white/90" />;
      case "events":
        return <PartyPopper className="w-7 h-7 mb-2 text-white/90" />;
      default:
        return <Bike className="w-7 h-7 mb-2 text-white/90" />;
    }
  };

  return (
    <div
      className="
        grid 
        grid-cols-2
        gap-1
        auto-rows-[18vh]
        md:grid-cols-3
        md:gap-3
        md:auto-rows-[30vh]
        lg:auto-rows-[32vh]
      "
    >
      {filteredCategories.map((cat, index) => {
        const pattern = index % 6;

        // dinamični layout pattern
        let layoutClass =
          pattern === 0
            ? "md:col-span-2 md:row-span-2"
            : pattern === 1
            ? "md:col-span-1 md:row-span-1"
            : pattern === 2
            ? "md:col-span-1 md:row-span-2"
            : pattern === 3
            ? "md:col-span-2 md:row-span-1"
            : pattern === 4
            ? "md:col-span-1 md:row-span-1"
            : "md:col-span-1 md:row-span-1";

        // ako bi zadnji element ostao sam u redu — širi ga
        const isLastOdd =
          filteredCategories.length % 2 !== 0 &&
          index === filteredCategories.length - 1;

        if (isLastOdd) {
          layoutClass = "col-span-2 md:col-span-3";
        }

        return (
          <Link
            key={`category-${cat.id}-${index}`}
            href={`/${cat.slug}`} // ✅ vodi na /[idCategory]/page.tsx
            className={`
              relative overflow-hidden rounded-2xl border border-gray-200
              hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 ease-out
              ${layoutClass}
            `}
          >
            {/* Slika pozadine */}
            <Image
              src={cat.coverImage || "https://dummyimage.com/720x540"}
              alt={cat.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover rounded-2xl"
            />

            {/* Tamni overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

            {/* Središnji tekst + ikonica */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
              {cat.icon ? (
                <Image
                  src={cat.icon}
                  alt={`${cat.name} icon`}
                  width={32}
                  height={32}
                  className="mb-2 opacity-90"
                />
              ) : (
                getIcon(cat.slug)
              )}

              <h3 className="text-lg md:text-2xl font-semibold mb-1 drop-shadow-md tracking-wide">
                {cat.name}
              </h3>

              {cat.description && (
                <p className="hidden md:block text-sm opacity-90 max-w-sm">
                  {cat.description.length > 80
                    ? cat.description.slice(0, 80) + "..."
                    : cat.description}
                </p>
              )}
            </div>

            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20" />
          </Link>
        );
      })}
    </div>
  );
}
