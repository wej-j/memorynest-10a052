import { useRouter } from 'expo-router';
import {
  Button,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
  Typography,
  useThemeColor,
} from 'heroui-native';
import { Camera, ImagePlus, MapPin, Sparkles, Trash2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { MomentPhoto } from '@/components/MomentPhoto';
import { ProcessingState } from '@/components/ProcessingState';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { aiEnabled, enrichMoment } from '@/lib/ai';
import { formatCardDate, toDateKey, toTimeKey } from '@/lib/datetime';
import { useDraftStore } from '@/lib/draftStore';
import { suggestCurrentLocation } from '@/lib/geo';
import { cameraAvailable, pickPhotoFromLibrary, takePhotoWithCamera } from '@/lib/photos';

export default function CaptureScreen() {
  const router = useRouter();
  const { draft, setImage, setNote, setLocation, setDateTime, setEnrichment } = useDraftStore();
  const [accentForeground, accentSoftForeground, muted] = useThemeColor([
    'accent-foreground',
    'accent-soft-foreground',
    'muted',
  ]);

  const [busy, setBusy] = useState<'camera' | 'library' | 'location' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const photoBase64 = useRef<string | null>(null);
  const askedForLocation = useRef(false);

  // Offer the current place once, only for a fresh draft. Never blocks capture.
  useEffect(() => {
    if (askedForLocation.current) return undefined;
    askedForLocation.current = true;
    if (draft.location !== null || draft.note.length > 0) return undefined;

    let active = true;
    void suggestCurrentLocation().then((place) => {
      if (active && place) setLocation(place);
    });
    return () => {
      active = false;
    };
  }, [draft.location, draft.note, setLocation]);

  const capture = async (mode: 'camera' | 'library') => {
    setBusy(mode);
    setHint(null);
    try {
      const photo = mode === 'camera' ? await takePhotoWithCamera() : await pickPhotoFromLibrary();
      if (photo) {
        setImage(photo.image);
        photoBase64.current = photo.base64;
      }
    } catch {
      setHint('That photo could not be used. Try another one.');
    } finally {
      setBusy(null);
    }
  };

  const findLocation = async () => {
    setBusy('location');
    const place = await suggestCurrentLocation();
    setBusy(null);
    if (place) setLocation(place);
    else setHint('Location is not available right now — you can type a place instead.');
  };

  const canCreate = draft.note.trim().length > 0 || draft.image !== null;

  const create = async () => {
    if (!canCreate) return;
    setProcessing(true);

    const now = new Date();
    const fresh = { ...draft, date: toDateKey(now), time: toTimeKey(now) };
    setDateTime(fresh.date, fresh.time);

    const enrichment = await enrichMoment(fresh, photoBase64.current);
    if (enrichment.suggestedLocation && !fresh.location) {
      setLocation(enrichment.suggestedLocation);
    }
    setEnrichment(enrichment);
    setProcessing(false);
    router.push('/review');
  };

  if (processing) {
    return (
      <SafeAreaView edges={['top']} className="bg-background flex-1 justify-center">
        <ProcessingState />
      </SafeAreaView>
    );
  }

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
          <View className="gap-1 pb-5">
            <Typography.Heading type="h2">New moment</Typography.Heading>
            <Typography.Paragraph type="body-sm" color="muted">
              A photo, a few words, or both. Nothing here is required.
            </Typography.Paragraph>
          </View>

          <View className="gap-5">
            <View className="gap-3">
              <MomentPhoto
                image={draft.image}
                height={draft.image ? 240 : 148}
                className="border-border rounded-3xl border"
              />

              <View className="flex-row gap-3">
                {cameraAvailable ? (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onPress={() => void capture('camera')}
                    isDisabled={busy !== null}
                  >
                    {busy === 'camera' ? (
                      <Spinner size="sm" />
                    ) : (
                      <Camera size={18} color={accentSoftForeground} />
                    )}
                    <Button.Label>Take photo</Button.Label>
                  </Button>
                ) : null}

                <Button
                  variant="secondary"
                  className="flex-1"
                  onPress={() => void capture('library')}
                  isDisabled={busy !== null}
                >
                  {busy === 'library' ? (
                    <Spinner size="sm" />
                  ) : (
                    <ImagePlus size={18} color={accentSoftForeground} />
                  )}
                  <Button.Label>{draft.image ? 'Change photo' : 'Choose photo'}</Button.Label>
                </Button>

                {draft.image ? (
                  <Button
                    variant="ghost"
                    isIconOnly
                    accessibilityLabel="Remove photo"
                    onPress={() => {
                      setImage(null);
                      photoBase64.current = null;
                    }}
                  >
                    <Trash2 size={18} color={muted} />
                  </Button>
                ) : null}
              </View>
            </View>

            <TextField>
              <Label>What do you want to remember?</Label>
              <TextArea
                value={draft.note}
                onChangeText={setNote}
                placeholder="Amazing pistachio ice cream after the museum..."
                className="min-h-28"
              />
            </TextField>

            <TextField>
              <Label>Place (optional)</Label>
              <Input
                value={draft.location ?? ''}
                onChangeText={(value) => setLocation(value.length > 0 ? value : null)}
                placeholder="Rome, Italy"
              />
            </TextField>

            <Button
              variant="tertiary"
              size="sm"
              className="self-start"
              onPress={() => void findLocation()}
              isDisabled={busy !== null}
            >
              {busy === 'location' ? <Spinner size="sm" /> : <MapPin size={16} color={muted} />}
              <Button.Label>Use my current location</Button.Label>
            </Button>

            <Typography.Paragraph type="body-sm" color="muted">
              {`Saved with ${formatCardDate(draft)}. You can change the date later.`}
            </Typography.Paragraph>

            {hint ? (
              <Typography.Paragraph type="body-sm" color="muted">
                {hint}
              </Typography.Paragraph>
            ) : null}

            <Button
              variant="primary"
              size="lg"
              onPress={() => void create()}
              isDisabled={!canCreate}
              className="mt-1"
            >
              <Sparkles size={18} color={accentForeground} />
              <Button.Label>Create my memory</Button.Label>
            </Button>

            {aiEnabled ? null : (
              <Typography.Paragraph type="body-xs" color="muted" align="center">
                Working without an AI key — titles and tags are created on your device.
              </Typography.Paragraph>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
