"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, Search, User, X } from "lucide-react";
import MapSectionClient from "../Home/MapSectionClient"; // import tvoje komponente
import { Business } from "../lib/types";

export default function Navbar({ businesses }: { businesses: Business[] }) {
  const [isAtTop, setIsAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsAtTop(window.scrollY <= 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = () => {
    setModalOpen(true);
    setMenuOpen(false); // zatvori menu kad otvoriš modal
  };
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isAtTop ? "bg-transparent" : "bg-black/90 shadow-md"
        }`}
      >
        <div className="w-full flex items-center justify-between px-4 md:px-10 py-4">
          {/* Lijeva strana */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white flex items-center space-x-1 hover:text-gray-300 transition"
              >
                <Menu className="w-6 h-6" />
              </button>

              {menuOpen && (
                <div className="absolute top-10 left-0 bg-black/90 text-white rounded-xl shadow-lg py-2 w-44 border border-gray-700">
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-800 transition"
                  >
                    Home
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-800 transition"
                  >
                    Discover Sarajevo
                  </a>
                  <button
                    onClick={openModal}
                    className="w-full text-left px-4 py-2 hover:bg-gray-800 transition"
                  >
                    Map
                  </button>
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-800 transition"
                  >
                    Sign in
                  </a>
                </div>
              )}
            </div>

            {/* Logo */}
            <Image
              src="/assets/logosaraya-1.png"
              alt="Saraya Logo"
              width={150}
              height={50}
              className="object-contain cursor-pointer"
            />
          </div>

          {/* Desna strana – desktop */}
          <div className="hidden md:flex items-center space-x-10 text-white font-medium">
            <a href="#" className="hover:text-gray-300 transition">
              Home
            </a>
            <a href="#" className="hover:text-gray-300 transition">
              Discover Sarajevo
            </a>
            <button
              onClick={openModal}
              className="hover:text-gray-300 transition"
            >
              Map
            </button>
            <a
              href="#"
              className="hover:text-gray-300 transition border border-gray-400 px-4 py-1 rounded-full"
            >
              Sign in
            </a>
          </div>

          {/* Desna strana – mobilni */}
          <div className="md:hidden flex items-center space-x-4 text-white">
            <button aria-label="Search">
              <Search className="w-6 h-6" />
            </button>
            <button aria-label="User">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-auto bg-white rounded-2xl p-6">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
            <MapSectionClient businesses={businesses} />
          </div>
        </div>
      )}
    </>
  );
}
