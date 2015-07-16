#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var packageJSON = require('../package.json');
var platforms = {
    darwin: 'os.osx.x86_64',
    win32: 'os.windows.x86_64',
    linux: 'os.linux.x86_64'
};
var targetCurrent = process.argv[2] ? false : true;
var platform = process.argv[2] || process.platform;
var architecture = platforms[platform];
process.env.version = packageJSON.version;
process.env.architecture = architecture;
process.env.targetCurrent = targetCurrent
runscript(platform);

function runscript(platform) {
    var execFile = require('child_process')
        .execFile;
    //var file = path.resolve(process.argv[2]);
    var file = 'scripts/build.sh'
    console.log(file);
    console.log(platform);
    console.log('Running %s', file);
    var spawn = require('child_process')
        .spawn;
    var startScript = file; //spath.join(__dirname, 'app', 'main.js')
    startSARCAT = spawn(file, [], {
        env: process.env
    });
    startSARCAT.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    startSARCAT.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
    });
    startSARCAT.on('close', function(code) {
        console.log('child process exited with code ' + code);
    });
}
