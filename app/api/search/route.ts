import { Client } from '@elastic/elasticsearch';
import { NextRequest, NextResponse } from 'next/server';
import {
  SearchPhraseSuggestOption
} from '@elastic/elasticsearch/lib/api/types';

const client = new Client({
  node: process.env.NEXT_PUBLIC_ELASTIC_API_ENDPOINT || 'http://localhost:9200',
  auth: {
    apiKey: process.env.NEXT_PUBLIC_ELASTIC_API_KEY || '',
  },
});

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query');
  const categoryId = req.nextUrl.searchParams.get('category');
  const letter = req.nextUrl.searchParams.get('letter');
  const postType = req.nextUrl.searchParams.get('post_type');

  if (!query && !categoryId && !letter) return NextResponse.json({ results: [] });

  try {
    const response = await client.search({
      index: `${process.env.NEXT_PUBLIC_ELASTIC_SEARCH_INDEX}`,
      query: {
        bool: {
          must: query
            ? [{
                multi_match: {
                  query: query,
                  type: "phrase_prefix",
                  slop: 3,
                  fields: [
                    "content",
                    "title",
                    "block_data.cards.content",
                    "block_data.cards.subTitle",
                    "block_data.cards.title",
                    "block_data.content",
                    "block_data.form_title",
                    "block_data.post_type",
                    "block_data.section_subTitle",
                    "block_data.section_title",
                    "data.description",
                    "block_data.tag",
                    // "data.end_date",
                    "data.event_description",
                    "data.event_end",
                    "data.event_location",
                    "data.event_start",
                    "data.location",
                    // "data.start_date",
                    "data.template_data.block_desc.block_description",
                    "data.template_data.heading",
                    "data.template_data.description",
                    "data.template_data.lunar_img_desc.column_description",
                    "data.template_data.vendor_additional_data.block_description",
                    "data.template_data.vendor_additional_data.block_heading",
                    "data.template_data.vendors_description",
                    "data.template_data.vendors_heading",
                    "initial_letter",
                    "mall_loc",
                    "meta_fields_group.canonical_url",
                    "meta_fields_group.meta_description",
                    "meta_fields_group.meta_title",
                    "post_type",
                    "selected_terms.store-category.name",
                    "selected_terms.store-services.name",
                    "selected_terms.store-type.name",
                    "selected_terms.stores.name",
                    "slug",
                    "thumbnail.alt",
                    "thumbnail.url"
                  ]
                }
              }]
            : [{ match_all: {} }], 
            filter: [
              ...(letter ? [{ term: { "initial_letter.keyword": letter.toUpperCase() } }] : []),
              ...(postType ? [{ term: { "post_type.keyword": postType } }] : []),
              ...(categoryId ? [{ term: { "selected_terms.store-category.name.keyword": categoryId } }]  : []),
            ]
        }
      },
      suggest: {
        "text-suggestion": {
          text: query || "",
          phrase: {
            field: "title",
            size: 1,
            confidence: 0.0,
            max_errors: 2,
            direct_generator: [{
              field: "title",
              suggest_mode: "always",
              min_word_length: 3,
              prefix_length: 0
            }],
            collate: {
              query: {
                source: JSON.stringify({
                  match_phrase: {
                    "title": "{{suggestion}}"
                  }
                })
              },
              prune: true
            }
          }
        }
      },
      size: 50,
      sort: [{ "title.keyword": { order: "asc" } }],
    });

    const suggestEntry = response.suggest?.['text-suggestion']?.[0];
    // const options: any = Array.isArray(suggestEntry?.options as any[]) ? suggestEntry?.options : [];
    const options = (suggestEntry && 'options' in suggestEntry)
    ? suggestEntry.options as SearchPhraseSuggestOption[]
    : [];

    const suggestions = options?.filter((opt) => opt.collate_match === true).map((opt) => opt.text);

    // const results = response.hits.hits.filter(hit => hit._source)
    // .map((hit) => ({
    //     id: hit._id,
    //     ...hit._source!,
    // }));

    const results = response.hits.hits
  .filter((hit) => hit._source)
  .map((hit) => {
    const source = hit._source as Record<string, unknown>;
    const rawContent = typeof source.content === 'string' ? source.content : '';
    
    return {
      ...source,
      id: hit._id,
      content: rawContent 
        ? rawContent.substring(0, 200) + (rawContent.length > 200 ? '...' : '') 
        : '',
    };
  });

    return NextResponse.json({ results, suggestions });
  } catch (error) {
    return NextResponse.json({ error: 'Search error' }, { status: 500 });
  }
}