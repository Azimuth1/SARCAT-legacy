#!/usr/bin/env bash

platform=$BUILD_PLATFORM

if [ -z "$platform" ]; then
    platform=$(uname -s | sed "y/ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz/")
fi

mkdir -p "$(dirname "$0")/../dist"
scripts/$platform.sh $platform

