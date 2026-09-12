import { Button, Chip, Input, TextField, Typography, useThemeColor } from 'heroui-native';
import { Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { uniqueTags } from '@/lib/heuristics';

type TagEditorProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

/** Tap a tag to remove it, type to add one. Deliberately minimal. */
export function TagEditor({ tags, onChange }: TagEditorProps) {
  const [draft, setDraft] = useState('');
  const [accentSoftForeground, accentForeground] = useThemeColor([
    'accent-soft-foreground',
    'accent-foreground',
  ]);

  const commit = () => {
    const value = draft.trim();
    if (value.length === 0) return;
    onChange(uniqueTags([...tags, value], 12));
    setDraft('');
  };

  return (
    <View className="gap-3">
      {tags.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {tags.map((tag) => (
            <Pressable
              key={tag}
              accessibilityRole="button"
              accessibilityLabel={`Remove tag ${tag}`}
              onPress={() => onChange(tags.filter((item) => item !== tag))}
            >
              <Chip size="sm" variant="soft" color="accent">
                <Chip.Label>{tag}</Chip.Label>
                <X size={12} color={accentSoftForeground} />
              </Chip>
            </Pressable>
          ))}
        </View>
      ) : (
        <Typography.Paragraph type="body-sm" color="muted">
          No tags yet.
        </Typography.Paragraph>
      )}

      <View className="flex-row items-center gap-2">
        <TextField className="flex-1">
          <Input
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={commit}
            placeholder="Add a tag"
            autoCapitalize="none"
            returnKeyType="done"
          />
        </TextField>

        <Button size="sm" isIconOnly onPress={commit} isDisabled={draft.trim().length === 0}>
          <Plus size={16} color={accentForeground} />
        </Button>
      </View>
    </View>
  );
}
