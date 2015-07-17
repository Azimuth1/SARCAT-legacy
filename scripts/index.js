#!/usr/bin/env node

var config = require('../config/config.json');
var METEOR_SETTINGS = require('./settings.json');
var spawn = require('child_process')
    .spawn;
var fs = require('fs');
var path = require('path');
var net = require('net');
process.title = 'sarcat';
/*
var logFile = function(text) {
    text+=a.toISOString()+' - \n';
    fs.appendFile(__dirname + 'sarcat.log', text, function(err) {
        if (err) console.log('-');
    });
};*/
var checkNodeVersion = function() {
    return process.version
};
var getUserHome = function() {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};
var getport = function(start, end, cb) {
    if (!cb) {
        if (!end) {
            cb = start;
            start = 2000;
            end = 60000;
        } else {
            cb = end;
            end = 60000;
        }
    }
    if (start >= end) {
        return cb(new Error('out of ports :('));
    }
    if (start === config.databasePort) {
        return getport(start + 1, end, cb);
    }
    var c = net.connect(start, function() {
        c.destroy();
        getport(start + 1, end, cb);
    });
    c.on('error', function() {
        cb(null, start);
    });
};
var sarcatStorageLoc = config.sarcatStorage || getUserHome();
var sarcatStorage = path.join(sarcatStorageLoc, 'sarcatData');
if (!fs.existsSync(sarcatStorage)) {
    console.log('creating sarcatStorage directory: ' + sarcatStorage);
    fs.mkdirSync(sarcatStorage);
    fs.mkdirSync(path.join(sarcatStorage, 'public'));
    fs.mkdirSync(path.join(sarcatStorage, 'public', 'uploads'));
    fs.mkdirSync(path.join(sarcatStorage, 'public', 'uploads', 'tmp'));
} else {
    console.log('Using  existing sarcatStorage directory: ' + sarcatStorage);
}
var startSARCAT = {};
var startDB = {};
var runapp = function(config) {
    if (startSARCAT.pid) {
        console.warn('sarcat already running: PID-' + startSARCAT.pid);
        return process.kill('SIGINT');
    }
    if (!startDB.pid) {
        console.warn('sarcatdb has not started');
        return process.kill('SIGINT');
    }
    var node = 'node';
    if (fs.existsSync(path.join(__dirname, 'bin', 'node', 'bin'))) {
        node = path.join(__dirname, 'bin', 'node', 'bin', 'node');
    }
    var env = Object.create(process.env);
    env.sarcatStorage = sarcatStorage;
    env.MONGO_URL = config.MONGO_URL + ':' + config.databasePort + '/' + config.databaseName;
    env.ROOT_URL = config.ROOT_URL || 'http://localhost.com';
    env.METEOR_SETTINGS = JSON.stringify(METEOR_SETTINGS) || '{}';
    var sarcatPort = config.sarcatPort;
    var maxSarcatPort = sarcatPort + 7;
    getport(sarcatPort, function(err, port) {
        if (err) {
            console.warn('cannot create sarcat port: ' + err);
            process.kill('SIGINT');
        }
        if (sarcatPort !== port) {
            console.log('sarcat port ' + sarcatPort + ' is not available. trying port ' + port);
            env.PORT = port;
        } else {
            env.PORT = sarcatPort;
        }
        var startScript = path.join(__dirname, 'bundle', 'main.js');
        console.log(startScript, env);
        startSARCAT = spawn(node, [startScript], {
            env: env,
        });
        startSARCAT.stdout.on('data', function(data) {
            console.log('sarcat-out: ' + data);
        });
        startSARCAT.stderr.on('data', function(data) {
            console.log('stderr: ' + data);
        });
        /*startSARCAT.on('close', function(code) {
            console.log('closing sarcat: ' + code);
            process.kill('SIGINT');
        });*/
        startSARCAT.on('exit', process.exit);
    });
};
var runmongo = function(config, cb) {
    //env.process.title = 'sarcat';
    var databaseDir = sarcatStorage;
    var databaseName = config.databaseName || 'sarcatdb';
    var sarcatdb = path.join(databaseDir, databaseName);
    var mongoPort = config.databasePort;
    if (!fs.existsSync(sarcatdb)) {
        console.log('creating sarcatDB: ' + sarcatdb);
        fs.mkdirSync(sarcatdb);
    } else {
        console.log('Connecting to existing sarcatDB: ' + sarcatdb);
    }
    var mongodLock = path.join(sarcatdb, 'mongod.lock');
    /*if (fs.existsSync(mongodLock)) {
        var stats = fs.statSync(mongodLock)
        var fileSizeInBytes = stats["size"];
        console.log('mongod.lock size: ' + fileSizeInBytes)
        if (fileSizeInBytes) {
            console.warn('mongodb is locked. It was not shut down correctly or already in use');
            //return process.kill('SIGINT');
            //fs.unlink(mongodLock);
        }
    }*/
    var mongod = 'mongod';
    if (fs.existsSync(path.join(__dirname, 'bin', 'mongodb', 'bin'))) {
        mongod = path.join(__dirname, 'bin', 'mongodb', 'bin', 'mongod');
    }
    var maxMongoPort = mongoPort + 6;
    getport(mongoPort, function(err, port) {
        if (err) {
            return console.warn('cannot create mongo port: ' + err);
        }
        if (config.databasePort !== port) {
            console.log('mongo port ' + mongoPort + ' is not available. Trying port ' + port);
            config.databasePort = port;
        }
        console.log('starting mongo\n', mongod, '\n--dbpath', sarcatdb, '\n--port', port);
        startDB = spawn(mongod, ['--dbpath', sarcatdb, '--port', port]);
        startDB.stdout.on('data', function(data) {
            console.log('mongo-out: ' + data);
            //logFile(data);
        });
        startDB.stderr.on('data', function(data) {
            console.log('stderr: ' + data);
        });
        /*startDB.on('close', function(code) {
            console.log('closing sarcatdb: ' + code);
            process.kill('SIGINT');
        });*/
        startDB.on('exit', process.exit);
        cb(config, err);
    });
};
runmongo(config, function(conf, err) {
    if (err) {
        throw err;
    }
    setTimeout(function() {
        if (startDB.pid) {
            runapp(config);
        }
    }, 2000);
});
process.on('uncaughtException', function() {
    if (startSARCAT.pid) {
        startSARCAT.kill('SIGINT');
    }
    if (startDB.pid) {
        startDB.kill('SIGINT');
    }
});
process.on('SIGTERM', function() {
    if (startSARCAT.pid) {
        startSARCAT.kill('SIGINT');
    }
    if (startDB.pid) {
        startDB.kill('SIGINT');
    }
});
process.on('exit', function() {
    if (startSARCAT.pid) {
        startSARCAT.kill('SIGINT');
    }
    if (startDB.pid) {
        startDB.kill('SIGINT');
    }
});
//lsof -i -P | grep -i "listen"
