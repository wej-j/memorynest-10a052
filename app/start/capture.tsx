import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { goBackOrReplace } from '@/lib/navigation';

export default function StartCaptureScreen() {
  const { t } = useTranslation();

  return (
    <View className="bg-background pt-safe-offset-3 flex-1">
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />
      <ScreenHeader title={t('start.newMoment')} onBack={() => goBackOrReplace('/')} />
    </View>
  );
}
