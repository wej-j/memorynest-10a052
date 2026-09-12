import { InfoPage } from '@/components/InfoPage';

export default function PrivacyScreen() {
  return (
    <InfoPage
      title="Datenschutz"
      intro="Remory ist als privates Erinnerungstagebuch gebaut. Deine Momente gehören dir — hier steht genau, was mit ihnen passiert."
      sections={[
        {
          heading: 'Wo deine Daten liegen',
          bullets: [
            'Alle Momente, Fotoverweise, Stichwörter und Bewertungen werden lokal auf deinem Gerät gespeichert.',
            'Es gibt kein Konto, keine Anmeldung und keine Nutzerprofile auf einem Server.',
            'Fotos, die du auswählst, werden verkleinert im App-Speicher deines Geräts abgelegt.',
          ],
        },
        {
          heading: 'KI-Anreicherung',
          bullets: [
            'Titel, Beschreibung und Stichwörter entstehen standardmäßig direkt auf deinem Gerät.',
            'Ist ein KI-Schlüssel hinterlegt, werden deine Notiz und – falls vorhanden – das Foto zur Verarbeitung an den Modell-Anbieter gesendet.',
            'Ohne Schlüssel verlässt kein Inhalt dein Gerät.',
          ],
        },
        {
          heading: 'Standort',
          bullets: [
            'Der Standort wird nur abgefragt, wenn du einen Moment festhältst, und ist immer optional.',
            'Gespeichert wird nur der Ortsname, den du siehst — keine laufende Positionsverfolgung.',
            'Du kannst den Ort jederzeit ändern oder löschen.',
          ],
        },
        {
          heading: 'Löschen',
          bullets: [
            'Ein Moment ist mit „Löschen“ auf der Detailseite endgültig entfernt.',
            'Wenn du die App löschst, verschwinden alle gespeicherten Momente mit ihr.',
          ],
        },
        {
          heading: 'Kein Tracking',
          body: 'Remory zeigt keine Werbung, verkauft keine Daten und erstellt keine Werbeprofile.',
        },
      ]}
      footer="Dieser Prototyp entstand an einem Hackathon. Vor einem echten Store-Release muss diese Erklärung rechtlich geprüft werden."
    />
  );
}
