import SearchContent from "@/components/SearchContent";
import { fetchOptionsData, getBaseConfig } from "@/utils/utility";
import { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const { otherOptions } = await fetchOptionsData();
  const faviconUrl = otherOptions?.site_favicon?.url || ""; 
  const { baseURL } = await getBaseConfig();
  return {
    title: {
      default: otherOptions?.meta_title || '',
      template: "%s ",
    },
    description: otherOptions?.meta_description || '',
    alternates: {
      canonical: `${baseURL}/search`,
    },
    icons: {
      icon: faviconUrl,
    },
  };
}

export default function Search() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  )
}
