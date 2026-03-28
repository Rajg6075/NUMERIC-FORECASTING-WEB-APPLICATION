'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, MessageCircle } from 'lucide-react';
import { Game } from '@/services/api';

interface GuessingData {
  gameId: number;
  name: string;
  openAnk: string[];
  pana: string[];
  jodi: string[];
  isRevealed: boolean;
}

const generateAllPana = (): string[] => {
  const panaList: string[] = [];
  const digitOrder = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  for (let i = 0; i < digitOrder.length; i++) {
    for (let j = i; j < digitOrder.length; j++) {
      for (let k = j; k < digitOrder.length; k++) {
        if (digitOrder[i] === digitOrder[j] && digitOrder[j] === digitOrder[k]) continue;
        panaList.push(`${digitOrder[i]}${digitOrder[j]}${digitOrder[k]}`);
      }
    }
  }
  return panaList;
};

const getDigitSum = (num: string): number => {
  return num.split('').reduce((acc, digit) => acc + parseInt(digit), 0) % 10;
};

const getPanaForDigit = (digit: number): string[] => {
  return generateAllPana().filter(p => getDigitSum(p) === digit);
};

const generateJodi = (openAnk: string[]): string[] => {
  const jodiSet = new Set<string>();
  openAnk.forEach(a => openAnk.forEach(b => { if (a !== b) jodiSet.add(`${a}${b}`); }));
  return Array.from(jodiSet).sort();
};

const getTodayKey = (): string => new Date().toISOString().split('T')[0];

const generateGuessingData = (games: Game[]): GuessingData[] => {
  const cacheKey = `guessing_${getTodayKey()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Sort by game order in games array and use current game names
      const sortedParsed = [...parsed].sort((a, b) => {
        const idxA = games.findIndex(g => g.id === a.gameId);
        const idxB = games.findIndex(g => g.id === b.gameId);
        return idxA - idxB;
      });
      if (sortedParsed.length === games.length) {
        // Update names from current games array to reflect any name changes
        return sortedParsed.map((g: GuessingData) => {
          const currentGame = games.find(game => game.id === g.gameId);
          return { ...g, name: currentGame?.name || g.name, isRevealed: isAfter6AM() };
        });
      }
    } catch (e) {}
  }
  
  const data = games.map(game => {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].sort(() => Math.random() - 0.5);
    const openAnk = digits.slice(0, 4);
    const pana: string[] = [];
    openAnk.forEach(ank => {
      const shuffled = getPanaForDigit(parseInt(ank)).sort(() => Math.random() - 0.5);
      pana.push(...shuffled.slice(0, 3));
    });
    const jodi = generateJodi(openAnk).slice(0, 8);
    return { gameId: game.id, name: game.name, openAnk, pana, jodi, isRevealed: false };
  });
  
  try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
  return data;
};

const isAfter6AM = (): boolean => {
  const now = new Date();
  return (now.getUTCHours() + 5.5) % 24 >= 6;
};

interface FreeGuessingDailyProps {
  games: Game[];
}

export default function FreeGuessingDaily({ games }: FreeGuessingDailyProps) {
  const [guessingData, setGuessingData] = useState<GuessingData[]>([]);
  const [isAllRevealed, setIsAllRevealed] = useState(false);

  useEffect(() => {
    if (games.length > 0) {
      // Sort games by open_time
      const sortedGames = [...games].sort((a, b) => {
        const timeA = new Date(`2000-01-01 ${a.open_time}`).getTime();
        const timeB = new Date(`2000-01-01 ${b.open_time}`).getTime();
        return timeA - timeB;
      });
      
      // Clear old cache if game order changed
      const cacheKey = `guessing_${getTodayKey()}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Check if order matches
          const cacheOrder = parsed.map((g: GuessingData) => g.gameId);
          const currentOrder = sortedGames.map(g => g.id);
          const orderMatch = cacheOrder.every((id: number, idx: number) => id === currentOrder[idx]);
          if (!orderMatch) {
            localStorage.removeItem(cacheKey);
          }
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }
      
      const shouldReveal = isAfter6AM();
      const data = generateGuessingData(sortedGames);
      setGuessingData(data.map(g => ({ ...g, isRevealed: shouldReveal })));
      setIsAllRevealed(shouldReveal);
    }
  }, [games]);

  const toggleReveal = useCallback((index: number) => {
    setGuessingData(prev => prev.map((g, i) => i === index ? { ...g, isRevealed: !g.isRevealed } : g));
  }, []);

  const revealAll = useCallback(() => {
    setGuessingData(prev => prev.map(g => ({ ...g, isRevealed: true })));
    setIsAllRevealed(true);
  }, []);

  const hideAll = useCallback(() => {
    setGuessingData(prev => prev.map(g => ({ ...g, isRevealed: false })));
    setIsAllRevealed(false);
  }, []);

  if (games.length === 0) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="mt-8 sm:mt-12">
      <div className="mb-4 sm:mb-6 text-center">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">FREE GUESSING DAILY</h2>
          <p className="text-xs sm:text-sm text-gray-400">{today} • OPEN TO CLOSE FIX ANK</p>
        </div>
      </div>

      {/* Gradient Strip Design */}
      <div className="space-y-3 sm:space-y-4">
        {guessingData.map((game, index) => (
          <div key={game.gameId} className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden">
            {/* Header with gradient strip */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{game.name}</h3>
                  <p className="text-xs text-gray-400 hidden sm:block">{today}</p>
                </div>
              </div>
            </div>

            {/* Gradient Strip Design - Single Horizontal Strip */}
            <div className="p-2 sm:p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                {/* Ank Strip - Green */}
                <div className="flex-1 relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-green-500/10 to-transparent" />
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-green-600" />
                  <div className="relative p-2 pl-3">
                    <p className="text-xs text-green-400 mb-1 font-medium">ANK</p>
                    <div className="flex gap-1">
                      {game.openAnk.map((a, i) => (
                        <span key={i} className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-green-500/30 border border-green-500/50 text-green-300 font-bold text-xs rounded">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Jodi Strip - Purple */}
                <div className="flex-1 md:flex-[2] relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-transparent" />
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-600" />
                  <div className="relative p-2 pl-3">
                    <p className="text-xs text-purple-400 mb-1 font-medium">JODI</p>
                    <div className="flex flex-wrap gap-1">
                      {game.jodi.map((j, i) => (
                        <span key={i} className="px-1 py-0.5 bg-purple-500/30 border border-purple-500/50 text-purple-300 text-xs rounded">
                          {j}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pana Strip - Blue */}
                <div className="flex-1 md:flex-[3] relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent" />
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600" />
                  <div className="relative p-2 pl-3">
                    <p className="text-xs text-blue-400 mb-1 font-medium">PANA</p>
                    <div className="flex flex-wrap gap-1">
                      {game.pana.map((p, i) => (
                        <span key={i} className="px-1 py-0.5 bg-blue-500/30 border border-blue-500/50 text-blue-300 text-xs rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
