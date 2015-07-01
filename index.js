var config = require('./config/config.json');
var METEOR_SETTINGS = require('./settings.json');
var spawn = require('child_process')
    .spawn;
var fs = require('fs');
var path = require('path');
var getport = require('getport');
process.title = 'sarcat';

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
var trys = 0;
var startSARCAT = {};
var startDB = {};
var runapp = function (config) {
    var node = 'node';
    if (fs.existsSync(path.join(__dirname, 'bin', 'node', 'bin'))) {
        node = path.join(__dirname, 'bin', 'node', 'bin', 'node')
    }
    var env = Object.create( process.env );
    env.sarcatDir = __dirname;
    env.MONGO_URL = config.MONGO_URL + ':' + config.databasePort + '/' + config.databaseName;
    env.ROOT_URL = config.ROOT_URL || 'http://localhost.com';
    env.METEOR_SETTINGS = JSON.stringify(METEOR_SETTINGS) || '{}';
    var sarcatPort = config.sarcatPort;
    console.log(env.MONGO_URL);
    getport(sarcatPort, function (err, port) {
        if (err) {
            if (startDB.pid) {
                startDB.kill('SIGINT');
            }
            return console.warn(err);
        }
        if (startSARCAT.pid || !startDB.pid) {
            return;
        }
        if (sarcatPort !== port) {
            console.log('sarcat port ' + sarcatPort + ' is not available. Falling back to port ' + port);
            env.PORT = port;
        } else {
            env.PORT = sarcatPort;
        }
        var startScript = path.join(__dirname, 'app', 'main.js')
        startSARCAT = spawn(node, [startScript], {
            env: env
        });
        startSARCAT.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });
        startSARCAT.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });
        /*startSARCAT.on('close', function (code) {
            startSARCAT.kill('SIGINT');
            if (startDB.pid) {
                startDB.kill('SIGINT');
            }
            console.log('node child process exited with code ' + code);
        });*/
        startSARCAT.on('exit', process.exit);
    });
};
var runmongo = function (config, cb) {
    //var env = {};
    //env.process.title = 'sarcat';
    var databaseDir = config.databaseDir || getUserHome();
    var databaseName = config.databaseName || 'sarcatdb';
    var sarcatdb = path.join(databaseDir, databaseName);
    var mongoPort = config.databasePort;
    if (!fs.existsSync(sarcatdb)) {
        console.log('creating sarcatDB: ' + sarcatdb);
        fs.mkdirSync(sarcatdb);
    } else {
        console.log('Connecting to existing sarcatDB: ' + sarcatdb);
    }
    var mongod = 'mongod';
    if (fs.existsSync(path.join(__dirname, 'bin', 'mongodb', 'bin'))) {
        mongod = path.join(__dirname, 'bin', 'mongodb', 'bin', 'mongod')
    }
    getport(mongoPort, function (err, port) {
        if (err) throw err
        if (config.databasePort !== port) {
            console.log('mongo port ' + mongoPort + ' is not available. Falling back to port ' + port);
            config.databasePort = port;
        }
        console.log('starting mongo on port: ' + port);
        startDB = spawn(mongod, ['--dbpath', sarcatdb, '--port', port]);
        startDB.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });
        startDB.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });
        /*startDB.on('close', function (code) {
            if (startSARCAT.pid) {
                startSARCAT.kill('SIGINT');
            }
            startDB.kill('SIGINT');
            console.log('mongo child process exited with code ' + code);
            cb(null, code)
        });*/
        startDB.on('exit', process.exit);
        cb(config, err);
    });
};
runmongo(config, function (conf, err) {
    if (err) {
        throw err;
    }
    if (startDB.pid) {
        runapp(config);
    }
});
process.on('uncaughtException', function () {
    if (startSARCAT.pid) {
        startSARCAT.kill('SIGINT');
    }
    if (startDB.pid) {
        startDB.kill('SIGINT');
    }
});
process.on('SIGTERM', function () {
    if (startSARCAT.pid) {
        startSARCAT.kill('SIGINT');
    }
    if (startDB.pid) {
        startDB.kill('SIGINT');
    }
});
process.on('exit', function (code) {
    if (startSARCAT.pid) {
        startSARCAT.kill('SIGINT');
    }
    if (startDB.pid) {
        startDB.kill('SIGINT');
    }
});
    //lsof -i -P | grep -i "listen"

