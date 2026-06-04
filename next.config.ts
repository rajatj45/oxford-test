import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap-index',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shopsquareone.com',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "cmsoxford.local.publishabl.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cmsoxfordqa.wpenginepowered.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cmsoxforddev.wpenginepowered.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.mappedin.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'equiem-store-us.imgix.net',
        port: "",
        pathname: "/**",
      },
       {
        protocol: 'https',
        hostname: 'cmsoxford.wpenginepowered.com',
        port: "",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'cms.oxfordproperties.com',
        port: "",
        pathname: "/**",
      },
    ],
  },
};
 
export default nextConfig;