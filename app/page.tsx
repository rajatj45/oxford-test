import { Metadata } from "next";
import { getPageData } from "./api/graphql/pages";
import RenderBlocks from "@/components/RenderBlocks";
import { getHomePageSchema, getMetadata,getBaseConfig, fetchOptionsData } from "@/utils/utility";
import { cache } from "react";

type Props = {
  params: Promise<{ slug: string }>;
};

const getHomeData = cache(async () =>{
  const [allData, baseURLData, otherOptionsData] = await Promise.all([
    getPageData("home", process.env.NEXT_PUBLIC_PAGE_TYPE || '', process.env.NEXT_PUBLIC_MALL_KEY || ''),
    getBaseConfig(),
    fetchOptionsData()
  ]);

  return {
    allData,
    baseURL: baseURLData.baseURL,
    otherOptions: otherOptionsData.otherOptions,
    mallHours: otherOptionsData.mallHours,
  };
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = '' } = await params;
  const { allData, baseURL, otherOptions } = await getHomeData()

  return getMetadata({
    seo: allData?.getPostDataBySlug,
    metaOptions: JSON.stringify({otherOptions}),
    baseURL,
    slug
  });
}

export default async function Home({ params }: Props) {
  const { slug = "home" } = await params;
  const { allData, baseURL, otherOptions, mallHours } = await getHomeData();

  if (allData?.getPostDataBySlug?.status === 'error') {
    return (
      <div className="py-20 text-center">
        <h2 className="text-3xl font-bold">
          Unauthorized access!
        </h2>
      </div>
    );
  }

  if (!allData?.getPostDataBySlug) return null;

  const allBlocks = allData?.getPostDataBySlug.meta_content || [];
  const seo = allData?.getPostDataBySlug;
  const metaOptions = { mallHours, otherOptions };

  const schema = getHomePageSchema({ 
    slug, 
    baseURL, 
    homeData: JSON.stringify(seo), 
    metaOptions: JSON.stringify(metaOptions) 
  });
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <RenderBlocks content={allBlocks} />
    </>
  );
}
