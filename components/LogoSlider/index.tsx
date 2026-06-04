import Image from "next/image";
import Carousel from "../Carousel";
import { BlockData } from "@/types/global";
import SectionIntroBlock from "@/components/SectionIntroBlock"

const brandSettings = {
  speed: 8000,
  autoplay: true,
  autoplaySpeed: 0,
  cssEase: "linear",
  slidesToShow: 1,
  slidesToScroll: 1,
  infinite: true,
  variableWidth: true,
  arrows: false,
  dots: false,
  pauseOnHover: false,
  pauseOnFocus: false,
};

export default async function LogoSlider({ data }: { data: BlockData }) {
  if (!data) return null;

  const sliderConfig = Array.isArray(data?.enable_slider)
    ? data.enable_slider[0]
    : data?.enable_slider;

  const sliderVisibilityClass =
    sliderConfig === "all"
      ? "block"
      : sliderConfig === "desktop"
        ? "hidden md:block"
        : sliderConfig === "mobile"
          ? "block md:hidden"
          : "hidden";

  const staticVisibilityClass =
    sliderConfig === "no"
      ? "flex"
      : sliderConfig === "all"
        ? "hidden"
        : sliderConfig === "desktop"
          ? "flex md:hidden"
          : sliderConfig === "mobile"
            ? "hidden md:flex"
            : "flex";

  const imageList = data?.gallery?.map((item, index) => (
    <div className=" md:px-0 px-3 md:mb-0  logo-image relative   last:mb-0" key={index}>
      <Image
        src={item.url || ""}
        alt={item.alt || ""}
        fill
        className=" relative! "
        loading="lazy" 
      />
    </div>
  ));

  const contentRender = (
    <>
      {sliderConfig !== "no" && (
        <div
          className={`${sliderVisibilityClass} container mx-auto overflow-hidden`}
        >
          <Carousel
            settings={brandSettings}
            className="[&_.slick-track]:flex! [&_.slick-track]:items-center py-1 [&_.slick-slide]:md:mr-20 [&_.slick-slide]:mr-12"
          >
            {imageList}
          </Carousel>
        </div>
      )}
      <div className={`container`}>
        <div
          className={`${staticVisibilityClass} flex justify-center  items-center xl:gap-20 md:gap-10 flex-wrap mobile-logos`}
        >
          {imageList}
        </div>
      </div>
    </>
  );

  const hasHeader =
    data?.section_title?.trim() ||
    data?.section_subTitle?.trim() ||
    data?.cta?.url;
 const spacingStyles: React.CSSProperties = {
  "--spaceTop": `${data?.top_spacing ?? 0}px`,
  "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
  "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
  "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
} as React.CSSProperties;

  return (
    <div className={`logo-slider ${data?.additional_classes || ""}
      md:mt-(--spaceTop)
      md:mb-(--spaceBottom)
      mb-(--spaceBottomMobile)
      mt-(--spaceTopMobile)`} style={spacingStyles}>
      <div className="main-container">
        {hasHeader && (<SectionIntroBlock data={data} />)}

        {data?.section_layout === "container" ? (
          <>{contentRender}</>
        ) : (
          contentRender
        )}
      </div>
    </div>
  );
}
