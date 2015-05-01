console.log('bootstrap.js');
Meteor.startup(function () {
    console.log('bootstrap-startup');
    var settings = JSON.parse(process.env.METEOR_SETTINGS);
    var environment = process.env.METEOR_ENV || "development";
    var config = Config.findOne();
    if (!Meteor.users.find()
        .count()) {
        console.log('Creating default admin user.');
        var admin = Accounts.createUser({
            email: 'admin@sarcat',
            password: 'admin',
            username: 'default'
        });
        Roles.addUsersToRoles(admin, ['admin']);
    }
    if (!config) {
        console.log('saving settings.config to mongodb')
        Config.insert(settings.config);
    }
    Meteor.settings.public.config = config || settings.config;
    UploadServer.init({
        tmpDir: process.env.PWD + '/public/uploads/tmp',
        uploadDir: process.env.PWD + '/public/uploads/',
        getDirectory: function (fileInfo, formData) {
            if (formData._id) {
                return '/records/' + formData._id;
            }
            if (formData.type === 'logo') {
                return '/logo';
            }
        },
    });
});
/*
var _r = Records.find()
    .fetch()
    .map(function (d, i) {
        d.recordInfo.name = 'Record-' + i;
        d.recordInfo.incidentnum = i;
        d.recordInfo.missionnum = '#2015' + i;
        delete d._id;
        delete d.created;
        return d;
    })

    records=[{"coords":{"ippCoordinates":{"lat":38.90875497040327,"lng":-77.25752234458923},"findCoord":{"lat":38.9113889091175,"lng":-77.2480273246765},"destinationCoord":{"lat":38.9061793763914,"lng":-77.24697589874268},"decisionPointCoord":{"lat":38.90903464840708,"lng":-77.25609540939331},"revisedLKP_PLS":{"lat":38.908316666837415,"lng":-77.25322008132935},"intendedRoute":"[[38.90875497040327,-77.25752234458923],[38.909251711172956,-77.25588083267212],[38.9061793763914,-77.24697589874268]]","actualRoute":"[[38.90875497040327,-77.25752234458923],[38.9113889091175,-77.2480273246765]]"},"recordInfo":{"name":"Record 1","incidentdate":"2015-04-28T08:28:00.000Z","status":"Active","incidentnum":"1","missionnum":"1","incidenttype":"Search"},"measureUnits":"US","userId":"YhMoFwytmFHHmAutA","created":"2015-04-28T20:29:14.201Z","incident":{"incidentEnvironment":"Land","ecoregiondomain":"TEMPERATE","ecoregionDivision":"230-SUBTROPICAL DIVISION","country":"United States","administrative1":"Virginia","administrative2":"Fairfax County","leadagency":"State Police","subjectcategory":"Ages 1-3 (Toddler)","contactmethod":"Reported Missing","landOwner":"County","populationDensity":"Urban","terrain":"Hilly","landCover":"Moderate"},"weather":{"summary":"Partly cloudy starting in the afternoon, continuing until evening.","temperatureMin":45.72,"temperatureMax":68.24,"windSpeed":"5.36","cloudCover":"0.2","precipType":"none"},"incidentOutcome":{"distanceIPP":"0.54","findBearing":"70","elevationChange":"19","trackOffset":"30","incidentOutcome":"Closed by Search","subject located date-time":"2015-04-01T13:00:00.000","scenario":"Lost","suspensionReasons":"Unknown","findFeature":"Brush","detectability":"Good","mobility&Responsiveness":"Mobile and responsive","lostStrategy":"Stayed put","mobility_hours":4},"rescueDetails":{"injuredSearcher":"Yes"},"subjects":{"subject":[{"_key":"2015-04-29T13:29:33.492Z","age":4,"sex":"Male","weight":"30","height":"20","physical_fitness":"Poor","local":"Yes","status":"Alive and well"}]},"resourcesUsed":{"resource":[{"_key":"2015-04-29T13:29:51.213Z","type":"Dogs","count":3,"hours":6,"findResource":true}],"numTasks":5,"totalPersonnel":6,"totalManHours":90,"distanceTraveled":"104","totalCost":"$30,000"},"admin":{"user":"default","email":"admin@sarcat","phonenum":"7036290113"},"incidentOperations":{"decisionPointFactor":false,"ipptype":"Point Last Seen","ippclassification":"Airport","DOTHowdetermined":"Intended Destination","typeofDecisionPoint":"Shortcut","PLS_HowDetermined":"Intended Destination"}},{"coords":{"ippCoordinates":{"lat":38.85521601075256,"lng":-77.33757019042969},"findCoord":{"lat":38.8985146573459,"lng":-77.00180053710938}},"recordInfo":{"name":"Lost Scouts","incidentdate":"2015-04-15T13:26:00.000Z","status":"Closed","incidentnum":"2","missionnum":"#2015-2","incidenttype":"Search"},"measureUnits":"US","userId":"YhMoFwytmFHHmAutA","created":"2015-04-29T13:31:24.147Z","incident":{"incidentEnvironment":"Land","ecoregiondomain":"TEMPERATE","ecoregionDivision":"230-SUBTROPICAL DIVISION","country":"United States","administrative1":"Virginia","administrative2":"Fairfax County","leadagency":"DC Police","sar notified date-time":"2015-04-16T14:01:00.000","subjectcategory":"Hiker","contactmethod":"Vehicle Found","landOwner":"State","populationDensity":"Rural","terrain":"Flat","landCover":"Bare"},"weather":{"summary":"Mostly cloudy starting in the evening.","precipType":"rain","temperatureMin":47.51,"temperatureMax":64.71,"windSpeed":"4.59","cloudCover":"0.31"},"subjects":{"subject":[{"_key":"2015-04-29T13:34:01.834Z","status":"Alive and well"},{"_key":"2015-04-29T13:34:03.656Z","status":"Injured","evacuationMethod":"Walkout","mechanism":"Medical condition","injuryType":"Laceration","illness":"Seizures","treatmentby":"EMT"},{"_key":"2015-04-29T13:34:05.924Z","status":"DOA","evacuationMethod":"Carryout","mechanism":"Animal attack/bite/sting","injuryType":"Bruise","illness":"Shock","treatmentby":"First-Responder"}]},"resourcesUsed":{"resource":[{"_key":"2015-04-29T13:34:53.600Z","type":"ATV","count":7,"hours":3},{"_key":"2015-04-29T13:34:56.637Z","type":"Dogs","count":3,"hours":8},{"_key":"2015-04-29T13:35:07.641Z","type":"Helicopter","count":2,"hours":4,"findResource":true},{"_key":"2015-04-29T13:35:10.994Z","type":"Public","count":340,"hours":300},{"_key":"2015-04-29T13:35:14.167Z","type":"Boats","count":2,"hours":1},{"_key":"2015-04-29T13:35:29.145Z","type":"Family/Friend","count":21,"hours":5}],"numTasks":9,"totalPersonnel":132,"totalManHours":700,"distanceTraveled":"328","totalCost":"$134,000"},"admin":{"user":"default","email":"admin@sarcat","phonenum":"7036290113"},"incidentOperations":{"decisionPointFactor":false,"ipptype":"Point Last Seen","ippclassification":"Road","initialDirectionofTravel":40,"DOTHowdetermined":"Sighting"},"incidentOutcome":{"distanceIPP":"18.31","findBearing":"80","elevationChange":"-419","incidentOutcome":"Closed by Search","subject located date-time":"2015-04-18T12:54:00.000","incident closed date-time":"2015-04-19T01:00:00.000","scenario":"Lost","findFeature":"Road","detectability":"Fair","mobility&Responsiveness":"Mobile and unresponsive","lostStrategy":"Backtracking","mobility_hours":49}}];
    Records.insert(records)
    config={"initSetup":false,"bounds":"-77.37791061401367,38.87539860063887,-77.13724136352538,38.94218746472249","measureUnits":"US","agencyProfileComplete":true,"agencyProfile":{"organization":"azimuth1","address":"5214 Belvoir Dr","state-region":"Md","country":"United States","phoneNum":"7036290113"},"googleAPI":"AIzaSyDNWoPzOFwqV3F0Z7AFCuFUvENFbwjkaVs","forecastAPI":"f3da6c91250a43b747f7ace5266fd1a4","weatherAPI":true};
    r=_r.map(function(d){  delete d._id;delete d.created;delete d.updated; return d   })
    Records.insert(_r)r.forEach(function(d){   Records.insert(d);})
    */
