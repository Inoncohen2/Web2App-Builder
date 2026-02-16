
import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Web2App Builder',
    short_name: 'Web2App',
    description: 'Convert websites into native mobile apps instantly.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b', // Changed to Zinc-950 to match landing page
    theme_color: '#09090b',      // Changed to Zinc-950
    icons: [
      {
        src: 'https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576930/favicon_d9gf02.ico',
        sizes: 'any',
        type: 'image/x-icon',
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
