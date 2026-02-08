
import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Web2App Builder",
  description: "A SaaS dashboard to convert websites into native mobile apps with real-time preview.",
  manifest: "/manifest.json",
  icons: {
    icon: "https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576930/favicon_d9gf02.ico",
    apple: "https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png",
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
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
