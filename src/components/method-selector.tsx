'use client';
import { useEffect, useState } from 'react';
import { prayerMethods } from '@/lib/prayer-methods';
import { readPrefs, writePrefs } from '@/lib/user-prefs';
import type { MethodKey } from '@/lib/prayer-methods';
import { Select } from './ui/select';

export function MethodSelector() {
  const [method, setMethod] = useState<MethodKey>('MWL');
  const [madhab, setMadhab] = useState<'Shafi' | 'Hanafi'>('Shafi');

  useEffect(() => {
    const p = readPrefs();
    setMethod(p.method);
    setMadhab(p.madhab);
  }, []);

  const updateMethod = (value: string) => {
    const v = value as MethodKey;
    writePrefs({ method: v });
    setMethod(v);
  };
  const updateMadhab = (value: string) => {
    const v = value as 'Shafi' | 'Hanafi';
    writePrefs({ madhab: v });
    setMadhab(v);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex items-center gap-2">
        <span className="text-[var(--color-muted)]">Methode:</span>
        <Select value={method} onChange={(e) => updateMethod(e.target.value)}>
          {prayerMethods.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex items-center gap-2">
        <span className="text-[var(--color-muted)]">Madhab:</span>
        <Select value={madhab} onChange={(e) => updateMadhab(e.target.value)}>
          <option value="Shafi">Shafi (früheres Asr)</option>
          <option value="Hanafi">Hanafi (späteres Asr)</option>
        </Select>
      </label>
    </div>
  );
}
