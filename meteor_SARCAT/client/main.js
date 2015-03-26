getLocation = function(cb) {
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
                result = {lat:y,lng:x};
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

setMap = function(context, coords) {
    console.log(coords)
    coords = [coords.y,coords.x];
    var map = L.map(context)
        .setView(coords, 13);
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
    ippMarker.on('drag', function(event) {
        var marker = event.target;
        var position = marker.getLatLng();
        $('[name="agencyProfile.coordinates.x"]')
            .val(position.lng);
        $('[name="agencyProfile.coordinates.y"]')
            .val(position.lat);

    });
    ippMarker.bindPopup('<b>Drag me to set your default Home Base</b>', {
            noHide: true
        })
        .openPopup();
    return map;
}
