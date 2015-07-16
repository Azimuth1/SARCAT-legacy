#!/usr/bin/env bash


#architecture=os.windows.x86_64
#version=0.4.0
if [ "$architecture" == "os.windows.x86_64" ]; then
	compress=zip
	meteorArc=os.windows.x86_32
else
	compress=tar.gz
	meteorArc=$architecture
fi

home=$(pwd)
build=$(pwd)"/build/libs/"$architecture
newname=sarcat-$version-$architecture
dest=$(pwd)"/"$newname



rm -rf $dest
mkdir -p $dest/bin

cp -r $build/* $dest/bin/

cp meteor/settings.json $dest
cp -r config $dest
cp scripts/index.js $dest





if [ "$architecture" == "os.windows.x86_64" ]; then
echo '%CD%/bin/node/bin/node index.js' >$dest/start.bat
echo 'taskkill /F /IM node.exe' > $dest/stop.bat
chmod +x $dest/start
chmod +x $dest/stop
else
cp scripts/start $dest
cp scripts/stop $dest
chmod +x $dest/start
chmod +x $dest/stop
fi













cd $dest/bin




for f in *."$compress"
do
echo "$f"
arrIN=(${f//-/ })
echo $arrIN
tar zxvf "$f"
tarfilename=${f%."$compress"}
mv $tarfilename $arrIN
rm -rf "$f"
done


if [ "$architecture" == "os.windows.x86_64" ]; then
	npm=npm
	mkdir -p node/bin
	mv node.exe node/bin
else
	#npm=`find . -name "npm" -type l` 
	#npm=./bin/node/bin/npm
	npm=npm
fi


#mongod=`find bin -name "mongod" -type f` 
#node=./`find bin -name "node" -type f` 
#npm=`find . -name "npm" -type l` 





(cd $home/meteor && meteor reset && meteor build --architecture $meteorArc $dest)
cd $dest
#cp -r $home/meteor.tar.gz $dest
tar -zxvf meteor.tar.gz

mv bundle app
rm $dest/meteor.tar.gz


mv app/programs/server/package.json $dest
$npm install
$npm install getport
chmod -R 755 *



cd $home
rm -rf $home/build/$newname.$compress
if [ "$architecture" == "os.windows.x86_64" ]; then
	zip -r $newname.$compress $newname
else
	tar -zcvf $newname.$compress $newname
fi



mv $newname.$compress $home/build

if [ "$targetCurrent" == true ]; then
	mv $dest dist
else
	#mv $dest $home/build
	rm -rf $dest
fi





echo DONE!

