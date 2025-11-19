"use client";

import { Map, Marker } from "pigeon-maps";
import { Business } from "../lib/types";

interface Props {
  id: string;               // slug iz URL-a
  businesses: Business[];   // lista svih biznisa
}

export default function BusinessMap({ id, businesses }: Props) {
  const business = businesses.find((b) => b.slug === id);

  if (!business || !business.location) {
    return (
      <div className="text-center py-10 text-gray-600">
        Business location not available.
      </div>
    );
  }

  // Parsiraj lokaciju "lat,lng"
  const [latStr, lngStr] = business.location.split(",");
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  // Custom marker: ljubičasta boja
  const markerColor = "#8b5cf6"; // Tailwind violet-500

  return (
    <div className="w-full h-[40vh] rounded-2xl overflow-hidden">
      <Map
        height={400}               // 40vh
        defaultCenter={[lat, lng]}
        defaultZoom={15}
        width={undefined}          // ne koristimo window.innerWidth
      >
        <Marker
          width={50}
          anchor={[lat, lng]}
          color={markerColor}
        />
      </Map>
    </div>
  );
}
