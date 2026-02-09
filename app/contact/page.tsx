
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export default function ContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

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
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left: Info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Get in touch</h1>
            <p className="text-lg text-zinc-400 mb-10 leading-relaxed font-light">
              Have questions about building your app? Need help with App Store publication? Our team of developers is here to assist you every step of the way.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Email Us</h3>
                  <p className="text-zinc-400">support@web2app-builder.com</p>
                  <p className="text-xs text-zinc-500 mt-1">Typical response time: 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">HQ</h3>
                  <p className="text-zinc-400">Tel Aviv, Israel</p>
                  <p className="text-xs text-zinc-500 mt-1">Global remote team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
             
             {isSent ? (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in">
                 <div className="h-20 w-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                   <CheckCircle2 size={40} />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                 <p className="text-zinc-400 mb-8 max-w-xs mx-auto">
                   Thank you for reaching out. We will get back to you shortly at your provided email address.
                 </p>
                 <Button 
                   onClick={() => setIsSent(false)}
                   className="bg-white hover:bg-zinc-200 text-black border-0"
                 >
                   Send another message
                 </Button>
               </div>
             ) : (
               <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <Label className="text-zinc-400 font-medium">First Name</Label>
                     <Input 
                       placeholder="John" 
                       className="bg-zinc-950/50 border-zinc-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-12"
                       required
                     />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-zinc-400 font-medium">Last Name</Label>
                     <Input 
                       placeholder="Doe" 
                       className="bg-zinc-950/50 border-zinc-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-12"
                       required
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <Label className="text-zinc-400 font-medium">Email Address</Label>
                   <Input 
                     type="email"
                     placeholder="john@example.com" 
                     className="bg-zinc-950/50 border-zinc-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-12"
                     required
                   />
                 </div>

                 <div className="space-y-2">
                   <Label className="text-zinc-400 font-medium">Message</Label>
                   <textarea 
                     placeholder="How can we help you?"
                     className="flex w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-3 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                     required
                   />
                 </div>

                 <Button 
                   type="submit" 
                   disabled={isSubmitting}
                   className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl shadow-lg shadow-white/5"
                 >
                   {isSubmitting ? (
                     <><Loader2 className="animate-spin mr-2" size={18} /> Sending...</>
                   ) : (
                     <><Send className="mr-2" size={18} /> Send Message</>
                   )}
                 </Button>
               </form>
             )}
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
