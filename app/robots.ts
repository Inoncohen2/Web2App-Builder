
import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'], // Don't index private dashboard or API routes
    },
    sitemap: 'https://web2app-builder.vercel.app/sitemap.xml',
    host: 'https://web2app-builder.vercel.app',
  }
}
