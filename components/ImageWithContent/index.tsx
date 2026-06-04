"use client";
import Image from "next/image";
import Link from "next/link";
import SectionIntroBlock from "../SectionIntroBlock";
import { BlockData } from "@/types/global";
import ImageSlider from "../ImageSlider";
import { clickPushToDataLayer } from "@/utils/utility";
import { useMemo, useRef } from "react";

interface PageProps {
  pageTitle?: boolean;
  showMobileTitle?: boolean;
  className?: string;
}

export default function ImageWithContent({
  data,
  pageTitle,
  showMobileTitle,
  className,
}: { data: BlockData } & PageProps) {
  const contentData = data;
  const cards = useMemo(() => contentData?.cards || [], [contentData?.cards]);
  const layoutOption = contentData?.option;
  const isVertical = contentData?.column_layout === "vertical";
  const isCompact = contentData?.compact_layout?.includes("yes");
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const layoutClass =
    data?.section_layout === "full_width"
      ? "w-full"
      : data?.section_layout === "boxed"
        ? "boxed"
        : "container";

  const cardTheme: Record<string, string> = {
    "solid-secondary":
      "bg-solid-secondary text-white!  [&_p]:text-white! [&_a]:text-(--dark-white)!",
    "solid-primary": "bg-solid-primary [&_a]:text-(--dark-heading)!",
    "solid-gray": "bg-solid-gray",
    transparent: "",
  };
  const themeVal = data?.bg_color || "transparent";
  const isContainerLayout = data?.section_layout === "container";
  const BlockId = data?.block_id;
  const imageBlock = (
    <div
      className={`wrapper ${
        isVertical
          ? `grid ${
              cards?.length <= 1 ? "grid-cols-1" : "md:grid-cols-2"
            } grid-cols-1 ${!isCompact ? "gap-x-24 gap-y-10" : "gap-y-6"}`
          : ""
      } ${className}`}
    >
      {cards.map((item, index) => {
        const gallery = item.gallery || [];
        const hasSlider = gallery.length > 1;
        const firstImage = gallery[0];

        let isReverseDesktop = false;
        if (layoutOption === "image_right") {
          isReverseDesktop = true;
        } else if (layoutOption === "alternate_with_first_left") {
          isReverseDesktop = index % 2 !== 0;
        } else if (layoutOption === "alternate_with_first_right") {
          isReverseDesktop = index % 2 === 0;
        }

        const rowClasses = isVertical
          ? `flex flex-col w-full ${
              isReverseDesktop ? "lg:flex-col-reverse" : "lg:flex-col"
            }`
          : `flex flex-col lg:flex-row w-full ${
              isReverseDesktop ? "lg:flex-row-reverse" : ""
            } ${
              isCompact
                ? "lg:mb-0 mb-2 last:mb-0"
                : "lg:mb-10 lg:last:mb-0 mb-2 last:mb-0"
            }`;

        const colClasses = `${
          isVertical ? "w-full" : "w-full lg:w-1/2 xl:min-h-[400px]"
        }`;

        return (
          <div
            key={index}
            className={`${rowClasses} section-row`}
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
            data-vieweventname="tile_view"
            data-clickeventname="tile_click"
            data-title={item?.title || ""}
            data-eventcategory={data?.section_title || ""}
            data-index={index + 1 || ""}
          >
            <div
              className={`${colClasses} ${cardTheme[themeVal]} ${
                isVertical ? "" : ""
              } relative overflow-hidden`}
            >
              {hasSlider ? (
                <ImageSlider items={gallery} className="desktop-Image" />
              ) : firstImage?.url ? (
                <Image
                  src={firstImage.url}
                  loading="lazy"
                  width={828}
                  height={400}
                  className="object-cover desktop-Image w-full h-full  object-center"
                  alt={firstImage?.alt || "Section Image"}
                />
              ) : (
                <div className="w-full h-full min-h-[250px] md:min-h-[498px] flex items-center justify-center bg-gray-200 text-gray-500">
                  <span className="text-sm font-medium">
                    No image available
                  </span>
                </div>
              )}
            </div>

            <div className={`${colClasses} ${cardTheme[themeVal]}`}>
              <div
                className={`${showMobileTitle === true ? "pt-0" : ""} flex flex-col justify-center h-full [&_a]:underline [&_p]:mb-4 [&_p]:last:mb-0
                ${
                  isContainerLayout
                    ? `${isReverseDesktop ? "lg:pl-0 lg:p-10 " : "lg:p-10 3xl:p-20 3xl:pr-[60px]"} py-6`
                    : `lg:p-16 py-8 px-[25px] ${
                        isReverseDesktop
                          ? "max-w-[885px] lg:pl-[25px] lg:pl-[30px] xl:pl-[45px] ml-auto"
                          : ""
                      }`
                }
                ${cardTheme[themeVal] ? "pb-12" : ""}

                ${isVertical ? "" : ""}
                ${!isVertical && isReverseDesktop ? "" : ""}
                ${!isVertical && !isReverseDesktop ? "" : ""}
                `}
              >
                {pageTitle === true && item.title ? (
                  <h1
                    className={`${showMobileTitle === true ? "mb-4 md:mb-8" : ""} ${
                      isContainerLayout
                        ? "md:text-[40px] desktop-title md:leading-14 text-[32px] leading-11"
                        : ""
                    }`}
                    dangerouslySetInnerHTML={{ __html: item.title }}
                    suppressHydrationWarning={true}
                  />
                ) : (
                  item.title && (
                    <h2
                      className={`${
                        isContainerLayout
                          ? "lg:text-[40px] lg:leading-14 text-[32px] leading-11"
                          : ""
                      }`}
                      dangerouslySetInnerHTML={{ __html: item.title }}
                      suppressHydrationWarning={true}
                    />
                  )
                )}
                {showMobileTitle == true && (
                  <div className="mobile-Image">
                    {hasSlider ? (
                      <ImageSlider items={gallery} />
                    ) : firstImage?.url ? (
                      <Image
                        src={firstImage.url}
                        width={828}
                        height={400}
                        className="object-cover w-full h-full object-center showImageMobile"
                        alt={firstImage?.alt || "Section Image"}
                      />
                    ) : (
                      <div className="w-full h-full min-h-[250px] md:min-h-[498px] flex items-center justify-center bg-gray-200 text-gray-500">
                        <span className="text-sm font-medium">
                          No image available
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {item.subTitle && (
                  <div
                    className="mt-4 [&_p]:md:text-[18px] section-content"
                    dangerouslySetInnerHTML={{ __html: item.subTitle }}
                    suppressHydrationWarning={true}
                  />
                )}

                {item.links?.some((linkItem) => linkItem.cta?.url) && (
                  <div className="flex  items-center mt-6 gap-4">
                    {item.links.map((linkItem, key) => {
                      const linkUrl = linkItem.cta?.url;
                      const linkText =
                        linkItem.cta_label || linkItem.cta?.title || "";
                      const target = linkItem.cta?.target || "_self";

                      if (!linkUrl) {
                        return (
                          <span key={key} className="font-bold">
                            {linkText}
                          </span>
                        );
                      }

                      return (
                        <Link
                          key={key}
                          href={linkUrl}
                          target={target}
                          className="font-medium layout-cta text-[18px] underline text-(--dark-heading)! flex items-baseline cursor-pointer gap-2"
                          onClick={(e) => clickPushToDataLayer(e)}
                          data-clickeventname="cta_click"
                          data-title={linkText}
                          data-eventcategory={data?.section_title}
                          data-tag={item.title}
                        >
                          {linkText}
                          {/* {target === "_blank" && (
                          <i className="icon-arrow-up-right text-[14px]"></i>
                        )} */}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,
    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;
  return (
    <div
      className={`tru-block image_content_block  ${data.additional_classes || ""}
       md:mt-(--spaceTop)
      md:mb-(--spaceBottom)
      mb-(--spaceBottomMobile)
      mt-(--spaceTopMobile)`}
      style={spacingStyles}
      id={`${BlockId || ""}`}
    >
      <div className="main-container">
        {(data?.section_title || data?.section_subTitle || data?.cta) && (
          <SectionIntroBlock data={data} />
        )}

        <div className={`${layoutClass}`}>{imageBlock}</div>
      </div>
    </div>
  );
}
