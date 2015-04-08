labelUnits = function (currentUnit, type) {

    var unitType = {
        distance: {
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

var agencyProfileIncomplete = function () {
    var config = Session.get('config');
    if (!config) {
        return;
    }
    var agencyProfile = config.agencyProfile;
    var apKeys = Object.keys(agencyProfile);
    return apKeys.length < Schemas.agencyProfile._schemaKeys.length;
}

getCoords = function () {

    var mapPoints = [{
        "val": "ippCoordinates",
        "name": "coords.ippCoordinates",
        "text": 'IPP Location. <br>Direction of Travel (hover to edit): <div class="fa fa-arrow-circle-up fa-2x fa-fw travelDirection"></div>', //"IPP Location",
        icon: 'fa-times-circle-o'
    }, {
        "val": "decisionPointCoord",
        "name": "coords.decisionPointCoord",
        "text": "Decision Point",
        icon: 'fa-code-fork text-danger'
    }, {
        "val": "destinationCoord",
        "name": "coords.destinationCoord",
        "text": "Intended Destination",
        icon: 'fa-bullseye text-default'
    }, {
        "val": "revisedLKP-PLS",
        "name": "coords.revisedLKP-PLS",
        "text": "Revised IPP",
        icon: 'fa-times-circle-o 4x text-success'
    }, {
        "val": "findCoord",
        "name": "coords.findCoord",
        "text": "Find Location",
        icon: 'fa-male text-success'
    }, {
        "val": "intendedRoute",
        "name": "coords.intendedRoute",
        "text": "Intended Route",
        path: {
            stroke: '#018996'
        }
    }, {
        "val": "actualRoute",
        "name": "coords.actualRoute",
        "text": "Actual Route",
        path: {
            stroke: '#3C763D',
            weight: 8
        }
    }];

    mapPoints = _.object(_.map(mapPoints, function (x) {
        return [x.val, x];
    }));

    record = Session.get('currentRecord');
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

agencyProfileComplete = function () {
    var config = Session.get('config');
    if (!config) {
        return;
    }
    var agencyProfile = config.agencyProfile;
    var apKeys = Object.keys(agencyProfile);
    return apKeys.length === Schemas.agencyProfile._schemaKeys.length;
}

getLocation = function (cb) {
    var result;

    function requestLocation() {
        var options = {
            enableHighAccuracy: false,
            timeout: 7000,
            maximumAge: 0
        };

        function success(pos) {
            var lng = pos.coords.longitude;
            var lat = pos.coords.latitude;
            if (!result) {
                result = {
                    lat: lat,
                    lng: lng
                };
                cb(result);
            }
        }

        function error(err) {
            if (!result) {
                cb(null, err);
            }
        }
        navigator.geolocation.getCurrentPosition(success, error, options);
    }
    if ('geolocation' in navigator) {
        requestLocation();
    } else {
        cb();
    }
}
boundsString2Array = function (bounds) {

    bounds = bounds.split(',')
        .map(function (d) {
            return +d;
        });
    return [
        [bounds[1], bounds[0]],
        [bounds[3], bounds[2]]
    ];
};
getWeather = function (coords, date, cb) {
    if (!date) {
        return;
    }
    var latlng = [coords.lat, coords.lng].join(',');;
    var time = 'T12:00:00-0400';
    var dateTime = [date, time].join('');
    var latlngDate = [latlng, dateTime].join(',');

    var units = (Session.get('currentRecord').measureUnits == 'Metric') ? 'units=si' : 'units=us';
    //Config.findOne().agencyProfile.measureUnits
    //var time = date || new Date().toISOString().split('.')[0];

    //var params = latlng.concat(time).join(',');

    //var params = [latlng, dateTime, units].join(',');
    var url = 'http://api.forecast.io/forecast/f3da6c91250a43b747f7ace5266fd1a4/';
    url += latlngDate + '?';
    url += units;
    console.log(url);
    //return
    /*
        $.getJSON(url + "?callback=?")

        .done(function () {
                cb(data, err);})


            .fail(function () {
                console.log('!!!')
                cb(null, 'err');
            })
      
    */
    $.getJSON(url + "&callback=?")
        .done(function (json) {
            cb(json);
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });

}
setMap = function (context, bounds) {
    console.log(bounds)
    a = bounds
    var map = L.map(context);
    m = map;
    map.fitBounds(bounds);

    map.scrollWheelZoom.disable();

    var layers = {
        Streets: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png'),
        Outdoors: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.ik7djhcc/{z}/{x}/{y}.png'),
        Satellite: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-igb471ik/{z}/{x}/{y}.png')
    };

    layers.Streets.addTo(map);
    L.control.layers(layers).addTo(map);

    map.on('moveend', function () {
        var bounds = map.getBounds()
            .toBBoxString();
        $('[name="agencyProfile.bounds"]')
            .val(bounds)
            .trigger("change");;
    });
    return map;
}

newProjectSetMap = function (context, bounds, points) {
    var obj = {};
    var marker;
    var map = L.map(context);
    var latLngBounds = L.latLngBounds(bounds);
    var center = latLngBounds.getCenter();

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

    var layers = {
        Streets: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png'),
        Outdoors: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.ik7djhcc/{z}/{x}/{y}.png'),
        Satellite: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-igb471ik/{z}/{x}/{y}.png')
    };

    layers.Streets.addTo(map);
    L.control.layers(layers).addTo(map);

    var myIcon = L.divIcon({
        iconSize: [31, 37],
        className: 'fa fa-times-circle-o fa-3x fa-fw'
    });

    marker = L.marker(center, {
        draggable: true,
        icon: myIcon,
    });

    marker.bindLabel('Drag marker to <br>Initial Planning Point/Incident Location', {
        noHide: true
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

    map.on('moveend', function () {
        var bounds = map.getBounds()
            .toBBoxString();
        $('[name="coords.bounds"]')
            .val(bounds)
            .trigger("change");;
    });

    return obj;
}
formSetMap = function (context) {
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

    var layers = {
        Streets: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png'),
        Outdoors: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.ik7djhcc/{z}/{x}/{y}.png'),
        Satellite: L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-igb471ik/{z}/{x}/{y}.png')
    };

    layers.Streets.addTo(map);
    L.control.layers(layers).addTo(map);

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
        if (val === 'intendedRoute') {
            coords[d.val] = d;
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

            var start = coords.ippCoordinates.layer.getLatLng();
            var end = (coords.findCoord) ? coords.findCoord.layer.getLatLng() : map.getCenter();

            var latlngs = [
                [start.lat, start.lng],
                [end.lat, end.lng]
            ];
            obj.addPoly(d, latlngs);
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

        marker = L.rotatedMarker(_coords, {
            draggable: true,
            //editable: true,
            icon: myIcon,
            name: d.name,
            val: d.val,

        });

        var text = d.text;

        coords[d.val].layer = marker;
        //marker.addTo(map);
        //console.log(marker,drawnPaths)
        drawnPaths.addLayer(marker);

        /* marker.bindPopup(d.text, {
                 //noHide: true,
                 //clickable: true
             })
             //
         if (d.val === 'ippCoordinates') {
             marker.openPopup();
         }*/
        marker.setZIndexOffset(4);
        if (d.val === 'ippCoordinates') {
            var travelDirection = $('.travelDirection');

            var spin;
            direction = 0;
            /* 
                       marker.on('mouseover', function (event) {
                           console.log('!')
                           spin = window.setInterval(function () {
                               direction = direction + 1;
                               if (direction > 360) {
                                   direction = 0;
                               }
                               marker.options.angle = direction;
                               marker.update();

                           }, 10);
                       });

                       marker.on('mouseout', function (event) {
                           clearTimeout(spin);
                           //marker.update();
                           $('[name="coords.travelDirection"]')
                               .val(direction)
                               .trigger("change");
                       });
                                 $('#' + context)
                                       .on('mouseover', '.travelDirection', function (event) {
                                           console.log('!')
                                           spin = window.setInterval(function () {
                                               direction = direction + 1;
                                               if (direction > 360) {
                                                   direction = 0;
                                               }
                                               $(event.target)
                                                   .css('transform', 'rotate(' + direction + 'deg)');
                                           }, 10);
                                       });

                                   $('#' + context)
                                       .on('mouseout', '.travelDirection', function (event) {
                                           clearTimeout(spin);
                                           $('[name="coords.travelDirection"]')
                                               .val(direction)
                                               .trigger("change");
                                       });

                       */

        }

        $('[name="' + d.name + '.lng"]')
            .val(_coords.lng)
            .trigger("change");
        $('[name="' + d.name + '.lat"]')
            .val(_coords.lat)
            .trigger("change");

        obj.editPoly

        var pathPoints = ['ippCoordinates', 'destinationCoord', 'findCoord'];
        if (_.contains(pathPoints, d.val)) {

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

            /*marker.on('dragstart', function (event) {
                routeEditing(false);
            })*/

            /*marker.on('drag', function (event) {
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

            });*/

        }

        marker.on('dragend', function (event) {
            routeEditing(true);
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
        if (!coords.ippCoordinates) {
            return;
        }
        if (val === 'destinationCoord') {

            d = {
                "val": "intendedRoute",
                "name": "coords.intendedRoute",
                "text": "Intended Route",
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
                "val": "actualRoute",
                "name": "coords.actualRoute",
                "text": "Actual Route",
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
        if (_.contains(pathPoints, d.val)) {

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

        }

        marker.on('dragend', function (event) {
            routeEditing(true);
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

L.RotatedMarker = L.Marker.extend({
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
};
