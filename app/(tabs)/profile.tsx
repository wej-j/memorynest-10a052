import { useRouter } from 'expo-router';
import { Separator, Surface, Typography, useThemeColor } from 'heroui-native';
import {
  BookOpen,
  Heart,
  HelpCircle,
  Info,
  Languages,
  Lock,
  Settings,
  Sparkles,
} from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { MomentPhoto } from '@/components/MomentPhoto';
import { SettingsRow } from '@/components/SettingsRow';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { useMomentsStore } from '@/lib/momentsStore';

export default function ProfileScreen() {
  const router = useRouter();
  const moments = useMomentsStore((state) => state.moments);
  const [accent] = useThemeColor(['accent']);

  const favorites = moments.filter((moment) => moment.favorite).length;
  const avatar = moments.find((moment) => moment.images.length > 0)?.images[0] ?? null;

  return (
    <SafeAreaView edges={['top']} className="bg-background flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 20 }}
      >
        <View className="flex-row items-center gap-4 pt-2">
          <View className="border-accent h-16 w-16 overflow-hidden rounded-full border-2">
            {avatar ? (
              <MomentPhoto image={avatar} height={64} />
            ) : (
              <View className="bg-accent-soft h-16 w-16 items-center justify-center">
                <Sparkles size={22} color={accent} />
              </View>
            )}
          </View>

          <View className="flex-1 gap-1">
            <Typography.Heading type="h4">Deine Sammlung</Typography.Heading>
            <Typography.Paragraph type="body-sm" color="muted">
              {`${moments.length} ${moments.length === 1 ? 'Moment' : 'Momente'} · ${favorites} ${
                favorites === 1 ? 'Favorit' : 'Favoriten'
              } · Remory`}
            </Typography.Paragraph>
          </View>
        </View>

        <View className="gap-2.5">
          <Typography.Paragraph type="body-sm" weight="medium">
            Einstellungen
          </Typography.Paragraph>

          <Surface variant="secondary" className="overflow-hidden rounded-3xl p-0">
            <SettingsRow icon={Settings} label="App-Einstellungen" value="Standard" />
            <Separator />
            <SettingsRow icon={Languages} label="Sprache" value="Deutsch" />
            <Separator />
            <SettingsRow
              icon={Lock}
              label="Datenschutz"
              onPress={() => router.push('/settings/privacy')}
            />
            <Separator />
            <SettingsRow
              icon={BookOpen}
              label="Regeln & Nutzung"
              onPress={() => router.push('/settings/rules')}
            />
            <Separator />
            <SettingsRow
              icon={HelpCircle}
              label="Hilfe & Support"
              onPress={() => router.push('/settings/support')}
            />
            <Separator />
            <SettingsRow
              icon={Info}
              label="Über Remory"
              onPress={() => router.push('/settings/about')}
            />
          </Surface>
        </View>

        <View className="flex-row items-center justify-center gap-2 pt-2">
          <Typography.Paragraph type="body-sm" color="muted">
            Wir haben die App mit Liebe gemacht
          </Typography.Paragraph>
          <Heart size={14} color={accent} fill={accent} />
        </View>

        <Typography.Paragraph type="body-xs" color="muted" align="center">
          Version 1.0.0
        </Typography.Paragraph>
      </ScrollView>
    </SafeAreaView>
  );
}
