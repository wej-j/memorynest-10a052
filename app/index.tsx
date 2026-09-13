import { Image, type ImageSource } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { LinearGradient } from '@/components/ui/primitives/LinearGradient';
import { brandTypography } from '@/lib/brandTypography';
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

const CAROUSEL_DURATION = 16_000;
const CARD_ASPECT_RATIO = 1.36;

type ReelPhoto = {
  fallback: ImageSource;
  key: string;
  source: ImageSource;
};

type OrbitingPhotoProps = {
  index: number;
  photo: ReelPhoto;
  progress: SharedValue<number>;
  stageWidth: number;
  total: number;
};

function OrbitingPhoto({ index, photo, progress, stageWidth, total }: OrbitingPhotoProps) {
  const scaleFactor = stageWidth / 390;
  const cardWidth = 112 * scaleFactor;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;
  const stageHeight = stageWidth * 0.52;
  const radiusX = (stageWidth - cardWidth) * 0.48;
  const radiusY = stageHeight * 0.16;
  const phase = (index / total) * Math.PI * 2;

  const animatedStyle = useAnimatedStyle(() => {
    const angle = progress.value * Math.PI * 2 + phase;
    const depth = (Math.cos(angle) + 1) / 2;
    const scale = 0.62 + depth * 0.48;

    return {
      opacity: 0.48 + depth * 0.52,
      zIndex: Math.round(depth * 100),
      transform: [
        { translateX: Math.sin(angle) * radiusX },
        { translateY: Math.cos(angle) * radiusY },
        { perspective: 700 },
        { rotateY: `${Math.sin(angle) * -18}deg` },
        { scale },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.orbitingPhoto,
        {
          width: cardWidth,
          height: cardHeight,
          left: (stageWidth - cardWidth) / 2,
          top: (stageHeight - cardHeight) / 2,
        },
        animatedStyle,
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
    </Animated.View>
  );
}

type MovingPhotoCarouselProps = {
  stageWidth: number;
};

function MovingPhotoCarousel({ stageWidth }: MovingPhotoCarouselProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const stageHeight = stageWidth * 0.52;
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
        withRepeat(
          withTiming(1, { duration: CAROUSEL_DURATION, easing: Easing.linear }),
          -1,
          false,
        ),
      );
    }

    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  return (
    <View style={[styles.carouselStage, { width: stageWidth, height: stageHeight }]}>
      <View
        style={[
          styles.orbitGuide,
          {
            width: stageWidth * 0.76,
            height: stageHeight * 0.44,
            left: stageWidth * 0.12,
            top: stageHeight * 0.3,
          },
        ]}
      />
      {photos.map((photo, index) => (
        <OrbitingPhoto
          key={photo.key}
          index={index}
          photo={photo}
          progress={progress}
          stageWidth={stageWidth}
          total={photos.length}
        />
      ))}
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
        style={{ top: compactHeight ? '29%' : '36%' }}
        pointerEvents="none"
      >
        <MovingPhotoCarousel stageWidth={stageWidth} />

        <View style={{ marginTop: compactHeight ? 4 : 8 }} className="items-center">
          <Text
            accessibilityRole="header"
            style={[
              brandTypography.wordmark,
              styles.wordmark,
              compactHeight && styles.compactWordmark,
            ]}
          >
            remory
          </Text>
          <Text
            style={[
              brandTypography.tagline,
              styles.tagline,
              compactHeight && styles.compactTagline,
            ]}
          >
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
  carouselStage: {
    position: 'relative',
    overflow: 'visible',
  },
  orbitGuide: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(229, 190, 255, 0.22)',
    borderRadius: 999,
    shadowColor: '#D7B2FF',
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  orbitingPhoto: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#CDA5F4',
    borderRadius: 16,
    backgroundColor: '#2C214A',
    shadowColor: '#D7B2FF',
    shadowOpacity: 0.34,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 7,
  },
  wordmark: {
    color: '#FDEBFF',
    fontSize: 76,
    lineHeight: 86,
    letterSpacing: -4.2,
    textShadowColor: '#E38AFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 19,
  },
  compactWordmark: {
    fontSize: 60,
    lineHeight: 69,
  },
  tagline: {
    color: '#F1CFFF',
    fontSize: 19,
    lineHeight: 27,
    letterSpacing: 0.15,
    textShadowColor: '#D16FFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  compactTagline: {
    fontSize: 16,
    lineHeight: 22,
  },
});
