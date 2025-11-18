"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Business } from "../../lib/types";
import Image from "next/image";
import { MapPin } from "lucide-react";

interface Props {
  categories: Category[];
  categoryId: string;
  businesses: Business[];
}

export default function Hero({ categories, categoryId, businesses }: Props) {
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Simulacija loading state
  useEffect(() => {
    if (categories.length > 0) {
      setTimeout(() => setLoading(false), 700);
    }
  }, [categories]);

  // Rotacija featured biznisa
  useEffect(() => {
    if (businesses.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [businesses]);

  if (loading || !categories || categories.length === 0) {
    return (
      <section className="relative flex justify-center items-center w-full bg-white pt-2 overflow-hidden">
        <div className="relative w-full max-w-7xl h-[25rem] grid md:grid-cols-3 gap-4 animate-pulse">
          <div className="relative md:col-span-2 h-full overflow-hidden rounded-2xl bg-gray-200"></div>
          <div className="absolute md:relative top-0 right-0 w-[15rem] h-[15rem] md:w-full md:h-full md:col-span-1 rounded-lg overflow-hidden bg-gray-200 z-20 shadow-lg"></div>
        </div>
      </section>
    );
  }

  // 🔹 1. Pronađi kategoriju po slug-u
  const currentCategory = categories.find((cat) => cat.slug === categoryId);
  const currentCategoryId = currentCategory?.id;

  // 🔹 2. Filtriraj samo biznise koji:
  //    - imaju featuredBusiness === true
  //    - pripadaju trenutnoj kategoriji
  const featuredOnly = businesses.filter((b) => {
    const inCategory =
      b.categories &&
      Array.isArray(b.categories) &&
      b.categories.some((cat) => cat.id === currentCategoryId);
    return b.featuredBusiness === true && inCategory;
  });

  // Podjela featured biznisa na parne i neparne
  const evenFeatured = featuredOnly.filter((_, i) => i % 2 === 0);
  const oddFeatured = featuredOnly.filter((_, i) => i % 2 !== 0);

  const evenIndex = evenFeatured.length > 0 ? index % evenFeatured.length : 0;
  const oddIndex = oddFeatured.length > 0 ? index % oddFeatured.length : 0;

  const featuredEven = evenFeatured[evenIndex];
  const featuredOdd = oddFeatured[oddIndex];

  // Funkcija za otvoreno/zatvoreno
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

  const featuredEvenContent = featuredEven
    ? featuredEven
    : {
        id: "placeholder-even",
        images: "https://placehold.co/1000x500/000/fff?text=Featured+Even",
        name: "Featured Even",
        text: "",
        categories: [],
        address: "",
        workingHours: "",
      };

  const featuredOddContent = featuredOdd
    ? featuredOdd
    : {
        id: "placeholder-odd",
        images: "https://placehold.co/1000x500/000/fff?text=Featured+Odd",
        name: "Featured Odd",
        text: "",
        categories: [],
        address: "",
        workingHours: "",
      };

  // Fiksna kategorija (prvi red, druga kolona)
  const categoryContent = currentCategory
    ? {
        key: `category-${currentCategory.id}`,
        image:
          currentCategory.image ||
          "https://placehold.co/500x500/000/fff?text=Category",
        name: currentCategory.name,
        text: currentCategory.text || "",
      }
    : {
        key: `placeholder-category`,
        image: "https://placehold.co/500x500/000/fff?text=Category",
        name: "Category",
        text: "",
      };

  return (
    <section className="relative mt-15 flex flex-col justify-center items-center w-full bg-white pt-2 overflow-hidden space-y-2">
      {/* PRVI RED — Parni featured (lijevo) + kategorija (desno) */}
      <div className="relative w-full max-w-7xl grid grid-cols-2 md:grid-cols-3 gap-1 h-[13rem] md:h-[25rem] rounded-2xl overflow-hidden">
        {/* Lijevo — Parni featured */}
        <div className="relative col-span-1 md:col-span-2 h-full overflow-hidden rounded-l-2xl md:rounded-l-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={featuredEvenContent.id}
              initial={{ x: 1000, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -1000, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={
                  (featuredEvenContent.images &&
                    Array.isArray(featuredEvenContent.images) &&
                    featuredEvenContent.images[0]) ||
                  featuredEvenContent.images
                }
                alt={featuredEvenContent.name}
                fill
                className="object-cover w-full h-full rounded-l-2xl md:rounded-l-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/80 to-transparent p-4 flex flex-col gap-2 text-white rounded-b-2xl">
                <h3 className="text-[2vh] font-semibold">
                  {featuredEvenContent.name}
                </h3>
                <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                  {featuredEvenContent.categories
                    ?.map((c) => c.name)
                    .join(", ")}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                    <MapPin className="w-4 h-4" />
                    <span>{featuredEvenContent.address}</span>
                  </div>
                  <span
                    className={`text-[1.3vh] font-semibold ${
                      isOpenNow(featuredEvenContent.workingHours)
                        ? "text-green-400"
                        : "text-red-500"
                    }`}
                  >
                    {isOpenNow(featuredEvenContent.workingHours)
                      ? "Open Now"
                      : "Closed Now"}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desno — fiksna kategorija */}
        <div className="relative overflow-hidden shadow-lg col-span-1 h-full rounded-r-2xl md:rounded-r-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={categoryContent.key}
              initial={{ x: 1000, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -1000, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${categoryContent.image}')`,
              } as React.CSSProperties}
            >
              <div className="bg-black/40 h-full flex flex-col justify-end px-6 md:px-8 text-white pb-6">
                <h1 className="text-2xl md:text-4xl font-bold mb-3 drop-shadow-md">
                  {categoryContent.name}
                </h1>
                <p className="text-sm md:text-lg text-gray-200 italic max-w-2xl">
                  {categoryContent.text}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* DRUGI RED — Neparni featured (puna širina) */}
      <div className="relative w-full max-w-7xl h-[13rem] md:h-[25rem] overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={featuredOddContent.id}
            initial={{ x: 1000, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -1000, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={
                (featuredOddContent.images &&
                  Array.isArray(featuredOddContent.images) &&
                  featuredOddContent.images[0]) ||
                featuredOddContent.images
              }
              alt={featuredOddContent.name}
              fill
              className="object-cover w-full h-full rounded-2xl"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/80 to-transparent p-4 flex flex-col gap-2 text-white rounded-b-2xl">
              <h3 className="text-[2vh] font-semibold">
                {featuredOddContent.name}
              </h3>
              <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                {featuredOddContent.categories
                  ?.map((c) => c.name)
                  .join(", ")}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[1.3vh] opacity-90">
                  <MapPin className="w-4 h-4" />
                  <span>{featuredOddContent.address}</span>
                </div>
                <span
                  className={`text-[1.3vh] font-semibold ${
                    isOpenNow(featuredOddContent.workingHours)
                      ? "text-green-400"
                      : "text-red-500"
                  }`}
                >
                  {isOpenNow(featuredOddContent.workingHours)
                    ? "Open Now"
                    : "Closed Now"}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
