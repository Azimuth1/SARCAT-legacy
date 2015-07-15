genList = function(records) {
    var resourceArrayForm = function(data) {
        return _.chain(data.resourcesUsed.resource)
            .sortBy(function(d) {
                return -d.count;
            })
            .map(function(d) {
                var sum = 'Total Count: ' + d.count + ',Total Hours: ' + d.hours;
                return {
                    key: d.type,
                    parent: 'Resources Used',
                    val: sum
                };
            })
            .value();
    };
    var subjectArrayForm = function(flatData, name, parent) {
        return _.chain(flatData)
            .map(function(d, e) {
                if (e.indexOf('_key') > -1) {
                    return;
                }
                if (e.indexOf('.' + name + '.') > -1) {
                    return {
                        key: e,
                        val: d
                    };
                }
            })
            .compact()
            .groupBy(function(d) {
                return d.key.substr(d.key.lastIndexOf('.') + 1);
            })
            .map(function(d, e) {
                hide = ['name', 'address', 'homePhone', 'cellPhone', 'other'];
                if (_.contains(hide, e)) {
                    return [];
                }
                var items = d.map(function(f) {
                        return f.val;
                    })
                    .sort();
                var sum = _.chain(items)
                    .reduce(function(counts, word) {
                        counts[word] = (counts[word] || 0) + 1;
                        return counts;
                    }, {})
                    .map(function(d, e) {
                        return [d, e];
                    })
                    .sortBy(function(d) {
                        return -d[0];
                    })
                    .map(function(d, e) {
                        if (d[0] === 1) {
                            return d[1];
                        };
                        return d[1] + '(' + d[0] + ')';
                    })
                    .value()
                    .join(', ');
                return {
                    key: e,
                    parent: parent,
                    val: items.sort()
                        .join(', '),
                    val: sum
                };
            })
            .value();
    };
    if (!records || !records.length) {
        return;
    }
    return records.map(function(data) {
        if (!data) {
            return {};
        }
        var displayData = _.chain(data)
            .map(function(val, schema1) {
                var ignore = ['_id', 'subjects', 'resourcesUsed'];
                if (ignore.indexOf(schema1) !== -1) {
                    return;
                }
                if (typeof(val) === 'string') {
                    return;
                }
                var ignoreKeys = ['userId'];
                var check = Schemas[schema1] || {};
                var schema = check._schema || {};
                var sar = Schemas.SARCAT._schema || {};
                var parent = sar[schema1].label || 'other';
                var results = _.map(val, function(d, e) {
                    var labelCheck = schema[e] || {};
                    var label = labelCheck.label || e;
                    if (_.contains(ignoreKeys, label)) {
                        return;
                    }
                    if (typeof(d) === 'object') {
                        d = _.map(d, function(d, e) {
                                d = d || '?';
                                return e + ':' + d;
                            })
                            .join(',');
                    }
                    d = d || '?';
                
                    if (d.length > 50) {
                        d = d.substring(0, 50)+'.....';
                    }
                    return {
                        key: label,
                        parent: parent,
                        val: d
                    };
                });
                return results;
            })
            .flatten()
            .compact()
            .value();
        var subjects2 = subjectArrayForm(flatten(data, {}), 'subject', 'Subjects');
        var resources2 = resourceArrayForm(data);
        displayData = _.flatten([subjects2, resources2, displayData]);
        displayData2 = _.chain(displayData)
            .groupBy('parent')
            .map(function(d, e) {
                return {
                    field: e,
                    data: d
                };
            })
            .value();
        return {
            _id: 'map-' + data._id,
            data: displayData2,
            record: data
        };
    });
};
allowedStates = function(country) {
    if (!country) {
        return [];
    }
    var vals = _.findWhere(countryList, {
            country: country
        })
        .states;
    vals = vals.map(function(d) {
        return {
            label: d,
            value: d
        }
    });
    Session.set('allowedStates', vals);
    return vals;
};
flatten = function(x, result, prefix) {
    if (_.isObject(x)) {
        _.each(x, function(v, k) {
            flatten(v, result, prefix ? prefix + '.' + k : k)
        })
    } else {
        result[prefix] = x
    }
    return result
}
labelUnits = function(currentUnit, type) {
    var unitType = {
        height: {
            Metric: 'cm',
            US: 'in'
        },
        weight: {
            Metric: 'kg',
            US: 'lbs'
        },
        distanceMed: {
            Metric: 'Meters',
            US: 'Yards'
        },
        distanceSmall: {
            Metric: 'Meters',
            US: 'Feet'
        },
        distance: {
            Metric: 'Kilometers',
            US: 'Miles'
        },
        distanceSmall: {
            Metric: 'Meters',
            US: 'Feet'
        },
        temperature: {
            Metric: '°C',
            US: '°F'
        },
        speed: {
            Metric: 'kph',
            US: 'mph'
        }
    };
    return unitType[type][currentUnit]
};
boundsString2Array = function(bounds) {
    if (!bounds) {
        return;
    }
    bounds = bounds.split(',')
        .map(function(d) {
            return +d;
        });
    return [
        [bounds[1], bounds[0]],
        [bounds[3], bounds[2]]
    ];
};
newMap = function(context, bounds) {
    var bounds = bounds || boundsString2Array(Session.get('bounds'));
    var map = L.map(context, {});
    var defaultLayers = Meteor.settings.public.layers;
    var layers = _.object(_.map(defaultLayers, function(x, e) {
        return [e, L.tileLayer(x)];
    }));
    var firstLayer = Object.keys(layers)[0];
    layers[firstLayer].addTo(map);
    L.control.layers(layers)
        .addTo(map);
    map.scrollWheelZoom.disable();
    map.fitBounds(bounds);
};
newProjectSetMap = function(context, bounds, points) {
    var obj = {};
    var marker;
    var map = L.map(context, {});
    var defaultLayers = Meteor.settings.public.layers;
    var layers = _.object(_.map(defaultLayers, function(x, e) {
        return [e, L.tileLayer(x)];
    }));
    var firstLayer = Object.keys(layers)[0];
    layers[firstLayer].addTo(map);
    L.control.layers(layers)
        .addTo(map);
    var latLngBounds = L.latLngBounds(bounds);
    var center = latLngBounds.getCenter();
    obj.editPoint = function(lat, lng) {
        marker.setLatLng([lat, lng]);
    };
    obj.reset = function() {
        map.fitBounds(bounds);
        marker.setLatLng(center);
        $('[name="' + points.name + '.lng"]')
            .val(center.lng)
            .trigger("change");
        $('[name="' + points.name + '.lat"]')
            .val(center.lat)
            .trigger("change");
        $('[name="coords.bounds"]')
            .val(bounds.toString())
            .trigger("change");
    };
    map.scrollWheelZoom.disable();
    var ipp = {
        val: "ippCoordinates",
        name: "coords.ippCoordinates",
        text: 'IPP Location. <br>Direction of Travel (hover to edit): <div class="fa fa-arrow-circle-up fa-2x fa-fw travelDirection"></div>', //"IPP Location",
        icon: 'fa-times-circle-o',
        color: 'red'
    };
    var myIcon = L.AwesomeMarkers.icon({
        icon: ipp.icon,
        prefix: 'fa',
        markerColor: ipp.color,
        iconColor: '#fff',
    });
    var marker = L.marker(center, {
        draggable: true,
        icon: L.AwesomeMarkers.icon({
            icon: ipp.icon,
            prefix: 'fa',
            markerColor: ipp.color,
            iconColor: '#fff',
        }),
        name: ipp.name,
        val: ipp.val,
    });
    marker.addTo(map);
    marker.on('dragend', function(event) {
        var marker = event.target;
        var position = marker.getLatLng();
        $('[name="' + points.name + '.lng"]')
            .val(position.lng)
            .trigger("change");
        $('[name="' + points.name + '.lat"]')
            .val(position.lat)
            .trigger("change");
    });
    obj.fitBounds = function() {
        map.panTo(marker.getLatLng())
    };
    return obj;
};
//<span class="fa-stack"><i class="fa fa-circle fa-stack-2x"></i><i class="fa a-stack-1x fa-inverse text-red">R</i></span>
getCoords = function(record) {
    var mapPoints = [{
        val: "ippCoordinates",
        name: "coords.ippCoordinates",
        text: 'IPP Location. <br>Direction of Travel (hover to edit): <div class="fa fa-arrow-circle-up fa-2x fa-fw travelDirection"></div>', //"IPP Location",
        icon: 'fa-times-circle-o',
        color: 'red'
    }, {
        val: "decisionPointCoord",
        name: "coords.decisionPointCoord",
        text: "Decision Point",
        icon: 'fa-code-fork',
        color: 'orange'
    }, {
        val: "destinationCoord",
        name: "coords.destinationCoord",
        text: "Intended Destination",
        icon: 'fa-flag-checkered',
        color: 'blue'
    }, {
        val: "revisedLKP_PLS",
        name: "coords.revisedLKP_PLS",
        text: "Revised IPP",
        icon: 'fa-times-circle-o',
        color: 'darkred',
        tColor: '#000'
    }, {
        val: "findCoord",
        name: "coords.findCoord",
        text: "Find Location",
        icon: 'fa-flag-checkered',
        color: 'green'
    }, {
        val: "intendedRoute",
        name: "coords.intendedRoute",
        text: "Intended Route",
        path: {
            stroke: '#37A8DA'
        }
    }, {
        val: "actualRoute",
        name: "coords.actualRoute",
        text: "Actual Route",
        path: {
            stroke: 'green',
            weight: 8
        }
    }];
    mapPoints = _.object(_.map(mapPoints, function(x) {
        return [x.val, x];
    }));
    if (!record.coords) {
        return mapPoints;
    }
    var coords = record.coords;
    _.each(mapPoints, function(d, e) {
        mapPoints[e].coords = coords[e];
    });
    return _.map(mapPoints, function(d) {
        return d;
    });
};
insertSampleRecords = function() {
    function randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
    data = [];
    var length = 100;
    var rand = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    existing = {};
    var generateWeighedList = function(list, name) {
        var f = name + [list[1]];
        var weight
        if (existing[f]) {
            weight = existing[f];
        } else {
            //    console.log(name)
            //var _weight = [.2, .1, .7, .1, .1,.01,.05,.1];
            //weightb=a.slice(0,3);
            //weight = _.shuffle(weight);
            weight = list.map(function(d) {
                return Math.random() * 0.2;
            });
            if (weight.length > 8) {
                weight = _.sample(weight, 4);
            }
            weight[Math.floor((weight.length - 1) / 2)] = 0.9;
            existing[f] = weight;
        }
        //console.log(name, f, list.length, weight)
        //console.log(name,weight)
        //if(weight[3]){weight[3]=.9}
        weighed_list = [];
        //console.log(weight)
        // Loop over weights
        for (var i = 0; i < weight.length; i++) {
            var multiples = weight[i] * 100;
            // Loop over the list of items
            for (var j = 0; j < multiples; j++) {
                weighed_list.push(list[i]);
            }
        }
        // console.log(weighed_list)
        var result = _.sample(weighed_list, 1)[0];
        //console.log(result, weighed_list);
        return result;
    };
    //var list = ['javascript', 'php', 'ruby', 'python'];
    //var weight = [0.5, 0.2, 0.2, 0.1];
    //generateWeighedList(list);
    for (var i = 0; i < length; i++) {
        var record = {
            "_id": "nWJatHtbrHGQWivL8",
            "coords": {
                "ippCoordinates": {
                    "lat": 36.03133177633189,
                    "lng": -87.890625
                },
                "destinationCoord": {
                    "lng": -87.8908920511095,
                    "lat": 36.03025115040913
                },
                "findCoord": {
                    "lng": -87.89344596002132,
                    "lat": 36.03214315540346
                },
                "intendedRoute": "[[36.03133177633189,-87.890625],[36.03025115040913,-87.8908920511095]]",
                "decisionPointCoord": {
                    "lng": -87.89459528531354,
                    "lat": 36.03235650665151
                },
                "actualRoute": "[[36.03133177633189,-87.890625],[36.03214315540346,-87.89344596002132]]"
            },
            "recordInfo": {
                "name": "1",
                "incidentnum": "1",
                "missionnum": "1",
                "incidentType": "Search",
                "incidentEnvironment": "Land",
                "subjectCategory": "Abandoned Vehicle",
                "status": "Active"
            },
            "measureUnits": "US",
            "userId": "FDbb85RrpkPfTvwNM",
            "created": "06/23/2015 10:00",
            "timeLog": {
                "lastSeenDateTime": "06/16/2015 10:24",
                "SARNotifiedDatetime": "06/23/2015 10:24",
                "subjectLocatedDateTime": "06/20/2015 10:24",
                "totalMissingHours": 96,
                "totalSearchHours": -72,
                "incidentClosedDateTime": "06/21/2015 10:24"
            },
            "incidentOperations": {
                "ipptype": "Point Last Seen",
                "initialDirectionofTravel_Boolean": "Yes",
                "lkp_pls_Boolean": "No",
                "ippclassification": "Building",
                "initialDirectionofTravel": 152,
                "DOTHowdetermined": "Sighting"
            },
            "incidentLocation": {
                "country": "United States",
                "state-province": "Maryland",
                "county-region": "Fairfax",
                "ecoregionDomain": "TEMPERATE",
                "ecoregionDivision": "230-SUBTROPICAL DIVISION",
                "landOwner": "Commercial",
                "populationDensity": "Suburban",
                "contactmethod": "Vehicle Found",
                "terrain": "Hilly",
                "landCover": "Bare",
                "leadagency": "State police"
            },
            "weather": {
                "summary": "Light rain in the morning and afternoon.",
                "precipType": "rain",
                "temperatureMin": 72.7,
                "temperatureMax": 92.79,
                "windSpeed": "2.9",
                "cloudCover": "0.12"
            },
            "findLocation": {
                "findFeature": "Canyon",
                "detectability": "Excellent",
                "distanceIPP": "0.17",
                "findBearing": "289",
                "dispersionAngle": "137",
                "elevationChange": "-75",
                "trackOffset": "40"
            },
            "incidentOutcome": {
                "incidentOutcome": "Closed by Public",
                "scenario": "Criminal",
                "signalling": "ELT",
                "lostStrategy": "Contoured",
                "mobility&Responsiveness": "Immobile and responsive",
                "injuredSearcher": "No",
                "mobility_hours": 70
            },
            "subjects": {
                "subject": [{
                    "_key": "2015-06-23T14:24:58.427Z",
                    "age": 21,
                    "sex": "Male",
                    "weight": "80",
                    "height": "50",
                    "physical_fitness": "Poor",
                    "experience": "Poor",
                    "equipment": "Poor",
                    "clothing": "Fair",
                    "survival_training": "Poor",
                    "local": "Yes",
                    "status": "Alive and well",
                    "evacuationMethod": "Carryout",
                    "name": "U2FsdGVkX18IUHGEpyJTQVTAwRtHoeH9YOBMmNFlZkU=",
                    "address": "U2FsdGVkX18e5fWyEmEU+CEMcDDShkf/qPVRmmlo3Ys=",
                    "homePhone": "U2FsdGVkX190LqRRhNIBDW7bjEZaKQ2tNrQpcOuc488=",
                    "cellPhone": "U2FsdGVkX1+eMhsGygZ2DjVQkY0r5rF3dk/Zal+cxs8="
                }]
            },
            "resourcesUsed": {
                "resource": [{
                    "_key": "2015-06-23T14:26:00.493Z",
                    "type": "Boat",
                    "count": 80,
                    "hours": 3,
                    "findResource": true
                }, {
                    "_key": "2015-06-23T14:26:09.207Z",
                    "type": "Horseback rider",
                    "count": 3,
                    "hours": 4,
                    "findResource": true
                }],
                "numTasks": 87,
                "totalManHours": 77,
                "totalPersonnel": 7,
                "distanceTraveled": "77",
                "totalCost": "$1,000,000"
            },
            "customQuestions": {},
            "admin": {
                "userId": "FDbb85RrpkPfTvwNM",
                "user": "Kyle Kalwarski",
                "email": "kyle.kalwarski@azimuth1.com"
            },
            "xComments": {
                "summary": "Good Search!"
            }
        };
        delete record._id;
        delete record.created;
        //delete recordInfo.incidentnum;
        record.created = moment(randomDate(new Date(2012, 0, 1), new Date()))
            .format('MM/DD/YYYY HH:mm');
        record.timeLog.lastSeenDateTime = record.created;
        record.timeLog.SARNotifiedDatetime = moment(record.timeLog.lastSeenDateTime)
            .add(Math.floor(Math.random() * 40), 'h')
            .format('MM/DD/YYYY HH:mm');
        record.timeLog.subjectLocatedDateTime = moment(record.timeLog.SARNotifiedDatetime)
            .add(Math.floor(Math.random() * 6), 'd')
            .format('MM/DD/YYYY HH:mm');
        record.timeLog.incidentClosedDateTime = moment(record.timeLog.subjectLocatedDateTime)
            .add(Math.floor(Math.random() * 10), 'h')
            .format('MM/DD/YYYY HH:mm');
        //console.log(Schemas)
        _.each(record, function(d, name) {
            if (!isNaN(d)) {
                d = 500;
                record[name] = Math.floor(Math.abs((Math.random() * ((d * 2) - (d / 5)) + (d / 5))))
            }
            if (_.isObject(d)) {
                _.each(d, function(e, name2) {
                    if (!isNaN(e)) {
                        e = 500;
                        record[name][name2] = Math.floor(Math.abs((Math.random() * ((e * 2) - (e / 5)) + (e / 5))))
                    }
                    var allowed = Schemas[name]._schema[name2].allowedValues;
                    if (allowed) {
                        //var sample = _.sample(allowed, 1)[0];
                        var sample = generateWeighedList(allowed, name2)
                        record[name][name2] = sample;
                    }
                });
            }
            record.recordInfo.name = 'Record-' + i;
            record.recordInfo.incidentnum = 'record-' + i;
            record.recordInfo.missionnum = '#2015' + i;
        });
        _.each(record.subjects.subject, function(e, ind) {
            _.each(e, function(d, name) {
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
        _.each(record.coords, function(d, name) {
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
        //console.log(record.recordInfo.name)
    }
    data.forEach(function(d) {
        //   console.log(d)
        Records.insert(d);
    });
    return data;
};
