import { Image } from 'expo-image';
import { useEffect } from 'react';
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
import type { MomentImageSource } from '@/lib/images';
import { cn } from '@/lib/utils';

/** Film-stock colors: deliberately fixed so the strip reads as photographic film. */
const FILM_BODY = '#17121F';
const PERFORATION = '#E7DAF8';

const FRAME_GAP = 8;
/** Enough duplicated content to cover wide screens without a visible seam. */
const MIN_LOOP_WIDTH = 1400;
const PERFORATION_COUNT = 48;

export type ReelFrame = {
  key: string;
  source: MomentImageSource;
  label?: string;
  onPress?: () => void;
};

type FilmReelProps = {
  frames: ReelFrame[];
  /** Travel direction of the strip. */
  direction?: 'left' | 'right';
  frameWidth?: number;
  frameHeight?: number;
  /** Milliseconds one frame needs to travel its own width. */
  perFrameMs?: number;
  className?: string;
};

/**
 * Continuously scrolling strip of photos, styled like a roll of film.
 * Runs on the UI thread so it keeps moving while lists scroll underneath.
 */
export function FilmReel({
  frames,
  direction = 'left',
  frameWidth = 104,
  frameHeight = 74,
  perFrameMs = 2200,
  className,
}: FilmReelProps) {
  const laneWidth = frameWidth + FRAME_GAP;
  const reelWidth = frames.length * laneWidth;
  const copies = reelWidth > 0 ? Math.max(2, Math.ceil(MIN_LOOP_WIDTH / reelWidth) + 1) : 0;
  const offset = useSharedValue(0);

  useEffect(() => {
    if (reelWidth <= 0) {
      offset.set(0);
      return undefined;
    }

    const from = direction === 'left' ? 0 : -reelWidth;
    const to = direction === 'left' ? -reelWidth : 0;

    offset.set(from);
    offset.set(
      withRepeat(
        withTiming(to, {
          duration: (reelWidth / laneWidth) * perFrameMs,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );

    return () => cancelAnimation(offset);
  }, [direction, laneWidth, offset, perFrameMs, reelWidth]);

  const reelStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));

  if (frames.length === 0) return null;

  return (
    <View
      className={cn('overflow-hidden rounded-3xl', className)}
      style={{ backgroundColor: FILM_BODY }}
      pointerEvents="box-none"
    >
      <Perforations />

      <View style={{ height: frameHeight }} className="justify-center overflow-hidden">
        <AnimatedView
          style={[reelStyle, { flexDirection: 'row', gap: FRAME_GAP, paddingLeft: FRAME_GAP }]}
        >
          {Array.from({ length: copies }).flatMap((_, copy) =>
            frames.map((frame) => (
              <Pressable
                key={`${copy}-${frame.key}`}
                accessibilityRole={frame.onPress ? 'button' : 'image'}
                accessibilityLabel={frame.label}
                onPress={frame.onPress}
                disabled={!frame.onPress}
                className="overflow-hidden rounded-lg active:opacity-80"
                style={{ width: frameWidth, height: frameHeight }}
              >
                <Image
                  source={frame.source}
                  style={{ width: frameWidth, height: frameHeight }}
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
          style={{ width: 8, height: 5, backgroundColor: PERFORATION, opacity: 0.8 }}
        />
      ))}
    </View>
  );
}
