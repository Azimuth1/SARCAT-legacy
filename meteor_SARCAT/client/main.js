getCoords = function () {

    var mapPoints = [{
        "val": "ippCoordinates",
        "name": "coords.ippCoordinates",
        "text": 'IPP Location. <br>Direction of Travel (hover to edit): <div class="fa fa-arrow-circle-up fa-2x fa-fw travelDirection"></div>', //"IPP Location",
        icon: 'fa-times-circle-o text-black'
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
    var time = date || new Date()
        .toISOString()
        .split('.')[0];
    var latlng = [coords.lat, coords.lng];
    var params = latlng.concat(time)
        .join(',');
    var url = 'http://api.forecast.io/forecast/f3da6c91250a43b747f7ace5266fd1a4/' + params;
    /*
        $.getJSON(url + "?callback=?")

        .done(function () {
                cb(data, err);})


            .fail(function () {
                console.log('!!!')
                cb(null, 'err');
            })
      
    */
    $.getJSON(url + "?callback=?")
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
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            id: 'examples.map-i875mjb7'
        })
        .addTo(map);
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
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            id: 'examples.map-i875mjb7'
        })
        .addTo(map);

    var myIcon = L.divIcon({
        iconSize: [31, 37],
        className: 'fa fa-times-circle-o fa-3x fa-fw'
    });

    marker = L.marker(center, {
        draggable: true,
        icon: myIcon,
    });

    marker.bindLabel('IPP Location', {
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
formSetMap = function (context, bounds, points) {
    var markers = {};
    var paths = {};
    var coords = {};
    var obj = {};
    var map = L.map(context);
    map.fitBounds(bounds);
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
        map.removeLayer(marker);
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
            icon: myIcon,
            name: d.name,
            val: d.val
        });

        var text = d.text;

        coords[d.val].layer = marker;
        marker.addTo(map);
        marker.bindPopup(d.text, {
                //noHide: true,
                //clickable: true
            })
            //
        if (d.val === 'ippCoordinates') {
            marker.openPopup();
        }
        marker.setZIndexOffset(4);
        if (d.val === 'ippCoordinates') {
            var travelDirection = $('.travelDirection');

            var spin;
            var direction = 0;

            $('#' + context)
                .on('mouseover', '.travelDirection', function (event) {
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
                //layer.editing.disable();
                layer.spliceLatLngs(index, 1, position);
            };

            function routeEditing(val) {
                if (val) {
                    drawnPaths.getLayers()
                        .forEach(function (layer) {
                            layer.editing.enable();
                        });

                } else {
                    drawnPaths.getLayers()
                        .forEach(function (layer) {
                            layer.editing.disable();
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
                            drag(layer, index, position);
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
    return obj;
}

