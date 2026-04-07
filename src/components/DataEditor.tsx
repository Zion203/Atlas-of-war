'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Plus } from 'lucide-react';
import { useWarStore } from '@/store/useWarStore';
import type { War, WarType, WarEra } from '@/lib/types';

const EMPTY_WAR: Omit<War, 'id'> = {
  name: '',
  startYear: 2024,
  endYear: 2024,
  type: 'regional',
  era: 'modern',
  countries: ['USA'],
  casualties: 0,
  description: '',
  belligerents: { allies: ['Faction A'], adversaries: ['Faction B'] },
  outcome: '',
  arcs: [],
};

export default function DataEditor() {
  const { wars, addWar, updateWar, deleteWar, isEditorOpen, setEditorOpen } = useWarStore();
  const [selectedId, setSelectedId] = useState<number | 'new' | null>(null);
  const [formData, setFormData] = useState<Partial<War>>(EMPTY_WAR);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = (w: War | 'new') => {
    setSelectedId(w === 'new' ? 'new' : w.id);
    setFormData(w === 'new' ? EMPTY_WAR : w);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const isNew = selectedId === 'new';
      const url = '/api/wars';
      const method = isNew ? 'POST' : 'PUT';
      const body = JSON.stringify(isNew ? formData : { ...formData, id: selectedId });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) throw new Error('API Error');

      const savedWar = await res.json();
      if (isNew) addWar(savedWar);
      else updateWar(selectedId as number, savedWar);

      setSelectedId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save archive data.');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Permanently delete this record from the archive?')) return;
    try {
      const res = await fetch('/api/wars', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        deleteWar(id);
        setSelectedId(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete data.');
    }
  };

  return (
    <AnimatePresence>
      {isEditorOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#1a1a1c]/90 backdrop-blur flex justify-center items-center p-10"
        >
          {/* Main Modal */}
          <div className="w-full max-w-6xl h-full max-h-[85vh] bg-[#1a1a1c] border border-[#e6e4df]/10 rounded shadow-2xl flex overflow-hidden">
            
            {/* Left List */}
            <div className="w-80 border-r border-[#e6e4df]/10 flex flex-col bg-[#111112]">
              <div className="p-6 border-b border-[#e6e4df]/10 flex justify-between items-center">
                <h3 className="font-headline text-xl text-[#e6e4df]">
                  Archive Records
                </h3>
                <button
                  onClick={() => setEditorOpen(false)}
                  className="text-[#9a9996] hover:text-[#e6e4df] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 border-b border-[#e6e4df]/5">
                <button
                  onClick={() => handleSelect('new')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#e6e4df]/5 hover:bg-[#e6e4df]/10 text-[#e6e4df] border border-[#e6e4df]/10 rounded transition-colors text-xs uppercase tracking-widest font-medium"
                >
                  <Plus size={14} /> New Record
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
                {wars.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleSelect(w)}
                    className={`w-full text-left px-4 py-3 rounded transition-colors ${
                      selectedId === w.id
                        ? 'bg-[#c9a270]/10 text-[#c9a270]'
                        : 'text-[#9a9996] hover:bg-[#e6e4df]/5 hover:text-[#e6e4df]'
                    }`}
                  >
                    <div className="font-headline text-lg mb-1 truncate">{w.name}</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-60">
                      {w.startYear} - {w.endYear}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Edit Form */}
            <div className="flex-1 overflow-y-auto p-12 bg-[#1a1a1c]">
              {selectedId ? (
                <div className="max-w-3xl space-y-8">
                  <div className="flex items-center justify-between pb-6 border-b border-[#e6e4df]/10">
                    <h2 className="font-headline text-4xl text-[#e6e4df]">
                      {selectedId === 'new' ? 'New Record' : `Edit Record #${selectedId}`}
                    </h2>
                    <div className="flex gap-4">
                      {selectedId !== 'new' && (
                        <button
                          onClick={() => remove(selectedId as number)}
                          className="p-3 text-[#d15c5c] hover:bg-[#d15c5c]/10 rounded border border-[#d15c5c]/20 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={save}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-[#c9a270] hover:bg-[#e6c18f] text-[#1a1a1c] font-bold text-xs uppercase tracking-widest rounded transition-colors disabled:opacity-50"
                      >
                        <Save size={16} /> {isSaving ? 'Saving...' : 'Save Record'}
                      </button>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] text-[#9a9996] uppercase tracking-widest font-medium">
                        Conflict Name
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border border-[#e6e4df]/20 rounded px-4 py-3 text-lg font-headline text-[#e6e4df] outline-none focus:border-[#c9a270] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6 col-span-2">
                      <div className="space-y-2">
                        <label className="text-[10px] text-[#9a9996] uppercase tracking-widest font-medium">
                          Start Year
                        </label>
                        <input
                          type="number"
                          value={formData.startYear || ''}
                          onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value) })}
                          className="w-full bg-transparent border border-[#e6e4df]/20 rounded px-4 py-3 text-base text-[#e6e4df] outline-none focus:border-[#c9a270] transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-[#9a9996] uppercase tracking-widest font-medium">
                          End Year
                        </label>
                        <input
                          type="number"
                          value={formData.endYear || ''}
                          onChange={(e) => setFormData({ ...formData, endYear: parseInt(e.target.value) })}
                          className="w-full bg-transparent border border-[#e6e4df]/20 rounded px-4 py-3 text-base text-[#e6e4df] outline-none focus:border-[#c9a270] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-[#9a9996] uppercase tracking-widest font-medium">
                        Conflict Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as WarType })}
                        className="w-full bg-[#111112] border border-[#e6e4df]/20 rounded px-4 py-3 text-[#e6e4df] outline-none focus:border-[#c9a270] transition-colors appearance-none"
                      >
                        <option value="world">World</option>
                        <option value="civil">Civil</option>
                        <option value="colonial">Colonial</option>
                        <option value="regional">Regional</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-[#9a9996] uppercase tracking-widest font-medium">
                        Historical Era
                      </label>
                      <select
                        value={formData.era}
                        onChange={(e) => setFormData({ ...formData, era: e.target.value as WarEra })}
                        className="w-full bg-[#111112] border border-[#e6e4df]/20 rounded px-4 py-3 text-[#e6e4df] outline-none focus:border-[#c9a270] transition-colors appearance-none"
                      >
                        <option value="ancient">Ancient</option>
                        <option value="medieval">Medieval</option>
                        <option value="colonial">Colonial</option>
                        <option value="modern">Modern</option>
                      </select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] text-[#9a9996] uppercase tracking-widest font-medium">
                        Casualties (Estimated)
                      </label>
                      <input
                        type="number"
                        value={formData.casualties || ''}
                        onChange={(e) => setFormData({ ...formData, casualties: parseInt(e.target.value) })}
                        className="w-full bg-transparent border border-[#e6e4df]/20 rounded px-4 py-3 text-base text-[#e6e4df] outline-none focus:border-[#c9a270] transition-colors"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] text-[#9a9996] uppercase tracking-widest font-medium">
                        Historical Overview
                      </label>
                      <textarea
                        rows={4}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-transparent border border-[#e6e4df]/20 rounded px-4 py-3 text-base text-[#e6e4df] outline-none focus:border-[#c9a270] transition-colors resize-none leading-relaxed"
                      />
                    </div>
                    
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] text-[#9a9996] uppercase tracking-widest font-medium">
                        Strategic Resolution / Outcome
                      </label>
                      <textarea
                        rows={3}
                        value={formData.outcome || ''}
                        onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                        className="w-full bg-transparent border border-[#e6e4df]/20 rounded px-4 py-3 text-base font-headline italic text-[#e6e4df] outline-none focus:border-[#c9a270] transition-colors resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] text-[#9a9996] uppercase tracking-widest font-medium mb-1 block">
                        Engaged Territories (ISO-A3 Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={formData.countries?.join(', ') || ''}
                        onChange={(e) => setFormData({ ...formData, countries: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })}
                        className="w-full bg-transparent border border-[#e6e4df]/20 rounded px-4 py-3 text-sm text-[#e6e4df] outline-none focus:border-[#c9a270] transition-colors uppercase"
                        placeholder="USA, RUS, GBR"
                      />
                    </div>

                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-[#9a9996] font-headline text-lg italic">
                  Select a record from the archive or create a new entry.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
