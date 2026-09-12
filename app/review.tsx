import { Redirect, useRouter } from 'expo-router';
import { Button, Typography, useThemeColor } from 'heroui-native';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { MomentFields, type MomentFieldsValue } from '@/components/MomentFields';
import { MomentPhoto } from '@/components/MomentPhoto';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { isValidDateKey, isValidTimeKey } from '@/lib/datetime';
import { useDraftStore } from '@/lib/draftStore';
import { useMomentsStore } from '@/lib/momentsStore';

export default function ReviewScreen() {
  const router = useRouter();
  const draft = useDraftStore((state) => state.draft);
  const enrichment = useDraftStore((state) => state.enrichment);
  const resetDraft = useDraftStore((state) => state.reset);
  const addMoment = useMomentsStore((state) => state.addMoment);
  const [accentForeground] = useThemeColor(['accent-foreground']);

  const [value, setValue] = useState<MomentFieldsValue>(() => ({
    title: enrichment?.title ?? '',
    description: enrichment?.description ?? '',
    date: draft.date,
    time: draft.time,
    location: draft.location ?? '',
    tags: enrichment?.tags ?? [],
  }));

  if (!enrichment) return <Redirect href="/capture" />;

  const save = () => {
    const location = value.location.trim();

    addMoment({
      image: draft.image,
      originalNote: draft.note.trim(),
      title: value.title.trim().length > 0 ? value.title.trim() : 'A moment worth keeping',
      description: value.description.trim(),
      tags: value.tags,
      date: isValidDateKey(value.date) ? value.date : draft.date,
      time: isValidTimeKey(value.time) ? value.time : draft.time,
      location: location.length > 0 ? location : null,
    });

    resetDraft();
    router.replace('/');
  };

  return (
    <SafeAreaView edges={['top']} className="bg-background flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <ScreenHeader
            title="Review your moment"
            subtitle={
              enrichment.usedAI
                ? 'Suggested for you — change anything that feels off.'
                : 'Drafted on your device — change anything that feels off.'
            }
            onBack={() => router.back()}
          />

          <View className="gap-5 px-5 pt-2">
            {draft.image ? (
              <MomentPhoto
                image={draft.image}
                height={240}
                className="border-border rounded-3xl border"
              />
            ) : null}

            <MomentFields
              value={value}
              onChange={(patch) => setValue((current) => ({ ...current, ...patch }))}
            />

            {draft.note.trim().length > 0 ? (
              <View className="border-border bg-surface-secondary gap-1 rounded-2xl border px-4 py-3">
                <Typography.Paragraph type="body-xs" color="muted">
                  Your original note
                </Typography.Paragraph>
                <Typography.Paragraph type="body-sm">{draft.note.trim()}</Typography.Paragraph>
              </View>
            ) : null}

            <Button variant="primary" size="lg" onPress={save}>
              <Check size={18} color={accentForeground} />
              <Button.Label>Save moment</Button.Label>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
