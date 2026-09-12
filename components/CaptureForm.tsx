import { useRouter } from 'expo-router';
import {
  Button,
  Input,
  Label,
  Spinner,
  Surface,
  TextArea,
  TextField,
  Typography,
  useThemeColor,
} from 'heroui-native';
import { CalendarDays, Camera, ImagePlus, MapPin, Trash2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { MomentPhoto } from '@/components/MomentPhoto';
import { ProcessingState } from '@/components/ProcessingState';
import { aiEnabled, enrichMoment } from '@/lib/ai';
import { formatCardDate, toDateKey, toTimeKey } from '@/lib/datetime';
import { useDraftStore } from '@/lib/draftStore';
import { suggestCurrentLocation } from '@/lib/geo';
import { cameraAvailable, pickPhotoFromLibrary, takePhotoWithCamera } from '@/lib/photos';

/**
 * The capture form: photo, a few words, an optional place. Used both by the
 * "Neu" tab and by the second page of the start pager. Nothing is required.
 */
export function CaptureForm() {
  const router = useRouter();
  const { draft, setImage, setNote, setLocation, setDateTime, setEnrichment } = useDraftStore();
  const [, accentSoftForeground, muted] = useThemeColor([
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
      setHint('Dieses Foto ließ sich nicht verwenden. Versuch ein anderes.');
    } finally {
      setBusy(null);
    }
  };

  const findLocation = async () => {
    setBusy('location');
    const place = await suggestCurrentLocation();
    setBusy(null);
    if (place) setLocation(place);
    else setHint('Der Ort ist gerade nicht verfügbar — du kannst ihn auch eintippen.');
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

  if (processing) return <ProcessingState />;

  return (
    <View className="gap-4">
      {draft.image ? (
        <MomentPhoto
          image={draft.image}
          height={240}
          className="border-border/70 rounded-3xl border"
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Foto hinzufügen"
          onPress={() => void capture('library')}
          disabled={busy !== null}
          className="border-border/70 bg-surface h-44 items-center justify-center gap-2 rounded-3xl border active:opacity-80"
        >
          {busy === 'library' ? (
            <Spinner size="lg" />
          ) : (
            <View className="bg-accent-soft h-14 w-14 items-center justify-center rounded-full">
              <Camera size={24} color={accentSoftForeground} />
            </View>
          )}
          <Typography.Paragraph type="body-sm" color="muted">
            Foto hinzufügen
          </Typography.Paragraph>
        </Pressable>
      )}

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
            <Button.Label>Kamera</Button.Label>
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
          <Button.Label>{draft.image ? 'Foto ändern' : 'Galerie'}</Button.Label>
        </Button>

        {draft.image ? (
          <Button
            variant="ghost"
            isIconOnly
            accessibilityLabel="Foto entfernen"
            onPress={() => {
              setImage(null);
              photoBase64.current = null;
            }}
          >
            <Trash2 size={18} color={muted} />
          </Button>
        ) : null}
      </View>

      <TextField>
        <Label>Was möchtest du behalten?</Label>
        <TextArea
          value={draft.note}
          onChangeText={setNote}
          placeholder="Bestes Pistazieneis nach dem Museum ..."
          className="min-h-28"
        />
      </TextField>

      <TextField>
        <Label>Ort (optional)</Label>
        <Input
          value={draft.location ?? ''}
          onChangeText={(value) => setLocation(value.length > 0 ? value : null)}
          placeholder="Rom, Italien"
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
        <Button.Label>Aktuellen Ort verwenden</Button.Label>
      </Button>

      <Surface variant="secondary" className="flex-row items-center gap-3 rounded-2xl px-4 py-3.5">
        <CalendarDays size={18} color={muted} />
        <View className="flex-1">
          <Typography.Paragraph type="body-sm">Datum &amp; Uhrzeit</Typography.Paragraph>
          <Typography.Paragraph type="body-xs" color="muted">
            {`Automatisch · ${formatCardDate(draft)}`}
          </Typography.Paragraph>
        </View>
      </Surface>

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
        <Button.Label>Speichern</Button.Label>
      </Button>

      {aiEnabled ? null : (
        <Typography.Paragraph type="body-xs" color="muted" align="center">
          Ohne KI-Schlüssel: Titel und Stichwörter entstehen direkt auf deinem Gerät.
        </Typography.Paragraph>
      )}
    </View>
  );
}
