var genList = function (records) {
    var resourceArrayForm = function (data) {
        return _.chain(data.resourcesUsed.resource)
            .sortBy(function (d) {
                return -d.count;
            })
            .map(function (d) {
                var sum = 'Total Count: ' + d.count + ',Total Hours: ' + d.hours;
                return {
                    key: d.type,
                    parent: 'Resources Used',
                    val: sum
                };
            })
            .value();
    };
    var subjectArrayForm = function (flatData, name, parent) {
        return _.chain(flatData)
            .map(function (d, e) {
                if (e.indexOf('_key') > -1) {
                    return;
                }
                if (e.indexOf('.' + name + '.') > -1) {
                    return {
                        key: e,
                        val: d
                    };
                }
            })
            .compact()
            .groupBy(function (d) {
                return d.key.substr(d.key.lastIndexOf('.') + 1);
            })
            .map(function (d, e) {
                hide = ['name', 'address', 'homePhone', 'cellPhone', 'other'];
                if (_.contains(hide, e)) {
                    return [];
                }
                var items = d.map(function (f) {
                        return f.val;
                    })
                    .sort();
                var sum = _.chain(items)
                    .reduce(function (counts, word) {
                        counts[word] = (counts[word] || 0) + 1;
                        return counts;
                    }, {})
                    .map(function (d, e) {
                        return [d, e];
                    })
                    .sortBy(function (d) {
                        return -d[0];
                    })
                    .map(function (d, e) {
                        if (d[0] === 1) {
                            return d[1];
                        };
                        return d[1] + '(' + d[0] + ')';
                    })
                    .value()
                    .join(', ');
                return {
                    key: e,
                    parent: parent,
                    val: items.sort()
                        .join(', '),
                    val: sum
                };
            })
            .value();
    };
    if (!records || !records.length) {
        return;
    }
    return records.map(function (data) {
        if (!data) {
            return {};
        }
        var displayData = _.chain(data)
            .map(function (val, schema1) {
                var ignore = ['_id', 'subjects', 'resourcesUsed'];
                if (ignore.indexOf(schema1) !== -1) {
                    return;
                }
                if (typeof (val) === 'string') {
                    return;
                }
                var ignoreKeys = ['userId'];
                var check = Schemas[schema1] || {};
                var schema = check._schema || {};
                var sar = Schemas.SARCAT._schema || {};
                var parent = sar[schema1].label || 'other';
                var results = _.map(val, function (d, e) {
                    var labelCheck = schema[e] || {};
                    var label = labelCheck.label || e;
                    if (_.contains(ignoreKeys, label)) {
                        return;
                    }
                    if (typeof (d) === 'object') {
                        d = _.map(d, function (d, e) {
                                return e + ':' + d;
                            })
                            .join(',');
                    }
                    return {
                        key: label,
                        parent: parent,
                        val: d
                    };
                });
                return results;
            })
            .flatten()
            .compact()
            .value();
        var subjects2 = subjectArrayForm(flatten(data, {}), 'subject', 'Subjects');
        var resources2 = resourceArrayForm(data);
        displayData = _.flatten([subjects2, resources2, displayData]);
        displayData2 = _.chain(displayData)
            .groupBy('parent')
            .map(function (d, e) {
                return {
                    field: e,
                    data: d
                };
            })
            .value();
        return {
            _id: 'map-' + data._id,
            data: displayData2,
            record: data
        };
    });
};
Template.report.onCreated(function () {
    da = this.data;
    Session.set('userView', 'report');
});
Template.reportMap.onRendered(function () {
    reportSetMap(this.data, this.$('.aa')[0]);
});
Template.report.onRendered(function () {
    var stats = genList(this.data);
    Session.set('stats', stats);
});
Template.report.helpers({
    stats: function () {
        return Session.get('stats');
    },
    generateMap: function () {
        var _stats = Session.get('stats') || [];
        var hasStats = _stats.length < 4 ? true : false;
        return hasStats;
    },
});
var reportSetMap = function (record, id) {
    var d = record.record;
    var geojson;
    var obj = {};
    var map = L.map(id);
    obj.map = map;
    map.scrollWheelZoom.disable();
    var defaultLayers = Meteor.settings.public.layers;
    var layers = _.object(_.map(defaultLayers, function (x, e) {
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
    layerGroups = mapPoints.map(function (d) {
        var geojson = L.geoJson(null, {
            pointToLayer: function (feature, latlng) {
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
    layerGroups = _.object(_.map(layerGroups, function (x) {
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
    mapPoints.forEach(function (feature) {
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
            coords = coords.map(function (item, i) {
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

