'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { gamesApi, resultsApi, Game, Result } from '@/services/api';
import { GameCard, GameCardSkeleton, GameCardEmpty } from '@/components/GameCard';
import FreeGuessingDaily from '@/components/FreeGuessingDaily';
import PanaDashboard from '@/components/PanaDashboard';
import MenuButton from '@/components/MenuButton';
import { WelcomeBanner } from '@/components/WelcomeBanner';
import { Button } from '@/components/ui/Button';
import { Loader2, RefreshCw, BarChart3, Maximize, Minimize, Moon, Sun, Globe, Activity, GitGraph, ChevronUp, Crown } from 'lucide-react';

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [allResults, setAllResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('en');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Helper to check if game is currently live
  const isGameLive = (game: Game) => {
    const now = new Date();
    const openTime = new Date(game.open_time);
    const closeTime = new Date(game.close_time);
    return now >= openTime && now <= closeTime;
  };

  useEffect(() => {
    // Check localStorage for theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  const fetchData = useCallback(async () => {
    try {
      const [gamesRes, resultsRes] = await Promise.all([
        gamesApi.getAll(),
        resultsApi.getAll()
      ]);
      setGames(gamesRes.data);
      setAllResults(resultsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getGameResults = (gameId: number) => {
    // Filter by game_id AND today's date only
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return allResults.filter(r => {
      if (r.game_id !== gameId) return false;
      
      // Extract date from result_date
      const dateValue = r.result_date;
      let resultDateStr: string;
      
      if (typeof dateValue === 'string') {
        resultDateStr = dateValue.split('T')[0];
      } else {
        resultDateStr = new Date(dateValue as any).toISOString().split('T')[0];
      }
      
      return resultDateStr === todayStr;
    });
  };

  // Sort games by open_time (ascending order)
  const sortedGames = [...games].sort((a, b) => {
    const timeA = new Date(`2000-01-01 ${a.open_time}`).getTime();
    const timeB = new Date(`2000-01-01 ${b.open_time}`).getTime();
    return timeA - timeB;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated background gradient - only in dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:block hidden" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse dark:block hidden" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse dark:block hidden" style={{ animationDelay: '1s' }} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-white/5 backdrop-blur-2xl border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Crown className="w-6 h-6 text-white" />      
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Game Results
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live Updates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Refresh Button - Gradient */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="group relative flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-sm font-semibold ml-1">Refresh</span>
              </button>
              
              {/* Chart Button - Gradient */}
              <button
                onClick={() => document.getElementById('chart-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-semibold ml-1">Chart</span>
              </button>

              {/* LIVE Button - Glassmorphism with pulse */}
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-green-500/20 backdrop-blur-md border border-green-500/30 shadow-lg shadow-green-500/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="hidden sm:inline text-sm font-bold text-green-400 ml-1">LIVE</span>
              </div>

              {/* Menu Button */}
              <MenuButton />

              </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        

        {/* Welcome Banner */}
        <section className="mb-4">
          <WelcomeBanner />
        </section>

        {/* Description Box */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-violet-600/20 via-indigo-600/20 to-purple-600/20 border border-violet-500/30 backdrop-blur-sm p-4 sm:p-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400 flex-shrink-0 mt-0.5 sm:mt-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-base sm:text-xl font-semibold bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-snug sm:leading-relaxed">
                रिज़ल्ट आएगा लाइव, रहेगा सब कुछ राइट...
              </p>
              <p className="text-base sm:text-xl font-semibold bg-gradient-to-r from-cyan-400 via-pink-400 to-violet-400 bg-clip-text text-transparent leading-snug sm:leading-relaxed mt-1">
                जुड़े रहो हमारे साथ, और कमाओ दिन- नाइट...
              </p>
              <p className="text-base sm:text-xl font-semibold bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-snug sm:leading-relaxed mt-1">
                पर ध्यान से खेलना यार, वरना हो जाएगी नींद भी <span className="text-red-400 font-bold">आउट ऑफ साइट...</span>
              </p>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mb-8 p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">Auto-refresh: 5s</span>
            </div>
            <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
            <span className="text-sm text-gray-500 dark:text-gray-400">{games.length} Active Games</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {/* <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-500 dark:text-gray-400">Live</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-600 rounded-full" />
              <span className="text-gray-500 dark:text-gray-400">Waiting</span>
            </div> */}
          </div>
        </div>
      
        {/* All Games Table Section */}
        {games.length > 0 && !loading && (
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
              {/* Sticky Header */}
              <div className="sticky top-0 z-50 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                <div className="grid grid-cols-4 gap-1 sm:gap-4 p-1.5 sm:p-4">
                  <div className="text-[10px] sm:text-base font-bold text-gray-900 dark:text-white">GAME</div>
                  <div className="text-[10px] sm:text-base font-bold text-gray-900 dark:text-white text-center">TIME</div>
                  <div className="text-[10px] sm:text-base font-bold text-gray-900 dark:text-white text-center">RESULT</div>
                  <div className="text-[10px] sm:text-base font-bold text-gray-900 dark:text-white text-center">CHART</div>
                </div>
              </div>
              
              {/* Table Body */}
              {sortedGames.map((game, index) => {
                const isLive = isGameLive(game);
                
                // Get latest result for today
                const gameResults = getGameResults(game.id);
                
                // Find open and close results separately based on result_type
                const openResult = gameResults.find(r => r.result_type === 'open' || r.result_type === 'both');
                const closeResult = gameResults.find(r => r.result_type === 'close' || r.result_type === 'both');
                
                // Format result display
                // Only open: 100-1
                // Both declared: 100-12-200
                let resultDisplay = '**';
                
                // Use game.open_result and game.close_result directly from API
                // API format: "100-1" (pana-ank)
                const openResultRaw = game.open_result || '';
                const closeResultRaw = game.close_result || '';
                
                // Parse pana and ank from result (format: pana-ank or just pana)
                const parseResult = (result: string) => {
                  if (!result) return { pana: '', ank: '' };
                  const parts = result.split('-');
                  if (parts.length === 2) {
                    return { pana: parts[0], ank: parts[1] };
                  }
                  // If no dash, assume it's just pana
                  return { pana: result, ank: result.slice(-1) };
                };
                
                const openData = parseResult(openResultRaw);
                const closeData = parseResult(closeResultRaw);
                
                const openPana = openData.pana;
                const closePana = closeData.pana;
                
                // Check if open_result has actual digits
                const hasOpenResult = openPana.length > 0 && /\d/.test(openPana);
                // Check if close_result has actual digits - must be at least 2 digits (pana, not just ank)
                const hasCloseResult = closePana.length >= 2 && /\d/.test(closePana);
                
                if (hasOpenResult) {
                  let openPanaDisplay = openPana;
                  // Ensure 3 digits for open pana
                  if (openPanaDisplay.length === 2) openPanaDisplay = '0' + openPanaDisplay;
                  if (openPanaDisplay.length === 1) openPanaDisplay = '00' + openPanaDisplay;
                  
                  // Use ank from parsed data
                  const openAnk = openData.ank || '*';
                  
                  if (hasCloseResult) {
                    let closePanaDisplay = closePana;
                    // Ensure 3 digits for close pana
                    if (closePanaDisplay.length === 2) closePanaDisplay = '0' + closePanaDisplay;
                    if (closePanaDisplay.length === 1) closePanaDisplay = '00' + closePanaDisplay;
                    // Use ank from parsed data
                    const closeAnk = closeData.ank || '*';
                    // Both declared: Pana-Jodi-Pana
                    resultDisplay = `${openPanaDisplay}-${openAnk}${closeAnk}-${closePanaDisplay}`;
                  } else {
                    // Only open is declared
                    resultDisplay = `${openPanaDisplay}-${openAnk}`;
                  }
                } else if (hasCloseResult) {
                  // Only close is declared
                  let closePanaDisplay = closePana;
                  if (closePanaDisplay.length === 2) closePanaDisplay = '0' + closePanaDisplay;
                  if (closePanaDisplay.length === 1) closePanaDisplay = '00' + closePanaDisplay;
                  const closeAnk = closeData.ank || '*';
                  resultDisplay = `***-*${closeAnk}-${closePanaDisplay}`;
                }
                
                // Use raw game times with AM/PM
                const formatTime = (timeStr: string) => {
                  // If timeStr is already formatted like "14:30", convert to AM/PM
                  if (timeStr.includes(':') && !timeStr.includes('M')) {
                    try {
                      const [hours, minutes] = timeStr.split(':');
                      const hour = parseInt(hours);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour % 12 || 12;
                      return `${displayHour}:${minutes} ${ampm}`;
                    } catch {
                      return timeStr;
                    }
                  }
                  // If it's a full datetime, extract time with AM/PM
                  if (timeStr.includes('T') || timeStr.includes(' ')) {
                    try {
                      const date = new Date(timeStr);
                      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    } catch {
                      return timeStr;
                    }
                  }
                  return timeStr;
                };
                
                return (
                  <div 
                    key={game.id}
                    className={`grid grid-cols-4 gap-1 sm:gap-4 p-1.5 sm:p-4 border-b border-gray-200 dark:border-white/5 items-center ${
                      isLive 
                        ? 'bg-green-50 dark:bg-green-900/10 border-l-4 border-l-green-500' 
                        : index % 2 === 0 
                          ? 'bg-white dark:bg-gray-900' 
                          : 'bg-gray-50 dark:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="font-bold text-gray-900 dark:text-white text-[10px] sm:text-base whitespace-nowrap">{game.name}</span>
                      {isLive && (
                        <span className="px-1 py-0.5 bg-green-500 text-white text-[8px] sm:text-xs font-bold rounded animate-pulse flex-shrink-0">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="text-center text-[10px] sm:text-base whitespace-nowrap">
                      <span className="text-green-600 dark:text-green-400 font-medium">{formatTime(game.open_time)}</span>
                      <span className="text-gray-400 mx-0.5">/</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">{formatTime(game.close_time)}</span>
                    </div>
                    <div className="text-center font-mono font-bold text-gray-900 dark:text-white text-[10px] sm:text-base whitespace-nowrap">
                      {resultDisplay}
                    </div>
                    <div className="text-center">
                      <Link 
                        href={`/chart/${game.id}?view=panel`}
                      >
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold text-[10px] sm:text-base px-1.5 sm:px-4 py-0.5 sm:py-1 h-auto"
                        >
                          Panel
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Loading State */}
        {loading && games.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-red-400 font-medium text-lg">{error}</p>
            <Button variant="outline" onClick={fetchData} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : games.length === 0 ? (
          <div className="max-w-md mx-auto">
            <GameCardEmpty />
          </div>
        ) : (
          /* Games Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGames.map((game, index) => (
              <GameCard 
                key={game.id} 
                game={game} 
                results={allResults.filter(r => r.game_id === game.id)}
                serialNumber={index + 1}
              />
            ))}
          </div>
        )}
        {/* Chart Section */}
        <section id="chart-section" className="mt-12 pt-8 border-t border-white/10">
          <div className="mb-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">CHARTS ALL GAMES</h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedGames.map((game) => (
                <div 
                  key={game.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-green-500/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{game.name}</h3>
                      <p className="text-sm text-gray-500">
                        {game.open_time} - {game.close_time}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      game.status === 'live' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-white/10 text-gray-400 border border-white/10'
                    }`}>
                      {game.status || 'waiting'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Link href={`/chart/${game.id}?view=panel`} className="flex-1">
                      <Button 
                        variant="outline"
                        className="w-full gap-2 bg-green-500/10 border-green-500/20 hover:bg-green-500/20 hover:border-green-500/30 hover:text-green-400 transition-all duration-300 text-xs sm:text-sm"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Panel Chart
                      </Button>
                    </Link>
                    <Link href={`/chart/${game.id}?view=jodi`} className="flex-1">
                      <Button 
                        variant="outline"
                        className="w-full gap-2 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400 transition-all duration-300 text-xs sm:text-sm"
                      >
                        <GitGraph className="w-4 h-4" />
                        Jodi Chart
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Free Guessing Daily Section */}
        <div id="chart-section">
          <FreeGuessingDaily games={sortedGames} />
        </div>

        {/* Pana Dashboard Section */}
        <PanaDashboard />
      </main>

      {/* Scroll to Top and Chart Buttons - Mobile Responsive */}
      {showScrollTop && (
        <>
          <button
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-300 z-50 group"
            title="Scroll to Top"
          >
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-12 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Top
            </span>
          </button>
          <button
            onClick={() => document.getElementById('chart-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/30 transition-all duration-300 z-50 group"
            title="Go to Chart Section"
          >
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-12 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Chart
            </span>
          </button>
        </>
      )}

      {/* Floating Refresh Button - Only show when scrolled */}
      {showScrollTop && (
        <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/30 transition-all duration-300 z-50 group disabled:opacity-70"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="absolute -top-12 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Refresh
            </span>
          </button>
      )}
    </div>
  );
}
