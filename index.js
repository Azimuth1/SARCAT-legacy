var config = require('./config.json');
var METEOR_SETTINGS = require('./settings.json');
var spawn = require('child_process').spawn;
var fs = require('fs');




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

//mongod --dbpath=/sarcatdb --port 27017
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
var sarcatdb = databaseDir + '/' + databaseName;
console.log('creating sarcatDB: ' + sarcatdb);



if (!fs.existsSync(sarcatdb)) {
    fs.mkdirSync(sarcatdb);
}
var mongod = 'mongod';
if (fs.existsSync(__dirname + '/' + 'bin/mongodb/bin/mongod')) {
    mongod = __dirname + '/' + 'bin/mongodb/bin/mongod';
}

node = 'node';
if (fs.existsSync(__dirname + '/' + 'bin/node/bin/node')) {
    node = __dirname + '/' + 'bin/node/bin/node';
}




//var file = path.resolve(process.argv[2]);
function runapp() {

    var startSARCAT = spawn(node, [__dirname + '/app/main.js'], {
        env: env
    });
    startSARCAT.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    startSARCAT.stderr.on('data', function(data) {
        startDB.kill('SIGINT');
        console.log('stderr: ' + data);
    });
    startSARCAT.on('close', function(code) {
        startDB.kill('SIGINT');
        console.log('child process exited with code ' + code);
    });
}



var startDB = spawn(mongod, ['--dbpath', sarcatdb]);

startDB.stdout.on('data', function(data) {
    console.log('stdout: ' + data);

});
startDB.stderr.on('data', function(data) {
    console.log('stderr: ' + data);
    //startDB.kill('SIGINT');
});
startDB.on('close', function(code) {
    dbRunning = false;
    console.log('child process exited with code ' + code);
    process.exit()

});


var trys = 0


var interval = setInterval(function() {
    tryapp()
}, 2000);

function tryapp() {
    console.log(trys)
    if (trys > 5) {
        return clearInterval(interval)
    }
    if (!startDB.pid) {
        return trys++;

    }

    runapp();
    return clearInterval(interval)

}




//lsof -i -P | grep -i "listen"

//kill -9
//show dbs
//use myproject
//show collections
