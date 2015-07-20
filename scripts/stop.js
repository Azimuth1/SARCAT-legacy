#!/usr/bin/env node

var config = require('../config/config.json');
var METEOR_SETTINGS = require('./settings.json');
var spawn = require('child_process')
    .spawn;
var fs = require('fs');
var path = require('path');
var net = require('net');
process.title = 'sarcat';
console.log('begin');
var writeLog = function(text) {
    console.log(text);
    fs.appendFileSync('msg.log', text + '\n');
};
var checkNodeVersion = function() {
    return process.version;
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
PIDLog = function() {
    var exec = require('child_process').exec;
    var execSync = require('child_process').execSync;

    var context = {};
    var file = path.join(__dirname, 'pidLog.json');
    var pidLog = {
        dbLogs: [],
        nodeLogs: [],
    };
    var isWin = /^win/.test(process.platform);

    var isRunning = function(pid) {
        var err = null;
        var result = null;
        var tryKill = function(pid, type) {
            var result;
            try {
                result = process.kill(pid, type);
                return result;
            } catch (e) {
                return e.code === 'EPERM';
            }
        };
        if (typeof pid !== 'number') {
            err = 'you must pass a pid as the first argument';
        } else {
            result = tryKill(pid);
        }
        return result || err;
    };

    createLog = function(file, obj) {
        writeLog('writing PID Log file to ' + file);
        fs.writeFileSync(file, JSON.stringify(obj));
    };
    readLog = function(file) {
        return require(file);
    };
    context.addToLog = function(type, pid) {
        pidLog[type].push(pid);
        fs.writeFileSync(file, JSON.stringify(pidLog));
    };
    context.removeFromLog = function(type, pid) {
        var array = pidLog[type];
        array = array.filter(function(d) {
            return d !== pid;
        });

        pidLog[type] = array;
        fs.writeFileSync(file, JSON.stringify(pidLog));
        return pidLog;
    };

    context.killAll = function(cb) {
        var dbLogs = pidLog.dbLogs;
        var toKill = dbLogs.length;
        if (!toKill) {
            writeLog('nothing to kill');
            return cb(pidLog.dbLogs);
        }
        var killed = 0;
        var done = function() {
            writeLog(toKill, killed);
            return cb(pidLog.dbLogs);
        };

        var kill = function(pid) {
            writeLog('!!!!' + pid + '!!!!');
            var running = isRunning(pid);
            if (!running) {
                writeLog('PID: ' + pid + ' is not running');
                context.removeFromLog('dbLogs', pid);
                killed = killed + 1;
                if (toKill === killed) {

                    return done();
                }
            } else {
                writeLog('else');
                //var child = exec('kill ' + pid);
                //child.on('close', function(code, signal) {
                writeLog('child process terminated due to receipt of signal ' + running);
                context.removeFromLog('dbLogs', pid);
                killed = killed + 1;
                if (toKill === killed) {
                    return done();
                }
                //});
            }
        };

        dbLogs.forEach(function(pid) {
            kill(pid);
        });

    };

    context.killAll = function(type, cb) {

        var dbLogs = pidLog[type];

        // var nodeLogs = pidLog.nodeLogs;

        var toKill = dbLogs.length;
        if (!toKill) {
            writeLog('nothing to kill');
            return cb(pidLog[type]);
        }
        var killed = 0;
        var done = function() {
            writeLog(toKill, killed);
            return cb(pidLog[type]);
        };

        var kill = function(pid) {
            writeLog('!!!!' + pid + '!!!!');
            var running = isRunning(pid);
            if (!running) {
                writeLog('PID: ' + pid + ' is not running');
                context.removeFromLog(type, pid);
                killed = killed + 1;
                if (toKill === killed) {

                    return done();
                }
            } else {
                writeLog('else');
                writeLog('child process terminated due to receipt of signal ' + running);
                context.removeFromLog(type, pid);
                killed = killed + 1;
                if (toKill === killed) {
                    return done();
                }
            }
        };

        dbLogs.forEach(function(pid) {
            kill(pid);
        });

    };

    if (fs.existsSync(file)) {
        pidLog = readLog(file);
    } else {

        createLog(file, pidLog);
    }

    context.dbLogs = pidLog.dbLogs;
    return context;
};

var sarcatStorageLoc = config.sarcatStorage || getUserHome();
var sarcatStorage = path.join(sarcatStorageLoc, 'sarcatData');
if (!fs.existsSync(sarcatStorage)) {
    writeLog('creating sarcatStorage directory: ' + sarcatStorage);
    fs.mkdirSync(sarcatStorage);
    fs.mkdirSync(path.join(sarcatStorage, 'public'));
    fs.mkdirSync(path.join(sarcatStorage, 'public', 'uploads'));
    fs.mkdirSync(path.join(sarcatStorage, 'public', 'uploads', 'tmp'));
} else {
    writeLog('Using  existing sarcatStorage directory: ' + sarcatStorage);
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
    env.ROOT_URL = config.ROOT_URL || 'http://localhost';
    env.METEOR_SETTINGS = JSON.stringify(METEOR_SETTINGS) || '{}';
    var sarcatPort = config.sarcatPort;
    var maxSarcatPort = sarcatPort + 7;
    getport(sarcatPort, function(err, port) {
        if (err) {
            console.warn('cannot create sarcat port: ' + err);
            process.kill('SIGINT');
        }
        if (sarcatPort !== port) {
            writeLog('sarcat port ' + sarcatPort + ' is not available. trying port ' + port);
            env.PORT = port;
        } else {
            env.PORT = sarcatPort;
        }
        var startScript = path.join(__dirname, 'bundle', 'main.js');
        writeLog(startScript, env);
        startSARCAT = spawn(node, [startScript], {
            env: env,
        });
        PIDLogs.addToLog('nodeLogs', startSARCAT.pid);
        startSARCAT.stdout.on('data', function(data) {
            writeLog('sarcat-out: ' + data);
        });
        startSARCAT.stderr.on('data', function(data) {
            writeLog('stderr: ' + data);
        });
        /*startSARCAT.on('close', function(code) {
            writeLog('closing sarcat: ' + code);
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
        writeLog('creating sarcatDB: ' + sarcatdb);
        fs.mkdirSync(sarcatdb);
    } else {
        writeLog('Connecting to existing sarcatDB: ' + sarcatdb);
    }
    var mongodLock = path.join(sarcatdb, 'mongod.lock');
    if (fs.existsSync(mongodLock)) {
        var stats = fs.statSync(mongodLock);
        var fileSizeInBytes = stats.size;
        writeLog('mongod.lock size: ' + fileSizeInBytes);
        if (fileSizeInBytes) {
            console.warn('mongodb is locked. It was not shut down correctly or already in use');
            fs.unlink(mongodLock);
        }
    }
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
            writeLog('mongo port ' + mongoPort + ' is not available. Trying port ' + port);
            config.databasePort = port;
        }
        writeLog('starting mongo\n', mongod, '\n--dbpath', sarcatdb, '\n--port', port);
        startDB = spawn(mongod, ['--dbpath', sarcatdb, '--port', port]);
        PIDLogs.addToLog('dbLogs', startDB.pid);
        writeLog(startDB.pid);
        startDB.stdout.on('data', function(data) {
            //writeLog('mongo-out: ' + data);
            //logFile(data);
        });
        startDB.stderr.on('data', function(data) {
            writeLog('stderr: ' + data);
        });
        /*startDB.on('close', function(code) {
            writeLog('closing sarcatdb: ' + code);
            process.kill('SIGINT');
        });*/
        startDB.on('exit', process.exit);
        cb(config, err);
    });
};

var startSarcat = function() {
    runmongo(config, function(conf, err) {
        if (err) {
            throw err;
        }
        console.log('ready to start sarcat!!');
        setTimeout(function() {
            if (startDB.pid) {
                runapp(config);
            }
        }, 2000);
    });
};

PIDLogs = new PIDLog();
PIDLogs.killAll('dbLogs', function(running1) {
    writeLog(running1.length + ' running mongod processes');
    if (running1.length) {
        return writeLog('Existing PID: ' + running1);
    }
    PIDLogs.killAll('nodeLogs', function(running) {
        writeLog(running.length + ' running node processes');
        if (running.length) {
            return writeLog('Existing PID: ' + running);
        }
        console.log('all killed!!');
        setTimeout(function() {
            //startSarcat();
        }, 2000);

    });
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