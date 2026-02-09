
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function PrivacyPage() {
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
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Privacy Policy</h1>
            <p className="text-lg text-zinc-400">Last updated: May 20, 2024</p>
          </div>

          <div className="space-y-12">
            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="p-2 bg-zinc-900 rounded-lg text-emerald-400 border border-zinc-800"><Shield size={24} /></div>
                <h2 className="text-2xl font-bold">1. Introduction</h2>
              </div>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                Welcome to Web2App Builder ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
              </p>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                When you visit our website and use our services, you trust us with your personal information. We take your privacy very seriously. In this privacy policy, we describe our privacy policy. We seek to explain to you in the clearest way possible what information we collect, how we use it, and what rights you have in relation to it.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="p-2 bg-zinc-900 rounded-lg text-blue-400 border border-zinc-800"><Eye size={24} /></div>
                <h2 className="text-2xl font-bold">2. Information We Collect</h2>
              </div>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                We collect personal information that you voluntarily provide to us when registering at the Services expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us.
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-emerald-500 text-zinc-400">
                <li><strong>Personal Data:</strong> Name, email address, and contact data.</li>
                <li><strong>App Data:</strong> Website URLs, app names, icons, and configuration settings used to generate your mobile applications.</li>
                <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument. All payment data is stored by our payment processor.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="p-2 bg-zinc-900 rounded-lg text-purple-400 border border-zinc-800"><FileText size={24} /></div>
                <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
              </div>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>
              <ul className="list-disc pl-6 space-y-2 marker:text-purple-500 text-zinc-400">
                <li>To facilitate account creation and logon process.</li>
                <li>To generate and deliver the mobile application packages (APK/IPA).</li>
                <li>To send administrative information to you.</li>
                <li>To protect our Services.</li>
                <li>To enforce our terms, conditions, and policies.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white mb-2">
                <div className="p-2 bg-zinc-900 rounded-lg text-amber-400 border border-zinc-800"><Lock size={24} /></div>
                <h2 className="text-2xl font-bold">4. Data Storage & Security</h2>
              </div>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the services within a secure environment.
              </p>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                Your generated app source code and binaries are stored securely on cloud providers (Supabase & GitHub Actions artifacts) and are accessible only to you and our automated build systems.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white">5. Contact Us</h2>
              <p className="leading-relaxed text-zinc-400 text-lg font-light">
                If you have questions or comments about this policy, you may email us via our Contact page.
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
