import { PrimaryButton, SecondaryButton } from '../ui';

export function WisdomButton({
  label,
  onPress,
  disabled,
  secondary,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  const Button = secondary ? SecondaryButton : PrimaryButton;
  return <Button disabled={disabled} label={label} onPress={onPress} />;
}
