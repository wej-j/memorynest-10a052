import { useRouter } from 'expo-router';
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
  Typography,
  useThemeColor,
} from 'heroui-native';
import { Camera, ImagePlus, MapPin } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { MomentGallery } from '@/components/MomentGallery';
import { ProcessingState } from '@/components/ProcessingState';
import { aiEnabled, enrichMoment } from '@/lib/ai';
import { isValidDateKey, isValidTimeKey } from '@/lib/datetime';
import { useDraftStore } from '@/lib/draftStore';
import { suggestCurrentLocation } from '@/lib/geo';
import { cameraAvailable, pickPhotosFromLibrary, takePhotoWithCamera } from '@/lib/photos';

const MAX_PHOTOS = 10;

/** Shared form for capturing a new memory. */
export function CaptureForm() {
  const router = useRouter();
  const { draft, setImages, setNote, setLocation, setDateTime, setEnrichment } = useDraftStore();
  const [accentSoftForeground, muted] = useThemeColor(['accent-soft-foreground', 'muted']);

  const [busy, setBusy] = useState<'camera' | 'library' | 'location' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const photoBase64s = useRef<(string | null)[]>([]);
  const askedForLocation = useRef(false);

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

  const addPhotos = async (mode: 'camera' | 'library') => {
    setBusy(mode);
    setHint(null);

    try {
      const photos =
        mode === 'camera'
          ? [await takePhotoWithCamera()].filter((photo) => photo !== null)
          : await pickPhotosFromLibrary();
      const availableSlots = Math.max(0, MAX_PHOTOS - draft.images.length);
      const accepted = photos.slice(0, availableSlots);

      if (accepted.length > 0) {
        setImages([...draft.images, ...accepted.map((photo) => photo.image)]);
        photoBase64s.current = [...photoBase64s.current, ...accepted.map((photo) => photo.base64)];
      }

      if (photos.length > availableSlots) {
        setHint(`Du kannst bis zu ${MAX_PHOTOS} Fotos zu einem Moment hinzufügen.`);
      }
    } catch {
      setHint('Diese Fotos ließen sich nicht verwenden. Versuch es mit anderen Fotos.');
    } finally {
      setBusy(null);
    }
  };

  const removePhoto = (index: number) => {
    setImages(draft.images.filter((_, imageIndex) => imageIndex !== index));
    photoBase64s.current = photoBase64s.current.filter((_, imageIndex) => imageIndex !== index);
  };

  const findLocation = async () => {
    setBusy('location');
    setHint(null);
    const place = await suggestCurrentLocation();
    setBusy(null);
    if (place) setLocation(place);
    else setHint('Der Ort ist gerade nicht verfügbar — du kannst ihn auch eintippen.');
  };

  const dateInvalid = !isValidDateKey(draft.date);
  const timeInvalid = !isValidTimeKey(draft.time);
  const canCreate =
    (draft.note.trim().length > 0 || draft.images.length > 0) && !dateInvalid && !timeInvalid;

  const create = async () => {
    if (!canCreate) return;
    setProcessing(true);

    const enrichment = await enrichMoment(
      draft,
      photoBase64s.current.filter((value): value is string => value !== null),
    );
    if (enrichment.suggestedLocation && !draft.location) {
      setLocation(enrichment.suggestedLocation);
    }
    setEnrichment(enrichment);
    setProcessing(false);
    router.push('/review');
  };

  if (processing) return <ProcessingState />;

  return (
    <View className="gap-5">
      <View className="flex-row gap-3">
        {cameraAvailable ? (
          <Button
            variant="secondary"
            className="flex-1"
            onPress={() => void addPhotos('camera')}
            isDisabled={busy !== null || draft.images.length >= MAX_PHOTOS}
          >
            {busy === 'camera' ? (
              <Spinner size="sm" />
            ) : (
              <Camera size={18} color={accentSoftForeground} />
            )}
            <Button.Label>Foto aufnehmen</Button.Label>
          </Button>
        ) : null}

        <Button
          variant="secondary"
          className="flex-1"
          onPress={() => void addPhotos('library')}
          isDisabled={busy !== null || draft.images.length >= MAX_PHOTOS}
        >
          {busy === 'library' ? (
            <Spinner size="sm" />
          ) : (
            <ImagePlus size={18} color={accentSoftForeground} />
          )}
          <Button.Label>Fotos hinzufügen</Button.Label>
        </Button>
      </View>

      <MomentGallery images={draft.images} height={180} itemWidth={230} onRemove={removePhoto} />

      {draft.images.length > 0 ? (
        <Typography.Paragraph type="body-xs" color="muted">
          {`${draft.images.length} ${draft.images.length === 1 ? 'Foto ausgewählt' : 'Fotos ausgewählt'}`}
        </Typography.Paragraph>
      ) : null}

      <TextField>
        <Label>Woran möchtest du dich erinnern?</Label>
        <TextArea
          value={draft.note}
          onChangeText={setNote}
          placeholder="Bestes Pistazieneis nach dem Museum ..."
          className="min-h-28"
        />
      </TextField>

      <TextField>
        <View className="flex-row items-center justify-between">
          <Label>Ort</Label>
          <Button
            variant="tertiary"
            size="sm"
            isIconOnly
            accessibilityLabel="Aktuellen Ort verwenden"
            onPress={() => void findLocation()}
            isDisabled={busy !== null}
          >
            {busy === 'location' ? <Spinner size="sm" /> : <MapPin size={18} color={muted} />}
          </Button>
        </View>
        <Input
          value={draft.location ?? ''}
          onChangeText={(value) => setLocation(value.length > 0 ? value : null)}
          placeholder="Rom, Italien"
        />
      </TextField>

      <View className="flex-row gap-3">
        <TextField className="flex-1" isInvalid={dateInvalid}>
          <Label>Datum</Label>
          <Input
            value={draft.date}
            onChangeText={(date) => setDateTime(date, draft.time)}
            placeholder="2026-09-12"
            autoCapitalize="none"
          />
          <FieldError>Format: 2026-09-12</FieldError>
        </TextField>

        <TextField className="w-28" isInvalid={timeInvalid}>
          <Label>Uhrzeit</Label>
          <Input
            value={draft.time}
            onChangeText={(time) => setDateTime(draft.date, time)}
            placeholder="16:40"
            autoCapitalize="none"
          />
          <FieldError>Format: 16:40</FieldError>
        </TextField>
      </View>

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
