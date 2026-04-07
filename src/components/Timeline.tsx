'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useWarStore } from '@/store/useWarStore';
import { getActiveWars, getActiveCountries, totalCasualties, formatCasualties, formatYear } from '@/lib/utils';

export default function Timeline() {
  const {
    wars, currentYear, setYear,
    isPlaying, togglePlay, setPlaying,
    typeFilter, eraFilter, selectWar
  } = useWarStore();
  
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const activeWars = getActiveWars(wars, currentYear, typeFilter, eraFilter);
  const nations = getActiveCountries(activeWars);
  const cas = totalCasualties(activeWars);

  const intensity = Math.min(1, Math.log10(cas || 1) / 8);

  const tick = useCallback(() => {
    setYear(currentYear >= 2025 ? -3000 : currentYear + 1);
  }, [currentYear, setYear]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(tick, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, tick]);

  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2.9, duration: 1, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 w-full z-50 px-10 pb-8 pointer-events-none"
    >
      <div 
        className="editorial-panel pointer-events-auto rounded-full px-8 py-4 mx-auto max-w-5xl flex items-center justify-between gap-10 transition-all duration-1000"
        style={{
          boxShadow: `0 0 ${intensity * 40}px -5px rgba(209, 92, 92, ${intensity * 0.4})`,
          borderColor: intensity > 0.5 ? `rgba(209, 92, 92, ${intensity * 0.3})` : 'rgba(230, 228, 223, 0.2)'
        }}
      >
        
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-[#e6e4df]/20 text-[#e6e4df] hover:bg-[#e6e4df]/10 transition-colors"
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
        </button>

        {/* Temporal Display */}
        <div className="flex-shrink-0 w-32 text-center">
          <h2 className="font-headline text-3xl text-[#e6e4df] leading-none">
            {Math.abs(currentYear).toLocaleString()}
            <span className="text-sm font-body text-[#9a9996] uppercase ml-1">
              {currentYear < 0 ? 'BC' : 'AD'}
            </span>
          </h2>
        </div>

        {/* Timeline Track */}
        <div 
          className="flex-1 relative" 
          ref={trackRef}
          onMouseMove={(e) => {
            if (!trackRef.current) return;
            const rect = trackRef.current.getBoundingClientRect();
            let percent = (e.clientX - rect.left) / rect.width;
            percent = Math.max(0, Math.min(1, percent));
            setHoverYear(Math.round(-3000 + percent * (2025 - -3000)));
            setHoverX(e.clientX - rect.left);
          }}
          onMouseLeave={() => setHoverYear(null)}
        >
          {/* Hover Tooltip */}
          {hoverYear !== null && (
            <div 
              className="absolute bottom-full mb-3 -translate-x-1/2 globe-tooltip whitespace-nowrap z-50 pointer-events-none"
              style={{ left: hoverX }}
            >
              <div className="text-center font-headline">
                {formatYear(hoverYear)}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-solid border-t-[rgba(26,26,28,0.95)] border-t-4 border-l-transparent border-l-4 border-r-transparent border-r-4"></div>
            </div>
          )}

          <div className="flex justify-between text-[10px] text-[#9a9996] font-light tracking-widest uppercase mb-4 px-2">
            <span>3000 BC</span>
            <span>1 AD</span>
            <span>1500</span>
            <span>1900</span>
            <span>2025</span>
          </div>
          <input
            type="range"
            min={-3000}
            max={2025}
            step={1}
            value={currentYear}
            onMouseDown={() => {
              // Pause auto-playback when manually sliding
              if (isPlaying) togglePlay(); 
            }}
            onChange={(e) => {
              setYear(parseInt(e.target.value));
              // Clear the active selection so the globe unlocks and reveals all conflicts for the scrubbed year
              selectWar(null);
            }}
            className="w-full timeline-slider"
          />
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 flex items-center gap-6 text-right">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#9a9996] font-light">
              Est. Casualties
            </p>
            <p className="font-headline text-xl text-[#d15c5c] mt-0.5">
              {formatCasualties(cas)}
            </p>
          </div>
          <div className="w-px h-8 bg-[#e6e4df]/10" />
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#9a9996] font-light">
              Nations
            </p>
            <p className="font-headline text-xl text-[#e6e4df] mt-0.5">
              {nations.size}
            </p>
          </div>
        </div>

      </div>
    </motion.footer>
  );
}
