
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Lock, Eye, FileText, Globe, Database, Cookie, Server } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col">
      {/* Background - Pure Black */}
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer group" onClick={() => router.push('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <img 
                src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" 
                alt="Logo" 
                className="relative h-9 w-9 rounded-lg transition-all duration-300"
              />
            </div>
            <span className="text-white">Web2App</span>
          </div>
          <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 gap-2" onClick={() => router.back()}>
            <ArrowLeft size={16} /> Back
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 pt-32 pb-20 px-6 flex-1">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-16 border-b border-zinc-900 pb-8">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">Privacy Policy</h1>
            <p className="text-lg text-zinc-500">Effective Date: May 20, 2024</p>
          </div>

          <div className="space-y-16">
            {/* Section 1 */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-white mb-4">
                <div className="p-3 bg-zinc-900 rounded-xl text-emerald-400 border border-zinc-800"><Shield size={28} /></div>
                <h2 className="text-3xl font-bold tracking-tight">1. Introduction</h2>
              </div>
              <div className="pl-0 md:pl-16 space-y-4 text-zinc-400 text-lg leading-relaxed font-light">
                <p>
                  Web2App Builder ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Web2App Builder.
                </p>
                <p>
                  This Privacy Policy applies to our website, and its associated subdomains (collectively, our "Service") alongside our application, Web2App Builder. By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy and our Terms of Service.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-white mb-4">
                <div className="p-3 bg-zinc-900 rounded-xl text-blue-400 border border-zinc-800"><Database size={28} /></div>
                <h2 className="text-3xl font-bold tracking-tight">2. Information We Collect</h2>
              </div>
              <div className="pl-0 md:pl-16 space-y-6 text-zinc-400 text-lg leading-relaxed font-light">
                 <p>We collect information to provide better services to all our users. The types of information we collect include:</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                       <h3 className="text-white font-bold mb-2">Personal Data</h3>
                       <p className="text-sm">Name, email address, and contact data provided during registration.</p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                       <h3 className="text-white font-bold mb-2">App Data</h3>
                       <p className="text-sm">Website URLs, app names, icons, and configuration settings used to generate your mobile applications.</p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                       <h3 className="text-white font-bold mb-2">Usage Data</h3>
                       <p className="text-sm">Information on how the Service is accessed and used (e.g., page views, build duration, error logs).</p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                       <h3 className="text-white font-bold mb-2">Cookies</h3>
                       <p className="text-sm">We use cookies and similar tracking technologies to track the activity on our Service.</p>
                    </div>
                 </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-white mb-4">
                <div className="p-3 bg-zinc-900 rounded-xl text-purple-400 border border-zinc-800"><Globe size={28} /></div>
                <h2 className="text-3xl font-bold tracking-tight">3. How We Use Your Data</h2>
              </div>
              <div className="pl-0 md:pl-16 space-y-4 text-zinc-400 text-lg leading-relaxed font-light">
                <p>
                  We use the collected data for various purposes:
                </p>
                <ul className="list-disc pl-6 space-y-3 marker:text-emerald-500">
                  <li>To provide and maintain our Service.</li>
                  <li>To notify you about changes to our Service.</li>
                  <li>To allow you to participate in interactive features of our Service when you choose to do so.</li>
                  <li>To provide customer support.</li>
                  <li>To gather analysis or valuable information so that we can improve our Service.</li>
                  <li>To monitor the usage of our Service.</li>
                  <li>To detect, prevent and address technical issues.</li>
                  <li>To generate your mobile application binary files (APK, AAB, IPA).</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-white mb-4">
                <div className="p-3 bg-zinc-900 rounded-xl text-amber-400 border border-zinc-800"><Lock size={28} /></div>
                <h2 className="text-3xl font-bold tracking-tight">4. Data Security</h2>
              </div>
              <div className="pl-0 md:pl-16 space-y-4 text-zinc-400 text-lg leading-relaxed font-light">
                <p>
                  The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                </p>
                <p>
                  We utilize industry-standard encryption protocols (SSL/TLS) for data transmission. Your generated app source code and binaries are stored securely on cloud providers (Supabase Storage & GitHub Actions artifacts) with strict access controls.
                </p>
              </div>
            </section>

             {/* Section 5 */}
             <section className="space-y-6">
              <div className="flex items-center gap-4 text-white mb-4">
                <div className="p-3 bg-zinc-900 rounded-xl text-rose-400 border border-zinc-800"><Cookie size={28} /></div>
                <h2 className="text-3xl font-bold tracking-tight">5. Third-Party Services</h2>
              </div>
              <div className="pl-0 md:pl-16 space-y-4 text-zinc-400 text-lg leading-relaxed font-light">
                <p>
                  We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.
                </p>
                <p>
                  These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                </p>
                <div className="mt-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-sm font-mono text-zinc-300">
                   Examples: Supabase (Database/Auth), GitHub (Build Infrastructure), Stripe (Payments).
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-6 border-t border-zinc-900 pt-8">
              <h2 className="text-2xl font-bold text-white">Contact Us</h2>
              <p className="text-zinc-400 text-lg font-light">
                If you have questions about this Privacy Policy, please contact us via our <a href="/contact" className="text-emerald-400 hover:underline">Contact page</a> or email us at privacy@web2app-builder.com.
              </p>
            </section>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 px-6 bg-black mt-auto relative z-10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
               <div className="h-6 w-6 relative">
                  <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" alt="Logo" className="h-full w-full object-contain rounded-md" />
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
