import PushButton from "./PushButton";

interface Props {
  onClick: () => void;
}

export default function LaunchButton({ onClick }: Props) {
  return <PushButton onClick={onClick}>GO</PushButton>;
}
