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

After working on `.tmx` files inside `tools/map`:

- Export in Tiled to `map.json ` (in `tools/map`)
- Run the following commande at the root folder

```bash
./udpateMap.sh
```

- Restart the server

#### Credit

https://darties.fr/creer-une-carte-sur-tiled-et-lintegrer-en-phaser-3/
