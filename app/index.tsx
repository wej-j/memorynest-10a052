import { Image, type ImageSource } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Typography, useThemeColor } from 'heroui-native';
import { ChevronUp } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Animated, Easing, Pressable, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StepDots } from '@/components/StepDots';
import { LinearGradient } from '@/components/ui/primitives/LinearGradient';

const HERO: ImageSource = require('@/assets/brand/start-hero.png');
const REMORY_LOGO = require('@/assets/brand/remory-logo.png');
const TRANSITION_DURATION = 320;

type SwipeGesture = {
  startX: number;
  startY: number;
  lastY: number;
  lastTimestamp: number;
};

export default function StartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const [foreground] = useThemeColor(['foreground']);
  const isNavigatingRef = useRef(false);
  const swipeGestureRef = useRef<SwipeGesture | null>(null);
  const [translateY] = useState(() => new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      translateY.setValue(0);
      isNavigatingRef.current = false;
    }, [translateY]),
  );

  const openCapture = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    Animated.timing(translateY, {
      toValue: -height,
      duration: TRANSITION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) router.push('/start/capture');
    });
  }, [height, router, translateY]);

  const resetPosition = useCallback(() => {
    Animated.spring(translateY, {
      toValue: 0,
      damping: 20,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const logoSize = Math.min(width - 72, 250);

  return (
    <View className="bg-background flex-1">
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />

      <View className="pt-safe-offset-10 flex-1 items-center">
        <Typography.Heading>{t('start.newMoment')}</Typography.Heading>
      </View>

      <Animated.View
        className="bg-background absolute inset-0 overflow-hidden"
        style={{ transform: [{ translateY }] }}
        accessibilityActions={[{ name: 'activate', label: t('start.swipe') }]}
        onAccessibilityAction={openCapture}
        onTouchStart={(event) => {
          const { pageX, pageY, timestamp } = event.nativeEvent;
          swipeGestureRef.current = {
            startX: pageX,
            startY: pageY,
            lastY: pageY,
            lastTimestamp: timestamp,
          };
        }}
        onMoveShouldSetResponder={(event) => {
          const gesture = swipeGestureRef.current;
          if (!gesture) return false;

          const deltaY = event.nativeEvent.pageY - gesture.startY;
          const deltaX = event.nativeEvent.pageX - gesture.startX;
          return deltaY < -8 && Math.abs(deltaY) > Math.abs(deltaX);
        }}
        onResponderMove={(event) => {
          const gesture = swipeGestureRef.current;
          if (!gesture) return;

          const { pageY, timestamp } = event.nativeEvent;
          translateY.setValue(Math.min(0, pageY - gesture.startY));
          swipeGestureRef.current = { ...gesture, lastY: pageY, lastTimestamp: timestamp };
        }}
        onResponderRelease={(event) => {
          const gesture = swipeGestureRef.current;
          swipeGestureRef.current = null;
          if (!gesture) return;

          const { pageY, timestamp } = event.nativeEvent;
          const deltaY = pageY - gesture.startY;
          const elapsed = Math.max(timestamp - gesture.lastTimestamp, 1);
          const velocityY = (pageY - gesture.lastY) / elapsed;
          if (deltaY < -70 || velocityY < -0.55) {
            openCapture();
          } else {
            resetPosition();
          }
        }}
        onResponderTerminate={() => {
          swipeGestureRef.current = null;
          resetPosition();
        }}
      >
        <Image source={HERO} style={{ width, height, position: 'absolute' }} contentFit="cover" />
        <LinearGradient
          colors={['rgba(18,13,26,0.80)', 'rgba(18,13,26,0.16)', 'rgba(13,9,20,0.96)']}
          locations={[0, 0.48, 1]}
          className="absolute inset-0"
        />

        <View className="pt-safe-offset-6 pb-safe-offset-7 flex-1 items-center px-6">
          <Image
            source={REMORY_LOGO}
            accessibilityLabel="Remory – Remember. Relive. Remory."
            contentFit="contain"
            style={{ width: logoSize, height: logoSize }}
          />
          <View className="flex-1" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('start.swipe')}
            onPress={openCapture}
            className="w-full items-center px-2 py-2"
          >
            <View className="items-center gap-2 pb-4">
              <ChevronUp size={25} color={foreground} strokeWidth={1.8} />
              <Typography.Paragraph type="body-sm" color="muted" align="center">
                {t('start.swipe')}
              </Typography.Paragraph>
            </View>
            <StepDots index={0} />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
