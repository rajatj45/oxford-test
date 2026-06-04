"use client";

import { getBaseUrl, pushCardsToDataLayer } from "@/utils/utility";
import Link from "next/link";

type Alignment = "left" | "center" | "right" | (string & {});

interface CtaProps {
  url?: string | null;
  title?: string | null;
  target?: string | null;
}

interface DataList {
  section_layout?: string | null;
  section_title?: string | null;
  section_subTitle?: string | null;
  alignment?: Alignment;
  cta?: CtaProps[] | CtaProps | null;
  section_alignment?: Alignment;
  section_intro_width?: string;
  section_orientation? :string;
  

}

interface SectionDataProps {
  data?: DataList;
  titleClass?: string;
  ctaWrapperClass?: string;
  layoutClass?: string;
  subTittleClass?: string;
  headingId?: string;
  sectionClass?: string
}

export default function SectionIntroBlock({
  data = {},
  titleClass = "",
  ctaWrapperClass = "",
  layoutClass = "",
  headingId = "",
  subTittleClass= "",
  sectionClass="",
 
}: SectionDataProps) {
  if (!data) return null;

  const {
    section_title,
    section_subTitle,
    cta,
    section_intro_width = "",
  } = data;

  const alignment = data.alignment || "left";
  const sectionAlign = data.section_alignment || "left";
  
  const sectionOrientation = data.section_orientation;
  const isCenter = sectionAlign === "center";
  const isRight = sectionAlign === "right";

  const normalizedCta = Array.isArray(cta)
    ? cta
    : cta?.title || cta?.url
      ? [cta]
      : [];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const href = target.getAttribute("href") || "";
    target.setAttribute("data-index", `${getBaseUrl()}${href}`);
    pushCardsToDataLayer(target, e.type);
  };

  const ctaGroup = normalizedCta.length > 0 && (
    <div
      className={`flex flex-wrap gap-4 mt-0 md:mt-6 items-center
        ${isCenter ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start"} 
        ${ctaWrapperClass}`}
    >
      {normalizedCta.map((item, key) => (
        <Link
          key={key}
          href={item?.url || "#"}
          target={item.target ?? "_self"}
          className="layout-cta font-medium text-[18px] text-[#141414] underline underline-offset-2 leading-6 hover:opacity-80 transition-opacity"
          onClick={handleLinkClick}
          data-clickeventname="cta_click"
          data-title={item.title}
          data-eventcategory={section_title?.replace(/<[^>]*>?/gm, "")}
        >
          {item.title}
        </Link>
      ))}
    </div>
  );

  return (
    <div className={`${section_intro_width}  w-full ${sectionClass}`}>
       <div
        className={`flex flex-wrap md:flex-nowrap gap-4 md:gap-8 items-end pb-4 md:pb-0  
        ${isRight ? "flex-row-reverse" : "flex-row"} 
        ${isCenter ? "md:justify-center justify-start text-left md:text-center" : "justify-between text-left"}
        ${section_title || section_subTitle ? "mb-4 sm:mb-8"  : ""} ${layoutClass}
        ${sectionOrientation === 'sec-col'? "flex-wrap! gap-2! md:gap-4!" :""}`
       }
      >
        <div
          className={`w-full ${titleClass} ${isCenter ? "md:text-center" : isRight ? "text-right" : "text-left"}`}
        >
        {section_title && (
            <h2
              className="text-[#141414] tru-section-title"
              dangerouslySetInnerHTML={{ __html: section_title }}
              suppressHydrationWarning
              id={headingId}
            />
          )}

          {section_subTitle && (
            <div
              className={`mt-4 text-base md:text-lg [&_p]:last:mb-0
                ${isCenter ? "section-sub-title [&_p]:text-left md:[&_p]:text-center [&_p]:md:text-[28px] [&_p]:text-[18px] [&_p]:md:leading-9 " : ""} ${subTittleClass}`}
              dangerouslySetInnerHTML={{ __html: section_subTitle }}
              suppressHydrationWarning
            />
          )}
         {isCenter && ctaGroup}
        </div>
         {!isCenter && normalizedCta.length > 0 && (
          <div className={`shrink-0 md:pb-1 `}>{ctaGroup}</div>
        )}
      </div>
    </div>
  );
}
