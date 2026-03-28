'use client';

import { useState, useEffect, useCallback } from 'react';
import { gamesApi, resultsApi, Game, Result } from '@/services/api';

export function useGames(refreshInterval = 5000) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      const response = await gamesApi.getAll();
      setGames(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch games');
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchGames, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchGames, refreshInterval]);

  return { games, loading, error, refetch: fetchGames };
}

export function useResults(gameId?: number, refreshInterval = 5000) {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      let response;
      if (gameId) {
        response = await resultsApi.getByGameId(gameId);
      } else {
        response = await resultsApi.getAll();
      }
      setResults(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch results');
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchResults();
    
    if (refreshInterval > 0 && gameId) {
      const interval = setInterval(fetchResults, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchResults, refreshInterval, gameId]);

  return { results, loading, error, refetch: fetchResults };
}
