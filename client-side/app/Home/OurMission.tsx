"use client";

import Image from "next/image";

export default function OurMission() {
  return (
    <section className="w-full py-10 px-5 md:px-0 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Tekst u prvoj koloni */}
        <div className="flex flex-col justify-center bg-black md:ml-[20vh] md:mt-[40vh] md:mr-[-20vh] z-2 p-[4vh]">
          <h2 className="text-[4vh] md:text-[3.5vh] font-bold mb-4">Naša Misija</h2>
          <p className="text-[2vh] md:text-[2vh] text-white-700">
            Naša misija je pružiti najbolju uslugu i kvalitetu našim klijentima, 
            stvarajući dugoročne vrijednosti i održive inovacije u svakoj oblasti našeg djelovanja.
          </p>
        </div>

        {/* Slika u drugoj i trećoj koloni */}
        <div className="md:col-span-2 w-full h-[40vh] md:h-[60vh] relative rounded-lg overflow-hidden">
          <Image
            src="/assets/carsija.jpg"
            alt="Naša misija"
            fill
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}
