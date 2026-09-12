import { Image, type ImageSource } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Typography, useThemeColor } from 'heroui-native';
import { ChevronUp } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { PanResponder, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StepDots } from '@/components/StepDots';
import { LinearGradient } from '@/components/ui/primitives/LinearGradient';

const HERO: ImageSource = require('@/assets/brand/start-hero.png');
const REMORY_LOGO = require('@/assets/brand/remory-logo.png');

export default function StartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const [foreground] = useThemeColor(['foreground']);
  const [isNavigating, setIsNavigating] = useState(false);

  const openCapture = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push('/start/capture');
  }, [isNavigating, router]);

  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy < -12 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy < -55 || gesture.vy < -0.5) openCapture();
        },
      }),
    [openCapture],
  );

  return (
    <View
      className="bg-background flex-1"
      accessibilityActions={[{ name: 'activate', label: t('start.swipe') }]}
      onAccessibilityAction={openCapture}
      {...swipeResponder.panHandlers}
    >
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />
      <Image source={HERO} style={{ width, height, position: 'absolute' }} contentFit="cover" />
      <LinearGradient
        colors={['rgba(18,13,26,0.94)', 'rgba(18,13,26,0.30)', 'rgba(18,13,26,0.97)']}
        locations={[0, 0.42, 1]}
        className="absolute inset-0"
      />
      <View className="pt-safe-offset-8 pb-safe-offset-6 flex-1 items-center px-6">
        <Image
          source={REMORY_LOGO}
          accessibilityLabel="Remory – Remember. Relive. Remory."
          contentFit="contain"
          style={{ width: Math.min(width - 48, 280), height: Math.min(width - 48, 280) }}
        />
        <View className="flex-1" />
        <View className="items-center gap-1 pb-3">
          <ChevronUp size={26} color={foreground} strokeWidth={1.8} />
          <Typography.Paragraph type="body-sm" color="muted" align="center">
            {t('start.swipe')}
          </Typography.Paragraph>
        </View>
        <StepDots index={0} />
      </View>
    </View>
  );
}
