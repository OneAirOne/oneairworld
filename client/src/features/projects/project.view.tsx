import { useParams, useNavigate } from "react-router-dom";
import { getProject } from "config/projects.config";
import PageLayout from "components/PageLayout";
import SamuraiBallContent from "./components/SamuraiBallContent.component";
import OldPortfolioContent from "./components/OldPortfolioContent.component";
import PepperAtelierContent from "./components/PepperAtelierContent.component";
import DessinonsContent from "./components/DessinonsContent.component";
import OneAirWorldContent from "./components/OneAirWorldContent.component";
import EverflowContent from "./components/EverflowContent.component";
import ActimicroContent from "./components/ActimicroContent.component";
import SmartdriverContent from "./components/SmartdriverContent.component";

function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-block mt-4 text-sm text-slate-400 hover:text-white transition-colors"
    >
      ← Retour
    </button>
  );
}

function ProjectContent({ projectId }: { projectId: string }) {
  switch (projectId) {
    case "everflow":
      return <EverflowContent />;
    case "actimicro":
      return <ActimicroContent />;
    case "smartdriver":
      return <SmartdriverContent />;
    case "samurai-ball":
      return <SamuraiBallContent />;
    case "old-portfolio":
      return <OldPortfolioContent />;
    case "pepper-atelier-snowboard":
      return <PepperAtelierContent />;
    case "oneair-world":
      return <OneAirWorldContent />;
    case "dessinons":
      return <DessinonsContent />;
    default:
      return (
        <div className="max-w-4xl mx-auto px-6 pt-20">
          <p className="text-slate-400">Projet introuvable.</p>
          <BackButton />
        </div>
      );
  }
}

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();

  if (!id || !getProject(id)) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-6 pt-20">
          <p className="text-slate-400">Projet introuvable.</p>
          <BackButton />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ProjectContent projectId={id} />
    </PageLayout>
  );
}
