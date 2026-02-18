
import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Web2App Builder',
    short_name: 'Web2App',
    description: 'Convert websites into native mobile apps instantly.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000', // Changed to black to match landing page PWA experience
    theme_color: '#000000',
    icons: [
      {
        src: 'https://res.cloudinary.com/ddsogd7hv/image/upload/v1771417099/favicon-32x32_aththg.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: 'https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
