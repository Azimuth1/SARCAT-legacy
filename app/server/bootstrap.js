Meteor.startup(function () {
    var settings = JSON.parse(process.env.METEOR_SETTINGS);
    console.log(settings)
    var environment = process.env.METEOR_ENV || "development";
    var config = Config.findOne();
    var privateSettings = settings.private;
    var defaultUser = privateSettings.defaultUser || {
        email: 'admin@sarcat',
        password: 'admin',
        username: 'default'
    };
    if (!config) {
        console.log('Creating default admin user.');
        var admin = Accounts.createUser({
            email: defaultUser.email,
            password: defaultUser.password,
            username: defaultUser.username
        });
        Roles.addUsersToRoles(admin, ['admin']);
        console.log('saving settings.config to mongodb')
        Config.insert(settings.config);
    }
    Meteor.settings.public.email = defaultUser.email;
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
        /*finished: function (fileInfo, formFields) {
            if (formData._id) {
                return '/records/' + formData._id;
            }
            if (formData.type === 'logo') {
                return '/logo';
            }
        },*/
        cacheTime: 100,
    });
});
return

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
var data = [];
var length = 100;
for (var i = 0; i < length; i++) {
    var record = {
        "_id": "jvTdNXbq735pbpmZN",
        "coords": {
            "ippCoordinates": {
                "lat": 38.95940093438834,
                "lng": -77.11638450622559
            },
            "findCoord": {
                "lat": 39.128994951066765,
                "lng": -76.88369750976561
            },
            "intendedRoute": "[[38.95940093438834,-77.11638450622559],[39.059823558538355,-76.57897710800171]]",
            "destinationCoord": {
                "lat": 39.059823558538355,
                "lng": -76.57897710800171
            },
            "actualRoute": "[[38.95940093438834,-77.11638450622559],[39.128994951066765,-76.88369750976561]]",
            "decisionPointCoord": {
                "lat": 39.02558514933794,
                "lng": -76.90292358398438
            }
        },
        "recordInfo": {
            "name": "5",
            "incidentnum": "5",
            "missionnum": "5",
            "incidentdate": "05/25/2015 01:38",
            "incidentType": "Search",
            "incidentEnvironment": "Land",
            "subjectCategory": "Abandoned Vehicle",
            "status": "Closed"
        },
        "measureUnits": "US",
        "userId": "E5C5fHJHM3No9D6eM",
        "created": "05/12/2015 01:38",
        "incidentOperations": {
            "initialDirectionofTravel_Boolean": "Yes",
            "lkp_pls_Boolean": "No",
            "initialDirectionofTravel": 92,
            "typeofDecisionPoint": "Saddle",
            "decisionPointFactor": "Yes"
        },
        "incidentLocation": {
            "country": "United States",
            "state-province": "MD",
            "ecoregionDomain": "TEMPERATE",
            "ecoregionDivision": "230-SUBTROPICAL DIVISION",
            "county-region": "Loudoun County",
            "landOwner": "NPS",
            "terrain": "Flat",
            "populationDensity": "Suburban",
            "landCover": "Bare"
        },
        "incident": {
            "leadagency": "County Police",
            "contactmethod": "Satelitte Alerting Technology",
            "SARNotifiedDateTime": "05/14/2015 02:17"
        },
        "weather": {
            "summary": "Mostly cloudy throughout the day.",
            "precipType": "rain",
            "temperatureMin": 63.92,
            "temperatureMax": 77.48,
            "windSpeed": "4.73",
            "cloudCover": "0.64"
        },
        "findLocation": {
            "findFeature": "Cave",
            "detectability": "Good",
            "distanceIPP": "17.13",
            "findBearing": "46",
            "elevationChange": "55",
            "dispersionAngle": "78",
            "trackOffset": "70"
        },
        "subjects": {
            "subject": [{
                "_key": "2015-05-12T05:58:11.766Z",
                "age": 9,
                "sex": "Male",
                "status": "Alive and well"
            }, {
                "_key": "2015-05-12T06:01:44.073Z",
                "status": "Injured",
                "age": 16,
                "sex": "Female"
            }, {
                "_key": "2015-05-12T06:17:36.269Z",
                "status": "DOA",
                "age": 32,
                "sex": "Male"
            }]
        },
        "resourcesUsed": {
            "resource": [{
                "_key": "2015-05-12T06:18:36.635Z",
                "type": "CERT",
                "count": 8,
                "hours": 9,
                "findResource": true
            }, {
                "_key": "2015-05-12T06:18:40.215Z",
                "type": "Boat",
                "count": 7,
                "hours": 9
            }, {
                "_key": "2015-05-12T06:18:41.487Z",
                "type": "Cave",
                "count": 5,
                "hours": 5
            }],
            "numTasks": 87,
            "totalPersonnel": 56,
            "totalManHours": 234,
            "distanceTraveled": "654",
            "totalCost": "$1,000"
        },
        "customQuestions": {},
        "admin": {
            "user": "Kyle Kalwarski",
            "email": "kkalwarski@gmail.com",
            "phonenum": "7036290113"
        },
        "incidentOutcome": {
            "incidentOutcome": "Closed by Self-Rescue",
            "subjectLocatedDateTime": "05/13/2015 02:18",
            "incidentClosedDateTime": "05/13/2015 02:18",
            "scenario": "Evading",
            "signalling": "SPOT",
            "injuredSearcher": "No",
            "lostStrategy": "Downhill",
            "mobility_hours": 9
        },
        "xComments": {}
    };
    delete record._id;
    delete record.created;
    record.recordInfo.name = 'Record-' + i;
    record.recordInfo.incidentnum = i;
    record.recordInfo.missionnum = '#2015' + i;
    record.created = moment(randomDate(new Date(2012, 0, 1), new Date())).format('MM/DD/YYYY HH:mm');
    record.recordInfo.incidentdate = moment(randomDate(new Date(2012, 0, 1), new Date())).format('MM/DD/YYYY HH:mm');
    var allowed = Schemas.recordInfo._schema.incidentType.allowedValues;
    if (allowed) {
        var sample = _.sample(allowed, 1)[0];
        record.recordInfo.incidentType = sample;
    }
    _.each(record.recordInfo, function (d, name) {
        var allowed = Schemas.recordInfo._schema[name].allowedValues;
        if (allowed) {
            var sample = _.sample(allowed, 1)[0];
            record.recordInfo[name] = sample;
        }
    });
    _.each(record.incident, function (d, name) {
        var allowed = Schemas.incident._schema[name].allowedValues;
        if (allowed) {
            var sample = _.sample(allowed, 1)[0];
            record.incident[name] = sample;
        }
    });
    _.each(record.incidentLocation, function (d, name) {
        var allowed = Schemas.incidentLocation._schema[name].allowedValues;
        if (allowed) {
            var sample = _.sample(allowed, 1)[0];
            record.incidentLocation[name] = sample;
        }
    });
    _.each(record.findLocation, function (d, name) {
        var allowed = Schemas.findLocation._schema[name].allowedValues;
        if (allowed) {
            var sample = _.sample(allowed, 1)[0];
            record.findLocation[name] = sample;
        }
    });
    _.each(record.incidentoutcome, function (d, name) {
        var allowed = Schemas.incidentoutcome._schema[name].allowedValues;
        if (allowed) {
            var sample = _.sample(allowed, 1)[0];
            //console.log(record.incident[name],sample)
            record.incidentoutcome[name] = sample;
        }
    });
    _.each(record.subjects.subject, function (e, ind) {
        _.each(e, function (d, name) {
            var allowed = Schemas.subjects._schema['subject.$.' + name].allowedValues;
            if (allowed) {
                var sample = _.sample(allowed, 1)[0];
                // console.log(record.subjects.subject[ind][name],sample)
                record.subjects.subject[ind][name] = sample;
            }
        });
        e.age = Math.floor(Math.random() * 70) + 1;
    });
    var lat = +(Math.random() * (38.800 - 38.2200) + 38.2200)
        .toFixed(4);
    var lng = -(Math.random() * (77.950 - 77.310) + 77.310)
        .toFixed(4);
    record.coords.ippCoordinates.lat = lat;
    record.coords.ippCoordinates.lng = lng;
    _.each(record.coords, function (d, name) {
        if (name === 'ippCoordinates') {
            return;
        }
        if (d.lat) {
            d.lat = lat + parseFloat((Math.random() * (0.100 - (-0.1)) + (-0.1))
                .toFixed(4));
            d.lng = lng + parseFloat((Math.random() * (0.100 - (-0.1)) + (-0.1))
                .toFixed(4));
        }
    })
    data[i] = record;
}
data.forEach(function (d) {
    Records.insert(d);
})
