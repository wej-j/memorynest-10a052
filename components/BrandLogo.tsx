import { Circle, Path, Svg } from '@/components/ui/primitives/Svg';

/**
 * Brand mark: a film frame with a heart in the middle.
 *
 * Logo colors are intentionally fixed brand values rather than theme tokens —
 * the mark should look identical wherever it appears (header, empty states).
 */
const TERRACOTTA = '#C2683C';
const CREAM = '#FDF6EC';

type BrandLogoProps = {
  size?: number;
};

export function BrandLogo({ size = 40 }: BrandLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M12 2 H36 A10 10 0 0 1 46 12 V36 A10 10 0 0 1 36 46 H12 A10 10 0 0 1 2 36 V12 A10 10 0 0 1 12 2 Z"
        fill={TERRACOTTA}
      />

      {[12, 20, 28, 36].map((cy) => (
        <Circle key={`left-${cy}`} cx={8} cy={cy} r={1.7} fill={CREAM} opacity={0.9} />
      ))}
      {[12, 20, 28, 36].map((cy) => (
        <Circle key={`right-${cy}`} cx={40} cy={cy} r={1.7} fill={CREAM} opacity={0.9} />
      ))}

      <Path
        d="M24 34.2 C24 34.2 13.2 27.6 13.2 20.9 C13.2 17.4 15.9 14.7 19.3 14.7 C21.3 14.7 23.1 15.7 24 17.3 C24.9 15.7 26.7 14.7 28.7 14.7 C32.1 14.7 34.8 17.4 34.8 20.9 C34.8 27.6 24 34.2 24 34.2 Z"
        fill={CREAM}
      />
    </Svg>
  );
}
