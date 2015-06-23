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
sarcatserver.post('/uploadISRID', function (req, res) {
    var profile = req.body.profile;
    var agencyProfile = profile.agencyProfile;
    var agency = agencyProfile.organization;
    var data = req.body.data;
    var dir = 'uploads';
    var fileName = agency + '-' + createDate();
    fs.writeFile(dir + '/' + fileName + '.json', JSON.stringify(req.body), function (err, d) {
        console.log(err, d)
            // if (err) throw err;
        return res.send(err, d);
    });
});
var createDate = function () {
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
sarcatserver.get('/weather/*', function (req, res) {
    var item = req.url.replace('/weather/', 'http://api.forecast.io/forecast/f3da6c91250a43b747f7ace5266fd1a4/');
    console.log(item);
    var x = request.get(item);
    req.pipe(x);
    x.pipe(res);
});
sarcatserver.get('/elevation/*', function (req, res) {
    var item = req.url.replace('/elevation/', 'http://open.mapquestapi.com/elevation/v1/profile?key=Fmjtd|luur2h6tnd,b2=o5-9wa2lr&shapeFormat=json&');
    console.log(item);
    var x = request.get(item);
    req.pipe(x);
    x.pipe(res);
});
sarcatserver.listen(sarcatServerPort);
console.log('now serving sarcatServer on: ' + sarcatServerPort)

