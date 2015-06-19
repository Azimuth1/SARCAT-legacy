#!/bin/bash

NODE_VERSION=0.10.36
NODE_ARCH=x64


sudo apt-get -y install build-essential libssl-dev git curl
NODE_DIST=node-v${NODE_VERSION}-sunos-${NODE_ARCH}
wget http://nodejs.org/dist/v${NODE_VERSION}/${NODE_DIST}.tar.gz
#tar xvzf ${NODE_DIST}.tar.gz
#sudo rm -rf /opt/nodejs
#sudo mv ${NODE_DIST} /opt/nodejs

# set downloaded node version as the default
# XXX this needs to be changed later on
# sudo ln -sf /opt/nodejs/bin/node /opt/local/bin/node
# sudo ln -sf /opt/nodejs/bin/npm /opt/local/bin/npm