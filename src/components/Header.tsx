'use client';

import { motion } from 'framer-motion';
import { Search, Database, BarChart2, BookOpen } from 'lucide-react';
import { useWarStore } from '@/store/useWarStore';

export default function Header() {
  const { setSearchOpen, setAnalyticsOpen, setNarrativesMenuOpen } = useWarStore();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2.5, duration: 1, ease: 'easeOut' }}
      className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-6"
    >
      {/* Left: Brand */}
      <div className="flex items-baseline gap-4">
        <h1 className="text-3xl font-headline italic tracking-wide text-[#e6e4df]">
          Atlas of War
        </h1>
        <span className="text-xs text-[#9a9996] tracking-widest uppercase font-light">
          An interactive chronicle
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setNarrativesMenuOpen(true)}
          className="group flex items-center gap-2 text-[#9a9996] hover:text-[#e6e4df] transition-colors"
          title="Guided Storylines"
        >
          <BookOpen size={16} />
          <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Storylines
          </span>
        </button>
        <button
          onClick={() => setAnalyticsOpen(true)}
          className="group flex items-center gap-2 text-[#9a9996] hover:text-[#e6e4df] transition-colors"
          title="View Analytics"
        >
          <BarChart2 size={16} />
          <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Trends
          </span>
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          className="group flex items-center gap-2 text-[#9a9996] hover:text-[#e6e4df] transition-colors"
          title="Search Archive"
        >
          <Search size={16} />
          <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Search
          </span>
        </button>
      </div>
    </motion.header>
  );
}
