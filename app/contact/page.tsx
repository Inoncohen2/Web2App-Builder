
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Send, LoaderCircle, CircleCheck, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export default function ContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // SEO Schema for Contact Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "name": "Contact Web2App Builder",
        "description": "Get in touch with the Web2App Builder team for support, questions, or enterprise inquiries.",
        "url": "https://web2app-builder.vercel.app/contact"
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
            "name": "Contact",
            "item": "https://web2app-builder.vercel.app/contact"
          }
        ]
      }
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left: Info */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 w-fit mb-6">
               <MessageSquare size={14} className="text-emerald-500" />
               <span className="text-xs font-medium text-zinc-300">24/7 Support</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">Get in touch</h1>
            <p className="text-lg text-zinc-400 mb-12 leading-relaxed font-light max-w-lg">
              Have questions about building your app? Need help with App Store publication? Our team of developers is here to assist you every step of the way.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-black/50">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Email Us</h3>
                  <p className="text-zinc-400">support@web2app-builder.com</p>
                  <p className="text-xs text-zinc-600 mt-1 font-mono">Avg. response: 2h</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-black/50">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">HQ</h3>
                  <p className="text-zinc-400">Tel Aviv, Israel</p>
                  <p className="text-xs text-zinc-600 mt-1 font-mono">Global remote team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="relative">
             {/* Glow Effect */}
             <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-50"></div>
             
             <div className="bg-[#0A0A0A] border border-zinc-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                
                {isSent ? (
                  <div className="h-full min-h-[440px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                    <div className="h-24 w-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <CircleCheck size={48} />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3">Message Sent!</h3>
                    <p className="text-zinc-400 mb-8 max-w-xs mx-auto leading-relaxed">
                      Thank you for reaching out. We will get back to you shortly at your provided email address.
                    </p>
                    <Button 
                      onClick={() => setIsSent(false)}
                      className="bg-zinc-100 hover:bg-white text-black font-bold h-12 px-8 rounded-xl"
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2">Send us a message</h2>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-zinc-500 text-xs font-bold uppercase tracking-wider">First Name</Label>
                        <Input 
                          placeholder="John" 
                          className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 h-12 rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Last Name</Label>
                        <Input 
                          placeholder="Doe" 
                          className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 h-12 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Email Address</Label>
                      <Input 
                        type="email"
                        placeholder="john@example.com" 
                        className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 h-12 rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Message</Label>
                      <textarea 
                        placeholder="How can we help you?"
                        className="flex w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[140px] resize-none"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-14 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] mt-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <><LoaderCircle className="animate-spin mr-2" size={20} /> Sending...</>
                      ) : (
                        <><Send className="mr-2" size={20} /> Send Message</>
                      )}
                    </Button>
                  </form>
                )}
             </div>
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
