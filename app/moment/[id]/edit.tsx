import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, useThemeColor } from 'heroui-native';
import { CalendarDays, Check } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { MomentFields, type MomentFieldsValue } from '@/components/MomentFields';
import { MomentPhoto } from '@/components/MomentPhoto';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { isValidDateKey, isValidTimeKey } from '@/lib/datetime';
import { useMoment, useMomentsStore } from '@/lib/momentsStore';
import { goBackOrReplace } from '@/lib/navigation';

export default function EditMomentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const moment = useMoment(id);
  const updateMoment = useMomentsStore((state) => state.updateMoment);
  const [accentForeground] = useThemeColor(['accent-foreground']);

  const [value, setValue] = useState<MomentFieldsValue | null>(() =>
    moment
      ? {
          title: moment.title,
          description: moment.description,
          date: moment.date,
          time: moment.time,
          location: moment.location ?? '',
          tags: moment.tags,
          rating: moment.rating,
        }
      : null,
  );

  if (!moment || !value) {
    return (
      <SafeAreaView edges={['top']} className="bg-background flex-1 justify-center">
        <EmptyState
          icon={CalendarDays}
          title="Diese Erinnerung gibt es nicht mehr."
          body="Vielleicht wurde sie gelöscht. Deine anderen Momente sind noch da."
          actionLabel="Zu meinen Momenten"
          onAction={() => router.replace('/moments')}
        />
      </SafeAreaView>
    );
  }

  const canSave = isValidDateKey(value.date) && isValidTimeKey(value.time);

  const save = () => {
    if (!canSave) return;

    const location = value.location.trim();
    updateMoment(moment.id, {
      title: value.title.trim().length > 0 ? value.title.trim() : 'Moment ohne Titel',
      description: value.description.trim(),
      date: value.date,
      time: value.time,
      location: location.length > 0 ? location : null,
      tags: value.tags,
      rating: value.rating,
    });

    goBackOrReplace({ pathname: '/moment/[id]', params: { id: moment.id } });
  };

  return (
    <SafeAreaView edges={['top']} className="bg-background flex-1">
      <ScreenHeader
        title="Moment bearbeiten"
        onBack={() => goBackOrReplace({ pathname: '/moment/[id]', params: { id: moment.id } })}
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
          {moment.image ? (
            <MomentPhoto
              image={moment.image}
              height={200}
              className="border-border/60 rounded-3xl border"
            />
          ) : null}

          <MomentFields value={value} onChange={(patch) => setValue({ ...value, ...patch })} />

          <View className="gap-3">
            <Button variant="primary" size="lg" onPress={save} isDisabled={!canSave}>
              <Check size={18} color={accentForeground} />
              <Button.Label>Änderungen speichern</Button.Label>
            </Button>

            <Button
              variant="tertiary"
              onPress={() =>
                goBackOrReplace({ pathname: '/moment/[id]', params: { id: moment.id } })
              }
            >
              <Button.Label>Abbrechen</Button.Label>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
