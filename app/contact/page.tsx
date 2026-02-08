
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
    <div className="min-h-screen w-full bg-[#0B0F17] text-slate-300 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F17]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-white cursor-pointer" onClick={() => router.push('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur opacity-50 rounded-lg"></div>
              <img 
                src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" 
                alt="Logo" 
                className="relative h-8 w-8 rounded-lg"
              />
            </div>
            <span>Web2App</span>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10 gap-2" onClick={() => router.back()}>
            <ArrowLeft size={16} /> Back
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left: Info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in touch</h1>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
              Have questions about building your app? Need help with App Store publication? Our team of developers is here to assist you every step of the way.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Email Us</h3>
                  <p className="text-slate-400">support@web2app-builder.com</p>
                  <p className="text-xs text-slate-500 mt-1">Typical response time: 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">HQ</h3>
                  <p className="text-slate-400">Tel Aviv, Israel</p>
                  <p className="text-xs text-slate-500 mt-1">Global remote team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
             {/* Decor element */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] pointer-events-none"></div>

             {isSent ? (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in">
                 <div className="h-20 w-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6">
                   <CheckCircle2 size={40} />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                 <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                   Thank you for reaching out. We will get back to you shortly at your provided email address.
                 </p>
                 <Button 
                   onClick={() => setIsSent(false)}
                   className="bg-white/10 hover:bg-white/20 text-white border-0"
                 >
                   Send another message
                 </Button>
               </div>
             ) : (
               <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <Label className="text-slate-300">First Name</Label>
                     <Input 
                       placeholder="John" 
                       className="bg-[#0B0F17]/50 border-white/10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-12"
                       required
                     />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-slate-300">Last Name</Label>
                     <Input 
                       placeholder="Doe" 
                       className="bg-[#0B0F17]/50 border-white/10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-12"
                       required
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <Label className="text-slate-300">Email Address</Label>
                   <Input 
                     type="email"
                     placeholder="john@example.com" 
                     className="bg-[#0B0F17]/50 border-white/10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-12"
                     required
                   />
                 </div>

                 <div className="space-y-2">
                   <Label className="text-slate-300">Message</Label>
                   <textarea 
                     placeholder="How can we help you?"
                     className="flex w-full rounded-md border border-white/10 bg-[#0B0F17]/50 px-3 py-3 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                     required
                   />
                 </div>

                 <Button 
                   type="submit" 
                   disabled={isSubmitting}
                   className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
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
      <footer className="border-t border-white/10 py-12 px-6 bg-[#05080F]">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-slate-500">
               © 2024 Web2App Builder. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
               <a href="/privacy" className="hover:text-white">Privacy</a>
               <a href="/terms" className="hover:text-white">Terms</a>
               <a href="/contact" className="text-white">Contact</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
