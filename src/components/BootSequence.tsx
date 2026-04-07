'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWarStore } from '@/store/useWarStore';

export default function BootSequence() {
  const { setBoot } = useWarStore();
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Elegant fade sequence: hold the title, then reveal the atlas.
    const t = setTimeout(() => {
      setShow(false);
      setBoot(true);
    }, 3500);
    return () => clearTimeout(t);
  }, [setBoot]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-[#1a1a1c] flex flex-col items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="text-center"
          >
            <h1 className="font-headline text-5xl md:text-7xl text-[#e6e4df] tracking-wide mb-6">
              Atlas of War
            </h1>
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 1.5, ease: 'circOut' }}
              className="w-16 h-px bg-[#e6e4df]/30 mx-auto"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
