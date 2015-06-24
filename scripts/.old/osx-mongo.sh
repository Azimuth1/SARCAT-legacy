#!/usr/bin/env bash

curl -O https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-3.0.4.tgz
tar -zxvf mongodb-osx-x86_64-3.0.4.tgz
mkdir -p mongodb
cp -R -n mongodb-osx-x86_64-3.0.4/ mongodb


export PATH="$DIR/bin:$PATH"