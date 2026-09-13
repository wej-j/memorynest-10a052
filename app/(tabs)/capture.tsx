import { useRouter } from 'expo-router';
import { Typography } from 'heroui-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CaptureForm } from '@/components/CaptureForm';
import { MomentFilmstrip } from '@/components/MomentFilmstrip';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { useMomentsStore } from '@/lib/momentsStore';

export default function CaptureScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const moments = useMomentsStore((state) => state.moments);
  return (
    <SafeAreaView edges={['top', 'bottom']} className="bg-background flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
        >
          <View className="gap-1 pb-5">
            <Typography.Heading type="h2">{t('capture.title')}</Typography.Heading>
            <Typography.Paragraph type="body-sm" color="muted">
              {t('capture.intro')}
            </Typography.Paragraph>
          </View>
          <View className="pb-5">
            <MomentFilmstrip
              moments={moments}
              onSelect={(momentId) =>
                router.push({ pathname: '/moment/[id]', params: { id: momentId } })
              }
            />
          </View>
          <CaptureForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
