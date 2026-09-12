import { InfoPage } from '@/components/InfoPage';

export default function AboutScreen() {
  return (
    <InfoPage
      title="Über Remory"
      intro="Remory ist ein persönlicher Erinnerungsbegleiter: schnell festhalten, automatisch anreichern, später in normaler Sprache wiederfinden."
      sections={[
        {
          heading: 'Die Idee',
          body: 'Die schönsten Momente passieren, wenn niemand Lust hat, ein Formular auszufüllen. Remory nimmt deshalb alles an — ein Foto, ein halber Satz — und macht daraus später eine vollständige Erinnerung.',
        },
        {
          heading: 'Wer dahinter steckt',
          bullets: [
            'Idee & Konzept — das Remory Team',
            'Design & Gestaltung — das Remory Team',
            'Entwicklung, KI & Suche — das Remory Team',
          ],
        },
        {
          heading: 'Wie es entstanden ist',
          body: 'Remory wurde an einem Hackathon-Wochenende gebaut: erst der Kern aus Festhalten, Speichern und Wiederfinden, dann die KI-Anreicherung und die Suche in natürlicher Sprache.',
        },
        {
          heading: 'Womit es gebaut ist',
          bullets: [
            'React Native und Expo — eine App für iOS, Android und Web.',
            'Lokaler Speicher auf dem Gerät, ohne Konto.',
            'KI-Anreicherung und Suche in natürlicher Sprache, mit Fallback direkt auf dem Gerät.',
          ],
        },
        {
          heading: 'Danke',
          body: 'Danke an alle, die früh getestet haben und uns erzählt haben, welche Erinnerungen sie behalten wollten.',
        },
      ]}
      footer="Remory 1.0.0 — Remember the moments that matter."
    />
  );
}
