import { useParams, Link } from "react-router-dom";
import { getProject } from "config/projects.config";
import PageLayout from "components/PageLayout";

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const project = id ? getProject(id) : undefined;

  if (!project) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-6 pt-20">
          <p className="text-slate-400">Projet introuvable.</p>
          <Link to="/" className="inline-block mt-4 text-sm text-slate-400 hover:text-white transition-colors">
            ← Retour au monde
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <h1 className="text-4xl font-bold text-white mb-4">{project.name}</h1>
        {project.description && (
          <p className="text-slate-400 mb-8">{project.description}</p>
        )}
        <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Retour au monde
        </Link>
      </div>
    </PageLayout>
  );
}
