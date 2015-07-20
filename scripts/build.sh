#!/usr/bin/env bash





if [ "$windows" == true ]; then
	compress=zip
	meteorArc=os.windows.x86_32
else
	compress=tar.gz
	meteorArc=$architecture
fi

home=$(pwd)
build=$(pwd)"/build/libs/"$architecture
buildName=sarcat-$version-$architecture
targetDir=$home/$buildName
dest=$targetDir/app
rm -rf $targetDir





mkdir -p $dest


cd $dest
(cd $home/meteor && meteor reset && meteor build --architecture $meteorArc $dest)
#cp -r $home/.test/meteor.tar.gz $dest
tar -zxvf meteor.tar.gz

rm $dest/meteor.tar.gz
(cd $dest/bundle/programs/server && npm install)




cp $home/meteor/settings.json $dest
cp $home/scripts/index.js $dest
cp -r $home/config $targetDir







if [ "$targetCurrent" == true ]; then
	mv $targetDir $home/dist
	exit
fi



cd app/bin/node/bin
node ../../../index.js


if [ "$windows" == true ]; then
#echo '%CD%/app/bin/node/bin/node app/index.js' >$targetDir/start.bat
echo -e 'cd app/bin/node/bin\nnode ../../../index.js' >$targetDir/start.bat
#echo -e 'taskkill /F /IM mongod.exe' > $targetDir/stop2.bat
echo -e 'cd app/bin/node/bin\nnode ../../../index.js stop' >$targetDir/stop.bat


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


if [ "$windows" == true ]; then
	#npm=npm
	mkdir -p node/bin
	mv node.exe node/bin
fi


#mongod=`find bin -name "mongod" -type f` 
#node=./`find bin -name "node" -type f` 
#npm=`find . -name "npm" -type l` 





cd $targetDir
chmod -R 755 *
cd $home







if [ "$windows" == true ]; then
	zip -r $buildName.$compress $buildName
else
	tar -zcvf $buildName.$compress $buildName
fi



mv $buildName.$compress $home/build/downloads
echo removing $targetDir
rm -rf $targetDir

echo DONE!

