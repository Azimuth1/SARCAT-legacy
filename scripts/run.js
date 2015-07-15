#!/usr/bin/env node

var path = require('path');
var packageJSON = require('../package.json');
process.env.version = packageJSON.version;


var platform = process.argv[2] || process.platform;

runscript(platform);

function runscript(platform) {
    var execFile = require('child_process')
        .execFile;
    //var file = path.resolve(process.argv[2]);
    var file = 'scripts/' + platform + ".sh"
    console.log(file);
    console.log(platform);
    console.log('Running %s', file);
    var spawn = require('child_process')
        .spawn;
    var startScript = file; //spath.join(__dirname, 'app', 'main.js')
    startSARCAT = spawn(file, [], {
        env: process.env
    });
    startSARCAT.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });
    startSARCAT.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
    startSARCAT.on('close', function (code) {
        console.log('child process exited with code ' + code);
    });
}

