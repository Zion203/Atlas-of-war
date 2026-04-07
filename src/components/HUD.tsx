'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function HUD() {
  const [lat, setLat] = useState('0.0000');
  const [lng, setLng] = useState('0.0000');

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.lat !== undefined) setLat(e.detail.lat.toFixed(4));
      if (e.detail?.lng !== undefined) setLng(e.detail.lng.toFixed(4));
    };
    window.addEventListener('globe-coords' as string, handler as EventListener);
    return () =>
      window.removeEventListener('globe-coords' as string, handler as EventListener);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 3.6, duration: 0.5 }}
      className="absolute top-20 right-6 z-20 glass-panel p-4 rounded text-right min-w-[200px]"
    >
      <div className="flex items-center gap-2 justify-end mb-1">
        <span className="w-1.5 h-1.5 bg-[#ff3131] rounded-full animate-pulse-dot" />
        <span className="text-[9px] font-mono text-[#ff3131] tracking-widest">
          SECURE FEED: VANGUARD-09
        </span>
      </div>
      <div className="text-[10px] font-mono text-[#dee1f7]/50 mt-2">
        LAT: {lat}° &nbsp; LNG: {lng}°
        <br />
        ALT: 42,000 KM &nbsp; SCAN: ACTIVE
      </div>
    </motion.div>
  );
}
