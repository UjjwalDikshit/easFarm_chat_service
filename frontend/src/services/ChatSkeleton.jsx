import React from "react";

export default function ChatSkeleton() {
  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      
      {/* ================= SIDEBAR ================= */}
      <div className="w-1/4 border-r bg-white p-4 space-y-4">
        
        {/* Search bar */}
        <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>

        {/* Chat list */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100"
          >
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-2 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= CHAT AREA ================= */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* HEADER */}
        <div className="h-16 border-b flex items-center px-4 gap-3 bg-white">
          <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-2 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          
          {/* LEFT MESSAGE */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-3 w-40 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-3 w-56 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}

          {/* RIGHT MESSAGE */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-end">
              <div className="space-y-2">
                <div className="h-3 w-40 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-3 w-56 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT BOX */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="w-12 h-12 bg-gray-300 rounded-xl animate-pulse"></div>
          </div>
        </div>

      </div>
    </div>
  );
}