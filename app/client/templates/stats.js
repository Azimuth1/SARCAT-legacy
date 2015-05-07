Template.stats.onCreated(function () {
    Session.set('userView', 'stats');
    var records = Records.find()
        .fetch();
    r = records
    data = recordStats(records);
    Session.set('records', records);
    Session.set('data', data);
});
Template.stats.onRendered(function () {
    /* Date.prototype.addDays = function (days) {
        var dat = new Date(this.valueOf())
        dat.setDate(dat.getDate() + days);
        return dat;
    }

    function getDates(startDate, stopDate) {
        var dateArray = new Array();
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            dateArray.push(new Date(currentDate))
            currentDate = currentDate.addDays(1);
        }
        return dateArray;
    }
    var dates = _.chain(data[0].count).map(function (d) {
        return moment(d.letter).format('MMM/DD/YYYY');
    }).sortBy(function (d) {
        return new Date(d);
    }).value();

allDates = getDates(z[0],z[z.length-1]);

allDates.map(function(d){
    var frequency = _
    return {letter:d,frequency:}
})

    drawGraphDate(data[0]);*/
    //var colors = d3.scale.category20c();
    var colors = ["#3D1D23", "#412029", "#44242F", "#482835", "#4A2C3B", "#4C3042", "#4E3548", "#4F394F", "#4F3E55", "#4F435C", "#4E4962", "#4D4E68", "#4A546D", "#475972", "#445F77", "#40647B", "#3C6A7E", "#377081", "#337584", "#2F7B85", "#2B8086", "#298686", "#298B86", "#2B9085", "#309583", "#369A81", "#3E9F7E", "#47A47B", "#51A977", "#5CAD73", "#67B16F", "#73B56B", "#7FB967", "#8BBC63", "#98BF5F", "#A6C25C", "#B4C559", "#C2C757", "#D0C956", "#DFCB56"];
    colors = _.shuffle(colors);
    data.forEach(function (d, i) {
        //console.log(colors,i)
        var color = colors[i];
        drawGraph(d, color);
    });
    var coords = records.map(function (d) {
        return d.coords
    });
    if (!records.length) {
        return;
    }
    var mapBounds = coords[0].bounds;
    mapBounds = boundsString2Array(mapBounds);
    map = statsSetMap('statsMap', mapBounds);
    var mapPoints = [{
            val: "ippCoordinates",
            name: "coords.ippCoordinates",
            text: "Incident Location",
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
            icon: 'fa-male',
            color: 'red'
        }, {
            val: "findCoord",
            name: "coords.findCoord",
            text: "Find Location",
            icon: 'fa-flag-checkered',
            color: 'green'
        }
        /*, {
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
            }*/
    ];
    map.addLegend(mapPoints)
    records.forEach(function (d) {
        mapPoints.forEach(function (e) {
            e.coords = d.coords[e.val];
            map.add(e);
        })
    });
    map.fitBounds();
})
var drawGraph = function (d, color) {
    //colors = d3.scale.category20c();
    var title = d.label;
    var data = d.count;
    var container = d3.select("#recordss")
        .append("div")
        .attr('class', 'col-md-4');
    container.append('h3')
        .text(title);
    var width = parseInt(container.style('width')); // / 1;
    var margin = {
            top: 10,
            right: 20,
            bottom: 30,
            left: 40
        },
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
        //.tickSubdivide(false)
        //.tickValues(d.count.map(function(v){return v.frequency}))
        .ticks(4);
    var svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    x.domain(data.map(function (d) {
        return d.letter;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.frequency;
    })]);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
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
            return x(d.letter);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d.frequency);
        })
        .attr("height", function (d) {
            return height - y(d.frequency);
        })
        .attr("fill", color);
}
var drawGraphDate = function (d) {
    //colors = d3.scale.category20c();
    var colors = ["#3D1D23", "#412029", "#44242F", "#482835", "#4A2C3B", "#4C3042", "#4E3548", "#4F394F", "#4F3E55", "#4F435C", "#4E4962", "#4D4E68", "#4A546D", "#475972", "#445F77", "#40647B", "#3C6A7E", "#377081", "#337584", "#2F7B85", "#2B8086", "#298686", "#298B86", "#2B9085", "#309583", "#369A81", "#3E9F7E", "#47A47B", "#51A977", "#5CAD73", "#67B16F", "#73B56B", "#7FB967", "#8BBC63", "#98BF5F", "#A6C25C", "#B4C559", "#C2C757", "#D0C956", "#DFCB56"];
    var title = d.label;
    var data = d.count;
    dates = data
    var container = d3.select("#recordss")
        .append("div")
        .attr('class', 'col-md-4');
    container.append('h3')
        .text(title);
    // Set the dimensions of the canvas / graph
    var margin = {
            top: 30,
            right: 20,
            bottom: 30,
            left: 50
        },
        width = 600 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;
    // Parse the date / time
    var parseDate = d3.time.format("%m/%d/%Y %H:%M");
    // Set the ranges
    var x = d3.time.scale()
        .range([0, width]);
    var y = d3.scale.linear()
        .range([height, 0]);
    // Define the axes
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5);
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);
    // Define the line
    var valueline = d3.svg.line()
        .x(function (d) {
            return x(d.letter);
        })
        .y(function (d) {
            return y(d.frequency);
        });
    // Adds the svg canvas
    var svg = container
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    // Get the data
    //d3.csv("data.csv", function(error, data) {
    data.push({
        frequency: 9,
        letter: '02/04/1971 02:22'
    })
    data.forEach(function (d) {
        //console.log(d);
        console.log(parseDate.parse(d.letter), +d.frequency);
        d.letter = parseDate.parse(d.letter);
        d.frequency = +d.frequency;
    });
    // Scale the range of the data
    x.domain(d3.extent(data, function (d) {
        return d.letter;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.frequency;
    })]);
    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));
    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
    //});
};
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
                        frequency: d,
                        letter: e
                    }
                })
                .sortBy('frequency')
                .reverse()
                .value();
            var schema = Schemas.SARCAT._schema[e];
            //console.log(schema)
            if (e === '_id') {
                //return {};
            }
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
                // label = label.charAt(0).toUpperCase() + label.slice(1);
            }
            return {
                field: e,
                count: vals,
                label: label
            };
        })
        .value();
    /*var omit = ['Incident Status', 'Incident Type', 'Incident Environment', 'Ecoregion Domain', 'Response State/Region', 'Agency Having Jurisdiction', 'Subject Category', 'Land Owner', 'Terrrain', 'Land Cover',
        'Precipitation Type', 'Distance From IPP', "Elevation Change", "Track Offset", "Incident Outcome", "Scenario", "Lost Strategy", "Mobility (hours)", "IPP Type", "IPP Classification", "Determining Factor", "Type of Decision Point", "Subject-Age", "Subject-Sex", "Subject-Weight,Resource-Type", "Subject-Status"
    ]
    omit = ['_id', 'Latitude', 'Longitude', 'Record Name', 'Incident #', 'Mission #', 'Incident Date/Time'];
    
        */
    keep = ["incidentOperations.ipptype", "incidentOperations.ippclassification", "incidentOperations.PLS_HowDetermined", "recordInfo.incidentdate", "recordInfo.incidenttype", "recordInfo.status", "incident.SARNotifiedDateTime", "incident.county-region", "incident.subjectcategory", "incident.contactmethod", "incident.landOwner", "incident.incidentEnvironment", "incident.ecoregionDivision", "incident.populationDensity", "incident.terrain", "incident.landCover", "weather.precipType", "incidentOutcome.incidentOutcome", "incidentOutcome.scenario", "incidentOutcome.suspensionReasons", "incidentOutcome.distanceIPP", "incidentOutcome.findFeature", "incidentOutcome.detectability", "incidentOutcome.mobility&Responsiveness", "incidentOutcome.lostStrategy", "incidentOutcome.mobility_hours", "rescueDetails.signalling", "subjects.subject.$.age", "subjects.subject.$.sex", "subjects.subject.$.status", "subjects.subject.$.evacuationMethod", "resourcesUsed.numTasks", "resourcesUsed.totalPersonnel", "resourcesUsed.totalManHours", "resourcesUsed.distanceTraveled", "resourcesUsed.totalCost", "resourcesUsed.resource.$.type", "resourcesUsed.resource.$.count", "resourcesUsed.resource.$.hours", "resourcesUsed.resource.$.findResource"];
    count = count.filter(function (d) {
            return _.contains(keep, d.field)
        })
        /*

            count = 
            */
        /*
            var use1  = ["Subject-Age", "Subject Category", "Ecoregion Division", "Subject-Illness", "Subject-InjuryType", "Subject-Mechanism", "Incident Type", "Land Owner", "Subject-Treatmentby", "Subject-EvacuationMethod", "Contact Method", "Population Density", "Land Cover", "Terrrain", "Subject-Physical_fitness", "Subject-Experience", "Subject-Equipment", "Subject-Clothing", "Subject-Survival_training", "Incident Status", "Incident Environment", "Ecoregion Domain", "Subject-Status", "Subject-Local", "Subject-Sex", "IPP Classification", "Incident Response Country", "State/Province", "Incident County/Region", "Signalling", "Injured Searcher", "Total # of Tasks", "Total Man Hours", "Total Cost", "Total Personnel", "Total Distance Traveled", "Distance From IPP", "Find Bearing (deg)", "Incident Outcome", "Subject Located Date/Time", "Incident Closed Date/Time", "Scenario", "Suspension Reasons", "Find Feature", "Detectability", "Mobility/Responsiveness", "Lost Strategy", "Mobility (hours)", "", "Subject-Weight", "Subject-Height", "Resource-_key", "Resource-Type", "Resource-Count", "Resource-Hours", "Resource-FindResource"]
            filteredCount = count.filter(function (d) {
                return _.contains(use1, d.field);
            })
        */
    count = _.sortBy(count, function (d) {
        return -d.count.length
    })
    return count;
};
statsSetMap = function (context, bounds, points) {
    var layers = {
        OSM: L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'),
        Outdoors: L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg'),
        Satellite: L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg')
    };
    var obj = {};
    var map = L.map(context);
    m = map;
    var drawnPaths = new L.FeatureGroup()
        .addTo(map);
    var layerControl = L.control.layers(layers);
    var sarcatLayers = ["ippCoordinates", "findCoord", "destinationCoord", "decisionPointCoord"]; //, "intendedRoute", "actualRoute"];
    var layerGroups = sarcatLayers.map(function (d) {
        var group = new L.FeatureGroup();
        layerControl.addOverlay(group, d);
        return {
            name: d,
            layer: group
        };
    });
    layerGroups = _.object(_.map(layerGroups, function (x) {
        return [x.name, x.layer];
    }));
    map.scrollWheelZoom.disable();
    layers.Outdoors.addTo(map);
    layerControl.addTo(map);
    obj.addLegend = function (grades) {
        var legend = L.control({
            position: 'bottomright'
        });
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            for (var i = 0; i < grades.length; i++) {
                console.log(grades[i].color, grades[i].text)
                div.innerHTML +=
                    '<i style="background:' + grades[i].color + '"></i> ' +
                    grades[i].text + '<br>';
            }
            return div;
        };
        legend.addTo(map);
    }
    obj.add = function (d) {
        if (d.coords && layerGroups[d.val]) {
            obj.addPoint(d);
        }
        return
        if (d.path) {
            if (d.coords) {
                obj.addPoly(d, JSON.parse(d.coords));
                return;
            }
            var start = d.start;
            var end = d.end;
            if (!start || !end) {
                return
            }
            var latlngs = [
                [start.lat, start.lng],
                [end.lat, end.lng]
            ];
            obj.addPoly(d, latlngs);
        }
    };
    obj.addPoint = function (d) {
        var marker = L.circleMarker(d.coords, {
            fillColor: d.color,
            color: d.color,
            stroke: d.color,
            fillColor: d.color,
            fillOpacity: 0.3,
            //stroke: false,
            weight: 1,
            radius: 3
        });
        //console.log(d,layerGroups)
        layerGroups[d.val].addLayer(marker);
        return marker;
    }
    obj.remove = function (d) {
        // console.log(d)
        var removePath = (d.val === 'destinationCoord') ? 'intendedRoute' : (d.val === 'findCoord') ? 'actualRoute' : null;
        if (removePath) {
            // console.log(removePath)
            obj.removePoly(coords[removePath]);
        }
        if (d.path) {
            obj.removePoly(d);
        } else {
            obj.removePoint(d);
            return;
        }
    };
    obj.addPoly = function (d, latlngs) {
        color = d.path.stroke;
        polyline = L.polyline(latlngs, {
            color: '#000',
            opacity: 0.4,
            name: d.name,
            val: d.val,
            editable: false,
            weight: 1
        });
        polyline.addTo(map)
        return
        drawnPaths.addLayer(polyline);
        //paths[d.val] = polyline;
        coords[d.val].layer = polyline;
        //var lineString = JSON.stringify(layer.toGeoJSON());
    };
    obj.removePoly = function (d) {
        var path = coords[d.val].layer;
        $('[name="' + d.name + '"]')
            .val('')
            .trigger("change");
        drawnPaths.removeLayer(path);
        delete coords[d.val];
    };
    obj.removePoint = function (d) {
        var marker = coords[d.val].layer;
        $('[name="' + d.name + '.lng"]')
            .val('')
            .trigger("change");
        $('[name="' + d.name + '.lat"]')
            .val('')
            .trigger("change");
        drawnPaths.removeLayer(marker);
        delete coords[d.val];
    };
    obj.fitBounds = function () {
        map.fitBounds(layerGroups.ippCoordinates.getBounds());
    };
    return obj;
};
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
        .setView([37.8, -96], 4);
    obj.map = map;
    layers.Outdoors.addTo(map);
    /*var info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'srecordMapInfo');
        this.update();
        return this._div;
    };
    info.update = function (props) {
        this._div.innerHTML = '<h4>SARCAT Incident Records</h4>' + (props ?
            '<b>' + JSON.stringify(props) + '</b><br />' + JSON.stringify(props) + ' people / mi<sup>2</sup>' : 'Hover over a state');
    };
    info.addTo(map);*/
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
            fillColor: '#fff',
            color: '#C9302C',
            fillOpacity: 1,
            opacity: .8,
            weight: 3,
            radius: 8,
            fillOpacity: 0.7
        }
    }, {
        val: "findCoord",
        sib: ["ippCoordinates2FindCoord", "ippCoordinates"],
        text: "Find Location",
        icon: 'fa-flag-checkered',
        color: '#449D44',
        bg: 'bg-green',
        style: {
            fillColor: '#fff',
            color: '#449D44',
            fillOpacity: 1,
            opacity: .8,
            weight: 3,
            radius: 8,
            fillOpacity: 0.7
        }
    }, {
        type: 'path',
        val: "ippCoordinates2FindCoord",
        sib: ["ippCoordinates", "findCoord"],
        text: "As the Crow Flies",
        bg: 'bg-black-line',
        style: {
            color: '#000',
            fillColor: '#000',
            weight: 4,
            opacity: 0.4,
        }
    }, ];
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
    var activeFeatures = [];

    function highlightFeature(e, f) {
        Session.set('selectedFeature', this.feature.properties.record);
        var properties = this.feature.properties;
        var id = properties.id;
        var sib = properties.field.sib
        var layer = e.target;
        if (activeFeatures.length) {
            resetHighlight(activeFeatures)
        }
        activeFeatures.push({
            layer: layer,
            style: properties.field.style
        });
        z = activeFeatures;
        layer.setStyle({
            //color: '#fff',
            fillColor: properties.field.color,
            radius: 12,
            opacity: .7,
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
                        //color: '#fff',
                        fillColor: e.feature.properties.field.color,
                        radius: 12,
                        opacity: .7,
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
    }

    function resetHighlight(actives) {
        actives.forEach(function (e) {
            e.layer.setStyle(e.style)
        });
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
                console.log(feature.properties.field);
                if (feature.properties.field.type === 'path') {
                    return; // L.polyline(latlng, d.style);
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
    var legend = L.control({
        position: 'bottomleft'
    });
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        mapPoints.forEach(function (d) {
            div.innerHTML +=
                '<div class="fa-marker ' + d.bg + '"></div>' + d.text + '<br>';
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
        //var polyline = L.polyline(latlngs, feature.style);
        //layerGroups[feature.val].addLayer(polyline);
    }
    data.forEach(function (d) {
        mapPoints.forEach(function (feature) {
            var coords = d.coords[feature.val];
            if (coords) {
                //var marker = L.circleMarker(coords, feature.style);
                //layerGroups[feature.val].addLayer(marker);
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
    g = geojson
    var bounds = _.reduce(layerGroups, function (d, e) {
        if (e.getBounds) {
            return e.getBounds();
        };
        return d.extend(e);
    });
    map.fitBounds(bounds);
    console.log(obj)
    return obj;
}

