'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useWarStore } from '@/store/useWarStore';
import { searchWars, formatYear, TYPE_COLORS } from '@/lib/utils';
import type { War } from '@/lib/types';

export default function SearchBar() {
  const { wars, isSearchOpen, setSearchOpen, selectWar, setYear } = useWarStore();
  const [query, setQuery] = useState('');

  const results = searchWars(wars, query);

  const handleSelect = (w: War) => {
    setYear(w.startYear);
    selectWar(w);
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-[80] bg-[#1a1a1c]/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-[90] w-full max-w-2xl bg-[#1a1a1c] rounded shadow-2xl overflow-hidden border border-[#e6e4df]/10"
          >
            {/* Input Header */}
            <div className="flex items-center px-6 py-4 border-b border-[#e6e4df]/10">
              <Search className="text-[#c9a270] mr-4" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Search the archive..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-xl font-headline text-[#e6e4df] placeholder:text-[#9a9996]/50 outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 hover:bg-[#e6e4df]/5 rounded-full transition-colors text-[#9a9996]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {query && results.length === 0 ? (
                <div className="p-10 text-center text-[#9a9996] font-body text-sm">
                  There are no records matching your query in the archive.
                </div>
              ) : (
                <div className="p-2">
                  {results.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => handleSelect(w)}
                      className="flex justify-between items-center p-4 hover:bg-[#e6e4df]/5 rounded cursor-pointer group transition-colors"
                    >
                      <div className="flex-1 pr-6">
                        <h4 
                          className="font-headline text-lg mb-1"
                          style={{ color: TYPE_COLORS[w.type] || '#e6e4df' }}
                        >
                          {w.name}
                        </h4>
                        <p className="text-sm text-[#9a9996] truncate font-light">
                          {w.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-headline text-[#c9a270]">
                          {formatYear(w.startYear)} – {formatYear(w.endYear)}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-[#9a9996] mt-1">
                          {w.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
