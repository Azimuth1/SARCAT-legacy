Template.report.onCreated(function() {
    da = this.data;
    Session.set('userView', 'report');
});
Template.reportMap.onRendered(function() {
    reportSetMap(this.data, this.$('.aa')[0]);
});
Template.report.onRendered(function() {
    var stats = genList(this.data);
    Session.set('stats', stats);
});
Template.report.helpers({
    stats: function() {
        return Session.get('stats');
    },
    generateMap: function() {
        var _stats = Session.get('stats') || [];
        var hasStats = _stats.length < 4 ? true : false;
        return hasStats;
    },
});
var reportSetMap = function(record, id) {
    var d = record.record;
    var geojson;
    var obj = {};
    var map = L.map(id);
    obj.map = map;
    map.scrollWheelZoom.disable();
    var defaultLayers = Meteor.settings.public.layers;
    var layers = _.object(_.map(defaultLayers, function(x, e) {
        return [e, L.tileLayer(x)];
    }));
    var firstLayer = Object.keys(layers)[0];
    layers[firstLayer].addTo(map);
    var layerControl = L.control.layers(layers)
        .addTo(map);
    var bounds = boundsString2Array(Session.get('bounds'));
    map.fitBounds(bounds);
    var mapPoints = [{
        val: 'ippCoordinates',
        name: 'coords.ippCoordinates',
        text: 'IPP Location. <br>Direction of Travel (hover to edit): <div class="fa fa-arrow-circle-up fa-2x fa-fw travelDirection"></div>', //"IPP Location",
        icon: 'fa-times-circle-o',
        color: 'red'
    }, {
        val: 'decisionPointCoord',
        name: 'coords.decisionPointCoord',
        text: 'Decision Point',
        icon: 'fa-code-fork',
        color: 'orange'
    }, {
        val: 'destinationCoord',
        name: 'coords.destinationCoord',
        text: 'Intended Destination',
        icon: 'fa-flag-checkered',
        color: 'blue'
    }, {
        val: 'revisedLKP_PLS',
        name: 'coords.revisedLKP_PLS',
        text: 'Revised IPP',
        icon: 'fa-times-circle-o',
        color: 'darkred',
        tColor: '#000'
    }, {
        val: 'findCoord',
        name: 'coords.findCoord',
        text: 'Find Location',
        icon: 'fa-flag-checkered',
        color: 'green'
    }, {
        val: 'intendedRoute',
        name: 'coords.intendedRoute',
        text: 'Intended Route',
        path: {
            stroke: '#37A8DA'
        }
    }, {
        val: 'actualRoute',
        name: 'coords.actualRoute',
        text: 'Actual Route',
        path: {
            stroke: 'green',
            weight: 8
        }
    }];
    layerGroup = L.featureGroup();
    layerGroups = mapPoints.map(function(d) {
        var geojson = L.geoJson(null, {
            pointToLayer: function(feature, latlng) {
                if (feature.properties.field.type === 'path') {
                    color = d.path.stroke;
                    var polyline = L.polyline(latlng, {
                        color: color,
                        opacity: 0.9,
                        name: d.name,
                        val: d.val,
                    });
                    return polyline;
                } else {
                    var myIcon = L.AwesomeMarkers.icon({
                        icon: d.icon,
                        prefix: 'fa',
                        markerColor: d.color,
                        iconColor: d.tColor || '#fff',
                    });
                    return L.marker(latlng, {
                        icon: myIcon,
                        name: d.name,
                        val: d.val,
                    });
                }
            }
        });
        layerGroup.addLayer(geojson);
        return {
            name: d.val,
            layer: geojson
        };
    });
    layerGroups = _.object(_.map(layerGroups, function(x) {
        return [x.name, x.layer];
    }));

    function ipp2find(d, feature) {
        var ipp = d.coords.ippCoordinates;
        var find = d.coords.findCoord;
        if (!ipp || !find) {
            return;
        }
        var latlngs = [
            [ipp.lng, ipp.lat],
            [find.lng, find.lat]
        ];
        layerGroups[feature.val].addData({
            'type': 'Feature',
            'properties': {
                record: d,
                field: feature,
                id: d._id
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': latlngs
            }
        });
    }
    mapPoints.forEach(function(feature) {
        var coords = d.coords[feature.val];
        if (coords && coords.lng && coords.lat) {
            layerGroups[feature.val].addData({
                'type': 'Feature',
                'properties': {
                    record: d,
                    field: feature,
                    id: d._id
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': [coords.lng, coords.lat]
                }
            });
        } else if (coords && feature.path) {
            coords = JSON.parse(coords);
            coords = coords.map(function(item, i) {
                return [item[1], item[0]];
            });
            layerGroups[feature.val].addData({
                'type': 'Feature',
                'properties': {
                    record: d,
                    field: feature,
                    id: d._id
                },
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coords
                }
            });
        } else {
            // console.log(feature.val)
            return;
        }
    });
    //});
    var layerGroupBounds = layerGroup.getBounds();
    if (Object.keys(layerGroupBounds)
        .length) {
        map.fitBounds(layerGroupBounds.pad(0.5));
    }
    layerGroup.addTo(map);
    return obj;
};
