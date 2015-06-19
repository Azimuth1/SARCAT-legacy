#!/usr/bin/env bash

#meteor build --directory ../os

#mkdir -p osx/bin


if [ -z "$platform" ]; then
    platform=$(uname -s | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/")
fi

if [ "$platform" == "win32" ]; then
    export INSTALL_NODE_URL=https://mapbox.s3.amazonaws.com/node-cpp11
fi

if [ -z $NODE_VERSION ]; then
    echo "NOTICE: NODE_VERSION environment variable not defined, defaulting to 0.10.36"
    NODE_VERSION=0.10.33
fi

if [ -z $TARGET_ARCH ]; then
    echo "NOTICE: TARGET_ARCH environment variable not defined, defaulting to x64"
    TARGET_ARCH=x64
fi

set -e -u
set -o pipefail




#set home dir
cwd=$(pwd)


#create target folders
bin="$platform/bin"
mkdir -p $bin

cd meteor

#compile in target folder
#meteor build --directory "../$platform"
#cp settings.json "../$platform"
#go to target bin folder
cd $cwd/$bin




# Note: the node version must be pre-cached by https://github.com/mapbox/install-node#allowed-versions
curl https://s3.amazonaws.com/mapbox/apps/install-node/v1.0.0/run | NV=$NODE_VERSION NP=$platform-$TARGET_ARCH OD=$(pwd) BO=true sh
exit
curl -O https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-3.0.4.tgz
tar -zxvf mongodb-osx-x86_64-3.0.4.tgz
mv mongodb-osx-x86_64-3.0.4/bin/* .
rm -rf mongodb-osx-x86_64-3.0.4


cd $cwd/$platform

db=sarcatdb
mkdir -p $db
#export PATH="$DIR/bin:$PATH"

#install node packages
(cd bundle/programs/server && npm install)

#run mongo
bin/mongod --dbpath $db

cd "$cwd"






#(cd bundle/programs/server && npm install)
#bin/mongodb/bin/mongod --dbpath db
#MONGO_URL=mongodb://127.0.0.1:27017 ROOT_URL=http://localhost.com PORT=3000 METEOR_SETTINGS=$(cat settings.json) bin/node bundle/main.js
#MONGO_URL=mongodb://127.0.0.1:27017 ROOT_URL=http://localhost.com PORT=3000 METEOR_SETTINGS=$(cat settings.json) node bundle/main.js
