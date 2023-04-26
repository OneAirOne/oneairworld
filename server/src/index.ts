import { Server, LobbyRoom } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { createServer } from "http";
import express from "express";
import { RoomType } from "../../shared/types/room";

import { Game } from "./rooms/Game";

const port = Number(process.env.port) || 2567;
const app = express();

app.use(express.json());

const gameServer = new Server({
  server: createServer(app),
});

// registry room handlers
gameServer.define(RoomType.LOBBY, LobbyRoom);
gameServer.define(RoomType.PUBLIC, Game, {
  name: "Public Lobby",
  description: " Welcome to the oneairworld",
  password: null,
  autoDispose: false,
});
// TODO : define custom room here

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

// register colyseus monitor AFTER registering your room handlers
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
