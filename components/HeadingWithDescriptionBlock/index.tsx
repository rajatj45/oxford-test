"use client";
import { BlockData } from "@/types/global";
import Link from "next/link";
import { clickPushToDataLayer } from "@/utils/utility";
import { MouseEvent } from "react";

interface SectionProps {
  className?: string;
}

interface ActionItem {
  title?: string;
  url?: string;
  target?: string;
  cta?: {
    title?: string;
    url?: string;
    target?: string;
  };
}

export default function HeadingWithDescription({
  data,
  sectionProps,
}: {
  data?: BlockData;
  sectionProps?: SectionProps;
}) {
  if (!data) return null;

  const {
    content,
    section_title,
    section_subTitle,
    section_alignment = "left",
    block_id,
    section_orientation,
    cta,
    links = [],
    additional_classes = "",
    section_layout = "container",
  } = data;

  
  const normalizedCta = cta ? (Array.isArray(cta) ? cta : [cta]) : [];
  const totalActions = normalizedCta.length + links.length;
const hasMultipleActions = totalActions > 2;
 const singleCta = normalizedCta.length > 0;


  const RenderAction = ({ item, isLink = true }: { item: ActionItem; isLink?: boolean }) => {
    const handlePushClick = (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      clickPushToDataLayer(e);
    };

    const commonProps = {
      className: `font-medium layout-cta text-black text-lg underline flex items-baseline gap-2 cursor-pointer hover:opacity-80 transition-opacity ${hasMultipleActions ? "mb-4" : "mb-0"}`,
      "data-clickeventname": isLink ? "cta_click" : "button_click",
      "data-title": item.title || "",
      "data-index": item.url || "#",
      "data-eventcategory": section_title || "",
      "data-tag": section_title || "",
      onClick: handlePushClick,
    };

    const label = item.title?.replace(/&amp;/g, "&") || item.cta?.title?.replace(/&amp;/g, "&");
    const url = item.url || item.cta?.url;
    const target = item.target || item.cta?.target || "_self";

    return url ? (
      <Link href={url} target={target} {...commonProps}>
        {label}
      </Link>
    ) : (
     null
    );
  };

  const alignClass = 
    section_alignment === "center" ? "text-left md:text-center" : 
    section_alignment === "right" ? "text-right" : "text-left";

  const spacingStyles = {
    "--spaceTop": `${data.top_spacing ?? 0}px`,
    "--spaceBottom": `${data.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;

  const alignmentClasses = {
    center: "flex-col justify-start text-left md:text-center md:justify-center",
    right: "flex-row-reverse text-right",
    left: "text-left",
  };

  const isRow = section_orientation === "sec-row";
  const isCol = section_orientation === "sec-col";
 
  const hasBothActions = normalizedCta.length > 0 || links.length > 0;
  const directionClass = isRow ? (hasBothActions ? "flex-col" : "flex-row") : "flex-wrap";
  const actionDirectionClass = isCol ? (hasBothActions ? "flex-col gap-0 md:gap-0! " : "") : "flex-wrap";
  const hasCta = normalizedCta?.some(item => item && (item.label || item.title || item.url));
  const hasLinks = links?.some(item => item && (item.cta_label || item.title || item.url));
  
  console.log(data)

  return (
    <div
      className={`tru-block heading-block heading-with-description ${additional_classes} text-${section_alignment} ${sectionProps?.className || ""} md:pt-(--spaceTop) md:pb-(--spaceBottom) pb-(--spaceBottomMobile) pt-(--spaceTopMobile)`}
      style={spacingStyles}
    >
      <div className="main-container">
         <div className={section_layout}>
          <div className={`intro-block`}>
             <div className={`block  ${directionClass || actionDirectionClass} md:flex ${section_title || section_subTitle ? "justify-between gap-0 md:gap-8" : ""}  ${alignmentClasses[section_alignment as keyof typeof alignmentClasses]}`}>
              <div className={`intro-block-title ${section_title && section_subTitle && singleCta  ? "flex-1" : ""}    ${section_alignment === "center" ? "justify-center flex-col flex" : ""}`}>
                {section_title && (
                  <h2 className="text-[#141414] tru-section-title" dangerouslySetInnerHTML={{ __html: section_title }} id={block_id} />
                )}
                {section_subTitle && (
                  <div
                    className={`text-lg w-full mx-auto ${section_alignment === "center" ? "block-sub-heading [&_p]:md:text-[28px] [&_p]:md:leading-9  [&_p]:text-[18px] [&_p]:leading-6 " : ""}`}
                    dangerouslySetInnerHTML={{ __html: section_subTitle }}
                  />
                )}
               
              </div>
               {(hasCta || hasLinks) && (
                <div className={`hidden md:flex flex-wrap gap-4 ${singleCta ? " " : "cta-group"}  ${section_title && section_subTitle && isCol ? "mt-6" : ""} ${section_alignment === "center" ? "justify-center" : section_alignment === "right" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-4  ${actionDirectionClass} ${isRow ? (hasBothActions ? "flex-row" : "shrink-0 self-end") : "flex-wrap"}  ${singleCta ? "self-end" : ""}`}>
                    {normalizedCta.map((item, i) => <RenderAction key={`cta-${i}`} item={item} />)}
                    {links.map((item, i) => <RenderAction key={`link-${i}`} item={item} />)}
                  </div>
                </div>
              )}
            
            </div>
            {content && (
              <div
                className={`into-block-content w-full  ${hasBothActions? "mt-8": ""} ${section_title || section_subTitle ? "mt-4" : "" } ${alignClass} [&_p]:last:mb-0`}
                dangerouslySetInnerHTML={{ __html: content }}
                suppressHydrationWarning
              />
            )}
            {(hasCta || hasLinks) && (
                <div className={`flex flex-wrap  md:hidden gap-4 ${singleCta ? " " : "cta-group"}  ${section_title || section_subTitle ? "mt-6" : ""} ${section_alignment === "center" ? "justify-center" : section_alignment === "right" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-4  ${actionDirectionClass} ${isRow ? (hasBothActions ? "flex-row" : "shrink-0 self-end") : "flex-wrap"}  ${singleCta ? "self-end" : ""}`}>
                    {normalizedCta.map((item, i) => <RenderAction key={`cta-${i}`} item={item} />)}
                    {links.map((item, i) => <RenderAction key={`link-${i}`} item={item} />)}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
