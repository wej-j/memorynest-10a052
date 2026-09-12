import { Image, type ImageSource } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Typography, useThemeColor } from 'heroui-native';
import { ChevronUp } from 'lucide-react-native';
import { useCallback, useRef } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StepDots } from '@/components/StepDots';

const HERO: ImageSource = require('@/assets/brand/start-hero.png');
const REMORY_LOGO = require('@/assets/brand/remory-logo.png');
const SWIPE_DISTANCE = 56;

export default function StartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const [foreground] = useThemeColor(['foreground']);
  const touchStartY = useRef<number | null>(null);

  const openCapture = useCallback(() => {
    router.push('/start/capture');
  }, [router]);

  const logoSize = Math.min(width - 48, 360);

  return (
    <View
      className="bg-background flex-1 overflow-hidden"
      accessibilityActions={[{ name: 'activate', label: t('start.swipe') }]}
      onAccessibilityAction={openCapture}
      onTouchStart={(event) => {
        touchStartY.current = event.nativeEvent.pageY;
      }}
      onTouchEnd={(event) => {
        const startY = touchStartY.current;
        touchStartY.current = null;
        if (startY !== null && startY - event.nativeEvent.pageY >= SWIPE_DISTANCE) {
          openCapture();
        }
      }}
    >
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />
      <Image source={HERO} style={{ width, height, position: 'absolute' }} contentFit="cover" />
      <View className="bg-background/60 absolute inset-0" />

      <View className="pt-safe-offset-8 pb-safe-offset-8 flex-1 items-center px-6">
        <View className="flex-1 items-center justify-center">
          <Image
            source={REMORY_LOGO}
            accessibilityLabel="Remory – Remember. Relive. Remory."
            contentFit="contain"
            style={{ width: logoSize, height: logoSize }}
          />
        </View>

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
    </View>
  );
}
