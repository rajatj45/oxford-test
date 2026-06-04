import { getEventDetailData } from "@/app/api/graphql/eventDetail";

import { BlockData, ImageProps, CardsProps } from "@/types/global";

import { notFound } from "next/navigation";
import EventTemplateOne from "@/components/Events/TemplateOne";
import EventTemplateTwo from "@/components/Events/TemplateTwo";
import EventTemplateDefault from "@/components/Events/TemplateDefault";
import {
  fetchOptionsData,
  getBaseConfig,
  getMetadata,
  getPageSchema,
} from "@/utils/utility";
import { Metadata } from "next";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fullSlugPath = ["event", slug];
  const allData = await getEventDetailData(slug);
  if (!allData) {
    return notFound();
  }
  const { baseURL } = await getBaseConfig();
  const otherOptions = await fetchOptionsData();
  const metaOptions = {
    otherOptions : otherOptions.otherOptions
  }

  return getMetadata({
    seo: allData,
    baseURL,
    metaOptions: JSON.stringify(metaOptions),
    slug: fullSlugPath,
  });
}

interface EventData {
  description: string;
  start_date: string;
  end_date: string;
  location_data : string;
  images: ImageProps[];
}

interface VendorItem {
  block_heading: string;
  block_description: string;
  instagram_url?: string;
  facebook_url?: string;
  gallery_slider?: string[];
  cta?: {
    title: string;
    url: string;
    target?: string;
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventDetailData(slug);
  const fullSlugPath = ["event", slug];
  const { baseURL } = await getBaseConfig();

  if (event?.status === 'error') {
    return (
      <div className="py-20 text-center">
        <h2 className="text-3xl font-bold">
          Unauthorized access!
        </h2>
      </div>
    );
  }

  if (!event) {
    return notFound();
  }
  const relatedPosts = JSON.parse(event.related_posts);
  const eventData: EventData = JSON.parse(event.event_data);
  const templateData = event.selected_template_data
    ? JSON.parse(event.selected_template_data)
    : "";

  const EventSchedule =
    event.selected_template === "valentine-day"
      ? Array.isArray(templateData.event_schedule)
        ? templateData.event_schedule
        : typeof templateData.event_schedule === "string"
          ? JSON.parse(templateData.event_schedule)
          : [templateData.event_schedule]
      : [];

  const vendorDetails =
    event.selected_template === "valentine-day"
      ? Array.isArray(templateData.vendors_or_additional_details)
        ? templateData.vendors_or_additional_details
        : typeof templateData.vendors_or_additional_details === "string"
          ? JSON.parse(templateData.vendors_or_additional_details)
          : []
      : [];

  const lunarColumns =
    event.selected_template === "lunar-year"
      ? Array.isArray(templateData.lunar_year_image_and_description)
        ? templateData.lunar_year_image_and_description
        : typeof templateData.lunar_year_image_and_description === "string"
          ? JSON.parse(templateData.lunar_year_image_and_description)
          : [templateData.lunar_year_image_and_description]
      : [];

  const lunarRowData =
    event.selected_template === "lunar-year"
      ? Array.isArray(templateData.image_and_description_rows)
        ? templateData.image_and_description_rows
        : typeof templateData.image_and_description_rows === "string"
          ? JSON.parse(templateData.image_and_description_rows)
          : [templateData.image_and_description_rows]
      : [];
  const zPatternCards: CardsProps[] = vendorDetails.map((item: VendorItem) => ({
    title: item.block_heading,
    content: item.block_description,
    instragam: item.instagram_url,
    facebook: item.facebook_url,
    gallery:
  item.gallery_slider && item.gallery_slider.length > 1
    ? (item.gallery_slider as ImageProps[]).map((val: ImageProps, index: number) => ({ 
        url: val.url ? val.url : '', 
        alt: val.alt ? val.alt : ''
      }))
    : undefined,
    image:
      item.gallery_slider && item.gallery_slider.length === 1
        ? { url: item.gallery_slider[0], alt: item.block_heading }
        : undefined,
    links: item.cta
      ? [
          {
            title: item.cta.title,
            url: item.cta.url,
            target: item.cta.target,
          },
        ]
      : [],
  }));

  const parsedData = JSON.parse(event?.form_data || "{}");


  const eventDetailFormData = {
    section_title: parsedData.form_section_title || "",
    section_subTitle: parsedData.form_section_subtitle
      ? `<p>${parsedData.form_section_subtitle}</p>`
      : "",

    form_fields: event?.form_fields,
    selected_from_id: event?.form_data,
    enable_captcha: event.form_captcha,
    additional_classes: "spacing-y-64 bg-solid-primary",
    section_layout: "container",
  } as BlockData;

  const schema = getPageSchema({
    slug: fullSlugPath,
    baseURL,
    seo: event,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {event.selected_template == "lunar-year" ? (
        <>
          <EventTemplateOne
            pageTitle={event.title}
            pageBanner={event.thumbnail}
            lunarColumns={lunarColumns}
            lunarRowData={lunarRowData}
            galleryData={templateData.gallery_images}
          />
        </>
      ) : event.selected_template === "valentine-day" ? (
        <>
          <EventTemplateTwo
            pageTitle={event.title}
            pageBanner={event.thumbnail}
            sectionHeading={templateData.block_heading}
            sectionContent={templateData.block_description}
            eventScheduleData={EventSchedule}
            vendporSectionHeading={templateData.vendors_section_heading}
            vendorsSectionDescription={templateData.vendors_section_description}
            zPatternCards={zPatternCards}
          />
        </>
      ) : (
        <EventTemplateDefault
          pageTitle={event.title}
          bannerImage={event.thumbnail}
          description={eventData.description}
          startDate={eventData.start_date}
          endDate={eventData.end_date}
          location_data={JSON.stringify(eventData.location_data)}
          images={eventData.images}
          relatedSec ={event.related_data}
          relatedPosts={relatedPosts}
          formData={eventDetailFormData}
        />
      )}
    </>
  );
}
 