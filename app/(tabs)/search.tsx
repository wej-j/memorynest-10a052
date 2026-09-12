import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Chip, SearchField, Spinner, Typography, useThemeColor } from 'heroui-native';
import { MessageCircleQuestion, Search } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { MomentCard } from '@/components/MomentCard';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { askMemories } from '@/lib/ai';
import { useMomentsStore } from '@/lib/momentsStore';
import type { Moment } from '@/lib/types';

const EXAMPLES = [
  'Wo haben wir dieses wirklich gute Eis gegessen?',
  'Was haben wir nach dem Museum gemacht?',
  'Zeig mir meine Essens-Momente aus Rom.',
  'Wann war ich bei dieser Burg?',
  'Zeig mir Erinnerungen mit Kaffee.',
];

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; answer: string; results: Moment[] };

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const moments = useMomentsStore((state) => state.moments);
  const [accentForeground] = useThemeColor(['accent-foreground']);

  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const askedFor = useRef<string | null>(null);

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const moment of moments) {
      for (const tag of moment.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de'))
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [moments]);

  const run = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (trimmed.length === 0) return;

      setQuery(trimmed);
      setState({ status: 'loading' });

      const answer = await askMemories(trimmed, moments);
      const results = answer.momentIds
        .map((id) => moments.find((moment) => moment.id === id))
        .filter((moment): moment is Moment => moment !== undefined);

      setState({ status: 'done', answer: answer.answer, results });
    },
    [moments],
  );

  // A question handed over from the start pager runs on arrival.
  useEffect(() => {
    const incoming = typeof params.q === 'string' ? params.q.trim() : '';
    if (incoming.length === 0 || askedFor.current === incoming) return;
    askedFor.current = incoming;
    void run(incoming);
  }, [params.q, run]);

  return (
    <SafeAreaView edges={['top']} className="bg-background flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
        >
          <View className="gap-1 pb-4">
            <Typography.Heading type="h2">Suchen</Typography.Heading>
            <Typography.Paragraph type="body-sm" color="muted">
              Du musst nicht wissen, was du geschrieben hast. Frag einfach, woran du dich erinnerst.
            </Typography.Paragraph>
          </View>

          <View className="gap-3">
            <SearchField value={query} onChange={setQuery}>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  placeholder="z. B. „Strand“, „Paris“, „gutes Essen“ ..."
                  returnKeyType="search"
                  onSubmitEditing={() => void run(query)}
                />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>

            <Button
              variant="primary"
              onPress={() => void run(query)}
              isDisabled={query.trim().length === 0 || state.status === 'loading'}
            >
              <Search size={18} color={accentForeground} />
              <Button.Label>Fragen</Button.Label>
            </Button>
          </View>

          {popularTags.length > 0 ? (
            <View className="gap-2.5 pt-6">
              <Typography.Paragraph type="body-sm" weight="medium">
                Beliebte Tags
              </Typography.Paragraph>

              <View className="flex-row flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Pressable
                    key={tag}
                    accessibilityRole="button"
                    accessibilityLabel={`Nach ${tag} suchen`}
                    onPress={() => void run(tag)}
                    className="active:opacity-70"
                  >
                    <Chip size="md" variant="secondary">
                      <Chip.Label>{tag}</Chip.Label>
                    </Chip>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {state.status === 'idle' ? (
            <View className="gap-3 pt-6">
              <Typography.Paragraph type="body-sm" weight="medium">
                Frag zum Beispiel
              </Typography.Paragraph>

              {EXAMPLES.map((example) => (
                <Pressable
                  key={example}
                  accessibilityRole="button"
                  onPress={() => void run(example)}
                  className="border-border/60 bg-surface rounded-2xl border px-4 py-3 active:opacity-80"
                >
                  <Typography.Paragraph type="body-sm">{example}</Typography.Paragraph>
                </Pressable>
              ))}
            </View>
          ) : null}

          {state.status === 'loading' ? (
            <View className="items-center gap-3 pt-14">
              <Spinner size="lg" />
              <Typography.Paragraph type="body-sm" color="muted">
                Ich schaue deine Erinnerungen durch ...
              </Typography.Paragraph>
            </View>
          ) : null}

          {state.status === 'done' ? (
            <View className="gap-4 pt-6">
              <Typography.Paragraph type="body-sm" color="muted">
                {state.answer}
              </Typography.Paragraph>

              {state.results.length === 0 ? (
                <EmptyState
                  icon={MessageCircleQuestion}
                  title="Dazu passt noch keine Erinnerung."
                  body="Frag nach einem Ort, einem Essen oder einem Gefühl — oder halte den Moment fest, den du meinst."
                />
              ) : (
                state.results.map((moment) => (
                  <MomentCard
                    key={moment.id}
                    moment={moment}
                    onPress={() =>
                      router.push({ pathname: '/moment/[id]', params: { id: moment.id } })
                    }
                  />
                ))
              )}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
