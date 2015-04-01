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
    if (!bounds) {
        return [
            [0, 0],
            [1, 1]
        ];
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
getWeather = function (coords, date, cb) {
    var time = date || new Date()
        .toISOString()
        .split('.')[0];
    var latlng = [coords.lat, coords.lng];
    var params = latlng.concat(time)
        .join(',');
    var url = 'http://api.forecast.io/forecast/f3da6c91250a43b747f7ace5266fd1a4/' + params;
    console.log(url);
    $.getJSON(url + "?callback=?", function (data) {
        cb(data);
    });
}
setMap = function (context, bounds) {
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
    var map = L.map(context);
    map.fitBounds(bounds);

    m = map;
    map.scrollWheelZoom.disable();
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            id: 'examples.map-i875mjb7'
        })
        .addTo(map);
    var center = map.getCenter();

    var bounds = map.getBounds()
        .toBBoxString();

    $('[name="coords.bounds"]')
        .val(bounds)
        .trigger("change");;

    map.on('moveend', function () {
        var bounds = map.getBounds()
            .toBBoxString();
        $('[name="coords.bounds"]')
            .val(bounds)
            .trigger("change");;
    });

    var myIcon = L.divIcon({
        iconSize: [31, 37],
        className: 'fa fa-times-circle-o fa-3x fa-fw'
    });

    var marker = L.marker(center, {
        draggable: true,
        icon: myIcon,
        //name: d.name,
        // val: d.val
    });

    // markers[d.val] = marker;
    marker.bindLabel('IPP Location', {
        noHide: true
    })
    marker.addTo(map);

    $('[name="coords.ippCoordinates.lng"]')
        .val(center.lng)
        .trigger("change");
    $('[name="coords.ippCoordinates.lat"]')
        .val(center.lat)
        .trigger("change");

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
    return map;
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

    //var drawnItems1 = new L.FeatureGroup();
    //map.addLayer(drawnItems1);

    var drawControl = new L.Control.Draw({
        draw: {
            position: 'topleft',
            polygon: false,
            circle: false,
            marker: false,
            rectangle: false,
            polyline: {
                shapeOptions: {
                    color: '#00ff00',
                    weight: 10
                }
            },
        },
        edit: {
            featureGroup: drawnPaths,
            selectedPathOptions: {
                maintainColor: true,
                opacity: 0.3
            }
        },

    });
    // map.addControl(drawControl);
    L.drawLocal.draw.toolbar.buttons.polyline = 'Draw a sexy polygon!';
    map.on('moveend', function () {
        var bounds = map.getBounds()
            .toBBoxString();
        $('[name="coords.bounds"]')
            .val(bounds)
            .trigger("change");
    });
    map.on('draw:edited', function (e) {
        var layers = e.layers;
        layers.eachLayer(function (layer) {

            var options = layer.options;
            if (!options) {
                return;
            }
            var name = options.name;
            var coordString = JSON.stringify(layer.toGeoJSON()
                .geometry.coordinates);
            console.log(name, coordString)
            $('[name="' + name + '"]')
                .val(coordString)
                .trigger("change");

        });

    });

    obj.add = function (d) {

        coords[d.val] = d;
        z = coords;
        if (d.path) {

            var exists = d.coords;

            if (!exists) {
                var endType = (d.val === 'intendedRoute') ? 'destinationCoord' : 'findCoord';
                var start = (coords.ippCoordinates) ? coords.ippCoordinates.layer.getLatLng() : map.getCenter();
                var end = (coords[endType]) ? coords[endType].layer.getLatLng() : map.getBounds()
                    .getNorthEast();
                console.log(start, end)
                latlngs = [
                    [start.lat, start.lng],
                    [end.lat, end.lng]
                ];
            } else {

                latlngs = JSON.parse(d.coords)
                    .map(function (d) {
                        return [d[1], d[0]];
                    });
            }
            obj.addPoly(d, latlngs);
            return;
        } else {

            if (d.val === 'travelDirection') {
                obj.addDirection(d);
                return;
            }
            var point = obj.addPoint(d);

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

        polyline = L.polyline(latlngs, {
            color: color,
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

        map.removeLayer(path);
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

    obj.addDirection = function (d) {

        var _coords = coords.ippCoordinates.layer.getLatLng() || map.getCenter();

        var myIcon = L.divIcon({
            iconSize: [31, 37],
            className: 'fa ' + d.icon + ' fa-3x fa-fw'
        });

        marker = L.rotatedMarker(_coords, {
            icon: myIcon,
            name: d.name,
            val: d.val
        });

        coords[d.val].layer = marker;
        marker.bindLabel(d.text, {
            noHide: true
        })
        marker.addTo(map);

        var spin;
        var direction = 0;
        marker.on('mouseover', function (event) {
            var marker = event.target;
            var position = marker.getLatLng();

            spin = window.setInterval(function () {
                console.log(direction);
                direction = direction + 5;

                marker.options.angle = direction;
                marker.update()

            }, 100);
        });

        marker.on('mouseout', function (event) {
            clearTimeout(spin);
            $('[name="' + d.name + '"]')
                .val(direction)
                .trigger("change");
        });

    };
    obj.addPoint = function (d) {

        var _coords = d.coords || map.getCenter();

        var myIcon = L.divIcon({
            iconSize: [31, 37],
            className: 'fa ' + d.icon + ' fa-3x fa-fw'
        });

        var marker = L.marker(_coords, {
            draggable: true,
            icon: myIcon,
            name: d.name,
            val: d.val
        });

        coords[d.val].layer = marker;
        marker.bindLabel(d.text, {
            noHide: true
        })
        marker.addTo(map);

        $('[name="' + d.name + '.lng"]')
            .val(_coords.lng)
            .trigger("change");
        $('[name="' + d.name + '.lat"]')
            .val(_coords.lat)
            .trigger("change");

        marker.on('dragend', function (event) {
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

