'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams, useSearchParams } from 'next/navigation';
import { resultsApi, gamesApi, Result, Game } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Loader2, ArrowLeft, Calendar, BarChart3, GitGraph, Filter, LayoutGrid, ChevronDown, ArrowUp, Home } from 'lucide-react';

type ViewMode = 'table' | 'grid' | 'panel' | 'jodi';
type TimeFilter = 'all' | 'week' | 'month';

export default function ChartPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = Number(params.game_id);
  const viewParam = searchParams.get('view');
  
  const [results, setResults] = useState<Result[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(
    viewParam === 'panel' ? 'panel' : viewParam === 'jodi' ? 'jodi' : 'panel'
  );
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch all games for selector
  useEffect(() => {
    const fetchAllGames = async () => {
      try {
        const res = await gamesApi.getAll();
        setAllGames(res.data);
      } catch (err) {
        console.error('Failed to fetch games:', err);
      }
    };
    fetchAllGames();
  }, []);

  const handleGameChange = (newGameId: number) => {
    router.push(`/chart/${newGameId}?view=${viewMode}`);
  };

  const fetchData = useCallback(async () => {
    try {
      const [gameRes, resultsRes] = await Promise.all([
        gamesApi.getById(gameId),
        resultsApi.getByGameId(gameId)
      ]);
      setGame(gameRes.data);
      setResults(resultsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Scroll listener for scroll-to-top button
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
    setRefreshing(true);
    fetchData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // Date range filter
    if (fromDate) {
      filtered = filtered.filter(r => 
        new Date(r.result_date) >= new Date(fromDate)
      );
    }
    if (toDate) {
      filtered = filtered.filter(r => 
        new Date(r.result_date) <= new Date(toDate)
      );
    }

    // Time filter
    const now = new Date();
    if (timeFilter === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(r => new Date(r.result_date) >= weekAgo);
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(r => new Date(r.result_date) >= monthAgo);
    }

    return filtered.sort((a, b) => 
      new Date(b.result_date).getTime() - new Date(a.result_date).getTime()
    );
  }, [results, fromDate, toDate, timeFilter]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatResult = (result: string) => {
    const cleaned = result.replace(/[-\s]/g, '');
    if (cleaned.length === 7) {
      return `${cleaned.slice(0,3)}-${cleaned.slice(3,5)}-${cleaned.slice(5)}`;
    }
    return result;
  };

  // Combine last digit of open_result and close_result
  const getCombinedResult = (openResult?: string | null, closeResult?: string | null) => {
    if (!openResult && !closeResult) return '---';
    const openDigit = openResult ? openResult.replace(/[-\s]/g, '').slice(-1) : '';
    const closeDigit = closeResult ? closeResult.replace(/[-\s]/g, '').slice(-1) : '';
    if (openDigit && closeDigit) return `${openDigit}${closeDigit}`;
    return openDigit || closeDigit || '---';
  };

  const getStatusVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'live': return 'success';
      case 'waiting': return 'secondary';
      default: return 'default';
    }
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setTimeFilter('all');
  };

  // Check if number should be colored red (doubles and mirror pairs)
  const isRedNumber = (num: string): boolean => {
    if (!num || num.length !== 2) return false;
    const doubles = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
    const mirrorPairs = ['27', '72', '38', '83', '49', '94', '16', '61'];
    const specialPairs = ['05', '50'];
    return doubles.includes(num) || mirrorPairs.includes(num) || specialPairs.includes(num);
  };

  // Get week number of the year
  const getWeekNumber = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const oneWeek = 604800000;
    return Math.ceil((diff + start.getDay() * 86400000) / oneWeek);
  };

  // Get Monday of a week
  const getMonday = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Organize results by week for panel chart
  const weeklyData = useMemo(() => {
    const weeks: { 
      weekStart: Date; 
      weekEnd: Date; 
      weekNum: number; 
      days: { 
        date: Date; 
        dayName: string; 
        result: { open?: string; close?: string; combined?: string } | null 
      }[] 
    }[] = [];
    
    // Group results by week - properly merge open and close for same day
    const resultsByWeek = new Map<string, Map<number, { open?: string; close?: string; combined?: string }>>();
    
    filteredResults.forEach(result => {
      const date = new Date(result.result_date);
      const monday = getMonday(date);
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!resultsByWeek.has(weekKey)) {
        resultsByWeek.set(weekKey, new Map());
      }
      
      const dayOfWeek = date.getDay();
      const dayKey = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Monday=0
      
      // Skip days based on working_days setting (0=Mon, 1=Tue, ..., 5=Sat, 6=Sun)
      const workingDays = game?.working_days || 7;
      if (workingDays < 7 && dayKey >= workingDays) {
        return;
      }
      
      const weekDays = resultsByWeek.get(weekKey)!;
      const existing = weekDays.get(dayKey) || {};
      
      // Merge open and close results
      weekDays.set(dayKey, {
        open: result.open_result || existing.open,
        close: result.close_result || existing.close,
        combined: getCombinedResult(
          result.open_result || existing.open, 
          result.close_result || existing.close
        )
      });
    });

    // Create week entries
    const sortedWeeks = Array.from(resultsByWeek.keys()).sort().reverse();
    const today = new Date();
    const currentWeekStart = getMonday(today);

    sortedWeeks.forEach(weekKey => {
      const weekStart = new Date(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekDays = resultsByWeek.get(weekKey)!;
      const days = [];
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(dayDate.getDate() + i);
        days.push({
          date: dayDate,
          dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          result: weekDays.get(i) || null
        });
      }

      weeks.push({
        weekStart,
        weekEnd,
        weekNum: getWeekNumber(weekStart),
        days
      });
    });

    return weeks;
  }, [filteredResults]);

  // Format panel number for display (e.g., "123-4" -> show digits around center)
  const formatPanelDisplay = (result: { open?: string; close?: string; combined?: string } | null) => {
    if (!result || !result.combined || result.combined === '---') {
      return { main: '--', top: '', bottom: '', left: '', right: '' };
    }
    
    const combined = result.combined;
    if (combined.length === 2) {
      return {
        main: combined,
        top: '',
        bottom: '',
        left: combined[0],
        right: combined[1]
      };
    }
    
    return { main: combined, top: '', bottom: '', left: '', right: '' };
  };

  // Check if week is current week
  const isCurrentWeek = (weekStart: Date) => {
    const today = new Date();
    const currentMonday = getMonday(today);
    return weekStart.toISOString().split('T')[0] === currentMonday.toISOString().split('T')[0];
  };

  // Format date range for display
  const formatDateRange = (start: Date, end: Date) => {
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Get missing single digits for current week (only last digit/ank from each result)
  const getMissingNumbers = useMemo(() => {
    const currentWeek = weeklyData.find(w => isCurrentWeek(w.weekStart));
    if (!currentWeek) return [];
    
    const appearedDigits = new Set<string>();
    currentWeek.days.forEach(day => {
      // Only track the last digit (ank) from each result
      if (day.result?.open) {
        const openDigit = day.result.open.replace(/[-\s]/g, '').slice(-1);
        if (openDigit) appearedDigits.add(openDigit);
      }
      if (day.result?.close) {
        const closeDigit = day.result.close.replace(/[-\s]/g, '').slice(-1);
        if (closeDigit) appearedDigits.add(closeDigit);
      }
    });
    
    const allDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return allDigits.filter(d => !appearedDigits.has(d));
  }, [weeklyData]);

  // Get current week result summary
  const getCurrentWeekSummary = useMemo(() => {
    const currentWeek = weeklyData.find(w => isCurrentWeek(w.weekStart));
    if (!currentWeek) return null;
    
    const resultCount = currentWeek.days.filter(d => d.result && (d.result.open || d.result.close)).length;
    const totalDays = game?.working_days || 7;
    
    return { resultCount, totalDays };
  }, [weeklyData, game]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header - Modern Fintech Style */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button */}
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1 sm:gap-2 bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-200 text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            
            {/* Center - Game Name */}
            <div className="flex-1 text-center">
              <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {game?.name || 'Loading...'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {viewMode === 'panel' ? 'Panel Chart' : 'Jodi Chart'} View
              </p>
            </div>
            
            {/* Home Button */}
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1 sm:gap-2 bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-200 text-xs sm:text-sm"
              >
                <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Card */}
        <Card className="mb-6 bg-gray-800/80 border-gray-700">
          <CardContent className="py-3 sm:py-4">
            {/* Unified Horizontal Filter Row */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
              {/* Game Selector */}
              <div className="flex-shrink-0">
                <select
                  value={gameId}
                  onChange={(e) => handleGameChange(Number(e.target.value))}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[...allGames].sort((a, b) => (a.open_time || '').localeCompare(b.open_time || '')).map((g) => (
                    <option key={g.id} value={g.id} style={{ backgroundColor: '#1f2937' }}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date Filter Button */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm transition-all ${
                    (fromDate || toDate) ? 'ring-2 ring-green-500/30 bg-green-500/10' : ''
                  }`}
                >
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {(fromDate || toDate) ? (
                    <span className="text-xs text-green-400">Filtered</span>
                  ) : (
                    <span className="text-xs text-gray-400">Date</span>
                  )}
                </button>
                
                {/* Date Filter Dropdown */}
                {showMobileFilters && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    {/* Backdrop */}
                    <div 
                      className="absolute inset-0 bg-black/50"
                      onClick={() => setShowMobileFilters(false)}
                    />
                    
                    {/* Modal */}
                    <div className="relative w-full max-w-sm bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium text-sm">Date Filter</span>
                        <button 
                          onClick={() => setShowMobileFilters(false)}
                          className="text-gray-400 hover:text-white text-xl"
                        >
                          ×
                        </button>
                      </div>
                    
                    {/* Quick Filters */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        onClick={() => {
                          setFromDate('');
                          setToDate('');
                        }}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white transition-colors"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          setFromDate(weekAgo.toISOString().split('T')[0]);
                          setToDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white transition-colors"
                      >
                        Last 7 Days
                      </button>
                      <button
                        onClick={() => {
                          const monthAgo = new Date();
                          monthAgo.setMonth(monthAgo.getMonth() - 1);
                          setFromDate(monthAgo.toISOString().split('T')[0]);
                          setToDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white transition-colors"
                      >
                        Last 30 Days
                      </button>
                      <button
                        onClick={() => {
                          const ninetyDaysAgo = new Date();
                          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                          setFromDate(ninetyDaysAgo.toISOString().split('T')[0]);
                          setToDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-white transition-colors"
                      >
                        Last 90 Days
                      </button>
                    </div>
                    
                    {/* Custom Date Range */}
                    <div className="space-y-3 mb-3">
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">From</label>
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">To</label>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    
                    {/* Apply Button */}
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      Apply Filter
                    </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Clear Button */}
              {(fromDate || toDate || timeFilter !== 'all') && (
                <div className="flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={clearFilters} className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 whitespace-nowrap min-w-[60px]">
                    Clear
                  </Button>
                </div>
              )}
              
              {/* Panel/Jodi Toggle - Show only opposite button */}
              <div className="flex-shrink-0">
                {viewMode === 'jodi' ? (
                  <button
                    onClick={() => setViewMode('panel')}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-500 transition-all"
                  >
                    Panel
                  </button>
                ) : (
                  <button
                    onClick={() => setViewMode('jodi')}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-500 transition-all"
                  >
                    Jodi
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missing Numbers & Week Status */}
        {getCurrentWeekSummary && (
          <Card className="mb-6 bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 shadow-lg backdrop-blur-sm">
            <CardContent className="py-4 px-4">
              {/* Week Status Section */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500/30 animate-ping" />
                  </div>
                  <div>
                    <span className="text-white font-medium text-sm block">Current Week</span>
                    <span className="text-gray-500 text-xs">Live tracking</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-green-400 font-bold text-lg">{getCurrentWeekSummary.resultCount}</span>
                    <span className="text-gray-400 text-xs">/</span>
                    <span className="text-gray-300 text-sm">{getCurrentWeekSummary.totalDays}</span>
                  </div>
                  <div className="text-gray-500 text-xs">Days</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(getCurrentWeekSummary.resultCount / getCurrentWeekSummary.totalDays) * 100}%` }}
                  />
                </div>
              </div>

              {/* Missing Numbers Section */}
              <div className="border-t border-gray-700/50 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">
                    रुके हुए नंबर्स <span className="text-gray-500 text-xs">({getMissingNumbers.length})</span>
                  </span>
                  {getMissingNumbers.length > 0 && (
                    <span className="text-red-400 text-xs bg-red-500/10 px-1.5 py-0.5 rounded">
                      Pending
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getMissingNumbers.length > 0 ? (
                    getMissingNumbers.map((digit) => (
                      <span 
                        key={digit} 
                        className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/40 rounded text-red-400 font-bold text-xs shadow-md hover:scale-105 transition-all duration-200"
                      >
                        {digit}
                      </span>
                    ))
                  ) : (
                    <div className="flex items-center gap-1 text-green-400 text-xs">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>All digits appeared</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Card */}
        <Card className="bg-gray-800/80 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <CardTitle className="text-white text-xl">See Older Records</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-green-500" />
                  <p className="text-gray-500">Loading results...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-10 h-10 text-red-500" />
                </div>
                <p className="text-red-400 font-medium text-lg">{error}</p>
                <Button variant="outline" onClick={fetchData} className="mt-4 bg-gray-800/50 border-gray-700">
                  Try Again
                </Button>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-gray-400 text-lg font-medium">No Data Available</p>
                <p className="text-gray-600 text-sm mt-1">
                  {fromDate || toDate ? 'No results match your date range' : 'No historical data available'}
                </p>
                {(fromDate || toDate || timeFilter !== 'all') && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 bg-gray-800/50 border-gray-700">
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : viewMode === 'jodi' ? (
              /* Jodi Chart View - Weekly Grid showing combined numbers */
              <div className="space-y-4 overflow-x-auto">
                {/* Header Row */}
                <div className="flex min-w-[600px] md:min-w-[800px]">
                  <div className="w-28 flex-shrink-0" />
                  <div className="flex-1 grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Week Rows */}
                {weeklyData.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No results available to display
                  </div>
                ) : (
                  weeklyData.map((week, weekIndex) => {
                    const isCurrent = isCurrentWeek(week.weekStart);
                    return (
                      <div 
                        key={weekIndex}
                        className={`flex rounded-xl overflow-hidden min-w-[600px] md:min-w-[800px] ${
                          isCurrent 
                            ? 'bg-green-500/10 border-2 border-green-500/30' 
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        {/* Date Range Column */}
                        <div className={`w-28 flex-shrink-0 p-2 flex flex-col justify-center ${
                          isCurrent ? 'bg-green-500/20' : 'bg-white/5'
                        }`}>
                          <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-green-400' : 'text-white'}`}>
                            {formatDateRange(week.weekStart, week.weekEnd)}
                          </div>
                          <div className={`text-[10px] ${isCurrent ? 'text-green-300' : 'text-gray-500'}`}>
                            Week {week.weekNum}
                          </div>
                        </div>

                        {/* Days Grid - Jodi Numbers */}
                        <div className="flex-1 grid grid-cols-7 gap-1 p-1">
                          {week.days.map((day, dayIndex) => {
                            const isToday = day.date.toDateString() === new Date().toDateString();
                            
                            // Calculate Jodi number (combined last digits)
                            const jodiNumber = day.result && day.result.open && day.result.close
                              ? `${day.result.open.replace(/[-\s]/g, '').slice(-1)}${day.result.close.replace(/[-\s]/g, '').slice(-1)}`
                              : null;
                            
                            return (
                              <div 
                                key={dayIndex}
                                className={`relative min-h-[80px] rounded-lg flex flex-col items-center justify-center ${
                                  jodiNumber 
                                    ? 'bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700' 
                                    : 'bg-gray-900/30 border border-gray-800'
                                } ${isToday ? 'ring-2 ring-purple-500/50' : ''}`}
                              >
                                {/* Day name at top */}
                                <div className={`text-center pt-1 text-[8px] font-medium truncate ${
                                  isToday ? 'text-purple-400' : 'text-gray-500'
                                }`}>
                                  {day.dayName}
                                </div>

                                {/* Jodi Number Display */}
                                <div className="flex-1 flex items-center justify-center">
                                  {jodiNumber ? (
                                    <span className={`text-2xl font-black ${isRedNumber(jodiNumber) ? 'text-red-500' : 'text-white'}`}>
                                      {jodiNumber}
                                    </span>
                                  ) : (
                                    <span className="text-gray-600 text-lg font-bold">--</span>
                                  )}
                                </div>

                                {/* Date at bottom */}
                                <div className={`text-center pb-1 text-xs font-bold ${
                                  isToday ? 'text-purple-400' : 'text-gray-400'
                                }`}>
                                  {day.date.getDate()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Legend */}
                <div className="hidden sm:flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
                    <span>Current Week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">67</span>
                    <span>Jodi Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-900/30 border border-gray-800" />
                    <span>No Result</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Panel Chart View - Weekly Grid */
              <div className="space-y-3 sm:space-y-4 lg:space-y-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                {/* Header Row */}
                <div className="flex min-w-[500px] sm:min-w-[700px] lg:min-w-[900px]">
                  <div className="w-20 sm:w-24 lg:w-32 flex-shrink-0" />
                  <div className="flex-1 grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="text-center text-xs sm:text-sm lg:text-base font-semibold text-gray-400 py-1 sm:py-2 lg:py-3">
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Week Rows */}
                {weeklyData.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No results available to display
                  </div>
                ) : (
                  weeklyData.map((week, weekIndex) => {
                    const isCurrent = isCurrentWeek(week.weekStart);
                    return (
                      <div 
                        key={weekIndex}
                        className={`flex rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden min-w-[500px] sm:min-w-[700px] lg:min-w-[900px] ${
                          isCurrent 
                            ? 'bg-green-500/10 border-2 border-green-500/30' 
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        {/* Date Range Column */}
                        <div className={`w-24 sm:w-24 lg:w-32 flex-shrink-0 p-2 sm:p-2 lg:p-3 flex flex-col justify-center ${
                          isCurrent ? 'bg-green-500/20' : 'bg-white/5'
                        }`}>
                          <div className={`text-[10px] sm:text-xs lg:text-sm font-semibold truncate ${isCurrent ? 'text-green-400' : 'text-white'}`}>
                            {formatDateRange(week.weekStart, week.weekEnd)}
                          </div>
                          <div className={`text-[8px] sm:text-[10px] lg:text-xs ${isCurrent ? 'text-green-300' : 'text-gray-500'}`}>
                            Week {week.weekNum}
                          </div>
                        </div>

                        {/* Days Grid */}
                        <div className="flex-1 grid grid-cols-7 gap-0.5 sm:gap-1 lg:gap-2 p-0.5 sm:p-1 lg:p-2">
                          {week.days.map((day, dayIndex) => {
                            const isToday = day.date.toDateString() === new Date().toDateString();
                            
                            return (
                              <div 
                                key={dayIndex}
                                className={`relative min-h-[80px] sm:min-h-[110px] lg:min-h-[140px] rounded sm:rounded-lg ${
                                  day.result && (day.result.open || day.result.close)
                                    ? 'bg-gray-800/50 border border-gray-700' 
                                    : 'bg-gray-900/30 border border-gray-800'
                                } ${isToday ? 'ring-1 sm:ring-2 ring-green-500/50' : ''}`}
                              >
                                {/* Day name at top */}
                                <div className={`text-center pt-0.5 sm:pt-1 text-[7px] sm:text-[8px] lg:text-xs font-medium truncate ${
                                  isToday ? 'text-green-400' : 'text-gray-500'
                                }`}>
                                  {day.dayName}
                                </div>

                                {/* Panel Display Container */}
                                <div className="flex items-center justify-center h-[60px] sm:h-[80px] lg:h-[105px] gap-0.5 sm:gap-1 lg:gap-2 px-0.5 sm:px-1 lg:px-2">
                                  {day.result && (day.result.open || day.result.close) ? (
                                    <>
                                      {/* Left side - Open first 3 digits */}
                                      {day.result.open ? (
                                        <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded px-0.5 sm:px-1 lg:px-2">
                                          {day.result.open.replace(/[-\s]/g, '').slice(0, 3).split('').map((digit, i) => (
                                            <span key={i} className="text-[8px] sm:text-xs lg:text-sm font-bold text-gray-300 leading-none py-0.5">
                                              {digit}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded px-0.5 sm:px-1 lg:px-2">
                                          <span className="text-[8px] sm:text-xs lg:text-sm text-gray-600 leading-none py-0.5">-</span>
                                          <span className="text-[10px] sm:text-lg lg:text-xl text-gray-600 leading-none py-0.5">-</span>
                                          <span className="text-[10px] sm:text-lg lg:text-xl text-gray-600 leading-none py-0.5">-</span>
                                        </div>
                                      )}
                                      
                                      {/* Center - Combined last digits */}
                                      {(() => {
                                        const combinedNum = day.result.open && day.result.close 
                                          ? `${day.result.open.replace(/[-\s]/g, '').slice(-1)}${day.result.close.replace(/[-\s]/g, '').slice(-1)}`
                                          : day.result.open 
                                            ? day.result.open.replace(/[-\s]/g, '').slice(-1)
                                            : day.result.close 
                                              ? day.result.close.replace(/[-\s]/g, '').slice(-1)
                                              : '';
                                        return (
                                          <div className={`text-sm sm:text-xl lg:text-3xl font-black leading-none mx-0.5 sm:mx-1 bg-gradient-to-b from-gray-800 to-gray-900 rounded px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-2 border border-gray-700 shadow-lg ${isRedNumber(combinedNum) ? 'text-red-500' : 'text-white'}`}>
                                            {combinedNum || '--'}
                                          </div>
                                        );
                                      })()}
                                      
                                      {/* Right side - Close first 3 digits */}
                                      {day.result.close ? (
                                        <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded px-0.5 sm:px-1 lg:px-2">
                                          {day.result.close.replace(/[-\s]/g, '').slice(0, 3).split('').map((digit, i) => (
                                            <span key={i} className="text-[8px] sm:text-xs lg:text-sm font-bold text-gray-300 leading-none py-0.5">
                                              {digit}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded px-0.5 sm:px-1 lg:px-2">
                                          <span className="text-[8px] sm:text-xs lg:text-sm text-gray-600 leading-none py-0.5">-</span>
                                          <span className="text-[8px] sm:text-xs lg:text-sm text-gray-600 leading-none py-0.5">-</span>
                                          <span className="text-[8px] sm:text-xs lg:text-sm text-gray-600 leading-none py-0.5">-</span>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-gray-500 text-lg sm:text-2xl lg:text-4xl font-bold">--</span>
                                  )}
                                </div>

                                {/* Date at bottom */}
                                <div className={`absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs lg:text-sm font-bold ${isToday ? 'text-green-400' : 'text-gray-400'}`}>
                                  {day.date.getDate()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Legend */}
                <div className="hidden sm:flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
                    <span>Current Week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">●</span>
                    <span>Open Last Digit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">●</span>
                    <span>Close Last Digit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-800/50 border border-gray-700" />
                    <span>Has Result</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-900/30 border border-gray-800" />
                    <span>No Result</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-full shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Refresh Button - Works on both Panel and Jodi views */}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 group disabled:opacity-70"
        aria-label="Refresh data"
        title="Refresh"
      >
        <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="absolute -top-12 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Refresh
        </span>
      </button>
    </div>
  );
}
