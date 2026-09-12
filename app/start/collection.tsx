import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button, SearchField, Typography } from 'heroui-native';
import { Sparkles, User } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { MomentCard } from '@/components/MomentCard';
import { StepDots } from '@/components/StepDots';
import { StepHeader } from '@/components/StepHeader';
import { useMomentsStore } from '@/lib/momentsStore';
import { goBackOrReplace } from '@/lib/navigation';

/**
 * Collected memories page (step 3 of 3): a search entry into
 * "Frag deine Erinnerungen" plus the newest moments.
 */
export default function StartCollectionScreen() {
  const router = useRouter();
  const moments = useMomentsStore((state) => state.moments);
  const [query, setQuery] = useState('');
  const preview = moments.slice(0, 3);

  const ask = () => {
    const trimmed = query.trim();
    router.replace(
      trimmed.length > 0 ? { pathname: '/search', params: { q: trimmed } } : '/search',
    );
  };

  return (
    <View className="bg-background pt-safe-offset-3 flex-1">
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />

      <StepHeader
        title="Deine Momente"
        onBack={() => goBackOrReplace('/start/capture')}
        actionLabel="Profil"
        actionIcon={User}
        onAction={() => router.replace('/profile')}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
        >
          <StepDots index={2} />

          <View className="gap-1">
            <Typography.Heading type="h3">Frag deine Erinnerungen</Typography.Heading>
            <Typography.Paragraph type="body-sm" color="muted">
              Du musst nicht wissen, was du geschrieben hast. Frag einfach, woran du dich erinnerst.
            </Typography.Paragraph>
          </View>

          <SearchField value={query} onChange={setQuery}>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                placeholder="z. B. „Wo gab es dieses gute Eis?“"
                returnKeyType="search"
                onSubmitEditing={ask}
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          {preview.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Hier leben bald deine Momente."
              body="Halte etwas fest, das du nicht vergessen willst — ein Foto, ein paar Worte oder beides."
            />
          ) : (
            preview.map((moment) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                onPress={() => router.push({ pathname: '/moment/[id]', params: { id: moment.id } })}
              />
            ))
          )}

          <Button variant="secondary" onPress={() => router.replace('/moments')}>
            <Button.Label>Alle Momente öffnen</Button.Label>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
