'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGames, useResults } from '@/hooks/useData';
import { useRequireAuth, useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminApi } from '@/services/api';
import { Loader2, LogOut, Plus, Trash2, RefreshCw, Home, Crown, Mail } from 'lucide-react';

export default function AdminDashboardPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const { logout } = useAuth();
  const { showToast } = useToast();
  
  const { games, loading: gamesLoading, refetch: refetchGames } = useGames(0);
  const { results, loading: resultsLoading, refetch: refetchResults } = useResults(undefined, 0);
  
  const [newGameName, setNewGameName] = useState('');
  const [newGameOpenTime, setNewGameOpenTime] = useState('');
  const [newGameCloseTime, setNewGameCloseTime] = useState('');
  const [selectedGame, setSelectedGame] = useState<number | ''>('');
  const [newResult, setNewResult] = useState('');
  const [newResultDate, setNewResultDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStatus, setNewStatus] = useState('live');
  const [resultType, setResultType] = useState<'open' | 'close'>('open');
  const [resultDateFilter, setResultDateFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit game state
  const [editingGame, setEditingGame] = useState<{id: number; name: string; open_time: string; close_time: string; working_days?: number} | null>(null);
  const [editGameName, setEditGameName] = useState('');
  const [editOpenTime, setEditOpenTime] = useState('');
  const [editCloseTime, setEditCloseTime] = useState('');
  const [editWorkingDays, setEditWorkingDays] = useState(7);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName || !newGameOpenTime || !newGameCloseTime) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.createGame({ 
        name: newGameName, 
        open_time: newGameOpenTime, 
        close_time: newGameCloseTime 
      });
      showToast('Game added successfully!', 'success');
      setNewGameName('');
      setNewGameOpenTime('');
      setNewGameCloseTime('');
      refetchGames();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to add game', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame || !newResult || !newResultDate) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // Validate result format: XXX-X (e.g., 123-4)
    const resultPattern = /^\d{3}-\d$/;
    if (!resultPattern.test(newResult)) {
      showToast('Result must be in format XXX-X (e.g., 123-4)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.createResult({ 
        game_id: Number(selectedGame), 
        result: newResult,
        result_date: newResultDate,
        status: newStatus,
        result_type: resultType
      });
      showToast('Result added successfully!', 'success');
      setNewResult('');
      setSelectedGame('');
      refetchResults();
      refetchGames();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to add result', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGame = async (id: number) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    
    try {
      await adminApi.deleteGame(id);
      showToast('Game deleted successfully!', 'success');
      refetchGames();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to delete game', 'error');
    }
  };

  const handleDeleteResult = async (id: number) => {
    if (!confirm('Are you sure you want to delete this result?')) return;
    
    try {
      await adminApi.deleteResult(id);
      showToast('Result deleted successfully!', 'success');
      refetchResults();
      refetchGames();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to delete result', 'error');
    }
  };

  const handleEditGame = (game: {id: number; name: string; open_time: string; close_time: string; working_days?: number}) => {
    setEditingGame(game);
    setEditGameName(game.name);
    setEditOpenTime(game.open_time);
    setEditCloseTime(game.close_time);
    setEditWorkingDays(game.working_days || 7);
  };

  const handleUpdateGameTime = async () => {
    if (!editingGame) return;
    
    setIsSubmitting(true);
    try {
      await adminApi.updateGame(editingGame.id, {
        name: editGameName,
        open_time: editOpenTime,
        close_time: editCloseTime,
        working_days: editWorkingDays
      });
      showToast('Game updated successfully!', 'success');
      setEditingGame(null);
      refetchGames();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to update game', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'live': return 'success';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '--:--';
    try {
      // Handle time-only format (HH:MM:SS)
      if (time.includes(':') && !time.includes('T')) {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0, 0, 0);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
      const parsed = new Date(time);
      if (isNaN(parsed.getTime())) return '--:--';
      return parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return '--:--'; }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 text-gray-300 hover:text-white text-sm">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link href="/admin/contacts" className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 text-gray-300 hover:text-white text-sm">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Contacts</span>
              </Link>
              <button 
                onClick={logout}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all duration-300 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-400" />
              Add New Game
            </h2>
            <form onSubmit={handleAddGame} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Game Name</label>
                <input
                  type="text"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value.toUpperCase())}
                  placeholder="Enter game name (will be uppercase)"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Open Time</label>
                  <input
                    type="time"
                    value={newGameOpenTime}
                    onChange={(e) => setNewGameOpenTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Close Time</label>
                  <input
                    type="time"
                    value={newGameCloseTime}
                    onChange={(e) => setNewGameCloseTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                  <Plus className="w-4 h-4" />
                  Add Game
                </>}
              </button>
            </form>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Add Result
            </h2>
            <form onSubmit={handleAddResult} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Game</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  required
                >
                  <option value="" style={{ color: '#6b7280' }}>Select a game</option>
                  {[...games].sort((a, b) => {
                    const timeA = new Date(`2000-01-01 ${a.open_time}`).getTime();
                    const timeB = new Date(`2000-01-01 ${b.open_time}`).getTime();
                    return timeA - timeB;
                  }).map((game) => (
                    <option key={game.id} value={game.id} style={{ color: 'white', backgroundColor: '#1f2937' }}>{game.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Result</label>
                <input
                  type="text"
                  value={newResult}
                  onChange={(e) => setNewResult(e.target.value.toUpperCase())}
                  placeholder="XXX-X (e.g., 123-4)"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Result Date</label>
                <input
                  type="date"
                  value={newResultDate}
                  onChange={(e) => setNewResultDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Result Type</label>
                <select
                  value={resultType}
                  onChange={(e) => setResultType(e.target.value as 'open' | 'close')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                >
                  <option value="open" style={{ color: 'white', backgroundColor: '#1f2937' }}>Open Result</option>
                  <option value="close" style={{ color: 'white', backgroundColor: '#1f2937' }}>Close Result</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                >
                  <option value="live" style={{ color: 'white', backgroundColor: '#1f2937' }}>Live</option>
                  <option value="closed" style={{ color: 'white', backgroundColor: '#1f2937' }}>Closed</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                  <Plus className="w-4 h-4" />
                  Add Result
                </>}
              </button>
            </form>
          </div>
        </div>

        {/* All Games Section */}
        <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              All Games
            </h2>
            <button 
              onClick={refetchGames}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all duration-300 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          {gamesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : (
            <>
              {/* Mobile List View */}
              <div className="sm:hidden divide-y divide-white/5">
                {[...games].sort((a, b) => {
                  const timeA = new Date(`2000-01-01 ${a.open_time}`).getTime();
                  const timeB = new Date(`2000-01-01 ${b.open_time}`).getTime();
                  return timeA - timeB;
                }).map((game) => (
                  <div key={game.id} className="py-3 px-1 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">{game.name}</span>
                        {game.status === 'live' && (
                          <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{formatTime(game.open_time)} - {formatTime(game.close_time)}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button 
                        onClick={() => handleEditGame(game)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteGame(game.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">ID</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Open Time</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Close Time</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...games].sort((a, b) => {
                      const timeA = new Date(`2000-01-01 ${a.open_time}`).getTime();
                      const timeB = new Date(`2000-01-01 ${b.open_time}`).getTime();
                      return timeA - timeB;
                    }).map((game) => (
                      <tr key={game.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white">{game.id}</td>
                        <td className="py-3 px-4 font-medium text-white">{game.name}</td>
                        <td className="py-3 px-4 text-gray-300">{formatTime(game.open_time)}</td>
                        <td className="py-3 px-4 text-gray-300">{formatTime(game.close_time)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            game.status === 'live' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-white/10 text-gray-400 border border-white/10'
                          }`}>
                            {game.status || 'live'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEditGame(game)}
                              className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                              title="Edit Time"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteGame(game.id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* All Results Section */}
        <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All Results
            </h2>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <input
                type="date"
                value={resultDateFilter}
                onChange={(e) => setResultDateFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button 
                onClick={refetchResults}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all duration-300 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
          {resultsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : (
            <>
              {/* Mobile List View */}
              <div className="sm:hidden max-h-[60vh] overflow-y-auto divide-y divide-white/5">
                {[...results]
                  .filter(r => resultDateFilter ? r.result_date === resultDateFilter : true)
                  .sort((a, b) => {
                    const dateA = new Date(a.result_date).getTime();
                    const dateB = new Date(b.result_date).getTime();
                    if (dateB !== dateA) return dateB - dateA;
                    return b.id - a.id;
                  }).map((result) => (
                    <div key={result.id} className="py-3 px-1 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-white font-mono">{result.result}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            result.result_type === 'open' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : result.result_type === 'close'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {result.result_type?.toUpperCase() || 'BOTH'}
                          </span>
                          {result.status === 'live' && (
                            <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5 truncate">{result.game_name || `Game #${result.game_id}`} • {result.result_date}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteResult(result.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">ID</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Game</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Result</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...results]
                      .filter(r => resultDateFilter ? r.result_date === resultDateFilter : true)
                      .sort((a, b) => {
                      // First sort by date (newest first)
                      const dateA = new Date(a.result_date).getTime();
                      const dateB = new Date(b.result_date).getTime();
                      if (dateB !== dateA) return dateB - dateA;
                      // Then by ID (newest first)
                      return b.id - a.id;
                    }).map((result) => (
                      <tr key={result.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white">{result.id}</td>
                        <td className="py-3 px-4 text-gray-300">{result.game_name || `Game #${result.game_id}`}</td>
                        <td className="py-3 px-4 font-medium text-white">{result.result}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.result_type === 'open' 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                              : result.result_type === 'close'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {result.result_type?.toUpperCase() || 'BOTH'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{result.result_date}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.status === 'live' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-white/10 text-gray-400 border border-white/10'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => handleDeleteResult(result.id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Edit Game Modal */}
        {editingGame && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md mx-0 sm:mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Edit Game</h3>
                <button
                  onClick={() => setEditingGame(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-400 mb-6">Editing: <span className="text-white font-medium">{editingGame.name}</span></p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Game Name</label>
                  <input
                    type="text"
                    value={editGameName}
                    onChange={(e) => setEditGameName(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Open Time</label>
                  <input
                    type="time"
                    value={editOpenTime}
                    onChange={(e) => setEditOpenTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Close Time</label>
                  <input
                    type="time"
                    value={editCloseTime}
                    onChange={(e) => setEditCloseTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Working Days/Week</label>
                  <select
                    value={editWorkingDays}
                    onChange={(e) => setEditWorkingDays(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  >
                    <option value={5} style={{ color: 'white', backgroundColor: '#1f2937' }}>5 Days (Mon-Fri)</option>
                    <option value={6} style={{ color: 'white', backgroundColor: '#1f2937' }}>6 Days (Mon-Sat)</option>
                    <option value={7} style={{ color: 'white', backgroundColor: '#1f2937' }}>7 Days (All Days)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingGame(null)}
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateGameTime}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
