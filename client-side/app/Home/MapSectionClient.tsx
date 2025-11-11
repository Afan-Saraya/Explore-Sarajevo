"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Business } from "../lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

function MapSectionClient({ businesses }: { businesses: Business[] }) {
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [MapComponents, setMapComponents] = useState<any>(null);

  // ✅ Dinamički import Leafleta
  useEffect(() => {
    (async () => {
      const L = await import("leaflet");
      const { MapContainer, TileLayer, Marker, Popup, useMap } = await import("react-leaflet");

      const defaultIcon = new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -35],
      });

      const ChangeView = ({ coords }: { coords: [number, number] }) => {
        const map = useMap();
        map.setView(coords, 17, { animate: true }); // 🔍 veći zoom
        return null;
      };

      setMapComponents({
        MapContainer,
        TileLayer,
        Marker,
        Popup,
        ChangeView,
        defaultIcon,
      });
    })();
  }, []);

  // ✅ Disable scroll kad je sidebar otvoren
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuOpen]);

  if (!MapComponents) {
    return (
      <div className="w-full flex justify-center items-center py-32 text-gray-500">
        Učitavanje mape...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, ChangeView, defaultIcon } = MapComponents;

  const initial = [43.8563, 18.4131] as [number, number];
  const coords = selected || initial;

  // ✅ Izvuci jedinstvene kategorije iz biznisa
  const uniqueCategories = Array.from(new Set(businesses.map((b) => b.categoryId)));

  // ✅ Filtrirani biznisi
  const filteredBusinesses = activeCategory
    ? businesses.filter((b) => b.categoryId === activeCategory)
    : businesses;

  return (
    <>
      <section className="relative flex flex-col items-center mt-[6vh] overflow-hidden">
        <div className="max-w-2xl mb-20 mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white-900 mb-4 tracking-tight uppercase">
            Istražite interesovanja na mapi Sarajeva
          </h2>
          <p className="text-white-700 text-lg md:text-xl">
            Pregledajte lokalne firme, restorane i servise u vašoj blizini.
            Filtrirajte po kategorijama i pronađite tačno ono što tražite.
          </p>
        </div>

        {/* ✅ Slika u donjem desnom uglu */}
        <img
          src="/assets/arrayDekoracija.png" // zamijeni sa svojom putanjom
          alt="Dekoracija"
          className="absolute bottom-0 right-6 w-[180px] md:w-[260px] h-auto object-contain z-0 pointer-events-none select-none"
        />
      </section>

      <section className="relative w-full h-[60vh] rounded-2xl overflow-hidden">
        {/* Mapa */}
        <MapContainer
          center={coords}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full z-10"
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          />
          <ChangeView coords={coords} />

          {filteredBusinesses.map((biz) => {
            const loc = biz.location.split(",").map(Number) as [number, number];
            return (
              <Marker
                key={biz.id}
                position={loc}
                icon={defaultIcon}
                eventHandlers={{
                  click: () => setSelected(loc),
                }}
              >
                <Popup>
                  <strong>{biz.name}</strong>
                  <br />
                  {biz.description}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Burger dugme */}
        <button
          onClick={() => setMenuOpen(true)}
          className="absolute top-5 right-5 z-30 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-md transition"
        >
          <Menu className="text-gray-800 w-6 h-6" />
        </button>

        {/* Sidebar */}
        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
              />

              {/* Glavni sidebar */}
              <motion.div
                className="fixed top-0 right-0 w-[85%] sm:w-[400px] h-full bg-white shadow-2xl z-30 flex flex-col p-6 overflow-hidden"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Biznisi na mapi</h2>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                {/* Filter kategorije */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition ${!activeCategory
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                  >
                    Sve
                  </button>
                  {uniqueCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition ${activeCategory === cat
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Lista biznisa */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {filteredBusinesses.map((biz) => {
                    const loc = biz.location.split(",").map(Number) as [number, number];
                    const active =
                      selected?.[0] === loc[0] && selected?.[1] === loc[1];

                    return (
                      <motion.button
                        key={biz.id}
                        onClick={() => {
                          setSelected(loc);
                          setMenuOpen(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${active
                          ? "bg-purple-100 border-purple-400 shadow-md"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        <img
                          src={biz.images?.[0] || "/assets/no-image.jpg"}
                          alt={biz.name}
                          className="w-16 h-16 object-cover rounded-xl shadow-sm"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="text-base font-semibold text-gray-800">
                              {biz.name}
                            </h3>
                            <span className="text-xs text-gray-500">⭐ {biz.rating}</span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                            {biz.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{biz.address}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}

export default dynamic(() => Promise.resolve(MapSectionClient), { ssr: false });
