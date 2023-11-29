# Client

`cd ./client`
`npm run dev`

# Server

`cd ./server`
`npm start`

### monitor

http://localhost:2567/colyseus/#/

# Types

Type shared need a first install on init

`cd ./shared/types`
`npm install`

# Developement

### Update map

https://darties.fr/creer-une-carte-sur-tiled-et-lintegrer-en-phaser-3/

After working on `.tmx` files inside `tools/map`

- generate the new `.json` file.
- replace the `.json` and `.png` to `/client/public/assets/map` with the new version
- replace the `.json` to `server/src/engine/map`
