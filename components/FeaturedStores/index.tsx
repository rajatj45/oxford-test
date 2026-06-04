import Image from "next/image";
import { BlockData } from "@/types/global";
import SectionIntroBlock from "../SectionIntroBlock";
import Marquee from "react-fast-marquee";

export default async function FeaturedStores({ data }: { data: BlockData }) {
  if (!data) return null;
  const defaultClasses = ` ${
    data?.bg_color ? data?.bg_color : "bg-(--surface-primary) py-6 md:py-8"
  }`;
 const carouselContent = (
    <Marquee autoFill>
      {data?.gallery?.map(
        (item, index) =>
          item.url && (
            <Image
              key={index}
              src={item.url}
              alt={item.alt || ""}
              width={150}
              height={40}
              priority={true}
              className="object-contain w-full! px-6 md:px-10 h-11.25 md:h-15"
            />
          ),
      )}
    </Marquee>
  );
  const spacingStyles: React.CSSProperties = {
    "--spaceTop": `${data?.top_spacing ?? 0}px`,
    "--spaceBottom": `${data?.bottom_spacing ?? 0}px`,
    "--spaceTopMobile": `${data?.mobile_top_spacing ?? 0}px`,
    "--spaceBottomMobile": `${data?.mobile_bottom_spacing ?? 0}px`,
  } as React.CSSProperties;

  return (
    <>
      <div
        className={`${data?.additional_classes}
      md:mt-(--spaceTop)
      md:mb-(--spaceBottom)
      mb-(--spaceBottomMobile)
      mt-(--spaceTopMobile)`}
        style={spacingStyles}
      >
        {(data.section_title || data.section_subTitle || data.cta) && (
          <SectionIntroBlock data={data} />
        )}

        <div
          className={`logo-slider overflow-hidden md:min-h-52 min-h-36 flex items-center ${defaultClasses} `}
        >
          <div className="main-container">
            {data?.section_layout === "container" ? (
              <div className="container">{carouselContent}</div>
            ) : (
              carouselContent
            )}
          </div>
        </div>
      </div>
    </>
  );
}