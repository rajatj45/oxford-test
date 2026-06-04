import React from "react";
import InnerBanner from "../../InnerBanner";

import GallerySlider from "../../GallerySlider";
import Card from "../../Card";
import Image from "next/image";
import { BlockData } from "@/types/global";

// Define the shape of an individual image object

interface LunarRow {
  block_description: string;
  block_image: GalleryImage;
}
interface LunarColumn {
  column_description: string;
  column_image: GalleryImage;
}
interface GalleryImage {
  url?: string;
  alt?: string;
}

interface PageProps {
  pageTitle?: string;
  pageBanner?: string;
  galleryData?: GalleryImage[];
  contentImage?: string;
  lunarColumns?: LunarColumn[];
  lunarRowData?: LunarRow[];
  galleryTitle?: string;
}

export const  EventTemplateOne = ({
  pageTitle,
  pageBanner,
  galleryData,
  lunarColumns,
  lunarRowData,
}: PageProps) => {

  const mappedGallery =
    galleryData?.map((imageString) => ({
      url: String(imageString.url),
      alt: String(imageString.alt),
    })) || [];

  return (
    <>
      <InnerBanner
        data={
          {
            section_title: pageTitle,
            main_image: pageBanner,
          } as BlockData
        }
      />
      <div className="pt-16 md:pt-20 ">
        <div className="flex justify-center flex-wrap md:flex-nowrap md:gap-24 gap-14">
          {lunarColumns?.map((item, index) => (
            <div
              key={index}
              className="flex
           flex-col-reverse md:flex-col [&_.block-text_p]:mb-0! last:flex-col-reverse md:gap-0
           [&_img]:md:pl-0 [&_img]:pl-12 gap-14 [&_h2]:lg:leading-14 [&_h2]:leading-12 [&_h2]:lg:text-[40px] [&_h2]:text-[32px]
            [&_.block-text]:lg:px-0
           [&_.block-text]:px-6
          [&_h2]:max-w-[673px] [&_h2]:mx-auto [&_h2]:mb-0 [&_h2]:md:mb-[100px] last:[&_.block-text_p]:max-w-[648px]
        last:[&_.block-text_p]:md:text-2xl!
          last:[&_.block-text_p]:lg:text-[32px]!
        last:[&_.block-text_p]:font-light  last:[&_.block-text_p]:text-base  last:[&_.block-text_p]:leading-6! last:[&_.block-text]:md:mt-[73px]
        last:[&_.block-text]:mt-0  last:[&_.block-text_p]:md:leading-9! last:[&_img]:pl-0 last:[&_img]:pr-12 last:[&_img]:md:pr-0"
            >
              <div className="col-heading">
                <div
                  dangerouslySetInnerHTML={{
                    __html: String(item.column_description || ""),
                  }}
                  className="block-text"
                />
              </div>

              {item.column_image && (
                <Image
                  src={item.column_image.url || ''}
                  alt={item.column_image.alt || ''}
                  width={912}
                  height={682}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-16">
        <div className="container">
          {lunarRowData?.map((row, index) => (
            <div
              key={index}
              className="flex items-center justify-center flex-col gap-3 md:gap-10
      [&_h2]:text-[32px] [&_h2]:leading-12 [&_h2]:md:text-[40px] [&_h2]:md:leading-14"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: String(row.block_description || ""),
                }}
              />
              <div>
                {row.block_image && (
                  <Image
                    src={row.block_image.url || ''}
                    alt={row.block_image.alt || ''}
                    width={1680}
                    height={682}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 md:mt-16 md:mb-20 mb-16">
        <GallerySlider
          data={{
            section_title: "More Images",
            gallery: mappedGallery,
            visible_slides: 3,
            centerPadding: "70px",
            enable_dots: "none",
            center_mode: "all_device",
          }}
          className="[&_.imageWrapper]:md:min-h-[348px] [&_.imageWrapper]:min-h-[276px] [&_.imageWrapper]:aspect-video"
        />
      </div>
    </>
  );
};

export default EventTemplateOne;
