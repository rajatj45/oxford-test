"use client";
import Navigation from "@/components/Navigation";
import OpeningHoursDropdown from "../OpeningHours";
import { useContext, useState } from "react";
import { SearchBar } from "@/components/GlobalSearch";
import { SearchContext } from "@/app/context/SearchProvider";
import { HolidayHoursDay, OpeningHoursData, HolidayHour } from "@/types/global";
import { useEffect, useRef } from "react";
import Image from 'next/image'
import { clickPushToDataLayer, pushCardsToDataLayer } from "@/utils/utility";
import Link from "next/link";
import MenuList from "../List";
import MobileMenu from "../Navigation/MobileMenu";

interface MenuItem {
  title: string;
  url: string;
  subMenu?: MenuItem[];
}

interface HeaderPorps {
  openingHours: OpeningHoursData;
  holidayHours: HolidayHoursDay[];
  holidaysHoursData: HolidayHour[];
  className?: string;
  siteTitle?: string
  data: {
    site_logo: { url: string; alt: string };
    search_placeholder: string;
   headerMenus: {
         top_menu_left: {
           menu: MenuItem[];
         };
         top_menu_right: {
           menu: MenuItem[];
         };
       };
  };
}

export default function Header({
  data,
  openingHours,
  className,
  siteTitle,
  holidayHours,
  holidaysHoursData
}: HeaderPorps) {

  const searchBox = useContext(SearchContext);
  if (!searchBox) {
    throw new Error("Header must be used within <SearchProvider>");
  }

  const { isOpen, setIsOpen } = searchBox;
  const [isOpenMoblie, setIsOpenMoblie] = useState(false);
  const [isOpenchildren, setIsOpenchildren] = useState<number | null>(null);
  const [, setPreviousItem] = useState<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && searchContainerRef.current) {
      const input = searchContainerRef.current.querySelector('input');
    input?.focus();
  }
  const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    const mainContent = document.querySelector(".main-content");
    if (isOpen) {
      mainContent?.classList.add("overlay-active");
      document.body.style.overflow = "hidden";
    } else {
      mainContent?.classList.remove("overlay-active");
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);
  const menuSharedClasses = {
    menuClass: "space-y-2 md:gap-4 2xl:gap-6 5xl:gap-8 hidden mb-0! md:flex items-center xl:ml-4 ml-0!",
    menuLinkClass:"my-9 text-xs lg:text-sm xl:text-base text-(--dark-heading)! flex items-center no-underline",
    itemClass:"relative flex items-center gap-[11px] group my-0 border-b-2 border-transparent hover:border-(--secondary)",
    subMenuClass:"absolute min-w-[248px] py-4 px-6 top-[calc(100%+0px)] submenu mt-0.5 group-hover:animate-slide-in-fade z-999 left-0 group-hover:block bg-white rounded-br-lg rounded-bl-lg shadow-lg mx-0",
    subItemMenuClass:"[&>a]:py-2 group/item [&>a]:hover:text-(--dark-heading) [&>a]:hover:border-b-(--dark-heading) [&>a]:hover:border-b [&>a]:border-b-white mb-2 last:mb-0 [&>a]:border-b  list-none",
    subItemLinkClass:"flex justify-between text-(--primary-text) no-underline",
  };
   const { headerMenus } = data;
  const { top_menu_left, top_menu_right } = headerMenus;
  const togglechildren = (index: number) => {
    setIsOpenchildren(index === isOpenchildren ? null : index);
    setPreviousItem(index === isOpenchildren ? null : index);
  };
  const toggleMenu = () => {
    setIsOpenMoblie(!isOpenMoblie);


  };
  const handleBackButton = () => {
    setIsOpenchildren(null);
    setPreviousItem(null);
  };
  return (
    <>
      <header className={`bg-white ${isOpen ?  ' relative z-9999' : ''}`}>
        <div className={`container`}>
           <div className={`flex-wrap xm:flex-nowrap flex gap-2 lg:gap-2.5 xl:gap-12 items-center bg-white justify-between py-6 lg:py-0
           ${className || ""}  ${isOpen ? "py-0!" : ""  }`}>
            {!isOpen ? (
              <>
                <OpeningHoursDropdown
                  className="lg:inline-block hidden min-w-25 2xl:min-w-56"
                  data={openingHours}
                  holidayOpenHoursData={holidayHours}
                  holidaysClosedData={holidaysHoursData}
                  
                  
                />
                <div className="flex justify-between xl:gap-12 gap-6 items-center ml-0 mr-auto lg:mx-auto">
                  <Navigation>
                       <MenuList menuItems={data.headerMenus.top_menu_left.menu} {...menuSharedClasses} location="header" />
                  </Navigation>
                  <div className="flex gap-3 xm:gap-4 items-center">
                    <button
                        onClick={(e) => {
                          toggleMenu();
                          pushCardsToDataLayer(
                            e.currentTarget as HTMLElement,
                            e.type || "click",
                          );
                        }}
                        aria-label="Toggle menu"
                        className="lg:hidden w-6 h-6 duration-100 focus:outline-none"
                        data-clickeventname="button_click"
                        data-title={isOpenMoblie ? "close_hamburger" : "open_hamburger"}
                        data-index="nav_bar"
                        data-eventcategory="hamburger"
                      >
                        {isOpenMoblie ? (
                          <i className="icon-close text-(--dark-heading)"></i>
                        ) : (
                          <i className="icon-bars text-(--dark-heading)"></i>
                        )}
                      </button>
                    <Link
                      href="/"
                      className="mb-0 block"
                      onClick={(e) => clickPushToDataLayer(e)}
                      data-clickeventname="nav_header"
                      data-title={siteTitle}
                    >
                      <div className="2xl:w-[226px] xm:w-[150px] w-[130px] md:w-[120px] xl:my-2 ">
                        {data.site_logo?.url && (
                          <Image
                            src={data.site_logo?.url}
                            width={226}
                            priority
                            height={50}
                            className=" object-contain xl:h-[80px]"
                            alt={data.site_logo?.alt || "header logo"}
                          />
                        )}
                      </div>
                    </Link>
                    </div>
                    <Navigation>
                       <MenuList menuItems={data.headerMenus.top_menu_right.menu} {...menuSharedClasses}
                        menuClass={`${menuSharedClasses.menuClass} [&_.Gift-Cards]:whitespace-nowrap`} location="header"/>
                  </Navigation>
                </div>
              </>
            ) : (
              <div ref={searchContainerRef} className="w-full">
                  <SearchBar
                    className="py-10"
                    onClearHandle={() => setIsOpen(!isOpen)}
                    placeHolder={data.search_placeholder}
                    inputClass="[&_input]:focus"

                  />
              </div>
            )}

            {!isOpen && (
              <div className="flex items-center justify-between w-full xm:w-auto xm:justify-end">
                <OpeningHoursDropdown
                  className="lg:hidden block min-w-[100px] 2xl:min-w-56 pr-3 "
                  data={openingHours}
                  holidayOpenHoursData={holidayHours}
                  holidaysClosedData={holidaysHoursData}
                />
                <div className="flex items-center mr-0 ml-auto justify-end gap-4 min-w-auto min-[1920px]:min-w-56 border-l lg:border-l-0 pl-3  mx-12 border-(--border-solid)">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="cursor-pointer border-(--border-light) border text-(--primary) mr-0 ml-0 flex w-12 md:w-auto justify-center py-2.5 px-4 gap-3.5 items-center"
                  >
                    <i className="text-lg before:text-[26px] md:before:text-[20px] leading-2.5 icon-search before:m-0!"></i>{" "}
                    <span className="xl:inline-block hidden">Search</span>
                  </button>
                </div>
              </div>
              
            )}
          </div>
        </div>
      </header>

       <MobileMenu
        isOpen={isOpenMoblie}
        toggleMenu={toggleMenu}
        menuItems={[...top_menu_left.menu, ...top_menu_right.menu]}
        isOpenchildren={isOpenchildren}
        togglechildren={togglechildren}
        handleBackButton={handleBackButton}
        />
    </>
  );
}
