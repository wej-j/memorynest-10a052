import { Image, type ImageSource } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Typography, useThemeColor } from 'heroui-native';
import { ChevronUp } from 'lucide-react-native';
import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StepDots } from '@/components/StepDots';

const HERO: ImageSource = require('@/assets/brand/start-background.png');
const SWIPE_DISTANCE = 48;

export default function StartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [foreground] = useThemeColor(['foreground']);
  const swipeStartY = useRef<number | null>(null);

  const openCapture = useCallback(() => {
    router.push('/start/capture');
  }, [router]);

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

      <Image source={HERO} style={styles.heroImage} contentFit="cover" />

      <View className="pb-safe-offset-6 absolute inset-x-0 bottom-0 items-center px-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('start.swipe')}
          onPress={openCapture}
          className="bg-background/70 w-full max-w-md items-center rounded-3xl px-5 py-4"
        >
          <View className="items-center gap-1.5 pb-3">
            <ChevronUp size={26} color={foreground} strokeWidth={2} />
            <Typography.Paragraph type="body-sm" align="center">
              {t('start.swipe')}
            </Typography.Paragraph>
          </View>
          <StepDots index={0} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: '100%',
  },
});
