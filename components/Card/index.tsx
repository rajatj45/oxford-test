"use client";

import { usePopup } from "@/context/PopupContext";
import { CardColourTheme } from "@/types/global";
import {
  clickPushToDataLayer,
  pushCardsToDataLayer,
  syncElementHeights,
} from "@/utils/utility";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface LinkItem {
  cta: CTAData;
  cta_label?: string | null;
}
interface CTAData {
  url?: string | null;
  title?: string | null;
  target?: string | null;
}
interface CardData {
  title?: string;
  content?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageMobileSrc?: string;
  icon?: string;
  links?: LinkItem[] | null;
  readMoreCta?: string;
  readMoreCtaText?: string;
  cardLink?: string;
  cardCount?: number;
  cardLinkText?: string;
  onClick?: () => void;
}

interface CardComponentProps {
  item: CardData;
  card_style?:
    | "step-card"
    | "info-card"
    | "overlay-card"
    | "gift-card"
    | "compact-card"
    | "accordion-card"
    | "horizontal-card"
    | "job-card";
  card_color_theme?: CardColourTheme;
  itemIndex?: number;
  sectionTitle?: string;
  imgWrapperClass?: string;
  wrapperClass?: string;
  mainCardClass?: string;
  cardWrapperClass?: string;
  titleClass?: string;
  contentClass?: string;
  ctaWrapperClass?: string;
  contentWrapperClass?: string;
  ctaClass?: string;
  indexClass?: string;
  cardLink?: string;
  cardLinkText?: string;
  onClick?: () => void;
  cardDataTag?: string;
  isSearchCards?: boolean;

}

const Card = ({
  item,
  sectionTitle,
  card_style = "info-card",
  card_color_theme = "transparent",
  wrapperClass = "",
  mainCardClass = "",
  cardWrapperClass = "",
  titleClass = "",
  contentClass = "",
  contentWrapperClass = "",
  ctaWrapperClass = "",
  ctaClass = "",
  indexClass = "",
  cardLinkText = "",
  imgWrapperClass = "",
  cardDataTag = "grid",
  isSearchCards = false,
}: CardComponentProps) => {
  const {
    title,
    content,
    imageSrc,
    imageAlt,
    icon,
    cardCount,
    imageMobileSrc,
  } = item;

  const cardRef = useRef<HTMLDivElement>(null);
  const hasTracked = useRef(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const {isPopupOpen} = usePopup();

  const handleCardLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.currentTarget.closest(".slick-cloned")) return;
    const overlayCardElement = e.currentTarget.closest(".overlay-card") as HTMLElement;

    if (overlayCardElement && isHomePage) {
      pushCardsToDataLayer(overlayCardElement, e.type);
    } else {
      clickPushToDataLayer(e);
    }
  };
  const renderActions = (
    item: CardData,
    ctaClass: string,
    sectionTitle?: string,
  ) => {
    const linksArray = item.links || [];
    if (linksArray.length === 0) {
      return null;
    }

    return (
      <>
        {linksArray.map((linkItem, key) => {
          const { cta, cta_label } = linkItem;
          const isExternal = cta.target === "_blank";
          const baseLabel =
            cta_label && cta_label.trim() !== "" ? cta_label : cta.title || "";
          const accessibilityLabel = `${baseLabel}${
            isExternal ? " (opens in a new window)" : ""
          }`;

          return (
            <div key={key}>
              <Link
                href={cta.url || "#"}
                target={cta.target ?? "_self"}
                rel={isExternal ? "noopener noreferrer" : undefined}
                aria-label={accessibilityLabel}
                onClick={(e) => handleCardLinkClick(e)}
                data-clickeventname="cta_click"
                data-title={cta.title || cta_label}
                data-eventcategory={sectionTitle}
                data-tag={item.title}
                className={`font-medium layout-cta underline flex text-[18px] text-(--dark-heading) leading-6 items-baseline cursor-pointer ${
                  isExternal ? "gap-2" : ""
                } ${ctaClass}`}
              >
               {cta.title?.replace(/&amp; /g, "& ") || cta_label}

                {/* {isExternal && (
                  <i
                    className="icon-arrow-up-right text-[14px]"
                    aria-hidden="true"
                  ></i>
                )} */}
              </Link>
            </div>
          );
        })}
      </>
    );
  };

  const actions = renderActions(item, ctaClass, sectionTitle);

  useEffect(() => {
    const currentRef = cardRef.current;
    if (!currentRef) return;

    const selectors = [
      ".card-title",
      ".card-desc",
      ".card-cta-wrapper",
      ".card-count-wrapper",

    ];

    const handleSync = () => {
      syncElementHeights(currentRef, selectors);
    };

    handleSync();
    window.addEventListener("resize", handleSync);

    if (!isHomePage || isSearchCards || isPopupOpen) return;

    const handlePush = (target: Element) => {
      const isCloned = target.closest(".slick-cloned");

      if (isCloned) {
        return;
      }
      const cardElement = target.querySelector(".overlay-card");
      const isTracked = cardElement?.getAttribute("data-layer") === "true";

      if (!hasTracked.current && !isTracked) {
        cardElement?.setAttribute("data-layer", "true");
        pushCardsToDataLayer(cardElement as HTMLElement);
        hasTracked.current = true;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (document.readyState === "complete") {
              setTimeout(() => {
                handlePush(entry.target);
                observer.unobserve(entry.target);
              }, 1000);
            } else {
              window.addEventListener(
                "load",
                () => {
                  setTimeout(() => {
                    handlePush(entry.target);
                    observer.unobserve(entry.target);
                  }, 1000);
                },
                { once: true },
              );
            }
          }
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [cardCount, isHomePage, isSearchCards,isPopupOpen]);

  const cardTheme: Record<string, string> = {
    "solid-secondary": "bg-solid-secondary text-white",
    "solid-primary": "bg-solid-primary",
    "solid-gray": "bg-solid-gray",
    "solid-white": "bg-[#FFFFFF]",
    transparent: "",
  };

  const themeClass = cardTheme[card_color_theme] || "";

  const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isStorePage = pathname.includes("/stores");

    if (!isStorePage || isSearchCards) return;

    clickPushToDataLayer(e);
  };

  return (
    <div ref={cardRef} className={`${wrapperClass}`}>
      {card_style === "overlay-card" && (
        <div
          className={`overlay-card card-item tru-tile relative overflow-hidden group ${mainCardClass}`}
          data-vieweventname="tile_view"
          data-clickeventname="tile_click"
          data-title={title || ""}
          data-eventcategory={sectionTitle || ""}
          data-index={cardCount || ""}
          data-tag={cardDataTag}
        >
          <div
            className={`${imgWrapperClass} card-img-wrapper bg-[#D3D3D3]! w-full inset-0 before:content-['']
            before:absolute  before:z-10 before:bg-linear-(--card-overlay-mobile) before:md:bg-linear-(--card-overlay) before:h-full before:w-full`}
          >
            {imageSrc && (
              <Image
                src={imageSrc}
                alt={imageAlt || title || ""}
                fill
                loading="lazy" 
                className="object-cover  h-full w-full "
              />
            )}

            {imageMobileSrc && (
              <Image
                src={imageMobileSrc}
                alt={title || ""}
                loading="lazy" 
                fill
                className="object-cover  h-full w-full "
              />
            )}


          </div>
          {icon && (
            <div className="absolute top-7 left-5 z-20 w-38.5 h-13.25">
              <Image src={icon} alt="icon" fill className="object-contain" />
            </div>
          )}
          <div
            className={`${
              contentWrapperClass ? contentWrapperClass : "4xl:p-10 p-6 md:pr-6 pr-4"
            } w-full absolute bottom-0 z-20 `}

          >
            {title && (
              <h3
                className={`text-white! card-title tru-tile-heading group-hover:text-(--dark-heading)! text-[24px] xm:text-[32px] leading-7.5 xm:leading-11 ${titleClass}`}
                dangerouslySetInnerHTML={{ __html: title }}
              ></h3>
            )}

           {content && content !== "null" && (
            <div
              dangerouslySetInnerHTML={{ __html: content }}
                className={`text-white card-desc [&_p>a]:inline-block [&_p]:text-[14px] xm:[&_p]:text-[16px] [&_p]:leading-5 xm:[&_p]:leading-6 [&_p]:text-white! group-hover:[&_p]:text-(--dark-heading)!  group-hover:text-(--dark-heading)!  mt-2 max-w-175 ${contentClass}`}
              />
            )}

            
            {(item.cardLink || actions) && (
              <div
                className={`flex card-cta-wrapper [&_a]:text-[14px] xm:[&_a]:text-[18px] [&_a]:leading-5 xm:[&_a]:leading-6 gap-6 mt-6 [&_a]:text-white! group-hover:[&_a]:text-(--dark-heading)! ${ctaWrapperClass}`}
              >
                {item.cardLink ? (
                  <Link
                    href={item.cardLink || "#"}
                    onClick={(e) => handleCardLinkClick(e)}
                    data-clickeventname="cta_click"
                    data-title={item.cardLinkText ? item.cardLinkText : "Read More"}
                    data-eventcategory={sectionTitle}
                    data-tag={item.title}
                    className={`font-bold layout-cta underline  text-[18px] hover:text-(dark-heading) leading-6 text-white! cursor-pointer ${ctaClass}`}
                  >
                  {item.cardLinkText ? item.cardLinkText : "Read More"}

                  </Link>
                ) : (
                  actions
                )}
              
              </div>
            )}

          </div>
       <div className="absolute h-105 bottom-0 z-11 w-full bg-linear-(--hover-bg) opacity-0 transition-opacity duration-500 ease-in-out
     group-hover:opacity-100"></div>
        </div>
      )}

      {card_style === "info-card" && (
        <div
          className={`card-item tru-tile info-card relative ${mainCardClass} ${themeClass}`}
        >
          {imageSrc && (
                <div
                  className={`${imgWrapperClass} card-img-wrapper group w-full relative`}
                >
                  <Image
                    src={imageSrc}
                    alt={imageAlt || title || ""}
                    loading="lazy" 
                    fill
                    className="object-cover  w-full h-full"
                  />
                {imageMobileSrc && (
              <Image
                src={imageMobileSrc}
                loading="lazy" 
                alt={title || ""}
                fill
                className="object-cover h-full w-full "
              />
            )}
                 {item.cardLink && (
                <div className="absolute learnMore invisible  bg-linear-(--hover-bg) group-hover:flex items-end pb-6  justify-center w-full h-30 bottom-0  text-(--dark-heading) left-0 right-0 font-medium text-center mx-auto.
                opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-hover:visible">
                   <Link
                      href={item.cardLink || "#"}
                      onClick={(e) => handleCardLinkClick(e)}
                      data-clickeventname="cta_click"
                      data-title={title}
                      data-eventcategory={sectionTitle}
                      data-tag={item.title}
                      className="layout-cta relative group"
                      >
                        {cardLinkText ? cardLinkText : "Learn More"}
                    </Link>
                  </div>
                  )}
                  </div>
              )}

          <div className={`mt-3 md:mt-4 tile-outer ${cardWrapperClass}`}>
            {item.cardLink ? (
              <h3
                className={`xl:text-[28px] card-title tru-tile-heading text-[20px] font-normal xl:leading-11 leading-7 mr-1 ${titleClass}`}
              >
                <Link
                  href={item.cardLink || "#"}
                  onClick={(e) => handleCardLinkClick(e)}
                  onMouseEnter={(e) => handleLinkHover(e)}
                  data-vieweventname="cta_hover"
                  className="no-underline layout-cta"
                  data-clickeventname="cta_click"
                  data-title={title}
                  data-eventcategory={sectionTitle}
                  data-tag={item.title}
                >
                  <span dangerouslySetInnerHTML={{ __html: title ?? ""}}/>
                  
                </Link>
              </h3>
            ) : (
              title && (
                <h3
                  className={`md:text-[28px] card-title tru-tile-heading text-[20px] font-normal md:leading-11 leading-7 ${titleClass}`}
                  dangerouslySetInnerHTML={{ __html: title }}
                ></h3>
              )
            )}
            {content && (
              <div
                suppressHydrationWarning={true}
                dangerouslySetInnerHTML={{ __html: content || ''}}
                className={` card-desc mt-2 text-[#646464] leading-5 [&_p]:text-sm [&_p>a]:inline-block [&_li]:text-sm [&_li>strong]:text-sm [&_strong]:text-[18px] [&_strong]:inline-block [&_strong]:font-bold [&_strong]:text-[#141414] ${contentClass}`}
              />
            )}
            {actions && (
              <div
                className={`mt-4 flex card-cta-wrapper flex-wrap gap-4 ${ctaWrapperClass}`}>
                {actions}
                
              </div>
            )}
          </div>
        </div>
      )}

      {card_style === "step-card" && (
        <div
          className={`card-item tru-tile step-card flex flex-col items-center border border-(--border-gray-light) p-6 md:p-8 ${mainCardClass}`}
        >
          <div
            className={`flex card-count-wrapper items-center justify-center text-[40px] md:text-5xl text-(--dark-heading) font-medium  ${indexClass}`}
          >
            <span>{cardCount}</span>
          </div>
          {title && (
            <h3
              className={` text-[26px] md:text-[28px] card-title tru-tile-heading text-(--dark-heading) leading-6 mt-6 ${titleClass}`}
              dangerouslySetInnerHTML={{ __html: title }}
              suppressHydrationWarning={true}
            ></h3>
          )}
          {content && (
            <div
              dangerouslySetInnerHTML={{ __html: content }}
              suppressHydrationWarning={true}
              className={` text-center card-desc text-(--primary-text) mt-6 [&_p>a]:inline-block  [&_p]:text-sm [&_p]:mb-0 [&_p]:leading-5.25 ${contentClass}`}
            />
          )}
        </div>
      )}

      {card_style === "gift-card" && (
        <div
          className={`card-item tru-tile gift-card bg-[#222222] relative p-8 flex flex-col items-center justify-between text-center ${mainCardClass}
          after:content-[''] after:bg-linear-(--card-overlay) after:w-full after:top-0 after:z-10 after:h-full after:absolute`}
        >
          {imageSrc && (
            <div
              className={`${imgWrapperClass} relative   card-img-wrapper max-w-60 z-0 w-full`}
            >
              <Image
                src={imageSrc}
                alt={imageAlt || title || ""}
                loading="lazy" 
               fill
                className="w-full"
              />
              {imageMobileSrc && (
              <Image
              loading="lazy" 
                src={imageMobileSrc}
                alt={imageAlt || title || ""}
                fill
                className="object-cover  relative  card-img-wrapper max-w-60 z-0 w-full "
              />
            )}
            </div>
          )}

          <div className="relative z-20">
            {title && (
              <h3
                className={`md:text-[28px] card-title tru-tile-heading text-[24px] text-white mt-8 md:leading-11 leading-9 ${titleClass}`}
                dangerouslySetInnerHTML={{ __html: title }}
                suppressHydrationWarning={true}
              ></h3>
            )}
            {actions && (
              <div
                className={`flex flex-wrap card-cta-wrapper justify-center gap-4 [&_a]:text-white text-[18px] mt-6 ${ctaWrapperClass}
               ${actions === null ? "mt-8" : ""}`}
              >
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {card_style === "compact-card" && (
        <div
          className={`card-item tru-tile compact-card border border-[#A7A7A740] relative flex flex-col h-full hover:bg-[#A7A7A740] transition ${mainCardClass} ${themeClass}`}
        >
            
          
          <div
            className={`p-6 md:p-8 flex flex-col compact-card-col flex-1  ${cardWrapperClass}`}
          >
             {imageSrc && (
            <div
              className={`${imgWrapperClass} relative card-img-wrapper  z-0 w-full mb-6 md:mb-8`}
            >
              <Image
                src={imageSrc}
                alt={imageAlt || title || ""}
                fill
                className="w-full object-cover" 
              />
              {imageMobileSrc && (
              <Image
                src={imageMobileSrc}
                alt={imageAlt || title || ""}
                fill
                priority
                className="object-cover  relative  card-img-wrapper z-0 w-full "
              />
            )}
            </div>
          )}
            <div>
              {title && (
                <h3
                  className={`md:text-[28px] card-title tru-tile-heading text-[20px] font-normal md:leading-11 leading-7 no-underline ${titleClass}`}
                  dangerouslySetInnerHTML={{ __html: title }}
                  suppressHydrationWarning={true}
                ></h3>
              )}
              {content && (
                <div
                  dangerouslySetInnerHTML={{ __html: content }}
                  suppressHydrationWarning={true}
                  className={`${contentClass} card-desc mt-2 text-[#646464] [&_p]:text-[14px] [&_p>a]:inline-block text-[14px] leading-5 [&_p]:mb-4 [&_p]:last:mb-0`}
                />
              )}
            </div>
            {actions && (
              <div
                className={`mt-4 flex flex-wrap gap-4 card-cta-wrapper  ${ctaWrapperClass} [&_a]:text-(--dark-heading)!`}
              >
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
