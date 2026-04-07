'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useWarStore } from '@/store/useWarStore';
import { formatCasualties, formatYear } from '@/lib/utils';

// We'll use distinct colors for the compared wars purely for the UI matrix.
const COMPARE_COLORS = ['#d15c5c', '#c9a270', '#5c9bd1', '#85b37e'];

export default function ComparisonView() {
  const { comparedWars, toggleCompareWar, clearComparison } = useWarStore();
  const [isMinimized, setIsMinimized] = useState(false);

  if (comparedWars.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isMinimized ? 'calc(100% - 48px)' : 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 w-full z-[80] bg-[#1a1a1c]/95 backdrop-blur-xl border-t border-[#e6e4df]/10 flex flex-col shadow-2xl"
        style={{ height: '40vh', minHeight: '300px' }}
      >
        {/* Header bar */}
        <div className="h-12 border-b border-[#e6e4df]/10 px-10 flex items-center justify-between flex-shrink-0 bg-[#111112]">
          <div className="flex items-center gap-4">
            <h3 className="text-xs text-[#e6e4df] tracking-widest uppercase font-medium">
              Multi-Conflict Analysis
            </h3>
            <span className="text-[10px] text-[#9a9996] py-0.5 px-2 bg-[#e6e4df]/5 rounded font-mono">
              {comparedWars.length}/4 PINNED
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-[#9a9996] hover:text-[#e6e4df] transition-colors text-xs flex items-center gap-1 uppercase tracking-widest"
            >
              {isMinimized ? <><ChevronUp size={14} /> Expand</> : <><ChevronDown size={14} /> Minimize</>}
            </button>
            <div className="w-px h-4 bg-[#e6e4df]/20" />
            <button
              onClick={clearComparison}
              className="text-[#d15c5c] hover:text-[#ff7878] transition-colors text-[10px] uppercase tracking-widest font-medium"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden flex p-6 gap-6 scrollbar-hide">
          {comparedWars.map((war, i) => (
            <div
              key={war.id}
              className="flex-1 min-w-[300px] border border-[#e6e4df]/10 rounded bg-[#111112]/50 flex flex-col relative"
            >
              {/* Card Header */}
              <div 
                className="p-4 border-b border-[#e6e4df]/10"
                style={{ borderTop: `2px solid ${COMPARE_COLORS[i]}` }}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-headline text-xl text-[#e6e4df] leading-tight pr-4">
                    {war.name}
                  </h4>
                  <button
                    onClick={() => toggleCompareWar(war)}
                    className="text-[#9a9996] hover:text-[#d15c5c] transition-colors p-1"
                    title="Remove from comparison"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-[#c9a270] uppercase tracking-widest font-mono mt-2">
                  {formatYear(war.startYear)} – {formatYear(war.endYear)} ({war.type})
                </p>
              </div>

              {/* Card Body Matrix */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                <div>
                  <span className="text-[9px] text-[#9a9996] uppercase tracking-widest block mb-1">
                    Est. Casualties
                  </span>
                  <span className="text-[#e6e4df] font-mono">{formatCasualties(war.casualties)}</span>
                </div>
                
                <div>
                  <span className="text-[9px] text-[#9a9996] uppercase tracking-widest block mb-1">
                    Combatants
                  </span>
                  <div className="space-y-2">
                    <p className="text-[#e6e4df] text-xs">
                      <span className="opacity-50">Faction A:</span> {war.belligerents?.allies?.join(', ') || 'N/A'}
                    </p>
                    <p className="text-[#e6e4df] text-xs">
                      <span className="opacity-50">Faction B:</span> {war.belligerents?.adversaries?.join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-[#9a9996] uppercase tracking-widest block mb-1">
                    Theatres ({war.countries.length})
                  </span>
                  <p className="text-[#e6e4df] text-xs opacity-70">
                    {war.countries.join(', ')}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] text-[#9a9996] uppercase tracking-widest block mb-1">
                    Resolution
                  </span>
                  <p className="text-[#e6e4df] text-xs font-headline italic">
                    "{war.outcome || 'Strategic details pending archival retrieval...'}"
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: 4 - comparedWars.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex-1 min-w-[300px] border border-dashed border-[#e6e4df]/10 rounded flex items-center justify-center opacity-50"
            >
              <p className="text-xs text-[#9a9996] font-mono uppercase tracking-widest">
                Empty Slot
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
