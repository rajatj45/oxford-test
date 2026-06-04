// 1. WINDOW & DATALAYER
export interface DataLayerObject {
  event?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer: DataLayerObject[];
        acsbJS?: {
      init: () => void;
    };

    __acsb_initialized__?: boolean;

  }
}

// 2. UI & MEDIA
export interface ImageProps {
  alt?: string;
  url?: string;
}

export interface CtaProps {
  url?: string;
  title?: string;
  target?: string;
}

// Specific CTA type for OpeningHours API
interface Cta {
  url: string;
  title: string;
  target: "_self" | "_blank";
}

export interface ArrString {
  val?: boolean;
}

export type DeviceDisplay = "all_device" | "desktop" | "mobile" | "none";

// 3. NAVIGATION & MENUS
export interface MenuItem {
  title: string;
  url: string;
  children?: SubMenu[];
  customClass?: string;
}

export type SubMenu = MenuItem;

export interface LinkTypes {
  cta_label?: string;
  cta: CtaProps;
  title?: string;
  url?: string;
  target?: string;
}

// 4. CARDS & STYLING
export interface CardsProps {
  slug: string | undefined;
  thumbnail?: { url: string };
  title?: string;
  subTitle?: string;
  gallery?: ImageProps[];
  image?: ImageProps;
  card_mobile_image?: ImageProps;
  links?: LinkTypes[];
  content?: string;
  instragam?: string;
  facebook?: string;
  compact_layout?: string;
}



export interface PostCardsProps {
  id?: string;
  title?: string;
  subTitle?: string;
  content?: string;
  thumbnail: ImageProps;
  links?: LinkTypes[];
  link: string;
  slug?: string;
  selected_stores?: SelectedStore[];
   card_mobile_image?: ImageProps;
  store_offer_date_range?: string;
  store_desc?: string;
  job_stores_name?: string;
  job_stores_url?: string;
  categories?: string;
  tags?:string;
  short_description?: string
}

interface SelectedStore {
  name: string;
}

export type CardStyles =
  | "step-card"
  | "info-card"
  | "overlay-card"
  | "gift-card"
  | "compact-card"
  | "accordion-card"
  | "horizontal-card"
  | "job-card";

export type CardColourTheme =
  | "solid-primary"
  | "solid-grey"
  | "solid-white"
  | "transparent";

// 5. FORMS
export interface FormFieldChoice {
  field_id: string;
  field_label: string;
  field_value: string;
}

export interface SelectedForm {
  form_id: string;
  form_title: string;
}

export interface FormField {
  item_class: string;
  field_id: number | string;
  field_label: string;
  field_type: "text" | "email" | "checkbox" | "name" | string;
  fileSize?: number;
  is_required: boolean;
  choices?: FormFieldChoice[];
  cssClass?: string;
  field_description?:string;
}

// 6. BUSINESS HOURS & HOLIDAYS
export type MallHoursData = {
  hours: Record<string, string>;
};

export type HolidayHour = {
  day: string;
  date: string;
};

export type HolidayHours = {
  holiday_hours: HolidayHour[];
};

export type HolidayDays = {
  holiday_days: HolidayHour[];
};

export type HolidayHoursDay = {
  day?: string;
  close?: string;
  open?: string;
  date?: string;
};

export type HolidayHoursData = {
  HolidayHoursDay: string[];
};

export interface MalldailyHours {
  showing: string;
  today_hours: string;
  cta: string[];
}

export type MallHoursCTA = {
  url?: string;
  title?: string;
  target?: string;
};

export type MallHoursMeta = {
  title?: string;
  subtitle?: string;
  notice?: string;
  cta?: MallHoursCTA;
};

export interface OpeningHoursData {
  cta: CtaProps | CtaProps[];
  hours: Record<string, string>;
  showing: string;
  today_hours: string;
}



export type OpeningHoursAPI = {
  showing: string;
  today_hours: string;
  hours: Record<string, string>;
  cta?: Cta | Cta[];
};

export type InfoSection = {
  mall_hours?: MallHoursMeta;
  statutory_holiday_hours?: {
    title?: string;
    subtitle?: string;
    cta?: MallHoursCTA[];
  };
  statutory_holidays?: {
    title?: string;
    subtitle?: string;
    cta?: MallHoursCTA[];
  };
};

export interface RedirectionLink {
  old_url: string;
  new_url: string;
}

// 7. Main Page Sections (BLOCK DATA)
export interface BlockData {
  destination_label?: string;
  disable_cta?:string[];
  map_cta?: string;
  selected_places?: string;
  block_id?:string;
  section_orientation?: string;
  search_heading?: string;
  search_subheading?: string;
  section_intro_width: string | undefined;
  destination_lat?: string;
  destination_lng?: string;
  mobile_top_spacing?: string;
  mobile_bottom_spacing?: string;
  hide_block: string[];
  related_posts: string;
  heading_placement?: string;
  search_type: string;
  section_alignment?: string;
  enable_desc?: string[];
  tab_data: string;
  mallHours: MallHoursData;
  tag: string;
  section_title?: string;
  section_subTitle?: string;
  content?: string;
  cta?: CtaProps;
  cta_label?: string;
  main_image?: ImageProps;
  tablet_image?: ImageProps;
  mobile_image?: ImageProps;
  bg_color?: string;
  gallery?: ImageProps[];
  additional_classes?: string;
  section_layout?: string;
  alignment?: string;
  visible_slides?: number;
  visible_slides_mobile?: number;
  enable_search?: string;
  placeholder: string;
  enable_slider: ArrString;
  enable_load_more: string;
  enable_captcha: string;
  slider_visibility: string;
  column?: number;
  column_mobile?: number;
  cards?: CardsProps[];
  variant?: string;
  post_type?: string;
  post_link_text?: string;
  number_of_posts?: number;
  card_style?: string;
  post_taxonomy?: PostTaxonomy[];
  cat_filter_type?: string;
  option?: string;
  compact_layout?: string;
  column_layout?: string;
  card_color_theme?: CardColourTheme;
  border_class?: string;
  mall_data?: string;
  holidayHours?: HolidayHoursData;
  holidays?: HolidayDays;
  video?: string;
  posterUrl?: string;
  links?: LinkTypes[];
  form_fields?: FormField;
  selected_from_id?: SelectedForm;
  form_title?: string;
  top_spacing?: string;
  bottom_spacing?: string;
  enable_dots?: DeviceDisplay;
  enable_arrows?: DeviceDisplay;
  center_mode?: DeviceDisplay;
  border_width?: string;
  enable_card_border?: string;
  enable_sorting?: string[];
  enable_filters?: string[];
  enable_category?: string[];
  exclude_cat?: string[];
  enable_tag_category?: string[];
}

export type Tab = {
  tab_icon: string;
  tab_name: string;
  tab_slug: string;
  tab_blocks: BlockData[];
};

export interface TaxonomyTerm {
  slug: string;
  name: string;
}

interface PostTaxonomy {
  taxonomy_slug: string;
  terms: TaxonomyTerm[];
}

// 8. GEOLOCATION & ROUTING
export type LatLng = { latitude: number; longitude: number };

export type StartLocation = {
  id: string;
  label: string;
  coords: LatLng;
  nearestGate: string;
};

export type RouteData = {
  distanceMeters?: number;
  duration?: string;
  localizedValues?: {
    distance?: { text?: string };
    duration?: { text?: string };
  };
  polyline: { encodedPolyline: string };
  legs: Array<{
    steps: Array<{
      localizedValues?: { distance?: { text?: string } };
      navigationInstruction?: { instructions?: string; maneuver?: string };
      transitDetails?: { transitLine?: { nameShort?: string } };
    }>;
  }>;
};

// export const DESTINATION: LatLng = {
//   latitude: Number(process.env.NEXT_PUBLIC_DEST_LAT) || 43.5931,
//   longitude: Number(process.env.NEXT_PUBLIC_DEST_LNG) || -79.6417,
// };

// 9. SEO & METADATA
export interface SeoData {
  title?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  thumbnail?: { url: string };
  meta_index?: string;
  published_at?: string;
  updated_at?: string;
}

export interface SchemaProps {
  slug: string | string[];
  baseURL: string;
  seo?: SeoData;
  pageName?: string;
  metaOptions?: string;
  storeData?: string;
  siteName?: string;
  homeData?: string
}

export interface GenerateMetadataProps {
  seo?: SeoData;
  slug: string | string[];
  metaOptions?: string;
  baseURL: string;
  siteName?: string;
  pageTitle?: string;
}

// 10. SEARCH
export interface SearchMeta {
  store_logo: string;
  primary_image: string;
  featured_description: string;
  content: string;
  event_description: string;
}

export interface SearchResult {
  thumbnail: ImageProps;
  content: string;
  post_type: string;
  id: string;
  title: string;
  description: string;
  slug?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  suggestions: string[];
  error?: string;
}

export type TimeValue = Record<string, string | undefined>;
