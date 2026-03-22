export interface ProjectConfig {
  id: string;
  name: string;
  /** URL opened in new tab when the player interacts with the arcade machine */
  url: string;
  description?: string;
}

export const PROJECTS: ProjectConfig[] = [
  {
    id: "1",
    name: "OneairWorld",
    url: "/projets/1",
    description: "Un monde virtuel multijoueur construit avec Phaser, Colyseus et React.",
  },
  {
    id: "2",
    name: "Projet 2",
    url: "/projets/2",
    description: "Description du projet 2.",
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
