"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMapData, MapData } from "@mappedin/mappedin-js";

const MappedinContext = createContext<MapData | null>(null);

export function MappedinProvider({ children }: { children: React.ReactNode; }) {
  const [mapData, setMapData] = useState<MapData | null>(null);

  useEffect(() => {
    let mounted = true;

    getMapData({
      key: process.env.NEXT_PUBLIC_MAPPEDIN_KEY!,
      secret: process.env.NEXT_PUBLIC_MAPPEDIN_SECRET!,
      mapId: process.env.NEXT_PUBLIC_MAPPEDIN_MAP_ID!,
    }).then((data) => {
      if (mounted) setMapData(data);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <MappedinContext.Provider value={mapData}>
      {children}
    </MappedinContext.Provider>
  );
}

export const useMappedin = () => useContext(MappedinContext);
