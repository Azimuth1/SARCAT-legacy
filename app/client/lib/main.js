flatten = function (x, result, prefix) {
    if (_.isObject(x)) {
        _.each(x, function (v, k) {
            flatten(v, result, prefix ? prefix + '.' + k : k)
        })
    } else {
        result[prefix] = x
    }
    return result
}
labelUnits = function (currentUnit, type) {
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
boundsString2Array = function (bounds) {
    if (!bounds) {
        return;
    }
    bounds = bounds.split(',')
        .map(function (d) {
            return +d;
        });
    return [
        [bounds[1], bounds[0]],
        [bounds[3], bounds[2]]
    ];
};
newMap = function (context, bounds) {
    var bounds = bounds || boundsString2Array(Session.get('bounds'));
    var map = L.map(context, {});
    var defaultLayers = Meteor.settings.public.layers;
    var layers = _.object(_.map(defaultLayers, function (x, e) {
        return [e, L.tileLayer(x)];
    }));
    var firstLayer = Object.keys(layers)[0];
    layers[firstLayer].addTo(map);
    L.control.layers(layers)
        .addTo(map);
    map.scrollWheelZoom.disable();
    map.fitBounds(bounds);
};
setAdminMap = function (context) {
    var bounds = bounds || boundsString2Array(Session.get('bounds'));
    var map = L.map(context, {});
    var defaultLayers = Meteor.settings.public.layers;
    var layers = _.object(_.map(defaultLayers, function (x, e) {
        return [e, L.tileLayer(x)];
    }));
    var firstLayer = Object.keys(layers)[0];
    layers[firstLayer].addTo(map);
    L.control.layers(layers)
        .addTo(map);
    map.scrollWheelZoom.disable();
    map.fitBounds(bounds);
    var lc = L.control.locate({
            drawCircle: false,
            markerStyle: {
                fillOpacity: 0,
                opacity: 0
            },
            onLocationError: function (err) {
                alert(err.message);
            },
            onLocationOutsideMapBounds: function (context) {
                alert(context.options.strings.outsideMapBoundsMsg);
            },
            locateOptions: {
                maxZoom: 13,
            }
        })
        .addTo(map);
    var searching;
    if (!navigator.geolocation) {
        $('#geolocate')
            .html('Geolocation is not available');
    } else {
        geolocate.onclick = function (e) {
            if (searching) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            $('#geolocate')
                .html('Locating.....');
            searching = true;
            lc.start();
        };
    }
    map.on('locationfound', function (e) {
        $('#geolocate')
            .remove();
        $('.mapCrosshair')
            .css('color', '#00CB00');
    });
    map.on('locationerror', function () {
        $('#geolocate')
            .html('Position could not be found - Drag map to set extent');
    });
    map.on('moveend', function () {
        var bnds = map.getBounds()
            .toBBoxString();
        $('[name="bounds"]')
            .val(bnds)
            .trigger("change");
    });
    return map;
}
newProjectSetMap = function (context, bounds, points) {
    var obj = {};
    var marker;
    var map = L.map(context, {});
    var defaultLayers = Meteor.settings.public.layers;
    var layers = _.object(_.map(defaultLayers, function (x, e) {
        return [e, L.tileLayer(x)];
    }));
    var firstLayer = Object.keys(layers)[0];
    layers[firstLayer].addTo(map);
    L.control.layers(layers)
        .addTo(map);
    var latLngBounds = L.latLngBounds(bounds);
    var center = latLngBounds.getCenter();
    obj.editPoint = function (lat, lng) {
        marker.setLatLng([lat, lng]);
    };
    obj.reset = function () {
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
    marker.on('dragend', function (event) {
        var marker = event.target;
        var position = marker.getLatLng();
        $('[name="' + points.name + '.lng"]')
            .val(position.lng)
            .trigger("change");
        $('[name="' + points.name + '.lat"]')
            .val(position.lat)
            .trigger("change");
    });
    return obj;
};
getCoords = function (record) {
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
        icon: 'fa-male',
        color: 'red'
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
    mapPoints = _.object(_.map(mapPoints, function (x) {
        return [x.val, x];
    }));
    if (!record.coords) {
        return mapPoints;
    }
    var coords = record.coords;
    _.each(mapPoints, function (d, e) {
        mapPoints[e].coords = coords[e];
    });
    return _.map(mapPoints, function (d) {
        return d;
    });
};
formSetMap = function (context, recordId) {
    var markers = {};
    var paths = {};
    var coords = {};
    var obj = {};
    var map = L.map(context);
    var units = (Session.get('measureUnits') === 'Metric') ? true : false;
    L.Control.measureControl({
            metric: units
        })
        .addTo(map);
    var defaultLayers = Meteor.settings.public.layers;
    var layers = _.object(_.map(defaultLayers, function (x, e) {
        return [e, L.tileLayer(x)];
    }));
    var firstLayer = Object.keys(layers)[0];
    layers[firstLayer].addTo(map);
    L.control.layers(layers)
        .addTo(map);
    var bounds = boundsString2Array(Session.get('bounds'));
    map.fitBounds(bounds);
    console.log('fitbounds')
    drawnPaths = new L.FeatureGroup()
        .addTo(map);
    drawnPoints = new L.FeatureGroup()
        .addTo(map);
    map.scrollWheelZoom.disable();
    map.on('moveend', function () {
        var bounds = map.getBounds()
            .toBBoxString();
        $('[name="coords.bounds"]')
            .val(bounds)
            .trigger("change");
    });
    obj.add = function (d) {
        var val = d.val;
        if (!d.path) {
            coords[val] = d;
            obj.addPoint(d);
        }
        if (val === 'intendedRoute' || val === 'actualRoute') {
            coords[d.val] = d;
            if (d.coords) {
                obj.addPoly(d, JSON.parse(d.coords));
                return;
            }
            var start = coords.ippCoordinates.layer.getLatLng();
            var end;
            var dest = (val === 'intendedRoute') ? 'destinationCoord' : 'findCoord';
            if (coords[dest]) {
                end = coords[dest].layer.getLatLng()
            } else {
                var ne = map.getBounds()
                    ._northEast;
                var center = map.getCenter();
                end = {
                    lat: center.lat,
                    lng: (center.lng + (ne.lng - center.lng) / 2)
                }
            }
            var latlngs = [
                [start.lat, start.lng],
                [end.lat, end.lng]
            ];
            obj.addPoly(d, latlngs);
        }
    };
    obj.remove = function (d) {
        if (d.path) {
            obj.removePoly(d);
        } else {
            obj.removePoint(d);
            return;
        }
    };
    obj.addPoly = function (d, latlngs) {
        color = d.path.stroke;
        var polyline = L.polyline(latlngs, {
            color: color,
            opacity: 0.9,
            name: d.name,
            val: d.val,
            //editable: true
        });
        drawnPaths.addLayer(polyline);
        marker.setZIndexOffset(4);
        coords[d.val].layer = polyline;
        var lineString = JSON.stringify(latlngs);
        $('[name="' + d.name + '"]')
            .val(lineString)
            .trigger("change");
        polyline.on('click', function (d) {
            polyline.editing.enable();
        });
        polyline.on('dblclick', function (d) {
            polyline.editing.disable();
        });
        $('#formMap')
            .on('mouseup', '.leaflet-editing-icon', function (d) {
                drawnPaths.eachLayer(function (layer) {
                    var name = layer.options.name;
                    if (layer._path) {
                        latlngs = layer.getLatLngs()
                            .map(function (d) {
                                return [d.lat, d.lng]
                            });
                        var lineString = JSON.stringify(latlngs);
                        $('[name="' + name + '"]')
                            .val(lineString)
                            .trigger("change");
                        return;
                    }
                });
            })
            //var lineString = JSON.stringify(layer.toGeoJSON());
    };
    obj.removePoly = function (d) {
        var path = coords[d.val].layer;
        $('[name="' + d.name + '"]')
            .val('')
            .trigger("change");
        drawnPaths.removeLayer(path);
        delete coords[d.val];
    };
    obj.removePoint = function (d) {
        var marker = coords[d.val].layer;
        if (!marker) {
            return;
        }
        $('[name="' + d.name + '.lng"]')
            .val('')
            .trigger("change");
        $('[name="' + d.name + '.lat"]')
            .val('')
            .trigger("change");
        drawnPoints.removeLayer(marker);
        delete coords[d.val];
    };
    obj.editPoint = function (name) {
        var coords = Records.findOne(recordId).coords[name];
        var layer = drawnPoints.getLayers()
            .filter(function (d) {
                return d.options.name === 'coords.' + name;
            });
        if (!layer.length) {
            return;
        }
        layer[0].setLatLng([coords.lat, coords.lng]);
        obj.fitBounds();
    };
    obj.addPoint = function (d) {
        var _coords = d.coords; // || map.getCenter();
        if (!d.coords) {
            var ne = map.getBounds()
                ._northEast;
            var center = map.getCenter();
            _coords = {
                lat: center.lat,
                lng: (center.lng + (ne.lng - center.lng) / 2)
            }
        }
        var myIcon = L.AwesomeMarkers.icon({
            icon: d.icon,
            prefix: 'fa',
            markerColor: d.color,
            iconColor: '#fff',
        });
        var draggable = (Roles.userIsInRole(Meteor.userId(), ['editor', 'admin'])) ? true : false;
        marker = L.marker(_coords, {
            draggable: draggable,
            icon: myIcon,
            name: d.name,
            val: d.val,
        });
        var text = d.text;
        coords[d.val].layer = marker;
        drawnPoints.addLayer(marker);
        $('[name="' + d.name + '.lng"]')
            .val(_coords.lng)
            .trigger("change");
        $('[name="' + d.name + '.lat"]')
            .val(_coords.lat)
            .trigger("change");
        marker.on('dragend', function (event) {
            var marker = event.target;
            var position = marker.getLatLng();
            Meteor.call('updateRecord', recordId, d.name, position, function (err, res) {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        });
        return marker;
    }
    obj.fitBounds = function () {
        map.fitBounds(drawnPoints.getBounds());
        return
        if (Object.keys(coords)
            .length < 2) {
            map.setZoom(9)
        }
    };
    return obj;
}
insertSampleRecords = function () {
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
            Schemas.incident._schema[name]
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
};
createSampleRecords = function () {
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
};
