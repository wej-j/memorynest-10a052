import { Separator, Surface, Typography } from 'heroui-native';
import { ScrollView, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { goBackOrReplace } from '@/lib/navigation';

export type InfoSection = {
  heading: string;
  body?: string;
  bullets?: string[];
};

type InfoPageProps = {
  title: string;
  intro: string;
  sections: InfoSection[];
  footer?: string;
};

/** Shared layout for the static settings pages (privacy, rules, help, about). */
export function InfoPage({ title, intro, sections, footer }: InfoPageProps) {
  return (
    <SafeAreaView edges={['top']} className="bg-background flex-1">
      <ScreenHeader title={title} onBack={() => goBackOrReplace('/profile')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 16 }}
      >
        <Typography.Paragraph type="body-sm" color="muted">
          {intro}
        </Typography.Paragraph>

        {sections.map((section) => (
          <Surface key={section.heading} variant="secondary" className="gap-2.5 rounded-3xl p-4">
            <Typography.Heading type="h5">{section.heading}</Typography.Heading>

            {section.body ? (
              <Typography.Paragraph type="body-sm" color="muted">
                {section.body}
              </Typography.Paragraph>
            ) : null}

            {section.bullets && section.bullets.length > 0 ? (
              <View className="gap-2 pt-0.5">
                {section.bullets.map((bullet) => (
                  <View key={bullet} className="flex-row gap-2">
                    <View className="bg-accent mt-2 h-1.5 w-1.5 rounded-full" />
                    <Typography.Paragraph type="body-sm" color="muted" className="flex-1">
                      {bullet}
                    </Typography.Paragraph>
                  </View>
                ))}
              </View>
            ) : null}
          </Surface>
        ))}

        {footer ? (
          <View className="gap-3 pt-2">
            <Separator />
            <Typography.Paragraph type="body-xs" color="muted">
              {footer}
            </Typography.Paragraph>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
