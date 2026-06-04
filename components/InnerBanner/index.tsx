"use client"
import { BlockData } from "@/types/global";
import { clickPushToDataLayer } from "@/utils/utility";
import Image from "next/image";
import Link from "next/link";

export default function InnerBanner({ data }: { data: BlockData }) {
  const {
    section_title,
    section_subTitle,
    main_image,
    mobile_image,
    tablet_image,
    cta,
  } = data;

  const desktopSrc = main_image?.url;
  const tabletSrc = tablet_image?.url || desktopSrc;
  const mobileSrc = mobile_image?.url || desktopSrc;

  const desktopAlt = main_image?.alt || "";
  const tabletAlt = tablet_image?.alt || desktopAlt;
  const mobileAlt = mobile_image?.alt || desktopAlt;

  if (!data) return null;
const spacingStyles: React.CSSProperties = {
  "--spaceTop": `${data?.top_spacing ? data?.top_spacing : 0 }px`,
  "--spaceBottom": `${data?.bottom_spacing? data?.bottom_spacing   : 0}px`,
  "--spaceTopMobile": `${data?.mobile_top_spacing? data?.mobile_top_spacing : 0}px`,
  "--spaceBottomMobile": `${data?.mobile_bottom_spacing? data?.mobile_bottom_spacing : 0}px`,
} as React.CSSProperties;
  return (
    <div
      className={`tru-block inner-banner flex items-end  relative  ${
        data.additional_classes || ""
      } ${desktopSrc ? "min-h-125 lg:py-12 py-6" : " "}
      md:mt-(--spaceTop)
      md:mb-(--spaceBottom)
      mb-(--spaceBottomMobile)
      mt-(--spaceTopMobile)`}
    style={spacingStyles} >
      <div className="container">
        <div
          className={`[&_p]:text-lg md:w-full  ${desktopSrc ? "[&_p]:mb-6 [&_p]:text-white xm:w-[384px]" : " "}`}
        >
          {section_title && (
            <h1
              className={`text-[40px] leading-14 4xl:text-[56px] 4xl:leading-[72px] text-(--dark-heading)
            ${desktopSrc ? "text-white text-[40px] leading-14 4xl:text-[80px] 4xl:leading-[88px] md:text-[60px] md:leading-[60px]" : " "}`}
              dangerouslySetInnerHTML={{ __html: section_title }}
            ></h1>
          )}

          {section_subTitle && (
            <div
              className={`text-white mt-4 md:text-lg text-base leading-6`}
              dangerouslySetInnerHTML={{ __html: section_subTitle }}
            />
          )}

          {cta && cta?.title && (
            <Link
              href={cta?.url || "#"}
              target={cta.target || "_self"}
              className="font-bold underline layout-cta cursor-pointer text-white"
              onClick={clickPushToDataLayer}
              data-clickeventname="cta_click"
              data-title={cta.title}
              data-eventcategory={data?.section_title}
              data-tag={data?.section_title}
            >
              {cta.title}
            </Link>
          )}
        </div>
      </div>

      {desktopSrc && (
        <Image
          src={desktopSrc || ""}
          alt={desktopAlt}
          className="hidden object-cover lg:block z-[-1]"
          fill
          priority
        />
      )}

      {tabletSrc && (
        <Image
          src={tabletSrc || ""}
          alt={tabletAlt}
          className="hidden object-cover sm:block lg:hidden z-[-1]"
          fill
          priority
        />
      )}

      {mobileSrc && (
        <Image
          src={mobileSrc || ""}
          alt={mobileAlt}
          className="block object-cover sm:hidden z-[-1]"
          fill
          priority
        />
      )}
      {desktopSrc && <div className="overlay absolute inset-0 -z-1"></div>}
    </div>
  );
}
