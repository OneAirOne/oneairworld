# Production

In the root folder

```bash
# build containers
docker compose build --no-cache

# run containers
docker compose up
```

# Development

Start the server and the client together (Ctrl+C stops both):

```bash
./startDevProject.sh
```

Or separately:

## Client

`cd ./client`
`npm run dev`

## Server

`cd ./server`
`npm start`

### Discord notification

The server posts a message to a Discord channel each time a player joins the game
(after clicking Start and picking a character). It is optional: without a webhook
URL, notifications are silently skipped.

1. In Discord: Channel settings → Integrations → Webhooks → New Webhook, copy the URL
2. Set it in `server/.env` (git-ignored, see `server/.env.example`):

```bash
cd ./server
cp .env.example .env   # then paste the URL after DISCORD_WEBHOOK_URL=
```

3. Start the dev server. `server/.env` is loaded automatically (via `dotenv`):

```bash
./startDevProject.sh   # server + client
# or: cd ./server && npm start
```

The server logs `[DISCORD] Notifications enabled` at startup, then
`[DISCORD] Notification sent (204)` on each join. With Docker, `docker-compose.yml`
forwards `DISCORD_WEBHOOK_URL` from `.env`:

```bash
cd ./server && docker compose up --build
```

In production, set `DISCORD_WEBHOOK_URL` in the host environment instead of a `.env` file.
The webhook URL is a secret: never commit it or expose it to the client.

The message is built in `server/src/rooms/Game.room.ts` (`onJoin`) and sent by
`server/src/services/discord.service.ts`.

# monitor

http://localhost:2567/colyseus/#/

# Types

Type shared need a first install on init

`cd ./shared/types`
`npm install`

# Developement

### Update map

After working on `.tmx` files inside `tools/map`:

- Export in Tiled to `map.json ` (in `tools/map`)
- Run the following commande at the root folder

```bash
./udpateMap.sh
```

- Restart the server

### Add PNJ

- Create Tileset with free texture packer in `tools/characters`
- Copy the .png and .json to `client/public/assets/characters`
- Create an anim file in `client/src/characters/anims/xxxxx.anims.ts`

#### Credit

https://darties.fr/creer-une-carte-sur-tiled-et-lintegrer-en-phaser-3/
