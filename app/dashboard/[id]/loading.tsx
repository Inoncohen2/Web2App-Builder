
import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 w-full bg-[#F6F8FA] flex flex-col items-center">
      {/* Header Skeleton */}
      <div className="w-full h-20 bg-white border-b border-gray-200 shrink-0 flex items-center justify-between px-6">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
         </div>
         <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      {/* Content Skeleton */}
      <div className="w-full max-w-3xl mt-8 px-6 space-y-6">
         <div className="text-center space-y-2 mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded mx-auto animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
         </div>

         {/* Build Cards Skeleton */}
         <div className="space-y-4">
            <div className="h-24 w-full bg-white rounded-xl border border-gray-200 animate-pulse"></div>
            <div className="h-24 w-full bg-white rounded-xl border border-gray-200 animate-pulse"></div>
            <div className="h-48 w-full bg-white rounded-xl border border-gray-200 animate-pulse"></div>
         </div>
      </div>
      
      {/* Center Spinner */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <LoaderCircle className="animate-spin text-emerald-500/20" size={48} />
      </div>
    </div>
  );
}
