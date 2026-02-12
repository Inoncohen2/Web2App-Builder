
import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-[100dvh] w-full bg-[#F6F8FA] overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="hidden sm:flex flex-col w-[400px] lg:w-[40%] h-full bg-white border-r border-gray-200 p-6 space-y-8">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
           <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
           </div>
        </div>
        <div className="space-y-6">
           <div className="h-32 w-32 bg-gray-100 rounded-2xl animate-pulse mx-auto"></div>
           <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse"></div>
           <div className="grid grid-cols-5 gap-2">
              {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-10 w-10 rounded-full bg-gray-100 animate-pulse"></div>
              ))}
           </div>
           <div className="h-40 w-full bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
      {/* Main Preview Skeleton */}
      <div className="flex-1 flex items-center justify-center p-10 bg-[#F6F8FA] relative">
         <div className="h-[700px] w-[350px] bg-gray-200 rounded-[3rem] animate-pulse shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer"></div>
         </div>
      </div>
    </div>
  );
}
