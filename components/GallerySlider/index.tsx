"use client";
import { useMemo, useRef } from "react";
import Carousel from "@/components/Carousel";
import Image from "next/image";
import Slider, { Settings } from "react-slick";
import { DeviceDisplay } from "@/types/global";

interface GalleryItem {
  url?: string;
  alt?: string;
}

export interface GallerySliderData {
  section_title?: string;
  additional_classes?: string;
  enable_dots?: DeviceDisplay | undefined;
  enable_arrows?: DeviceDisplay | undefined;
  center_mode?: DeviceDisplay | undefined;
  visible_slides?: string | number;
  visible_slides_mobile?: string | number;
  gallery?: GalleryItem[];
  centerPadding?: string;
  top_spacing?:  string;
  bottom_spacing?:  string;
  mobile_top_spacing?:  string;
  mobile_bottom_spacing?:  string;
}

interface GallerySliderProps {
  data: GallerySliderData;
  className?: string

}

export const GallerySlider = ({ data, className }: GallerySliderProps) => {
  const sliderRef = useRef<Slider | null>(null);

  const isEnabled = (val: string | undefined, device: "desktop" | "mobile") => {
    if (!val) return false;
    return val === "all_device" || val === device;
  };

const sliderSettings: Settings = useMemo(() => {
    const slideCount = data.gallery?.length ?? 0;
    const slidesToShow = Number(data?.visible_slides) || 1;
    const mobileSlides = Number(data?.visible_slides_mobile) || 1;

    return {
      dots: isEnabled(data?.enable_dots, "desktop"),
      arrows: isEnabled(data?.enable_arrows, "desktop"),
      speed: 500,
      slidesToShow: slidesToShow,
      slidesToScroll: 1,
      centerPadding: '80px',
      centerMode: isEnabled(data?.center_mode, "desktop"),
      // FIX 2: Critical! Disable infinite if you don't have enough slides.
      // react-slick crashes DevTools if it tries to clone 1 slide into an infinite loop.
      infinite: slideCount > slidesToShow,
      focusOnSelect: true,
      accessibility: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: slidesToShow,
            dots: isEnabled(data?.enable_dots, "desktop"),
            arrows: isEnabled(data?.enable_arrows, "desktop"),
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: mobileSlides,
            dots: false,
            arrows: isEnabled(data?.enable_arrows, "mobile"),
            centerPadding: "40px",
            infinite: slideCount > mobileSlides,
          },
        },
      ],
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);
const renderedSlides = useMemo(() => {
    return data.gallery?.map((item, index) => (
      <div
        key={item.url || `slide-${index}`}
        className={`${Number(data?.visible_slides) === 1 ? "h-[250px] md:h-[500px]" : "px-3"}`}
        role="group"
        aria-roledescription="slide"
        aria-label={`Slide ${index + 1} of ${data.gallery?.length}`}
      >
        <div className="relative w-full h-full min-h-[250px] imageWrapper">
          <Image
            src={item?.url || "/images/img-placeholder.jpg"}
            alt={item?.alt || `Gallery image ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    ));
  }, [data.gallery, data.visible_slides]);
  const spacingStyles: React.CSSProperties = {
  "--spaceTop": `${data?.top_spacing ?? 0}px`,
  "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
  "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
  "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
} as React.CSSProperties;
  return (
    <div
      className={`${data.additional_classes}
      md:pt-(--spaceTop)
      md:pb-(--spaceBottom)
      pb-(--spaceBottomMobile)
      pt-(--spaceTopMobile)`}
      role="region"
      aria-roledescription="carousel"
      aria-label={data.section_title || "Image gallery"}
     style={spacingStyles}>
      {data.section_title && (
        <div className="container">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <h2 className="text-[32px] leading-12 md:text-[40px] md:leading-14">{data.section_title}</h2>

            <div className="flex gap-6">
              <button
                onClick={() => sliderRef.current?.slickPrev()}
                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center cursor-pointer"
                aria-label="Previous slide"
                type="button"
              >
                <i className="icon-long-arrow-left text-(--dark-heading) text-xs"></i>
              </button>
              <button
                onClick={() => sliderRef.current?.slickNext()}
                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center cursor-pointer"
                aria-label="Next slide"
                type="button"
              >
                <i className="icon-long-arrow-left text-xs  text-(--dark-heading) rotate-180" aria-hidden="true"></i>
              </button>
            </div>

          </div>
        </div>
      )}

       <div className={`${Number(data?.visible_slides) === 1 ? 'container' : 'w-full'} ${className}`} aria-live="polite">
        <Carousel dotClass="relative! mt-3!" ref={sliderRef} settings={sliderSettings}>
          {renderedSlides}
        </Carousel>
      </div>
    </div>
  );
};

export default GallerySlider;
