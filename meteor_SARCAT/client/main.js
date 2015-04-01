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
    var marker = L.marker(center, {
        draggable: true,
        className: 'z2'
    });

    marker.bindLabel(points.text, {
            noHide: true
        })
        .addTo(map);

    $('[name="' + points.name + '.lng"]')
        .val(center.lng)
        .trigger("change");
    $('[name="' + points.name + '.lat"]')
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

formSetMap = function (context, coords, points) {

    var markers = {};
    var obj = {};
    var map = L.map(context).setView(coords, 10);
    m = map;
    map.scrollWheelZoom.disable();
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            id: 'examples.map-i875mjb7'
        })
        .addTo(map);

    obj.removePoint = function (d) {
        var marker = markers[d.val]

        $('[name="' + d.name + '.lng"]')
            .val('')
            .trigger("change");;
        $('[name="' + d.name + '.lat"]')
            .val('')
            .trigger("change");;

        map.removeLayer(marker);

    };
    obj.addPoint = function (d) {
        console.log(d)
        var _coords = d.coords || map.getCenter();
        /*var ne = m.getBounds()
            ._northEast;
        var sw = m.getBounds()
            ._southWest;
        var n = ne.lat;
        var e = ne.lng;
        var w = sw.lng;
        var diff = ne.lng - sw.lng;
        var factor = diff / (points.length);

        var newCoords = function(i) {
            var newLat = n - ((n - coords.lat) * .5);
            var newLng = w + (factor * i) + (factor / (points.length));
            return [newLat, newLng];
        }
        points.forEach(function(d, i) {*/

        //var coords = d.coords;
        // console.log(coords)
        //var newLng = w + (factor * i) + (factor / (points.length));

        var marker = L.marker(_coords, {
            draggable: true,
            className: 'z2'
        });
        markers[d.val] = marker;

        marker.bindLabel(d.text, {
                noHide: true
            })
            .addTo(map);

        marker.on('dragend', function (event) {
            var marker = event.target;
            var position = marker.getLatLng();
            $('[name="' + d.name + '.lng"]')
                .val(position.lng)
                .trigger("change");;
            $('[name="' + d.name + '.lat"]')
                .val(position.lat)
                .trigger("change");;
        });

        //});
    }
    return obj;
}
