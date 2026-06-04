"use client";
import { useMemo, useRef } from "react";
import Carousel from "@/components/Carousel";
import { Settings } from "react-slick";
import SectionIntroBlock from "../SectionIntroBlock";
import {
  BlockData,
  CardColourTheme,
  CardStyles,
  CardsProps,
  PostCardsProps,
} from "@/types/global";
import Card from "@/components/Card";
import CollapseCard from "../CollapseCard";

export default function CardsGridBlock({ data }: { data: BlockData }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const imageDesktopClasses = {
    1: "md:aspect-[1680/500] ",
    2: "md:aspect-[820/500] ",
    3: "md:aspect-[544/320]",
    4: "md:aspect-[402/240]",
  };

  const overlayCardClasses = {
    1: "lg:aspect-[1680/500] aspect-1100/500",
    2: "md:aspect-[820/500]",
    3: "md:aspect-[544/500]",
    4: "md:aspect-[402/500]",
  };

  const isEnabled = (val: string | undefined, device: "desktop" | "mobile") => {
    if (!val) return false;
    return val === "all_device" || val === device;
  };

  const isSliderOn =
    Array.isArray(data?.enable_slider) && data.enable_slider[0] === "yes";
  const vis = data?.slider_visibility;

  const showSlider = {
    desktop: isSliderOn && (vis === "all" || vis === "desktop"),
    mobile: isSliderOn && (vis === "all" || vis === "mobile"),
  };

  //added
  const isCompact = data?.compact_layout?.includes("yes");

  const sliderSettings = useMemo(
    () => ({
      dots: isEnabled(data?.enable_dots, "desktop"),
      arrows: isEnabled(data?.enable_arrows, "desktop"),
      infinite: true,
      autoplay: true,
      speed: 500,
      slidesToShow: Number(data?.visible_slides) || 1,
      slidesToScroll: 1,
      adaptiveHeight: false,
      centerMode: isEnabled(data?.center_mode, "desktop"),
      responsive: [
        {
          breakpoint:1120,
          settings: {
            slidesToShow:  2,
            dots: isEnabled(data?.enable_dots, "desktop"),
            arrows: false,
          },
        },
        {
          breakpoint: 991,
          settings: {
            slidesToShow:2,
            dots: isEnabled(data?.enable_dots, "desktop"),
            arrows: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: Number(data?.visible_slides_mobile) || 1,
            slidesToScroll: 1,
            dots: isEnabled(data?.enable_dots, "mobile"),
            arrows: isEnabled(data?.enable_arrows, "mobile"),
            centerMode: isEnabled(data?.center_mode, "mobile"),
            centerPadding: "40px",
          },
        },
      ],
    }),
    [data],
  );

  const sliderSettingsMobile: Settings = {
    slidesToShow: Number(data?.visible_slides_mobile) || 1,
    slidesToScroll: 1,
    speed: 500,
    dots: isEnabled(data?.enable_dots, "mobile"),
    arrows: isEnabled(data?.enable_arrows, "mobile"),
    centerMode: isEnabled(data?.center_mode, "mobile"),
    centerPadding: "40px",
  };

  const cardStyle = (data?.card_style as CardStyles) || "info-card";
  const cardTheme =
    (data?.card_color_theme as CardColourTheme) || "transparent";

  const hasTitle = data?.section_title?.trim() !== "";
  const hasSubTitle = data?.section_subTitle?.trim() !== "";
  const hasCta = data?.cta?.url && data?.cta?.url.trim() !== "";
  const layoutClass =
    data?.section_layout === "full_width"
      ? "w-full"
      : data?.section_layout === "boxed"
        ? "boxed"
        : "container";
  const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,
    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;
  
  return (
    <div
      ref={containerRef}
      className={`tru-block cards-grid-block
      md:pt-(--spaceTop)
      md:pb-(--spaceBottom)
      pb-(--spaceBottomMobile)
      pt-(--spaceTopMobile)
      ${data?.additional_classes || ""}`}
      style={spacingStyles}
    >
      <div className="main-container">
        {(hasTitle || hasSubTitle || hasCta) && (
          <SectionIntroBlock data={data} layoutClass="mb-4" />
        )}
        <div className={`${layoutClass}`}>
          <div className="hidden md:block">
            {showSlider.desktop ? (
              <Carousel
                settings={sliderSettings}
                dotClass={
                  Number(data?.visible_slides) > 1
                    ? "relative! mt-10! py-[18px]!"
                    : ""
                }
                className={`${cardStyle === "compact-card" ? "[&_.slick-track]:flex! [&_.slick-slide]:h-auto! [&_.slick-slide>div]:h-full!" : ""}  ${Number(data?.visible_slides) > 1 ? "[&_.slick-dots]:bottom-0!" : ""} ${
                  Number(data?.visible_slides) > 1 ||
                  isEnabled(data?.center_mode, "desktop")
                    ? "md:-mx-3"
                    : ""
                }`}
              >
                {data?.cards?.map((item: CardsProps, index: number) => {
                  const slidesCount = Number(
                    data?.visible_slides,
                  ) as keyof typeof imageDesktopClasses;
                  const desktopImgClass =
                    cardStyle == "overlay-card"
                      ? overlayCardClasses[slidesCount] || overlayCardClasses[1]
                      : imageDesktopClasses[slidesCount] ||
                        imageDesktopClasses[1];

                  return (
                    <Card
                      imgWrapperClass={desktopImgClass}
                      sectionTitle={data?.section_title}
                      cardDataTag="slider"
                      key={index}
                      item={{
                        title: item.title,
                        content: item.subTitle,
                        imageSrc: item.image?.url,
                        imageAlt: item.image?.alt,
                        links: item.links,
                        cardCount: index + 1,
                      }}
                      wrapperClass={
                        Number(data?.visible_slides) > 1 ||
                        isEnabled(data?.center_mode, "desktop")
                          ? `${isCompact ? "px-0" : "px-3"} ${cardStyle === "compact-card" ? "h-full! " : ""}`
                          : "h-full"
                      }
                      card_color_theme={cardTheme}
                      contentClass={`${cardStyle === "compact-card" ? "h-auto!" : ""}
                      `}
                      card_style={cardStyle}
                      mainCardClass={`${cardStyle === "compact-card" ? "h-full! " : ""}`}
                      contentWrapperClass={`${cardStyle === "compact-card" ? "h-full! " : ""} ${
                        Number(data?.visible_slides) <= 1 &&
                        isEnabled(data?.enable_dots, "desktop") &&
                        isEnabled(data?.enable_arrows, "desktop")
                          ? "md:px-16 md:p-8 lg:px-20 lg:p-10 p-4"
                          : "lg:p-10 p-4"
                      }`}
                    />
                  );
                })}
              </Carousel>
            ) : (
              <div
                className={`grid lg:grid-cols-${data?.column || 3}

                ${
                  Number(data?.column) >= 2 ? "xxl:grid-cols-2" : "grid-cols-1"
                }  grid-cols-1  ${isCompact ? "gap-0" : "gap-6"} `}
              >
                {data?.cards?.map(
                  (item: CardsProps | PostCardsProps, index: number) => {
                    const isPostCard = "link" in item;
                    const linkUrl = isPostCard
                      ? item.link
                      : (item as CardsProps).links?.[0]?.url || "";
                    const commonPost = {
                      title: item.title,
                      content: isPostCard ? item.content : item.subTitle,
                      thumbnail: {
                        url: isPostCard ? item.thumbnail?.url : item.image?.url,
                        alt: isPostCard ? item.thumbnail?.alt : item.image?.alt,
                      },
                      link: linkUrl, 
                      links: item.links,
                     
                     
                    };

                    const colCount = Number(
                      data?.column,
                    ) as keyof typeof imageDesktopClasses;
                    const desktopImgClass =
                      cardStyle == "overlay-card"
                        ? overlayCardClasses[colCount] || overlayCardClasses[1]
                        : imageDesktopClasses[colCount] ||
                          imageDesktopClasses[1];

                    return cardStyle === "horizontal-card" ? (
                      <CollapseCard
                        key={index}
                        post={commonPost}
                        // post={item as Partial<PostCardsProps> as PostCardsProps}
                        cardStyle={cardStyle}
                        cardCount={index + 1}
                        mainClass=""
                        flexClass={Number(data?.column) > 1 ? "md:flex-[0_0_50%]":"md:flex-[0_0_402px]"}
                      />
                    ) : (
                      <Card
                        imgWrapperClass={`${desktopImgClass} ${data?.column == 1 ? " before:bg-linear-(--image-overlay)!" : ""}`}
                        sectionTitle={data?.section_title}
                        key={index}
                        item={{
                          ...commonPost,
                          imageSrc: commonPost.thumbnail.url,
                          imageAlt: commonPost.thumbnail.alt,
                          links: !isPostCard
                            ? (item as CardsProps).links
                            : undefined,
                          cardCount: index + 1,
                        }}
                        card_color_theme={cardTheme}
                        card_style={cardStyle}
                        mainCardClass="sync-height"
                      />
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>
        <div
          className={`${isEnabled(data?.center_mode, "mobile") ? "w-full " : layoutClass}`}
        >
          <div className="block md:hidden">
            {showSlider.mobile ? (
              <Carousel
                settings={sliderSettingsMobile}
                dotClass={`${Number(data?.visible_slides) > 1 && cardStyle === "overlay-card" ? "relative! mt-6! md:py-[18px]!" : "relative! mt-6!"}
                ${cardStyle === "overlay-card" ? "relative! mt-6! md:py-[18px]!" : "mt-8!"} `}
                className={`[&_.slick-track]:flex! [&_.slick-slide]:h-auto! [&_.slick-slide>div]:h-full! [&_.slick-slide>div>div]:h-full!  [&_.slick-dots]:bottom-0! ${
                  isEnabled(data?.center_mode, "mobile") ? "p-0!" : "md:-mx-3"
                }`}
              >
                {data?.cards?.map((item: CardsProps, index: number) => {
                  const mobileImageClass =
                    cardStyle == "overlay-card"
                      ? "aspect-432/500"
                      : "aspect-432/240";

                  return (
                    <Card
                      imgWrapperClass={mobileImageClass}
                      cardDataTag="slider"
                      sectionTitle={data?.section_title}
                      mainCardClass={`${cardStyle === "compact-card" ? "h-full! " : ""}`}
                      contentWrapperClass={`${cardStyle === "compact-card" ? "h-full! " : ""}`}
                      key={index}
                      item={{
                        title: item.title,
                        content: item.subTitle,
                        imageSrc: item.image?.url,
                        imageAlt: item.image?.alt,
                        imageMobileSrc: item.card_mobile_image?.url,
                        links: item.links,
                        cardCount: index + 1,
                      }}
                      wrapperClass={
                        isEnabled(data?.center_mode, "mobile") ? "px-2" : ""
                      }
                      card_color_theme={cardTheme}
                      card_style={cardStyle}
                      contentClass={`${cardStyle === "info-card" ? "text-sm leading-[21px]" : ""}`}
                    />
                  );
                })}
              </Carousel>
            ) : (
              <div
                className={`grid grid-cols-1 ${isCompact ? "gap-0 " : "gap-6"}`}
              >
                {data?.cards?.map(
                  (item: CardsProps | PostCardsProps, index: number) => {
                    const cardCounts = data?.cards?.length;
                    const mobileImageClass =
                      cardStyle == "overlay-card"
                        ? "aspect-432/500"
                        : "aspect-432/240";
                    const isPostCard = "link" in item;
                    const linkUrl = isPostCard
                      ? item.link
                      : (item as CardsProps).links?.[0]?.url || "";
                    const commonPost = {
                      title: item.title,
                      content: isPostCard ? item.content : item.subTitle,
                      thumbnail: {
                        url: isPostCard ? item.thumbnail?.url : item.image?.url,
                        alt: isPostCard ? item.thumbnail?.alt : item.image?.alt,
                      },
                      link: linkUrl,
                    };

                    return cardStyle === "horizontal-card" ? (
                      <CollapseCard
                        key={index}
                        post={commonPost}
                        // post={item as Partial<PostCardsProps> as PostCardsProps}
                        cardStyle={cardStyle}
                        cardCount={index + 1}
                      />
                    ) : (
                      <Card
                        imgWrapperClass={` ${cardCounts === 1 && cardStyle === "overlay-card" ? "aspect-430/500" : mobileImageClass}`}
                        sectionTitle={data?.section_title}
                        titleClass={`${cardStyle === "info-card" ? "mt-6 text-[32px]! leading-[48px]" : ""} `}
                        contentClass=""
                        key={index}
                        item={{
                          ...commonPost,
                          imageSrc: commonPost.thumbnail.url,
                          imageAlt: commonPost.thumbnail.alt,
                          imageMobileSrc: item.card_mobile_image?.url,

                          links: !isPostCard
                            ? (item as CardsProps).links
                            : undefined,
                          cardCount: index + 1,
                        }}
                        card_color_theme={cardTheme}
                        card_style={cardStyle}
                      />
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
