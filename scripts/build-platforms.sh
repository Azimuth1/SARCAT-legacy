#!/bin/bash

set -e -u
set -o pipefail

cwd=$(pwd)

cd meteor

meteor build --architecture os.osx.x86_64 ../build/os.osx.x86_64
meteor build --architecture os.windows.x86_32 ../build/os.windows.x86_32
meteor build --architecture os.linux.x86_64 ../build/os.linux.x86_64
meteor build --architecture os.linux.x86_32 ../build/os.linux.x86_32

cd "$cwd"