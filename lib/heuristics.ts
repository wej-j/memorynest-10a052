import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import { momentDateTime } from '@/lib/datetime';
import type { Moment, MomentDraft, MomentEnrichment } from '@/lib/types';

/* -------------------------------------------------------------------------- */
/*  Tagging                                                                    */
/* -------------------------------------------------------------------------- */

const TAG_RULES: { match: RegExp; tags: string[] }[] = [
  { match: /\b(gelato|ice ?cream)\b/i, tags: ['gelato', 'food'] },
  { match: /\b(coffee|espresso|latte|cappuccino|caf[eé])\b/i, tags: ['coffee', 'café'] },
  { match: /\b(breakfast|brunch)\b/i, tags: ['breakfast', 'food'] },
  { match: /\b(dinner|lunch|restaurant|pasta|pizza|sushi|ramen|tapas)\b/i, tags: ['food'] },
  { match: /\b(cake|bakery|baking|bread|pastry|dessert)\b/i, tags: ['baking', 'food'] },
  { match: /\b(museum|gallery|exhibition|theatre|concert)\b/i, tags: ['culture'] },
  { match: /\b(castle|fortress|ruins|cathedral|church|temple)\b/i, tags: ['history'] },
  { match: /\b(beach|sea|ocean|coast|swim)\b/i, tags: ['beach', 'nature'] },
  { match: /\b(sunset|sunrise|golden hour)\b/i, tags: ['sunset'] },
  { match: /\b(hike|hiking|mountain|forest|trail|lake|river)\b/i, tags: ['nature'] },
  { match: /\b(market|shopping|flowers)\b/i, tags: ['market'] },
  { match: /\b(train|flight|airport|road ?trip|hotel|trip|travel)\b/i, tags: ['travel'] },
  {
    match: /\b(family|mum|mom|dad|oma|grandma|grandpa|cousin|sister|brother)\b/i,
    tags: ['family'],
  },
  { match: /\b(friends|party|birthday|wedding|celebration)\b/i, tags: ['friends'] },
  { match: /\b(walk|walking|stroll|wander)\b/i, tags: ['walk'] },
  { match: /\b(rain|rainy|storm|snow)\b/i, tags: ['weather'] },
  { match: /\b(book|books|bookshop|reading)\b/i, tags: ['books'] },
  { match: /\b(dog|cat|puppy|kitten)\b/i, tags: ['animals'] },

  // Deutsch. Kein \b, weil Umlaute keine ASCII-Wortzeichen sind.
  { match: /(eisdiele|gelato|\beis\b)/i, tags: ['Eis', 'Essen'] },
  { match: /(kaffee|espresso|cappuccino|caf[eé])/i, tags: ['Kaffee', 'Café'] },
  { match: /(frühstück|brunch)/i, tags: ['Frühstück', 'Essen'] },
  { match: /(abendessen|mittagessen|restaurant|pasta|pizza|tapas|nudeln|essen)/i, tags: ['Essen'] },
  { match: /(kuchen|bäckerei|backen|brot|dessert)/i, tags: ['Backen', 'Essen'] },
  { match: /(museum|galerie|ausstellung|theater|konzert)/i, tags: ['Kultur'] },
  { match: /(burg|schloss|ruine|kathedrale|kirche|\bdom\b)/i, tags: ['Geschichte'] },
  { match: /(strand|meer|küste|schwimmen)/i, tags: ['Strand', 'Natur'] },
  { match: /(sonnenuntergang|sonnenaufgang)/i, tags: ['Sonnenuntergang'] },
  { match: /(wandern|wanderung|berg|wald|fluss|\bsee\b)/i, tags: ['Natur'] },
  { match: /(markt|einkaufen|blumen)/i, tags: ['Markt'] },
  { match: /(flughafen|hotel|reise|urlaub|ausflug|\bzug\b)/i, tags: ['Reise'] },
  { match: /(familie|mama|papa|\boma\b|\bopa\b|schwester|bruder)/i, tags: ['Familie'] },
  { match: /(freunde|party|geburtstag|hochzeit|feier)/i, tags: ['Freunde'] },
  { match: /(spaziergang|spazieren|bummeln)/i, tags: ['Spaziergang'] },
  { match: /(regen|sturm|schnee|gewitter)/i, tags: ['Wetter'] },
  { match: /(buchladen|bücher|\bbuch\b|lesen)/i, tags: ['Bücher'] },
  { match: /(\bhund\b|katze|welpe)/i, tags: ['Tiere'] },
];

const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'the',
  'of',
  'in',
  'on',
  'at',
  'to',
  'by',
  'for',
  'with',
  'after',
  'before',
  'from',
  // Deutsch
  'am',
  'an',
  'auf',
  'aus',
  'bei',
  'das',
  'dem',
  'den',
  'der',
  'des',
  'die',
  'ein',
  'eine',
  'einem',
  'einen',
  'einer',
  'für',
  'im',
  'in',
  'mit',
  'nach',
  'und',
  'vom',
  'von',
  'vor',
  'zu',
  'zum',
  'zur',
]);

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && SMALL_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function locationParts(location: string | null): string[] {
  if (!location) return [];
  return location
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function timeOfDay(time: string): string {
  const hour = Number.parseInt(time.slice(0, 2), 10);
  if (Number.isNaN(hour)) return 'Tag';
  if (hour < 11) return 'Morgen';
  if (hour < 15) return 'Mittag';
  if (hour < 19) return 'Nachmittag';
  return 'Abend';
}

function uniqueTags(tags: string[], limit = 6): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of tags) {
    const clean = tag.trim();
    if (clean.length === 0) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
    if (result.length >= limit) break;
  }
  return result;
}

/* -------------------------------------------------------------------------- */
/*  Offline enrichment                                                         */
/* -------------------------------------------------------------------------- */

/**
 * On-device enrichment used whenever the AI model is unavailable. It only
 * rephrases what the user gave us — it never invents facts.
 */
export function enrichOffline(draft: MomentDraft, photoPresent: boolean): MomentEnrichment {
  const note = draft.note.trim();
  const places = locationParts(draft.location);
  const haystack = [note, draft.location ?? ''].join(' ');

  const matchedTags = TAG_RULES.filter((rule) => rule.match.test(haystack)).flatMap(
    (rule) => rule.tags,
  );

  let title: string;
  if (note.length > 0) {
    const firstSentence = note.split(/[.!?\n]/)[0]?.trim() ?? note;
    const words = firstSentence.split(/\s+/).slice(0, 7).join(' ');
    title = titleCase(words.length > 0 ? words : note.slice(0, 48));
  } else if (places.length > 0) {
    title = `${timeOfDay(draft.time)} in ${places[0]}`;
  } else {
    title = `Moment am ${timeOfDay(draft.time)}`;
  }

  const sentences: string[] = [];
  if (note.length > 0) {
    const first = note.charAt(0).toUpperCase() + note.slice(1);
    sentences.push(/[.!?]$/.test(first) ? first : `${first}.`);
  } else if (photoPresent) {
    sentences.push('Ein Foto, ohne Worte gespeichert.');
  } else {
    sentences.push('Ein Moment, für später gespeichert.');
  }

  const dateLabel = format(momentDateTime({ date: draft.date, time: draft.time }), 'd. MMMM yyyy', {
    locale: de,
  });
  sentences.push(
    draft.location
      ? `Festgehalten in ${draft.location} am ${dateLabel}.`
      : `Festgehalten am ${dateLabel}.`,
  );

  return {
    title: title.slice(0, 70),
    description: sentences.join(' '),
    tags: uniqueTags([...matchedTags, ...places]),
    suggestedLocation: null,
    usedAI: false,
  };
}

export { uniqueTags };

/* -------------------------------------------------------------------------- */
/*  Offline natural-language search                                            */
/* -------------------------------------------------------------------------- */

const STOP_WORDS = new Set([
  'a',
  'about',
  'again',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'back',
  'be',
  'been',
  'best',
  'but',
  'by',
  'can',
  'did',
  'do',
  'does',
  'else',
  'find',
  'for',
  'from',
  'get',
  'go',
  'good',
  'great',
  'had',
  'has',
  'have',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'know',
  'like',
  'me',
  'memories',
  'memory',
  'moment',
  'moments',
  'my',
  'of',
  'on',
  'once',
  'one',
  'or',
  'our',
  'really',
  'remember',
  'show',
  'so',
  'some',
  'somewhere',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'time',
  'to',
  'us',
  'very',
  'was',
  'we',
  'went',
  'were',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'with',
  'you',
  'your',
  // Deutsch
  'aber',
  'alle',
  'als',
  'also',
  'auch',
  'auf',
  'aus',
  'bei',
  'bin',
  'bis',
  'dann',
  'das',
  'dass',
  'dein',
  'deine',
  'dem',
  'den',
  'der',
  'des',
  'die',
  'diese',
  'doch',
  'dort',
  'ein',
  'eine',
  'einem',
  'einen',
  'einer',
  'erinnerung',
  'erinnerungen',
  'etwas',
  'für',
  'ganz',
  'gut',
  'gute',
  'guten',
  'habe',
  'haben',
  'hatte',
  'ich',
  'ihr',
  'immer',
  'ist',
  'jetzt',
  'kann',
  'mal',
  'man',
  'mehr',
  'mein',
  'meine',
  'mich',
  'mir',
  'mit',
  'nach',
  'nicht',
  'noch',
  'nur',
  'oder',
  'ohne',
  'schon',
  'sehr',
  'sich',
  'sie',
  'sind',
  'über',
  'uns',
  'unser',
  'unsere',
  'von',
  'vor',
  'wann',
  'war',
  'waren',
  'was',
  'welche',
  'wieder',
  'zeig',
  'zeige',
  'zum',
  'zur',
]);

/** Phrase-level expansion so everyday wording finds the stored wording. */
const PHRASE_EXPANSIONS: { match: RegExp; add: string }[] = [
  { match: /ice ?cream/i, add: 'gelato dessert food' },
  { match: /\bcoffee|caf[eé]|espresso\b/i, add: 'coffee café breakfast' },
  { match: /\bfood|eat|ate|eating|meal|dinner|lunch\b/i, add: 'food restaurant' },
  { match: /\bsea|ocean|coast\b/i, add: 'beach sunset' },
  { match: /\bhill|fortress\b/i, add: 'castle history' },
  { match: /\bpicture|photo|photos\b/i, add: '' },
  { match: /\bcake|baked|baking\b/i, add: 'baking food family' },
  { match: /\bflower|flowers\b/i, add: 'market flowers' },
  { match: /\bbook|books|reading\b/i, add: 'books rain' },
  { match: /\bpasta|noodles\b/i, add: 'pasta cooking food' },

  // Deutsch: Alltagswörter auf die gespeicherten Tags mappen.
  { match: /(eis|gelato)/i, add: 'Eis Gelato Dessert Essen' },
  { match: /(kaffee|caf[eé]|espresso)/i, add: 'Kaffee Café Frühstück' },
  { match: /(essen|gegessen|restaurant|abendessen|mittagessen)/i, add: 'Essen Restaurant' },
  { match: /(meer|küste|strand)/i, add: 'Strand Sonnenuntergang Meer' },
  { match: /(burg|schloss|festung)/i, add: 'Burg Geschichte' },
  { match: /(blume|blumen)/i, add: 'Markt Blumen' },
  { match: /(buch|bücher|lesen)/i, add: 'Bücher Regen' },
  { match: /(pasta|nudeln)/i, add: 'Pasta Kochen Essen' },
  { match: /(kuchen|backen|gebacken)/i, add: 'Backen Familie Essen' },
  { match: /(museum|ausstellung)/i, add: 'Museum Kultur' },
  { match: /(reise|urlaub|unterwegs)/i, add: 'Reise' },
  { match: /(natur|wandern|berge)/i, add: 'Natur' },
];

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function momentHaystacks(moment: Moment) {
  const date = momentDateTime(moment);
  return {
    tags: moment.tags.map((tag) => tag.toLowerCase()),
    title: moment.title.toLowerCase(),
    body: `${moment.description} ${moment.originalNote}`.toLowerCase(),
    place: (moment.location ?? '').toLowerCase(),
    when: format(date, 'MMMM yyyy EEEE', { locale: de }).toLowerCase(),
  };
}

/** Keyword + synonym scoring, used when the AI model is unavailable. */
export function searchOffline(question: string, moments: Moment[]): string[] {
  let expanded = question;
  for (const rule of PHRASE_EXPANSIONS) {
    if (rule.add && rule.match.test(question)) expanded += ` ${rule.add}`;
  }

  const tokens = tokenize(expanded);
  if (tokens.length === 0) return [];

  const scored = moments.map((moment) => {
    const hay = momentHaystacks(moment);
    let score = 0;

    for (const token of tokens) {
      if (hay.tags.some((tag) => tag.includes(token) || token.includes(tag))) score += 4;
      if (hay.title.includes(token)) score += 3;
      if (hay.place.includes(token)) score += 3;
      if (hay.body.includes(token)) score += 2;
      if (hay.when.includes(token)) score += 2;
    }

    return { moment, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        momentDateTime(b.moment).getTime() - momentDateTime(a.moment).getTime(),
    )
    .slice(0, 8)
    .map((entry) => entry.moment.id);
}
