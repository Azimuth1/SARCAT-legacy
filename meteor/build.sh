#!/bin/bash



meteor build --directory /build
#cd ../build/bundle
(cd ../build/bundle/programs/server && npm install)

MONGO_URL=mongodb://127.0.0.1:27017 ROOT_URL=http://localhost.com PORT=3000 METEOR_SETTINGS=$(cat settings.json) node ../build/bundle/main.js
#meteor --port 4000 --settings settings.json
# or bundle and prepare it as if you're running in production
# and specify a settings file
# sudo meteor bundle output.tar.gz
# tar -xzvf output.tar.gz
# cd output
# MONGO_URL=mongodb://127.0.0.1:27017 PORT=3000 METEOR_SETTINGS=$(cat /path/to/settings.json) node main.js

## MONGO_URL=mongodb://127.0.0.1:27017 PORT=3000 METEOR_SETTINGS=$(cat settings.dev.json) node main.js



#!/bin/bash
#meteor --port 4000 --settings settings.json


# or bundle and prepare it as if you're running in production
# and specify a settings file
#meteor build --architecture os.linux.x86_64 test1
#cd test1
#tar -xzvf app.tar.gz
#cd bundle
#(cd programs/server && npm install)
#export MONGO_URL='mongodb://localhost:27017'
#export PORT=3000
#export METEOR_SETTINGS=$(cat settings.dev.json)
#node main.js

#MONGO_URL=mongodb://127.0.0.1:27017 ROOT_URL=http://localhost.com PORT=3000 METEOR_SETTINGS=$(cat settings.dev.json) node main.js