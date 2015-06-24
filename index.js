var config = require('./config.json');
var METEOR_SETTINGS = require('./settings.json');
var spawn = require('child_process')
    .spawn;
var fs = require('fs');
var path = require('path');
var env = Object.create(process.env);
var meteorENV = config.env;
env.MONGO_URL = meteorENV.MONGO_URL + '/' + config.databaseName;
env.ROOT_URL = meteorENV.ROOT_URL || 'http://localhost.com';
env.PORT = meteorENV.PORT || 3000;
env.METEOR_SETTINGS = JSON.stringify(METEOR_SETTINGS) || '{}';
var dbRunning;
var appRunning;

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
var databaseDir = config.databaseDir || getUserHome();
console.log(databaseDir)
var databaseName = config.databaseName || 'sarcatdb';
var sarcatdb = path.join(databaseDir, databaseName);
console.log('sarcatDB already exists: ' + sarcatdb);
if (!fs.existsSync(sarcatdb)) {
    console.log('creating sarcatDB: ' + sarcatdb);
    fs.mkdirSync(sarcatdb);
}
var mongod = 'mongod';
if (fs.existsSync(path.join(__dirname, 'bin', 'mongodb', 'bin'))) {
    mongod = path.join(__dirname, 'bin', 'mongodb', 'bin', 'mongod')
}
node = 'node';
if (fs.existsSync(path.join(__dirname, 'bin', 'node', 'bin'))) {
    node = path.join(__dirname, 'bin', 'node', 'bin', 'node')
}
//var file = path.resolve(process.argv[2]);
var startSARCAT = {};

function runapp() {
    var startScript = path.join(__dirname, 'app', 'main.js')
    console.log(node, startScript);
    startSARCAT = spawn(node, [startScript], {
        env: env
    });
    startSARCAT.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });
    startSARCAT.stderr.on('data', function (data) {
        startDB.kill('SIGINT');
        console.log('stderr: ' + data);
    });
    startSARCAT.on('close', function (code) {
        startDB.kill('SIGINT');
        console.log('child process exited with code ' + code);
    });
}
var startDB = spawn(mongod, ['--dbpath', sarcatdb]);
startDB.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
});
startDB.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
    //startDB.kill('SIGINT');
});
startDB.on('close', function (code) {
    dbRunning = false;
    console.log('child process exited with code ' + code);
    process.exit()
});
var trys = 0
var interval = setInterval(function () {
    tryapp()
}, 2000);

function tryapp() {
        console.log(trys)
        if (trys > 5) {
            return clearInterval(interval)
        }
        if (startSARCAT.pid) {
            console.log('SARCAT has started!!!!');
            return clearInterval(interval)
        }
        if (!startSARCAT.pid) {
            console.log('SARCAT has not started');
            runapp();
            return trys++;
        }
    }
    //lsof -i -P | grep -i "listen"

