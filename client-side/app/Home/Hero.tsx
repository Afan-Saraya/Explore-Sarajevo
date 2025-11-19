"use client";

import { motion } from "framer-motion";
import { Coffee, MapPin, Utensils, Camera, BedDouble, Bike, PartyPopper, ShieldPlus } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative w-full h-[55vh] flex flex-col items-center justify-center text-center overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/panoramaSarajevoDan.jpg')",
      }}
    >
      {/* Tamni overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Sadržaj */}
      <motion.div
        initial={{ opacity: 0, y: "3vh" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center text-white p-[2vh]"
      >
        {/* Logo */}
        <img
          src="/assets/exploreSarajevo-logo1.png"
          alt="Explore Sarajevo"
          className="w-[20vh] md:w-[30vh] h-auto mb-[2vh]"
        />

        {/* Tekst */}
        <p className="text-gray-200 text-[1.8vh] leading-[2.4vh] max-w-[90vw] mb-[3vh]">
          Otkrij duh Sarajeva — pronađi mjesta, kafiće i skrivene dragulje svuda oko sebe.
        </p>

        {/* Lista s ikonama */}
        <ul className="flex gap-[3vh] max-w-[90vw] text-white">
          <li className="flex flex-col items-center gap-[0.8vh] cursor-pointer hover:text-purple-400 transition">
            <Bike className="md:w-[3vh] w-[2.5vh]" />
            <span className="md:text-[1.5vh] text-[1vh]">Activities</span>
          </li>
          <li className="flex flex-col items-center gap-[0.8vh] cursor-pointer hover:text-purple-400 transition">
            <PartyPopper className="md:w-[3vh] w-[2.5vh]" />
            <span className="md:text-[1.5vh] text-[1vh]">Events</span>
          </li>
          <li className="flex flex-col items-center gap-[0.8vh] cursor-pointer hover:text-purple-400 transition">
            <Utensils className="md:w-[3vh] w-[2.5vh]" />
            <span className="md:text-[1.5vh] text-[1vh]">Food & Drinks</span>
          </li>
          <li className="flex flex-col items-center gap-[0.8vh] cursor-pointer hover:text-purple-400 transition">
            <BedDouble className="md:w-[3vh] w-[2.5vh]" />
            <span className="md:text-[1.5vh] text-[1vh]">Accommodation</span>
          </li>
          <li className="flex flex-col items-center gap-[0.8vh] cursor-pointer hover:text-purple-400 transition">
            <ShieldPlus className="md:w-[3vh] w-[2.5vh]" />
            <span className="md:text-[1.5vh] text-[1vh]">Health</span>
          </li>
        </ul>
      </motion.div>
    </section>
  );
}
