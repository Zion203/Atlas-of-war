'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useWarStore } from '@/store/useWarStore';
import { formatCasualties } from '@/lib/utils';
import type { WarType, WarEra } from '@/lib/types';

export default function AnalyticsPanel() {
  const { wars, isAnalyticsOpen, setAnalyticsOpen } = useWarStore();

  // Analytics Calculations
  const totalWars = wars.length;
  const totalCasualties = wars.reduce((sum, w) => sum + w.casualties, 0);

  // Casualties by Era
  const casualtiesByEra = wars.reduce((acc, war) => {
    acc[war.era] = (acc[war.era] || 0) + war.casualties;
    return acc;
  }, {} as Record<WarEra, number>);

  const eras: WarEra[] = ['ancient', 'medieval', 'colonial', 'modern'];
  const maxEraCasualties = Math.max(...Object.values(casualtiesByEra), 1);

  // Wars by Type
  const warsByType = wars.reduce((acc, war) => {
    acc[war.type] = (acc[war.type] || 0) + 1;
    return acc;
  }, {} as Record<WarType, number>);

  const types: WarType[] = ['world', 'civil', 'colonial', 'regional'];
  const maxTypeCount = Math.max(...Object.values(warsByType), 1);

  return (
    <AnimatePresence>
      {isAnalyticsOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#111112]/80 backdrop-blur-3xl overflow-hidden p-10"
        >
          <div className="w-full max-w-6xl flex flex-col gap-8">
            <div className="flex justify-between items-center px-10 py-8 border border-[#e6e4df]/10 bg-[#1a1a1c]/50 rounded-lg">
              <div>
                <h2 className="font-headline text-4xl text-[#e6e4df] tracking-wide relative inline-block">
                  Macro Trends
                </h2>
                <p className="text-[10px] text-[#9a9996] uppercase tracking-widest mt-1">
                  Data Aggregation & Analysis
                </p>
              </div>
              <button
                onClick={() => setAnalyticsOpen(false)}
                className="p-2 text-[#9a9996] hover:text-[#e6e4df] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12 bg-[#1a1a1c]/50 rounded-lg border border-[#e6e4df]/10">
              {/* Summary Column */}
              <div className="flex flex-col justify-center space-y-8">
                <div>
                  <p className="text-[10px] text-[#9a9996] uppercase tracking-widest mb-2">Total Conflicts</p>
                  <p className="font-headline text-5xl text-[#e6e4df]">{totalWars}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#9a9996] uppercase tracking-widest mb-2">Est. Global Casualties</p>
                  <p className="font-headline text-4xl text-[#d15c5c]">{formatCasualties(totalCasualties)}</p>
                </div>
              </div>

              {/* Casualties by Era */}
              <div className="md:col-span-2">
                <h3 className="text-[10px] text-[#9a9996] uppercase tracking-widest mb-6">Casualties by Era</h3>
                <div className="space-y-4">
                  {eras.map((era) => {
                    const count = casualtiesByEra[era] || 0;
                    const percentage = (count / maxEraCasualties) * 100;
                    return (
                      <div key={era} className="relative">
                        <div className="flex justify-between text-xs text-[#e6e4df] mb-1">
                          <span className="uppercase tracking-widest">{era}</span>
                          <span className="font-mono text-[#c9a270]">{formatCasualties(count)}</span>
                        </div>
                        <div className="h-1 bg-[#e6e4df]/10 w-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#c9a270]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Conflicts by Type (Bottom row) */}
            <div className="px-8 pb-8 pt-6 border border-[#e6e4df]/10 bg-[#1a1a1c]/50 rounded-lg">
              <h3 className="text-[10px] text-[#9a9996] uppercase tracking-widest mb-6">Conflict Frequency by Type</h3>
              <div className="grid grid-cols-4 gap-4 h-32 items-end pb-6 relative">
                {/* Background grid lines */}
                <div className="absolute inset-0 border-b border-[#e6e4df]/10 pointer-events-none" />
                
                {types.map(type => {
                  const count = warsByType[type] || 0;
                  const heightPct = count === 0 ? 0 : (count / maxTypeCount) * 100;

                  return (
                    <div key={type} className="flex flex-col items-center justify-end h-full gap-2 relative group">
                      <span className="absolute -top-6 text-[10px] text-[#e6e4df] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        {count}
                      </span>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="w-full bg-[#e6e4df]/20 hover:bg-[#c9a270]/60 transition-colors border-t border-[#c9a270]/40"
                        style={{ minHeight: count > 0 ? '4px' : '0' }}
                      />
                      <span className="text-[9px] text-[#9a9996] uppercase tracking-widest mt-2">{type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
