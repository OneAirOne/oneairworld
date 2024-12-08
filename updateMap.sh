#!/bin/bash

# Client
cp "./tools/map/map.json" "./client/public/assets/map/map.json"
cp "./tools/map/city-modern.png" "./client/public/assets/map/city-modern.png"

# Server
cp "./tools/map/map.json" "./server/src/engine/bodies/map/map.json"
