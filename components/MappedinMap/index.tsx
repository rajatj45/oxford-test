"use client";
import { BlockData } from "@/types/global";
import { useEffect, useRef, useState } from "react";
import {
  MapData,
  TGetMapDataOptions,
  getMapData,
} from "@mappedin/mappedin-js";
import Script from "next/script";
import ParkingMap from "../ParkingMap";

export default function MappedinMap({ data }: { data: BlockData }) {

  const [mapDataInstance, setMapDataInstance] = useState<MapData | null>(null)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isSearchEnabled = data?.enable_search?.includes("yes")
    if (!isSearchEnabled) {
      const hasTargetHash = window.location.hash === "#/" || window.location.href.includes("#/");
      const hasReloaded = sessionStorage.getItem("mappedin_reload");

      if (hasTargetHash && !hasReloaded) {
        sessionStorage.setItem("mappedin_reload", "true");
        window.location.reload();
        return
      }
    }

    if (isSearchEnabled) return;

    const pattern = "#/profile?location=";
    const { href, origin, pathname } = window.location;

    const parts = href.split(pattern);
    const isDuplicate = parts.length > 2;

    if (isDuplicate) {
      const hasFixed = sessionStorage.getItem("mappedin_map");
      if (hasFixed) return;

      const lastLocationId = parts[parts.length - 1];
      const cleanUrl = `${parts[0]}${pattern}${lastLocationId}`;

      sessionStorage.setItem("mappedin_map", "true");
      window.history.replaceState(null, '', cleanUrl);
      window.location.replace(cleanUrl); 
      window.location.reload();
      return;
    }

    return () => {
      if (typeof window !== "undefined" && !window.location.href.includes(pattern)) {
        sessionStorage.removeItem("mappedin_map");
        sessionStorage.removeItem("mappedin_reload");
      }
    };
  }, [data?.enable_search]);

  useEffect(() => {
    let isMounted = true;
    const initMap = async () => {
      const options: TGetMapDataOptions = {
        key: process.env.NEXT_PUBLIC_MAPPEDIN_KEY!,
        secret: process.env.NEXT_PUBLIC_MAPPEDIN_SECRET!,
        mapId: process.env.NEXT_PUBLIC_MAPPEDIN_MAP_ID!,
      };

      const mapData: MapData = await getMapData(options);
      if (isMounted) setMapDataInstance(mapData);
    }
    if (!data.enable_search?.includes("yes")) {
      initMap();
    }

    return () => { isMounted = false; };
  },[data.enable_search]);

    const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,
    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;

  if (data.enable_search?.includes("yes")) {
    return <ParkingMap data={data} />;
  }

  return (
    <>
    <div  className="
        md:pt-(--spaceTop)
      md:pb-(--spaceBottom)
      pb-(--spaceBottomMobile)
      pt-(--spaceTopMobile)"
      style={spacingStyles}>
      <div className={`${data.section_layout}`}
        style={{ height: "600px"}}>
        <Script id="mappedin" type="text/javascript">
        {`
              window.mappedin = {
                miKey: {
                  id: "${process.env.NEXT_PUBLIC_MAPPEDIN_KEY}",
                  key: "${process.env.NEXT_PUBLIC_MAPPEDIN_SECRET}",
                },
                venue: "${process.env.NEXT_PUBLIC_MAPPEDIN_MAP_ID}",
              };
            `}
        </Script>

        <Script
          type="module"
          src={`https://cdn.mappedin.com/web2/release/mappedin-web.js?venue=${process.env.NEXT_PUBLIC_MAPPEDIN_MAP_ID}`}
          id="mappedin-web"
          defer
        ></Script>

        <div
          id="mappedin-map"
          style={{ height: "100%", width: "100%" }}
        ></div>
      </div>
      </div>
    </>
  );
}