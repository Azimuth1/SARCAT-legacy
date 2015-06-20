#!/bin/bash

set -e -u
set -o pipefail




home=$(pwd)
cwd=$(pwd)"/dist"



echo "installing node dependencies"
cd $cwd/app/programs/server
npm install


cd $home
#$cwd/bin/mongodb/bin/mongod --dbpath $cwd/sarcatdb
#node index.js














exit






#!/bin/bash

set -e -u
set -o pipefail

cwd=$(pwd)

rm -rf dist
mkdir dist
cd meteor
echo "resetting meteor"
meteor reset
echo "building meteor for node"
meteor build --directory $cwd/dist





cd "$cwd"

echo "copying settings.json to /dist"
cp meteor/settings.json dist






echo "creating mongodb"
#tar -zxvf pkg/mongodb-osx-x86_64-3.0.4.tgz
#mkdir -p dist/mongodb
#cp -R -n mongodb-osx-x86_64-3.0.4/bin/. dist/mongodb
#rm -rf mongodb-osx-x86_64-3.0.4
mkdir dist/sarcatdb


echo "installing node dependencies"
(cd dist/bundle/programs/server && npm install)