#!/bin/bash


architecture=os.windows.x86_64
platformMeteor=os.windows.x86_32
platformMongoName=mongodb-win32-x86_64-3.0.4
platformMongo=$platformMongoName.zip
platformNode=node.exe


#Root directory
home=$(pwd)

#directory of build files
build=$(pwd)"/build/libs/"$architecture

#dest folder
dest=$(pwd)"/dist"



#clear dest folder if it exists
rm -rf $dest
rm -rf $home/build/sarcat-$architecture.zip

#create new destination folder
mkdir -p $dest
#creat /bin for mongo & node
mkdir $dest/bin



#copy settings from meteor directory
cp meteor/settings.json $dest
#copy env config file
cp -r config $dest
#copy scripts to run sarcat
cp index.js $dest

echo '%CD%/bin/node/bin/node index.js' >$dest/start.bat
echo 'taskkill /F /IM node.exe' > $dest/stop.bat

chmod +x $dest/start
chmod +x $dest/stop





echo "creating sarcat from meteor"
cd meteor

echo "resetting meteor"
meteor reset

echo "building meteor"
meteor build --architecture $platformMeteor $dest

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
mkdir -p $dest/bin/node/bin
cp -R -n $build/$platformNode $dest/bin/node/bin

node=$dest/bin/node/bin/node
npm=$dest/bin/node/bin/npm


 




echo "installing node dependencies"





mv $dest/app/programs/server/package.json $dest
$npm install
$npm install getport --save




cd $home
rm -rf $home/build/sarcat-$architecture.zip

chmod 777 *



newname=sarcat-$version-$architecture
rm -rf $home/build/$newname.zip
mv $dest $newname

zip -r $newname.zip $newname
mv $newname $dest
mv $newname.zip $home/build



