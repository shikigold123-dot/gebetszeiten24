import { Accordion } from './ui/accordion';
import type { City } from '@/data/cities';

export type CityFaq = { question: string; answer: string };

function communitySize(population: number): string {
  const estimate = Math.round((population * 0.055) / 1000) * 1000;
  return estimate.toLocaleString('de-DE');
}

function sizeCategory(population: number): string {
  if (population >= 500_000) return 'Großstadt';
  if (population >= 100_000) return 'Großstadt';
  return 'Stadt';
}

function latitudeNote(lat: number, name: string): string {
  if (lat > 53)
    return `Da ${name} weit im Norden liegt (Breitengrad ${lat.toFixed(1)}°), variieren Fajr und Isha im Jahresverlauf besonders stark — im Sommer kann Isha erst nach Mitternacht eintreten.`;
  if (lat > 51)
    return `${name} liegt in Norddeutschland (Breitengrad ${lat.toFixed(1)}°). Die Gebetszeiten schwanken hier im Jahresverlauf spürbar, besonders Fajr und Isha in den Sommermonaten.`;
  if (lat > 49)
    return `${name} liegt in Mitteldeutschland (Breitengrad ${lat.toFixed(1)}°). Die Gebetszeiten sind ausgeglichen — die saisonale Variation ist geringer als in norddeutschen Städten.`;
  return `${name} liegt im Süden Deutschlands (Breitengrad ${lat.toFixed(1)}°). Durch die südlichere Lage sind die Gebetszeiten gleichmäßiger verteilt als weiter nördlich.`;
}

function methodNote(state: string, cityName: string): string {
  if (state === 'Nordrhein-Westfalen')
    return `In ${state} ist die MWL-Methode weit verbreitet, da hier viele Moscheegemeinden aus dem arabischsprachigen Raum beheimatet sind. Gemeinden türkischer Herkunft nutzen häufig die Diyanet-Methode.`;
  if (state === 'Bayern' || state === 'Baden-Württemberg')
    return `In ${state} verwenden viele Moscheegemeinden die MWL-Methode. Türkischstämmige Gemeinden, die in der Region stark vertreten sind, nutzen oft die Diyanet-Methode.`;
  return `In Deutschland — und damit auch in ${cityName} — ist die Methode der Muslim World League (MWL) am weitesten verbreitet. Gemeinden mit türkischem Hintergrund verwenden häufig die Diyanet-Methode.`;
}

export function cityFaqs(city: City): CityFaq[] {
  return [
    {
      question: `Wann ist Fajr heute in ${city.name}?`,
      answer: `Die aktuelle Fajr-Zeit für ${city.name} siehst du oben in der Tabelle — berechnet für den heutigen Tag nach MWL-Standard. ${latitudeNote(city.lat, city.name)}`,
    },
    {
      question: `Welche Berechnungsmethode nutzen Moscheen in ${city.name}?`,
      answer: `${methodNote(city.state, city.name)} Du kannst die Methode jederzeit oben im Auswahlmenü wechseln — deine Einstellung wird lokal gespeichert.`,
    },
    {
      question: `Gibt es eine Monatsübersicht für ${city.name}?`,
      answer: `Ja — die Monatsübersicht für ${city.name} zeigt alle Gebetszeiten des laufenden Monats auf einen Blick. Du erreichst sie über den Link „Monatsansicht" direkt über der Tabelle.`,
    },
    {
      question: `Wie groß ist die muslimische Gemeinschaft in ${city.name}?`,
      answer: `${city.name} ist eine ${sizeCategory(city.population)} mit rund ${city.population.toLocaleString('de-DE')} Einwohnern in ${city.state}. Schätzungen zufolge leben hier etwa ${communitySize(city.population)} Muslime. Die Gebetszeiten richten sich nach dem genauen Standort (${city.lat.toFixed(2)}°N, ${city.lng.toFixed(2)}°E).`,
    },
    {
      question: `Was ist der Unterschied zwischen Shafi- und Hanafi-Asr in ${city.name}?`,
      answer: `Beim Shafi-Madhab beginnt Asr, sobald der Schatten eines Gegenstands seine eigene Länge überschreitet. Beim Hanafi-Madhab erst, wenn der Schatten die doppelte Länge erreicht — dadurch liegt Asr in ${city.name} je nach Jahreszeit 30–90 Minuten später. Du kannst den Madhab oben umschalten.`,
    },
  ];
}

export function FaqAccordion({ city }: { city: City }) {
  const faqs = cityFaqs(city);
  return (
    <Accordion items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
  );
}
