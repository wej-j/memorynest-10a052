import { create } from 'zustand';

import { toDateKey, toTimeKey } from '@/lib/datetime';
import type { MomentDraft, MomentEnrichment, MomentImage } from '@/lib/types';

type DraftState = {
  draft: MomentDraft;
  enrichment: MomentEnrichment | null;
  setImages: (images: MomentImage[]) => void;
  setNote: (note: string) => void;
  setLocation: (location: string | null) => void;
  setDateTime: (date: string, time: string) => void;
  setEnrichment: (enrichment: MomentEnrichment | null) => void;
  reset: () => void;
};

function emptyDraft(): MomentDraft {
  const now = new Date();
  return {
    images: [],
    note: '',
    location: null,
    date: toDateKey(now),
    time: toTimeKey(now),
  };
}

/**
 * Holds the memory currently being captured so the capture screen and the
 * review screen can work on the same thing. Deliberately not persisted.
 */
export const useDraftStore = create<DraftState>()((set) => ({
  draft: emptyDraft(),
  enrichment: null,

  setImages: (images) => set((state) => ({ draft: { ...state.draft, images } })),
  setNote: (note) => set((state) => ({ draft: { ...state.draft, note } })),
  setLocation: (location) => set((state) => ({ draft: { ...state.draft, location } })),
  setDateTime: (date, time) => set((state) => ({ draft: { ...state.draft, date, time } })),
  setEnrichment: (enrichment) => set({ enrichment }),
  reset: () => set({ draft: emptyDraft(), enrichment: null }),
}));
