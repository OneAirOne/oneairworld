import { Characters } from "../../../../../shared/types";

export interface CharacterChoice {
  key: Characters;
  name: string;
  gif: string;
}

export const PLAYABLE_CHARACTERS: CharacterChoice[] = [
  {
    key: Characters.ONEAIR,
    name: "OneAir",
    gif: "assets/oneair.gif",
  },
  {
    key: Characters.LINK,
    name: "Link",
    gif: "assets/link.gif",
  },
];
