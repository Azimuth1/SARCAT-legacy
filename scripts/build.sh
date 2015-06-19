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
echo "copying settings.json to /dist"
cp settings.json ../dist

echo "install node dependencies"
(cd ../dist/bundle/programs/server && npm install)
echo "creating mongodb"
mkdir ../dist/sarcatdb


cd "$cwd"





#meteor build --architecture os.osx.x86_64 ../build/os.osx.x86_64
#meteor build --architecture os.windows.x86_32 ../build/os.windows.x86_32
#meteor build --architecture os.linux.x86_64 ../build/os.linux.x86_64
#meteor build --architecture os.linux.x86_32 ../build/os.linux.x86_32