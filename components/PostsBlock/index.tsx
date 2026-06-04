import Carousel from "@/components/Carousel";
import Card from "@/components/Card";
import { Settings } from "react-slick";
import SectionIntroBlock from "../SectionIntroBlock";
import { BlockData, CardStyles, PostCardsProps } from "@/types/global";
import { getPostListData } from "@/app/api/graphql/posts";
import CollapseCard from "../CollapseCard";

export default async function PostsBlock({ data }: { data: BlockData }) {
  const isEnabled = (val: string | undefined, device: "desktop" | "mobile") => {
    if (!val) return false;
    return val === "all_device" || val === device;
  };

  const imageDesktopClasses = {
    1: "md:aspect-[1680/500]",
    2: "md:aspect-[820/500]",
    3: "md:aspect-[544/320]",
    4: "md:aspect-[402/240]",
  };

  const overlayCardClasses = {
    1: "md:aspect-[1680/500]",
    2: "md:aspect-[820/500]",
    3: "md:aspect-[544/500]",
    4: "md:aspect-[402/500]",
  };
  const isSliderOn =
    Array.isArray(data?.enable_slider) && data.enable_slider[0] === "yes";
  const vis = data?.slider_visibility;

  const showSlider = {
    desktop: isSliderOn && (vis === "all" || vis === "desktop"),
    mobile: isSliderOn && (vis === "all" || vis === "mobile"),
  };

  const postType = data?.post_type || "post";
  const postLimit = Number(data?.number_of_posts);
  const offset = 0;
  const enable_partial: "desktop" | "mobile" | "both" | "" = "mobile";
  const partial_position: "left" | "right" | "both" | "" = "left";

  const isCompact = data?.compact_layout?.includes("yes");

  const paddingMap: Record<string, string> = {
    "desktop-left": "ps-10!",
    "desktop-right": "pe-10!",
    "desktop-both": "px-10!",
    "mobile-left": "ps-10!",
    "mobile-right": "pe-10!",
    "mobile-both": "px-10!",
  };

  const getPartialClass = (device: "desktop" | "mobile") => {
    const isEnabled = enable_partial === device;
    if (isEnabled && partial_position) {
      const key = `${device}-${partial_position}`;
      return paddingMap[key] || "";
    }
    return "";
  };

  const desktopPartialClass = getPartialClass("desktop");
  const mobilePartialClass = getPartialClass("mobile");

  let postsData: PostCardsProps[] = [];

  const taxonomyObject = {
    post_taxonomy: data?.post_taxonomy || [],
  };

  const termTaxonomyString = JSON.stringify(taxonomyObject).replace(
    /"/g,
    '\\"',
  );

  try {
    const response = await getPostListData(
      postType,
      postLimit,
      offset,
     data?.post_taxonomy ? termTaxonomyString : '',
      `${process.env.NEXT_PUBLIC_MALL_KEY}`
    );
    postsData = response?.getPostsList?.posts || [];
  } catch (e) {
    console.error("GraphQL Fetch Error:", e);
  }

  if (!postsData || postsData.length === 0) return null;

  const sliderSettings: Settings = {
    dots: isEnabled(data?.enable_dots, "desktop"),
    arrows: isEnabled(data?.enable_arrows, "desktop"),
    infinite: true,
    autoplay: true,
    speed: 500,
    slidesToShow: Number(data?.visible_slides) || 1,

    slidesToScroll: 1,
    centerMode: isEnabled(data?.center_mode, "desktop"),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Number(data?.visible_slides) || 1,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: Number(data?.visible_slides) > 1 ? 2 : 1,
          dots: isEnabled(data?.enable_dots, "desktop"),
          arrows: isEnabled(data?.enable_arrows, "mobile"),
        },
      },

    ],
  };

  const sliderSettingsMobile: Settings = {
    dots: isEnabled(data?.enable_dots, "mobile"),
    arrows: isEnabled(data?.enable_arrows, "mobile"),
    centerMode: isEnabled(data?.center_mode, "mobile"),
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    slidesToShow: Number(data?.visible_slides_mobile) || 1,
    centerPadding: "30px"

  };

  const cardStyle = (data?.card_style as CardStyles) || "info-card";
  const hasTitle = data?.section_title?.trim() !== "";
  const hasSubTitle = data?.section_subTitle?.trim() !== "";
  const hasCta = data?.cta?.url && data?.cta?.url.trim() !== "";

  const layoutClass = data?.section_layout === 'full_width' ? 'w-full' : data?.section_layout === 'boxed' ? 'boxed' : 'container';
  const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,
    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;

  const postTypeText:  { [key: string]: string } = {
    'store-offers': 'Store Promotions',
    'event': 'Events',
    'store': 'Stores',
    'post': 'Blog',
    'job': 'Jobs'
  };

  return (
    <div className={`tru-block posts-block ${data?.additional_classes || ""}
     md:pt-(--spaceTop)
      md:pb-(--spaceBottom)
      pb-(--spaceBottomMobile)
      pt-(--spaceTopMobile)
      ` } style={spacingStyles}>
      <div className="main-container">
        {(hasTitle || hasSubTitle || hasCta) && (<SectionIntroBlock data={data} /> )}

        {postsData.length == 0 ? (
          data.post_type && (
            <div className="py-20 text-center">
              <h2 className="text-3xl font-bold">It seems like, there is nothing to show in {postTypeText[data.post_type] || data.post_type}.</h2>
            </div>
          )
        ): (
          <>
            <div className={`${layoutClass}`}>
              <div className="hidden md:block">
                {showSlider.desktop ? (
                  <Carousel
                    settings={sliderSettings}
                    dotClass={ Number(data?.visible_slides) > 1 ? 'relative! mt-10!  py-[18px]!' : ''}
                    className={`[&_.slick-list]:${desktopPartialClass}
                    ${Number(data?.visible_slides) > 1 ? '[&_.slick-dots]:bottom-0! mb-0!' : ''}
                    ${
                      Number(data?.visible_slides) > 1 ||
                      isEnabled(data?.center_mode, "desktop")
                        ? "md:-mx-3"
                        : ""
                    }  ${Number(data?.visible_slides) == 2 ? '[&_.slick-track]:w-full!'  :  ''}`}
                  >
                    {postsData.map((event: PostCardsProps, index: number) => {
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
                          cardDataTag="slider"
                          sectionTitle={data?.section_title}
                          key={event.id || index}
                          item={{
                            title: event.title,
                            content: event.content,
                            imageSrc: event.thumbnail.url,
                            cardLink: event.link,
                            cardCount: index + 1,
                          }}
                          wrapperClass={
                            Number(data?.visible_slides) > 1 ||
                            isEnabled(data?.center_mode, "desktop")
                              ? `${isCompact ? "px-0" : "px-3"}`
                              : ""
                          }
                          card_style={cardStyle}
                          cardLinkText={data?.post_link_text}
                            contentClass={` ${cardStyle === "info-card" ? "text-sm! leading-[21px]!  " : ""}`}
                          contentWrapperClass={
                            Number(data?.visible_slides) <= 1 &&
                            isEnabled(data?.enable_dots, "desktop") &&
                            isEnabled(data?.enable_arrows, "desktop")
                              ? "lg:px-20 lg:p-10 p-4"
                              : "lg:p-10 p-4"
                          }
                        />
                      );
                    })}
                  </Carousel>
                ) : (
                  <div
                    className={`grid ${
                      isCompact ? "gap-0" : "gap-8"
                    } lg:grid-cols-${data?.column} md:grid-cols-2`}
                  >
                    {postsData.map((event: PostCardsProps, index: number) => {
                      const colCount = Number(
                        data?.column,
                      ) as keyof typeof imageDesktopClasses;
                      const desktopImgClass =
                        cardStyle == "overlay-card"
                          ? overlayCardClasses[colCount] || overlayCardClasses[1]
                          : imageDesktopClasses[colCount] || imageDesktopClasses[1];

                      return cardStyle === "horizontal-card" ? (
                        <CollapseCard
                          key={index}
                          post={event}
                          cardStyle={cardStyle} cardCount={index + 1}
                        />
                      ) : (
                        <Card
                          imgWrapperClass={desktopImgClass}
                          sectionTitle={data?.section_title}
                          key={index}
                          item={{
                            title: event.title,
                            content: event.content,
                            imageSrc: event.thumbnail.url,
                            cardLink: event.link,
                            cardCount: index + 1,
                          }}
                          cardLinkText={data?.post_link_text}
                          card_style={cardStyle}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
              </div>
            <div className={` ${isEnabled(data?.center_mode, "mobile") ? 'w-full ' : layoutClass}`}>
              <div className="block md:hidden">
                {showSlider.mobile ? (
                  <Carousel
                    settings={sliderSettingsMobile}
                    className={` [&_.slick-list]:${mobilePartialClass} ${
                      isEnabled(data?.center_mode, "mobile") ? "p-0!" : "md:-mx-3"
                    }`}
                  >
                    {postsData.map((event: PostCardsProps, index: number) => {
                      const mobileImageClass =
                        cardStyle == "overlay-card"
                          ? "aspect-432/500"
                          : "aspect-432/240";

                      return (
                        <Card
                          imgWrapperClass={mobileImageClass}
                          sectionTitle={data?.section_title}
                          cardDataTag="slider"
                          key={event.id || index}
                          item={{
                            title: event.title,
                            content: event.content,
                            imageSrc: event.thumbnail.url,
                            cardLink: event.link,
                            cardCount: index + 1,
                          }}
                          wrapperClass={
                            isEnabled(data?.center_mode, "mobile")
                              ? `${isCompact ? "px-0" : "px-2"}`
                              : ""
                          }

                          card_style={cardStyle}
                          contentClass={` ${cardStyle === "info-card" ? "text-sm! leading-[21px]!" : ""}`}

                        />
                      );
                    })}
                  </Carousel>
                ) : (
                  <div
                    className={`grid grid-cols-${data?.column_mobile} ${
                      isCompact ? "gap-0" : "gap-8"
                    }`}
                  >
                    {postsData.map((event: PostCardsProps, index: number) => {
                      const mobileImageClass =
                        cardStyle == "overlay-card"
                          ? "aspect-432/240"
                          : "aspect-432/240";

                      return cardStyle === "horizontal-card" ? (
                        <CollapseCard
                          key={index}
                          post={event}
                          cardStyle={cardStyle} cardCount={index + 1}
                        />
                      ) : (
                        <Card
                          imgWrapperClass={mobileImageClass}
                          sectionTitle={data?.section_title}
                          key={index}
                          item={{
                            title: event.title,
                            content: event.content,
                            imageSrc: event.thumbnail.url,
                            cardLink: event.link,
                            cardCount: index + 1,
                          }}

                          card_style={cardStyle}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
