import { Image } from 'expo-image';
import { useEffect, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/ui/primitives/AnimatedView';
import { resolveMomentImage, type MomentImageSource } from '@/lib/images';
import type { Moment } from '@/lib/types';

/** Film-stock colors: deliberately fixed so the strip reads as photographic film. */
const FILM_BODY = '#211A15';
const PERFORATION = '#F6EADA';

const FRAME_WIDTH = 104;
const FRAME_HEIGHT = 74;
const FRAME_GAP = 8;
const LANE_WIDTH = FRAME_WIDTH + FRAME_GAP;
/** Time one frame takes to travel its own width. */
const PER_FRAME_MS = 2200;
/** Enough duplicated content to cover wide screens without a visible seam. */
const MIN_LOOP_WIDTH = 1200;
const PERFORATION_COUNT = 40;

type FilmFrame = {
  key: string;
  momentId: string;
  title: string;
  source: MomentImageSource;
};

type MomentFilmstripProps = {
  moments: Moment[];
  onSelect: (momentId: string) => void;
};

/**
 * Continuously scrolling reel of the user's photos, shown at the top of Moments.
 * Runs on the UI thread so it keeps moving while the list below scrolls.
 */
export function MomentFilmstrip({ moments, onSelect }: MomentFilmstripProps) {
  const frames = useMemo<FilmFrame[]>(() => {
    const withPhotos: FilmFrame[] = [];

    for (const moment of moments) {
      const source = resolveMomentImage(moment.image);
      if (!source) continue;
      withPhotos.push({
        key: moment.id,
        momentId: moment.id,
        title: moment.title,
        source,
      });
      if (withPhotos.length === 12) break;
    }

    return withPhotos;
  }, [moments]);

  const reelWidth = frames.length * LANE_WIDTH;
  const copies = reelWidth > 0 ? Math.max(2, Math.ceil(MIN_LOOP_WIDTH / reelWidth) + 1) : 0;
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.set(0);
    if (reelWidth <= 0) return undefined;

    offset.set(
      withRepeat(
        withTiming(-reelWidth, {
          duration: (reelWidth / LANE_WIDTH) * PER_FRAME_MS,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );

    return () => cancelAnimation(offset);
  }, [offset, reelWidth]);

  const reelStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));

  if (frames.length === 0) return null;

  return (
    <View
      className="overflow-hidden rounded-3xl shadow-sm"
      style={{ backgroundColor: FILM_BODY }}
      pointerEvents="box-none"
    >
      <Perforations />

      <View style={{ height: FRAME_HEIGHT }} className="justify-center overflow-hidden">
        <AnimatedView
          style={[reelStyle, { flexDirection: 'row', gap: FRAME_GAP, paddingLeft: FRAME_GAP }]}
        >
          {Array.from({ length: copies }).flatMap((_, copy) =>
            frames.map((frame) => (
              <Pressable
                key={`${copy}-${frame.key}`}
                accessibilityRole="button"
                accessibilityLabel={frame.title}
                onPress={() => onSelect(frame.momentId)}
                className="overflow-hidden rounded-lg active:opacity-80"
                style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
              >
                <Image
                  source={frame.source}
                  style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
                  contentFit="cover"
                  transition={260}
                />
              </Pressable>
            )),
          )}
        </AnimatedView>
      </View>

      <Perforations />
    </View>
  );
}

/** Sprocket holes running along the top and bottom edges of the strip. */
function Perforations() {
  return (
    <View className="flex-row gap-2 overflow-hidden px-2 py-2">
      {Array.from({ length: PERFORATION_COUNT }).map((_, index) => (
        <View
          // oxlint-disable-next-line eslint/no-array-index-key -- decorative, identical, fixed-length row
          key={index}
          className="rounded-[2px]"
          style={{ width: 8, height: 5, backgroundColor: PERFORATION, opacity: 0.85 }}
        />
      ))}
    </View>
  );
}
