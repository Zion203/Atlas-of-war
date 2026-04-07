'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, ArrowRight, MapPin } from 'lucide-react';
import { useWarStore } from '@/store/useWarStore';
import { formatCasualties, formatYear, TYPE_COLORS } from '@/lib/utils';
import type { War } from '@/lib/types';

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function CountryProfile() {
  const { selectedCountry, selectCountry, selectWar, setYear } = useWarStore();

  if (!selectedCountry) return null;

  const totalCasualties = selectedCountry.wars.reduce((acc, w) => acc + w.casualties, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 500, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="fixed right-0 top-0 h-full z-[75] w-[480px] bg-[#1a1a1c] border-l border-[#e6e4df]/10 overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1c]/95 backdrop-blur-xl z-20 px-10 pt-10 pb-6 border-b border-[#e6e4df]/10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={12} className="text-[#c9a270]" />
                <p className="text-[10px] tracking-widest text-[#c9a270] uppercase">
                  Territory Dossier
                </p>
              </div>
              <h2 className="font-headline text-4xl text-[#e6e4df] leading-tight">
                {selectedCountry.name}
              </h2>
              <span className="font-mono text-xs text-[#9a9996] uppercase tracking-[0.2em] mt-1 block">
                {selectedCountry.iso}
              </span>
            </div>
            <button
              onClick={() => selectCountry(null)}
              className="p-2 text-[#9a9996] hover:text-[#e6e4df] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#e6e4df]/5">
            <div>
              <p className="text-[9px] text-[#9a9996] uppercase tracking-widest mb-1">
                Recorded Conflicts
              </p>
              <p className="font-headline text-2xl text-[#e6e4df]">
                {selectedCountry.wars.length}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-[#9a9996] uppercase tracking-widest mb-1">
                Est. Total Casualties
              </p>
              <p className="font-headline text-2xl text-[#d15c5c]">
                {formatCasualties(totalCasualties)}
              </p>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="px-10 py-8">
          <h3 className="text-xs text-[#9a9996] tracking-widest uppercase mb-6 flex items-center gap-2 pb-2 border-b border-[#e6e4df]/10">
            <ShieldAlert size={14} className="text-[#c9a270]" />
            Conflict History Registry
          </h3>
          
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {selectedCountry.wars
              .sort((a, b) => b.startYear - a.startYear)
              .map((w: War) => (
              <motion.div 
                key={w.id}
                variants={itemVariants}
                onClick={() => {
                  setYear(w.startYear);
                  selectWar(w);
                }}
                className="group p-5 border border-[#e6e4df]/5 bg-[#111112]/50 hover:bg-[#c9a270]/5 hover:border-[#c9a270]/40 transition-all cursor-pointer relative overflow-hidden"
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-100 transition-opacity" 
                  style={{ backgroundColor: TYPE_COLORS[w.type] || '#c9a270' }} 
                />
                <div className="pl-2">
                  <div className="flex justify-between items-start mb-2">
                    <h4 
                      className="font-headline text-xl transition-colors"
                      style={{ color: TYPE_COLORS[w.type] || '#e6e4df' }}
                    >
                      {w.name}
                    </h4>
                    <ArrowRight size={16} className="text-[#9a9996] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#9a9996] uppercase tracking-widest">
                      {formatYear(w.startYear)} – {formatYear(w.endYear)}
                    </span>
                    <span className="text-[#9a9996] font-light">
                      Cas: <span className="text-[#d15c5c] font-mono">{formatCasualties(w.casualties)}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
