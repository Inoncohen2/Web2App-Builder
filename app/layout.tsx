
import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Providers from "./providers";
import { PWASplash } from "../components/PWASplash";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#09090b", // Matches Landing/Splash background
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://web2app-builder.vercel.app'),
  title: {
    default: "Web2App Builder | Convert Website to App Instantly (Android & iOS)",
    template: "%s | Web2App Builder"
  },
  description: "The #1 Web to App Converter. Turn any website (WordPress, Shopify, Wix, React) into a native mobile app for Android (APK/AAB) & iOS (IPA) in minutes. No coding required. Includes Push Notifications & Offline Mode.",
  keywords: [
    "convert website to app", "web to app", "android app builder", "ios app converter", "pwa to native", 
    "webview wrapper", "web2app", "app maker", "create app from website",
    "shopify to app", "wordpress to app", "wix to app",
    "המרת אתר לאפליקציה", "בניית אפליקציה מאתר", "הפיכת אתר לאפליקציה", "ווב לאפ"
  ],
  authors: [{ name: "Web2App Team" }],
  creator: "Web2App Builder",
  publisher: "Web2App Builder",
  manifest: "/manifest.webmanifest",
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
    description: "Turn any website into a premium native Android & iOS mobile app in seconds.",
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
        
        {/* --- STATIC SPLASH SCREEN --- */}
        {/* This renders INSTANTLY with the HTML, preventing white flash */}
        <div id="static-splash">
           <div className="relative flex flex-col items-center gap-6 animate-in zoom-in-95 duration-700">
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/20 border border-white/5">
                 <img
                   src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png"
                   alt="Logo"
                   className="h-full w-full object-cover"
                 />
              </div>
              <div className="flex flex-col items-center gap-1">
                 <h1 className="text-2xl font-black text-white tracking-tight">Web2App</h1>
                 <div className="h-1 w-8 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
           </div>
        </div>

        {/* Logic to hide the splash once React is ready */}
        <PWASplash />

        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
