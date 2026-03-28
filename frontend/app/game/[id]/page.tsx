'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { resultsApi, gamesApi, Result, Game } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = Number(params.id);
  const [results, setResults] = useState<Result[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getStatusVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return 'success';
      case 'waiting':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Game Details</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <Link 
                href="/admin/login" 
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </Link>
        </div>

        {/* Game Info Card */}
        {game && (
          <Card className="mb-6 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">{game.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open Time</p>
                  <p className="font-medium dark:text-white">{formatTime(game.open_time)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Close Time</p>
                  <p className="font-medium dark:text-white">{formatTime(game.close_time)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Latest Result</p>
                  <p className="font-semibold text-lg dark:text-white">{game.latest_result || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <Badge variant={getStatusVariant(game.status)}>{game.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Card */}
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">See Older Results</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && results.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No results found for this game.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="dark:text-gray-300">Date</TableHead>
                      <TableHead className="dark:text-gray-300">Result</TableHead>
                      <TableHead className="dark:text-gray-300">Status</TableHead>
                      <TableHead className="dark:text-gray-300">Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell className="font-medium dark:text-white">
                          {formatDate(result.result_date)}
                        </TableCell>
                        <TableCell className="font-semibold dark:text-white">{result.result}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(result.status)}>
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {formatTime(result.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Floating Refresh Button - Opposite to Contact Us */}
      <button
        onClick={handleRefresh}
        className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-green-500/30 transition-all duration-300 z-50 group"
        title="Refresh"
      >
        <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="absolute -top-12 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Refresh
        </span>
      </button>
    </div>
  );
}
