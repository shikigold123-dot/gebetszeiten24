import {
  Coordinates,
  CalculationMethod,
  type CalculationParameters,
  Madhab,
  PrayerTimes,
} from 'adhan';
import { type MethodKey } from './prayer-methods';

export type Prayer = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type ComputeInput = {
  lat: number;
  lng: number;
  timezone: string;
  method: MethodKey;
  madhab: 'Shafi' | 'Hanafi';
  date: Date;
};

export type PrayerTimeMap = {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
};

export type ComputeResult = {
  times: PrayerTimeMap;
  getNext: (ref: Date) => { name: Prayer; time: Date } | null;
};

function methodParams(key: MethodKey): CalculationParameters {
  switch (key) {
    case 'MWL':
      return CalculationMethod.MuslimWorldLeague();
    case 'ISNA':
      return CalculationMethod.NorthAmerica();
    case 'Egyptian':
      return CalculationMethod.Egyptian();
    case 'Karachi':
      return CalculationMethod.Karachi();
    case 'UmmAlQura':
      return CalculationMethod.UmmAlQura();
    case 'Dubai':
      return CalculationMethod.Dubai();
    case 'Qatar':
      return CalculationMethod.Qatar();
    case 'Kuwait':
      return CalculationMethod.Kuwait();
    case 'MoonsightingCommittee':
      return CalculationMethod.MoonsightingCommittee();
    case 'Singapore':
      return CalculationMethod.Singapore();
    case 'Turkey':
      return CalculationMethod.Turkey();
    case 'Tehran':
      return CalculationMethod.Tehran();
    case 'NorthAmerica':
      return CalculationMethod.NorthAmerica();
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

function paramsFor(method: MethodKey, madhab: 'Shafi' | 'Hanafi'): CalculationParameters {
  const p = methodParams(method);
  p.madhab = madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return p;
}

export function computePrayerTimes(input: ComputeInput): ComputeResult {
  const coords = new Coordinates(input.lat, input.lng);
  const params = paramsFor(input.method, input.madhab);
  const pt = new PrayerTimes(coords, input.date, params);

  const times: PrayerTimeMap = {
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
  };

  const getNext = (ref: Date) => {
    const order: Prayer[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (const name of order) {
      if (times[name].getTime() > ref.getTime()) {
        return { name, time: times[name] };
      }
    }
    return null;
  };

  return { times, getNext };
}

export type MonthDay = { day: number; date: Date; times: PrayerTimeMap };

export type ComputeMonthInput = Omit<ComputeInput, 'date'> & { year: number; month: number };

export function computeMonth(input: ComputeMonthInput): MonthDay[] {
  const daysInMonth = new Date(input.year, input.month, 0).getDate();
  const entries: MonthDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(input.year, input.month - 1, d, 12, 0, 0);
    const { times } = computePrayerTimes({ ...input, date });
    entries.push({ day: d, date, times });
  }
  return entries;
}
