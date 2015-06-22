#!/bin/bash

set -e -u
set -o pipefail



# OS X
#meteor admin get-machine os.osx.x86_64
# Linux on 64-bit Intel
#meteor admin get-machine os.linux.x86_64
# Linux on 32-bit Intel
#meteor admin get-machine os.linux.x86_32
# Windows on 32-bit
#os.windows.x86_32


architecture=os.osx.x86_64
platformMongo=mongodb-osx-x86_64-3.0.4.tgz
platformNode=node-v0.10.36-darwin-x64.tar.gz
#architecture=os.windows.x86_32
#platformMongo=mongodb-win32-i386-3.0.4.zip
#platformNode=node-v0.10.36-darwin-x64.tar.gz
#Root directory
home=$(pwd)

#directory of build files
build=$(pwd)"/build/libs/"$architecture

#dest folder
dest=$(pwd)"/dist"

#sarcat database directory
database=$dest/sarcatdb

#clear dest folder if it exists
rm -rf $dest


#create new destination folder
mkdir $dest


#creat /bin for mongo & node
mkdir $dest/bin

#create database folder
mkdir $database

#copy settings from meteor directory
cp meteor/settings.json $dest

#copy env config file
cp config/config.json $dest

#copy scripts to run sarcat
cp index.js $dest
cp run.sh $dest


echo "creating mongodb"
tar -zxvf $build/$platformMongo
#unzip $build/$platformMongo
mkdir -p $dest/bin/mongodb
cp -R -n $platformMongo/. $dest/bin/mongodb
rm -rf $platformMongo



echo "creating node"
tar -zxvf $build/$platformNode
#unzip $build/node-v0.10.36-darwin-x64.tar.gz
mkdir -p $dest/bin/node
cp -R -n node-v0.10.36-darwin-x64/. $dest/bin/node
rm -rf node-v0.10.36-darwin-x64
node=$dest/bin/node/bin/node
npm=$dest/bin/node/bin/npm

echo "creating sarcat from meteor"
cd meteor

echo "resetting meteor"
meteor reset

echo "building meteor"
meteor build --architecture $architecture $dest

cd $dest


echo "unzipping meteor package for platform: "$architecture
tar -zxvf meteor.tar.gz


echo "/bundle --> /app"
mv bundle app

#remove zip file
rm meteor.tar.gz


echo "installing node dependencies"

cd app/programs/server
$npm install

chmod 777 *

cd $home

tar -zcvf $architecture.tar.gz dist
mv $architecture.tar.gz build


#$node dist/index.js



