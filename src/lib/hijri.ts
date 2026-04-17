const longFormatter = new Intl.DateTimeFormat('de-DE-u-ca-islamic-umalqura', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortFormatter = new Intl.DateTimeFormat('de-DE-u-ca-islamic-umalqura', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

export function formatHijri(date: Date): string {
  return longFormatter.format(date);
}

export function formatHijriShort(date: Date): string {
  return shortFormatter.format(date);
}
