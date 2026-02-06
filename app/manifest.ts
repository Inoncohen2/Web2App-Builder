import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Web2App Builder',
    short_name: 'Web2App',
    description: 'Convert websites into native mobile apps instantly.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: 'https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338681/favicon_h9frbq.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: 'https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}