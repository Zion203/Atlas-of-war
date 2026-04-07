'use client';

import { motion } from 'framer-motion';
import { useWarStore } from '@/store/useWarStore';
import { getActiveWars, formatYear, TYPE_COLORS } from '@/lib/utils';
import type { WarType, WarEra } from '@/lib/types';
import CustomSelect from './CustomSelect';

export default function Sidebar() {
  const { 
    wars, typeFilter, eraFilter, 
    selectWar, selectedWar, setTypeFilter, setEraFilter, setYear
  } = useWarStore();

  const activeWars = wars.filter((w) => {
    const typeOk = typeFilter === 'all' || w.type === typeFilter;
    const eraOk = eraFilter === 'all' || w.era === eraFilter;
    return typeOk && eraOk;
  });

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 2.7, duration: 1, ease: 'easeOut' }}
      // Note: Header has px-10 py-6, so top offset should be below header. 100px is safe.
      className="fixed left-10 top-24 bottom-32 z-40 w-80 flex flex-col pointer-events-none"
    >
      <div className="editorial-panel pointer-events-auto rounded-md flex flex-col h-full overflow-hidden">
        <div className="px-6 py-6 border-b border-[#e6e4df]/10 flex-shrink-0">
          <h3 className="font-headline text-xl text-[#e6e4df] tracking-wide mb-1">
            Historical Index
          </h3>
          <p className="text-[10px] text-[#9a9996] uppercase tracking-widest mb-4">
            {activeWars.length} Recorded Conflict{activeWars.length !== 1 && 's'}
          </p>

          <div className="flex gap-2">
            <CustomSelect
              value={eraFilter}
              onChange={(val) => setEraFilter(val as WarEra | 'all')}
              className="flex-1"
              options={[
                { value: 'all', label: 'All Eras' },
                { value: 'ancient', label: 'Ancient' },
                { value: 'medieval', label: 'Medieval' },
                { value: 'colonial', label: 'Colonial' },
                { value: 'modern', label: 'Modern' }
              ]}
            />

            <CustomSelect
              value={typeFilter}
              onChange={(val) => setTypeFilter(val as WarType | 'all')}
              className="flex-1"
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'world', label: 'World' },
                { value: 'civil', label: 'Civil' },
                { value: 'colonial', label: 'Colonial' },
                { value: 'regional', label: 'Regional' }
              ]}
            />
          </div>
        </div>

        {/* Conflict cards */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-5">
          {activeWars.length === 0 ? (
            <p className="text-sm text-[#9a9996] italic font-headline">
              No recorded conflicts in the archive for this period.
            </p>
          ) : (
            activeWars.map((w) => {
              const isActive = selectedWar?.id === w.id;
              const typeColor = TYPE_COLORS[w.type] || '#c9a270';
              return (
                <div
                  key={w.id}
                  onClick={() => {
                    setYear(w.startYear);
                    selectWar(w);
                  }}
                  className={`cursor-pointer group transition-all duration-300 border-l-2 pl-4 py-1.5 opacity-70 hover:opacity-100`}
                  style={{
                    borderColor: isActive ? typeColor : `${typeColor}4D`, // 4D is approx 30% opacity
                    opacity: isActive ? 1 : undefined,
                  }}
                >
                  <h4 
                    className="font-headline text-lg transition-colors"
                    style={{ color: isActive ? typeColor : '#e6e4df' }}
                  >
                    {w.name}
                  </h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#9a9996]">
                      {w.type} / {formatYear(w.startYear)}–{formatYear(w.endYear)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.aside>
  );
}
