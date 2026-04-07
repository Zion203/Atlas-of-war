'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useWarStore } from '@/store/useWarStore';
import { NARRATIVES } from '@/data/narratives';
import { formatYear } from '@/lib/utils';
import type { Narrative } from '@/lib/types';

export default function NarrativePanel() {
  const { 
    isNarrativesMenuOpen, 
    setNarrativesMenuOpen, 
    activeNarrative, 
    setActiveNarrative,
    narrativeStepIndex,
    setNarrativeStepIndex,
    setYear,
    selectWar
  } = useWarStore();

  // Sync year and globe focus when step changes
  useEffect(() => {
    if (activeNarrative) {
      const step = activeNarrative.steps[narrativeStepIndex];
      if (step) {
        setYear(step.year);
        // Clear active war detail so the narrative takes focus
        selectWar(null); 
        
        if (step.lat && step.lng) {
          window.dispatchEvent(
            new CustomEvent('globe-focus', {
              detail: { lat: step.lat, lng: step.lng, altitude: 0.8 }
            })
          );
        }
      }
    }
  }, [activeNarrative, narrativeStepIndex, setYear, selectWar]);

  const startNarrative = (n: Narrative) => {
    setNarrativesMenuOpen(false);
    setActiveNarrative(n);
    setNarrativeStepIndex(0);
  };

  const closeNarrative = () => {
    setActiveNarrative(null);
    setNarrativeStepIndex(0);
  };

  return (
    <>
      {/* 1. Narrative Selection Menu */}
      <AnimatePresence>
        {isNarrativesMenuOpen && !activeNarrative && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed left-10 top-24 bottom-10 z-[60] w-96 flex flex-col bg-[#1a1a1c]/95 backdrop-blur-xl border border-[#e6e4df]/10 shadow-2xl overflow-hidden rounded-md"
          >
            <div className="p-6 border-b border-[#e6e4df]/10 flex justify-between items-center bg-[#111112]">
              <div>
                <h2 className="font-headline text-2xl text-[#e6e4df] tracking-wide">Storylines</h2>
                <p className="text-[10px] text-[#9a9996] uppercase tracking-widest mt-1">Guided Historical Tours</p>
              </div>
              <button
                onClick={() => setNarrativesMenuOpen(false)}
                className="text-[#9a9996] hover:text-[#e6e4df] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {NARRATIVES.map((narrative) => (
                <div 
                  key={narrative.id}
                  className="p-5 border border-[#e6e4df]/10 bg-[#111112]/50 hover:bg-[#c9a270]/5 hover:border-[#c9a270]/50 transition-all cursor-pointer group"
                  onClick={() => startNarrative(narrative)}
                >
                  <h3 className="text-[#e6e4df] font-headline text-lg mb-2 group-hover:text-[#c9a270] transition-colors">
                    {narrative.title}
                  </h3>
                  <p className="text-xs text-[#9a9996] leading-relaxed mb-4">
                    {narrative.description}
                  </p>
                  <div className="flex items-center text-[10px] text-[#c9a270] uppercase tracking-widest font-medium">
                    <Play size={12} className="mr-2" />
                    Begin Journey ({narrative.steps.length} Chapters)
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Active Narrative Player Overhead / Overlay */}
      <AnimatePresence>
        {activeNarrative && (
          <motion.footer
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full z-50 px-10 pb-8 pointer-events-none"
          >
            <div className="editorial-panel pointer-events-auto rounded-full px-8 py-4 mx-auto max-w-5xl flex items-center justify-between gap-8 h-24 relative overflow-hidden">
              
              {/* Progress Bar Top Edge */}
              <div className="absolute top-0 left-0 h-1 w-full bg-[#111112]">
                <motion.div 
                  className="h-full bg-[#c9a270]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((narrativeStepIndex + 1) / activeNarrative.steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Step Tracking & Content */}
              <div className="flex-1 flex flex-col justify-center max-w-2xl mt-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-[9px] text-[#c9a270] uppercase tracking-widest font-bold">
                    Chapter {narrativeStepIndex + 1} of {activeNarrative.steps.length}
                  </p>
                  <p className="text-[10px] text-[#9a9996] uppercase tracking-widest font-mono border-l border-[#e6e4df]/20 pl-3">
                    {formatYear(activeNarrative.steps[narrativeStepIndex].year)}
                  </p>
                </div>
                <h2 className="font-headline text-2xl text-[#e6e4df] truncate">
                  {activeNarrative.steps[narrativeStepIndex].title}
                </h2>
                <p className="text-xs text-[#9a9996] mt-1 truncate">
                  {activeNarrative.steps[narrativeStepIndex].description}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setNarrativeStepIndex(Math.max(0, narrativeStepIndex - 1))}
                  disabled={narrativeStepIndex === 0}
                  className="p-2 text-[#e6e4df] disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#c9a270] hover:bg-[#c9a270]/10 rounded-full transition-colors flex items-center justify-center border border-transparent hover:border-[#c9a270]/20"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1.5 items-center">
                  {activeNarrative.steps.map((_: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === narrativeStepIndex ? 'bg-[#c9a270] w-6' : 'bg-[#e6e4df]/10 w-2'}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (narrativeStepIndex < activeNarrative.steps.length - 1) {
                      setNarrativeStepIndex(narrativeStepIndex + 1);
                    } else {
                      closeNarrative();
                    }
                  }}
                  className="p-2 text-[#e6e4df] hover:text-[#c9a270] hover:bg-[#c9a270]/10 rounded-full transition-colors flex items-center justify-center border border-transparent hover:border-[#c9a270]/20"
                >
                  <ChevronRight size={20} />
                </button>

                <div className="w-px h-8 bg-[#e6e4df]/10 mx-2" />
                
                <button
                  onClick={closeNarrative}
                  className="text-[9px] uppercase tracking-widest px-3 py-2 border border-[#d15c5c]/30 text-[#d15c5c] hover:bg-[#d15c5c]/10 rounded transition-colors flex flex-col items-center"
                >
                  <span className="font-bold">Exit</span>
                </button>
              </div>

            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </>
  );
}
