#!/usr/bin/env bash


platform=$BUILD_PLATFORM


if [ -z "$platform" ]; then
    platform=$(uname -s | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/")
fi

if [ "$platform" == "win32" ]; then
    export INSTALL_NODE_URL=https://mapbox.s3.amazonaws.com/node-cpp11
fi

if [ -z $NODE_VERSION ]; then
    echo "NOTICE: NODE_VERSION environment variable not defined, defaulting to 0.10.33"
    NODE_VERSION=0.10.36
fi

if [ -z $TARGET_ARCH ]; then
    echo "NOTICE: TARGET_ARCH environment variable not defined, defaulting to x64"
    TARGET_ARCH=x64
fi

set -e -u
set -o pipefail


mkdir -p "$(dirname "$0")/${dest}/bin"
cd "$(dirname "$0")/osx/bin"


# Note: the node version must be pre-cached by https://github.com/mapbox/install-node#allowed-versions
curl https://s3.amazonaws.com/mapbox/apps/install-node/v1.0.0/run | NV=$NODE_VERSION NP=$platform-$TARGET_ARCH OD=$(pwd) BO=true sh
curl -O https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-3.0.4.tgz
tar -zxvf mongodb-osx-x86_64-3.0.4.tgz
#mkdir -p mongodb
cp -R -n mongodb-osx-x86_64-3.0.4/ mongodb
rm mongodb-osx-x86_64-3.0.4/
#rm mongodb-osx-x86_64-3.0.4.tgz
#export PATH="$DIR/bin:$PATH"
cd "$cwd"
mkdir -p db
