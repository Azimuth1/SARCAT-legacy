var genList = function(records) {
    if (!records || !records.length) {
        return;
    }
    return records.map(function(data) {
        if (!data) {
            return {};
        }
        var displayData = _.chain(data)
            .map(function(val, schema1) {
                var ignore = ['_id', 'subjects', 'resourcesUsed'];
                if (ignore.indexOf(schema1) !== -1) {
                    return;
                }
                if (typeof(val) === 'string') {
                    return;
                }


                //if(val.intendedRoute){return;}
                //delete val.intendedRoute;



                var check = Schemas[schema1] || {};
                var schema = check._schema || {};
                var sar = Schemas.SARCAT._schema || {};
                var parent = sar[schema1].label || 'other';
                var results = _.map(val, function(d, e) {
                    var labelCheck = schema[e] || {};
                    var label = labelCheck.label || e;

                    if (typeof(d) === 'object') {
                        d = _.map(d, function(d, e) {
                            return e + ':' + d
                        }).join(',');
                    }
                    return {
                        key: label,
                        parent: parent,
                        val: d
                    }
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
            .map(function(d, e) {
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

Template.reportMap.onRendered(function() {
    reportSetMap(this.data, $('.aa')[0]);
});


Template.report.onCreated(function() {
    Session.set('userView', 'report');
});
Template.report.onRendered(function() {
    var stats = genList(this.data);
    Session.set('stats', stats);
});
Template.report.helpers({
    stats: function() {
        return Session.get('stats');
    },
    hasStats: function() {
        var _stats = Session.get('stats');
        var hasStats = _stats && _stats.length ? true : false;

        return hasStats;
    },
});
var chartStats = function(records) {
    var statDiv = d3.select('#recordss');
    var context = {};
    var height;
    var width;
    var margin;
    context.countRecords = function(data) {
        var makeFlat = function(records) {
            var flatten = function(x, result, prefix) {
                if (_.isObject(x)) {
                    _.each(x, function(v, k) {
                        flatten(v, result, prefix ? prefix + '.' + k : k);
                    });
                } else {
                    result[prefix] = x;
                }
                return result;
            };
            // var allInputs = _.clone(allInputs);
            var toGraph = _.chain(allInputs)
                .map(function(d) {
                    if (d.stats) {
                        return d;
                    }
                })
                .compact()
                .value();
            return _.chain(records)
                .map(function(d) {
                    var flat = flatten(d, {});
                    return _.pick(flat, toGraph.map(function(key) {
                        return key.field;
                    }));
                })
                .value();
        };
        var pluckDeepLinear = function(records, first, second, obj) {
            var data = _.chain(records)
                .map(function(d) {
                    return _.pluckDeep(d[first][second], obj);
                })
                .flatten()
                .value();
            data = d3.layout.histogram()
                .bins(5)
                (data)
                .map(function(a) {
                    return {
                        data: a.length,
                        name: d3.extent(a)
                            .join('-')
                    };
                });
            return data.filter(function(d) {
                return d.data;
            });
        };
        var pluckDeepOrdinal = function(records, first, second, obj) {
            var data = _.chain(records)
                .map(function(d) {
                    var vals = _.pluckDeep(d[first][second], obj);
                    return vals;
                    // vals = Array(vals.length).join('a').split('');
                })
                .flatten()
                .value();
            return _.chain(data)
                .countBy(_.identity)
                .map(function(d, e) {
                    return {
                        data: d,
                        name: e
                    };
                })
                .value();
        };
        ages = {
            options: {
                label: 'Subject - Age Range Distribution',
                number: true,
                xLabel: 'Value Ranges',
                field: 'subject.age'
            },
            'count': pluckDeepLinear(data, 'subjects', 'subject', 'age'),
        };
        sexes = {
            options: {
                label: 'Subject - Sex',
                number: true,
                field: 'subject.sex',
                xLabel: 'Values',
            },
            'count': pluckDeepOrdinal(data, 'subjects', 'subject', 'sex'),
        };
        resType = {
            options: {
                'field': 'resourcesUsed.type',
                'label': 'Individual Resources Used Total',
                'tableList': true,
                'parent': 'ResourcesUsed',
                'xLabel': 'Values',
            },
            'count': pluckDeepOrdinal(data, 'resourcesUsed', 'resource', 'type'),
        };
        resHours = {
            options: {
                'field': 'resourcesUsed.hours',
                'label': 'Resource Hours Distribution',
                'tableList': true,
                'parent': 'Resources Used',
                xLabel: 'Values Ranges',
            },
            'count': pluckDeepLinear(data, 'resourcesUsed', 'resource', 'hours'),
        };
        var etc = [ages, sexes, resType, resHours].filter(function(d) {
            return d.count.length;
        });
        var flattenedRecords = makeFlat(data);
        var grouped = _.chain(flattenedRecords)
            .reduce(function(acc, obj) {
                _.each(obj, function(value, key) {
                    if (!_.isArray(acc[key])) {
                        acc[key] = [];
                    }
                    acc[key].push(value);
                });
                return acc;
            }, {})
            .value();
        var count = _.chain(grouped)
            .map(function(d, e) {
                var options1 = _.findWhere(allInputs, {
                    field: e
                });
                var options = _.clone(options1);
                var vals;
                if (options.number) {
                    vals = d3.layout.histogram()
                        .bins(5)
                        (d)
                        .map(function(a) {
                            return {
                                data: a.length,
                                name: d3.extent(a)
                                    .join('-')
                            };
                        });
                    vals = vals.filter(function(d) {
                        return d.data;
                    });
                    options.xLabel = ' Value Ranges';
                    options.label += ' (Avg Distribution)';
                } else {
                    vals = _.chain(d)
                        .countBy(_.identity)
                        .map(function(d, e) {
                            return {
                                data: d,
                                name: e
                            };
                        })
                        .value();
                    vals = _.chain(vals)
                        .sortBy('data')
                        .reverse()
                        .value();
                    options.xLabel = ' Values';
                }
                return {
                    options: options,
                    count: vals,
                };
            })
            .sortBy(function(d) {
                return d.options.number;
            })
            .reverse()
            .sortBy(function(d) {
                return d.options.number + d.count.length;
            })
            .reverse()
            .value();
        var result = _.flatten([etc, count]);
        return result;
    };
    context.chartsObj = {};
    context.drawGraph = function(d, cont) {
        var options = d.options || {};
        var title = options.label || '';
        var klass = 'col-md-6 pad00';
        margin = {
            top: 40,
            right: 5,
            bottom: 50,
            left: 20
        };
        var container = cont
            .append('div')
            .attr('class', klass)
            .append('div')
            .attr('class', 'mar0x mar1y');
        var width1 = parseInt(container.style('width'));
        width = width1 - margin.left - margin.right;
        height = 300 - margin.top - margin.bottom;
        var svg1 = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .style('border', '1px solid #e4e6e7')
        svg1.append('text')
            .attr('transform', 'translate(' + (width1) / 2 + ',' + margin.top / 2 + ')')
            .attr('class', 'title')
            .attr('text-anchor', 'middle')
            .text(title);
        var svg = svg1.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('class', 'svgRecord');
        context.chartsObj[options.field] = svg;
        return svg;
    };
    context.drawBars = function(record, svg) {
        var data = record.count;
        var options = record.options || {};
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], 0.4);
        var y = d3.scale.linear()
            .rangeRound([height, 0]);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(4)
            .tickSize(-width, 0, 0)
            .tickFormat('');
        x.domain(data.map(function(d) {
            return d.name;
        }));
        y.domain([0, d3.max(data, function(d) {
            return d.data;
        })]);
        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis)
            .append('text')
            .attr('class', 'y_label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -margin.left / 2)
            .attr('dy', '.2em')
            .attr('x', -height / 2)
            .style('text-anchor', 'middle')
            .text('Frequency');
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)
            .append('text')
            .attr('class', 'x_label')
            .attr('fill', '#fff')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', margin.bottom * 0.75)
            .text(options.xLabel);
        var barColorIndex = 0;
        var barColors = function() {
            var colors = ['#b46928', '#cb812a'];
            barColorIndex++;
            return colors[barColorIndex % 2];
        };
        var maxBarWidth = 50;
        var bar = svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'bar')
            .attr('transform', function(d) {
                return 'translate(' + (((x.rangeBand() / 2) + x(d.name)) - (maxBarWidth / 2)) + ',' + y(d.data) + ')';
            });
        bar.append('rect')
            .attr('class', '_bar')
            .attr('fill', function() {
                return barColors();
            })
            .attr('width', Math.min.apply(null, [x.rangeBand(), maxBarWidth]))
            .attr('height', function(d) {
                return height - y(d.data);
            });
        bar.append('text')
            .attr('class', 'barText')
            //.attr('dy', '1.75em')
            .attr('y', -2)
            .attr('x', maxBarWidth / 2)
            .attr('text-anchor', 'middle')
            .text(function(d) {
                return d.data;
            });
        var allXText = svg.selectAll('.x.axis .tick text');
        var w = _.reduce(allXText[0], function(sum, el) {
            return sum + el.getBoundingClientRect()
                .width;
        }, 0);
        if (w > width * 0.8) {
            svg.selectAll('.x.axis .tick text')
                .style('text-anchor', 'middle')
                .attr('dx', '-1em')
                .attr('transform', function() {
                    return 'rotate(-10)';
                });
        }
    };
    context.drawRecords = function(records) {
        records.forEach(function(d) {
            var svg = context.drawGraph(d, statDiv);
            context.drawBars(d, svg);
        });
    };
    var initRecords = context.countRecords(records);
    context.drawRecords(initRecords);
    context.initRecords = initRecords;
    return context;
};
var resourceArrayForm = function(data) {
    return _.chain(data.resourcesUsed.resource)
        .sortBy(function(d) {
            return -d.count;
        })
        .map(function(d, e) {
            var sum = 'Total Count: ' + d.count + ',Total Hours: ' + d.hours;
            return {
                key: d.type,
                parent: 'Resources Used',
                val: sum
            };
        })
        .value()
};
var subjectArrayForm = function(flatData, name, parent) {
    return _.chain(flatData)
        .map(function(d, e) {
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
        .groupBy(function(d) {
            return d.key.substr(d.key.lastIndexOf('.') + 1);
        })
        .map(function(d, e) {
            hide = ['name', 'address', 'homePhone', 'cellPhone', 'other'];
            if (_.contains(hide, e)) {
                return [];
            }
            var items = d.map(function(f) {
                    return f.val;
                })
                .sort();
            var sum = _.chain(items)
                .reduce(function(counts, word) {
                    counts[word] = (counts[word] || 0) + 1;
                    return counts;
                }, {})
                .map(function(d, e) {
                    return [d, e];
                })
                .sortBy(function(d) {
                    return -d[0];
                })
                .map(function(d, e) {
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
        val: "ippCoordinates",
        name: "coords.ippCoordinates",
        text: 'IPP Location. <br>Direction of Travel (hover to edit): <div class="fa fa-arrow-circle-up fa-2x fa-fw travelDirection"></div>', //"IPP Location",
        icon: 'fa-times-circle-o',
        color: 'red'
    }, {
        val: "decisionPointCoord",
        name: "coords.decisionPointCoord",
        text: "Decision Point",
        icon: 'fa-code-fork',
        color: 'orange'
    }, {
        val: "destinationCoord",
        name: "coords.destinationCoord",
        text: "Intended Destination",
        icon: 'fa-flag-checkered',
        color: 'blue'
    }, {
        val: "revisedLKP_PLS",
        name: "coords.revisedLKP_PLS",
        text: "Revised IPP",
        icon: 'fa-times-circle-o',
        color: 'darkred',
        tColor: '#000'
    }, {
        val: "findCoord",
        name: "coords.findCoord",
        text: "Find Location",
        icon: 'fa-flag-checkered',
        color: 'green'
    }, {
        val: "intendedRoute",
        name: "coords.intendedRoute",
        text: "Intended Route",
        path: {
            stroke: '#37A8DA'
        }
    }, {
        val: "actualRoute",
        name: "coords.actualRoute",
        text: "Actual Route",
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
