import { View } from 'react-native';

type StepDotsProps = {
  /** Zero-based index of the active step. */
  index: number;
  count?: number;
};

/** Progress dots shared by the three start screens. */
export function StepDots({ index, count = 3 }: StepDotsProps) {
  const steps = Array.from({ length: count }, (_, step) => step);

  return (
    <View className="flex-row items-center justify-center gap-2">
      {steps.map((step) => (
        <View
          key={step}
          className={
            step === index
              ? 'bg-accent h-2 w-5 rounded-full'
              : 'bg-surface-tertiary h-2 w-2 rounded-full'
          }
        />
      ))}
    </View>
  );
}
