import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, useThemeColor } from 'heroui-native';
import { Check, SearchX } from 'lucide-react-native';
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

const back = () => goBackOrReplace('/');

export default function EditMomentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const moment = useMoment(id);
  const updateMoment = useMomentsStore((state) => state.updateMoment);
  const [accentForeground] = useThemeColor(['accent-foreground']);

  const [value, setValue] = useState<MomentFieldsValue>(() => ({
    title: moment?.title ?? '',
    description: moment?.description ?? '',
    date: moment?.date ?? '',
    time: moment?.time ?? '',
    location: moment?.location ?? '',
    tags: moment?.tags ?? [],
  }));

  if (!moment) {
    return (
      <SafeAreaView edges={['top']} className="bg-background flex-1">
        <ScreenHeader title="Edit moment" onBack={back} />
        <EmptyState
          icon={SearchX}
          title="This memory is no longer here."
          body="It may have been deleted."
          actionLabel="Back to moments"
          onAction={() => router.replace('/')}
        />
      </SafeAreaView>
    );
  }

  const save = () => {
    const location = value.location.trim();

    updateMoment(moment.id, {
      title: value.title.trim().length > 0 ? value.title.trim() : moment.title,
      description: value.description.trim(),
      tags: value.tags,
      date: isValidDateKey(value.date) ? value.date : moment.date,
      time: isValidTimeKey(value.time) ? value.time : moment.time,
      location: location.length > 0 ? location : null,
    });

    back();
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
          <ScreenHeader title="Edit moment" onBack={back} />

          <View className="gap-5 px-5 pt-2">
            {moment.image ? (
              <MomentPhoto
                image={moment.image}
                height={200}
                className="border-border rounded-3xl border"
              />
            ) : null}

            <MomentFields
              value={value}
              onChange={(patch) => setValue((current) => ({ ...current, ...patch }))}
            />

            <Button variant="primary" size="lg" onPress={save}>
              <Check size={18} color={accentForeground} />
              <Button.Label>Save changes</Button.Label>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
