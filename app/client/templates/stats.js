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
    data.forEach(function (d) {
        drawGraph(d);
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
        text: 'IPP Location. <br>Direction of Travel (hover to edit): <div class="fa fa-arrow-circle-up fa-2x fa-fw travelDirection"></div>', //"IPP Location",
        icon: 'fa-times-circle-o',
        color: 'red'
    }, {
        val: "findCoord",
        name: "coords.findCoord",
        text: "Find Location",
        icon: 'fa-flag-checkered',
        color: 'blue'
    }, {
        val: "actualRoute",
        name: "coords.actualRoute",
        text: "Actual Route",
        path: {
            stroke: 'green',
            weight: 8
        }
    }, ];
    /*
    _.each(mapPoints, function (d, ind) {
  
        coords.forEach(function (e) {
            if (!e) {
                return;
            }
            var latlng = e[d.val];
            if (!latlng) {
                return
            };
            d.coords = latlng;
            map.add(d);
        });
    })

*/
    //_.each(mapPoints, function (d, ind) {
    records.forEach(function (d) {
        console.log(d)
        map.addPoint({
            val: "ippCoordinates",
            name: "coords.ippCoordinates",
            text: 'IPP Location. <br>Direction of Travel (hover to edit): <div class="fa fa-arrow-circle-up fa-2x fa-fw travelDirection"></div>', //"IPP Location",
            icon: 'fa-times-circle-o',
            color: 'red',
            coords: d.coords.ippCoordinates
        });
        /*
                    if (!e) {
                        return;
                    }
                    var latlng = e[d.val];
                    if (!latlng) {
                        return
                    };
                    d.coords = latlng;
                    map.add(d);*/
    });
    // })
    map.fitBounds();
})
var drawGraph = function (d) {
    colors = d3.scale.category20c();
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
        .attr("fill", function (d, i) {
            return colors(i)
        });
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
count=count.filter(function(d){return _.contains(keep,d.field)})

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
    var markers = {};
    var paths = {};
    var coords = {};
    var obj = {};
    var map = L.map(context);
    //map.fitBounds(bounds);
    m = map;
    drawnPaths = new L.FeatureGroup()
        .addTo(map);
    map.scrollWheelZoom.disable();
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            id: 'examples.map-i875mjb7'
        })
        .addTo(map);
    /*obj.add = function (d) {
        //console.log(d)
        z = coords;
        var val = d.val;
        if (!d.path) {
            coords[val] = d;
            obj.addPoint(d);
        }
        if (d.path) {
            coords[d.val] = d;
            //console.log(d);
             if (d.coords) {
                 obj.addPoly(d, JSON.parse(d.coords));
                 return;
             }
            var start = coords.ippCoordinates.layer.getLatLng();
            var end = (coords.findCoord) ? coords.findCoord.layer.getLatLng() : null;
            if (!start || !end) {
                return
            }
            var latlngs = [
                [start.lat, start.lng],
                [end.lat, end.lng]
            ];
            console.log(latlngs[0][0])
            obj.addPoly(d, latlngs);
        }
    };*/
    obj.addPoint = function (d) {
     
        var _coords = d.coords || map.getCenter();
        
        var myIcon = L.divIcon({
            iconSize: [41, 39],
            className: 'fa ' + d.icon + ' fa-4x fa-fw'
        });
        var marker = L.circleMarker(_coords, {
            fillColor: d.color,
            color: d.color,
            fillOpacity: 0.3,
            //stroke: false,
            weight: 3,
            radius: 4
        });
        var text = d.text;
        coords[d.val].layer = marker;
        drawnPaths.addLayer(marker);
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
            opacity: 0.8,
            name: d.name,
            val: d.val,
            editable: false,
            weight: 4
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
        return
        map.fitBounds(drawnPaths.getBounds()
            .pad(.3));
    };
    return obj;
}
stats = function () {
    $('#recordStats .panel-heading')
        .html('<h3 class="panel-title"><span class="text-danger">Red Circles = IPP</span>, <span class="text-primary"n>Blue Circles = Find Coordinates</span></div>');
};

