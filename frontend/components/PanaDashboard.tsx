'use client';

import { useState, useMemo } from 'react';

const generateAllPana = (): string[] => {
  const panaList: string[] = [];
  const digitOrder = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  for (let i = 0; i < digitOrder.length; i++) {
    for (let j = i; j < digitOrder.length; j++) {
      for (let k = j; k < digitOrder.length; k++) {
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
  const allPana = generateAllPana();
  const filtered = allPana.filter(p => getDigitSum(p) === digit);
  
  // Add all triple pana (111, 222, ..., 000) to appropriate cards based on digit sum
  const triples = ['111', '222', '333', '444', '555', '666', '777', '888', '999', '000'];
  triples.forEach(triple => {
    const tripleSum = getDigitSum(triple);
    if (tripleSum === digit && !filtered.includes(triple)) {
      filtered.push(triple);
    }
  });
  
  // Sort: single pana first, then double, then triple
  const singlePana: string[] = [];
  const doublePana: string[] = [];
  const triplePana: string[] = [];
  
  filtered.forEach(p => {
    const digits = p.split('');
    const uniqueDigits = new Set(digits);
    if (uniqueDigits.size === 3) {
      singlePana.push(p);
    } else if (uniqueDigits.size === 2) {
      doublePana.push(p);
    } else {
      triplePana.push(p);
    }
  });
  
  return [...singlePana.sort(), ...doublePana.sort(), ...triplePana.sort()];
};

const numberColors: Record<number, { bg: string; border: string; accent: string; gradient: string }> = {
  1: { bg: 'from-red-600/20', border: 'border-red-500/30', accent: 'text-red-300', gradient: 'from-red-500 to-rose-600' },
  2: { bg: 'from-orange-600/20', border: 'border-orange-500/30', accent: 'text-orange-300', gradient: 'from-orange-500 to-amber-600' },
  3: { bg: 'from-yellow-600/20', border: 'border-yellow-500/30', accent: 'text-yellow-300', gradient: 'from-yellow-500 to-orange-600' },
  4: { bg: 'from-green-600/20', border: 'border-green-500/30', accent: 'text-green-300', gradient: 'from-green-500 to-emerald-600' },
  5: { bg: 'from-teal-600/20', border: 'border-teal-500/30', accent: 'text-teal-300', gradient: 'from-teal-500 to-cyan-600' },
  6: { bg: 'from-cyan-600/20', border: 'border-cyan-500/30', accent: 'text-cyan-300', gradient: 'from-cyan-500 to-sky-600' },
  7: { bg: 'from-blue-600/20', border: 'border-blue-500/30', accent: 'text-blue-300', gradient: 'from-blue-500 to-indigo-600' },
  8: { bg: 'from-indigo-600/20', border: 'border-indigo-500/30', accent: 'text-indigo-300', gradient: 'from-indigo-500 to-violet-600' },
  9: { bg: 'from-violet-600/20', border: 'border-violet-500/30', accent: 'text-violet-300', gradient: 'from-violet-500 to-purple-600' },
  0: { bg: 'from-gray-600/20', border: 'border-gray-500/30', accent: 'text-gray-300', gradient: 'from-gray-500 to-slate-600' },
};

export default function PanaDashboard() {
  const [expandedNumber, setExpandedNumber] = useState<number | null>(null);

  const panaData = useMemo(() => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      number: i,
      pana: getPanaForDigit(i),
    }));
    // Sort: 1-9 first, then 0 last
    return data.sort((a, b) => {
      if (a.number === 0) return 1;
      if (b.number === 0) return -1;
      return a.number - b.number;
    });
  }, []);

  return (
    <div className="mt-8 sm:mt-12 pt-8 border-t border-gray-200 dark:border-white/10">
      {/* Section Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
          PANA DASHBOARD
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">Browse all pana numbers by digit</p>
      </div>

      {/* Number Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {panaData.map((group) => {
          const colors = numberColors[group.number];
          const isExpanded = expandedNumber === group.number;

          return (
            <div
              key={group.number}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} to-transparent border ${colors.border} backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-${colors.accent.split('-')[1]}-500/10`}
            >
              {/* Gradient Accent Bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />

              {/* Card Header */}
              <button
                onClick={() => setExpandedNumber(isExpanded ? null : group.number)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-lg font-bold text-white">{group.number}</span>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold ${colors.accent}`}>Number {group.number}</p>
                    <p className="text-xs text-gray-500">{group.pana.length} pana</p>
                  </div>
                </div>
              </button>

              {/* Pana Grid - Always visible */}
              <div className="px-4 pb-4">
                <div className="grid grid-cols-4 gap-1.5">
                  {group.pana.slice(0, isExpanded ? group.pana.length : 12).map((pana) => (
                    <button
                      key={pana}
                      className="py-1.5 px-1 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-110 bg-white/10 text-gray-300 hover:bg-white/20"
                    >
                      {pana}
                    </button>
                  ))}
                </div>
                {group.pana.length > 12 && !isExpanded && (
                  <button
                    onClick={() => setExpandedNumber(group.number)}
                    className="w-full mt-2 py-1 text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    +{group.pana.length - 12} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
