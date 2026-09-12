import { Spinner, Typography } from 'heroui-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

const STEPS = [
  'Deine Notiz verstehen ...',
  'Das Foto anschauen ...',
  'Nützliche Details finden ...',
  'Stichwörter erstellen ...',
];

type ProcessingStateProps = {
  title?: string;
};

/** Shown while a moment is being enriched. Rotates through reassuring steps. */
export function ProcessingState({
  title = 'Ich merke mir diesen Moment ...',
}: ProcessingStateProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((current) => (current + 1) % STEPS.length);
    }, 1600);
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="items-center gap-4 px-6 py-16">
      <Spinner size="lg" />

      <Typography.Heading type="h4" align="center">
        {title}
      </Typography.Heading>

      <Typography.Paragraph type="body-sm" color="muted" align="center">
        {STEPS[step]}
      </Typography.Paragraph>
    </View>
  );
}
