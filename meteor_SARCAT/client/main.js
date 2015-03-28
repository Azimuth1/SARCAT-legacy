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

setMap = function (context, coords, popup) {
    var map = L.map(context)
        .setView([coords.lat, coords.lng], coords.zoom);
    m = map;
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            id: 'examples.map-i875mjb7'
        })
        .addTo(map);

    map.on('move', function () {
        var position = map.getCenter();
        var zoom = map.getZoom()
        $('[name="agencyProfile.coordinates.lng"]')
            .val(position.lng);
        $('[name="agencyProfile.coordinates.lat"]')
            .val(position.lat);
        $('[name="agencyProfile.coordinates.zoom"]')
            .val(zoom);
    });
    /*
        var ippMarker = L.marker([m.getCenter()
            .lat, m.getCenter()
            .lng
        ], {
            draggable: true
        });
        ippMarker.addTo(map);
        ippMarker.on('drag', function(event) {
            var marker = event.target;
            var position = marker.getLatLng();
            $('[name="agencyProfile.coordinates.lng"]')
                .val(position.lng);
            $('[name="agencyProfile.coordinates.lat"]')
                .val(position.lat);

        });
        ippMarker.bindPopup('<b>' + popup + '</b>', {
                noHide: true
            })
            .openPopup();*/
    return map;
}

newProjectSetMap = function (context, coords, popup) {
    var map = L.map(context)
        .setView([coords.lat, coords.lng], coords.zoom);
    m = map;
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            id: 'examples.map-i875mjb7'
        })
        .addTo(map);

    var ippMarker = L.marker([m.getCenter()
        .lat, m.getCenter()
        .lng
    ], {
        draggable: true
    });
    ippMarker.addTo(map);
    ippMarker.on('drag', function (event) {
        var marker = event.target;
        var position = marker.getLatLng();
        $('[name="agencyProfile.coordinates.lng"]')
            .val(position.lng);
        $('[name="agencyProfile.coordinates.lat"]')
            .val(position.lat);

    });
    ippMarker.bindPopup('<b>' + popup + '</b>', {
            noHide: true
        })
        .openPopup();
    return map;
}

formSetMap = function (context, coords, points) {
    var center = [coords.lat, coords.lng];
    var map = L.map(context)
        .setView(center, coords.zoom);
    m = map;
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            id: 'examples.map-i875mjb7'
        })
        .addTo(map);

    var ne = m.getBounds()._northEast;
    var sw = m.getBounds()._southWest;
    var n = ne.lat;
    var e = ne.lng;
    var w = sw.lng;
    var diff = ne.lng - sw.lng;
    var factor = diff / (points.length);
    console.log(factor)
    var newLat = n - ((n - coords.lat) * .2);
    points.forEach(function (d, i) {
        var newLng = w + (factor * i) + (factor / 3);
        var marker = L.marker([newLat, newLng], {
                draggable: true,
                className:'z2'
            });

            marker.bindLabel(d.text, {
                noHide: true
            })
            .addTo(map);


            marker.on('drag', function (event) {
                var marker = event.target;
                var position = marker.getLatLng();
                $('[name="'+d.name+'.lng"]')
                    .val(position.lng);
                $('[name="'+d.name+'.lat"]')
                    .val(position.lat);

            });
        /*

            var marker = L.marker([coords.lat, coords.lng], {
                draggable: true
            });

            marker.bindLabel("My Label", {noHide: true, className: "my-label", offset: [0, 0] });
            marker.addTo(map);
            marker.on('drag', function (event) {
                var marker = event.target;
                var position = marker.getLatLng();
                $('[name="'+d.name+'.lng"]')
                    .val(position.lng);
                $('[name="'+d.name+'.lat"]')
                    .val(position.lat);

            });
            marker.bindPopup('<b>' + d.text + '</b>', {
                    noHide: true
                })
                .openPopup();

        */

    });

    return map;
}
