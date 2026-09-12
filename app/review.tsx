import { useRouter } from 'expo-router';
import { Button, Typography, useThemeColor } from 'heroui-native';
import { Check, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { MomentFields, type MomentFieldsValue } from '@/components/MomentFields';
import { MomentGallery } from '@/components/MomentGallery';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { isValidDateKey, isValidTimeKey } from '@/lib/datetime';
import { useDraftStore } from '@/lib/draftStore';
import { useMomentsStore } from '@/lib/momentsStore';
import { goBackOrReplace } from '@/lib/navigation';

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
    location: draft.location ?? enrichment?.suggestedLocation ?? '',
    tags: enrichment?.tags ?? [],
    rating: null,
  }));

  if (!enrichment) {
    return (
      <SafeAreaView edges={['top']} className="bg-background flex-1 justify-center">
        <EmptyState
          icon={Sparkles}
          title="Kein Moment zum Prüfen."
          body="Halte zuerst einen Moment fest — dann kannst du hier Titel, Beschreibung und Stichwörter anpassen."
          actionLabel="Moment festhalten"
          onAction={() => router.replace('/capture')}
        />
      </SafeAreaView>
    );
  }

  const canSave = isValidDateKey(value.date) && isValidTimeKey(value.time);

  const save = () => {
    if (!canSave) return;

    const location = value.location.trim();
    addMoment({
      images: draft.images,
      originalNote: draft.note.trim(),
      title: value.title.trim().length > 0 ? value.title.trim() : 'Moment ohne Titel',
      description: value.description.trim(),
      tags: value.tags,
      date: value.date,
      time: value.time,
      location: location.length > 0 ? location : null,
      favorite: false,
      rating: value.rating,
    });

    resetDraft();
    router.replace('/moments');
  };

  return (
    <SafeAreaView edges={['top']} className="bg-background flex-1">
      <ScreenHeader
        title="Moment prüfen"
        subtitle={
          enrichment.usedAI
            ? 'Von der KI vorgeschlagen — du kannst alles ändern.'
            : 'Auf deinem Gerät erstellt — du kannst alles ändern.'
        }
        onBack={() => goBackOrReplace('/capture')}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 20 }}
        >
          <MomentGallery images={draft.images} height={240} />

          <MomentFields value={value} onChange={(patch) => setValue({ ...value, ...patch })} />

          {draft.note.trim().length > 0 ? (
            <View className="gap-1">
              <Typography.Paragraph type="body-sm" weight="medium">
                Deine Notiz
              </Typography.Paragraph>
              <Typography.Paragraph type="body-sm" color="muted">
                {draft.note.trim()}
              </Typography.Paragraph>
            </View>
          ) : null}

          <Button variant="primary" size="lg" onPress={save} isDisabled={!canSave}>
            <Check size={18} color={accentForeground} />
            <Button.Label>Moment speichern</Button.Label>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
