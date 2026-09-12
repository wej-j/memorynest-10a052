/**
 * Core domain types for Remory.
 *
 * A Moment is intentionally forgiving: only `id`, `createdAt` and `updatedAt`
 * are guaranteed. Everything else can be empty because capturing must never
 * feel like filling in a form.
 */

/** A moment photo is either a bundled seed asset or a file on the device. */
export type MomentImage = { source: 'asset'; assetKey: string } | { source: 'file'; uri: string };

export type Moment = {
  id: string;
  images: MomentImage[];
  /** Exactly what the user typed when capturing. Never rewritten. */
  originalNote: string;
  title: string;
  description: string;
  tags: string[];
  /** Calendar day, `yyyy-MM-dd`. */
  date: string;
  /** Wall-clock time, `HH:mm`. */
  time: string;
  location: string | null;
  /** Heart on the card. */
  favorite: boolean;
  /** 1-5 stars, or null when the moment was never rated. */
  rating: number | null;
  createdAt: string;
  updatedAt: string;
};

/** What the user hands us on the capture screen, before any enrichment. */
export type MomentDraft = {
  images: MomentImage[];
  note: string;
  location: string | null;
  date: string;
  time: string;
};

/** What enrichment adds on top of a draft. */
export type MomentEnrichment = {
  title: string;
  description: string;
  tags: string[];
  suggestedLocation: string | null;
  /** True when a real model produced this, false for the on-device fallback. */
  usedAI: boolean;
};

export type SearchAnswer = {
  answer: string;
  momentIds: string[];
  usedAI: boolean;
};
