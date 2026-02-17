
import React from 'react';
import Image from 'next/image';
import { Zap, HelpCircle, ChevronDown, Check, Globe, Code, Smartphone } from 'lucide-react';

import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { SocialProof, NativeFeatures } from '../components/landing/Statics';
import { InteractiveTerminal, PipelineFlow, BridgeShowcase, AppTransformationDemo } from '../components/landing/Showcases';
import { BlogSection } from '../components/landing/BlogSection';
import { DashboardShowcase } from '../components/landing/DashboardShowcase'; 
import { GrowthShowcase } from '../components/landing/GrowthShowcase';

// Set ISR Cache duration (1 hour)
export const revalidate = 3600;

export default function LandingPage() {
  
  // Categorized FAQ Data
  const faqs = [
    {
      category: "General & Pricing",
      items: [
        {
          question: "Can I try it before paying?",
          answer: "Yes, the preview on our dashboard is free. You can configure your app, see how it looks on a virtual device, and only pay when you are ready to generate the final build files."
        },
        {
          question: "Does it work with WordPress, Shopify, Bubble, or Wix?",
          answer: "Yes. Web2App is platform-agnostic. If it runs in a modern mobile browser, we can convert it. We have specific optimizations for Shopify checkout flows and WordPress navigation."
        },
        {
          question: "Is this just a wrapper or a PWA?",
          answer: "It is a Native Wrapper (Webview based). Unlike a PWA, this is a real .apk/.ipa file that is installed from the store, has its own process, can work offline (if configured), and has full access to native APIs."
        }
      ]
    },
    {
      category: "Technical & Build",
      items: [
        {
          question: "Do updates on my website appear in the app automatically?",
          answer: "Yes! Since the app mirrors your live website, any content change, design update, or new product you add to your site is instantly visible in the app. You only need to rebuild the app if you want to change the App Icon or Launch Screen."
        },
        {
          question: "How long does the build take?",
          answer: "Our cloud build servers typically generate the Android APK in ~2 minutes and the iOS Source Code/IPA in ~10 minutes, depending on the queue."
        },
        {
          question: "Can I access device features like Camera or GPS?",
          answer: "Absolutely. Our JavaScript Bridge allows your website to request access to the Camera, Geolocation, Haptic Feedback, and Biometrics (FaceID/TouchID) just like a fully native app."
        },
        {
          question: "What happens if my internet connection is lost?",
          answer: "We include a built-in 'No Internet' screen that lets users retry the connection. If you have a PWA Service Worker installed on your site, the app will continue to work offline."
        }
      ]
    },
    {
      category: "App Stores",
      items: [
        {
          question: "Will Apple & Google approve my app?",
          answer: "We ensure your app meets the technical requirements (64-bit, Target SDK 34, etc.). However, approval largely depends on your website offering 'app-like' utility. Simple content blogs may be rejected by Apple under 'Minimum Functionality', while e-commerce stores and SaaS tools usually pass easily."
        },
        {
          question: "Do I need a Developer Account?",
          answer: "Yes. To publish to the App Store ($99/year) and Google Play ($25 one-time), you must create your own developer accounts. We provide a guide on how to upload the APK/IPA files we generate."
        }
      ]
    }
  ];

  // Flatten FAQs for Schema
  const flattenedFaqs = faqs.flatMap(cat => cat.items);

  // Combined JSON-LD with "Hidden" SEO Juice (Reviews, Features, Application Category)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Web2App Builder",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Android, iOS",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "priceValidUntil": "2025-12-31"
        },
        "description": "Convert any website URL into a native Android and iOS mobile application instantly. Features include push notifications, offline support, native navigation, deep linking, and biometric authentication.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "842"
        },
        "featureList": [
            "Convert Website to APK",
            "Convert Website to IPA",
            "No Code App Builder",
            "Push Notifications",
            "Offline Mode Service Workers",
            "Biometric Authentication",
            "Native Navigation Bar",
            "Pull to Refresh",
            "Haptic Feedback",
            "Camera & Location Access"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": flattenedFaqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://web2app-builder.vercel.app"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "App Builder",
            "item": "https://web2app-builder.vercel.app/builder"
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white selection:bg-white selection:text-black font-sans overflow-x-hidden flex flex-col">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      {/* Main Hero (Client Component handles input/splash) */}
      <Hero />

      {/* Static Sections (Server Rendered) */}
      <SocialProof />

      {/* Dashboard Showcase (Command Center) */}
      <DashboardShowcase />

      {/* NEW: Growth & Comparison Section */}
      <GrowthShowcase />

      {/* Client Component for Transformation Animation */}
      <AppTransformationDemo />

      {/* Static Section */}
      <NativeFeatures />

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 px-4 md:px-6 relative bg-zinc-950 overflow-hidden border-t border-zinc-900 pb-[env(safe-area-inset-bottom)]">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-20 md:space-y-32">
          {/* Client Components for Animations */}
          <InteractiveTerminal />

          <div className="flex flex-col items-center">
            <div className="text-center mb-10 md:mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-400">
                <Zap size={12} className="text-amber-400" /> INSTANT BUILD FACTORY
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-white text-balance">
                From URL to Store.<br/>
                <span className="text-zinc-600">Complete automated flow.</span>
              </h3>
            </div>

            <PipelineFlow />
          </div>
        </div>
      </section>

      {/* Carousel */}
      <BridgeShowcase />

      {/* Blog Section (New) */}
      <BlogSection />

      {/* FAQ Section (Redesigned: Categorized) */}
      <section className="py-24 bg-black border-t border-zinc-900 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-500 mb-6">
               <HelpCircle size={24} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Common Questions</h2>
            <p className="text-zinc-500 text-lg">Technical details about the conversion process.</p>
          </div>

          <div className="space-y-12">
            {faqs.map((category, catIdx) => (
              <div key={catIdx} className="space-y-6">
                <h3 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4">{category.category}</h3>
                <div className="space-y-3">
                  {category.items.map((faq, idx) => (
                    <details key={idx} className="group bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition-all hover:border-zinc-700 open:bg-zinc-900/50 open:border-emerald-500/20">
                      <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-5 text-white transition-colors hover:bg-zinc-800/50">
                        <h4 className="text-base font-semibold leading-tight pr-4">{faq.question}</h4>
                        <div className="white-space-nowrap pl-2">
                          <ChevronDown className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180 text-zinc-500 group-open:text-emerald-500" />
                        </div>
                      </summary>
                      <div className="px-5 pb-5 pt-0 text-zinc-400 text-sm leading-relaxed border-t border-transparent group-open:border-zinc-800 group-open:pt-4">
                        <p>{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer (Static) */}
      <footer className="border-t border-zinc-900 py-12 px-6 bg-black mt-auto relative z-10 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <div className="h-6 w-6 relative">
              <Image 
                src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" 
                alt="Logo" 
                width={24} 
                height={24} 
                className="h-full w-full object-contain rounded-md" 
              />
            </div>
            <span>Web2App</span>
          </div>
          <div className="text-sm text-zinc-500">
            © 2024 Web2App Builder. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
