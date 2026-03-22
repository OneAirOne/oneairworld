#!/bin/bash

# Client — tilesets (PNG)
cp "./tools/map/arcade.png"       "./client/public/assets/map/arcade.png"
cp "./tools/map/city-jap.png"     "./client/public/assets/map/city-jap.png"
cp "./tools/map/city-modern.png"  "./client/public/assets/map/city-modern.png"
cp "./tools/map/floor.png"        "./client/public/assets/map/floor.png"
cp "./tools/map/interior-jap.png" "./client/public/assets/map/interior-jap.png"
cp "./tools/map/logos.png"        "./client/public/assets/map/logos.png"
cp "./tools/map/osaka.png"        "./client/public/assets/map/osaka.png"
cp "./tools/map/punk.png"         "./client/public/assets/map/punk.png"
cp "./tools/map/rural-jap.png"    "./client/public/assets/map/rural-jap.png"

# Client — tilemaps (JSON)
cp "./tools/map/road.json"        "./client/public/assets/map/road.json"
cp "./tools/map/arcade.json"      "./client/public/assets/map/interior-arcade.json"

# Server
cp "./tools/map/road.json"        "./server/src/engine/bodies/map/road.json"
cp "./tools/map/arcade.json"      "./server/src/engine/bodies/map/interior-arcade.json"
