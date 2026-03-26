export interface ProjectConfig {
  id: string;
  name: string;
  /** URL opened in new tab when the player interacts with the arcade machine */
  url: string;
  description?: string;
  /** Hint shown on desktop (keyboard) */
  hintDesktop?: string;
  /** Hint shown on mobile (touch) */
  hintMobile?: string;
}

export const PROJECTS: ProjectConfig[] = [
  {
    id: "1",
    name: "CV d'Erwan",
    url: "/projets/1",
    description: "Le curriculum vitæ d'Erwan — parcours, compétences et expériences.",
    hintDesktop: "Entrée — voir le CV d'Erwan",
    hintMobile:  "Voir le CV d'Erwan",
  },
  {
    id: "2",
    name: "Samurai Ball",
    url: "/projets/2",
    description: "Un jeu de réflexion/action développé avec Unity. Incarne un samouraï qui doit maîtriser une balle pour vaincre ses ennemis.",
    hintDesktop: "Entrée — voir Samurai Ball",
    hintMobile:  "Voir Samurai Ball",
  },
  {
    id: "3",
    name: "Projet 3",
    url: "/projets/3",
    description: "Description du projet 3.",
  },
  {
    id: "4",
    name: "Projet 4",
    url: "/projets/4",
    description: "Description du projet 4.",
  },
  {
    id: "5",
    name: "Projet 5",
    url: "/projets/5",
    description: "Description du projet 5.",
  },
];

export function getProject(id: string): ProjectConfig | undefined {
  return PROJECTS.find((p) => p.id === id);
}
