import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { momentDateTime } from '@/lib/datetime';
import { SEED_MOMENTS } from '@/lib/seed';
import type { Moment, MomentImage } from '@/lib/types';

export type NewMomentInput = Omit<Moment, 'id' | 'createdAt' | 'updatedAt'>;

type MomentsState = {
  moments: Moment[];
  hydrated: boolean;
  setHydrated: () => void;
  addMoment: (input: NewMomentInput) => Moment;
  updateMoment: (id: string, patch: Partial<NewMomentInput>) => void;
  deleteMoment: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setRating: (id: string, rating: number | null) => void;
};

function createId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Newest memory first. */
function sortMoments(moments: Moment[]): Moment[] {
  return [...moments].sort((a, b) => momentDateTime(b).getTime() - momentDateTime(a).getTime());
}

type LegacyMoment = Omit<Moment, 'images'> & {
  image?: MomentImage | null;
  images?: MomentImage[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMomentImage(value: unknown): value is MomentImage {
  if (!isRecord(value) || typeof value.source !== 'string') return false;

  return (
    (value.source === 'asset' && typeof value.assetKey === 'string') ||
    (value.source === 'file' && typeof value.uri === 'string')
  );
}

function isLegacyMoment(value: unknown): value is LegacyMoment {
  if (!isRecord(value)) return false;

  const imageIsValid =
    value.image === undefined || value.image === null || isMomentImage(value.image);
  const imagesAreValid =
    value.images === undefined ||
    (Array.isArray(value.images) && value.images.every(isMomentImage));

  return (
    typeof value.id === 'string' &&
    typeof value.originalNote === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === 'string') &&
    typeof value.date === 'string' &&
    typeof value.time === 'string' &&
    (value.location === null || typeof value.location === 'string') &&
    typeof value.favorite === 'boolean' &&
    (value.rating === null || typeof value.rating === 'number') &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    imageIsValid &&
    imagesAreValid
  );
}

function legacyMomentsFromPersistedState(persistedState: unknown): LegacyMoment[] {
  if (!isRecord(persistedState) || !Array.isArray(persistedState.moments)) return [];

  return persistedState.moments.filter(isLegacyMoment);
}

function normalizeMoment(moment: LegacyMoment): Moment {
  const { image, ...rest } = moment;
  return {
    ...rest,
    images: Array.isArray(moment.images) ? moment.images : image ? [image] : [],
  };
}

export const useMomentsStore = create<MomentsState>()(
  persist(
    (set, get) => ({
      moments: sortMoments(SEED_MOMENTS),
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      addMoment: (input) => {
        const now = new Date().toISOString();
        const moment: Moment = { ...input, id: createId(), createdAt: now, updatedAt: now };
        set({ moments: sortMoments([moment, ...get().moments]) });
        return moment;
      },

      updateMoment: (id, patch) => {
        const now = new Date().toISOString();
        set({
          moments: sortMoments(
            get().moments.map((moment) =>
              moment.id === id ? { ...moment, ...patch, updatedAt: now } : moment,
            ),
          ),
        });
      },

      deleteMoment: (id) => {
        set({ moments: get().moments.filter((moment) => moment.id !== id) });
      },

      toggleFavorite: (id) => {
        set({
          moments: get().moments.map((moment) =>
            moment.id === id ? { ...moment, favorite: !moment.favorite } : moment,
          ),
        });
      },

      setRating: (id, rating) => {
        set({
          moments: get().moments.map((moment) =>
            moment.id === id ? { ...moment, rating } : moment,
          ),
        });
      },
    }),
    {
      name: 'remory/v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState) => ({
        moments: legacyMomentsFromPersistedState(persistedState).map(normalizeMoment),
      }),
      // Only the memories are persisted; the rest is runtime state.
      partialize: (state) => ({ moments: state.moments }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/** Look up a single memory by id. */
export function useMoment(id: string | undefined): Moment | undefined {
  return useMomentsStore((state) => state.moments.find((moment) => moment.id === id));
}
