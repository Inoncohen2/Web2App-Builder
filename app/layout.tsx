
import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://web2app-builder.vercel.app'),
  title: {
    default: "Web2App Builder | Convert Website to App Instantly",
    template: "%s | Web2App Builder"
  },
  description: "Turn any website into a premium native Android & iOS mobile app in seconds. No coding required. Features include push notifications, offline mode, and native navigation.",
  keywords: [
    "convert website to app", 
    "web to app", 
    "website to apk", 
    "turn site into app", 
    "no code app builder", 
    "android app builder", 
    "ios app converter", 
    "pwa to native", 
    "webview wrapper", 
    "convert url to app",
    "saas app builder",
    "mobile app generator"
  ],
  authors: [{ name: "Web2App Team" }],
  creator: "Web2App Builder",
  publisher: "Web2App Builder",
  manifest: "/manifest.json",
  verification: {
    google: 'sKrPbZL-deYzIXWN-FpeknKpS2vLN-xcfNgzp0F5plA',
  },
  icons: {
    icon: "https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576930/favicon_d9gf02.ico",
    apple: "https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png",
    shortcut: "https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576930/favicon_d9gf02.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://web2app-builder.vercel.app",
    title: "Web2App Builder | Convert Website to App Instantly",
    description: "Turn any website into a premium native Android & iOS mobile app in seconds. No coding required.",
    siteName: "Web2App Builder",
    images: [
      {
        url: "https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png",
        width: 1200,
        height: 630,
        alt: "Web2App Builder Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web2App Builder | Convert Website to App Instantly",
    description: "Turn any website into a premium native Android & iOS mobile app in seconds.",
    images: ["https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png"],
    creator: "@web2appbuilder",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Web2App",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global Schema for Knowledge Graph (Organization & WebSite)
  const globalSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://web2app-builder.vercel.app/#organization",
        "name": "Web2App Builder",
        "url": "https://web2app-builder.vercel.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png",
          "width": 512,
          "height": 512
        },
        "sameAs": [
          "https://twitter.com/web2appbuilder",
          "https://facebook.com/web2appbuilder",
          "https://linkedin.com/company/web2appbuilder"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-555-000-0000",
          "contactType": "customer service",
          "email": "support@web2app-builder.com",
          "areaServed": "WorldWide",
          "availableLanguage": ["English", "Hebrew"]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://web2app-builder.vercel.app/#website",
        "url": "https://web2app-builder.vercel.app",
        "name": "Web2App Builder",
        "publisher": {
          "@id": "https://web2app-builder.vercel.app/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://web2app-builder.vercel.app/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
