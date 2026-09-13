import { Image, type ImageSource } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LinearGradient } from '@/components/ui/primitives/LinearGradient';

const SWIPE_DISTANCE = 48;
const MAX_STAGE_WIDTH = 560;

const PHOTOS: ImageSource[] = [
  require('@/assets/seed/gelato-rome.png'),
  require('@/assets/seed/sunset-sea.png'),
  require('@/assets/seed/coffee-shop.png'),
  require('@/assets/seed/castle-hill.png'),
  require('@/assets/seed/market-flowers.png'),
];

type PhotoLayout = {
  height: number;
  left: number;
  source: ImageSource;
  top: number;
  width: number;
  zIndex: number;
};

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
  const photoLayouts = useMemo<PhotoLayout[]>(() => {
    const scale = stageWidth / 390;
    const center = stageWidth / 2;
    const makeLayout = (
      source: ImageSource,
      offset: number,
      cardWidth: number,
      cardHeight: number,
      top: number,
      zIndex: number,
    ): PhotoLayout => ({
      source,
      width: cardWidth * scale,
      height: cardHeight * scale,
      left: center + offset * scale - (cardWidth * scale) / 2,
      top: top * scale,
      zIndex,
    });

    return [
      makeLayout(PHOTOS[0], -166, 82, 61, 26, 1),
      makeLayout(PHOTOS[1], -96, 142, 104, 15, 3),
      makeLayout(PHOTOS[2], 0, 96, 72, 23, 2),
      makeLayout(PHOTOS[3], 96, 142, 104, 15, 4),
      makeLayout(PHOTOS[4], 166, 82, 61, 26, 1),
    ];
  }, [stageWidth]);

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
        <View style={{ width: stageWidth, height: stageWidth * 0.36 }}>
          {photoLayouts.map((photo, index) => (
            <View
              // oxlint-disable-next-line eslint/no-array-index-key -- fixed decorative photo composition
              key={index}
              style={[
                styles.photoFrame,
                {
                  width: photo.width,
                  height: photo.height,
                  left: photo.left,
                  top: photo.top,
                  zIndex: photo.zIndex,
                },
              ]}
            >
              <Image
                source={photo.source}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={220}
              />
            </View>
          ))}
        </View>

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
  photoFrame: {
    position: 'absolute',
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
