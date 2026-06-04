import RenderBlocks from "@/components/RenderBlocks";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import Preloader from "@/components/Preloader";
import {
  fetchOptionsData,
  getBaseConfig,
  getBlogDetailMetadata,
  getBlogDetailSchema,
} from "@/utils/utility";
import { getPageData } from "@/app/api/graphql/pages";
import InnerBanner from "@/components/InnerBanner";
import { BlockData } from "@/types/global";
import FormBlock from "@/components/FormBlock";

const getPageDetails = cache(async (slug: string | string[]) =>{
  const slugPath = Array.isArray(slug) ? slug.join('/') : slug;   

  const [allData, baseConfig, options] = await Promise.all([
      getPageData(slugPath, "post", process.env.NEXT_PUBLIC_MALL_KEY || ''),
      getBaseConfig(),
      fetchOptionsData()
  ]);

  const post = allData?.getPostDataBySlug;
  if (!post) notFound();

  return { post, slugPath, baseURL: baseConfig.baseURL, options };
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fullSlugPath = ["blog", slug];
  const { post, slugPath, baseURL, options } = await getPageDetails(slug)

  return getBlogDetailMetadata({
    seo: post,
    baseURL,
    slug: fullSlugPath,
    metaOptions: JSON.stringify({ otherOptions: options.otherOptions }),
  });
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CustomPostPage({
  params,
  data,
}: { data: BlockData } & Props) {
  const { slug } = await params;
  const { post, slugPath, baseURL, options } = await getPageDetails(slug);
  const fullSlugPath = ["blog", slug];

  if (post?.status === 'error') {
    return (
      <div className="py-20 text-center">
        <h2 className="text-3xl font-bold">
          Unauthorized access!
        </h2>
      </div>
    );
  }


  if (!post) notFound();

  const allBlocks = post.meta_content || [];
  const schema = getBlogDetailSchema({
    slug: fullSlugPath,
    baseURL,
    seo: post,
    metaOptions: JSON.stringify({ otherOptions: options.otherOptions }),
  });
  const bannerData = {
    section_title: post.title,

    main_image: {
      url: post.thumbnail.url || "/images/blog-banner.jpg",
      alt: "Desktop Banner",
    },
    mobile_image: {
      url: post.thumbnail.url,
      alt: "Mobile Banner",
    },

    bottom_spacing: 80,
    mobile_bottom_spacing: 64,
  } as unknown as BlockData;

  const blogDetailFormData = {
    section_title: options.blogData?.form_data?.form_section_title || "",

    section_subTitle: options.blogData?.form_data?.form_section_subtitle
      ? `<p>${options.blogData.form_data.form_section_subtitle}</p>`
      : "",

    form_fields: options.blogData?.form_fields,
    selected_from_id: options.blogData?.form_data,
    enable_captcha: options.blogData.form_captcha,
    additional_classes: "spacing-y-64 bg-solid-primary",
    section_layout: "container",
  } as BlockData;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="blog-detail-page pb-8 md:pb-12">
        <div>
          <InnerBanner data={bannerData} />
        </div>
        {allBlocks.length > 0 ? (
          <Suspense fallback={<Preloader isLoading={true} />}>
            <RenderBlocks content={allBlocks} />
          </Suspense>
        ) : (
          <p>No blocks found for {slug}</p>
        )}

      </div>
      <FormBlock data={blogDetailFormData} />
    </>
  );
}
