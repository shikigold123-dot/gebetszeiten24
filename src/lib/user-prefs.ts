'use client';
import type { MethodKey } from './prayer-methods';

export type UserPrefs = {
  method: MethodKey;
  madhab: 'Shafi' | 'Hanafi';
  theme: 'light' | 'dark' | 'system';
  lastCity?: string;
};

const KEY = 'gz24:prefs';
const DEFAULTS: UserPrefs = { method: 'MWL', madhab: 'Shafi', theme: 'system' };

export function readPrefs(): UserPrefs {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function writePrefs(patch: Partial<UserPrefs>): UserPrefs {
  const next = { ...readPrefs(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('gz24:prefs', { detail: next }));
  } catch {}
  return next;
}
