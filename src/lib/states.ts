import { cities } from '@/data/cities';

export type StateEntry = {
  name: string;
  slug: string;
};

// Canonical slug for each German state
export const stateSlugMap: Record<string, string> = {
  'Baden-Württemberg': 'baden-wuerttemberg',
  Bayern: 'bayern',
  Berlin: 'berlin-land',
  Brandenburg: 'brandenburg',
  Bremen: 'bremen-land',
  Hamburg: 'hamburg-land',
  Hessen: 'hessen',
  'Mecklenburg-Vorpommern': 'mecklenburg-vorpommern',
  Niedersachsen: 'niedersachsen',
  'Nordrhein-Westfalen': 'nordrhein-westfalen',
  'Rheinland-Pfalz': 'rheinland-pfalz',
  Saarland: 'saarland',
  Sachsen: 'sachsen',
  'Sachsen-Anhalt': 'sachsen-anhalt',
  'Schleswig-Holstein': 'schleswig-holstein',
  Thüringen: 'thueringen',
};

export const stateNameFromSlug: Record<string, string> = Object.fromEntries(
  Object.entries(stateSlugMap).map(([name, slug]) => [slug, name]),
);

export function getCitiesInState(stateName: string) {
  return cities.filter((c) => c.name !== stateName && c.state === stateName);
}

export const allStates: StateEntry[] = Object.entries(stateSlugMap).map(([name, slug]) => ({
  name,
  slug,
}));
