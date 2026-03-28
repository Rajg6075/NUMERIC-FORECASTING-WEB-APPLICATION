'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { gamesApi, Game } from '@/services/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, BarChart3, GitGraph, ArrowLeft, RefreshCw, Maximize, Minimize, Globe } from 'lucide-react';

export default function ChartSelectPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lang, setLang] = useState('en');

  const fetchGames = useCallback(async () => {
    try {
      const res = await gamesApi.getAll();
      setGames(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Header - Modern Fintech Style */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <button className="p-2 rounded-xl sm:rounded-2xl bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-all duration-300">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                </button>
              </Link>
              <div className="relative">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Chart
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Select a game to view chart
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchGames}
                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-all duration-300 group"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:rotate-180 transition-transform duration-700" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="hidden sm:block p-3 rounded-2xl bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-all duration-300"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-5 h-5 text-gray-300" /> : <Maximize className="w-5 h-5 text-gray-300" />}
              </button>

              <button
                onClick={toggleLang}
                className="hidden sm:block p-3 rounded-2xl bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-all duration-300"
                title="Translate"
              >
                <Globe className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No games available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <Card 
                key={game.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-green-500/30 transition-all duration-300"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{game.name}</h3>
                      <p className="text-sm text-gray-500">
                        {game.open_time} - {game.close_time}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-indigo-400">
                          {game.active_days ? `${game.active_days.length}/7 days active` : '7/7 days active'}
                        </span>
                        {game.active_days && (
                          <div className="flex gap-1">
                            {game.active_days.slice(0, 3).map((day) => (
                              <span key={day} className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-xs capitalize">
                                {day.slice(0, 3)}
                              </span>
                            ))}
                            {game.active_days.length > 3 && (
                              <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-400 rounded text-xs">
                                +{game.active_days.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      game.status === 'live' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-white/10 text-gray-400 border border-white/10'
                    }`}>
                      {game.status || 'waiting'}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link href={`/chart/${game.id}?view=panel`} className="flex-1">
                      <Button 
                        variant="outline"
                        className="w-full gap-2 bg-green-500/10 border-green-500/20 hover:bg-green-500/20 hover:border-green-500/30 hover:text-green-400 transition-all duration-300"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Panel Chart
                      </Button>
                    </Link>
                    <Link href={`/chart/${game.id}?view=jodi`} className="flex-1">
                      <Button 
                        variant="outline"
                        className="w-full gap-2 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400 transition-all duration-300"
                      >
                        <GitGraph className="w-4 h-4" />
                        Jodi Chart
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
