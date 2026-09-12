import { FieldError, Input, Label, TextArea, TextField, Typography } from 'heroui-native';
import { View } from 'react-native';

import { TagEditor } from '@/components/TagEditor';
import { isValidDateKey, isValidTimeKey } from '@/lib/datetime';

/** Everything about a moment the user is allowed to correct. */
export type MomentFieldsValue = {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  tags: string[];
};

type MomentFieldsProps = {
  value: MomentFieldsValue;
  onChange: (patch: Partial<MomentFieldsValue>) => void;
};

/** Shared editable form used by the review screen and the edit screen. */
export function MomentFields({ value, onChange }: MomentFieldsProps) {
  const dateInvalid = !isValidDateKey(value.date);
  const timeInvalid = !isValidTimeKey(value.time);

  return (
    <View className="gap-5">
      <TextField>
        <Label>Title</Label>
        <Input
          value={value.title}
          onChangeText={(title) => onChange({ title })}
          placeholder="Name this moment"
        />
      </TextField>

      <TextField>
        <Label>Description</Label>
        <TextArea
          value={value.description}
          onChangeText={(description) => onChange({ description })}
          placeholder="What do you want to remember about it?"
          className="min-h-28"
        />
      </TextField>

      <View className="flex-row gap-3">
        <TextField className="flex-1" isInvalid={dateInvalid}>
          <Label>Date</Label>
          <Input
            value={value.date}
            onChangeText={(date) => onChange({ date })}
            placeholder="2026-09-12"
            autoCapitalize="none"
          />
          <FieldError>Use the format 2026-09-12</FieldError>
        </TextField>

        <TextField className="w-28" isInvalid={timeInvalid}>
          <Label>Time</Label>
          <Input
            value={value.time}
            onChangeText={(time) => onChange({ time })}
            placeholder="16:40"
            autoCapitalize="none"
          />
          <FieldError>Use 16:40</FieldError>
        </TextField>
      </View>

      <TextField>
        <Label>Location</Label>
        <Input
          value={value.location}
          onChangeText={(location) => onChange({ location })}
          placeholder="Add a place (optional)"
        />
      </TextField>

      <View className="gap-2">
        <Typography.Paragraph type="body-sm" weight="medium">
          Tags
        </Typography.Paragraph>
        <TagEditor tags={value.tags} onChange={(tags) => onChange({ tags })} />
      </View>
    </View>
  );
}
