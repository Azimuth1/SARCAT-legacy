var config = require('./config/config.json');

var path = require('path');
var spawn = require('child_process')
    .spawn;

METEOR_SETTINGS



var METEOR_SETTINGS = require('./dist/settings.json');

//var config = require('minimist')(process.argv.slice(2));
/*


var isWin = /^win/.test(process.platform);
if(!isWin) {
    kill(processing.pid);
} else {
    var cp = require('child_process');
    cp.exec('taskkill /PID ' + processing.pid + ' /T /F', function (error, stdout, stderr) {
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        // if(error !== null) {
        //      console.log('exec error: ' + error);
        // }
    });             
}



var psTree = require('ps-tree');
var kill = function (pid, signal, callback) {
    signal   = signal || 'SIGKILL';
    callback = callback || function () {};
    var killTree = true;
    if(killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try { process.kill(tpid, signal) }
                catch (ex) { }
            });
            callback();
        });
    } else {
        try { process.kill(pid, signal) }
        catch (ex) { }
        callback();
    }
};

// ... somewhere in the code of Yez!
kill(child.pid);
*/
process.title = 'sarcat';
//mongod --dbpath=/data --port 27017
//cd dist
//mongod --dbpath=/sarcatdb --port 27017
//var env = Object.create(process.env); 
var envDB = Object.create(process.env);
envDB.dbpath = 'dist/sarcatdb';
envDB.port = 27017;
var startDB = spawn('mongod', [], {
    env: envDB
});

var env = Object.create(process.env);
var meteorENV = config.env;
env.MONGO_URL = meteorENV.MONGO_URL + '/' + config.database;
env.ROOT_URL = meteorENV.ROOT_URL || 'http://localhost.com';
env.PORT = meteorENV.PORT || 3000;


env.METEOR_SETTINGS = JSON.stringify(METEOR_SETTINGS) || '{}';


var file = path.resolve(process.argv[2]);
var startSARCAT = spawn('node', [file], {
    env: env
});

/*
startDB.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
});
startDB.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
});
startDB.on('close', function (code) {
    console.log('child process exited with code ' + code);
});
*/

startSARCAT.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
});
startSARCAT.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
});
startSARCAT.on('close', function (code) {
    console.log('child process exited with code ' + code);
});




//lsof -i -P | grep -i "listen"
//kill -9
//show dbs
//use myproject
//show collections

