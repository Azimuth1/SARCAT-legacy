#!/usr/bin/env bash

#echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
#. ~/.bashrc
mkdir local
mkdir node-latest-install
cd node-latest-install
curl http://nodejs.org/dist/node-latest.tar.gz | tar xz --strip-components=1
./configure --prefix=~/local
make install # ok, fine, this step probably takes more than 30 seconds...
curl http://npmjs.org/install.sh | sh

#NODE_VERSION=0.10.36
#NODE_ARCH=x64
#sudo apt-get -y install build-essential libssl-dev git curl
#NODE_DIST=node-v${NODE_VERSION}-sunos-${NODE_ARCH}
#curl http://nodejs.org/dist/v${NODE_VERSION}/${NODE_DIST}.tar.gz