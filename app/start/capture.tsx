import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { CaptureForm } from '@/components/CaptureForm';
import { StepDots } from '@/components/StepDots';
import { StepHeader } from '@/components/StepHeader';
import { goBackOrReplace } from '@/lib/navigation';

/**
 * Add-memory page (step 2 of 3). Everything is optional; "Überspringen"
 * continues to the collected memories.
 */
export default function StartCaptureScreen() {
  const router = useRouter();

  return (
    <View className="bg-background pt-safe-offset-3 flex-1">
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />

      <StepHeader
        title="Neuer Moment"
        onBack={() => goBackOrReplace('/')}
        actionLabel="Überspringen"
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
