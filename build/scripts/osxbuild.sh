#!/bin/bash

set -e -u
set -o pipefail


architecture=os.osx.x86_64
platformMongoName=mongodb-osx-x86_64-3.0.4
platformMongo=$platformMongoName.tgz
platformNodeName=node-v0.10.36-darwin-x64
platformNode=$platformNodeName.tar.gz





#Root directory
home=$(pwd)

#dest folder
dest=$(pwd)"/sarcat"



#clear dest folder if it exists
rm -rf $dest


#create new destination folder
mkdir $dest



#copy settings from meteor directory
cp meteor/settings.json $dest

#copy env config file
cp config/config.json $dest

#copy scripts to run sarcat
cp index.js $dest
cp run.sh $dest


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
npm install

chmod 777 *

cd $home

tar -zcvf "sarcat-"$architecture.tar.gz sarcat
mv sarcat-$architecture.tar.gz build


#$node dist/index.js






