import { momentDateTime } from '@/lib/datetime';
import { enrichOffline, searchOffline, uniqueTags } from '@/lib/heuristics';
import type { Moment, MomentDraft, MomentEnrichment, SearchAnswer } from '@/lib/types';

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

/** True when a model key is configured; the app stays fully usable without one. */
export const aiEnabled = API_KEY.trim().length > 0;

type ChatContent =
  | string
  | ({ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } })[];
type ChatMessage = { role: 'system' | 'user'; content: ChatContent };

async function requestJSON(messages: ChatMessage[], timeoutMs = 30_000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 700,
        response_format: { type: 'json_object' },
        messages,
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Model request failed (${response.status})`);

    const payload: unknown = await response.json();
    const choices = isRecord(payload) ? payload.choices : undefined;
    const first = Array.isArray(choices) ? choices[0] : undefined;
    const message = isRecord(first) ? first.message : undefined;
    const content =
      isRecord(message) && typeof message.content === 'string' ? message.content : null;
    if (!content) throw new Error('Empty model response');

    return JSON.parse(content);
  } finally {
    clearTimeout(timer);
  }
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/* -------------------------------------------------------------------------- */
/*  Enrichment                                                                 */
/* -------------------------------------------------------------------------- */

const ENRICH_SYSTEM = [
  'You help someone keep a personal memory journal.',
  'From a short note, optional photos, a date and an optional location, write a warm but factual memory entry.',
  'Always write in German, using informal "du" wording. Never answer in English.',
  'Never invent specific facts (names, prices, dishes, cities) that are not supported by the note, photo or location.',
  'If the input is thin, stay general rather than making things up.',
  'Reply with JSON only, shaped as:',
  '{"title": string, "description": string, "tags": string[], "location": string | null}',
  'title: German, max 6 words, no quotes, no trailing period.',
  'description: German, 1-3 short sentences written as a memory.',
  'tags: 3-6 short German tags; nouns capitalised as usual in German, real place names keep their spelling.',
  'location: only a place you can actually justify from the photo or note, otherwise null.',
].join(' ');

export async function enrichMoment(
  draft: MomentDraft,
  photoBase64s: string[],
): Promise<MomentEnrichment> {
  const attachedPhotos = photoBase64s.slice(0, 4);
  const fallback = enrichOffline(draft, draft.images.length > 0);
  if (!aiEnabled) return fallback;

  const details = [
    `Note from the user: ${draft.note.trim() || '(none)'}`,
    `Date: ${draft.date} ${draft.time}`,
    `Location: ${draft.location ?? '(unknown)'}`,
    attachedPhotos.length > 0
      ? `${attachedPhotos.length} photo(s) of the moment are attached.`
      : 'No photo was attached.',
  ].join('\n');

  const userContent: ChatContent =
    attachedPhotos.length > 0
      ? [
          { type: 'text', text: details },
          ...attachedPhotos.map((photoBase64) => ({
            type: 'image_url' as const,
            image_url: { url: `data:image/jpeg;base64,${photoBase64}` },
          })),
        ]
      : details;

  try {
    const data = await requestJSON([
      { role: 'system', content: ENRICH_SYSTEM },
      { role: 'user', content: userContent },
    ]);

    if (!isRecord(data)) return fallback;
    const record = data;

    const tags = uniqueTags(asStringArray(record.tags));

    return {
      title: asString(record.title) ?? fallback.title,
      description: asString(record.description) ?? fallback.description,
      tags: tags.length > 0 ? tags : fallback.tags,
      suggestedLocation: draft.location ? null : asString(record.location),
      usedAI: true,
    };
  } catch {
    return fallback;
  }
}

/* -------------------------------------------------------------------------- */
/*  Natural-language search                                                    */
/* -------------------------------------------------------------------------- */

const SEARCH_SYSTEM = [
  'You are the search engine of a personal memory journal.',
  'You receive the full list of saved memories and a question asked in everyday language.',
  'The user writes and reads German; always answer in German using informal "du" wording.',
  'Pick the memories that genuinely answer the question, most relevant first, at most 5.',
  'Match on meaning, not exact words: "Eis" should find Gelato, "Café" should find Kaffee.',
  'If nothing fits, return an empty list and say so plainly.',
  'Reply with JSON only, shaped as: {"answer": string, "momentIds": string[]}',
  'answer: one warm German sentence, max 25 words, referring to what was found. Never invent memories.',
].join(' ');

function describeAnswer(count: number): string {
  if (count === 0) {
    return 'Dazu habe ich noch nichts gefunden. Frag nach einem Ort, einem Essen oder einem Gefühl.';
  }
  if (count === 1) return 'Eine Erinnerung passt zu deiner Frage.';
  return `${count} Erinnerungen passen zu deiner Frage.`;
}

export async function askMemories(question: string, moments: Moment[]): Promise<SearchAnswer> {
  const trimmed = question.trim();
  if (trimmed.length === 0) return { answer: '', momentIds: [], usedAI: false };

  const offlineIds = searchOffline(trimmed, moments);
  const fallback: SearchAnswer = {
    answer: describeAnswer(offlineIds.length),
    momentIds: offlineIds,
    usedAI: false,
  };

  if (!aiEnabled || moments.length === 0) return fallback;

  const catalogue = moments.map((moment) => ({
    id: moment.id,
    title: moment.title,
    description: moment.description,
    note: moment.originalNote,
    tags: moment.tags,
    date: momentDateTime(moment).toISOString().slice(0, 10),
    location: moment.location,
  }));

  try {
    const data = await requestJSON([
      { role: 'system', content: SEARCH_SYSTEM },
      {
        role: 'user',
        content: `Question: ${trimmed}\n\nMemories:\n${JSON.stringify(catalogue)}`,
      },
    ]);

    if (!isRecord(data)) return fallback;
    const record = data;

    const known = new Set(moments.map((moment) => moment.id));
    const ids = asStringArray(record.momentIds).filter((id) => known.has(id));

    return {
      answer: asString(record.answer) ?? describeAnswer(ids.length),
      momentIds: ids,
      usedAI: true,
    };
  } catch {
    return fallback;
  }
}
