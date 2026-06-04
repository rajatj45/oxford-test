"use client";

import { usePopup } from "@/context/PopupContext";
import { BlockData } from "@/types/global";
import { pushCardsToDataLayer } from "@/utils/utility";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function HomeBanner({ data }: { data: BlockData }) {
  const {
    section_title,
    section_subTitle,
    main_image,
    mobile_image,
    tablet_image,
    option,
    cta,
    additional_classes,
  } = data;

  const bannerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const desktopSrc = main_image?.url;
  const tabletSrc = tablet_image?.url || desktopSrc;
  const mobileSrc = mobile_image?.url || desktopSrc;
  const { isPopupOpen } = usePopup();

  const desktopAlt = main_image?.alt || "";
  const tabletAlt = tablet_image?.alt || desktopAlt;
  const mobileAlt = mobile_image?.alt || desktopAlt;

  const cleanTitle = section_title?.replace(/<[^>]*>?/gm, "");

  const isValidVideo = (url?: string) => {
    if (!url || url === "#") return false;
    return url.match(/\.(mp4|webm|ogg)$/i);
  };
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 767 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 767);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {

    if (!isHomePage || isPopupOpen) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          pushCardsToDataLayer(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.4,
      }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, [isHomePage,isPopupOpen]);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    pushCardsToDataLayer(bannerRef.current as HTMLElement, e.type);
  };

  return (
    <div
      className="tru-block hero-banner"
      ref={bannerRef}
      data-vieweventname="hero_banner_view"
      data-clickeventname="hero_banner_click"
      data-title={cleanTitle || ""}
      data-index={1}
      data-eventcategory={option === "video" ? "video" : "image"}
    >
      <div className="main-container">
        <div
          className={`relative min-h-[550px] xm:min-h-[600px] xl:min-h-[600px] 3xl:min-h-[650px]  4xl:min-h-[700px]  5xl:min-h-[920px] py-10 lg:py-20 flex items-end overflow-hidden ${
            desktopSrc || option === "video" ? "" : "bg-[#222222]"
          }${additional_classes}`}
        >
          <div className="container relative z-10">
            <div className="[&_p]:mb-6 [&_p]:text-white [&_p]:text-lg">
              {section_title && (
                <h1
                  className="text-white [&_span]:block  leading-10  text-3xl xm:text-[40px] xm:leading-14 4xl:text-[80px] 4xl:leading-[88px] md:text-[60px] md:leading-[60px] text-(--dark-heading) "
                  dangerouslySetInnerHTML={{ __html: section_title }}
                ></h1>
              )}
              {section_subTitle && (
                <div
                  className={`text-white text-[16px] md:text-[18px] mt-4 font-normal`}
                  dangerouslySetInnerHTML={{ __html: section_subTitle }}
                />
              )}
              {cta?.title && (
                <div className="mt-6">
                  <Link
                    href={cta.url || "#"}
                    target={cta.target || "_self"}
                    onClick={(e) => handleCtaClick(e)}
                    className="layout-cta underline text-[18px] cursor-pointer text-white font-normal"
                  >
                    {cta.title}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="absolute inset-0 -z-2">
            {option === "video" && isValidVideo(main_image?.url) ? (
              <>
                <video
                  src={isMobile ? (mobile_image?.url || main_image?.url) : main_image?.url}
                  className="object-cover w-full h-full"
                  autoPlay
                  muted
                  loop
                  playsInline 
                  preload="none"
                />
              </>
            ) : (
              <>
                {desktopSrc && (
                  <Image
                    src={desktopSrc}
                    alt={desktopAlt}
                    className="hidden lg:block object-cover"
                    priority
                    fill
                  />
                )}
                {tabletSrc && (
                  <Image
                    src={tabletSrc}
                    alt={tabletAlt}
                    priority
                    className="hidden sm:block lg:hidden object-cover"
                    fill
                  />
                )}
                {mobileSrc && (
                  <Image
                    src={mobileSrc}
                    alt={mobileAlt}
                    priority
                    className="block sm:hidden object-cover"
                    fill
                  />
                )}
              </>
            )}
          </div>
          <div className="overlay absolute inset-0 -z-1"></div>
        </div>
      </div>
    </div>
  );
}
