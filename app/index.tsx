import { Image, type ImageSource } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { LinearGradient } from '@/components/ui/primitives/LinearGradient';
import { randomWebPhotos, shuffle } from '@/lib/reelPhotos';

const SWIPE_DISTANCE = 48;
const MAX_STAGE_WIDTH = 560;

const PHOTOS: ImageSource[] = [
  require('@/assets/seed/gelato-rome.png'),
  require('@/assets/seed/sunset-sea.png'),
  require('@/assets/seed/coffee-shop.png'),
  require('@/assets/seed/castle-hill.png'),
  require('@/assets/seed/market-flowers.png'),
  require('@/assets/seed/pasta-class.png'),
];

const CARD_WIDTHS = [82, 142, 96, 142, 82, 120] as const;
const CARD_HEIGHTS = [61, 104, 72, 104, 61, 88] as const;
const CARD_TOPS = [25, 12, 24, 12, 25, 18] as const;
const REEL_DURATION = 18_000;

type ReelPhoto = {
  fallback: ImageSource;
  key: string;
  source: ImageSource;
};

type MovingPhotoReelProps = {
  stageWidth: number;
};

function MovingPhotoReel({ stageWidth }: MovingPhotoReelProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const scale = stageWidth / 390;
  const gap = -14 * scale;
  const reelWidth = useMemo(
    () => CARD_WIDTHS.reduce((total, cardWidth) => total + cardWidth * scale + gap, 0),
    [gap, scale],
  );
  const [photos] = useState<ReelPhoto[]>(() => {
    const fallbacks = shuffle(PHOTOS);
    const remotePhotos = randomWebPhotos(fallbacks.length);

    return fallbacks.map((fallback, index) => {
      const remotePhoto = remotePhotos[index];

      return {
        fallback,
        key: `start-photo-${index}`,
        source: remotePhoto ? { uri: remotePhoto } : fallback,
      };
    });
  });

  useEffect(() => {
    progress.set(0);
    if (!reduceMotion) {
      progress.set(
        withRepeat(withTiming(1, { duration: REEL_DURATION, easing: Easing.linear }), -1, false),
      );
    }

    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -progress.value * reelWidth }],
  }));

  return (
    <View style={{ width: stageWidth, height: stageWidth * 0.36, overflow: 'hidden' }}>
      <Animated.View
        style={[
          styles.reelTrack,
          { width: reelWidth * 2, height: stageWidth * 0.36 },
          animatedStyle,
        ]}
      >
        {[0, 1].map((copy) => (
          <View key={copy} style={[styles.reelGroup, { width: reelWidth }]}>
            {photos.map((photo, index) => (
              <View
                key={`${copy}-${photo.key}`}
                style={[
                  styles.photoFrame,
                  {
                    width: CARD_WIDTHS[index] * scale,
                    height: CARD_HEIGHTS[index] * scale,
                    marginRight: gap,
                    marginTop: CARD_TOPS[index] * scale,
                    zIndex: index % 2 === 0 ? 1 : 2,
                  },
                ]}
              >
                <Image
                  source={photo.source}
                  placeholder={photo.fallback}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  cachePolicy="disk"
                  transition={350}
                />
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export default function StartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const swipeStartY = useRef<number | null>(null);

  const openCapture = useCallback(() => {
    router.push('/start/capture');
  }, [router]);

  const stageWidth = Math.min(width - 24, MAX_STAGE_WIDTH);
  const compactHeight = height < 680;

  return (
    <View
      className="bg-background flex-1 overflow-hidden"
      accessibilityActions={[{ name: 'activate', label: t('start.swipe') }]}
      onAccessibilityAction={openCapture}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(event) => {
        swipeStartY.current = event.nativeEvent.pageY;
      }}
      onResponderRelease={(event) => {
        const startY = swipeStartY.current;
        swipeStartY.current = null;
        if (startY !== null && startY - event.nativeEvent.pageY >= SWIPE_DISTANCE) {
          openCapture();
        }
      }}
      onResponderTerminate={() => {
        swipeStartY.current = null;
      }}
    >
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />

      <LinearGradient
        colors={['#4B3678', '#2C214A', '#171225']}
        locations={[0, 0.58, 1]}
        className="absolute inset-0"
      />

      <View
        className="absolute inset-x-0 items-center px-3"
        style={{ top: compactHeight ? '33%' : '40%' }}
        pointerEvents="none"
      >
        <MovingPhotoReel stageWidth={stageWidth} />

        <View className={compactHeight ? 'mt-3 items-center' : 'mt-6 items-center'}>
          <Text
            accessibilityRole="header"
            style={[styles.wordmark, compactHeight && styles.compactWordmark]}
          >
            remory
          </Text>
          <Text style={[styles.tagline, compactHeight && styles.compactTagline]}>
            Remember. Relive. Remory.
          </Text>
        </View>
      </View>

      <View
        className="pb-safe-offset-4 absolute inset-x-0 bottom-0 items-center"
        pointerEvents="none"
      >
        <View className="bg-foreground/80 h-1 w-32 rounded-full" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reelTrack: {
    flexDirection: 'row',
  },
  reelGroup: {
    flexDirection: 'row',
  },
  photoFrame: {
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#CDA5F4',
    borderRadius: 16,
    backgroundColor: '#2C214A',
    shadowColor: '#D7B2FF',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 7,
  },
  wordmark: {
    color: '#F8E9FF',
    fontFamily: Platform.select({
      ios: 'Arial Rounded MT Bold',
      android: 'sans-serif-rounded',
      default: 'Inter',
    }),
    fontSize: 72,
    lineHeight: 82,
    fontWeight: '600',
    letterSpacing: -4,
    textShadowColor: '#D99BFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  compactWordmark: {
    fontSize: 58,
    lineHeight: 67,
  },
  tagline: {
    color: '#E4B7FF',
    fontFamily: 'Inter',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: 0.2,
    textShadowColor: '#C983F8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  compactTagline: {
    fontSize: 16,
    lineHeight: 22,
  },
});
