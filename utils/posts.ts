"use server"
import { getPostListData } from "@/app/api/graphql/posts";

export async function getPostsAction(
    postType: string,
    limit: number,
    offset: number,
    taxonomy: string,
    filterType?: string,
    excludCategories?: string
) {
    try {
        const response = await getPostListData(postType, limit, offset, taxonomy ? taxonomy : '', `${process.env.NEXT_PUBLIC_MALL_KEY}`, `${filterType ?? ''}`, `${excludCategories ?? ''}`);
        const posts = response?.getPostsList?.posts || [];
        const status = response?.getPostsList?.status || 'error';

        const totalFound = response?.getPostsList.status == 'success' ? response?.getPostsList.posts[0]?.found_posts : '0';

        return {
            posts,
            status,
            hasMore: (offset + posts.length) < totalFound,
        };
    } catch (error) {
        console.error("Post Fetching Error:", error);
        return { posts: [], status:'error',hasMore: false };
    }
}