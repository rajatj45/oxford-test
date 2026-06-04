"use client";
import { BlockData } from "@/types/global";
import FormInput from "@/components/FormInput";
import Button from "../Button";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import "./ParkingMap.css";
import {
  Coordinate,
  EnterpriseLocation,
  MapData,
  TGetMapDataOptions,
  getMapData,
} from "@mappedin/mappedin-js";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { calculateDistance, isPathFound, pushCardsToDataLayer } from "@/utils/utility";

interface Floor {
  name: string;
  id: string;
}

interface MappedinNode {
  floor: Floor;
}

interface LocationWithDistance {
  location: EnterpriseLocation;
  distance: number;
  locationCoords: Coordinate;
}
interface Store {
  name: string;
  tags?: string[];
  nodes?: MappedinNode[];
}

export default function ParkingMap({ data }: { data: BlockData }) {
  const [showFullDropdown, setShowFullDropdown] = useState(false);
  const [allStores, setAllStores] = useState<EnterpriseLocation[]>([]);
  const [mapDataInstance, setMapDataInstance] = useState<MapData | null>(null);
  const [showParkingUI, setShowParkingUI] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [nearestParking, setNearestParking] = useState<EnterpriseLocation[]>(
    [],
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = async (store: EnterpriseLocation) => {
    const storeData: Store = {
      name: store.name,
      tags: store.tags,
      nodes: store.nodes,
    };
    setSelectedStore(storeData);
    setSelectedStoreId(store.id);
    setSelectedParkingId(null);

    const baseUrl =
      sessionStorage.getItem("mapBaseUrl") || window.location.pathname;
    const targetUrl = `${baseUrl}#/profile?location=${store.id}`;
    window.history.pushState(null, "", targetUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));

    const allEnterpriseLocations =
      mapDataInstance?.getByType("enterprise-location") ?? [];
    const parkingLocations = allEnterpriseLocations.filter(
      (location) => location.amenity === "parking",
    );

    if (parkingLocations.length === 0) {
      console.warn("No parking locations found");
      return;
    }

    const validParkingLocations = parkingLocations.filter((location) => {
      return location.coordinates && location.coordinates.length > 0;
    });

    const locationsWithDistance: LocationWithDistance[] =
      validParkingLocations.map((location) => {
        const locationCoords = location.coordinates[0];
        const distance = calculateDistance(
          store.coordinates[0],
          locationCoords,
        );
        return { location, locationCoords, distance };
      });
    locationsWithDistance.sort((a, b) => a.distance - b.distance);

    const nearestRoutableLocations = [];
    for (const item of locationsWithDistance) {
      let pathFound = false;
      if (nearestRoutableLocations.length >= 2) break;
      pathFound = await isPathFound(
        store.coordinates[0],
        item.locationCoords,
        mapDataInstance,
      );

      if (pathFound) {
        nearestRoutableLocations.push(item.location);
      }
    }
    setNearestParking(nearestRoutableLocations);
    setShowParkingUI(true);
  };

  const handleParkingClick = (parking: EnterpriseLocation,e: React.MouseEvent<HTMLDivElement>) => {
    pushCardsToDataLayer(e.currentTarget,"click");
    const baseUrl =
      sessionStorage.getItem("mapBaseUrl") || window.location.pathname;

    setSelectedParkingId(parking.id);

    const url = `${baseUrl}#/directions?to=${parking.id}&from=${selectedStoreId}`;
    window.history.pushState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const filteredStores = allStores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleResetMap = useCallback(() => {
    if (mapDataInstance) {
      setSearchTerm("");
      setSelectedStoreId("");
      setSelectedParkingId("");
      setNearestParking([]);
      setShowParkingUI(false);

      const tab = searchParams.get("displayView");

      const reloadUrl = tab
        ? `${window.location.origin}${window.location.pathname}?displayView=${tab}`
        : `${window.location.origin}${window.location.pathname}`;

      window.history.pushState(null, "", reloadUrl);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, [
    mapDataInstance,
    searchParams,
    setSearchTerm,
    setSelectedStoreId,
    setSelectedParkingId,
    setNearestParking,
    setShowParkingUI,
  ]);

  const initMap = useCallback(async () => {
    const options: TGetMapDataOptions = {
      key: process.env.NEXT_PUBLIC_MAPPEDIN_KEY!,
      secret: process.env.NEXT_PUBLIC_MAPPEDIN_SECRET!,
      mapId: process.env.NEXT_PUBLIC_MAPPEDIN_MAP_ID!,
    };

    const mapData: MapData = await getMapData(options);

    setMapDataInstance(mapData);

    const allLocations = mapData.getByType("enterprise-location");
    const foundStores = allLocations.filter((location) => {
      return location.type === "tenant";
    });
    setAllStores(foundStores);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const queryString = searchParams.toString();
    const fullPath = `${window.location.origin}${pathname}${queryString ? `?${queryString}` : ""}`;

    sessionStorage.setItem("mapBaseUrl", fullPath);

    const executeInit = async () => {
      await initMap();
    };
    executeInit();
  }, [pathname, searchParams, initMap]);

  useEffect(() => {
    const interval = setInterval(() => {
      const host = document.querySelector("#mappedin-map");
      const shadowRoot = host?.shadowRoot;

      if (shadowRoot) {
        const searchElement = shadowRoot.querySelector(".mappedin-search");
        if (searchElement) {
          searchElement.remove();
          clearInterval(interval);
        }

        const style = document.createElement("style");
        style.textContent = `
          .state-container { display: none !important; }
        `;
        shadowRoot.appendChild(style);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);
  const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,
    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;

  useEffect(() => {
    const hasDisplayView = searchParams.has("displayView");

    const hasPerformedInitialReload = sessionStorage.getItem("parking_reload");

    if (hasDisplayView && !hasPerformedInitialReload) {
      sessionStorage.setItem("parking_reload", "true");
      window.location.reload();
    }

    return () => {
      // sessionStorage.removeItem("parking_reload");
    };
  }, [searchParams]);


  return (
    <>
      <div
        className={`mappedin-blocks ${data.additional_classes}
      md:pt-(--spaceTop)
      md:pb-(--spaceBottom)
      pb-(--spaceBottomMobile)
      pt-(--spaceTopMobile) `}
        id="mappedin-block"
        style={spacingStyles}
      >
        <div className={data.section_layout ? data.section_layout : 'main-container'} suppressHydrationWarning>
          <div className="relative">
            {showParkingUI && (
              <div className="breakout-element top-12 left-[94px] border-t border-(--border-gray-light) md:absolute z-10">
                <div className=" w-full md:w-[432px] bg-white p-6 flex flex-col gap-6 md:shadow-(--shadow-md)">
                  <div className="flex border-b justify-between items-center border-(--border-gray-light) pb-6  ">
                    <Button
                      item={{
                        title: selectedStore?.name,
                        beforeIcon: "/images/icons/arrow-right.svg",
                      }}
                      mainClass="w-full justify-between! [&_span]:text-left [&_span]:font-normal! px-0! no-underline! [&_span]:text-xl [&_span]:font-(family-name:--font-larken)"
                      onClick={() => {
                        handleResetMap();
                      }}
                    />
                    <div>
                      <p className="text-(--primary-text) text-sm">
                        {selectedStore?.tags && selectedStore?.tags.length > 0 && (
                          <>
                            <span>{selectedStore?.tags[0]}</span> |{" "}
                          </>
                        )}
                        <span>{selectedStore?.nodes?.[0]?.floor?.name}</span>
                      </p>
                    </div>
                  </div>

                  <h3 className=" heading-24">Closest Parking Lots</h3>

                  <div className="parking-card-wrapper">
                    {nearestParking.map((p) => (
                      <div
                        key={p.id}
                        className={`items-center border border-(--border-gray-light) cursor-pointer p-1.5 flex justify-between gap-4 ${
                          selectedParkingId === p.externalId
                            ? "bg-(--border-gray-light)"
                            : ""
                        }`}
                        onClick={(e) => handleParkingClick(p,e)}
                        data-title={p.name}
                        data-clickeventname="cta_click"
                        data-tag={selectedStore?.name}
                        data-eventcategory={data?.section_title}
                      >
                        <Image
                          src={p.logo || "/images/parking-icon.jpg"}
                          className="w-[38px] h-[38px]"
                          alt="parking logo"
                          width={38}
                          height={38}
                        />

                        <div className="">
                          <div className="text-lg leading-6 font-medium">
                            {p.name}
                          </div>
                        </div>

                        <div className="arrow-icon w-6 h-6">
                          <i className="icon-arrow-right"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!showParkingUI && (
                <div className="breakout-element border-t border-(--border-gray-light) top-12 left-[94px] md:absolute z-10">
                  <div className="w-full md:w-[432px] bg-white p-6 flex flex-col gap-6 md:shadow-(--shadow-md)">
                    <div>
                      <h3 className="heading-36">{data.search_heading}</h3>
                      <p className="text-(--primary-text)">
                        {" "}
                        {data.search_subheading}
                      </p>
                    </div>
                    <div>
                      <div className="relative">
                        <FormInput
                          type="text"
                          placeholder="Search store..."
                          value={searchTerm}
                          onChange={(e) => {
                            setShowFullDropdown(false);
                            setSearchTerm(e.target.value);
                          }}
                        />
                        <span className="absolute top-1/2 -translate-1/2  right-0">
                          <i className="icon-search"></i>
                        </span>
                      </div>

                      {searchTerm && filteredStores.length > 0 && (
                        <div className=" overflow-y-auto mt-6 max-h-[260px] flex flex-col gap-4">
                          {filteredStores.map((store) => (
                            <div
                              key={store.id}
                              className="flex gap-4 items-center cursor-pointer"
                              onClick={() => handleClick(store)}
                            >
                              <div className="border p-2.5 border-(--border-gray-light)">
                                <Image
                                  src={store.logo || ""}
                                  alt={store.name}
                                  className="w-12 h-12 object-contain"
                                  width={48}
                                  height={48}
                                />
                              </div>

                              <div className="suggestion-info">
                                <p className="text-(--dark-heading) text-lg">
                                  {store.name}
                                </p>
                                <p className="text-(--primary-text) text-sm">
                                  {store.tags && store.tags.length > 0 && (
                                    <>
                                      <span>{store.tags[0]}</span> |{" "}
                                    </>
                                  )}
                                  <span>{store.nodes?.[0]?.floor?.name}</span>
                                </p>
                              </div>

                              <span className=" w-[45px] h-[45px] flex items-center justify-center">
                                <i className="icon-list-arrow-right"></i>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="">
                        <Button
                          item={{
                            title: "Find a store",
                            afterIcon: "icon-arrow-right",
                          }}
                          mainClass={`w-full justify-between! [&_span]:font-normal! px-4! [&_i]:-rotate-270 ${showFullDropdown ? "[&_i]:rotate-270 transform transition-all delay-500" : ""}`}
                          button_style="outline"
                          onClick={() => setShowFullDropdown(!showFullDropdown)}
                        />

                        {showFullDropdown && allStores.length > 0 && (
                          <ul className="overflow-y-auto mt-6 max-h-[260px] flex flex-col gap-4">
                            {allStores.map((store) => (
                              <div
                                key={store.id}
                                className="flex gap-4 items-center cursor-pointer"
                                onClick={() => {
                                  handleClick(store);
                                  setShowFullDropdown(false);
                                }}
                              >
                                <div className="border p-2.5 border-(--border-gray-light)">
                                  {store.logo && (
                                    <Image
                                      src={store.logo}
                                      alt={store.name}
                                      className="w-12 h-12 object-contain"
                                      width={48}
                                      height={48}
                                    />
                                  )}
                                </div>

                                <div className="suggestion-info">
                                  <p className="text-(--dark-heading) text-lg">
                                    {store.name}
                                  </p>
                                  <p className="text-(--primary-text) text-sm">
                                  {store.tags && store.tags.length > 0 && (
                                    <>
                                      <span>{store.tags[0]}</span> |{" "}
                                    </>
                                  )}
                                    <span>{store.nodes?.[0]?.floor?.name}</span>
                                  </p>
                                </div>

                                <span className=" w-[45px] h-[45px] flex items-center justify-center">
                                  <i className="icon-list-arrow-right"></i>
                                </span>
                              </div>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div>
                      {!showFullDropdown && allStores.length > 0 && (
                        <div className="visited_store">
                          <div className="font-medium text-(--dark-heading)">Most Visited Store</div>
                          <ul className="flex items-center md:justify-center gap-2 ml-0">
                            {allStores.slice(10, 14).map((store) => (
                              <div
                                key={store.id}
                                className="flex flex-col items-center w-[120px] justify-center text-center text-(--primary-text) cursor-pointer"
                                onClick={() => {
                                  handleClick(store);
                                  setShowFullDropdown(false);
                                }}
                              >
                                <Image
                                  src={store.logo || ""}
                                  alt={store.name}
                                  className=" w-[86px] h-[68px] object-contain mb-2"
                                  width={86}
                                  height={68}
                                />

                                <div>
                                  <p className="text-sm font-normal">
                                    {store.name}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            )}

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

            <section className="map-section mt-6 pb-6 md:pb-0 md:mt-0 h-[560px] md:h-[1143px]">
              <div className="container-full" id="mappedin-map"></div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}