import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CaptureForm } from '@/components/CaptureForm';
import { StepDots } from '@/components/StepDots';
import { StepHeader } from '@/components/StepHeader';
import { goBackOrReplace } from '@/lib/navigation';

export default function StartCaptureScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View className="bg-background pt-safe-offset-3 flex-1">
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />
      <StepHeader
        title={t('start.newMoment')}
        onBack={() => goBackOrReplace('/')}
        actionLabel={t('start.skip')}
        onAction={() => router.push('/start/collection')}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          <View className="pb-5">
            <StepDots index={1} />
          </View>
          <CaptureForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
