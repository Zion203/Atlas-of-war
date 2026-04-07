import type { War, WarType, WarEra, GlobeArc } from './types';

export const TYPE_COLORS: Record<WarType, string> = {
  world: '#d15c5c',
  civil: '#c9a270',
  colonial: '#5c9bd1',
  regional: '#85b37e',
};

export function getActiveWars(
  wars: War[],
  year: number,
  typeFilter: WarType | 'all',
  eraFilter: WarEra | 'all'
): War[] {
  return wars.filter((w) => {
    const inTime = year >= w.startYear && year <= w.endYear;
    const typeOk = typeFilter === 'all' || w.type === typeFilter;
    const eraOk = eraFilter === 'all' || w.era === eraFilter;
    return inTime && typeOk && eraOk;
  });
}

export function getActiveCountries(wars: War[]): Set<string> {
  const set = new Set<string>();
  wars.forEach((w) => w.countries.forEach((c) => set.add(c)));
  return set;
}

export function getArcs(wars: War[]): GlobeArc[] {
  return wars.flatMap((w) =>
    w.arcs.map((a) => ({
      ...a,
      color: TYPE_COLORS[w.type] || '#ff3131',
      war: w,
    }))
  );
}

export function totalCasualties(wars: War[]): number {
  return wars.reduce((sum, w) => sum + w.casualties, 0);
}

export function formatCasualties(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  if (n === 0) return '–';
  return n.toLocaleString();
}

export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  return `${year} AD`;
}

export function searchWars(wars: War[], query: string): War[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return wars.filter(
    (w) =>
      w.name.toLowerCase().includes(q) ||
      w.description.toLowerCase().includes(q) ||
      w.countries.some((c) => c.toLowerCase().includes(q))
  );
}
