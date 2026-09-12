import { Surface, Typography, useThemeColor } from 'heroui-native';
import { Check, Languages } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '@/components/ScreenHeader';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { setAppLanguage, type AppLanguage } from '@/lib/i18n';
import { goBackOrReplace } from '@/lib/navigation';

const LANGUAGE_OPTIONS: { code: AppLanguage; labelKey: 'language.german' | 'language.english' }[] =
  [
    { code: 'de', labelKey: 'language.german' },
    { code: 'en', labelKey: 'language.english' },
  ];

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const [accent, foreground] = useThemeColor(['accent', 'foreground']);
  const activeLanguage: AppLanguage = i18n.resolvedLanguage === 'en' ? 'en' : 'de';

  const selectLanguage = (language: AppLanguage) => {
    if (language !== activeLanguage) void setAppLanguage(language);
  };

  return (
    <SafeAreaView edges={['top']} className="bg-background flex-1">
      <ScreenHeader title={t('language.title')} onBack={() => goBackOrReplace('/profile')} />

      <View className="gap-4 px-5">
        <Typography.Paragraph type="body-sm" color="muted">
          {t('language.intro')}
        </Typography.Paragraph>

        <Surface variant="secondary" className="overflow-hidden rounded-3xl p-0">
          {LANGUAGE_OPTIONS.map((option, index) => {
            const selected = option.code === activeLanguage;
            return (
              <Pressable
                key={option.code}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={t(option.labelKey)}
                onPress={() => selectLanguage(option.code)}
                className={`flex-row items-center gap-3 px-4 py-4 active:opacity-70 ${index > 0 ? 'border-border border-t' : ''}`}
              >
                <Languages size={19} color={selected ? accent : foreground} />
                <Typography.Paragraph type="body" className="flex-1">
                  {t(option.labelKey)}
                </Typography.Paragraph>
                {selected ? (
                  <View className="flex-row items-center gap-2">
                    <Typography.Paragraph type="body-sm" className="text-accent">
                      {t('language.active')}
                    </Typography.Paragraph>
                    <Check size={18} color={accent} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </Surface>
      </View>
    </SafeAreaView>
  );
}
