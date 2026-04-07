export interface WarArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  label: string;
}

export interface Belligerents {
  allies: string[];
  adversaries: string[];
}

export interface WarPhase {
  id: string;
  name: string;
  year: number;
  endYear?: number;
  description: string;
  lat?: number;
  lng?: number;
}

export interface War {
  id: number;
  name: string;
  startYear: number;
  endYear: number;
  type: 'world' | 'civil' | 'colonial' | 'regional';
  era: 'ancient' | 'medieval' | 'colonial' | 'modern';
  countries: string[];
  casualties: number;
  description?: string;
  belligerents?: Belligerents;
  outcome?: string;
  arcs: WarArc[];
  phases?: WarPhase[];
}

export interface NarrativeStep {
  title: string;
  year: number;
  description: string;
  lat?: number;
  lng?: number;
  warIds?: number[];
}

export interface Narrative {
  id: string;
  title: string;
  description: string;
  steps: NarrativeStep[];
}

export type WarType = War['type'];
export type WarEra = War['era'];

export interface GlobeArc extends WarArc {
  color: string;
  war: War;
}
