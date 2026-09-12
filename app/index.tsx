import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button, SearchField, Typography, useThemeColor } from 'heroui-native';
import { ArrowRight, ChevronLeft, Sparkles, User } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';

import { BrandWordmark } from '@/components/BrandWordmark';
import { CaptureForm } from '@/components/CaptureForm';
import { EmptyState } from '@/components/EmptyState';
import { FilmReel, type ReelFrame } from '@/components/FilmReel';
import { MomentCard } from '@/components/MomentCard';
import { LinearGradient } from '@/components/ui/primitives/LinearGradient';
import { SEED_PHOTO_SOURCES } from '@/lib/images';
import { useMomentsStore } from '@/lib/momentsStore';
import { randomWebPhotos, shuffle } from '@/lib/reelPhotos';

const HERO = require('@/assets/brand/start-hero.png');

const PAGES = 3;

/**
 * Start experience: a horizontal pager.
 *   1 — brand + moving film reel of random photography
 *   2 — capture a memory straight away (skippable)
 *   3 — the memories already collected, with a way into search
 */
export default function StartScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setPage(index);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / Math.max(width, 1));
    if (next !== page && next >= 0 && next < PAGES) setPage(next);
  };

  return (
    <View className="bg-background flex-1">
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={onScroll}
      >
        <BrandPage width={width} height={height} page={page} onStart={() => goTo(1)} />

        <CapturePage width={width} height={height} onBack={() => goTo(0)} onSkip={() => goTo(2)} />

        <CollectionPage
          width={width}
          height={height}
          onBack={() => goTo(1)}
          onOpenAll={() => router.replace('/moments')}
        />
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  1 — Brand                                                                  */
/* -------------------------------------------------------------------------- */

type BrandPageProps = {
  width: number;
  height: number;
  page: number;
  onStart: () => void;
};

function BrandPage({ width, height, page, onStart }: BrandPageProps) {
  const [accentForeground] = useThemeColor(['accent-foreground']);

  // A fresh set of random web photos per app start, plus the bundled
  // photography so the reel is never empty when the device is offline.
  const topFrames = useMemo<ReelFrame[]>(
    () => randomWebPhotos(10).map((url) => ({ key: `top-${url}`, source: url })),
    [],
  );
  const bottomFrames = useMemo<ReelFrame[]>(() => {
    const mixed = shuffle([...randomWebPhotos(6), ...SEED_PHOTO_SOURCES]);
    return mixed.map((source, index) => ({ key: `bottom-${index}`, source }));
  }, []);

  return (
    <View style={{ width, height }}>
      <Image source={HERO} style={{ width, height, position: 'absolute' }} contentFit="cover" />

      <LinearGradient
        colors={['rgba(18,13,26,0.94)', 'rgba(18,13,26,0.30)', 'rgba(18,13,26,0.97)']}
        locations={[0, 0.42, 1]}
        className="absolute inset-0"
      />

      <View className="pt-safe-offset-8 pb-safe-offset-6 flex-1 items-center px-6">
        <BrandWordmark size={40} />

        <Typography.Paragraph type="body-sm" color="muted" align="center" className="mt-2 max-w-64">
          Remember the moments that matter.
        </Typography.Paragraph>

        <View className="mt-7 w-full gap-3">
          <FilmReel frames={topFrames} direction="left" frameWidth={104} frameHeight={74} />
          <FilmReel
            frames={bottomFrames}
            direction="right"
            frameWidth={84}
            frameHeight={60}
            perFrameMs={2800}
          />
        </View>

        <View className="flex-1" />

        <View className="flex-row items-center gap-2 pb-5">
          {Array.from({ length: PAGES }).map((_, index) => (
            <View
              // oxlint-disable-next-line eslint/no-array-index-key -- fixed-length dot row
              key={index}
              className={
                index === page
                  ? 'bg-accent h-2 w-5 rounded-full'
                  : 'bg-surface-tertiary h-2 w-2 rounded-full'
              }
            />
          ))}
        </View>

        <Button variant="primary" size="lg" className="w-full max-w-xs" onPress={onStart}>
          <Button.Label>Los geht&apos;s</Button.Label>
          <ArrowRight size={18} color={accentForeground} />
        </Button>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  2 — Capture                                                                */
/* -------------------------------------------------------------------------- */

type CapturePageProps = {
  width: number;
  height: number;
  onBack: () => void;
  onSkip: () => void;
};

function CapturePage({ width, height, onBack, onSkip }: CapturePageProps) {
  return (
    <View style={{ width, height }} className="pt-safe-offset-3">
      <PagerHeader title="Neuer Moment" onBack={onBack} onSkip={onSkip} skipLabel="Überspringen" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          <CaptureForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  3 — Collection                                                             */
/* -------------------------------------------------------------------------- */

type CollectionPageProps = {
  width: number;
  height: number;
  onBack: () => void;
  onOpenAll: () => void;
};

function CollectionPage({ width, height, onBack, onOpenAll }: CollectionPageProps) {
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
    <View style={{ width, height }} className="pt-safe-offset-3">
      <PagerHeader
        title="Deine Momente"
        onBack={onBack}
        onSkip={() => router.replace('/profile')}
        skipIcon
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

          <Button variant="secondary" onPress={onOpenAll}>
            <Button.Label>Alle Momente öffnen</Button.Label>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */

type PagerHeaderProps = {
  title: string;
  onBack: () => void;
  onSkip: () => void;
  skipLabel?: string;
  skipIcon?: boolean;
};

function PagerHeader({ title, onBack, onSkip, skipLabel, skipIcon }: PagerHeaderProps) {
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);

  return (
    <View className="flex-row items-center justify-between px-4 pb-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Zurück"
        onPress={onBack}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
      >
        <ChevronLeft size={22} color={foreground} />
      </Pressable>

      <Typography.Heading type="h5">{title}</Typography.Heading>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={skipLabel ?? 'Profil'}
        onPress={onSkip}
        hitSlop={8}
        className="h-9 min-w-9 items-center justify-center rounded-full px-1 active:opacity-70"
      >
        {skipIcon ? (
          <User size={20} color={foreground} />
        ) : (
          <Typography.Paragraph type="body-sm" style={{ color: muted }}>
            {skipLabel}
          </Typography.Paragraph>
        )}
      </Pressable>
    </View>
  );
}
