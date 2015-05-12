var records;
var data;
Template.stats.onCreated(function () {
    Session.set('userView', 'stats');
    records = Records.find().fetch();
    data = recordStats(records);
    Session.set('activeRecord', false);
    Session.set('allRecords', records);
    var activeFields = ["recordInfo.name", "recordInfo.incidentnum", "recordInfo.missionnum", "recordInfo.incidentdate", "recordInfo.incidentType", "recordInfo.status"];
    var allFields = _.map(Schemas.SARCAT._schema, function (d, e) {
        return {
            headerClass: 'default-bg',
            cellClass: 'white-bg',
            key: e,
            fieldId: e,
            label: d.label,
            hidden: !_.contains(activeFields, e),
            parent: e.split('.')[0]
        };
    });
    Session.set('allFields', allFields);
    var keep = ["subjects.subject.$.sex", "subjects.subject.$.status", "subjects.subject.$.age", "subjects.subject.$.evacuationMethod", "incident.SARNotifiedDateTime", "incident.contactmethod", "incidentLocation.county-region", "incidentLocation.ecoregionDivision", "recordInfo.incidentEnvironment", "incidentLocation.landCover", "incidentLocation.landOwner", "incidentLocation.populationDensity", "recordInfo.subjectCategory", "incidentLocation.terrain", "incidentOperations.PLS_HowDetermined", "incidentOperations.ippclassification", "incidentOperations.ipptype", "findLocation.detectability", "findLocation.distanceIPP", "findLocation.findFeature", "incidentOutcome.incidentOutcome", "incidentOutcome.lostStrategy", "incidentOutcome.mobility&Responsiveness", "incidentOutcome.mobility_hours", "incidentOutcome.scenario", "incidentOutcome.suspensionReasons", "recordInfo.incidentdate", "recordInfo.incidentnum", "recordInfo.incidentType", "recordInfo.missionnum", "recordInfo.name", "recordInfo.status", "incidentOutcome.signalling", "resourcesUsed.distanceTraveled", "resourcesUsed.numTasks", "resourcesUsed.totalCost", "resourcesUsed.totalManHours", "resourcesUsed.totalPersonnel", "weather.precipType"];
    var filterFields = _.map(keep, function (d) {
        return _.findWhere(allFields, {
            key: d
        });
    });
    Session.set('filterFields', filterFields);
    var res = _.map(records, function (data, e) {
        return _.chain(data.resourcesUsed.resource).sortBy(function (d) {
            return -d.count;
        }).value();
    })
    res = _.flatten(res, 1);
    res = _.groupBy(res, function (d) {
        return d.type
    })
    resCount = {
        label: 'Resources/Number Used',
        count: {}
    };
    resHours = {
        label: 'Resources/Hours Used',
        count: {}
    };
    _.each(res, function (a, key) {
        _.each(a, function (d) {
            if (!resCount.count[key]) {
                resCount.count[key] = 0;
            }
            if (!resHours.count[key]) {
                resHours.count[key] = 0;
            }
            resCount.count[key] = resCount.count[key] + d.count;
            resHours.count[key] = resHours.count[key] + d.hours
        });
    });
    delete resCount.count._key;
    delete resHours.count._key;
    resCount.count = _.map(resCount.count, function (d, e) {
        return {
            name: e,
            data: d || 0
        }
    })
    resHours.count = _.map(resHours.count, function (d, e) {
        return {
            name: e,
            data: d || 0
        }
    })
    var sub = records.map(function (d) {
        return flatten(d.subjects.subject, {});
    });
    var sum = {};
    _.each(sub, function (d) {
        _.each(d, function (val, _key) {
            var key = _key.split('.')[1]
            if (!sum[key]) {
                sum[key] = [];
            }
            sum[key].push(val);
        });
    });
    delete sum._key;
    subjects = _.map(sum, function (items, e) {
        var aggr = _.chain(items).reduce(function (counts, word) {
            counts[word] = (counts[word] || 0) + 1;
            return counts;
        }, {}).map(function (d, e) {
            return {
                data: d,
                name: e
            };
        }).value();
        return {
            label: 'Subject ' + e.substr(e.lastIndexOf('.') + 1),
            count: aggr,
            field: 'subjects.subject.$.' + e,
        };
    });
    subjects = _.filter(subjects, function (d) {
        return _.contains(keep, d.field);
    });
    subjects = _.sortBy(subjects, function (d) {
        return d.field;
    })
});
Template.stats.onRendered(function () {
    var colors = ["#5D2E2C", "#6E3B49", "#744F6A", "#6B6788", "#53819D", "#3799A2", "#3AB098", "#67C283", "#A1D06B", "#E2D85D"];
    subjects.forEach(function (d, i) {
        var color = colors[i % 10];
        drawGraph(d, color, "#recordsSubject");
    });
    drawGraph(resCount, colors[5], "#recordsResource");
    drawGraph(resHours, colors[9], "#recordsResource");
    data.forEach(function (d, i) {
        if (d.field === 'recordInfo.incidentdate') {
            return d3Calender('#d3Calender', d.count)
        }
        var color = colors[i % 10];
        drawGraph(d, color, "#recordss");
    });
    Session.set('activeRecord', null);
    var recordMap = recordsSetMap('recordsMap', records);
})
Template.stats.helpers({
    stats: function () {
        var data = Session.get('activeRecord');
        if (!data) {
            return;
        }
        var filterFields = Session.get('filterFields');
        var flatData = flatten(data, {});
        f = flatData
        var displayData = _.chain(flatData)
            .map(function (d, e) {
                var goodVal = _.findWhere(filterFields, {
                    key: e
                });
                if (goodVal) {
                    return {
                        key: goodVal.label,
                        parent: Schemas.SARCAT._schema[goodVal.parent].label,
                        val: d
                    };
                }
            })
            .compact()
            .value();
        subjects2 = subjectArrayForm(flatData, 'subject', 'Subjects');
        var resources2 = resourceArrayForm(data);
        displayData = _.flatten([displayData, subjects2, resources2]);
        displayData2 = _.chain(displayData)
            .groupBy('parent')
            .map(function (d, e) {
                return {
                    field: e,
                    data: d
                };
            })
            .value();
        return displayData2;
    },
});
var drawGraph = function (d, color, context) {
    //colors = d3.scale.category20c();
    var title = d.label;
    var data = d.count;
    var options = d.options;
    var numItems = data.length;
    var klass;
    var rotate = 0;
    var margin = {
        top: 10,
        right: 10,
        bottom: 30,
        left: 40
    };
    if (numItems === 1) {
        klass = 'col-sm-3 pad00'
    } else if (numItems < 11) {
        klass = 'col-sm-6 pad00'
    } else {
        klass = 'col-sm-12 pad00';
        rotate = '-25';
        margin = {
            top: 10,
            right: 40,
            bottom: 60,
            left: 60
        }
    }
    var container = d3.select(context)
        .append("div")
        .attr('class', klass);
    container.append('h4').attr('class', 'text-center')
        .text(title);
    var width = parseInt(container.style('width')); // / 1;
    width = width - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);
    var y = d3.scale.linear()
        .rangeRound([height, 0]);
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format("d"))
        .ticks(4);
    var svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    x.domain(data.map(function (d) {
        return d.name;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.data;
    })]);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    if (rotate) {
        svg.selectAll(".x.axis text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function (d) {
                return "rotate(" + rotate + ")";
            });
    }
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "_bar")
        .attr("x", function (d) {
            return x(d.name);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d.data);
        })
        .attr("height", function (d) {
            return height - y(d.data);
        })
        .attr("fill", color);
}
recordsSetMap = function (context, data) {
    var geojson;
    if (!data.length) {
        return;
    }
    var layers = {
        OSM: L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'),
        Outdoors: L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg'),
        Satellite: L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg')
    };
    var obj = {};
    var map = L.map(context)
    obj.map = map;
    layers.Outdoors.addTo(map);
    map.scrollWheelZoom.disable();
    var layerControl = L.control.layers(layers, null, {
        collapsed: false
    });
    var mapPoints = [{
        val: "ippCoordinates",
        sib: ["ippCoordinates2FindCoord", "findCoord"],
        text: "Incident Location",
        icon: 'fa-times-circle-o',
        color: '#C9302C',
        bg: 'bg-red',
        style: {
            fillColor: '#C9302C',
            color: '#C9302C',
            fillOpacity: 0.8,
            opacity: 0.8,
            weight: 1,
            radius: 6,
            fillOpacity: 0.7
        }
    }, {
        type: 'path',
        val: "ippCoordinates2FindCoord",
        sib: ["ippCoordinates", "findCoord"],
        text: "", //As the Crow Flies",
        bg: 'bg-black-line',
        style: {
            color: '#000',
            weight: 3,
            opacity: 0.4,
            dashArray: '5,5',
        }
    }, {
        val: "findCoord",
        sib: ["ippCoordinates2FindCoord", "ippCoordinates"],
        text: "Find Location",
        icon: 'fa-flag-checkered',
        color: '#449D44',
        bg: 'bg-green',
        style: {
            fillColor: '#449D44',
            color: '#449D44',
            //stroke:false,
            fillOpacity: 0.8,
            opacity: 0.8,
            weight: 1,
            radius: 6,
            fillOpacity: 0.7
        }
    }];
    var flatten = function (x, result, prefix) {
        if (_.isObject(x)) {
            _.each(x, function (v, k) {
                flatten(v, result, prefix ? prefix + '.' + k : k)
            })
        } else {
            result[prefix] = x
        }
        return result
    }
    activeFeatures = [];
    Session.set('activeFeatures', activeFeatures);

    function highlightFeature(e, f) {
        resetHighlight();
        Session.set('activeRecord', this.feature.properties.record);
        var properties = this.feature.properties;
        var id = properties.id;
        var sib = properties.field.sib
        var layer = e.target;
        activeFeatures.push({
            layer: layer,
            style: properties.field.style
        });
        layer.setStyle({
            color: '#2CC5D2',
            radius: 12,
            weight: 4,
            opacity: 1,
            dashArray: '1',
            fillOpacity: 1
        });
        sib.forEach(function (d) {
            layerGroups[d].eachLayer(function (e) {
                if (e.feature.properties.id === id) {
                    activeFeatures.push({
                        layer: e,
                        style: e.feature.properties.field.style
                    });
                    e.setStyle({
                        color: '#2CC5D2',
                        radius: 12,
                        weight: 4,
                        opacity: 1,
                        dashArray: '1',
                        fillOpacity: 1
                    });
                    e.bringToFront();
                }
            })
        });
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
        var bounds
        activeFeatures.forEach(function (d) {
            if (!bounds) {
                bounds = d.layer.getBounds();
                return;
            }
            bounds.extend(d.layer.getBounds());
        })
        map.fitBounds(bounds);
    }

    function resetHighlight() {
        if (activeFeatures && activeFeatures.length) {
            activeFeatures.forEach(function (e) {
                e.layer.setStyle(e.style)
            });
        }
        activeFeatures = [];
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }
    layerGroups = mapPoints.map(function (d) {
        var geojson = L.geoJson(null, {
            style: function (feature) {
                return d.style;
            },
            pointToLayer: function (feature, latlng) {
                if (feature.properties.field.type === 'path') {
                    return;
                } else {
                    return L.circleMarker(latlng, d.style);
                }
            },
            onEachFeature: function (feature, layer) {
                layer.on({
                    click: highlightFeature,
                    //mouseout: resetHighlight,
                    //click: zoomToFeature
                });
            }
        });
        geojson.addTo(map);
        layerControl.addOverlay(geojson, d.text);
        return {
            name: d.val,
            layer: geojson
        };
    });
    layerGroups = _.object(_.map(layerGroups, function (x) {
        return [x.name, x.layer];
    }));
    //map.scrollWheelZoom.disable();
    map.on('mousedown', function () {
        if (activeFeatures.length) {
            resetHighlight(activeFeatures)
        }
    })
    var legend = L.control({
        position: 'bottomleft'
    });
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        mapPoints.forEach(function (d) {
            div.innerHTML += '<div class="statLegend"><div class="small">' + d.text + '</div><div class="fa-marker ' + d.bg + '"></div></div>';
        });
        return div;
    };
    legend.addTo(map);

    function ipp2find(d, feature) {
        var ipp = d.coords.ippCoordinates;
        var find = d.coords.findCoord;
        if (!ipp || !find) {
            return
        }
        var latlngs = [
            [ipp.lng, ipp.lat],
            [find.lng, find.lat]
        ];
        layerGroups[feature.val].addData({
            "type": "Feature",
            "properties": {
                record: d,
                field: feature,
                id: d._id
            },
            "geometry": {
                "type": "LineString",
                "coordinates": latlngs
            }
        });
    }
    data.forEach(function (d) {
        mapPoints.forEach(function (feature) {
            var coords = d.coords[feature.val];
            if (coords) {
                layerGroups[feature.val].addData({
                    "type": "Feature",
                    "properties": {
                        record: d,
                        field: feature,
                        id: d._id
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [coords.lng, coords.lat]
                    }
                });
            } else if (feature.type === 'path') {
                ipp2find(d, feature)
            }
        });
    });
    var bounds = _.reduce(layerGroups, function (d, e) {
        if (e.getBounds) {
            return e.getBounds();
        };
        return d.extend(e);
    });
    map.fitBounds(bounds);
    return obj;
}
recordStats = function (data) {
    var flatten = function (x, result, prefix) {
        if (_.isObject(x)) {
            _.each(x, function (v, k) {
                flatten(v, result, prefix ? prefix + '.' + k : k)
            })
        } else {
            result[prefix] = x
        }
        return result
    }
    _.keys(Schemas.SARCAT._schema);
    records = Records.find()
        .fetch();
    flattenedRecords = records.map(function (d, e) {
        var flat = flatten(d, {});
        _.each(flat, function (val, field1) {
            if (field1.split('.')
                .length === 4) {
                var field = field1.split('.');
                field.splice(2, 1);
                field = field.join('.');
                flat[field] = val;
                delete flat[field1];
            }
        })
        return flat;
    })
    grouped = _(flattenedRecords)
        .reduce(function (acc, obj) {
            _(obj)
                .each(function (value, key) {
                    if (!_.isArray(acc[key])) {
                        //  console.log(acc)
                        acc[key] = [];
                    }
                    acc[key].push(value)
                });
            return acc;
        }, {});
    count = _.chain(grouped)
        .map(function (d, e) {
            var vals = _.chain(d)
                .countBy(_.identity)
                .map(function (d, e) {
                    return {
                        data: d,
                        name: e
                    }
                })
                .sortBy('data')
                .reverse()
                .value();
            var schema = Schemas.SARCAT._schema[e];
            if (e === '_id') {}
            var label;
            label = schema ? schema.label : e;
            if (e === '_id') {
                //label = 'id';
            } else if (!schema) {
                var split = e.split('.');
                label0 = split[1].charAt(0)
                    .toUpperCase() + split[1].slice(1);
                label1 = split[split.length - 1].charAt(0)
                    .toUpperCase() + split[split.length - 1].slice(1);
                label = label0 + '-' + label1;
            }
            return {
                field: e,
                count: vals,
                label: label
            };
        })
        .value();
    count = count.filter(function (d) {
        var options = _.findWhere(keep, {
            field: d.field
        });
        d.options = options;
        return options;
    });
    count = _.sortBy(count, function (d) {
        return -d.count.length;
    })
    console.log(count)
    return count;
};
resourceArrayForm = function (data) {
    return _.chain(data.resourcesUsed.resource).sortBy(function (d) {
        return -d.count;
    }).map(function (d, e) {
        var sum = 'Total Count: ' + d.count + ',Total Hours: ' + d.hours;
        return {
            key: d.type,
            parent: 'Resources Used',
            val: sum
        };
    }).value()
};
subjectArrayForm = function (flatData, name, parent) {
    return _.chain(flatData).map(function (d, e) {
        if (e.indexOf('_key') > -1) {
            return;
        }
        if (e.indexOf('.' + name + '.') > -1) {
            return {
                key: e,
                val: d
            };
        }
    }).compact().groupBy(function (d) {
        return d.key.substr(d.key.lastIndexOf('.') + 1);
    }).map(function (d, e) {
        var items = d.map(function (f) {
            return f.val;
        }).sort();
        var sum = _.chain(items).reduce(function (counts, word) {
            counts[word] = (counts[word] || 0) + 1;
            return counts;
        }, {}).map(function (d, e) {
            return [d, e];
        }).sortBy(function (d) {
            return -d[0];
        }).map(function (d, e) {
            if (d[0] === 1) {
                return d[1];
            };
            return d[1] + '(' + d[0] + ')';
        }).value().join(', ');
        return {
            key: e,
            parent: parent,
            val: items.sort().join(', '),
            val: sum
        };
    }).value();
};
