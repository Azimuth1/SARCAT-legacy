#!/bin/bash



architecture=os.linux.x86_64
platformMongoName=mongodb-linux-x86_64-3.0.4
platformMongo=$platformMongoName.tgz
platformNodeName=node-v0.10.36-linux-x64
platformNode=$platformNodeName.tar.gz










#Root directory
home=$(pwd)

#directory of build files
build=$(pwd)"/build/libs/"$architecture

#dest folder
dest=$(pwd)"/dist"


#clear dest folder if it exists
#rm -rf $dest


#create new destination folder
mkdir -p $dest




#creat /bin for mongo & node
mkdir -p $dest/bin

#copy settings from meteor directory
cp meteor/settings.json $dest

#copy env config file
cp -r config $dest

#copy scripts to run sarcat
cp index.js $dest


cp scripts/start $dest
cp scripts/stop $dest

#echo '#!/usr/bin/env /Users/Kyle-Azimuth1/github/SARCAT/dist/bin/node/bin/node' > $dest/start
#cat index.js >> $dest/start
#echo 'killall sarcat' > $dest/stop

chmod +x $dest/start
chmod +x dest/stop


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




echo "creating mongodb"
tar -zxvf $build/$platformMongo
#unzip $build/$platformMongo
mkdir -p $dest/bin/mongodb
cp -R -n $platformMongoName/. $dest/bin/mongodb
rm -rf $platformMongoName



echo "creating node"
tar -zxvf $build/$platformNode
#unzip $build/node-v0.10.36-darwin-x64.tar.gz
mkdir -p $dest/bin/node
cp -R -n $platformNodeName/. $dest/bin/node
rm -rf $platformNodeName
node=$dest/bin/node/bin/node
npm=$dest/bin/node/bin/npm



echo "installing node dependencies"

mv app/programs/server/package.json $dest
npm install
npm install getport --save



chmod 777 *

cd $home
newname=sarcat-$version-$architecture
rm -rf $home/build/$newname.tar.gz
mv $dest $newname


tar -zcvf $newname.tar.gz $newname
mv $newname $dest
mv $newname.tar.gz $home/build

