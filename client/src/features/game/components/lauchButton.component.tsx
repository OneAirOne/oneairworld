import { useTranslation } from "react-i18next";
import PushButton from "./PushButton.component";

interface Props {
  onClick: () => void;
}

export default function LaunchButton({ onClick }: Props) {
  const { t } = useTranslation();
  return <PushButton onClick={onClick}>{t("startGame.enter")}</PushButton>;
}
