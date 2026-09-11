import { useTranslation } from "react-i18next";
import PageLayout from "components/PageLayout";

export default function AboutView() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <p className="text-white">{t("about.placeholder")}</p>
    </PageLayout>
  );
}
