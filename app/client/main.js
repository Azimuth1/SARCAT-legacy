getElevation = function () {
    Meteor.call('getElevation', record.coords.ippCoordinates, record.coords.findCoord, function (err, d) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(d);
        if (currentUnit === 'US') {
            d = parseInt(d * 3.2808399);
        }
        Records.update(record._id, {
            $set: {
                'incidentOutcome.elevationChange': d
            }
        });
    });
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
    console.log(bounds)
    if(!bounds){return;}
    bounds = bounds.split(',')
        .map(function (d) {
            return +d;
        });
    return [
        [bounds[1], bounds[0]],
        [bounds[3], bounds[2]]
    ];
};

getWeather = function (record) {
    if (!record) {
        return;
    }
    var coords = record.coords.ippCoordinates;
    var date = record.recordInfo.incidentdate;
    date = date.toISOString()
        .split('T')[0];
    if (!date || !coords) {
        return;
    }

    function done(data) {
        Session.set('weather', data);
        var dailyData = data.daily.data[0];
        _.each(dailyData, function (d, name) {
            Meteor.call('updateRecord', record._id, 'weather.' + name, d, function (err, res) {
                if (err) {
                    return console.log(err);
                }
            });
        });
        if (!dailyData.precipType) {
            Meteor.call('updateRecord', record._id, 'weather.precipType', 'none', function (err, res) {
                if (err) {
                    return console.log(err);
                }
            });
        }
    }
    var latlng = [coords.lat, coords.lng].join(',');;
    var time = 'T12:00:00-0400';
    var dateTime = [date, time].join('');
    var latlngDate = [latlng, dateTime].join(',');
    var units = (Session.get('currentRecord')
        .measureUnits == 'Metric') ? 'units=si' : 'units=us';
    var url = 'http://api.forecast.io/forecast/f3da6c91250a43b747f7ace5266fd1a4/';
    url += latlngDate + '?';
    url += units;
    $.getJSON(url + "&callback=?")
        .done(function (json) {
            done(json);
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });
}
setMap = function (context, bounds, agencyMapComplete) {
    var map = L.map(context, {

    });
    /*L.mapbox.accessToken = 'pk.eyJ1IjoibWFwcGlza3lsZSIsImEiOiJ5Zmp5SnV3In0.mTZSyXFbiPBbAsJCFW8kfg';
    var map = L.mapbox.map(context);
    L.control.scale().addTo(map);
    var layers = {
        Outdoors: L.mapbox.tileLayer('examples.ik7djhcc'),
        Streets: L.mapbox.tileLayer('jasondalton.h4gh1idp'),
        Satellite: L.mapbox.tileLayer('jasondalton.map-7z4qef6u')
    };
    */
    var layers = {
        Streets: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png'),
        Outdoors: L.tileLayer('https://{s}.tiles.mapbox.com/v3/jasondalton.h4gh1idp/{z}/{x}/{y}.png'),
        Satellite: L.tileLayer('https://{s}.tiles.mapbox.com/v3/jasondalton.map-7z4qef6u/{z}/{x}/{y}.png')
    };
    layers.Outdoors.addTo(map);
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
    map.on('moveend', function () {
        Session.set('geolocate', false);
        var bounds = map.getBounds()
            .toBBoxString();
        $('[name="agencyProfile.bounds"]')
            .val(bounds)
            .trigger("change");
        Meteor.call('updateConfig', {
            agencyMapComplete: true
        }, function (error, d) {
            if (error) {
                console.log(error);
            }
        });
    });
    if (agencyMapComplete) {
        //$('#geolocate').addClass('hide');
        // return;
    }
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
            //map.locate();
            lc.start();
            //setTimeout(function () {
            //lc.stop();
            //}, 8000);
        };
    }
    m = map
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
    return map;
}
newProjectSetMap = function (context, bounds, points) {
    var obj = {};
    var marker;
    var map = L.map(context);
    /*L.mapbox.accessToken = 'pk.eyJ1IjoibWFwcGlza3lsZSIsImEiOiJ5Zmp5SnV3In0.mTZSyXFbiPBbAsJCFW8kfg';
    var map = L.mapbox.map(context);
    L.control.scale().addTo(map);
    var layers = {
        Outdoors: L.mapbox.tileLayer('examples.ik7djhcc'),
        Streets: L.mapbox.tileLayer('jasondalton.h4gh1idp'),
        Satellite: L.mapbox.tileLayer('jasondalton.map-7z4qef6u')
    };
    */
    var layers = {
        Streets: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png'),
        Outdoors: L.tileLayer('https://{s}.tiles.mapbox.com/v3/jasondalton.h4gh1idp/{z}/{x}/{y}.png'),
        Satellite: L.tileLayer('https://{s}.tiles.mapbox.com/v3/jasondalton.map-7z4qef6u/{z}/{x}/{y}.png')
    };
    layers.Outdoors.addTo(map);
    L.control.layers(layers)
        .addTo(map);
    var latLngBounds = L.latLngBounds(bounds);
    var center = latLngBounds.getCenter();
    obj.editPoint = function (lat, lng) {
        marker.setLatLng([lat, lng]);
        map.panTo(marker.getLatLng())
            //map.fitBounds(marker.getLatLng());//.pad(1);
    };
    obj.reset = function () {
        map.fitBounds(latLngBounds);
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
    var myIcon = L.divIcon({
        iconSize: [31, 37],
        className: 'fa fa-times-circle-o fa-3x fa-fw'
    });
    marker = L.marker(center, {
        draggable: true,
        icon: myIcon,
    });
    marker.addTo(map);
    map.on('locationfound', function (e) {
        marker.setLatLng(e.latlng);
    });
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
    map.on('moveend', function () {
        var bounds = map.getBounds()
            .toBBoxString();
        $('[name="coords.bounds"]')
            .val(bounds)
            .trigger("change");;
    });
    return obj;
}
getCoords = function (record) {
    var mapPoints = [{
        val: "ippCoordinates",
        name: "coords.ippCoordinates",
        text: 'IPP Location. <br>Direction of Travel (hover to edit): <div class="fa fa-arrow-circle-up fa-2x fa-fw travelDirection"></div>', //"IPP Location",
        icon: 'fa-times-circle-o',
        color: 'black'
    }, {
        val: "decisionPointCoord",
        name: "coords.decisionPointCoord",
        text: "Decision Point",
        icon: 'fa-code-fork',
        color: 'red'
    }, {
        val: "destinationCoord",
        name: "coords.destinationCoord",
        text: "Intended Destination",
        icon: 'flag-checkered',
        color: 'red;'
    }, {
        val: "revisedLKP_PLS",
        name: "coords.revisedLKP_PLS",
        text: "Revised IPP",
        icon: 'fa-male',
        color: 'cadetblue'
    }, {
        val: "findCoord",
        name: "coords.findCoord",
        text: "Find Location",
        icon: 'flag-checkered',
        color: 'green'
    }, {
        val: "intendedRoute",
        name: "coords.intendedRoute",
        text: "Intended Route",
        path: {
            stroke: '#A94442'
        }
    }, {
        val: "actualRoute",
        name: "coords.actualRoute",
        text: "Actual Route",
        path: {
            stroke: '#3C763D',
            weight: 8
        }
    }];
    mapPoints = _.object(_.map(mapPoints, function (x) {
        return [x.val, x];
    }));
    // record = Session.get('currentRecord');
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
    var map = L.map(context, {
        measureControl: true
    });
    /*L.mapbox.accessToken = 'pk.eyJ1IjoibWFwcGlza3lsZSIsImEiOiJ5Zmp5SnV3In0.mTZSyXFbiPBbAsJCFW8kfg';
    var map = L.mapbox.map(context);
    L.control.scale().addTo(map);
    var layers = {
        Outdoors: L.mapbox.tileLayer('examples.ik7djhcc'),
        Streets: L.mapbox.tileLayer('jasondalton.h4gh1idp'),
        Satellite: L.mapbox.tileLayer('jasondalton.map-7z4qef6u')
    };
    */
    var layers = {
        Streets: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png'),
        Outdoors: L.tileLayer('https://{s}.tiles.mapbox.com/v3/jasondalton.h4gh1idp/{z}/{x}/{y}.png'),
        Satellite: L.tileLayer('https://{s}.tiles.mapbox.com/v3/jasondalton.map-7z4qef6u/{z}/{x}/{y}.png')
    };
    layers.Outdoors.addTo(map);
    L.control.layers(layers)
        .addTo(map);
    drawnPaths = new L.FeatureGroup()
        .addTo(map);
    drawnPoints = new L.FeatureGroup()
        .addTo(map);
    map.scrollWheelZoom.disable();
    /**/
    map.on('moveend', function () {
        var bounds = map.getBounds()
            .toBBoxString();
        $('[name="coords.bounds"]')
            .val(bounds)
            .trigger("change");
    });
    /*
        var drawControl = new L.Control.Draw({
            draw: {
                position: 'topleft',
                polygon: false,
                circle: false,
                marker: false,
                rectangle: false,
                polyline: false
            },
            edit: {
                featureGroup: drawnPaths,
                selectedPathOptions: {
                    maintainColor: true,
                    opacity: 0.3,
                    remove: false
                }
            },

        });
        map.addControl(drawControl);

        map.on('draw:edited', function (e) {
            var layers = e.layers;
            layers.eachLayer(function (layer) {
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
                var position = layer.getLatLng();
                $('[name="' + name + '.lng"]')
                    .val(position.lng)
                    .trigger("change");
                $('[name="' + name + '.lat"]')
                    .val(position.lat)
                    .trigger("change");

            });
        });
    */
    /* map.on('draw:created', function (e) {
         var type = e.layerType,
             layer = e.layer;

         if (type === 'marker') {
             // Do marker specific actions
         }

         // Do whatever else you need to. (save to db, add to map etc)
         drawnPaths.addLayer(layer);
     });*/
    /* map.on('draw:edited', function () {
         // Update db to save latest changes.
     });

     map.on('draw:deleted', function () {
         // Update db to save latest changes.
     });*/
    obj.add = function (d) {
        var val = d.val;
        if (!d.path) {
            coords[val] = d;
            obj.addPoint(d);
        }
        if (val === 'intendedRoute') {
            coords[d.val] = d;
            if (d.coords) {
                obj.addPoly(d, JSON.parse(d.coords));
                return;
            }
            var start = coords.ippCoordinates.layer.getLatLng();
            var end = (coords.destinationCoord) ? coords.destinationCoord.layer.getLatLng() : map.getCenter();
            var latlngs = [
                [start.lat, start.lng],
                [end.lat, end.lng]
            ];
            obj.addPoly(d, latlngs);
        }
        if (val === 'actualRoute') {
            coords[d.val] = d;
            if (d.coords) {
                obj.addPoly(d, JSON.parse(d.coords));
                return;
            }
            var start = coords.ippCoordinates.layer.getLatLng();
            var end = (coords.findCoord) ? coords.findCoord.layer.getLatLng() : map.getCenter();
            var latlngs = [
                [start.lat, start.lng],
                [end.lat, end.lng]
            ];
            obj.addPoly(d, latlngs);
        }
        if (val === 'findCoord') {
            //var start = coords.ippCoordinates.layer.getLatLng();
            //var end = (coords.findCoord) ? coords.findCoord.layer.getLatLng();
            //var distance = L.latLng(start).distanceTo(end);
        }
    };
    obj.remove = function (d) {
        /*var removePath = (d.val === 'destinationCoord') ? 'intendedRoute' : (d.val === 'findCoord') ? 'actualRoute' : null;
        if (removePath) {
            obj.removePoly(coords[removePath]);
        }*/
        if (d.path) {
            obj.removePoly(d);
        } else {
            obj.removePoint(d);
            return;
        }
    };
    obj.addPoly = function (d, latlngs) {
        //latlngs=JSON.parse(latlngs);
        //console.log(latlngs);
        color = d.path.stroke;
        var polyline = L.polyline(latlngs, {
            color: color,
            opacity: 0.9,
            name: d.name,
            val: d.val,
            //editable: true
        });
        //polyline.addTo(map)
        drawnPaths.addLayer(polyline);
        marker.setZIndexOffset(4);
        //paths[d.val] = polyline;
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
        console.log(name)
        var coords = Records.findOne(recordId)
            .coords[name];
        console.log(coords)
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
        })
        var draggable = (Roles.userIsInRole(Meteor.userId(), ['editor', 'admin'])) ? true : false;
        marker = L.marker(_coords, {
            draggable: draggable,
            //editable: false,//true,
            icon: myIcon,
            name: d.name,
            val: d.val,
        });
        var text = d.text;
        //marker.dragging.disable()
        coords[d.val].layer = marker;
        drawnPoints.addLayer(marker);
        // }
        //marker.setZIndexOffset(4);
        $('[name="' + d.name + '.lng"]')
            .val(_coords.lng)
            .trigger("change");
        $('[name="' + d.name + '.lat"]')
            .val(_coords.lat)
            .trigger("change");

        function newElev(d) {
            if (d.name !== 'coords.ippCoordinates' && d.name !== 'coords.findCoord') {
                return;
            }
            var record = Records.findOne(recordId);
            if (!record.coords.ippCoordinates && !record.coords.findCoord) {
                return;
            }
            Meteor.call('setLocale', recordId, function (err, d) {
                if (err) {
                    console.log(err);
                    return;
                }
            });
            Meteor.call('setElevation', recordId, function (err, d) {
                if (err) {
                    console.log('elevation err:  ' + err);
                    return;
                }
            });
            Meteor.call('setEcoRegion', recordId, function (err, d) {
                if (err) {
                    return;
                }
            });
        }
        marker.on('dragend', function (event) {
            var marker = event.target;
            var position = marker.getLatLng();
            console.log(recordId, d.name, position)
            Meteor.call('updateRecord', recordId, d.name, position, function (err, res) {
                if (err) {
                    console.log(err);
                    return;
                }
                newElev(d);
            });
        });
        return marker;
    }
    obj.fitBounds = function () {
        map.fitBounds(drawnPoints.getBounds()
            .extend(drawnPaths.getBounds())
            .pad(0));
    };
    return obj;
}
recordStats = function (data) {
    var keyCount = Schemas.SARCAT._schemaKeys.map(function (d) {
        return d;
        var result = d.split('.');
        return result[result.length - 1]
    });
    keyCount = _.object(_.map(keyCount, function (x) {
        return [x, []]
    }));
    _.each(data, function (d) {
        _.each(d, function (e, f) {
            if (_.isString(e)) {
                if (keyCount[f]) {
                    keyCount[f].push(e);
                }
            }
            if (_.isObject(e)) {
                _.each(e, function (g, h) {
                    //console.log(f + '.' + h)
                    if (keyCount[f + '.' + h]) {
                        keyCount[f + '.' + h].push(g);
                    }
                });
            }
        });
    });
    count = _.chain(keyCount)
        .map(function (d, e) {
            var count = _.countBy(d);
            var keys = _.keys(count);
            if (_.keys(count)
                .length && keys[0]) {
                var string = _.map(count, function (val, key) {
                        return {
                            letter: key,
                            frequency: val
                        }
                        // return key + ': ' + val;
                    })
                    //.join(' || ');
                return {
                    field: e,
                    count: string
                };
            }
        })
        .compact()
        .value();
    var drawGraph = function (d) {
        var title = d.field;
        var data = d.count;
        var container = d3.select("#recordss")
            .append("div")
            .attr('class', 'col-md-4');
        container.append('h3')
            .text(title);
        var width = parseInt(d3.select("#recordStats")
            .style('width')) / 4;
        console.log(width)
        var margin = {
                top: 10,
                right: 20,
                bottom: 30,
                left: 40
            },
            width = width - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);
        var y = d3.scale.linear()
            .range([height, 0]);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            // .ticks(10, "%");
        var svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        x.domain(data.map(function (d) {
            return d.letter;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.frequency;
        })]);
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Frequency");
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return x(d.letter);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return y(d.frequency);
            })
            .attr("height", function (d) {
                return height - y(d.frequency);
            });
    }

    function type(d) {
        d.frequency = +d.frequency;
        return d;
    }
    count.forEach(function (d) {
        drawGraph(d);
    })
    return count;
};
statsSetMap = function (context, bounds, points) {
        var markers = {};
        var paths = {};
        var coords = {};
        var obj = {};
        var map = L.map(context);
        //map.fitBounds(bounds);
        m = map;
        drawnPaths = new L.FeatureGroup()
            .addTo(map);
        map.scrollWheelZoom.disable();
        L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
                maxZoom: 18,
                id: 'examples.map-i875mjb7'
            })
            .addTo(map);
        map.on('moveend', function () {
            var bounds = map.getBounds()
                .toBBoxString();
            $('[name="coords.bounds"]')
                .val(bounds)
                .trigger("change");
        });
        obj.add = function (d) {
            z = coords;
            var val = d.val;
            if (!d.path) {
                coords[val] = d;
                obj.addPoint(d);
            }
            return;
            if (!coords.ippCoordinates) {
                return;
            }
            if (val === 'destinationCoord') {
                d = {
                    val: "intendedRoute",
                    name: "coords.intendedRoute",
                    text: "Intended Route",
                    path: {
                        stroke: '#018996'
                    }
                };
                coords[d.val] = d;
                //console.log(coords.ippCoordinates, coords.destinationCoord)
                var start = coords.ippCoordinates.layer.getLatLng();
                var end = coords.destinationCoord.layer.getLatLng();
                var latlngs = [
                    [start.lat, start.lng],
                    [end.lat, end.lng]
                ];
                obj.addPoly(d, latlngs);
            }
            if (val === 'findCoord') {
                d = {
                    val: "actualRoute",
                    name: "coords.actualRoute",
                    text: "Actual Route",
                    path: {
                        stroke: '#3C763D',
                        weight: 8
                    }
                }
                coords[d.val] = d;
                var start = coords.ippCoordinates.layer.getLatLng();
                var end = coords.findCoord.layer.getLatLng();
                //console.log(start, end);
                var latlngs = [
                    [start.lat, start.lng],
                    [end.lat, end.lng]
                ];
                obj.addPoly(d, latlngs);
            }
        };
        obj.remove = function (d) {
            // console.log(d)
            var removePath = (d.val === 'destinationCoord') ? 'intendedRoute' : (d.val === 'findCoord') ? 'actualRoute' : null;
            if (removePath) {
                // console.log(removePath)
                obj.removePoly(coords[removePath]);
            }
            if (d.path) {
                obj.removePoly(d);
            } else {
                obj.removePoint(d);
                return;
            }
        };
        obj.addPoly = function (d, latlngs) {
            color = d.path.stroke;
            polyline = L.polyline(latlngs, {
                color: color,
                opacity: 0.9,
                name: d.name,
                val: d.val,
                editable: true
            });
            //polyline.addTo(map)
            drawnPaths.addLayer(polyline);
            //paths[d.val] = polyline;
            coords[d.val].layer = polyline;
            var lineString = JSON.stringify(latlngs);
            $('[name="' + d.name + '"]')
                .val(lineString)
                .trigger("change");
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
            $('[name="' + d.name + '.lng"]')
                .val('')
                .trigger("change");
            $('[name="' + d.name + '.lat"]')
                .val('')
                .trigger("change");
            drawnPaths.removeLayer(marker);
            delete coords[d.val];
        };
        obj.addPoint = function (d) {
            var _coords = d.coords || map.getCenter();
            var myIcon = L.divIcon({
                iconSize: [41, 39],
                className: 'fa ' + d.icon + ' fa-4x fa-fw'
            });
            var marker = L.marker(_coords, {
                draggable: true,
                editable: true,
                icon: myIcon,
                name: d.name,
                val: d.val,
            });
            var text = d.text;
            coords[d.val].layer = marker;
            //marker.addTo(map);
            //console.log(marker,drawnPaths)
            drawnPaths.addLayer(marker);
            marker.bindPopup(d.text, {
                    //noHide: true,
                    //clickable: true
                })
                //
            marker.setZIndexOffset(4);
            $('[name="' + d.name + '.lng"]')
                .val(_coords.lng)
                .trigger("change");
            $('[name="' + d.name + '.lat"]')
                .val(_coords.lat)
                .trigger("change");
            obj.editPoly
            var pathPoints = ['ippCoordinates', 'destinationCoord', 'findCoord'];
            /*if (_.contains(pathPoints, d.val)) {
                function drag(layer, index, position) {
                    layer.spliceLatLngs(index, 1, position);
                };

                function routeEditing(val) {
                    if (val) {
                        drawnPaths.getLayers()
                            .forEach(function (layer) {
                                if (layer.editing) {
                                    layer.editing.enable();
                                }
                            });
                    } else {
                        drawnPaths.getLayers()
                            .forEach(function (layer) {
                                if (layer.editing) {
                                    layer.editing.disable();
                                }
                            });
                    }
                };
                marker.on('dragstart', function (event) {
                    routeEditing(false);
                })
                marker.on('drag', function (event) {
                    var marker = event.target;
                    var position = marker.getLatLng();
                    var layer;
                    if (d.val === 'destinationCoord') {
                        layer = coords.intendedRoute.layer;
                        index = layer.getLatLngs()
                            .length - 1;
                        drag(layer, index, position);
                    }
                    if (d.val === 'findCoord') {
                        layer = coords.actualRoute.layer;
                        index = layer.getLatLngs()
                            .length - 1;
                        drag(layer, index, position);
                    }
                    if (d.val === 'ippCoordinates') {
                        index = 0;
                        drawnPaths.getLayers()
                            .forEach(function (layer) {
                                if (layer.editing) {
                                    drag(layer, index, position);
                                }
                            })
                    }
                });
            }*/
            marker.on('dragend', function (event) {
                //routeEditing(true);
                var marker = event.target;
                var position = marker.getLatLng();
                $('[name="' + d.name + '.lng"]')
                    .val(position.lng)
                    .trigger("change");
                $('[name="' + d.name + '.lat"]')
                    .val(position.lat)
                    .trigger("change");
            });
            return marker;
        }
        obj.fitBounds = function () {
            map.fitBounds(drawnPaths.getBounds()
                .pad(.3));
        };
        return obj;
    }
    /*L.RotatedMarker = L.Marker.extend({
        options: {
            angle: 0
        },
        _setPos: function (pos) {
            L.Marker.prototype._setPos.call(this, pos);
            if (L.DomUtil.TRANSFORM) {
                // use the CSS transform rule if available
                this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
            } else if (L.Browser.ie) {
                // fallback for IE6, IE7, IE8
                var rad = this.options.angle * L.LatLng.DEG_TO_RAD,
                    costheta = Math.cos(rad),
                    sintheta = Math.sin(rad);
                this._icon.style.filter += ' progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' +
                    costheta + ', M12=' + (-sintheta) + ', M21=' + sintheta + ', M22=' + costheta + ')';
            }
        }
    });
    L.rotatedMarker = function (pos, options) {
        return new L.RotatedMarker(pos, options);
    };*/
