import { Accordion } from './ui/accordion';
import type { City } from '@/data/cities';

export type CityFaq = { question: string; answer: string };

export function cityFaqs(city: City): CityFaq[] {
  return [
    {
      question: `Wann ist Fajr heute in ${city.name}?`,
      answer: `Die Fajr-Zeit in ${city.name} findest du oben in der Gebetszeiten-Tabelle. Sie wird nach der gewählten Berechnungsmethode live aktualisiert.`,
    },
    {
      question: `Welche Berechnungsmethode ist in Deutschland üblich?`,
      answer: `In Deutschland ist die Methode der Muslim World League (MWL) am weitesten verbreitet. Viele Moscheen mit türkischem Hintergrund verwenden alternativ die Diyanet-Methode.`,
    },
    {
      question: `Gibt es eine Monatsübersicht für ${city.name}?`,
      answer: `Ja — die Monatsansicht zeigt alle Gebetszeiten für den aktuellen Monat. Du erreichst sie über den Link oberhalb der Tabelle.`,
    },
    {
      question: `Wie ändere ich die Berechnungsmethode?`,
      answer: `Oberhalb der Tabelle findest du Auswahlmenüs für Methode und Madhab. Deine Auswahl wird lokal gespeichert und auf allen Stadt-Seiten angewendet.`,
    },
    {
      question: `Welcher Madhab wird für Asr verwendet?`,
      answer: `Standardmäßig zeigen wir Asr nach dem Schafi-Madhab an. Über die Auswahl kannst du zu Hanafi wechseln — dadurch verschiebt sich die Asr-Zeit nach hinten.`,
    },
  ];
}

export function FaqAccordion({ city }: { city: City }) {
  const faqs = cityFaqs(city);
  return (
    <Accordion items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
  );
}
