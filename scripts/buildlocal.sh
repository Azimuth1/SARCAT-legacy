#!/usr/bin/env bash




#Root directory
home=$(pwd)



dest=$(pwd)"/dist"


#clear dest folder if it exists
rm -rf $dest


#create new destination folder
mkdir -p $dest



#copy settings from meteor directory
cp meteor/settings.json $dest

#copy env config file
cp -r config $dest

#copy scripts to run sarcat
cp scripts/index.js $dest





echo "creating sarcat from meteor"
cd meteor

echo "resetting meteor"
meteor reset




echo "building meteor"
meteor build  $dest



cd $dest

echo "unzipping meteor "

tar -zxvf meteor.tar.gz

mv bundle app

#remove zip file
rm meteor.tar.gz






chmod -R 755 *

cd app/programs/server
#mv app/programs/server/package.json $dest
npm install

npm install getport --save


cd $home
chmod -R 755 *








