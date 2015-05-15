createSampleRecords = function () {
    function randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
    var data = [];
    var length = 100;
    for (var i = 0; i < length; i++) {
        var record = {
            "coords": {
                "ippCoordinates": {
                    "lat": 38.90879303268068,
                    "lng": -77.2573184967041
                },
                "findCoord": {
                    "lat": 39.104488809440475,
                    "lng": -76.93450927734375
                },
                "destinationCoord": {
                    "lat": 38.97222194853654,
                    "lng": -76.8658447265625
                },
                "intendedRoute": "[[38.90879303268068,-77.2573184967041],[38.97222194853654,-76.8658447265625]]",
                "actualRoute": "[[38.90879303268068,-77.2573184967041],[39.104488809440475,-76.93450927734375]]",
                "decisionPointCoord": {
                    "lat": 38.976492485539424,
                    "lng": -77.0635986328125
                }
            },
            "recordInfo": {
                "name": "Record-99",
                "incidentnum": 99,
                "missionnum": "#201599",
                "incidentdate": "05/01/2015 13:14",
                "incidenttype": "Search",
                "status": "Closed"
            },
            "measureUnits": "US",
            "userId": "FuZitzYuiJeR8gbQ3",
            "incidentOperations": {
                "initialDirectionofTravel_Boolean": "Yes",
                "ipptype": "Point Last Seen",
                "ippclassification": "Residence",
                "initialDirectionofTravel": 99,
                "DOTHowdetermined": "Physical Clue",
                "typeofDecisionPoint": "Saddle"
            },
            "incident": {
                "incidentEnvironment": "Land",
                "ecoregiondomain": "TEMPERATE",
                "ecoregionDivision": "230-SUBTROPICAL DIVISION",
                "leadagency": "Maryland State Police",
                "SARNotifiedDateTime": "05/02/2015 13:18",
                "country": "USA",
                "state-province": "MD",
                "county-region": "Montgomery",
                "subjectcategory": "ATV",
                "contactmethod": "Vehicle Found",
                "landOwner": "Commercial",
                "populationDensity": "Rural",
                "landCover": "Bare",
                "terrain": "Hilly"
            },
            "weather": {},
            "rescueDetails": {
                "signalling": "SPOT",
                "injuredSearcher": "No"
            },
            "subjects": {
                "subject": [{
                    "_key": "2015-05-04T17:19:48.925Z",
                    "age": 54,
                    "sex": "Male",
                    "status": "DOA",
                    "evacuationMethod": "Walkout",
                    "mechanism": "Fall - ground level",
                    "illness": "Appendicitis",
                    "weight": "180",
                    "height": "72",
                    "physical_fitness": "Excellent",
                    "experience": "Poor",
                    "equipment": "Fair",
                    "clothing": "Excellent",
                    "survival_training": "Poor",
                    "local": "Yes",
                    "injuryType": "Frostbite",
                    "treatmentby": "EMT"
                }, {
                    "_key": "2015-05-04T17:19:48.925Z",
                    "age": 54,
                    "sex": "Male",
                    "status": "DOA",
                    "evacuationMethod": "Walkout",
                    "mechanism": "Fall - ground level",
                    "illness": "Appendicitis",
                    "weight": "180",
                    "height": "72",
                    "physical_fitness": "Excellent",
                    "experience": "Poor",
                    "equipment": "Fair",
                    "clothing": "Excellent",
                    "survival_training": "Poor",
                    "local": "Yes",
                    "injuryType": "Frostbite",
                    "treatmentby": "EMT"
                }, {
                    "_key": "2015-05-04T17:19:48.925Z",
                    "age": 54,
                    "sex": "Male",
                    "status": "DOA",
                    "evacuationMethod": "Walkout",
                    "mechanism": "Fall - ground level",
                    "illness": "Appendicitis",
                    "weight": "180",
                    "height": "72",
                    "physical_fitness": "Excellent",
                    "experience": "Poor",
                    "equipment": "Fair",
                    "clothing": "Excellent",
                    "survival_training": "Poor",
                    "local": "Yes",
                    "injuryType": "Frostbite",
                    "treatmentby": "EMT"
                }, {
                    "_key": "2015-05-04T17:19:48.925Z",
                    "age": 54,
                    "sex": "Male",
                    "status": "DOA",
                    "evacuationMethod": "Walkout",
                    "mechanism": "Fall - ground level",
                    "illness": "Appendicitis",
                    "weight": "180",
                    "height": "72",
                    "physical_fitness": "Excellent",
                    "experience": "Poor",
                    "equipment": "Fair",
                    "clothing": "Excellent",
                    "survival_training": "Poor",
                    "local": "Yes",
                    "injuryType": "Frostbite",
                    "treatmentby": "EMT"
                }]
            },
            "resourcesUsed": {
                "resource": [{
                    "_key": "2015-05-04T17:20:18.143Z",
                    "type": "Boat",
                    "count": 3,
                    "hours": 7,
                    "findResource": true
                }, {
                    "_key": "2015-05-04T17:20:21.544Z",
                    "type": "Bike",
                    "count": 4,
                    "hours": 3
                }, {
                    "_key": "2015-05-04T17:20:24.502Z",
                    "type": "Dogs",
                    "count": 5,
                    "hours": 6
                }],
                "numTasks": 8,
                "totalManHours": 234,
                "totalCost": "$1,3300",
                "totalPersonnel": 83,
                "distanceTraveled": "543"
            },
            "admin": {
                "user": "Kyle Kalwarski",
                "email": "kyle.kalwarski@azimuth1.com",
                "phonenum": "7036290113"
            },
            "incidentOutcome": {
                "lkp_pls_Boolean": "No",
                "distanceIPP": "21.99",
                "findBearing": "52",
                "incidentOutcome": "Closed by Search",
                "subjectLocatedDateTime": "05/03/2015 13:18",
                "incidentClosedDateTime": "05/03/2015 13:19",
                "scenario": "Criminal",
                "suspensionReasons": "Weather",
                "findFeature": "Forest/Woods",
                "detectability": "Good",
                "mobility&Responsiveness": "Immobile and responsive",
                "lostStrategy": "Evasive",
                "mobility_hours": 8
            }
        };
        delete record._id;
        delete record.created;
        record.recordInfo.name = 'Record-' + i;
        record.recordInfo.incidentnum = i;
        record.recordInfo.missionnum = '#2015' + i;
        record.created = moment(randomDate(new Date(2012, 0, 1), new Date())).format('MM/DD/YYYY HH:mm');
        record.recordInfo.incidentdate = moment(randomDate(new Date(2012, 0, 1), new Date())).format('MM/DD/YYYY HH:mm');
        var allowed = Schemas.recordInfo._schema.incidenttype.allowedValues;
        if (allowed) {
            var sample = _.sample(allowed, 1)[0];
            record.recordInfo.incidenttype = sample;
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
        _.each(record.coords, function (d) {
            if (d.lat) {
                d.lat = +(Math.random() * (38.800 - 38.2200) + 38.2200)
                    .toFixed(4);
                d.lng = -(Math.random() * (77.950 - 77.310) + 77.310)
                    .toFixed(4);
            }
        })
        data[i] = record;
    }
    data.forEach(function (d) {
        Records.insert(d);
    })
};
