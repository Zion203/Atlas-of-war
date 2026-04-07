import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisclaimerModal() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0b]/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="editorial-panel max-w-2xl w-full mx-4 p-12 relative overflow-hidden"
          >
            {/* Subtle accent border top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d15c5c] via-[#c9a270] to-[#5c9bd1] opacity-50" />
            
            <h2 className="font-headline text-3xl text-[#e6e4df] tracking-wide mb-6">
              The Human Cost
            </h2>
            
            <div className="space-y-4 text-sm text-[#9a9996] leading-relaxed font-sans font-light">
              <p>
                This command center serves as a stark visualization of historical human conflict and the lives lost throughout history. 
              </p>
              <p className="italic border-l-2 border-[#d15c5c] pl-4 py-1 bg-[#d15c5c]/5">
                Disclaimer: While this database tracks major wars based on historical records, the underlying data may contain inaccuracies, estimations, or omissions due to the complexities of history. This is an exploratory prototype, and casualties are approximate.
              </p>
            </div>

            <div className="mt-10 flex justify-end">
              <button
                onClick={() => setIsVisible(false)}
                className="px-8 py-3 bg-[#e6e4df] text-[#111112] text-xs uppercase tracking-widest font-bold hover:bg-[#c9a270] transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
