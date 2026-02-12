
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ArrowRight, BookOpen, Code, Layers, Zap, Smartphone, ChevronRight, Globe, CheckCircle, AlertTriangle, Search, Wifi } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  content: React.ReactNode;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'lovable-to-app',
    title: 'How to Turn a Lovable Project into a Native App',
    excerpt: 'A comprehensive guide to converting your Lovable.dev project into a fully functional native iOS and Android app in minutes.',
    category: 'Guides',
    readTime: '4 min read',
    image: 'https://letsai.co.il/wp-content/uploads/2025/02/11111.jpg',
    content: (
      <div className="space-y-6 text-left">
        <p className="text-lg text-zinc-300 leading-relaxed">
          No-code platforms like Lovable have revolutionized web development. But how do you take that amazing result and put it on the App Store or Google Play? This guide will sort it out for you.
        </p>
        
        <h3 className="text-2xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Exporting from Lovable
        </h3>
        <p className="text-zinc-400">
          Once you've finished designing and developing your product in Lovable, hit the Publish or Export button. Ensure your site is responsive and looks great in Mobile View.
        </p>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Get the Public URL
        </h3>
        <p className="text-zinc-400">
          The easiest way is to use the deployment URL provided by Lovable (e.g., project.lovable.app). If you've connected a custom domain, use that. Copy the full address.
        </p>

        <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-xl my-6">
          <p className="text-sm text-emerald-400 font-bold mb-1">Pro Tip:</p>
          <p className="text-sm text-zinc-400">
            Check your browser console for errors before converting. What works on the web will work inside the app, but bugs will carry over too.
          </p>
        </div>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <span className="bg-emerald-500/10 text-emerald-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Convert with Web2App
        </h3>
        <p className="text-zinc-400">
          Go to the Web2App Builder main page, paste your Lovable project link. Our system will automatically detect the icon, colors, and settings. Click "Build" and get an APK ready for installation within minutes.
        </p>
      </div>
    )
  },
  {
    id: 'base64-app',
    title: 'Optimizing Apps with Base64 Assets',
    excerpt: 'Advanced technique for embedding digital assets and static files directly inside your application package for offline speed.',
    category: 'Technical',
    readTime: '6 min read',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGQSXhWVre5XCOISq93ohBogTgR4obUsDZuA&s',
    content: (
      <div className="space-y-6 text-left">
        <p className="text-lg text-zinc-300 leading-relaxed">
          Sometimes we want our app to work extremely fast, without relying on an external server for every image or script. Using Base64 encoding allows us to "package" this content directly into the code.
        </p>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 1: Encode Your Image</h3>
        <p className="text-zinc-400">
          Base64 is a method for representing binary data (like images) as an ASCII text string. You can use online tools like "Base64 Image Encoder" to upload your file and get a string.
        </p>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 2: Embed in HTML</h3>
        <p className="text-zinc-400">
          Instead of linking to an external file (e.g., <code>src="image.jpg"</code>), paste the string directly into the source.
        </p>

        <pre className="bg-black border border-zinc-800 p-4 rounded-lg overflow-x-auto text-xs font-mono text-emerald-400 my-4 text-left">
&lt;img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE..." /&gt;
        </pre>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">Why use it in Web2App?</h3>
        <ul className="list-disc list-inside space-y-2 text-zinc-400">
          <li><strong className="text-white">Performance:</strong> Zero HTTP requests. The image loads instantly with the HTML.</li>
          <li><strong className="text-white">Offline Mode:</strong> Content is available without internet because it's part of the text.</li>
          <li><strong className="text-white">Stability:</strong> No "broken image" icons if your server goes down.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'pwa-guide',
    title: 'How to Build a PWA (Progressive Web App)',
    excerpt: 'Turn your website into an installable PWA before wrapping it. Learn about manifests, service workers, and offline capabilities.',
    category: 'Development',
    readTime: '8 min read',
    image: 'https://web.dev/static/explore/progressive-web-apps/cover.png',
    content: (
      <div className="space-y-6 text-left">
        <p className="text-lg text-zinc-300 leading-relaxed">
          A Progressive Web App (PWA) is a website that looks and behaves like a mobile app. It is the perfect first step before converting to a native Android/iOS app.
        </p>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">1. The Manifest File</h3>
        <p className="text-zinc-400">
          Create a file named <code>manifest.json</code> in your root directory. This file tells the browser about your app's name, icons, and colors.
        </p>
        <pre className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg overflow-x-auto text-xs font-mono text-zinc-300 my-4">
{`{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}`}
        </pre>
        <p className="text-zinc-400 text-sm">Link it in your HTML head: <code>&lt;link rel="manifest" href="/manifest.json"&gt;</code></p>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">2. The Service Worker</h3>
        <p className="text-zinc-400">
          This is a JavaScript file that runs in the background. It allows your site to work offline and load faster.
        </p>
        <pre className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg overflow-x-auto text-xs font-mono text-zinc-300 my-4">
{`// Register in your main JS file
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}`}
        </pre>

        <div className="bg-emerald-900/20 border border-emerald-900/50 p-4 rounded-xl my-6">
          <p className="text-sm text-emerald-400 font-bold mb-1">Benefit:</p>
          <p className="text-sm text-zinc-400">
            Web2App Builder detects these PWA features and automatically uses them to enhance the native app experience, ensuring your icons and offline logic carry over.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'seo-mastery',
    title: 'Building the Perfect SEO Website',
    excerpt: 'Before you convert to an app, ensure your web foundation is solid. A guide to meta tags, semantic HTML, and performance for maximum visibility.',
    category: 'Marketing',
    readTime: '6 min read',
    image: 'https://www.forecom-solutions.com/hubfs/What-is-SEO-and-how-it-can-help-your-business.png',
    content: (
      <div className="space-y-6 text-left">
        <p className="text-lg text-zinc-300 leading-relaxed">
          Search Engine Optimization (SEO) isn't just for Google; it structure helps your App Store listing and social sharing too.
        </p>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">1. Critical Meta Tags</h3>
        <p className="text-zinc-400">
          Every page must have a unique Title and Description. These are used by search engines and by Web2App to name your app automatically.
        </p>
        <pre className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg overflow-x-auto text-xs font-mono text-zinc-300 my-4">
{`<title>Best Coffee Shop in Tel Aviv | MyCafe</title>
<meta name="description" content="Artisan coffee delivered to your door. Order via our new app." />`}
        </pre>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">2. Open Graph (Social Sharing)</h3>
        <p className="text-zinc-400">
          When users share your app link on WhatsApp or Facebook, these tags determine how it looks.
        </p>
        <pre className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg overflow-x-auto text-xs font-mono text-zinc-300 my-4">
{`<meta property="og:image" content="https://mysite.com/banner.jpg" />
<meta property="og:title" content="Download MyCafe App" />`}
        </pre>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">3. Performance & Speed</h3>
        <p className="text-zinc-400">
          Google ranks fast sites higher. Use "Lighthouse" in Chrome DevTools to audit your site. Compress images (WebP format), minify CSS/JS, and use a CDN. A fast website = a fast native app.
        </p>
      </div>
    )
  },
  {
    id: 'pwa-vs-native',
    title: 'Why Convert a Website to Native App?',
    excerpt: 'The critical differences between PWAs and Native Apps and how it impacts your brand authority and user retention.',
    category: 'Strategy',
    readTime: '3 min read',
    image: 'https://www.detroitlabs.com/wp-content/uploads/2022/03/detroit-labs-native-vs-web-app-whats-the-difference.png',
    content: (
      <div className="space-y-6 text-left">
        <p className="text-lg text-zinc-300 leading-relaxed">
          You have a mobile-responsive website, so why do you need an app? This is a question we hear often. The answer lies in user experience and trust.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
           <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
              <h4 className="font-bold text-emerald-400 mb-2">Push Notifications</h4>
              <p className="text-sm text-zinc-400">The ability to bring users back to the app with a single click is the greatest asset of native apps. Websites require the browser to be open.</p>
           </div>
           <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
              <h4 className="font-bold text-emerald-400 mb-2">Home Screen Presence</h4>
              <p className="text-sm text-zinc-400">A permanent icon on the customer's screen is worth thousands of brand impressions daily.</p>
           </div>
        </div>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">The App Store Trust Effect</h3>
        <p className="text-zinc-400">
          Users trust businesses that have an official app in the Apple and Google stores more. It conveys seriousness, stability, and professionalism that a regular website sometimes struggles to convey.
        </p>
      </div>
    )
  },
  {
    id: 'app-store-approval',
    title: 'Secrets to App Store Approval',
    excerpt: 'Avoid rejection by Apple and Google. Learn about the "Minimum Functionality" rule and how to pass the review process.',
    category: 'Compliance',
    readTime: '5 min read',
    image: 'https://developer.apple.com/news/images/og/asc-og-twitter.png',
    content: (
      <div className="space-y-6 text-left">
        <p className="text-lg text-zinc-300 leading-relaxed">
          Apple's Guideline 4.2 states that "Your app should include features, content, and UI that elevate it beyond a repackaged website." Here is how to ensure your Web2App passes review.
        </p>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">1. Use Native Features</h3>
        <p className="text-zinc-400">
          Don't just show a static page. Implement our Native Navigation bar, use Push Notifications, and integrate Haptic Feedback. This shows reviewers that your app utilizes device capabilities.
        </p>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">2. Avoid Dead Links</h3>
        <p className="text-zinc-400">
          Ensure all links in your menu work. If you have a "Sign Up" button that leads to a 404 page, you will be rejected immediately.
        </p>

         <div className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl my-6 flex gap-3">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <div>
            <p className="text-sm text-amber-500 font-bold mb-1">Important:</p>
            <p className="text-sm text-zinc-400">
              Provide a demo account to Apple/Google reviewers if your app requires login. They will not create an account themselves.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'push-notifications-strategy',
    title: 'Push Notification Strategies',
    excerpt: 'How to increase user retention by 300% using smart, targeted push notifications without annoying your users.',
    category: 'Marketing',
    readTime: '4 min read',
    image: 'https://www.appsflyer.com/wp-content/uploads/2022/11/push-notifications-benefits-1.jpg',
    content: (
      <div className="space-y-6 text-left">
        <p className="text-lg text-zinc-300 leading-relaxed">
          Push notifications are a double-edged sword. Used correctly, they drive massive engagement. Used poorly, they cause uninstalls.
        </p>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">The 3 Rules of Push</h3>
        <ul className="space-y-4">
            <li className="flex gap-3">
                <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                <div>
                    <strong className="text-white block">Timeliness</strong>
                    <span className="text-zinc-400 text-sm">Send messages when they are relevant. "Your order has shipped" beats "Check out our store" every time.</span>
                </div>
            </li>
            <li className="flex gap-3">
                <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                <div>
                    <strong className="text-white block">Personalization</strong>
                    <span className="text-zinc-400 text-sm">Use the user's name or reference their past behavior. Generic blasts get ignored.</span>
                </div>
            </li>
            <li className="flex gap-3">
                <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                <div>
                    <strong className="text-white block">Value</strong>
                    <span className="text-zinc-400 text-sm">Every notification must offer value. A discount, a critical update, or entertaining content.</span>
                </div>
            </li>
        </ul>
      </div>
    )
  },
  {
    id: 'offline-mode',
    title: 'Building for Offline First',
    excerpt: 'Make your app work even in subways or airplanes. A guide to Service Workers and local caching strategies.',
    category: 'Development',
    readTime: '7 min read',
    image: 'https://www.eukhost.com/blog/wp-content/uploads/2023/03/5-Ways-to-Stop-Your-Website-Going-Offline-SOCIAL-1.png',
    content: (
      <div className="space-y-6 text-left">
        <p className="text-lg text-zinc-300 leading-relaxed">
          Native apps are expected to work (at least partially) without an internet connection. Web2App supports this via standard web technologies.
        </p>
        
        <h3 className="text-2xl font-bold text-white mt-8 mb-4">Service Workers</h3>
        <p className="text-zinc-400">
          A Service Worker is a script that runs in the background. It can intercept network requests and serve cached files when the network is down.
        </p>

        <pre className="bg-black border border-zinc-800 p-4 rounded-lg overflow-x-auto text-xs font-mono text-zinc-300 my-4">
{`self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});`}
        </pre>

        <p className="text-zinc-400">
          By adding this simple logic to your website before converting it with Web2App, your app will instantly load previously visited pages even when the user is offline.
        </p>
      </div>
    )
  }
];

export const BlogSection = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPost(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedPost]);

  return (
    <section className="py-24 bg-zinc-950 border-t border-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono font-bold tracking-wider">
              <BookOpen size={14} /> Knowledge Base
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white text-balance">
              Guides & Articles
            </h2>
            <p className="text-zinc-400 max-w-xl text-lg">
              Everything you need to know to turn your website into a winning app.
            </p>
          </div>
          
          <button className="hidden md:flex items-center gap-2 text-sm font-bold text-white hover:text-emerald-400 transition-colors group">
            See all articles <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BLOG_POSTS.map((post) => (
            <article 
              key={post.id} 
              onClick={() => setSelectedPost(post)}
              className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:bg-zinc-900 transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <Image 
                  src={post.image} 
                  alt={post.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                  {post.category}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col items-start text-left">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2 font-mono">
                  <span>{post.readTime}</span>
                  <span>•</span>
                  <span>May 2024</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors leading-tight line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-zinc-400 text-xs leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-4 border-t border-zinc-800 w-full flex justify-end">
                  <span className="text-xs font-bold text-white flex items-center gap-2 group-hover:gap-3 transition-all">
                    Read More <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal / Popup */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => setSelectedPost(null)}
          ></div>

          {/* Content Container */}
          <div className="relative bg-[#09090b] border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
            
            {/* Modal Header (Sticky) */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20">
               <div className="flex flex-col items-start">
                 <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">{selectedPost.category}</span>
                 <span className="text-xs text-zinc-500">{selectedPost.readTime}</span>
              </div>
               <button 
                onClick={() => setSelectedPost(null)}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
               {/* Hero Image */}
               <div className="relative h-64 sm:h-80 w-full">
                  <Image 
                    src={selectedPost.image} 
                    alt={selectedPost.title} 
                    fill 
                    className="object-cover"
                    priority
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-left">
                    <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                      {selectedPost.title}
                    </h1>
                  </div>
               </div>

               {/* Article Content */}
               <div className="p-6 sm:p-10 max-w-3xl mx-auto pb-20">
                  {selectedPost.content}
               </div>
            </div>

            {/* Footer gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none z-10"></div>
          </div>
        </div>
      )}
    </section>
  );
};
