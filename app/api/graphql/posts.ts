import { fetchGraphql } from "./graphql";

export async function getPostListData(
  tag: string,
  limit: number,
  offset?: number,
  termTaxonomy?: string,
  mallLoc?: string,
  catFilterType?: string,
  excludCategories?:string
) {
  const query = {
    query: `{
        getPostsList(authKey: "${process.env.NEXT_PUBLIC_AUTH_KEY}", postType: "${tag}", limit: ${limit}, offset:${offset}, termTaxonomy: "${termTaxonomy ? termTaxonomy : ''}", mallLoc: "${mallLoc ? mallLoc : ''}", catFilterType:"${catFilterType ? catFilterType : ''}", excludCategories:"${excludCategories ? excludCategories : ''}") {
            posts {
                title
                slug
                link
                content
                found_posts
                store_desc
                thumbnail {
                    url
                    alt
                }
                selected_stores {
                  name
                }
                store_offer_date_range
                tags
                categories
                job_stores_name
                job_stores_url
                short_description 
            }
            status
            message
        }
    }`,
  };

  const data = await fetchGraphql(query);
  return data?.data || data;
}
