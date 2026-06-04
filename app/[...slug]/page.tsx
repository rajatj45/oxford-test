import { getPageData } from "../api/graphql/pages";
import RenderBlocks from "@/components/RenderBlocks";
import { Metadata } from "next";
import { notFound, redirect } from 'next/navigation';
import { Fragment, Suspense, cache } from "react";
import { getHomePageSchema, getMetadata, getPageSchema, getBaseConfig, getAboutPageSchema, getBlogPageSchema, fetchOptionsData } from "@/utils/utility";
import { getPostListData } from "../api/graphql/posts";
import Preloader from "@/components/Preloader";
import Breadcrumb from "@/components/Breadcrumb";

const getPageDetails = cache(async (slug: string | string[]) =>{
    const slugPath = Array.isArray(slug) ? slug.join('/') : slug;   
    if (slugPath === 'home') redirect('/');

    const [allData, baseConfig, options] = await Promise.all([
        getPageData(slugPath, process.env.NEXT_PUBLIC_PAGE_TYPE || '', process.env.NEXT_PUBLIC_MALL_KEY || ''),
        getBaseConfig(),
        fetchOptionsData()
    ]);

    const post = allData?.getPostDataBySlug;
    if (!post) notFound();

    return { post, slugPath, baseURL: baseConfig.baseURL, options };
})

export async function generateStaticParams() {
    try {
        const data = await getPostListData(`${process.env.NEXT_PUBLIC_PAGE_TYPE}`, 100, 0);
        const posts = data?.getPostsList?.posts || [];

        return Array.isArray(posts) ? posts.map((post) => ({ slug: post.slug.replace(/^\/|\/$/g, '').split('/') })) : [];
    } catch (e) {
        return [];
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { post, baseURL, options } = await getPageDetails(slug);

    return getMetadata({
      seo: post,
      baseURL,
      metaOptions: JSON.stringify({ otherOptions: options.otherOptions }),
      slug
    });
}

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function CustomPostPage({ params }: Props) {
    const { slug } = await params;
    const { post, slugPath, baseURL, options } = await getPageDetails(slug);

    const metaOptionsStr = JSON.stringify({
        mallHours: options.mallHours,
        otherOptions: options.otherOptions
    });

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

    let schema;
    if (slugPath === '/' || slugPath === '') {
        schema = getHomePageSchema({ slug: "home", baseURL, homeData: JSON.stringify(post), metaOptions: metaOptionsStr });
    } else if (slugPath === 'about') {
        schema = getAboutPageSchema({ slug: slugPath, baseURL, metaOptions: metaOptionsStr });
    } else if (slugPath === 'blog') {
        schema = getBlogPageSchema({ slug: slugPath, baseURL, seo: post });
    } else {
        schema = getPageSchema({ slug: slugPath, baseURL, seo: post });
    }

    const breadcrumbData = post.enable_breadcrumb ? JSON.parse(post.enable_breadcrumb) :''
    const enableBreadcrumb = breadcrumbData && breadcrumbData.includes("yes");
    const allBlocks = post.meta_content || [];

    return (
        <Fragment>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />

            <div>
                {enableBreadcrumb &&
                    <Breadcrumb/>
                }
                {allBlocks.length > 0 ? (
                        <Suspense fallback={<Preloader isLoading={true}/>}>
                            <RenderBlocks content={allBlocks} />
                        </Suspense>
                    ) : (
                        <p>No blocks found for {slug}</p>
                )}
            </div>
        </Fragment>
    );
}

