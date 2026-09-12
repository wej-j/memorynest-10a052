import { FieldError, Input, Label, TextArea, TextField, Typography } from 'heroui-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StarRating } from '@/components/StarRating';
import { TagEditor } from '@/components/TagEditor';
import { isValidDateKey, isValidTimeKey } from '@/lib/datetime';

export type MomentFieldsValue = {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  tags: string[];
  rating: number | null;
};
type MomentFieldsProps = {
  value: MomentFieldsValue;
  onChange: (patch: Partial<MomentFieldsValue>) => void;
};

export function MomentFields({ value, onChange }: MomentFieldsProps) {
  const { t } = useTranslation();
  const dateInvalid = !isValidDateKey(value.date);
  const timeInvalid = !isValidTimeKey(value.time);

  return (
    <View className="gap-5">
      <TextField>
        <Label>{t('fields.title')}</Label>
        <Input
          value={value.title}
          onChangeText={(title) => onChange({ title })}
          placeholder={t('fields.titlePlaceholder')}
        />
      </TextField>
      <TextField>
        <Label>{t('fields.description')}</Label>
        <TextArea
          value={value.description}
          onChangeText={(description) => onChange({ description })}
          placeholder={t('fields.descriptionPlaceholder')}
          className="min-h-28"
        />
      </TextField>
      <View className="flex-row gap-3">
        <TextField className="flex-1" isInvalid={dateInvalid}>
          <Label>{t('capture.date')}</Label>
          <Input
            value={value.date}
            onChangeText={(date) => onChange({ date })}
            placeholder="2026-09-12"
            autoCapitalize="none"
          />
          <FieldError>{t('capture.dateFormat')}</FieldError>
        </TextField>
        <TextField className="w-28" isInvalid={timeInvalid}>
          <Label>{t('capture.time')}</Label>
          <Input
            value={value.time}
            onChangeText={(time) => onChange({ time })}
            placeholder="16:40"
            autoCapitalize="none"
          />
          <FieldError>{t('capture.timeFormat')}</FieldError>
        </TextField>
      </View>
      <TextField>
        <Label>{t('capture.location')}</Label>
        <Input
          value={value.location}
          onChangeText={(location) => onChange({ location })}
          placeholder={t('fields.locationOptional')}
        />
      </TextField>
      <View className="gap-2">
        <Typography.Paragraph type="body-sm" weight="medium">
          {t('fields.tags')}
        </Typography.Paragraph>
        <TagEditor tags={value.tags} onChange={(tags) => onChange({ tags })} />
      </View>
      <View className="gap-2">
        <Typography.Paragraph type="body-sm" weight="medium">
          {t('fields.rating')}
        </Typography.Paragraph>
        <StarRating
          value={value.rating}
          onChange={(rating) => onChange({ rating })}
          size={24}
          showValue
        />
      </View>
    </View>
  );
}
