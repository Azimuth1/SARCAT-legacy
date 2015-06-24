#!/bin/bash

set -e -u
set -o pipefail

architecture=os.windows.x86_32
platformMongo=mongodb-win32-i386-3.0.4-signed.msi
platformNode=node-v0.10.36-x86.msi


#Root directory
home=$(pwd)

#directory of build files
build=$(pwd)"/build/libs/"$architecture

#dest folder
dest=$(pwd)"/sarcat"



#clear dest folder if it exists
rm -rf $dest


#create new destination folder
mkdir $dest


#creat /bin for mongo & node
mkdir $dest/bin



#copy settings from meteor directory
cp meteor/settings.json $dest

#copy env config file
cp config/config.json $dest

#copy scripts to run sarcat
cp index.js $dest
cp run.sh $dest


echo "creating mongodb"
mkdir -p $dest/bin/mongodb
cp -R -n $build/$platformMongo $dest/bin/mongodb



echo "creating node"
mkdir -p $dest/bin/node
cp -R -n $build/$platformNode $dest/bin/node




 

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

zip -r build/$architecture.zip sarcat