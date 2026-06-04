"use client";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Link from "next/link";
import { MenuItem } from "@/types/global";
import { pushCardsToDataLayer, getAbsoluteUrl } from "@/utils/utility";

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu?: () => void;
  menuItems: MenuItem[];
  isOpenchildren: number | null;
  togglechildren: (index: number) => void;
  handleBackButton: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  toggleMenu,
  menuItems,
  isOpenchildren,
  togglechildren,
  handleBackButton,
}) => {
  const pathname = usePathname();
  const router = useRouter();


  useEffect(() => {
    if (isOpen && toggleMenu) toggleMenu();
    document.body.classList.remove("no-scroll");
  }, [pathname]);


  useEffect(() => {
    document.body.classList.toggle("no-scroll", isOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  const closeMenu = () => {
    if (toggleMenu) toggleMenu();
    document.body.classList.remove("no-scroll");
  };

  return (
    <>
      {isOpen && (
        <div className="border-t border-(--border-gray-light) h-screen md:mt-4 mobile-menu z-999 pt-8 gap-4 inset-14.5 flex lg:hidden w-full left-0 flex-col bg-white! opacity-100 animate-slide-in-fade">
          <ul className="px-8 ml-0">
            {menuItems.map((item, index) => {
              const hasChildren = Boolean(item.children?.length);
              return (
                <li key={index} className="relative py-2 w-full flex flex-col items-start gap-1 my-0">
                  <div className="flex w-full justify-between items-center">
                    <Link
                      href={item.url || "#"}
                      className="text-lg text-(--dark-heading) flex items-center no-underline"
                      onClick={(e) => {
                        e.preventDefault();
                        const targetUrl = hasChildren ? item.children![0].url : item.url;
                        closeMenu();
                        router.push(targetUrl || "#");
                        pushCardsToDataLayer(e.currentTarget as HTMLElement, e.type || "click");
                      }}
                      data-clickeventname="nav_header"
                      data-title={item.title}
                      data-index={getAbsoluteUrl(item.url)}
                    >
                      {item.title}
                    </Link>

                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          togglechildren(index);
                        }}
                        className="icon-down-arrow w-6 h-6 flex items-center justify-center"
                      >
                        <i className="icon-arrow-right text-[12px]" />
                         <span className="invisible absolute">arrow right</span>
                      </button>
                    )}
                  </div>

                  {isOpenchildren === index && item.children && (
                    <div className="bg-white pt-8 border-t border-(--border-gray-light) fixed mobile-sub-menu inset-0 z-999">
                      <div className="px-8 border-b pb-6 mb-6 border-(--border-gray-light)">
                        <button onClick={handleBackButton} className="text-(--primary) flex items-center gap-4">
                          <span className="w-8 h-8 flex items-center justify-center border border-(--border-gray-light) rounded-full">
                            <i className="icon-long-arrow-left text-[10px]" />
                          </span>
                          <span className="text-lg text-(--primary-text)">Back</span>
                        </button>
                      </div>
                      <ul className="px-8 flex flex-col gap-4 list-none ml-0">
                        {item.children.map((subItem, i) => (
                          <li key={i} className="py-2 my-0">
                            <Link
                              href={subItem.url || "#"}
                              className="flex justify-between text-(--dark-heading) no-underline"
                              onClick={(e) => {
                                closeMenu();
                                pushCardsToDataLayer(e.currentTarget as HTMLElement, e.type || "click");
                              }}
                              data-clickeventname="nav_header"
                              data-title={subItem.title}
                              data-index={getAbsoluteUrl(subItem.url)}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
    </>
  );
};

export default MobileMenu;
