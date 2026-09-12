import { useRouter } from 'expo-router';
import { Button, SearchField, Spinner, Typography, useThemeColor } from 'heroui-native';
import { MessageCircleQuestion, Search } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { MomentCard } from '@/components/MomentCard';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { askMemories } from '@/lib/ai';
import { useMomentsStore } from '@/lib/momentsStore';
import type { Moment } from '@/lib/types';

const EXAMPLES = [
  'Where did we eat that really good ice cream?',
  'What did we do after visiting the museum?',
  'Show me my food memories from Rome.',
  'When did I visit that castle?',
  'Show me memories involving coffee.',
];

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; answer: string; results: Moment[] };

export default function SearchScreen() {
  const router = useRouter();
  const moments = useMomentsStore((state) => state.moments);
  const [accentForeground] = useThemeColor(['accent-foreground']);

  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });

  const run = async (question: string) => {
    const trimmed = question.trim();
    if (trimmed.length === 0) return;

    setQuery(trimmed);
    setState({ status: 'loading' });

    const answer = await askMemories(trimmed, moments);
    const results = answer.momentIds
      .map((id) => moments.find((moment) => moment.id === id))
      .filter((moment): moment is Moment => moment !== undefined);

    setState({ status: 'done', answer: answer.answer, results });
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
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
        >
          <View className="gap-1 pb-4">
            <Typography.Heading type="h2">Ask your memories</Typography.Heading>
            <Typography.Paragraph type="body-sm" color="muted">
              You don&apos;t need to remember exactly what you wrote. Just ask what you remember.
            </Typography.Paragraph>
          </View>

          <View className="gap-3">
            <SearchField value={query} onChange={setQuery}>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  placeholder="Where did we eat that amazing ice cream?"
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
              <Button.Label>Ask</Button.Label>
            </Button>
          </View>

          {state.status === 'idle' ? (
            <View className="gap-3 pt-8">
              <Typography.Paragraph type="body-sm" weight="medium">
                Try asking
              </Typography.Paragraph>

              {EXAMPLES.map((example) => (
                <Pressable
                  key={example}
                  accessibilityRole="button"
                  onPress={() => void run(example)}
                  className="border-border bg-surface rounded-2xl border px-4 py-3 active:opacity-80"
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
                Looking through your memories...
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
                  title="No memory matched that yet."
                  body="Try a place, a food, or a feeling — or capture the moment you were thinking of."
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
