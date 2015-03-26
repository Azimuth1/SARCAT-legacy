getLocation = function(cb) {
    var result;

    function requestLocation() {
        var options = {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
        };

        function success(pos) {
            console.log('success');
            var lng = pos.coords.longitude;
            var lat = pos.coords.latitude;
            if (!result) {
                result = [lat, lng];
                cb(result);
            }
        }

        function error(err) {
            console.log('err');
            if (!result) {
                cb([0, 0]);
            }
        }
        navigator.geolocation.getCurrentPosition(success, error, options);
    }
    if ('geolocation' in navigator) {
        requestLocation();
    } else {
        cb();
    }
    setTimeout(function () {
        if (!result) {
            result = [0, 0];
            console.log('timeout')
            cb(result);
        }
    }, 5000);
}

