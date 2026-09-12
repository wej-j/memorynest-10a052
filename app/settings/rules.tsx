import { InfoPage } from '@/components/InfoPage';

export default function RulesScreen() {
  return (
    <InfoPage
      title="Regeln & Nutzung"
      intro="Ein paar einfache Regeln, damit Remory für alle ein guter Ort für Erinnerungen bleibt."
      sections={[
        {
          heading: 'Deine Inhalte',
          bullets: [
            'Halte nur Momente fest, an denen du die Rechte hast oder bei denen die abgebildeten Personen einverstanden sind.',
            'Nichts Rechtswidriges, nichts, was andere verletzt oder blaßstellt.',
            'Deine Momente bleiben deine — Remory beansprucht keine Rechte daran.',
          ],
        },
        {
          heading: 'Fairer Umgang',
          bullets: [
            'Die App ist für den persönlichen Gebrauch gedacht, nicht für Werbung oder Massenimporte.',
            'Automatisiertes Auslesen der App oder ihrer Schnittstellen ist nicht erlaubt.',
          ],
        },
        {
          heading: 'KI-Ergebnisse',
          bullets: [
            'Titel, Beschreibungen und Stichwörter sind Vorschläge und können falsch sein.',
            'Du kannst jedes Feld vor dem Speichern und später jederzeit korrigieren.',
            'Verlass dich bei wichtigen Angaben nicht ungeprüft auf die KI.',
          ],
        },
        {
          heading: 'Keine Garantie',
          body: 'Remory ist ein Prototyp und wird ohne Gewährleistung bereitgestellt. Bitte behalte wichtige Fotos zusätzlich in deiner normalen Fotobibliothek.',
        },
      ]}
      footer="Stand: Version 1.0.0. Änderungen an diesen Regeln erscheinen an dieser Stelle."
    />
  );
}
