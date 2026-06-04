import { NextResponse } from 'next/server';
import { fetchGraphql } from '../graphql/graphql';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postType, limit, offset, termTaxonomy, mallLoc, query, letter, catFilterType, selectedCatSlug, selectedTagCatgSlug } = body;

    const graphqlQuery = {
      query: `{
        internalSearch(
          postType: "${postType}", 
          limit: ${limit}, 
          offset: ${offset}, 
          termTaxonomy: "${termTaxonomy || ''}", 
          mallLoc: "${mallLoc || ''}", 
          query: "${query || ''}", 
          letter: "${letter || ''}",
          catFilterType: "${catFilterType || ''}",
          selectedCatSlug: "${selectedCatSlug || ''}",
          selectedTagCatgSlug: "${selectedTagCatgSlug || ''}"
        ) {
          posts {
            title
            slug
            link
            content
            found_posts
            store_desc
            thumbnail { url alt }
            selected_stores { name }
            store_offer_date_range
            categories
          }
        }
      }`,
    };

    const data = await fetchGraphql(graphqlQuery);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch search data' }, { status: 500 });
  }
}
