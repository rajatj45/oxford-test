import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const envstring = process.env.NEXT_PUBLIC_ENVIRONMENT || 'local';;
  return {
    rules: {
      userAgent: '*',
      allow: envstring === 'prod' ? '/' : '',
      disallow: envstring === 'prod' ? '' : '/',
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  }
}