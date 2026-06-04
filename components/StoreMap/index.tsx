"use client";
import { useEffect, useRef } from "react";
import {
  MapData,
  MapView,
  TGetMapDataOptions,
  getMapData,
  show3dMap,
} from "@mappedin/mappedin-js";

export default function StoreMap({ externalId }: { externalId?: string }) {
  const mapContainer = useRef(null);
  useEffect(() => {
    const initMap = async () => {
      if (mapContainer.current) {
        const options: TGetMapDataOptions = {
          key: process.env.NEXT_PUBLIC_MAPPEDIN_KEY!,
          secret: process.env.NEXT_PUBLIC_MAPPEDIN_SECRET!,
          mapId: process.env.NEXT_PUBLIC_MAPPEDIN_MAP_ID!,
        };

        try {
          const mapData: MapData = await getMapData(options);
          const mapView: MapView = await show3dMap(
            mapContainer.current,
            mapData,
          );

          mapData.getByType("space").forEach((space) => {
            if (space.externalId === externalId) {
              if (space.floor) {
                mapView.setFloor(space.floor);
              }

              mapView.Labels.add(space, space.name, {
                interactive: true,
                rank: "always-visible",
                appearance: {
                  textColor: "#a41a1a",
                  textSize: 20,
                },
              });

              mapView.Camera.focusOn(space, {
                minZoomLevel: 7,
                maxZoomLevel: 18,
                duration: 1500,
              });
            }
          });
        } catch (error) {
          console.error("Error initializing Mappedin map:", error);
        } finally {
        }
      }
    };

    initMap();

    return () => {};
  }, []);

  return (
    <>
      <div
        id="mappedin-map"
        ref={mapContainer}
        className="h-[380px]! xm:h-[500px]! md:h-[490px]!"



      ></div>
    </>
  );
}