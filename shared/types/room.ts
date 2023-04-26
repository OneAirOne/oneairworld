export enum RoomType {
  LOBBY = "lobby",
  PUBLIC = "public",
  PRIVATE = "custom",
}

export interface IRoomData {
  name: string;
  password: string | null;
  autoDispose: boolean;
}
