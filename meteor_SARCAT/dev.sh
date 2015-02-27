#!/bin/bash
meteor --settings settings.json


# or bundle and prepare it as if you're running in production
# and specify a settings file
# sudo meteor bundle output.tar.gz
# tar -xzvf output.tar.gz
# cd output
# MONGO_URL=mongodb://127.0.0.1:27017 PORT=3000 METEOR_SETTINGS=$(cat /path/to/settings.json) node main.js