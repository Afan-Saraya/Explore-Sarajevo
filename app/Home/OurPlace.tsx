"use client";

export default function OurPlace() {
  return (
    <section className="w-full py-10 px-5 md:px-0 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Video u prvoj i drugoj koloni */}
        <div className="md:col-span-2 w-full h-[40vh] md:h-[60vh] relative rounded-lg overflow-hidden">
          <video
            src="/assets/video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
          />
        </div>

        {/* Tekst u trećoj koloni (rotirano, sa simetričnim marginama) */}
        <div className="flex flex-col justify-center bg-black md:mr-[20vh] md:mt-[40vh] md:ml-[-20vh] z-2 p-[2vh]">
          <h2 className="text-[4vh] md:text-[8vh] font-bold mb-4 text-white">
            Naše mjesto
          </h2>
          <p className="text-[2vh] md:text-[2vh] text-gray-300">
            U srcu Bosne i Hercegovine, okruženo planinama i prožeto duhom različitosti, nalazi se Sarajevo – grad u kojem se istok i zapad susreću u najljepšoj harmoniji. Ovo je mjesto gdje historija diše na svakom uglu, a moderna energija stvara nove priče svakog dana.  
          </p>
        </div>
      </div>
    </section>
  );
}
