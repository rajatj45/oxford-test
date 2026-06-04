import ImageWithContent from "@/components/ImageWithContent";
import { getStoreDetailData } from "@/app/api/graphql/storeDetail";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlockData } from "@/types/global";
import Card from "@/components/Card";
import Link from "next/link";

import {
  getMetadata,
  getBaseConfig,
  getStorePageSchema,
  fetchOptionsData,
} from "@/utils/utility";
import { Metadata } from "next";
import SectionIntroBlock from "@/components/SectionIntroBlock";
import FormBlock from "@/components/FormBlock";
import StoreMap from "@/components/StoreMap";
import SpacerBlock from "@/components/SpacerBlock";

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  content?: string;
}
interface TaxonomyTerm {
  name: string;
  slug: string;
}

interface SelectedStore {
  taxonomy_slug: string;
  terms: TaxonomyTerm[];
}
interface CtaItem {
  cta_link: {
    title?: string;
    url?: string;
    target?: string;
  };
}

type Props = {
  params: Promise<{ slug: string }>;
};
const imageDesktopClasses = {
  1: "md:aspect-[1680/500]",
  2: "md:aspect-[820/500]",
  3: "md:aspect-[544/320]",
  4: "md:aspect-[402/240]",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fullSlugPath = ["store", slug];
  const allData = await getStoreDetailData(slug);
  if (!allData) {
    return notFound();
  }

  const meta_fields_group = allData.meta_fields_group;
  const seo = JSON.parse(meta_fields_group || "{}");

  const otherOptions = await fetchOptionsData();
  const metaOptions = {
    otherOptions : otherOptions.otherOptions
  }

  seo.title = allData.title;
  seo.thumbnail = allData.thumbnail;

  const { baseURL } = await getBaseConfig();

  return getMetadata({
    seo,
    baseURL,
    metaOptions: JSON.stringify(metaOptions),
    slug: fullSlugPath,
  });
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreDetailData(slug, process.env.NEXT_PUBLIC_MALL_KEY);
  const fullSlugPath = ["store", slug];
  const { baseURL } = await getBaseConfig();

  if (store?.status === 'error') {
    return (
      <div className="py-20 text-center">
        <h2 className="text-3xl font-bold">
          Unauthorized access!
        </h2>
      </div>
    );
  }

  if (!store) {
    return notFound();
  }

  const parseJson = (data: string) => {
    try {
      if (!data) return {};
      let parsed = JSON.parse(data);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      return parsed;
    } catch (e) {
      console.error("JSON Parse Error", e);
      return {};
    }
  };

  const hours = parseJson(store.store_hours_group);
  const info = parseJson(store.store_information_group);
  const fields = parseJson(store.store_fields_group);
  const storeImgGroup = parseJson(store.store_image_group);
  const birthdayOffers = parseJson(store.birthday_offers_group);

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const rawCtaData = parseJson(store.content_cta_links);
  const ctaLinksRaw: CtaItem[] = Array.isArray(rawCtaData) ? rawCtaData : [];

  const storeServices = (store.selected_stores as SelectedStore[])?.find(
    (item) => item.taxonomy_slug === "store-services",
  );
  const giftCardSlug = storeServices?.terms?.[0]?.slug || "";
  const giftSlug = giftCardSlug === "gift-card";
  const finalLinks = [
    ...(giftSlug
      ? [
          {
            cta: {
              url: `/${giftCardSlug}`,
              title: "Accepts Square One Gift Cards",
              target: "_blank",
            },
          },
        ]
      : []),
    ...ctaLinksRaw.map((item: CtaItem) => ({
      cta: {
        url: item.cta_link?.url || "#",
        title: item.cta_link?.title || "Learn More",
        target: item.cta_link?.target || "_self",
      },
    })),
  ];

  const relatedPosts = parseJson(store?.related_posts);
  const parsedData = JSON.parse(store?.form_data || "{}");

  const storeDetailFormData = {
    section_title: parsedData.form_section_title || "",
    section_subTitle: parsedData.form_section_subtitle
      ? `<p>${parsedData.form_section_subtitle}</p>`
      : "",

    form_fields: store?.form_fields,
    selected_from_id: store?.form_data,
    enable_captcha: store.form_captcha,
    additional_classes: "spacing-y-64 bg-solid-primary",
    section_layout: "container",
  } as BlockData;

  const otherOptions = await fetchOptionsData();
  const otherOptionsData = otherOptions.otherOptions;
  const storeHeadingData = otherOptions.detailPageOptions;

  const schema = getStorePageSchema({
    slug: fullSlugPath,
    baseURL,
    metaOptions: JSON.stringify(otherOptionsData),
    storeData: JSON.stringify(store),
  });

  const seo = parseJson(store.meta_fields_group);
  const metaTitle =
    seo.title || `${store.title} | ${otherOptionsData.siteTitle}` || "";

  return (
    <>
      <input
        type="hidden"
        id="current-page-url"
        name="page_url"
        value={metaTitle}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="store-detail spacing-y-80">
        <ImageWithContent
          pageTitle
          showMobileTitle
          className="[&_.mobile-Image]:block [&_.mobile-Image]:md:hidden [&_.desktop-Image]:hidden [&_.desktop-Image]:md:block 
          [&_.desktop-title]:mt-0 [&_.desktop-title]:lg:mt-0 [&_.desktop-title]:md:mt-10"

          data={
            {
              cards: [
                {
                  title: store.title,
                  subTitle: fields.store_description || "",
                  gallery: [
                    {
                      url: storeImgGroup.store_image,
                      alt: `${store.title} inside ${otherOptionsData.siteTitle}`,
                    },
                  ],
                  links: finalLinks,
                },
              ],
              option: "image_right",
              section_layout: "container",
              bg_color: "transparent",
              column_layout: "horizontal",
            } as BlockData
          }
        />

        <div className="main-container tru-block">
          <div className="container ">
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-16">
              <div className="h-full p-8 border border-[#A7A7A740] tru-tile bg-white">
                {storeHeadingData.hoursSecTitle && (
                  <h5 className="text-[28px] font-semibold tru-tile-heading mb-0 text-black">
                    {storeHeadingData.hoursSecTitle}
                  </h5>
                )}
                <ul className="mt-3 list-none ml-0">
                  {days.map((day) => {
                    const schedule = hours[`${day}_hours`];
                    if (!schedule) return null;
                    return (
                      <li
                        key={day}
                        className="py-3 first:border-t-0 border-t border-[#A7A7A740]"
                      >
                        <div className="flex items-baseline flex-col sm:flex-row gap-4 sm:gap-20 justify-between">
                          <p className="shrink-0 sm:basis-40 font-medium capitalize text-black mb-0">
                            {day}
                          </p>
                          <p className="flex gap-2.5 mb-0 items-center text-black">
                            <span
                              className="inline-block"
                              style={{ width: "16px", height: "16px" }}
                            >
                              <i
                                className="demo-icon icon-clock block text-black"
                                style={{ fontSize: "16px", lineHeight: 1 }}
                                aria-hidden="true"
                              ></i>
                            </span>
                            <span className="uppercase min-w-[135px] ">
                             {schedule.opening_hours}{schedule.closing_hours ? `-${schedule.closing_hours}` : 'closed'}

                            </span>
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div>
                  <Link
                    href={`${storeHeadingData.hoursSecCTA.url}`}
                    target={`${storeHeadingData.hoursSecCTA.target}`}
                  >
                    {storeHeadingData.hoursSecCTA.title}
                  </Link>
                </div>
              </div>

              <div className="h-full p-8 border border-[#A7A7A740] tru-tile bg-white">
                {storeHeadingData.infoSecTitle && (
                  <h5 className="text-[28px] font-semibold tru-tile-heading mb-0 text-black">
                    {storeHeadingData.infoSecTitle}
                  </h5>
                )}

                <ul className="mt-3 list-none ml-0 last:[&_li]:border-0">
                  {info.floor && (
                    <li className="py-3 border-b border-[#A7A7A740] ">
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-20 justify-between">
                        <p className="flex gap-2.5 items-center text-black">
                          <Image
                            src="/images/shop-images/frame.svg"
                            alt="loc"
                            width={16}
                            height={16}
                          />
                          <span>{info.floor || ""}</span>
                        </p>
                      </div>
                    </li>
                  )}

                  {info.store_phone && (
                    <li className="py-3 border-b border-[#A7A7A740]">
                      <p className="flex gap-2.5 items-center text-black">
                        <Image
                          src="/images/shop-images/call.svg"
                          alt="phone"
                          width={16}
                          height={16}
                        />
                        <Link aria-label="store contact" href={`tel:${info.store_phone}`}><span>{info.store_phone || ""}</span></Link>
                      </p>
                    </li>
                  )}

                  {/* {birthdayOffers.birthday_offers_description && (
                    <li className="py-3 border-b border-[#A7A7A740]">
                      <p className="font-bold mb-1 text-sm text-blue-600">
                        Special Offer:
                      </p>
                      <p className="text-sm">
                        {birthdayOffers.birthday_offers_description}
                      </p>
                    </li>
                  )} */}
                </ul>

                {info.store_website?.url && (


                  <div className="gap-3 mt-6  flex font-bold">
                    <a
                      href={info.store_website.url}
                      className="underline block text-(--dark-heading) font-medium"
                      target="_blank"
                      rel="noreferrer"
                    >
                     { info.store_website.title = "View Store Website"}
                    </a>
                    <Image
                      src="/images/shop-images/redirect.svg"
                      alt="redirect"
                      width={16}
                      height={16}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {info?.external_id && (
          <div className="main-container store-map pt-16">
            <div className="container">
              <StoreMap externalId={info?.external_id} />
            </div>
          </div>
        )}

        <SpacerBlock
          data={
            {
              top_spacing: "64",
              bottom_spacing: "64",
              border_width: "1",
              compact_layout: "yes",
              bg_color: "bg-[#A7A7A740]",
              section_layout: "container",
            } as unknown as BlockData
          }
        />

        <div className="main-container">
          <div className="container">
            <SectionIntroBlock
              data={{
                section_title: store.related_store_heading ? store.related_store_heading : storeHeadingData.relatedSecTitle,
                cta: [
                  {
                    url: `${storeHeadingData.relatedSecCTA.url ?? '/stores'}`,
                    title: `${storeHeadingData.relatedSecCTA.title ?? 'See More'}`,
                    target:`${storeHeadingData.relatedSecCTA.target ?? '_self'}`,
                  },
                ],
              }}
            />
          </div>

          {relatedPosts.length > 0 && (
            <div className="container">
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {relatedPosts.map((post: RelatedPost, index: number) => (
                  <Card
                    item={{
                      title: post.title,
                      content: post.content || "",
                      imageSrc: post.image_url,
                      cardLink: `/store/${post.slug}`
                    }}
                    key={post.id || index}
                    card_style="info-card"
                    imgWrapperClass="aspect-[820/500] md:aspect-[820/500]"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <FormBlock data={storeDetailFormData} />
    </>
  );
}