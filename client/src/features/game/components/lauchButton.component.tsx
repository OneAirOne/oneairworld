import PushButton from "./PushButton.component";

interface Props {
  onClick: () => void;
}

export default function LaunchButton({ onClick }: Props) {
  return <PushButton onClick={onClick}>Entrer</PushButton>;
}
