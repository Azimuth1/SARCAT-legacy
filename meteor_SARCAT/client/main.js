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

getWeather = function (coords, date, cb) {
    var time = date || new Date().toISOString().split('.')[0];
    var latlng = [coords.lat, coords.lng];
    var params = latlng.concat(time).join(',');
    var url = 'http://api.forecast.io/forecast/f3da6c91250a43b747f7ace5266fd1a4/' + params;
    console.log(url);
    $.getJSON(url + "?callback=?", function (data) {
        cb(data);
    });

}

setMap = function (context, coords, popup) {
    var map = L.map(context)
        .setView([coords.lat, coords.lng], coords.zoom);
    m = map;
    map.scrollWheelZoom.disable();
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
    return map;
}

newProjectSetMap = function (context, coords, points) {
    var center = [coords.lat, coords.lng];
    var map = L.map(context)
        .setView(center, coords.zoom);
    m = map;
    map.scrollWheelZoom.disable();
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            id: 'examples.map-i875mjb7'
        })
        .addTo(map);

    var marker = L.marker(center, {
        draggable: true,
        className: 'z2'
    });

    marker.bindLabel(points.text, {
            noHide: true
        })
        .addTo(map);

    marker.on('dragend', function (event) {
        var marker = event.target;
        var position = marker.getLatLng();
        $('[name="' + points.name + '.lng"]')
            .val(position.lng).trigger("change");
        $('[name="' + points.name + '.lat"]')
            .val(position.lat).trigger("change");

    });
    return map;
}

formSetMap = function (context, coords, points) {
    var center = [coords.lat, coords.lng];
    var map = L.map(context)
        .setView(center, coords.zoom);
    m = map;
    map.scrollWheelZoom.disable();
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
    

    var newCoords = function(i){
     var newLat = n - ((n - coords.lat) * .5);
     var newLng = w + (factor * i) + (factor / (points.length));  
     return [newLat, newLng];
    }
    points.forEach(function (d, i) {


        var coords = d.coords;
console.log(coords)
        //var newLng = w + (factor * i) + (factor / (points.length));
        var coord = (coords) ? [coords.lat,coords.lng] : newCoords(i);
        console.log(coord)
        var marker = L.marker(coord, {
            draggable: true,
            className: 'z2'
        });

        marker.bindLabel(d.text, {
                noHide: true
            })
            .addTo(map);

        marker.on('dragend', function (event) {
            var marker = event.target;
            var position = marker.getLatLng();
            $('[name="' + d.name + '.lng"]')
                .val(position.lng).trigger("change");;
            $('[name="' + d.name + '.lat"]')
                .val(position.lat).trigger("change");;

        });

    });

    return map;
}
