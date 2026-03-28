'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Game, Result } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BarChart3, GitGraph, Clock, Calendar } from 'lucide-react';

// Helper function to parse time string (handles both HH:MM:SS and datetime)
const getWorkingDaysText = (workingDays?: number) => {
  if (!workingDays || workingDays === 7) return 'Mon-Sun';
  if (workingDays === 6) return 'Mon-Sat';
  if (workingDays === 5) return 'Mon-Fri';
  return `${workingDays} days`;
};

const parseTimeString = (timeStr: string): Date | null => {
  if (!timeStr) return null;
  try {
    // If it contains 'T', it's a full ISO datetime
    if (timeStr.includes('T')) {
      const parsed = new Date(timeStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    // Otherwise it's time-only format (HH:MM:SS)
    const [hours, minutes, seconds] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0, parseInt(seconds, 10) || 0, 0);
    return date;
  } catch {
    return null;
  }
}

// Helper to format time for display
function formatTimeDisplay(timeStr: string): string {
  const date = parseTimeString(timeStr);
  if (!date) return '--:--';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

interface GameCardProps {
  game: Game;
  results?: Result[];
  serialNumber?: number;
}

export function GameCard({ game, results = [], serialNumber }: GameCardProps) {
  const [countdown, setCountdown] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [jodiNumber, setJodiNumber] = useState<string | null>(null);

  // Calculate Jodi number from open and close results
  useEffect(() => {
    const openDigit = game.open_result ? game.open_result.replace(/[-\s]/g, '').slice(-1) : '';
    const closeDigit = game.close_result ? game.close_result.replace(/[-\s]/g, '').slice(-1) : '';
    
    if (openDigit && closeDigit) {
      setJodiNumber(`${openDigit}${closeDigit}`);
    } else {
      setJodiNumber(null);
    }
  }, [game.open_result, game.close_result]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const openTime = parseTimeString(game.open_time);
      const closeTime = parseTimeString(game.close_time);

      if (!openTime || !closeTime) {
        setCountdown('--:--');
        setIsLive(false);
        return;
      }

      // Check if we have both results
      const hasOpenResult = !!game.open_result;
      const hasCloseResult = !!game.close_result;

      if (now >= openTime && now <= closeTime) {
        // Market is open (between open and close time)
        if (hasOpenResult && !hasCloseResult) {
          // Open result declared, waiting for close
          const diff = closeTime.getTime() - now.getTime();
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`Close in ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
          setIsLive(true);
        } else if (!hasOpenResult) {
          // Waiting for open result
          setCountdown('Waiting for Open');
          setIsLive(true);
        } else {
          // Both results declared
          setCountdown('Market Closed');
          setIsLive(false);
        }
      } else if (now > closeTime) {
        // After close time
        if (hasOpenResult && !hasCloseResult) {
          // Close time passed but waiting for close result
          setCountdown('Waiting for Close');
          setIsLive(true);
        } else if (!hasOpenResult && !hasCloseResult) {
          // No results for today
          const tomorrow = new Date(openTime);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const diff = tomorrow.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setCountdown(`Open in ${hours}h ${mins}m`);
          setIsLive(false);
        } else {
          setCountdown('Market Closed');
          setIsLive(false);
        }
      } else {
        // Before open time - countdown to open
        const diff = openTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`Open in ${hours}h ${mins}m`);
        setIsLive(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [game.open_time, game.close_time, game.open_result, game.close_result]);

  const formatResult = (result: string | null) => {
    if (!result || result === 'XXX-X' || result === '---') return '---';
    const cleaned = result.replace(/[-\s]/g, '');
    if (cleaned.length === 7) {
      return `${cleaned.slice(0,3)}-${cleaned.slice(3,5)}-${cleaned.slice(5)}`;
    }
    return result;
  };

  const getLast7DaysResults = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Format date as YYYY-MM-DD using local date parts to avoid timezone issues
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      // Find ALL results for this day (both open and close)
      const dayResults = results.filter(r => {
        const resultDateStr = String(r.result_date).split('T')[0];
        return resultDateStr === dateStr;
      });
      
      // Find open result (result_type is 'open' or 'both')
      const openResult = dayResults.find(r => r.result_type === 'open' || r.result_type === 'both');
      // Find close result (result_type is 'close' or 'both')
      const closeResult = dayResults.find(r => r.result_type === 'close' || r.result_type === 'both');
      
      // Combine last digits of open and close results - use open_result and close_result fields
      let combinedResult = null;
      const openDigit = openResult?.open_result ? openResult.open_result.replace(/[-\s]/g, '').slice(-1) : '';
      const closeDigit = closeResult?.close_result ? closeResult.close_result.replace(/[-\s]/g, '').slice(-1) : '';
      
      if (openDigit && closeDigit) {
        // Both available - show combined
        combinedResult = `${openDigit}${closeDigit}`;
      } else if (openDigit) {
        // Only open available - show open digit only
        combinedResult = openDigit;
      } else if (closeDigit) {
        // Only close available - show close digit only
        combinedResult = closeDigit;
      }
      
      weekData.push({
        day: days[date.getDay()],
        date: dateStr,
        result: combinedResult,
        isToday: i === 0
      });
    }
    return weekData;
  };

  const weekData = getLast7DaysResults();

  // Get missing numbers for current week (only last digit/ank from each result)
  const getMissingNumbers = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Get Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    
    const appearedDigits = new Set<string>();
    
    weekData.forEach(day => {
      // Only consider results from current week (Mon-Sun)
      const dayDate = new Date(day.date);
      if (dayDate >= monday && day.result) {
        const digits = day.result.replace(/[-\s]/g, '');
        digits.split('').forEach(d => appearedDigits.add(d));
      }
    });
    
    const allDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return allDigits.filter(d => !appearedDigits.has(d));
  };

  const missingNumbers = getMissingNumbers();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="group relative">
      {/* Serial Number Badge - Top Center */}
      {serialNumber && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
          <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/30">
            #{serialNumber}
          </span>
        </div>
      )}

      {/* Glow effect - subtle and behind content */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-60 transition duration-500 dark:block hidden" />

      {/* Main Card */}
      <div className="relative bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 dark:border-white/10 rounded-2xl overflow-hidden hover:border-white/30 dark:hover:border-white/30 hover:bg-white/[0.07] dark:hover:bg-white/[0.07] transition-all duration-300">
        {/* Top Section */}
        <div className="p-5 border-b border-white/10 dark:border-white/10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-400">{today}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              isLive 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-white/10 dark:bg-white/10 text-gray-400 dark:text-gray-400 border border-white/10 dark:border-white/10'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              {countdown}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{game.name}</h3>
            {jodiNumber && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <span className="text-xs font-medium text-indigo-400">Jodi</span>
                <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">{jodiNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="p-5 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4 hover:from-green-500/20 hover:to-emerald-500/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Open</span>
            </div>
            <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
              {game.open_result ? formatResult(game.open_result) : '---'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20 rounded-xl p-4 hover:from-red-500/20 hover:to-rose-500/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Close</span>
            </div>
            <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
              {game.close_result ? formatResult(game.close_result) : '---'}
            </p>
          </div>
        </div>

        {/* Timing Section */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Open:</span>
            <span className="text-sm font-semibold text-green-400">{formatTimeDisplay(game.open_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Close:</span>
            <span className="text-sm font-semibold text-red-400">{formatTimeDisplay(game.close_time)}</span>
          </div>
        </div>

        {/* Weekly Chart Grid */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Weekly Chart</span>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
              <Calendar className="w-3 h-3" />
              Last 7 Days
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekData.map((day, idx) => (
              <div
                key={idx}
                className={`
                  flex flex-col items-center py-2 rounded-lg transition-all duration-200
                  ${day.isToday 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-white/5 dark:bg-white/5 border border-transparent hover:bg-white/10 dark:hover:bg-white/10'
                  }
                `}
              >
                <span className={`text-xs font-medium ${day.isToday ? 'text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                  {day.day}
                </span>
                <span className={`text-sm font-mono font-bold mt-1 ${
                  day.result 
                    ? (day.isToday ? 'text-green-400' : 'text-gray-900 dark:text-white') 
                    : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {day.result ? day.result.slice(0, 3) : '---'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 pb-4 flex gap-3">
          <Link href={`/chart/${game.id}?view=panel`} className="flex-1">
            <Button 
              variant="outline"
              className="w-full gap-2 bg-white/5 border-white/10 hover:bg-green-500/20 hover:border-green-500/30 hover:text-green-400 transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4" />
              Panel Chart
            </Button>
          </Link>
          <Link href={`/chart/${game.id}?view=jodi`} className="flex-1">
            <Button 
              variant="outline"
              className="w-full gap-2 bg-white/5 border-white/10 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400 transition-all duration-300"
            >
              <GitGraph className="w-4 h-4" />
              Jodi Chart
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white/5 dark:bg-white/5 border-t border-white/10 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Status: <span className={game.status === 'live' ? 'text-green-400' : 'text-gray-400 dark:text-gray-400'}>{game.status || 'live'}</span>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {getWorkingDaysText(game.working_days)}
            </span>
          </div>
          {/* Missing Numbers - Ruke huye ank */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-500">रुके हुए नंबर्स :</span>
            <div className="flex gap-1">
              {missingNumbers.length > 0 ? (
                missingNumbers.map((digit) => (
                  <span 
                    key={digit} 
                    className="w-5 h-5 flex items-center justify-center bg-red-500/20 border border-red-500/40 rounded text-red-400 font-bold text-xs"
                  >
                    {digit}
                  </span>
                ))
              ) : (
                <span className="text-green-400 text-xs font-medium">All digits appeared ✓</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-gray-800 rounded" />
        <div className="h-6 w-20 bg-gray-800 rounded-full" />
      </div>
      <div className="h-8 w-32 bg-gray-800 rounded mb-6" />
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="h-20 bg-gray-800 rounded-xl" />
        <div className="h-20 bg-gray-800 rounded-xl" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 flex-1 bg-gray-800 rounded-lg" />
        <div className="h-10 flex-1 bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}

export function GameCardEmpty() {
  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 text-center">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-8 h-8 text-gray-600" />
      </div>
      <p className="text-gray-400 font-medium">No games available</p>
      <p className="text-gray-600 text-sm mt-1">Check back later for results</p>
    </div>
  );
}
