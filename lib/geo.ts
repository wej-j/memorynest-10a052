import * as Location from 'expo-location';

/**
 * Best-effort "where are you right now" suggestion, e.g. "Rome, Italy".
 * Location is always optional, so every failure path returns null quietly.
 */
export async function suggestCurrentLocation(): Promise<string | null> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const places = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    const place = places[0];
    if (!place) return null;

    const city = place.city ?? place.subregion ?? place.region ?? null;
    const label = [city, place.country].filter(Boolean).join(', ');
    return label.length > 0 ? label : null;
  } catch {
    return null;
  }
}
