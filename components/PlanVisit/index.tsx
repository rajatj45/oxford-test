"use client";
import Link from "next/link";
import SectionIntroBlock from "../SectionIntroBlock";
import Carousel from "../Carousel";
import { Settings } from "react-slick";
import { clickPushToDataLayer } from "@/utils/utility";

interface NavLink {
  cta_label?: string;
  cta?: {
    url?: string;
    title?: string;
    target?: string;
  };
}

interface PlanVisitProps {
  data: {
    section_title?: string;
    section_subTitle?: string;
    bg_color?: string;
    alignment?: string;
    section_layout?: string;
    additional_classes?: string;
    cta_label?: string | null;
    links?: NavLink[];
    top_spacing?: string;
    bottom_spacing?: string;
    mobile_top_spacing?: string;
    mobile_bottom_spacing?: string;
  };
}

const sliderSettings: Settings = {
  dots: false,
  arrows: false,
  infinite: true,
  speed: 500,
  slidesToShow: 5,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1280,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 2,
      },
    },
  ],
};

export default function PlanVisit({ data }: PlanVisitProps) {
  const backgroundClass = data?.bg_color || "bg-(--surface-primary)";

  if (!data?.links || data.links.length === 0) {
    return null;
  }

const spacingStyles: React.CSSProperties = {
  "--spaceTop": `${data?.top_spacing ?? 0}px`,
  "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
  "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
  "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
} as React.CSSProperties;

  return (
    <div
      className={`tru-block plan-visit-block ${backgroundClass} ${data?.additional_classes || ""} py-12
      md:mt-(--spaceTop)
      md:mb-(--spaceBottom)
      mb-(--spaceBottomMobile)
      mt-(--spaceTopMobile)
      `}
      style={spacingStyles}
    >
      <div className="main-container mx-auto">
         {(data.section_title || data.section_subTitle) && (
            <SectionIntroBlock data={data} />
          )}
        <div className="container">

          <div className="w-full ">
            <div className="overflow-x-auto py-6 flex justify-between scroll-smooth gap-8 md:gap-10"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'transparent transparent',
              }}
            >

              {data.links.map((linkItem, index) => {
                const label =
                  linkItem?.cta_label || linkItem?.cta?.title || "Learn More";
                const href = linkItem?.cta?.url || "#";

                return (
                  <div key={index} className="flex-shrink-0 mr-0 md:mr-10">
                    <Link
                      href={href}
                      target={linkItem?.cta?.target}
                      className="text-[18px] layout-cta xm:text-[24px] text-[#141414] font-larken lg:text-[28px] lg:leading-11 underline-offset-3 font-normal underline block transition-all whitespace-nowrap"
                      onClick={clickPushToDataLayer}
                      data-clickeventname="cta_click"
                      data-title={label}
                      data-eventcategory={data?.section_title}
                      data-tag={data?.section_title}
                    >
                      {label}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
