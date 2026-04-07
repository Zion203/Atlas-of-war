import { create } from 'zustand';
import type { War, WarType, WarEra } from '@/lib/types';

interface WarStore {
  // Data
  wars: War[];
  setWars: (wars: War[]) => void;
  addWar: (war: War) => void;
  updateWar: (id: number, war: Partial<War>) => void;
  deleteWar: (id: number) => void;

  // Timeline
  currentYear: number;
  setYear: (year: number) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  setPlaying: (v: boolean) => void;

  // Filters
  typeFilter: WarType | 'all';
  eraFilter: WarEra | 'all';
  setTypeFilter: (t: WarType | 'all') => void;
  setEraFilter: (e: WarEra | 'all') => void;

  // Selection & Comparison
  selectedCountry: { iso: string; name: string; wars: War[] } | null;
  selectCountry: (country: { iso: string; name: string; wars: War[] } | null) => void;
  selectedWar: War | null;
  selectWar: (war: War | null) => void;
  comparedWars: War[];
  toggleCompareWar: (war: War) => void;
  clearComparison: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setSearchOpen: (v: boolean) => void;

  // Data editor
  isEditorOpen: boolean;
  setEditorOpen: (v: boolean) => void;

  // Analytics
  isAnalyticsOpen: boolean;
  setAnalyticsOpen: (v: boolean) => void;

  // Narratives
  isNarrativesMenuOpen: boolean;
  setNarrativesMenuOpen: (v: boolean) => void;
  activeNarrative: any | null; // using any to avoid strict typing cycle right here
  setActiveNarrative: (n: any | null) => void;
  narrativeStepIndex: number;
  setNarrativeStepIndex: (v: number) => void;

  // Boot
  isBooted: boolean;
  setBoot: (v: boolean) => void;
}

export const useWarStore = create<WarStore>((set) => ({
  wars: [],
  setWars: (wars) => set({ wars }),
  addWar: (war) => set((s) => ({ wars: [...s.wars, war] })),
  updateWar: (id, updates) =>
    set((s) => ({
      wars: s.wars.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),
  deleteWar: (id) => set((s) => ({ wars: s.wars.filter((w) => w.id !== id) })),

  currentYear: 1944,
  setYear: (year) => set({ currentYear: year }),
  isPlaying: false,
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (v) => set({ isPlaying: v }),

  typeFilter: 'all',
  eraFilter: 'modern',
  setTypeFilter: (t) =>
    set((s) => ({ typeFilter: s.typeFilter === t ? 'all' : t })),
  setEraFilter: (e) =>
    set((s) => ({ eraFilter: s.eraFilter === e ? 'all' : e })),

  selectedCountry: null,
  selectCountry: (country) => set({ selectedCountry: country, selectedWar: null }),
  selectedWar: null,
  selectWar: (war) => set({ selectedWar: war, selectedCountry: null }),
  comparedWars: [],
  toggleCompareWar: (war) =>
    set((s) => {
      const exists = s.comparedWars.find((w) => w.id === war.id);
      if (exists) {
        return { comparedWars: s.comparedWars.filter((w) => w.id !== war.id) };
      }
      if (s.comparedWars.length >= 4) return s; // Max 4 comparisons
      return { comparedWars: [...s.comparedWars, war] };
    }),
  clearComparison: () => set({ comparedWars: [] }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  isSearchOpen: false,
  setSearchOpen: (v) => set({ isSearchOpen: v }),

  isEditorOpen: false,
  setEditorOpen: (v) => set({ isEditorOpen: v }),

  isAnalyticsOpen: false,
  setAnalyticsOpen: (v) => set({ isAnalyticsOpen: v }),

  isNarrativesMenuOpen: false,
  setNarrativesMenuOpen: (v) => set({ isNarrativesMenuOpen: v }),
  activeNarrative: null,
  setActiveNarrative: (n) => set({ activeNarrative: n }),
  narrativeStepIndex: 0,
  setNarrativeStepIndex: (v) => set({ narrativeStepIndex: v }),

  isBooted: false,
  setBoot: (v) => set({ isBooted: v }),
}));
