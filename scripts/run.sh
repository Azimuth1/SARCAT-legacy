#!/usr/bin/env bash

#cd dist
#(cd bundle/programs/server && npm install)
#mkdir sarcatdb
cd dist
mongod --dbpath sarcatdb --port 27017
MONGO_URL=mongodb://127.0.0.1:27017 ROOT_URL=http://localhost.com PORT=3000 METEOR_SETTINGS=$(cat settings.json) node bundle/main.js




#netstat -atp tcp | grep -i "listen"
