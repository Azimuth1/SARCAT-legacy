#!/usr/bin/env bash


#architecture=os.linux.x86_64
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
dest=$(pwd)"/"$newname/app
targetDir=$(pwd)"/"$newname






rm -rf $dest
mkdir -p $dest



cd $dest
(cd $home/meteor && meteor reset && meteor build --architecture $meteorArc $dest)
#cp -r $home/meteor.tar.gz $dest
tar -zxvf meteor.tar.gz

rm $dest/meteor.tar.gz
(cd $dest/bundle/programs/server && npm install)




cp $home/meteor/settings.json $dest
cp $home/scripts/index.js $dest
cp -r $home/config $targetDir













if [ "$architecture" == "os.windows.x86_64" ]; then
echo '%CD%/app/bin/node/bin/node app/index.js' >$targetDir/start.bat
echo 'taskkill /F /IM node.exe' > $targetDir/stop.bat
chmod +x $targetDir/start
chmod +x $targetDir/stop
else
cp $home/scripts/start $targetDir
cp $home/scripts/stop $targetDir
chmod +x $targetDir/start
chmod +x $targetDir/stop
fi











mkdir $dest/bin
cp -r $build/* $dest/bin





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
	#npm=npm
	mkdir -p node/bin
	mv node.exe node/bin
fi


#mongod=`find bin -name "mongod" -type f` 
#node=./`find bin -name "node" -type f` 
#npm=`find . -name "npm" -type l` 









#chmod -R 755 *



cd $home
rm -rf $home/build/$newname.$compress
if [ "$architecture" == "os.windows.x86_64" ]; then
	zip -r $newname.$compress $newname
else
	tar -zcvf $newname.$compress $newname
fi



mv $newname.$compress $home/build

if [ "$targetCurrent" == true ]; then
	rm -rf $home/dist
	sudo mv $targetDir dist
else
	#mv $dest $home/build
	echo removing $dest
	rm -rf $targetDir
fi





echo DONE!

