'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWarStore } from '@/store/useWarStore';
import { formatCasualties, formatYear, TYPE_COLORS } from '@/lib/utils';

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Dossier() {
  const { selectedWar, selectWar, comparedWars, toggleCompareWar, updateWar } = useWarStore();
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    setActivePhaseId(null);
    
    async function fetchFullWar() {
      if (selectedWar && !selectedWar.description) {
        setIsLoadingDetails(true);
        try {
          const res = await fetch(`/api/wars/${selectedWar.id}`);
          if (res.ok) {
            const fullData = await res.json();
            updateWar(selectedWar.id, fullData);
            selectWar(fullData);
          }
        } catch (err) {
          console.error('Failed to load full war details:', err);
        } finally {
          setIsLoadingDetails(false);
        }
      }
    }
    
    fetchFullWar();
  }, [selectedWar, selectWar, updateWar]);

  return (
    <AnimatePresence>
      {selectedWar && (
        <>
          {/* Subtle backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => selectWar(null)}
            className="fixed inset-0 z-[60] bg-black/20"
          />

          {/* Editorial Archival Panel */}
          <motion.div
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed right-0 top-0 h-full z-[70] w-[480px] bg-[#1a1a1c] border-l border-[#e6e4df]/10 overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#1a1a1c]/95 backdrop-blur-xl z-10 px-10 pt-10 pb-6 border-b border-[#e6e4df]/10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-[10px] tracking-widest text-[#c9a270] uppercase">
                      Archival Record · {selectedWar.type}
                    </p>
                    <button
                      onClick={() => toggleCompareWar(selectedWar)}
                      className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded transition-colors ${
                        comparedWars.some(w => w.id === selectedWar.id)
                          ? 'bg-[#c9a270]/20 border-[#c9a270] text-[#c9a270]'
                          : 'border-[#e6e4df]/20 text-[#9a9996] hover:border-[#c9a270]/50 hover:text-[#c9a270]'
                      }`}
                    >
                      {comparedWars.some(w => w.id === selectedWar.id) ? 'Pinned' : 'Pin to Compare'}
                    </button>
                  </div>
                  <h2 
                    className="font-headline text-3xl leading-tight"
                    style={{ color: TYPE_COLORS[selectedWar.type] || '#e6e4df' }}
                  >
                    {selectedWar.name}
                  </h2>
                </div>
                <button
                  onClick={() => selectWar(null)}
                  className="p-2 text-[#9a9996] hover:text-[#e6e4df] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#e6e4df]/5">
                <div>
                  <p className="text-[9px] text-[#9a9996] uppercase tracking-widest mb-1">
                    Duration
                  </p>
                  <p className="font-headline text-lg text-[#e6e4df]">
                    {formatYear(selectedWar.startYear)} – {formatYear(selectedWar.endYear)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-[#9a9996] uppercase tracking-widest mb-1">
                    Est. Casualties
                  </p>
                  <p className="font-headline text-lg text-[#d15c5c]">
                    {formatCasualties(selectedWar.casualties)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-[#9a9996] uppercase tracking-widest mb-1">
                    Nations Engaged
                  </p>
                  <p className="font-headline text-lg text-[#e6e4df]">
                    {selectedWar.countries.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Content body */}
            <motion.div 
              className="px-10 py-8 space-y-10"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              
              {isLoadingDetails ? (
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-20 opacity-50">
                  <div className="w-6 h-6 border-2 border-[#c9a270] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs text-[#9a9996] uppercase tracking-widest animate-pulse">Retrieving Archival Records...</p>
                </motion.div>
              ) : (
                <>
                  {/* Overview */}
                  {selectedWar.description && (
                    <motion.div variants={itemVariants}>
                      <h3 className="text-xs text-[#9a9996] tracking-widest uppercase mb-4 flex items-center gap-2">
                        <BookOpen size={14} className="text-[#c9a270]" />
                        Historical Overview
                      </h3>
                      <p className="text-base text-[#e6e4df] leading-relaxed font-light">
                        {selectedWar.description}
                      </p>
                    </motion.div>
                  )}

                  {/* Belligerents */}
                  {selectedWar.belligerents && (
                    <motion.div variants={itemVariants}>
                      <h3 className="text-xs text-[#9a9996] tracking-widest uppercase mb-4 flex items-center gap-2">
                        <Users size={14} className="text-[#c9a270]" />
                        Primary Factions
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-headline text-lg text-[#e6e4df] mb-3 pb-2 border-b border-[#e6e4df]/10">
                            Combatant A
                          </h4>
                          <ul className="space-y-2">
                            {selectedWar.belligerents.allies.map((a, i) => (
                              <li key={i} className="text-sm text-[#9a9996] font-light">
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-headline text-lg text-[#e6e4df] mb-3 pb-2 border-b border-[#e6e4df]/10">
                            Combatant B
                          </h4>
                          <ul className="space-y-2">
                            {selectedWar.belligerents.adversaries.map((a, i) => (
                              <li key={i} className="text-sm text-[#9a9996] font-light">
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Countries mapped */}
                  <motion.div variants={itemVariants}>
                    <h3 className="text-xs text-[#9a9996] tracking-widest uppercase mb-4 flex items-center gap-2">
                      <MapPin size={14} className="text-[#c9a270]" />
                      Geographic Theater
                    </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWar.countries.map((c) => (
                    <span
                      key={c}
                      className="text-xs text-[#9a9996] px-3 py-1.5 border border-[#e6e4df]/10 rounded-full"
                    >
                      {c}
                    </span>
                  ))}
                    </div>
                  </motion.div>

                  {/* Strategic Outcome */}
                  {selectedWar.outcome && (
                    <motion.div variants={itemVariants}>
                      <h3 className="text-xs text-[#9a9996] tracking-widest uppercase mb-4 pb-2 border-b border-[#e6e4df]/10">
                        Strategic Resolution
                      </h3>
                      <p className="text-base text-[#c9a270] leading-relaxed italic font-headline">
                        "{selectedWar.outcome}"
                      </p>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
