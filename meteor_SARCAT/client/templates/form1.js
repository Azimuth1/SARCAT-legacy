function getLocation(cb) {
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
        setTimeout(function() {
            if (!result) {
                result = [0, 0];
                console.log('timeout')
                cb(result);
            }
        }, 5000);
    }
    //getLocation(function(d){console.log(d)});
Template.formMap.rendered = function() {
    getLocation(function(coords) {
        console.log(coords)
        var map = L.map('map').setView(coords, 13);
        m = map;
        L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            id: 'examples.map-i875mjb7'
        }).addTo(map);
        var ippMarker = L.marker([m.getCenter().lat, m.getCenter().lng], {
            draggable: true
        });
        ippMarker.addTo(map);
        ippMarker.on('dragend', function(event) {
            var marker = event.target;
            var position = marker.getLatLng();
            $('[name="incidentOperations.ippCoordinates.x"]').val(position.lng);
            $('[name="incidentOperations.ippCoordinates.y"]').val(position.lat);
            console.log(position);
        });
        ippMarker.bindPopup('<b>Hello!</b><br>I am you IPP. Drag me to my correct location!', {
            noHide: true
        }).openPopup();
        /*
                var destinationCoordMarker = L.marker([m.getCenter().lat, m.getCenter().lng], {
                    draggable: true
                });
                destinationCoordMarker.addTo(map);
                destinationCoordMarker.on('dragend', function(event) {
                    var marker = event.target;
                    var position = marker.getLatLng();
                    $('[name="incidentOperations.destinationCoord.x"]').val(position.lng);
                    $('[name="incidentOperations.destinationCoord.y"]').val(position.lat);
                    console.log(position);
                });


                var decisionPointCoordMarker = L.marker([m.getCenter().lat, m.getCenter().lng], {
                    draggable: true
                });
                decisionPointCoordMarker.addTo(map);
                decisionPointCoordMarker.on('dragend', function(event) {
                    var marker = event.target;
                    var position = marker.getLatLng();
                    $('[name="incidentOperations.decisionPointCoord.x"]').val(position.lng);
                    $('[name="incidentOperations.decisionPointCoord.y"]').val(position.lat);
                    console.log(position);
                });
        */
        //marker.on()
        //L.circleMarker([m.getCenter().lat,m.getCenter().lng],{draggable:true}).addTo(map);
        map.scrollWheelZoom.disable();
    });
};
