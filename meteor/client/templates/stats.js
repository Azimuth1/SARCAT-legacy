mapItem = null;
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
        var getNested = function(obj, args) {
            obj = obj || {};
            args = args || [];
            for (var i = 0; i < args.length; i++) {
                if (!obj || !obj.hasOwnProperty(args[i])) {
                    return false;
                }
                obj = obj[args[i]];
            }
            return obj;
        };
        var pluckDeepLinear = function(records, first, second, obj) {
            var data = _.chain(records)
                .map(function(d) {
                    var ok = getNested(d, [first, second]);
                    if (!ok) { return []; }
                    //if (!d[first]) { return []; }
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
                    //if (!d[first]) { return []; }
                    var ok = getNested(d, [first, second]);
                    if (!ok) { return []; }
                    var vals = _.pluckDeep(d[first][second], obj);
                    //var vals = getNested(d, first, second, obj);
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
        var klass = 'chartDiv col-xs-12 col-md-6 pad0 text-center';
        margin = {
            top: 40,
            right: 5,
            bottom: 50,
            left: 20
        };
        var container = cont
            .append('div')
            .attr('class', klass);
        //.append('div')
        //.attr('class', 'mar0x mar1y text-center');
        var width1 = parseInt(container.style('width'));
        width = width1 - margin.left - margin.right;
        height = 300 - margin.top - margin.bottom;
        var svg1 = container.append('svg')
            .attr('width', '100%')
            //.attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .style('border', '1px solid #e4e6e7');
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
        /*if (record.options.field !== 'incidentOutcome.scenario' && record.options.field !== 'recordInfo.subjectCategory' && record.options.field !== 'recordInfo.status') {
            return;
        }
        console.log(record, svg);*/
        var data = record.count;
        var options = record.options || {};
        x = d3.scale.ordinal()
            .rangeRoundBands([0, width], 0.2);
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
        //var maxBarWidth = 50;

        //var barW = Math.min.apply(null, [x.rangeBand() / 2, maxBarWidth]);
        var barW = x.rangeBand();
        var halfBarW = barW / 2;

        var bar = svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'bar')
            .attr('transform', function(d) {
                //var xTrans = (((x.rangeBand() / 2) + x(d.name)) - (maxBarWidth / 2));
                var xTrans = (x(d.name));

                return 'translate(' + xTrans + ',' + y(d.data) + ')';
            });
        bar.append('rect')
            .attr('class', '_bar')
            .attr('fill', function() {
                return barColors();
            })
            .attr('width', barW)
            .attr('height', function(d) {
                return height - y(d.data);
            });
        var barText = bar.append('text')
            .attr('class', 'barText')
            //.attr('dy', '1.75em')
            .attr('y', function(d) {
                return height - y(d.data) - 2;
            })
            .attr('x', halfBarW)
            .attr('text-anchor', 'middle')
            .text(function(d) {
                return d.data;
            });
        /*var allXText = svg.selectAll('.x.axis .tick text');
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
        }*/



        //d3.selectAll('.chartDiv svg').each(function() {
        // var self = d3.select(svg);
        // ss = svg;

        var w = svg.node().getBoundingClientRect().width * 0.8;
        xAx = svg.selectAll('.x.axis');
        text0 = xAx.selectAll('.tick text');
        if (!text0.size()) {
            return;
        }
        // return

        //svg = ss;

        /*var text = text0
            .nodes()
            .filter(function(e) {
                return e.textContent;
            });
        var bbox = text
            .map(function(d) {
                return d.getBoundingClientRect();
            });


        var textW = _.reduce(bbox, function(e, f) {
            return e + f.width;
        }, 0);*/
        var texts = text0[0];
        var widths = texts.map(function(el) {
            return el.getBoundingClientRect()
                .width;
        });
        var maxW = Math.max.apply(null, widths);
        var getWidth = function() {
            return widths.reduce(function(d, e) { return d + e; });
        };

        var isOK = function(check, ang) {
            return (w > (check * 0.85)) || ang <= -90;
        };

        var textWInit = getWidth();
        var gap = x.rangeExtent()[1] / x.range().length;
        var okInit = (gap > maxW) && isOK(textWInit);
        if (okInit) { return; }
        text0
            .attr('transform', 'rotate(-90)')
            .style({
                'text-anchor': 'start',
                'dominant-baseline': 'central'
            })
            .attr('dx', 16)
            .attr('y', 0)
            .attr('dy', 0);
        var xAxNode = xAx.node();
        xAxNode.parentNode.appendChild(xAxNode);
        barText.style('font-size', '0.8em');
        /*return;
        rot = function(rotate) {
            text0.attr('transform', function() {
                return 'rotate(' + rotate + ')';
            });
        };
        text0
            .style('text-anchor', 'middle')
            .attr('dx', '-1em');
        var deg = -10;
        var spin = true;
        while (spin) {
            rot(deg);
            textW = getWidth();
            var ok = isOK(textW, deg);
            if (ok) {
                spin = false;
            } else {
                deg = deg - 10;
            }

        }*/
    };
    context.drawRecords = function(records) {
        records.forEach(function(d) {
            var svg = context.drawGraph(d, statDiv);
            context.drawBars(d, svg);
        });
    };
    context.redrawRecords = function(records) {
        _records = records;
        Session.set('currentRecords', records);
        $('.svgRecord')
            .children()
            .remove();
        mapItem.filter(records);

        if (records.length) {
            countedRecords = context.countRecords(records);
            countedRecords.forEach(function(e) {
                context.drawBars(e, context.chartsObj[e.options.field]);
            });
        }

    };
    Session.set('currentRecords', records);
    $('#recordss').children().remove();
    var initRecords = context.countRecords(records);
    context.drawRecords(initRecords);
    context.initRecords = initRecords;
    return context;
};
var recordsSetMap = function(context, data) {
    var obj = {};
    var exists = mapItem && mapItem.map && mapItem.map.remove;
    if (exists) {
        mapItem.map.remove();
    }

    var map = L.map(context);
    obj.map = map;

    map.scrollWheelZoom.disable();
    var layerGroups;
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
        sib: ['ippCoordinates2FindCoord', 'findCoord'],
        text: 'Incident Location',
        icon: 'fa-times-circle-o',
        color: '#C9302C',
        bg: 'bg-red',
        style: {
            fillColor: '#ba5552',
            color: '#931111',
            opacity: 0.8,
            weight: 1,
            radius: 6,
            fillOpacity: 0.7
        }
    }, {
        type: 'path',
        val: 'ippCoordinates2FindCoord',
        sib: ['ippCoordinates', 'findCoord'],
        text: '-----',
        bg: 'bg-black-line',
        style: {
            color: '#000',
            weight: 3,
            opacity: 0.4,
            dashArray: '5,5',
        }
    }, {
        val: 'findCoord',
        sib: ['ippCoordinates2FindCoord', 'ippCoordinates'],
        text: 'Find Location',
        icon: 'fa-flag-checkered',
        color: '#449D44',
        bg: 'bg-green',
        style: {
            fillColor: '#449D44',
            color: '#225022',
            opacity: 0.8,
            weight: 1,
            radius: 6,
            fillOpacity: 0.7
        }
    }];
    var activeFeatures = [];
    Session.set('activeFeatures', activeFeatures);

    function resetHighlight() {
        if (activeFeatures && activeFeatures.length) {
            activeFeatures.forEach(function(e) {
                e.layer.setStyle(e.style);
            });
        }
        activeFeatures = [];
    }

    function highlightFeature(e) {
        resetHighlight();
        Session.set('activeRecord', this.feature.properties.record._id);
        var properties = this.feature.properties;
        var id = properties.id;
        var sib = properties.field.sib;
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
        sib.forEach(function(d) {
            layerGroups[d].eachLayer(function(e) {
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
            });
        });
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
        var bounds;
        activeFeatures.forEach(function(d) {
            if (!bounds) {
                bounds = d.layer.getBounds();
                return;
            }
            bounds.extend(d.layer.getBounds());
        });
        map.fitBounds(bounds, { maxZoom: 15 });
    }


    map.on('click', function() {
        resetHighlight();
        Session.set('activeRecord', false);
    });
    var layerGroup = L.featureGroup();
    layerGroups = mapPoints.map(function(d) {
        var geojson = L.geoJson(null, {
            style: function() {
                return d.style;
            },
            pointToLayer: function(feature, latlng) {
                if (feature.properties.field.type === 'path') {
                    return;
                } else {
                    return L.circleMarker(latlng, d.style);
                }
            },
            onEachFeature: function(feature, layer) {
                layer.on({
                    click: highlightFeature,
                    //mouseout: resetHighlight,
                    //click: zoomToFeature
                });
            }
        });
        //geojson.addTo(map);
        layerGroup.addLayer(geojson);
        layerControl.addOverlay(geojson, d.text);
        return {
            name: d.val,
            layer: geojson
        };
    });
    layerGroups = _.object(_.map(layerGroups, function(x) {
        return [x.name, x.layer];
    }));
    map.on('mousedown', function() {
        if (activeFeatures.length) {
            resetHighlight(activeFeatures);
        }
    });
    var legend = L.control({
        position: 'bottomleft'
    });
    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend');
        mapPoints.forEach(function(d) {
            div.innerHTML += '<div class="statLegend"><div class="small">' + d.text + '</div><div class="fa-marker ' + d.bg + '"></div></div>';
        });
        return div;
    };
    legend.addTo(map);

    function ipp2find(d, feature) {
        var isNumber = function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };

        var ipp = d.coords.ippCoordinates || {};
        var find = d.coords.findCoord || {};


        var lat0 = ipp.lat % 90;
        var lng0 = ipp.lng % 180;
        var lat1 = find.lat % 90;
        var lng1 = find.lng % 180;
        if (!isNumber(lat0) || !isNumber(lat1) || !isNumber(lng0) || !isNumber(lng1)) {
            return;
        }
        var latlngs = [
            [lng0, lat0],
            [lng1, lat1]
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

    data.forEach(function(d) {
        mapPoints.forEach(function(feature) {
            var coords = d.coords[feature.val] || {};
            var lat = coords.lat % 90;
            var lng = coords.lng % 180;
            if (lng && lat) {

                layerGroups[feature.val].addData({
                    'type': 'Feature',
                    'properties': {
                        record: d,
                        field: feature,
                        id: d._id
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [lng, lat]
                    }
                });
            } else if (feature.type === 'path') {
                ipp2find(d, feature);
            }
        });
    });
    var layerGroupBounds = layerGroup.getBounds();
    if (Object.keys(layerGroupBounds).length) {
        map.fitBounds(layerGroupBounds);
    }
    layerGroup.addTo(map);

    obj.layerGroup = layerGroup;
    obj.filter = function(filter) {
        var arr = filter ? filter : data;
        //f = filter;
        //return
        var layers = layerGroup.getLayers();
        layers.forEach(function(d) {
            d.clearLayers();
        });
        //if(layerGroup && layerGroup.getLayers){}
        //layerGroup.clearLayers();
        arr.forEach(function(d) {
            mapPoints.forEach(function(feature) {
                var coords = d.coords[feature.val] || {};
                var lat = coords.lat % 90;
                var lng = coords.lng % 180;
                if (lng && lat) {

                    layerGroups[feature.val].addData({
                        'type': 'Feature',
                        'properties': {
                            record: d,
                            field: feature,
                            id: d._id
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [lng, lat]
                        }
                    });
                } else if (feature.type === 'path') {
                    ipp2find(d, feature);
                }
            });
        });
        var layerGroupBounds = layerGroup.getBounds();
        if (Object.keys(layerGroupBounds).length) {
            map.fitBounds(layerGroupBounds);
        }
    };
    return obj;
};
Template.stats.onCreated(function() {
    Session.set('userView', 'stats');
    Session.set('activeRecord', null);
    Session.set('currentRecords', []);
});
Template.stats.onRendered(function() {
    var records = Records.find()
        .map(function(d) {
            var ok = d.timeLog && d.timeLog.lastSeenDateTime;
            if (!ok) { return d; }
            d.date = new Date(d.timeLog.lastSeenDateTime);
            return d;
        });
    Session.set('recordCount', records.length);

    //var stats = chartStats(records);
    // var mapItem=dateChart(records, stats);
    mapItem = recordsSetMap('recordsMap', records);

    resizeend = function() {
        console.log('resizeend');

        stats = chartStats(records);
        dateChart(records, stats);
    };
    var throttled = _.debounce(resizeend, 300);
    $(window)
        .resize(throttled);
    resizeend();




});
Template.stats.onDestroyed(function() {
    $(window).off('resize');
    mapItem = null;
});
Template.stats.helpers({
    totalRecords: function() {
        return Session.get('recordCount');
    },
    currentRecords: function() {
        return Session.get('currentRecords')
            .length;
    },
    stats: function() {
        var data = Records.find(Session.get('activeRecord'))
            .fetch();
        var stats = genList(data);
        return stats;
    },
});