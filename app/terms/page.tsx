
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Gavel, AlertTriangle, CheckSquare, Server } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col">
      {/* Dynamic Background - Dots Fading from Bottom to Top */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_1px)] [background-size:32px_32px] opacity-40 [mask-image:linear-gradient(to_bottom,transparent_0%,black_100%)]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
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
        <div className="max-w-3xl mx-auto">
          
          <div className="mb-12 border-b border-zinc-800 pb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Terms of Service</h1>
            <p className="text-lg text-zinc-400">Last updated: May 20, 2024</p>
          </div>

          <div className="space-y-12">
            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="p-2 bg-zinc-900 rounded-lg text-indigo-400 border border-zinc-800"><Gavel size={24} /></div>
                <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
              </div>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Web2App Builder ("we," "us," or "our"), concerning your access to and use of the Web2App Builder website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
              </p>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Use. If you do not agree with all of these terms of use, then you are expressly prohibited from using the Site and you must discontinue use immediately.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="p-2 bg-zinc-900 rounded-lg text-blue-400 border border-zinc-800"><CheckSquare size={24} /></div>
                <h2 className="text-2xl font-bold">2. User Representations</h2>
              </div>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                By using the Site, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-blue-500 text-zinc-400">
                <li>You have the legal right to convert the website URL provided into a mobile application.</li>
                <li>You are the owner of the content or have express permission from the owner.</li>
                <li>The website does not contain illegal, offensive, or prohibited content.</li>
                <li>You will not use the Site for any illegal or unauthorized purpose.</li>
                <li>Your use of the Site will not violate any applicable law or regulation.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="p-2 bg-zinc-900 rounded-lg text-amber-400 border border-zinc-800"><AlertTriangle size={24} /></div>
                <h2 className="text-2xl font-bold">3. App Store Approvals</h2>
              </div>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                We provide the tools to convert your website into a mobile application format (APK/AAB/IPA). However, <strong>we do not guarantee</strong> that your application will be approved by the Apple App Store or Google Play Store.
              </p>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                Approval is subject to the specific guidelines of each platform (e.g., Apple's App Store Review Guidelines Section 4.2 regarding "Minimum Functionality"). Rejection by an app store is not grounds for a refund, as the service of code generation has been performed.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="p-2 bg-zinc-900 rounded-lg text-rose-400 border border-zinc-800"><Server size={24} /></div>
                <h2 className="text-2xl font-bold">4. Intellectual Property Rights</h2>
              </div>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") are owned or controlled by us or licensed to us.
              </p>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                However, you retain full ownership of the intellectual property rights regarding the specific content of your generated mobile application and the website it displays.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">5. Limitation of Liability</h2>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site.
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
