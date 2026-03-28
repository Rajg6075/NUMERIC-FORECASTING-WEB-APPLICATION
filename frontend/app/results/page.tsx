'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { resultsApi, gamesApi, Result, Game } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Loader2, RefreshCw, ArrowLeft } from 'lucide-react';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [gamesRes, resultsRes] = await Promise.all([
        gamesApi.getAll(),
        resultsApi.getAll(selectedGame || undefined)
      ]);
      setGames(gamesRes.data);
      setResults(resultsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [selectedGame]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredResults = results.filter(result => {
    if (selectedDate) {
      const resultDate = new Date(result.result_date).toISOString().split('T')[0];
      if (resultDate !== selectedDate) return false;
    }
    return true;
  });

  const getStatusVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'live': return 'success';
      case 'waiting': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch { return dateStr; }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '--:--';
    try {
      // Handle time-only format (HH:MM:SS)
      if (dateStr.includes(':') && !dateStr.includes('T')) {
        const [hours, minutes] = dateStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0, 0, 0);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return '--:--';
      return parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return '--:--'; }
  };

  const clearFilters = () => {
    setSelectedGame('');
    setSelectedDate('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Results</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchData()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <Link href="/admin/login" className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </Link>
        </div>

        <Card className="mb-6 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Game
                </label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Games</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="dark:text-white">Results</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && results.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No results found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="dark:text-gray-300">Game</TableHead>
                      <TableHead className="dark:text-gray-300">Result</TableHead>
                      <TableHead className="dark:text-gray-300">Date</TableHead>
                      <TableHead className="dark:text-gray-300">Status</TableHead>
                      <TableHead className="dark:text-gray-300">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell className="font-medium dark:text-white">{result.game_name || `Game #${result.game_id}`}</TableCell>
                        <TableCell className="font-semibold dark:text-white">{result.result}</TableCell>
                        <TableCell className="dark:text-gray-300">{formatDate(result.result_date)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(result.status)}>{result.status}</Badge>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">{formatTime(result.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
