'use client';
import { useEffect, useState } from 'react';
import { readPrefs, writePrefs } from '@/lib/user-prefs';
import { Button } from './ui/button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    setTheme(readPrefs().theme);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && sysDark);
    html.classList.toggle('dark', isDark);
  }, [theme]);

  const cycle = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    writePrefs({ theme: next });
  };

  return (
    <Button variant="ghost" size="sm" onClick={cycle} aria-label="Farbschema umschalten">
      {theme === 'light' ? 'Hell' : theme === 'dark' ? 'Dunkel' : 'Auto'}
    </Button>
  );
}
