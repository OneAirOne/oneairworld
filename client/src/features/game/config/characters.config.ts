import { Characters } from "../../../../../shared/types";

export interface CharacterChoice {
  key: Characters;
  name: string;
  gif: string;
}

export const PLAYABLE_CHARACTERS: CharacterChoice[] = [
  {
    key: Characters.ONEAIR,
    name: "Timothée",
    gif: "assets/oneair.gif",
  },
  {
    key: Characters.LINK,
    name: "Drake",
    gif: "assets/link.gif",
  },
];
