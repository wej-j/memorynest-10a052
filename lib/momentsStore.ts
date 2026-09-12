import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { momentDateTime } from '@/lib/datetime';
import { SEED_MOMENTS } from '@/lib/seed';
import type { Moment } from '@/lib/types';

export type NewMomentInput = Omit<Moment, 'id' | 'createdAt' | 'updatedAt'>;

type MomentsState = {
  moments: Moment[];
  hydrated: boolean;
  setHydrated: () => void;
  addMoment: (input: NewMomentInput) => Moment;
  updateMoment: (id: string, patch: Partial<NewMomentInput>) => void;
  deleteMoment: (id: string) => void;
};

function createId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Newest memory first. */
function sortMoments(moments: Moment[]): Moment[] {
  return [...moments].sort((a, b) => momentDateTime(b).getTime() - momentDateTime(a).getTime());
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
    }),
    {
      name: 'collecting-moments/v1',
      storage: createJSONStorage(() => AsyncStorage),
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
