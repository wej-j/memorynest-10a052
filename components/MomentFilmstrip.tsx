import { useMemo } from 'react';

import { FilmReel, type ReelFrame } from '@/components/FilmReel';
import { resolveMomentImage } from '@/lib/images';
import type { Moment } from '@/lib/types';

type MomentFilmstripProps = {
  moments: Moment[];
  onSelect: (momentId: string) => void;
};

/** Film reel built from the user's own photos, shown on the home screen. */
export function MomentFilmstrip({ moments, onSelect }: MomentFilmstripProps) {
  const frames = useMemo<ReelFrame[]>(() => {
    const result: ReelFrame[] = [];

    for (const moment of moments) {
      for (const [index, image] of moment.images.entries()) {
        const source = resolveMomentImage(image);
        if (!source) continue;
        result.push({
          key: `${moment.id}-${index}`,
          source,
          label: moment.title,
          onPress: () => onSelect(moment.id),
        });
        if (result.length === 12) return result;
      }
    }

    return result;
  }, [moments, onSelect]);

  return <FilmReel frames={frames} className="shadow-sm" />;
}
