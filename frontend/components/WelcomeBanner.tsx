'use client';

import { Crown, TrendingUp } from 'lucide-react';

export function WelcomeBanner() {
  return (
    <div className="w-full">
      {/* Main Banner - Glassmorphism style matching the page */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8">
        {/* Animated background glows - matching page style */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Icon/Logo area - matching header style */}
          <div className="mb-4 relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            {/* <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0f] animate-pulse" /> */}
          </div>
          
          {/* Welcome text */}
          <p className="text-sm sm:text-base text-gray-400 font-medium mb-1">
            Welcome to
          </p>
          
          {/* Main title - gradient text like the page headers */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">King </span>
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Company</span>
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">.com</span>
          </h1>
          
          {/* Tagline */}
          <p className="text-green-400 text-sm sm:text-base font-medium">
            Ab Jeetna Pakka Hai
          </p>
          
          {/* Decorative line */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-violet-500/50" />
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-violet-500/50" />
          </div>
        </div>
      </div>
      
      {/* Hindi Tagline Section - matching card style */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 text-center">
        <p className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
          जो खेलता है, वो सीखता है
        </p>
        <p className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
          जो जीतता है, वही दिखता है
        </p>
      </div>
    </div>
  );
}
