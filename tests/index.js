//var config = require('./config.js');
//var iron = require('./scripts/iron')(config.ironClient);
//var hash = require('./scripts/hash');
//var phantompdf = require('./scripts/phantompdf');
var fs = require('fs');
var path = require('path');
var request = require('request');


//var app = require('./scripts/server')();


var express = require('express');
var bodyParser = require('body-parser');


var app = express();


app.use(bodyParser.json({
    limit: '500mb'
}));




app.post('/uploadISRID', function(req, res) {
    var profile = req.body.profile;
    var agencyProfile = profile.agencyProfile;
    var agency = agencyProfile.organization;
    var data = req.body.data;
    var dir = 'uploads';
    var fileName = agency + '-' + createDate();
    var write = fs.writeFileSync(dir + '/' + fileName + '.json', JSON.stringify(req.body));
    console.log(write);
    return res.send(write);

});

var createDate = function() {
    var d = new Date();
    var yyyy = d.getFullYear()
        .toString();
    var mm = (d.getMonth() + 1)
        .toString();
    var dd = d.getDate()
        .toString();

    var hh = d.getHours().toString();
    var mm = d.getMinutes().toString();
    var ss = d.getSeconds().toString();
    return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]) + '_' + hh + ':' + mm + ':' + ss;
};


app.get('/weather/*', function(req, res) {
    var item = req.url.replace('/weather/', 'http://api.forecast.io/forecast/f3da6c91250a43b747f7ace5266fd1a4/');
    console.log(item);
    var x = request.get(item);
    req.pipe(x);
    x.pipe(res);
});


app.get('/elevation/*', function(req, res) {
    var item = req.url.replace('/elevation/', 'http://open.mapquestapi.com/elevation/v1/profile?key=Fmjtd|luur2h6tnd,b2=o5-9wa2lr&shapeFormat=json&');
    console.log(item);
    var x = request.get(item);
    req.pipe(x);
    x.pipe(res);
});


app.listen(process.env.PORT || 5000);
