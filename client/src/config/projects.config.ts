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
    id: "samurai-ball",
    name: "Samurai Ball",
    url: "/projets/samurai-ball",
    description: "Un jeu d'action développé avec un ami — incarne un samouraï et maîtrise la balle pour vaincre tes ennemis.",
    hintDesktop: "Appuyer sur Entrée pour voir le projet Samurai Ball",
    hintMobile:  "Appuyer sur l'icône 💬 pour voir le projet Samurai Ball",
  },
  {
    id: "pepper-atelier-snowboard",
    name: "Pepper Atelier Snowboard",
    url: "/projets/pepper-atelier-snowboard",
    description: "Projet e-commerce autour d'un atelier de snowboard artisanal.",
    hintDesktop: "Appuyer sur Entrée pour voir le projet Pepper Atelier Snowboard",
    hintMobile:  "Appuyer sur l'icône 💬 pour voir le projet Pepper Atelier Snowboard",
  },
  {
    id: "old-portfolio",
    name: "Ancien portfolio",
    url: "/projets/old-portfolio",
    description: "Mon premier portfolio — une version précédente de ma présentation en ligne.",
    hintDesktop: "Appuyer sur Entrée pour voir l'ancien portfolio",
    hintMobile:  "Appuyer sur l'icône 💬 pour voir l'ancien portfolio",
  },
  {
    id: "dessinons",
    name: "Dessinons",
    url: "/projets/dessinons",
    description: "Application collaborative de dessin en ligne.",
    hintDesktop: "Appuyer sur Entrée pour voir le projet Dessinons",
    hintMobile:  "Appuyer sur l'icône 💬 pour voir le projet Dessinons",
  },
];

export function getProject(id: string): ProjectConfig | undefined {
  return PROJECTS.find((p) => p.id === id);
}
