export type MethodKey =
  | 'MWL'
  | 'ISNA'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'MoonsightingCommittee'
  | 'Singapore'
  | 'Turkey'
  | 'Tehran'
  | 'NorthAmerica';

export type MethodInfo = {
  key: MethodKey;
  label: string;
  description: string;
  fajrAngle: number;
  ishaAngle: number;
};

export const prayerMethods: MethodInfo[] = [
  {
    key: 'MWL',
    label: 'Muslim World League (MWL)',
    description: 'In Deutschland und Europa am weitesten verbreitet.',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  {
    key: 'ISNA',
    label: 'Islamic Society of North America (ISNA)',
    description: 'Verbreitet in Nordamerika.',
    fajrAngle: 15,
    ishaAngle: 15,
  },
  {
    key: 'Egyptian',
    label: 'Ägyptische Behörde (Egyptian General Authority)',
    description: 'Verwendet in Ägypten, Syrien, Libanon, Malaysia.',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
  },
  {
    key: 'Karachi',
    label: 'University of Islamic Sciences, Karachi',
    description: 'Verbreitet in Pakistan, Bangladesch, Indien, Afghanistan.',
    fajrAngle: 18,
    ishaAngle: 18,
  },
  {
    key: 'UmmAlQura',
    label: 'Umm al-Qura Universität, Mekka',
    description: 'Offizielle Methode in Saudi-Arabien. Isha 90 Min nach Maghrib.',
    fajrAngle: 18.5,
    ishaAngle: 0,
  },
  {
    key: 'Dubai',
    label: 'Dubai (VAE)',
    description: 'Offiziell in den Vereinigten Arabischen Emiraten.',
    fajrAngle: 18.2,
    ishaAngle: 18.2,
  },
  {
    key: 'Qatar',
    label: 'Katar',
    description: 'Wie UmmAlQura, aber Isha 90 Min nach Maghrib.',
    fajrAngle: 18,
    ishaAngle: 0,
  },
  {
    key: 'Kuwait',
    label: 'Kuwait',
    description: 'Offiziell in Kuwait.',
    fajrAngle: 18,
    ishaAngle: 17.5,
  },
  {
    key: 'MoonsightingCommittee',
    label: 'Moonsighting Committee Worldwide',
    description: 'Saisonal angepasste Methode.',
    fajrAngle: 18,
    ishaAngle: 18,
  },
  {
    key: 'Singapore',
    label: 'Singapur (MUIS)',
    description: 'Offiziell in Singapur.',
    fajrAngle: 20,
    ishaAngle: 18,
  },
  {
    key: 'Turkey',
    label: 'Diyanet İşleri Başkanlığı (Türkei)',
    description: 'Offizielle türkische Methode.',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  {
    key: 'Tehran',
    label: 'Institute of Geophysics, Tehran',
    description: 'Verbreitet in Iran — schiitische Methode.',
    fajrAngle: 17.7,
    ishaAngle: 14,
  },
  {
    key: 'NorthAmerica',
    label: 'Nordamerika (ISNA Alternative)',
    description: 'Alternative ISNA-Parameter.',
    fajrAngle: 15,
    ishaAngle: 15,
  },
];

export const DEFAULT_METHOD: MethodKey = 'MWL';
export const DEFAULT_MADHAB: 'Shafi' | 'Hanafi' = 'Shafi';

export function getMethod(key: MethodKey): MethodInfo {
  return prayerMethods.find((m) => m.key === key) ?? prayerMethods[0];
}
