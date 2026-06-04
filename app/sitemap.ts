import { MetadataRoute } from 'next';
import { getSiteMap } from './api/graphql/sitemapData';

export async function generateSitemaps() {
  return [
    { id: 'page' },
    { id: 'store' },
    { id: 'blog' },
    { id: 'event' },
  ];
}

interface DataItem {
  slug: string;
  link: string;
  updated_at?: string | Date;
  date?: string | Date; 
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  
  const data = await getSiteMap(`${process.env.NEXT_PUBLIC_PAGE_TYPE}`, -1);
  if(data.getSiteMap.status === 'error'){
    return [];
  }
  const allData = data.getSiteMap.posts || [];

  const filteredData = allData.filter((item: DataItem) => {
    if (id === 'page') {
      if (['page', 'square-one-pages', 'stc-pages'].includes(item.slug)) {
        return 'page';
      }
    }
    if (id === 'blog') {
      if (['post'].includes(item.slug)) {
        return 'blog';
      }
    }
    return item.slug === id;
  });

  return filteredData.map((item: DataItem) => {
    const isPage = ['page', 'square-one-pages', 'stc-pages'].includes(item.slug);
    // const path = isPage ? item.link : `${item.slug}/${item.link}`;
    const path = item.slug === 'post' 
    ? `blog/${item.link}` 
    : (isPage ? item.link : `${item.slug}/${item.link}`);
    const updateHomePath = path.startsWith('/') ? path.slice(1) : path;
    const cleanPath = updateHomePath == 'home' ? '' : updateHomePath ;
    let updatePriority = 0.9;
    let freq = 'monthly';
    if(id == 'page'){
      updatePriority = updateHomePath == 'home' ? 1.0 : 0.9
      freq =  updateHomePath == 'home' ? 'daily' : 'monthly'
    }else if(id == 'store'){
      updatePriority = 0.8
      freq = 'weekly';
    }else if(id == 'event'){
      updatePriority =  0.7
      freq = 'daily';
    }else if(id == 'blog'){
      updatePriority = 0.6
      freq = 'weekly';
    }else{
      updatePriority = 0.9
      freq = 'monthly';
    }

    return {
      url: `${baseUrl}/${cleanPath}`,
      lastModified: new Date(item.updated_at || item.date || new Date()),
      changeFrequency: freq,
      priority: updatePriority,
    };
  });
}