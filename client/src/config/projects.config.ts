import i18n from "../i18n/i18n";

export type ProjectCategory = "personnel" | "professionnel";

export interface ProjectConfig {
  id: string;
  category: ProjectCategory;
  /** URL opened in new tab when the player interacts with the arcade machine */
  url: string;
  /** Whether this project has a dedicated arcade machine in the game room */
  isOnArcade?: boolean;
}

// Display strings (name, description, hints) live in the "projects" i18n
// namespace — see src/i18n/locales/{fr,en}/projects.json — keyed by id.
export const PROJECTS: ProjectConfig[] = [
  { id: "everflow", category: "professionnel", url: "/projets/everflow" },
  { id: "actimicro", category: "professionnel", url: "/projets/actimicro" },
  { id: "smartdriver", category: "professionnel", url: "/projets/smartdriver" },
  { id: "samurai-ball", category: "personnel", isOnArcade: true, url: "/projets/samurai-ball" },
  { id: "pepper-atelier-snowboard", category: "professionnel", isOnArcade: true, url: "/projets/pepper-atelier-snowboard" },
  { id: "old-portfolio", category: "personnel", isOnArcade: true, url: "/projets/old-portfolio" },
  { id: "oneair-world", category: "personnel", isOnArcade: true, url: "/projets/oneair-world" },
  { id: "dessinons", category: "personnel", isOnArcade: true, url: "/projets/dessinons" },
];

export function getProject(id: string): ProjectConfig | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function getProjectName(id: string): string {
  return i18n.t(`${id}.name`, { ns: "projects" });
}

export function getProjectDescription(id: string): string {
  return i18n.t(`${id}.description`, { ns: "projects" });
}

export function getProjectHintDesktop(id: string): string | undefined {
  return i18n.t(`${id}.hintDesktop`, { ns: "projects", defaultValue: "" }) || undefined;
}

export function getProjectHintMobile(id: string): string | undefined {
  return i18n.t(`${id}.hintMobile`, { ns: "projects", defaultValue: "" }) || undefined;
}
