import { Image, type ImageSource } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Typography, useThemeColor } from 'heroui-native';
import { ChevronUp } from 'lucide-react-native';
import { useCallback, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StepDots } from '@/components/StepDots';

const HERO: ImageSource = require('@/assets/brand/start-background.png');
const SWIPE_DISTANCE = 56;

export default function StartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [foreground] = useThemeColor(['foreground']);
  const touchStartY = useRef<number | null>(null);

  const openCapture = useCallback(() => {
    router.push('/start/capture');
  }, [router]);

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
      <Image
        source={HERO}
        style={[StyleSheet.absoluteFill, styles.backgroundImage]}
        contentFit="cover"
      />
      <View className="bg-background/35 absolute inset-0" />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View className="pt-safe-offset-8 pb-safe-offset-8 min-h-full flex-1 items-center px-6">
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
});
