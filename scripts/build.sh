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








#meteor build --architecture os.osx.x86_64 ../build/os.osx.x86_64
#meteor build --architecture os.windows.x86_32 ../build/os.windows.x86_32
#meteor build --architecture os.linux.x86_64 ../build/os.linux.x86_64
#meteor build --architecture os.linux.x86_32 ../build/os.linux.x86_32