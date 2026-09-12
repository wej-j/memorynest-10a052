import { Path, Svg } from '@/components/ui/primitives/Svg';

/**
 * Remory brand mark: the angular "R" from the design.
 *
 * Colors are fixed brand values rather than theme tokens so the mark looks
 * identical wherever it appears.
 */
const LIGHT = '#F4EDFB';

type BrandLogoProps = {
  size?: number;
  color?: string;
};

export function BrandLogo({ size = 40, color = LIGHT }: BrandLogoProps) {
  return (
    <Svg width={(size * 40) / 48} height={size} viewBox="0 0 40 48">
      {/* Stem with the slanted cut at the top left. */}
      <Path d="M6 13.5 L14 8 V40 H6 Z" fill={color} />

      {/* Bowl: outer half-circle with an inner hole (evenodd). */}
      <Path
        d="M14 8 H22 A10 10 0 0 1 22 28 H14 Z M14 14 H21.5 A4 4 0 0 1 21.5 22 H14 Z"
        fill={color}
        fillRule="evenodd"
      />

      {/* Diagonal leg. */}
      <Path d="M17 26 H24 L31 40 H24 Z" fill={color} />
    </Svg>
  );
}
