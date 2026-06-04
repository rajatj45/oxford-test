import {
  BlockData,
  CardsProps,
  GenerateMetadataProps,
  SchemaProps,
} from "@/types/global";
import { Coordinate, MapData } from "@mappedin/mappedin-js";
import { Metadata } from "next";
import { FormField, TimeValue } from "@/types/global";
import { getOptionsData } from "@/app/api/graphql/options";
import { cache } from "react";
import HomeBanner from "@/components/HomeBanner";
import PostsBlock from "@/components/PostsBlock";
import CardsGridBlock from "@/components/CardsGridBlock";
import PlanVisit from "../components/PlanVisit";
import ImageWithContent from "../components/ImageWithContent";
import Accordian from "@/components/Accordian";
import InnerBanner from "../components/InnerBanner";
import CustomSearch from "../components/CustomSearch";
import StoreHoursAccordion from "../components/StoreHoursAccordion";
import HeadingWithDescription from "../components/HeadingWithDescriptionBlock";
import FeaturedStores from "../components/FeaturedStores";
import VideoBlock from "@/components/VideoBlock";
import FormBlock from "../components/FormBlock";
import LogoSlider from "../components/LogoSlider";
import TabsBlock from "@/components/TabsBlock";
import MappedinMap from "@/components/MappedinMap";
import DirectionsMap from "../components/DirectionsMap";
import PostsListingBlock from "../components/PostsListingBlock";
import SpacerBlock from "../components/SpacerBlock";
import GallerySlider from "../components/GallerySlider";
import ImageCollage from "../components/ImageCollage";
import RelatedPost from "../components/RelatedPosts";

const isCompositeField = (type: string) => ["name"].includes(type);

const isMultiValueField = (type: string) =>
  ["multi_choice", "multiselect"].includes(type);

export const getFieldError = (
  field: FormField,
  value: unknown,
  maxFileSize?: number,
): string | null => {
  const type = field.field_type.toLowerCase();

  const stringValue = typeof value === "string" ? value.trim() : "";

  //string validation
  if (typeof value === "string" && value.length > 0) {
    if (/^\s/.test(value)) {
      return `${field.field_label} cannot start with a space.`;
    }
  }

  //added start -----------------------------------
  if (type === "consent") {
    const obj = value as Record<string, unknown> | undefined;

    const choice = field.choices?.[0];
    const id = String(choice?.field_id);

    const isChecked =
      obj?.[id] === true || obj?.[id] === 1 || obj?.[id] === "1";

    if (field.is_required && !isChecked) {
      return "Field is required.";
    }

    return null;
  }

  // MULTI VALUE FIELDS

  if (isMultiValueField(type)) {
    if (field.is_required && (!Array.isArray(value) || value.length === 0)) {
      return "Field is required.";
    }
    return null;
  }

  // COMPOSITE FIELDS (name)

  if (isCompositeField(type)) {
    const obj = value as Record<string, string>;
    const values = Object.values(obj || {}).map((v) => v || "");
    const hasValue = values.some((v) => v.length > 0);

    if (field.is_required && !hasValue) {
      return "Field is required.";
    }

    // NAME VALIDATION

    if (type === "name") {
      const obj = value as Record<string, string>;

      const firstField = field.choices?.find((c) => c.field_label === "First");
      const lastField = field.choices?.find((c) => c.field_label === "Last");

      const firstName = obj?.[String(firstField?.field_id)] || "";
      const lastName = obj?.[String(lastField?.field_id)] || "";

      for (const c of field.choices || []) {
        const val = obj?.[String(c.field_id)] || "";

        if (!val) continue;

        if (val.startsWith(" ")) return "Name cannot start with a space.";
        if (!/^[A-Za-z][A-Za-z\s]*$/.test(val)) return "Only letters allowed.";
        if (val.length < 2 || val.length > 50) return "Enter a valid name.";
      }

      if (field.is_required) {
        if (!firstName) return "First name is required.";
        if (!lastName) return "Last name is required.";
      }

      return null;
    }
    return null;
  }

  // EMAIL VALIDATION
  if (type === "email" && (field.choices?.length ?? 0) > 1) {
    const obj = value as Record<string, string> | undefined;

    const email = (obj?.[String(field.choices?.[0]?.field_id)] || "").trim();
    const confirm = (obj?.[String(field.choices?.[1]?.field_id)] || "").trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Format check
    if (email && !emailRegex.test(email)) return "Invalid email.";
    if (confirm && !emailRegex.test(confirm)) return "Invalid email.";

    // Required check
    if (field.is_required && (!email || !confirm)) {
      return "Field is required.";
    }

    // Match check
    if (email && confirm && email !== confirm) {
      return "Emails do not match.";
    }

    return null;
  }

  // end---------------------------------------------

  if (type === "fileupload") {
    const maxFileSizeMB = maxFileSize || 10;
    const MAX_FILE_SIZE = maxFileSizeMB * 1024 * 1024;

    const allowedTypes = ["jpg", "jpeg", "png", "gif", "pdf"];

    let file: File | null = null;

    if (value instanceof File) {
      file = value;
    } else if (value instanceof FileList && value.length > 0) {
      file = value[0];
    }

    if (field.is_required && !file) {
      return `Field is required.`;
    }

    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        return "File type is not allowed.";
      }

      if (file && file.size > MAX_FILE_SIZE) {
        return `File size too large.`;
      }
    }
    return null;
  }

  //string validation
  // if (typeof value === "string" && value.length > 0) {
  //   if (/^\s/.test(value)) {
  //     return `${field.field_label} cannot start with a space.`;
  //   }
  // }

  if (type === "time") {
    const timeObj = value as TimeValue;
    for (const c of field.choices || []) {
      const val = (timeObj?.[String(c.field_id)] || "").trim();
      const label = c.field_label.toUpperCase();
      if (!val) continue;

      if (label === "HOUR") {
        if (!/^\d+$/.test(val)) return "Please enter a valid value.";
        const hh = Number(val);
        if (hh < 1 || hh > 12) return "Hour must be between 1 and 12.";
      }
      if (label === "MINUTE") {
        if (!/^\d+$/.test(val)) return "Please enter a valid value.";
        const mm = Number(val);
        if (mm < 0 || mm > 59) return "Minute must be between 0 and 59.";
      }
      if (label === "AM/PM") {
        if (/\d/.test(val)) return "Please enter a valid value.";
        if (!["AM", "PM"].includes(val.toUpperCase()))
          return "Please enter a valid value.";
      }
    }
  }

  if (type === "phone" && stringValue !== "") {
    if (!/^\d+$/.test(stringValue)) return "Please enter a valid value.";
    if (stringValue.length !== 10) return "Please enter a valid value.";
  }

  if (type === "date" && stringValue !== "") {
    const selectedDate = new Date(stringValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!isNaN(selectedDate.getTime()) && selectedDate < today) {
      return "Please select current or future date.";
    }
  }

  if (field.is_required) {
    if (type === "checkbox") {
      const isChecked = typeof value === "boolean" ? value === true : !!value;
      if (!isChecked) return `Field is required.`;
      return null;
    } else if (type === "time") {
      const timeObj = value as TimeValue;
      const isComplete = field.choices?.every((c) =>
        timeObj?.[String(c.field_id)]?.trim(),
      );
      if (!isComplete) return `Field is required.`;
      return null;
    } else {
      if (stringValue === "" && value !== 0) return `Field is required.`;
    }
  }

  if (
    field.cssClass?.includes("name-validation") &&
    typeof value === "string"
  ) {
    if (value.startsWith(" ")) return "Name cannot start with a space.";

    const trimmedVal = value.trim();

    if (!/^[A-Za-z][A-Za-z\s]*$/.test(trimmedVal)) {
      return "Only letters allowed.";
    }

    if (trimmedVal.length < 2) return "Enter a valid name.";
    if (trimmedVal.length > 50) return "Enter a valid name.";
  }

  if (
    field.cssClass?.includes("postalCode-validation") &&
    typeof value === "string"
  ) {
    if (!/^[A-Za-z0-9\s]+$/.test(value))
      return "Special characters not allowed.";
    if (stringValue.length < 3) return "Enter a valid Postal code.";
    if (stringValue.length > 7) return "Enter a valid Postal code.";
  }

  if ((type === "email" || type === "number") && field.is_required) {
    switch (type) {
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)
          ? null
          : "Invalid email.";
      case "number": {
        const numValue = Number(value);
        if (isNaN(numValue)) return "Must be a number.";
        return numValue < 0 ? "Cannot be negative." : null;
      }
      default:
        return null;
    }
  }
  return null;
};

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
};

export const jsonparsedData = (data: string) => {
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

export const pushCardsToDataLayer = (
  element?: HTMLElement,
  eventType?: string,
) => {
  if (typeof window !== "undefined" && window.dataLayer && element) {
    const stripHtml = (value: string | undefined): string => {
      if (!value) return "";
      return value.replace(/<[^>]*>?/gm, "").trim();
    };
    const { title, index, vieweventname, clickeventname, eventcategory, tag } =
      element.dataset;

    let pageIdentifier = typeof document !== "undefined" ? document.title : "";

    if (typeof document !== "undefined") {
      const urlInput = document.getElementById(
        "current-page-url",
      ) as HTMLInputElement;
      if (urlInput && urlInput.value) {
        pageIdentifier = urlInput.value;
      }
    }

    const rawData = {
      event: eventType === "click" ? clickeventname : vieweventname,
      event_action: stripHtml(title),
      event_label: index || null,
      event_category: stripHtml(eventcategory) || null,
      event_var: pageIdentifier,
      event_tag: stripHtml(tag),
    };

    const filteredData = Object.fromEntries(
      Object.entries(rawData).filter(([key, value]) => {
        if (key === "event_category" || key === "event_label") return true;

        return value !== "" && value !== undefined && value !== null;
      }),
    );

    if (Object.keys(filteredData).length > 0) {
      window.dataLayer.push(filteredData);
    }
  }
};

export const clickPushToDataLayer = (
  e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
) => {
  const target = e.currentTarget;
  const href = target.getAttribute("href") || "";
  let finalPath = "";

  if (href === "#") {
    finalPath = `${getBaseUrl()}/#`;
  } else if (href.startsWith("http")) {
    finalPath = href;
  } else {
    finalPath = `${getBaseUrl()}${href}`;
  }

  target.setAttribute("data-index", finalPath);
  pushCardsToDataLayer(target, e.type);
};

export const getAbsoluteUrl = (path: string | undefined): string => {
  if (!path) return window.location.href;

  if (path.startsWith("http")) return path;

  if (typeof window !== "undefined") {
    const { protocol, host } = window.location;
    const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${protocol}//${host}${sanitizedPath}`;
  }

  return path;
};

export const syncElementHeights = (
  parent: HTMLElement | null,
  selectors: string[],
): void => {
  if (typeof window === "undefined" || !parent) return;

  const isDesktop = window.innerWidth >= 768;

  selectors.forEach((selector) => {
    const elements = Array.from(parent.querySelectorAll<HTMLElement>(selector));

    elements.forEach((el) => (el.style.height = "auto"));

    if (isDesktop) {
      const heights = elements.map((el) => el.offsetHeight);
      const maxHeight = Math.max(...heights, 0);

      if (maxHeight > 0) {
        elements.forEach((el) => {
          el.style.height = `${maxHeight}px`;
        });
      }
    }
  });
};

export function calculateDistance(coord1: Coordinate, coord2: Coordinate) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

export async function isPathFound(
  startCoord: Coordinate,
  endCoord: Coordinate,
  mapDataInstance: MapData | null | undefined,
): Promise<boolean> {
  try {
    const directions = await mapDataInstance?.getDirections(
      startCoord,
      endCoord,
    );
    return !!directions;
  } catch (error) {
    console.error("Error checking path:", error);
    return false;
  }
}

export function getManeuverIcon(m: string) {
  const k = m?.toLowerCase?.() || "";
  if (k.includes("left")) return "↰";
  if (k.includes("right")) return "↱";
  if (k.includes("merge")) return "⇄";
  if (k.includes("straight")) return "↑";
  if (k.includes("ramp")) return "⇧";
  if (k.includes("roundabout")) return "⟲";
  if (k.includes("uturn")) return "⤴";
  return "•";
}

export function getPageSchema({ slug, baseURL, seo }: SchemaProps) {
  const pageName = seo?.title ? seo?.title.trim() : "";
  const segments = Array.isArray(slug) ? slug : slug.split("/").filter(Boolean);
  const pageUrl = `${baseURL}/${segments.join("/")}`;

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseURL,
    },
  ];

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const path = `${baseURL}/${segments.slice(0, index + 1).join("/")}`;

    const nameFromSlug = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    breadcrumbItems.push({
      "@type": "ListItem",
      position: index + 2,
      name: isLast
        ? pageName.replaceAll("&amp;", "&") ||
          nameFromSlug.replaceAll("&amp;", "&")
        : nameFromSlug.replaceAll("&amp;", "&"),
      item: path,
    });
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: seo?.meta_title?.trim().replaceAll("&amp;", "&") || "",
        description:
          seo?.meta_description?.trim().replaceAll("&amp;", "&") || "",
        isPartOf: {
          "@id": `${baseURL}/#website`,
        },
        inLanguage: "en-CA",
        breadcrumb: {
          "@id": `${pageUrl}#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
    ],
  };
}

export function getHomePageSchema({
  slug,
  baseURL,
  homeData,
  metaOptions,
}: SchemaProps) {
  const options = JSON.parse(metaOptions || "");
  const data = JSON.parse(homeData || "");
  const faqData =
    data?.meta_content?.find((item: BlockData) => item.tag === "faqs_block")
      ?.cards || [];

  const dayMapping: Record<string, string> = {
    mon: "Monday",
    tues: "Tuesday",
    wed: "Wednesday",
    thurs: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };

  const openingHoursSpec = Object.entries(options.mallHours.hours).map(
    ([key, value]) => {
      const [openStr, closeStr] = (value as string).split(" - ");

      const formatTime = (time: string) => {
        const [h, m] = time.replace(/[am|pm]/g, "").split(":");
        let hours24 = parseInt(h);
        if (time.includes("pm") && hours24 !== 12) hours24 += 12;
        if (time.includes("am") && hours24 === 12) hours24 = 0;
        return `${hours24.toString().padStart(2, "0")}:${m.padStart(2, "0")}`;
      };

      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: dayMapping[key] || key,
        opens: formatTime(openStr),
        closes: formatTime(closeStr),
      };
    },
  );

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseURL,
    },
  ];

  const structuredFaqs = faqData.map((card: CardsProps) => ({
    "@type": "Question",
    name: card.title?.replace(/<[^>]*>/g, ""),
    acceptedAnswer: {
      "@type": "Answer",
      text: card.content?.replace(/<[^>]*>/g, ""),
    },
  }));
  const addressParts = (options.otherOptions.siteAddress || "").split(",").map((s:string) => s.trim());
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseURL}/#website`,
        url: `${baseURL}/`,
        name: `${options ? options.otherOptions.siteTitle : ""}`,
        inLanguage: "en-CA",
        publisher: {
          "@id": `${baseURL}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseURL}/?s={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${baseURL}/#organization`,
        name: `${options ? options.otherOptions.siteTitle : ""}`,
        url: `${baseURL}`,
        logo: {
          "@type": "ImageObject",
          url: `${options.otherOptions.siteLogo}`,
        },
        sameAs: [
          `${options.otherOptions.instagramUrl ? options.otherOptions.instagramUrl : ""}`,
          `${options.otherOptions.facebookUrl ? options.otherOptions.facebookUrl : ""}`,
        ],
        telephone: `${options.otherOptions.siteContact}`,
      },
      {
        "@type": "ShoppingCenter",
        "@id": `${baseURL}/#shoppingcenter`,
        name: `${options ? options.otherOptions.siteTitle : ""}`,
        url: `${baseURL}/`,
        telephone: `${options.otherOptions.siteContact}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${addressParts[0] ? addressParts[0] : ''}`,
          addressLocality: `${addressParts[1] ? addressParts[1] : ''}`,
          addressRegion: `${addressParts[2] ? addressParts[2] : ''}`,
          postalCode: `${addressParts[3] ? addressParts[3] : ''}`,
          addressCountry: `${addressParts[4] ? addressParts[4] : ''}`,
        },
        openingHoursSpecification: openingHoursSpec,
        parentOrganization: {
          "@id": `${baseURL}/#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${baseURL}/#webpage`,
        url: `${baseURL}/`,
        name: `${data.meta_title} | ${options.otherOptions.siteTitle ?? ""}`,
        isPartOf: {
          "@id": `${baseURL}/#website`,
        },
        about: {
          "@id": `${baseURL}/#shoppingcenter`,
        },
        inLanguage: "en-CA",
        breadcrumb: {
          "@id": `${baseURL}/#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseURL}/#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
      {
        "@type": "FAQPage",
        "@id": `${baseURL}/#faq`,
        mainEntity: structuredFaqs,
      },
    ],
  };
}

export function getAboutPageSchema({
  slug,
  baseURL,
  metaOptions,
}: SchemaProps) {
  const options = JSON.parse(metaOptions || "");
 const addressParts = (options.otherOptions.siteAddress || "").split(",").map((s:string) => s.trim());

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${baseURL}/about/#aboutpage`,
        url: `${baseURL}/about`,
        name: `About ${options ? options.otherOptions.siteTitle : ""}`,
        isPartOf: {
          "@id": `${baseURL}/#website`,
        },
        about: {
          "@id": `${baseURL}/#organization`,
        },
        inLanguage: "en-CA",
        breadcrumb: {
          "@id": `${baseURL}/about/#breadcrumb`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${baseURL}/#organization`,
        name: `${options ? options.otherOptions.siteTitle : ""}`,
        url: `${baseURL}/`,
        logo: {
          "@type": "ImageObject",
          url: `${options.otherOptions.siteLogo}`,
        },
        sameAs: [
          `${options.otherOptions.instagramUrl ?? ""}`,
          `${options.otherOptions.facebookUrl ?? ""}`,
        ],
        telephone: `${options.otherOptions.siteContact}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${addressParts[0] ? addressParts[0] : ''}`,
          addressLocality: `${addressParts[1] ? addressParts[1] : ''}`,
          addressRegion: `${addressParts[2] ? addressParts[2] : ''}`,
          postalCode: `${addressParts[3] ? addressParts[3] : ''}`,
          addressCountry: `${addressParts[4] ? addressParts[4] : ''}`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${baseURL}/about/#webpage`,
        url: `${baseURL}/about/`,
        name: `About | ${options.otherOptions.siteTitle ?? ""}`,
        isPartOf: {
          "@id": `${baseURL}/#website`,
        },
        inLanguage: "en-CA",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseURL}/about/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${baseURL}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About",
            item: `${baseURL}/about`,
          },
        ],
      },
    ],
  };
}

export function getStorePageSchema({
  slug,
  baseURL,
  metaOptions,
  storeData,
}: SchemaProps) {
  const segments = Array.isArray(slug) ? slug : slug.split("/").filter(Boolean);
  const pageUrl = `${baseURL}/${segments.join("/")}`;

  const data = JSON.parse(metaOptions || "");
  const store_data = JSON.parse(storeData || "");

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseURL,
    },
  ];

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const path = `${baseURL}/${segments.slice(0, index + 1).join("/")}`;

    const nameFromSlug = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    breadcrumbItems.push({
      "@type": "ListItem",
      position: index + 2,
      name: isLast
        ? store_data.title.replaceAll("&amp;", "&") ||
          nameFromSlug.replaceAll("&amp;", "&")
        : nameFromSlug.replaceAll("&amp;", "&"),
      item: path,
    });
  });

  const metaData = jsonparsedData(store_data.meta_fields_group);
  const storeInfo = jsonparsedData(store_data.store_information_group);

  let parsedData =
    typeof store_data.store_hours_group === "string"
      ? JSON.parse(store_data.store_hours_group)
      : store_data.store_hours_group;

  if (typeof parsedData === "string") {
    parsedData = JSON.parse(parsedData);
  }

  const openingHoursSpecification = Object.keys(parsedData)
    .filter((key) => key.includes("_hours") && key !== "override_mall_hours")
    .map((key) => {
      const day = key.split("_")[0];
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
        opens: parsedData[key].opening_hours,
        closes: parsedData[key].closing_hours,
      };
    });
  const addressParts = (data.siteAddress || "").split(",").map((s:string) => s.trim());

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Store",
        "@id": `${pageUrl}/#store`,
        name: `${store_data.title.trim().replaceAll("&amp;", "&")}`,
        url: `${pageUrl}`,
        description: `${metaData.meta_description !== null ? metaData.meta_description.trim().replaceAll("&amp;", "&") : ""}`,
        telephone: `${storeInfo.store_phone}`,
        image: `${store_data.thumbnail.url}`,
        sameAs: `${pageUrl}`,
        hasMap: `${storeInfo.external_id ? `${baseURL}/mall-map#/profile?location=${storeInfo.external_id}` : ""}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${addressParts[0] ? addressParts[0] : ''}`,
          addressLocality: `${addressParts[1] ? addressParts[1] : ''}`,
          addressRegion: `${addressParts[2] ? addressParts[2] : ''}`,
          postalCode: `${addressParts[3] ? addressParts[3] : ''}`,
          addressCountry: `${addressParts[4] ? addressParts[4] : ''}`,
        },
        openingHoursSpecification: openingHoursSpecification,
        parentOrganization: {
          "@type": "ShoppingCenter",
          "@id": `${baseURL}/#shoppingcenter`,
          name: `${data ? data.siteTitle : ""}`,
          url: `${baseURL}/`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: `${pageUrl}/`,
        name: `${store_data.title.trim()} | ${data ? data.siteTitle : ""}`,
        isPartOf: {
          "@id": `${baseURL}/#website`,
        },
        about: {
          "@id": `${pageUrl}/#store`,
        },
        primaryImageOfPage: {
          "@id": `${pageUrl}/#primaryimage`,
        },
        breadcrumb: {
          "@id": `${pageUrl}/#breadcrumb`,
        },
        inLanguage: "en-CA",
      },
      {
        "@type": "ImageObject",
        "@id": `${pageUrl}/#primaryimage`,
        url: `${store_data.thumbnail.url}`,
        contentUrl: `${store_data.thumbnail.url}`,
        caption: `${store_data.thumbnail.alt}`,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
    ],
  };
}

export function getBlogPageSchema({ seo, baseURL }: SchemaProps) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${baseURL}/blog/#blog`,
        name: "Blog & Shopping Guide",
        url: `${baseURL}/blog/`,
        publisher: {
          "@id": `${baseURL}/#organization`,
        },
        inLanguage: "en-CA",
      },
      {
        "@type": "CollectionPage",
        "@id": `${baseURL}/blog/#collectionpage`,
        url: `${baseURL}/blog/`,
        name: `${seo ? seo.meta_title?.trim().replaceAll("&amp;", "&") : ""}`,
        description: `${seo ? seo.meta_description?.trim().replaceAll("&amp;", "&") : ""}`,
        isPartOf: {
          "@id": `${baseURL}/#website`,
        },
        about: {
          "@id": `${baseURL}/blog/#blog`,
        },
        inLanguage: "en-CA",
        breadcrumb: {
          "@id": `${baseURL}/blog/#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseURL}/blog/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${baseURL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${baseURL}/blog/`,
          },
        ],
      },
    ],
  };
}
export function getBlogDetailSchema({
  seo,
  baseURL,
  slug,
  metaOptions,
}: SchemaProps) {
  const otherOptionsData =
    metaOptions && metaOptions !== "" ? JSON.parse(metaOptions) : {};
  const optionsData = otherOptionsData.otherOptions;
  const segments = Array.isArray(slug) ? slug : slug.split("/").filter(Boolean);
  const pageUrl = `${baseURL}/${segments.join("/")}`;

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseURL,
    },
  ];

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const path = `${baseURL}/${segments.slice(0, index + 1).join("/")}`;

    const nameFromSlug = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    breadcrumbItems.push({
      "@type": "ListItem",
      position: index + 2,
      name: isLast
        ? (seo?.title && seo?.title.replaceAll("&amp;", "&")) ||
          nameFromSlug.replaceAll("&amp;", "&")
        : nameFromSlug.replaceAll("&amp;", "&"),
      item: path,
    });
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${pageUrl}/#blogposting`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${pageUrl}`,
        },
        headline: `${seo?.meta_title ? seo.meta_title.replaceAll("&amp;", "&") : ""}`,
        description: `${seo?.meta_description ? seo.meta_description.replaceAll("&amp;", "&") : ""}`,
        image: `${seo ? seo.thumbnail?.url : ""}`,
        author: {
          "@type": "Organization",
          name: `${optionsData ? optionsData.siteTitle : ""}`,
        },
        publisher: {
          "@id": `${baseURL}/#organization`,
        },
        datePublished: `${seo ? seo.published_at : ""}`,
        dateModified: `${seo ? seo.updated_at : ""}`,
        inLanguage: "en-CA",
        isPartOf: {
          "@id": `${baseURL}/blog/#blog`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
    ],
  };
}
export async function getMetadata({
  seo,
  slug,
  metaOptions,
  baseURL,
}: GenerateMetadataProps): Promise<Metadata> {
  if (!seo) return {};
  const otherOptionsData =
    metaOptions && metaOptions !== "" ? JSON.parse(metaOptions) : {};
  const optionsData = otherOptionsData && otherOptionsData.otherOptions;

  const path = Array.isArray(slug) ? slug.join("/") : slug;
  const fallbackCanonical = `${baseURL}/${path}`;
  const finalUrl = seo.canonical_url || fallbackCanonical;
  const envstring = process.env.NEXT_PUBLIC_ENVIRONMENT || 'local';
  const metaIndex = envstring == 'prod' && optionsData && optionsData.meta_index == "true" ? true : false;
  const metaTitle = seo.meta_title
    ? `${seo.meta_title?.trim().replaceAll("&amp;", "&")} | ${optionsData && optionsData.siteTitle}`
    : `${seo.title?.trim().replaceAll("&amp;", "&")} | ${optionsData && optionsData.siteTitle}`;

  return {
    title: metaTitle.replaceAll("&amp;", "&"),
    description: seo.meta_description?.trim().replaceAll("&amp;", "&"),
    alternates: {
      canonical: finalUrl,
    },
    robots: {
      index: metaIndex,
      follow: metaIndex,
    },
    openGraph: {
      type: "website",
      title: metaTitle.replaceAll("&amp;", "&"),
      description: seo.meta_description?.trim().replaceAll("&amp;", "&") || "",
      url: finalUrl,
      siteName: optionsData && optionsData.siteTitle,
      locale: "en_CA",
      images: seo.thumbnail?.url
        ? [
            {
              url: seo.thumbnail.url,
              width: 1200,
              height: 630,
              alt: metaTitle || "",
            },
          ]
        : [],
    },
  };
}

export async function getBlogDetailMetadata({
  seo,
  slug,
  baseURL,
  metaOptions,
}: GenerateMetadataProps): Promise<Metadata> {
  if (!seo) return {};
  const otherOptionsData =
    metaOptions && metaOptions !== "" ? JSON.parse(metaOptions) : {};
  const optionsData = otherOptionsData.otherOptions;

  const path = Array.isArray(slug) ? slug.join("/") : slug;
  const fallbackCanonical = `${baseURL}/${path}`;
  const finalUrl = seo.canonical_url || fallbackCanonical;
  const envstring = process.env.NEXT_PUBLIC_ENVIRONMENT || 'local';
  const metaIndex = envstring == 'prod' && seo.meta_index == "true" ? true : false;
  const publishedDate = seo.published_at || "";
  const modifiedDate = seo.updated_at || "";
  const metaTitle = seo.meta_title
    ? `${seo.meta_title?.trim().replaceAll("&amp;", "&")} | ${optionsData ? optionsData.siteTitle : ""}`
    : `${seo.title?.trim().replaceAll("&amp;", "&")} | ${optionsData ? optionsData.siteTitle : ""}`;

  return {
    title: metaTitle.replaceAll("&amp;", "&"),
    description: seo.meta_description?.trim().replaceAll("&amp;", "&"),
    alternates: {
      canonical: finalUrl,
    },
    robots: {
      index: metaIndex,
      follow: metaIndex,
    },
    openGraph: {
      type: "article",
      title: metaTitle.replaceAll("&amp;", "&"),
      description: seo.meta_description?.trim().replaceAll("&amp;", "&") || "",
      url: finalUrl,
      siteName: optionsData ? optionsData.siteTitle : "",
      locale: "en_CA",
      publishedTime: publishedDate,
      modifiedTime: modifiedDate,
      authors: [`${optionsData ? optionsData.siteTitle : ""}`],
      section: "Blog",
      images: seo.thumbnail?.url
        ? [
            {
              url: seo.thumbnail.url,
              width: 1200,
              height: 630,
              alt: metaTitle || "",
            },
          ]
        : [],
    },
    other: {
      "article:publisher": `${optionsData ? optionsData.siteTitle : ""}`,
    },
  };
}

const parseJSON = (data: string | undefined) => {
  try {
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const fetchOptionsData = cache(async () => {
  const options = await getOptionsData();
  const allOptions = options?.getGeneralOptions[0];
  return {
    alterBarData: allOptions ? parseJSON(allOptions.alertData) : null,
    headerData: allOptions ? parseJSON(allOptions.headerData) : null,
    otherOptions: allOptions ? parseJSON(allOptions.otherOptions) : null,
    detailPageOptions: allOptions
      ? parseJSON(allOptions.detailPageOptions)
      : null,
    footerData: allOptions ? parseJSON(allOptions.footerData) : null,
    mallHours: allOptions ? parseJSON(allOptions.mall_hours) : null,
    holidayHours: allOptions ? parseJSON(allOptions.holiday_hours) : null,
    holidays: allOptions ? parseJSON(allOptions.holiday_days) : null,
    redirectionData: allOptions ? parseJSON(allOptions.redirectionData) : null,
    blogData: allOptions ? parseJSON(allOptions.blog_data) : null,
    status: allOptions ? allOptions.status : null,
    message: allOptions ? allOptions.message : null,
  };
 
});


export const COMPONENT_MAP = {
  homebanner: HomeBanner,
  page_banner_block: InnerBanner,
  featured_stores_block: FeaturedStores,
  headings_description_block: HeadingWithDescription,
  cards_grid_block: CardsGridBlock,
  posts_block: PostsBlock,
  plan_visit_block: PlanVisit,
  image_content_block: ImageWithContent,
  faqs_block: Accordian,
  form_block: FormBlock,
  spacer_block: SpacerBlock,
  post_listing_block: PostsListingBlock,
  image_collage_block: ImageCollage,
  video_block: VideoBlock,
  logo_slider_block: LogoSlider,
  core_group: TabsBlock,
  gallery_slider: GallerySlider,
  search_block: CustomSearch,
  related_posts: RelatedPost,
  tru_mappedin_block: MappedinMap,
  tru_directions_map_block: DirectionsMap,
  mall_holliday_hours_block: StoreHoursAccordion,
};
export async function getBaseConfig() {
  const headerList = await (await import("next/headers")).headers();
  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return { baseURL: `${protocol}://${host}` };
}
