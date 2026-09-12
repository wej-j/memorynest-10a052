import type { Moment } from '@/lib/types';

type SeedInput = {
  id: string;
  assetKey: string | null;
  date: string;
  time: string;
  location: string | null;
  title: string;
  description: string;
  originalNote: string;
  tags: string[];
  rating: number;
  favorite?: boolean;
};

function seed(input: SeedInput): Moment {
  const createdAt = new Date(`${input.date}T${input.time}:00`).toISOString();
  return {
    id: input.id,
    image: input.assetKey ? { source: 'asset', assetKey: input.assetKey } : null,
    originalNote: input.originalNote,
    title: input.title,
    description: input.description,
    tags: input.tags,
    date: input.date,
    time: input.time,
    location: input.location,
    favorite: input.favorite ?? false,
    rating: input.rating,
    createdAt,
    updatedAt: createdAt,
  };
}

/**
 * Demo-Erinnerungen, damit die App beim ersten Start gefüllt wirkt und die
 * Suche in natürlicher Sprache etwas zu finden hat.
 */
export const SEED_MOMENTS: Moment[] = [
  seed({
    id: 'seed-gelato-rome',
    assetKey: 'gelato-rome',
    date: '2026-09-12',
    time: '16:40',
    location: 'Rom, Italien',
    title: 'Pistazieneis nach dem Museum',
    description:
      'Nach dem Museum sind wir gelaufen, bis wir in einer Seitengasse eine kleine Gelateria gefunden haben. Das Pistazieneis war so gut, dass wir uns eine zweite Kugel geholt haben.',
    originalNote: 'bestes pistazieneis nach dem museum',
    tags: ['Rom', 'Italien', 'Eis', 'Essen', 'Museum'],
    rating: 5,
    favorite: true,
  }),
  seed({
    id: 'seed-pasta-class',
    assetKey: 'pasta-class',
    date: '2026-09-10',
    time: '19:15',
    location: 'Bologna, Italien',
    title: 'Tagliatelle von Hand',
    description:
      'Eine kleine Küche, überall Mehl und eine Nonna, die unseren Teig immer wieder gerettet hat. Wir haben alles aufgegessen, was wir gemacht haben.',
    originalNote: 'pastakurs in bologna, überall mehl',
    tags: ['Bologna', 'Italien', 'Pasta', 'Kochen', 'Essen'],
    rating: 4,
  }),
  seed({
    id: 'seed-sunset-sea',
    assetKey: 'sunset-sea',
    date: '2026-09-08',
    time: '20:05',
    location: 'Positano, Italien',
    title: 'Sonnenuntergang am Meer',
    description:
      'Wir sind den Küstenweg gegangen, genau als die Sonne ins Wasser gefallen ist. Der ganze Himmel wurde pfirsichfarben und das Meer war vollkommen still.',
    originalNote: 'spaziergang am meer, sonnenuntergang, ganz ruhig',
    tags: ['Sonnenuntergang', 'Strand', 'Spaziergang', 'Reise', 'Italien'],
    rating: 5,
    favorite: true,
  }),
  seed({
    id: 'seed-castle-hill',
    assetKey: 'castle-hill',
    date: '2026-08-23',
    time: '11:30',
    location: 'Edinburgh, Schottland',
    title: 'Die Burg über der Stadt',
    description:
      'Wir sind im Nieselregen hochgestiegen und oben haben die Wolken aufgerissen. Die ganze Stadt lag grau und golden unter uns.',
    originalNote: 'burg im regen, blick über die stadt',
    tags: ['Burg', 'Edinburgh', 'Schottland', 'Geschichte', 'Reise'],
    rating: 4,
  }),
  seed({
    id: 'seed-coffee-shop',
    assetKey: 'coffee-shop',
    date: '2026-07-05',
    time: '08:50',
    location: 'Lissabon, Portugal',
    title: 'Das kleine Café, das wir geliebt haben',
    description:
      'Vier Tische, ein sehr ernster Barista und der beste Flat White der ganzen Reise. Wir kamen jeden Morgen wieder, immer an denselben Platz am Fenster.',
    originalNote: 'kleines café, jeden morgen hin, super kaffee',
    tags: ['Kaffee', 'Café', 'Frühstück', 'Lissabon', 'Portugal'],
    rating: 5,
    favorite: true,
  }),
  seed({
    id: 'seed-market-flowers',
    assetKey: 'market-flowers',
    date: '2026-06-14',
    time: '09:20',
    location: 'Kopenhagen, Dänemark',
    title: 'Blumenmarkt am Samstagmorgen',
    description:
      'Eimer voller Tulpen und Dahlien auf dem Gehweg, alle noch halb verschlafen. Wir haben viel mehr Blumen gekauft, als wir tragen konnten.',
    originalNote: 'blumenmarkt samstagmorgen',
    tags: ['Markt', 'Blumen', 'Kopenhagen', 'Morgen', 'Stadt'],
    rating: 4,
  }),
  seed({
    id: 'seed-paris-bookshop',
    assetKey: null,
    date: '2026-05-02',
    time: '15:10',
    location: 'Paris, Frankreich',
    title: 'Regennachmittag im Buchladen',
    description:
      'Es hat so stark geregnet, dass wir uns zwei Stunden in einem Buchladen versteckt haben. Ich habe drei erste Kapitel gelesen und keines der Bücher gekauft.',
    originalNote: 'regentag, stundenlang im buchladen versteckt',
    tags: ['Paris', 'Frankreich', 'Bücher', 'Regen', 'Stadt'],
    rating: 3,
  }),
  seed({
    id: 'seed-apple-cake',
    assetKey: null,
    date: '2026-04-19',
    time: '14:00',
    location: 'München, Deutschland',
    title: 'Omas Apfelkuchen',
    description:
      'Sie wollte das Rezept nicht noch einmal aufschreiben, also habe ich zugeschaut und mitgeschrieben. Die Küche hat den ganzen Nachmittag nach Zimt gerochen.',
    originalNote: 'oma hat ihren apfelkuchen gemacht, rezept aufgeschrieben',
    tags: ['Familie', 'Backen', 'Apfelkuchen', 'München', 'Essen'],
    rating: 5,
    favorite: true,
  }),
];
