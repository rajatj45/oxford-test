import React from "react";
import Carousel from "@/components/Carousel";
import Image from "next/image";

interface ItemProps {
  url?: string;
  alt?: string;
}

interface GalleryData {
  items: ItemProps[];
  className?: string;
}

const Settings = {
  dots: true,
  speed: 200,
  focusOnSelect: true,
  accessibility: true,
};

const ImageSlider = ({ items, className }: GalleryData) => {
  return (
    <Carousel
      className="[&_.slick-dots]:-bottom-5! mb-0! md:[&_.slick-dots]:bottom-4! md:h-full md:absolute w-full"
      settings={Settings}
      dotClass="md:absolute md:h-[64px] md:flex!  md:items-center md:w-[240px]! md:max-w-[240px] md:bg-white md:mx-auto! md:left-0 md:right-0"
      prevArrowClassName="
        md:bottom-6!
        md:top-auto
        md:left-[calc((100%-235px)/2)]
        md:-translate-x-0
        md:-translate-y-0!
        md:border-(--bg-gray)
        md:shadow-none!
        md:[&_i]:text-(--secondary)
      "
      nextArrowClassName="
        md:bottom-6!
        md:top-auto
        md:left-[calc((100%--42px)/2)]
        md:translate-x-full
        md:border-(--bg-gray)
        md:shadow-none!
        md:[&_i]:text-(--secondary)
        md:-translate-y-0!
      "
    >
      {items?.map(({ url = "", alt = "" }, index) => (
        <div key={index} className="pt-[56.25%] relative">
          <Image src={url} alt={alt}  loading="lazy"  fill className={`h-full  object-cover ${className}`} />
        </div>
      ))}
    </Carousel>
  );
};
export default ImageSlider;
