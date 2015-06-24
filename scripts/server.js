var http = require('http');
var express = require('express');
var path = require("path");
var fs = require('fs');
var request = require('request');
var bodyParser = require('body-parser');
//
var sarcatServerPort = 5000;
var webpagePort = 8080;
//
var page = path.join(__dirname, '../', 'webpage');
var config = require('../config/config.json');
var webpage = express();
var server = http.createServer(webpage)
    .listen(webpagePort);
webpage.use('/', express.static(page));
console.log('now serving webpage on: ' + webpagePort)
var sarcatserver = express();
sarcatserver.use(bodyParser.json({
    limit: '500mb'
}));

var dir = 'uploads';
var uploadDir = path.join(page, dir);

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}


sarcatserver.post('/uploadISRID', function(req, res) {
    // console.log(req.body)
    var profile = req.body.profile;

    var agency = profile.organization;
    var data = req.body.data;

    var fileName = agency + '-' + createDate();
    fs.writeFile(uploadDir + '/' + fileName + '.json', JSON.stringify(req.body), function(err, d) {
        console.log(err, d)
        if (err) {
            return res.status(200).send('ok');
        }
        res.status(200).send('ok');
    });
});
var createDate = function() {
    var d = new Date();
    var yyyy = d.getFullYear()
        .toString();
    var mm = (d.getMonth() + 1)
        .toString();
    var dd = d.getDate()
        .toString();
    var hh = d.getHours()
        .toString();
    var mm = d.getMinutes()
        .toString();
    var ss = d.getSeconds()
        .toString();
    return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]) + '_' + hh + ':' + mm + ':' + ss;
};
sarcatserver.get('/weather/*', function(req, res) {
    var item = req.url.replace('/weather/', 'http://api.forecast.io/forecast/f3da6c91250a43b747f7ace5266fd1a4/');
    console.log(item);
    var x = request.get(item);
    req.pipe(x);
    x.pipe(res);
});
sarcatserver.get('/elevation/*', function(req, res) {
    var item = req.url.replace('/elevation/', 'http://open.mapquestapi.com/elevation/v1/profile?key=Fmjtd|luur2h6tnd,b2=o5-9wa2lr&shapeFormat=json&');
    console.log(item);
    var x = request.get(item);
    req.pipe(x);
    x.pipe(res);
});
sarcatserver.listen(sarcatServerPort);
console.log('now serving sarcatServer on: ' + sarcatServerPort);


var demoApp = path.join(__dirname, '../', 'sarcat');


var config = require(demoApp + '/config.json');
var METEOR_SETTINGS = require(demoApp + '/settings.json');
var spawn = require('child_process').spawn;

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




if (!fs.existsSync(sarcatdb)) {
    console.log('creating sarcatDB: ' + sarcatdb);
    fs.mkdirSync(sarcatdb);
}




console.log(demoApp);
var mongod = 'mongod';
if (fs.existsSync(demoApp + '/' + 'bin/mongodb/bin/mongod')) {
    mongod = demoApp + '/' + 'bin/mongodb/bin/mongod';
}

var node = 'node';
if (fs.existsSync(demoApp + '/' + 'bin/node/bin/node')) {
    node = demoApp + '/' + 'bin/node/bin/node';
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



function runapp() {

    var startSARCAT = spawn(node, [demoApp + '/app/main.js'], {
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
