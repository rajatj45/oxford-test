"use client";
import { useEffect, useMemo, useState } from "react";
import { BlockData } from "@/types/global";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import DOMPurify from "dompurify";
import Image from "next/image";
import { LatLng, RouteData, StartLocation } from "@/types/global";
import { pushCardsToDataLayer,getAbsoluteUrl, getManeuverIcon } from "@/utils/utility";
import Link from "next/link";

export type DirectionsMapProps = {
  destination?: LatLng;
  initialMode?: "DRIVE" | "TRANSIT";
  panelWidthClass?: string;
};

interface GooglePlace {
  id: string;
  displayName: {
    text: string;
    languageCode?: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
}

interface Waypoint {
  location: {
    latLng: LatLng;
  };
}
interface RoutesRequestBody {
  origin: Waypoint;
  destination: Waypoint;
  travelMode: "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT";
  departureTime?: {
    seconds: number;
  };
  transitPreferences?: {
    routingPreference: "FEWER_TRANSFERS" | "LESS_WALKING";
  };
}


interface SelectedLocations {
  latitude: string;
  longitude: string;
  locName: string;
};

const GOOGLE_MAPS_API_KEY = process.env
  .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string | undefined;

export default function DirectionsMap({
  data,
  // destination = DESTINATION,
  initialMode = "DRIVE",
  panelWidthClass = "1xl:w-[400px] lg:w-[450px] 2xl:w-[544px] xs:w-full ",
}: DirectionsMapProps & { data: BlockData }) {

  const selectedPlaces: SelectedLocations[] = useMemo(() => {
    try {
      return data?.selected_places
        ? JSON.parse(data.selected_places)
        : [];
    } catch {
      return [];
    }
  }, [data?.selected_places]);


  const mapPlacesToStartLocations = (places: SelectedLocations[]): StartLocation[] =>
    places.map((p, index) => ({
      id: `${p.locName}-${index}`,
      label: p.locName,
      coords: {
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
      },
      nearestGate: "Main Terminal",
    }));

    const initialLocations = useMemo(() => {
      return selectedPlaces.length > 0 ? mapPlacesToStartLocations(selectedPlaces) : [];
    }, [selectedPlaces]);

  const destination = useMemo(() => ({
    latitude: Number(data?.destination_lat) || 43.5931,
    longitude: Number(data?.destination_lng) || -79.6417,
  }), [data?.destination_lat, data?.destination_lng]);

  const [startLocations, setStartLocations] = useState<StartLocation[]>(initialLocations);
  const [selected, setSelected] = useState<StartLocation | null>(initialLocations[0] ?? null);
  const [allRouteData, setAllRouteData] = useState<Record<string, RouteData>>(
    {},
  );
  const [travelMode, setTravelMode] = useState<"DRIVE" | "TRANSIT">(
    initialMode,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GooglePlace[]>([]);

  useEffect(() => {

    if (selectedPlaces.length > 0) {
      queueMicrotask(() => {
        setStartLocations(initialLocations);
        setSelected(initialLocations[0] ?? null);
        setError(null);
      });
      return; 
    }

    const fetchNearbyAirports = async () => {
      try {
        const response = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            includedTypes: ["airport"],
            maxResultCount: 4,
            locationRestriction: {
              circle: {
                center: {
                  latitude: destination.latitude,
                  longitude: destination.longitude,
                },
                radius: 50000.0,
              },
            },
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          console.error("Places error", response.status, data);
          setError(data?.error?.message || "Failed to fetch nearby airports");
          return;
        }
        if (data?.places?.length > 0) {
          const dynamicLocations: StartLocation[] = data.places.map(
            (p: GooglePlace) => ({
              id: p.id,
              label: p.displayName.text,
              coords: {
                latitude: p.location.latitude,
                longitude: p.location.longitude,
              },
              nearestGate: "Main Terminal",
            }),
          );
          setStartLocations(dynamicLocations);
          setSelected(dynamicLocations[0]);
        } else {
          setStartLocations([]);
          setSelected(null);
          setError(null);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to fetch nearby airports");
      }
    };
    fetchNearbyAirports();
  }, [selectedPlaces, destination.latitude, destination.longitude, initialLocations]);

  useEffect(() => {
    if (startLocations.length === 0) return;
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      const results: Record<string, RouteData> = {};

      await Promise.all(
        startLocations.map(async (loc) => {
          try {
            const body: RoutesRequestBody = {
              origin: { location: { latLng: loc.coords } },
              destination: { location: { latLng: destination } },
              travelMode,
              ...(travelMode === "TRANSIT" && {
                departureTime: { seconds: Math.floor(Date.now() / 1000) },
                transitPreferences: { routingPreference: "FEWER_TRANSFERS" },
              }),
            };
            const response = await fetch("/api/routes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            const data = await response.json();
            if (data?.routes?.[0]) {
              results[loc.id] = data.routes[0];
            } else if (!response.ok) {
              console.error("Routes error", response.status, data);
            }
          } catch (err) {
            console.error(`Route Error for ${loc.label}:`, err);
          }
        }),
      );
      setAllRouteData(results);
      setLoading(false);
    };
    fetchAllData();
  }, [startLocations, travelMode, destination]);

  const gmapsTravelMode = travelMode === "DRIVE" ? "driving" : "transit";
  const parentSectionTitle = data?.section_title;

  const memoizedDisclaimer = useMemo(() => {
    return (
      <div className="p-4 mt-6 flex flex-col gap-2 border border-(--border-gray-light)">
        <span className="font-bold">Disclaimer</span>
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: data?.content || "" }}
        />
      </div>
    );
  }, [data?.content]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 3) return;

    try {
      const response = await fetch("/api/searchPlaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textQuery: query,
          locationBias: {
            circle: {
              center: {
                latitude: destination.latitude,
                longitude: destination.longitude,
              },
              radius: 50000.0,
            },
          },
        }),
      });

      const data = await response.json();

      if (data.places) {
        setSearchResults(data.places);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search Error:", err);
    }
  };

  const addPlaceToList = (place: GooglePlace) => {
    const newLocation = {
      id: place.id,
      label: place.displayName.text,
      coords: {
        latitude: place.location.latitude,
        longitude: place.location.longitude,
      },
      nearestGate: "Main Terminal",
    };

    // setStartLocations((prev) => {
    //   const originalAirports = prev.filter(loc => loc.nearestGate !== "Main Terminal");
    //   return [newLocation, ...originalAirports];
    // });
    setStartLocations((prev) => {
      if (prev.find(loc => loc.id === newLocation.id)) return prev;
      return [newLocation, ...prev];
    });

    setSelected(newLocation);
    setSearchQuery("");
    setSearchResults([]);
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["geometry"]}>
      <div className="container">
        <div className="flex w-full flex-wrap md:gap-5 lg:gap-10 2xl:gap-20 bg-white text-black font-sans overflow-hidden spacing-t-80">
          <div
            className={`${panelWidthClass}  bg-white   overflow-y-auto z-10`}
          >
            <h2 className="text-4xl font-serif mb-3 tracking-tighter leading-[50px]">
              {data?.section_title}
            </h2>
            <div
              className=" text-(--primary-text) text-lg! font-light mb-6 "

              dangerouslySetInnerHTML={{
                __html: data?.section_subTitle || "",
              }}
            />

            <div className="my-6">
              <div className="grid xs:grid-cols-1 xm:grid-cols-2 w-full gap-2.5">
                <button
                  onClick={(e) => {
                    setTravelMode("DRIVE");
                    pushCardsToDataLayer(
                      e.currentTarget as HTMLElement,
                      e.type || "click",
                    );
                  }}
                  data-clickeventname="get_directions"
                  data-title="Car"
                  data-index=""
                  data-eventcategory={data?.section_title}
                  data-tag={data?.section_title}
                  className={`flex items-center px-[7px] cursor-pointer gap-3.5 border border-(--border-gray-light) justify-center w-full py-3 text-base md:text-lg font-normal  transition-all
                    ${
                      travelMode === "DRIVE"
                        ? "bg-[#1a1a1a] text-white "
                        : "text-(--primary) hover:text-black "
                    }`}
                >
                  <i className="icon-car-icon"></i> <span>Car</span>
                </button>

                <button
                  onClick={(e) => {
                    setTravelMode("TRANSIT");
                    pushCardsToDataLayer(
                      e.currentTarget as HTMLElement,
                      e.type || "click",
                    );
                  }}
                  data-clickeventname="get_directions"
                  data-title="Public Transportation"
                  data-index=""
                  data-eventcategory={data?.section_title}
                  data-tag={data?.section_title}
                  className={`flex items-center px-[7px] cursor-pointer gap-3.5 border border-(--border-gray-light) justify-center w-full py-3 text-base md:text-lg font-normal  transition-all
                    ${
                      travelMode === "TRANSIT"
                        ? "bg-[#1a1a1a] text-white "
                        : "hover:text-black"
                    }`}
                >
                  <i className="icon-bus-icon"></i>
                  <span>Public Transportation</span>
                </button>
              </div>
            </div>

            {googleMapsUrl && (
              <div className="relative mb-6" >
                <Link 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center px-[7px] cursor-pointer gap-3.5 border border-(--border-gray-light) justify-center w-full py-3 text-base md:text-lg font-normal  transition-all bg-[#1a1a1a] text-white no-underline"
                > {data?.map_cta ? data.map_cta : "Map"} </Link>
              </div>
            )}
            <div className="relative mb-6 hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for any starting point..."
              className="w-full p-3 border  border-(--border-gray-light) "
            />
            {searchResults.length > 0 && (
              <ul className="absolute ml-0 z-10 w-full bg-white border border-gray-200 mt-1 shadow-lg max-h-60 overflow-auto">
                {searchResults.map((result:GooglePlace, index) => (
                  <li
                    key={index}
                    onClick={() => addPlaceToList(result)}
                    className="p-3 hover:bg-gray-100 border-(--border-gray-light) py-4 border-b my-0  text-(--dark-heading) tex-base cursor-pointer "
                  >
                    {result.displayName.text}
                  </li>
                ))}
              </ul>
            )}
          </div>

            <div className="space-y-4 flex flex-col gap-8 md:gap-6">
              {startLocations.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  Searching for nearby airports...
                </p>
              ) : (
                startLocations.map((loc) => {
                  const data = allRouteData[loc.id];
                  const isActive = selected?.id === loc.id;
                  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${loc.coords.latitude},${loc.coords.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=${gmapsTravelMode}`;

                  return (
                    <div
                      key={loc.id}
                      onClick={(e) => {
                        setSelected(loc);
                        pushCardsToDataLayer(
                          e.currentTarget as HTMLElement,
                          e.type || "click",
                        );
                      }}
                      data-clickeventname="get_directions"
                      data-title={loc.label}
                      data-index={getAbsoluteUrl(`${loc.id}`)}
                      data-eventcategory={parentSectionTitle}
                      data-tag={parentSectionTitle}
                      className={`p-4 border mb-0 transition-all hover:bg-(--border-gray-hover)  cursor-pointer group ${
                        isActive
                          ? "bg-(--border-gray-light) hover:bg-(--border-gray-light) border-(--border-gray-light) [&_span]:text-(--dark-heading)"
                          : "bg-white border-gray-100 hover:border-gray-300 text-black"
                      }`}
                    >
                      <div className="flex justify-between gap-2.5 items-center ">
                        <span
                          className={`xs:text-[20px] sm:text-[28px] lg:text-[24px] text-black leading-normal ${
                            isActive ? "font-light" : "font-light"
                          }`}
                        >
                          {loc.label}
                        </span>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            pushCardsToDataLayer(
                              e.currentTarget as HTMLElement,
                              e.type || "click",
                            );
                          }}
                          data-clickeventname="get_directions"
                          data-title={loc.label}
                          data-index={getAbsoluteUrl(mapsUrl)}
                          data-eventcategory={parentSectionTitle}
                          data-tag={parentSectionTitle}
                          className="text-blue-500 text-xl w-12 h-12 flex-col flex items-center
                           justify-center shrink-0 transition-transform border border-(--border-gray-light)"
                        >
                          <Image
                            alt="location icon"
                            width={18}
                            height={25}
                            src={"/images/google-map.svg"}
                          />
                        </a>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-(--border-gray-light) [&_span]:text-sm font-light text-gray-400 ">
                        <div className="flex flex-col ">
                          <span className="text-sm text-(--primary-text)">Distance</span>

                          <span className="text-(--dark-heading)! text-lg! font-light capitalize">
                            {data?.localizedValues?.distance?.text || "..."}
                          </span>
                        </div>
                        <div className="flex flex-col ">
                          <span className="text-sm text-(--primary-text)"> Est. Time</span>

                          <span className="text-(--dark-heading)! text-lg! font-light capitalize">
                            {data?.localizedValues?.duration?.text || "..."}
                          </span>
                        </div>
                        <div className="flex flex-col ">
                          <span className="text-sm text-(--primary-text)">Nearest Gate</span>

                          <span className="text-(--dark-heading)! text-lg! font-light">
                            {loc.nearestGate}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {loading && (
                <p className="text-xs text-gray-400">Loading routes…</p>
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="shadow-(--shadow-md) border border-white relative hidden md:block h-[800px]">
              <Map
                defaultCenter={{
                  lat: destination.latitude,
                  lng: destination.longitude,
                }}
                defaultZoom={10}
                disableDefaultUI
                {...(MAP_ID ? { mapId: MAP_ID } : {})}
              >
                {selected && allRouteData[selected.id] && (
                  <RouteRenderer
                    routeData={allRouteData[selected.id]}
                    originCoords={selected.coords}
                    destination={destination}
                    label={data.destination_label ? data.destination_label : ''}
                  />
                )}
              </Map>

              {selected && allRouteData[selected.id] && (
                <div className="absolute bottom-10 left-10 w-[388px] bg-white shadow-(--shadow-md) border border-gray-100">
                  <div className="max-h-[392px] overflow-y-auto scrollbar-hide">
                    {(allRouteData[selected.id].legs?.[0]?.steps || []).map(
                      (step, i) => (
                        <div
                          key={i}
                          className="flex gap-4 p-4 border-b border-gray-100 items-start hover:bg-gray-50"
                        >
                          <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-sm shrink-0 text-xl font-light">
                            {step.transitDetails
                              ? "🚌"
                              : getManeuverIcon(
                                  step.navigationInstruction?.maneuver || "",
                                )}
                          </div>
                          <div>
                            <div
                              className="text-lg! text-(--dark-heading)! leading-6 font-normal mb-0!"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                  step.navigationInstruction?.instructions ||
                                    `Board ${
                                      step.transitDetails?.transitLine
                                        ?.nameShort || "Transit"
                                    }`,
                                ),
                              }}
                            />
                            <p className="text-lg! text-(--dark-heading)! leading-6 font-medium mb-0!">
                              {step.localizedValues?.distance?.text}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
            {memoizedDisclaimer}
          </div>
        </div>
      </div>
    </APIProvider>
  );
}

function RouteRenderer({
  routeData,
  originCoords,
  destination,
  label
}: {
  routeData: RouteData;
  originCoords: LatLng;
  destination: LatLng;
  label: string
}) {
  const map = useMap();
  useEffect(() => {
    if (!map || !routeData?.polyline?.encodedPolyline) return;
    const path = google.maps.geometry.encoding.decodePath(
      routeData.polyline.encodedPolyline,
    );
    const polyline = new google.maps.Polyline({
      path,
      strokeColor: "#000000",
      strokeWeight: 5,
      map,
    });
    const bounds = new google.maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    bounds.extend(
      new google.maps.LatLng(originCoords.latitude, originCoords.longitude),
    );
    bounds.extend(
      new google.maps.LatLng(destination.latitude, destination.longitude),
    );
    map.fitBounds(bounds, 100);
    return () => polyline.setMap(null);
  }, [map, routeData, originCoords, destination]);
  return (
    <>
      <AdvancedMarker
        position={{ lat: originCoords.latitude, lng: originCoords.longitude }}
      >
        <MapMarkerUI label="Start" type="start" />
      </AdvancedMarker>
      <AdvancedMarker
        position={{ lat: destination.latitude, lng: destination.longitude }}
      >
        <MapMarkerUI label={label} type="end" />
      </AdvancedMarker>
    </>
  );
}

const MapMarkerUI = ({
  label,
  type,
}: {
  label: string;
  type: "start" | "end";
}) => (
  <div className="flex flex-col items-center">
    <div className="bg-[#1a1a1a] text-white text-[10px] px-2 py-1 rounded-sm mb-1 font-bold shadow-md">
      {label}
    </div>
    <div
      className={`w-7 h-7 rounded-full border-[5px] flex items-center justify-center shadow-lg ${
        type === "end"
          ? "bg-[#1a1a1a] border-gray-400/40"
          : "bg-white border-gray-500/30"
      }`}
    >
      {type === "end" && <div className="w-2 h-2 bg-white rounded-full" />}
    </div>
  </div>
);
