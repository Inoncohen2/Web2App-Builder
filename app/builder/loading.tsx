
import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-[#F6F8FA] overflow-hidden flex flex-col sm:flex-row">
      {/* Sidebar Skeleton - Matches BuilderClient Sidebar Exactly */}
      <div className="hidden sm:flex flex-col w-[400px] lg:w-[40%] h-full bg-white/80 backdrop-blur-2xl border-r border-white/50 z-30 shrink-0">
        
        {/* Header (h-20) */}
        <div className="h-20 shrink-0 flex items-center justify-between px-6 border-b border-gray-100/50">
           {/* Logo Area */}
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-1.5">
                 <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse"></div>
                 <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
           </div>
           
           {/* User Menu Area - Exact Match to Navbar Skeleton */}
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-gray-200">
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse hidden md:block"></div>
                  <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
           </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 p-6 space-y-8 overflow-hidden">
           {/* Identity Section Skeleton */}
           <div className="flex flex-col items-center gap-4">
              <div className="h-32 w-32 bg-gray-200 rounded-[2rem] animate-pulse"></div>
              <div className="h-12 w-full bg-gray-200 rounded-md animate-pulse"></div>
           </div>

           {/* Color Picker Skeleton */}
           <div className="space-y-3">
             <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
             <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
             </div>
           </div>
           
           {/* Inputs Skeleton */}
           <div className="space-y-6">
              <div className="h-16 w-full bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-16 w-full bg-gray-200 rounded-xl animate-pulse"></div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100/50">
           <div className="h-12 w-full bg-gray-900 rounded-xl animate-pulse opacity-10"></div>
        </div>
      </div>

      {/* Main Preview Skeleton */}
      <div className="flex-1 flex items-center justify-center relative bg-[#F6F8FA]">
         <div className="h-[700px] w-[350px] bg-white rounded-[3rem] animate-pulse shadow-xl border border-gray-200"></div>
      </div>
    </div>
  );
}
