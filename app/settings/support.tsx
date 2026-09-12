import { InfoPage } from '@/components/InfoPage';

export default function SupportScreen() {
  return (
    <InfoPage
      title="Hilfe & Support"
      intro="Die häufigsten Fragen — beantwortet mit Tipps, die andere Remory-Nutzer:innen weitergegeben haben."
      sections={[
        {
          heading: 'Einen Moment festhalten',
          bullets: [
            'Tippe auf das „+“ in der Mitte der Navigation oder starte direkt auf der zweiten Startseite.',
            'Ein Foto reicht. Ein Satz reicht auch. Beides zusammen ist am schönsten.',
            'Nach dem Speichern kannst du Titel, Beschreibung und Stichwörter noch korrigieren.',
          ],
        },
        {
          heading: 'Alte Erinnerungen finden',
          bullets: [
            'Frag in der Suche in ganzen Sätzen, zum Beispiel „Wo gab es dieses gute Eis?“.',
            'Tipp aus der Community: ein einzelnes Stichwort wie „Kaffee“ oder „Rom“ funktioniert genauso gut.',
            'Über „Beliebte Tags“ kommst du mit einem Tippen zu ganzen Themen.',
          ],
        },
        {
          heading: 'Hilfe von anderen Nutzer:innen',
          bullets: [
            'Community-Tipps sammeln wir und veröffentlichen sie hier in der App.',
            'Hast du einen Trick gefunden, der anderen hilft? Schick ihn uns, dann landet er auf dieser Seite.',
            'Ein Austausch direkt in der App ist geplant — dafür braucht Remory ein Nutzerkonto, das es bewusst noch nicht gibt.',
          ],
        },
        {
          heading: 'Etwas funktioniert nicht',
          bullets: [
            'Fotos verschwunden? Prüfe, ob die App noch Zugriff auf deine Fotos hat.',
            'Kein Ortsvorschlag? Der Standort ist optional — du kannst ihn immer eintippen.',
            'Titel wirken sehr einfach? Dann arbeitet Remory ohne KI-Schlüssel direkt auf dem Gerät.',
          ],
        },
        {
          heading: 'Kontakt',
          body: 'Schreib uns an hallo@remory.app. Beschreibe kurz, was du gemacht hast und was passiert ist — das hilft am meisten.',
        },
      ]}
      footer="Wir lesen jede Nachricht. Antworten kann etwas dauern, weil hinter Remory ein kleines Team steht."
    />
  );
}
