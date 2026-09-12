/**
 * Photos for the start-page film reel.
 *
 * The reel deliberately shows photos the user has never seen before, so it
 * pulls random web photography instead of app content. Picsum serves a random
 * (Unsplash-sourced) photo per seed, so a fresh set of seeds means a fresh
 * reel on every app start. Offline the reel simply stays empty of remote
 * frames and falls back to the bundled demo photography.
 */

const FRAME_WIDTH = 480;
const FRAME_HEIGHT = 320;

function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Random web photos, one URL per frame. */
export function randomWebPhotos(count: number): string[] {
  return Array.from(
    { length: count },
    () => `https://picsum.photos/seed/${randomSeed()}/${FRAME_WIDTH}/${FRAME_HEIGHT}`,
  );
}

/** Fisher-Yates, non-mutating. */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = result[index];
    const other = result[swap];
    if (current === undefined || other === undefined) continue;
    result[index] = other;
    result[swap] = current;
  }
  return result;
}
