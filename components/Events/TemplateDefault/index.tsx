import InnerBanner from "@/components/InnerBanner";
import HeadingWithDescription from "@/components/HeadingWithDescriptionBlock";
import Card from "@/components/Card";
import Image from "next/image";
import { BlockData, ImageProps } from "@/types/global";
import SectionIntroBlock from "@/components/SectionIntroBlock";
import FormBlock from "@/components/FormBlock";
import StoreMap from "@/components/StoreMap";
import Link from "next/link";

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  content?: string;
}

interface EventTemplateDefaultProps {
  pageTitle: string;
  bannerImage: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location_data?: string;
  images?: ImageProps[];
  relatedPosts?: RelatedPost[];
  relatedSec:string
  formData?: BlockData;
}

export default function EventTemplateDefault({
  pageTitle,
  bannerImage,
  description,
  startDate,
  endDate,
  location_data,
  images = [],
  relatedPosts = [],
  relatedSec,
  formData,
}: EventTemplateDefaultProps) {
  const locData = JSON.parse(location_data || '{}');
  const relatedSecData = JSON.parse(relatedSec || '{}');

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", options);
  };

  return (
    <>
      <InnerBanner
        data={
          {
            section_title: pageTitle,
            main_image: bannerImage || ''
          } as unknown as BlockData
        }
      />

      <div className="event-detail py-16 md:py-20">
        <div className="max-w-[1112px] mx-auto px-6">
          <HeadingWithDescription
            data={
              {
                section_title: description ? "Details" : "",
                section_subTitle: description || "",
              } as BlockData
            }
            sectionProps={{
              className:
                "[&_h2]:font-(family-name:--font-secondary)! [&_h2]:mb-0! pt-0! [&_.container]:w-full [&_.container]:p-0! [&_h2]:text-[40px] [&_h2]:mb-6! [&_h2]:leading-[40px]",
            }}
          />

            <div className="grid xxl:grid-cols-3 grid-cols-1 gap-6 mt-6">
              {startDate &&
                <div className="flex gap-3">
                  <i className="icon-date text-(--dark-heading)"></i>
                  <div className="flex gap-2">
                    <strong className="text-(--dark-heading)">Start:</strong>
                    <span>{formatDate(startDate)}</span>
                  </div>
                </div>
              }

              {endDate && 
                <div className="flex gap-3">
                  <i className="icon-date text-(--dark-heading)"></i>
                  <div className="flex gap-2">
                    <strong className="text-(--dark-heading)">End:</strong>
                    <span>{formatDate(endDate)}</span>
                  </div>
                </div>
              }

              {locData.event_location &&
                <div className="flex gap-3">
                  <i className="icon-loction text-(--dark-heading)"></i>
                  <div className="flex gap-2">
                    <strong className="text-(--dark-heading)">Location:</strong>
                    {locData.location_slug ? (
                      <Link href={`/store/${locData.location_slug}`}>{locData.event_location}</Link>
                    ) : (
                      <span>{locData.event_location && locData.event_location }</span>
                    )}
                  </div>
                </div>
              }
            </div>

          {images.length > 0 && (
            <div className="grid mt-16 md:grid-cols-2 grid-cols-1 gap-6">
              {images.map((data, index) => (
                <div
                  key={index}
                  className="relative h-[500px] aspect-square w-full"
                >
                  <Image
                    src={data.url as string}
                    alt={data.alt ? data.alt : ''}
                    fill
                    loading="lazy" 
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {locData.external_id &&
          <div className="container pt-16">
          <StoreMap externalId={locData.external_id}/>
          </div>
        }

        {/* Related Section Intro */}
        {relatedPosts.length > 0 && (
          <>
            <div className="container pt-16">
              <SectionIntroBlock
                data={{
                  section_title: `${relatedSecData.relatedSecTitle ?? ''}`,
                  cta: [
                    {
                      url:`${relatedSecData.relatedSecCTA.url ?? '/events'}`,
                      title: `${relatedSecData.relatedSecCTA.title ?? 'See More'}`,
                      target: `${relatedSecData.relatedSecCTA.target ?? '_self'}`,
                    },
                  ],
                }}
                titleClass="xm:text-[40px]! xm:leading-[56px]! text-[32px]! leading-[36px]! md:leading-[48px] md:text-[32px]"
                ctaWrapperClass="[&_a]:text-(--dark-heading)! "

              />
            </div>

            <div className="container pt-6">
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.slice(0, 3).map((post, index) => (
                  <Card
                    key={post.id || index}
                    item={{
                      title: post.title,
                      content: post.content,
                      imageSrc: post.image_url,
                      cardLink: post.slug,
                      cardLinkText: "Read More",
                    }}
                    card_style="overlay-card"
                     imgWrapperClass="aspect-[402/500] md:aspect-[544/500]"
                    cardWrapperClass="pb-0"
                    titleClass="text-[40px] leading-[56px] font-normal"
                    contentClass="truncate line-clamp-1"
                    mainCardClass="[&_img]:h-[500px] [&_img]:object-cover"
                    ctaClass="font-medium"

                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <FormBlock data={formData} />
    </>
  );
}
 