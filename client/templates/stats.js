Template.stats.onCreated(function () {
    Session.set('userView', 'stats');
    records = Records.find().fetch();
    r = records
    Session.set('activeRecord', false);
});
Template.stats.onRendered(function () {
    var data = recordStats(records);
    sub_res = selectedSubjectResourceInfo(records);
    var allData = _.flatten([sub_res, data])
    var colors = ["#5D2E2C", "#6E3B49", "#744F6A", "#6B6788", "#53819D", "#3799A2", "#3AB098", "#67C283", "#A1D06B", "#E2D85D"];
    allData.forEach(function (d, i) {
        if (d.field === 'timeLog.lastSeenDateTime') {
            return d3Calender('#d3Calender', d.count)
        }
        var color = colors[i % 10];
        //console.log(d.field)
        //if (d.field === 'subjects.subject.$.age' || d.number) {
        if (d.field === 'subjects.subject.$.age') {
            return drawHistogram(d, color, "#recordss");
            //return drawLine(d, color, "#recordss");
        } else {
            drawGraph(d, color, "#recordss");
        }

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
        var flatData = flatten(data, {});
        var displayData = _.chain(flatData)
            .map(function (d, e) {
                var val = _.findWhere(allInputs, {
                    field: e
                });
                if (val) {
                    return {
                        key: val.label,
                        parent: val.parent,
                        val: d
                    };
                }
            })
            .compact()
            .value();
        var subjects2 = subjectArrayForm(flatData, 'subject', 'Subjects');
        var resources2 = resourceArrayForm(data);
        var displayData = _.flatten([displayData, subjects2, resources2]);
        var displayData2 = _.chain(displayData)
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









var drawHistogram = function (d, color, context) {

    //colors = d3.scale.category20c();
    var title = d.label;
    var values = d.count;
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
    } else if (numItems < 9) {
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






    //var values = d; //3.range(1000).map(d3.random.bates(10));

    // A formatter for counts.
    var formatCount = d3.format(",.0f");

    var margin = {
            top: 10,
            right: 30,
            bottom: 30,
            left: 30
        },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .domain([0, 1])
        .range([0, width]);

    // Generate a histogram using twenty uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(20))
        (values);

    var y = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.y;
        })])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) {
            return "translate(" + x(d.x) + "," + y(d.y) + ")";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(data[0].dx) - 1)
        .attr("height", function (d) {
            return height - y(d.y);
        });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", x(data[0].dx) / 2)
        .attr("text-anchor", "middle")
        .text(function (d) {
            return formatCount(d.y);
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
};





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
    } else if (numItems < 9) {
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









var drawLine = function (d, color, context) {
    //colors = d3.scale.category20c();
    var title = d.label;
    var data = d.count;
    data = _.sortBy(data, function (e) {
        return +e.name;
    })
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
    } else if (numItems < 9) {
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
        //.ticks(4);
        //var Y_AXIS_LABEL = config.yAxisLabel;
        //var X_DATA_PARSE = d3.format('.0f');
        //var Y_DATA_PARSE = vida.number;
    var X_DATA_TICK = d3.format('.0f');
    //var X_AXIS_COLUMN = config.xAxis;
    //var Y_AXIS_COLUMN = config.yAxis;
    console.log(width, height)
    var y = d3.scale.linear()
        .range([height, 0]);
    var x = d3.scale.linear()
        .range([0, width])
    var xAxis = d3.svg.axis()
        .scale(x)
        //.tickFormat(X_DATA_TICK)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    x.domain(d3.extent(data, function (d) {
        return +d.name;
    }));
    //x.domain(d3.range(d3.min(data,function(d){return d.name}),d3.max(data,function(d){return d.name})));
    y.domain(d3.extent(data, function (d) {
        return d.data;
    }));
    var line = d3.svg.line()
        .interpolate("basis")
        .x(function (d) {
            return x(d.name);
        })
        .y(function (d) {
            return y(d.data);
        });
    var svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g")
        .attr("class", "x axis")
        .text(d.label)
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text('# of Instances');
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", color)
        .attr('fill', 'none')
        .attr("stroke-width", 4);
    /*


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

    */
    /*

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

    */
    return
    var Y_AXIS_LABEL = config.yAxisLabel;
    var X_DATA_PARSE = d3.format('.0f');
    var Y_DATA_PARSE = vida.number;
    var X_DATA_TICK = d3.format('.0f');
    var X_AXIS_COLUMN = config.xAxis;
    var Y_AXIS_COLUMN = config.yAxis;
    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        },
        width = config.width - margin.left - margin.right,
        height = config.height - margin.top - margin.bottom;
    var y = d3.scale.linear()
        .range([height, 0]);
    var x = d3.scale.linear()
        .range([0, width])
    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(X_DATA_TICK)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    var line = d3.svg.line()
        .interpolate("basis")
        .x(function (d) {
            return x(d.x_axis);
        })
        .y(function (d) {
            return y(d.y_axis);
        });
    var svg = d3.select("#canvas-svg").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    data.forEach(function (d) {
        d.x_axis = X_DATA_PARSE(d[X_AXIS_COLUMN]);
        d.y_axis = Y_DATA_PARSE(d[Y_AXIS_COLUMN]);
    });
    x.domain(d3.extent(data, function (d) {
        return +d.x_axis;
    }));
    //x.domain(d3.range(d3.min(data,function(d){return d.x_axis}),d3.max(data,function(d){return d.x_axis})));
    y.domain(d3.extent(data, function (d) {
        return d.y_axis;
    }));
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
        .text(Y_AXIS_LABEL);
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", config.lineColor)
        .attr("stroke-width", config.lineThickness);
}

var recordStats = function (data) {
    var flatten = function (x, result, prefix) {
        if (_.isObject(x)) {
            _.each(x, function (v, k) {
                flatten(v, result, prefix ? prefix + '.' + k : k)
            })
        } else {
            result[prefix] = x
        }
        return result
    };
    var records = Records.find()
        .fetch();
    toGraph = _.chain(allInputs).map(function (d) {
        if (d.stats) {
            return d; //.field;
        }
    }).compact().value();
    flattenedRecords = _.chain(records).map(function (d, e) {
        var flat = flatten(d, {});
        return _.pick(flat, toGraph.map(function (key) {
            return key.field;
        }));
    }).value();
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
            return {
                field: e,
                count: vals,
                label: Schemas.SARCAT._schema[e].label
            };
        })
        .value();
    count = count.filter(function (d) {
        var options = _.findWhere(allInputs, {
            field: d.field
        });
        d.options = options;
        d.number = options.number
        return options;
    });
    count = _.sortBy(count, function (d) {
        return -d.count.length;
    })
    console.log(count)
    return count;
};
var resourceArrayForm = function (data) {
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
var subjectArrayForm = function (flatData, name, parent) {
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
var selectedSubjectResourceInfo = function (records) {
    var res = _.map(records, function (data, e) {
        return _.chain(data.resourcesUsed.resource).sortBy(function (d) {
            return -d.count;
        }).value();
    })
    res = _.flatten(res, 1);
    res = _.groupBy(res, function (d) {
        return d.type
    })
    var resCount = {
        label: 'Resources/Number Used',
        count: {}
    };
    var resHours = {
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
    var keep = ["subjects.subject.$.sex", "subjects.subject.$.status", "subjects.subject.$.age", "subjects.subject.$.evacuationMethod"]
    var subjects = _.chain(sum).map(function (items, e) {
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
    }).filter(function (d) {
        return _.contains(keep, d.field);
    }).sortBy(function (d) {
        return d.field;
    }).value();
    return _.flatten([subjects, resHours, resCount])
};
var d3Calender = function (context, data1) {
    d = data1;
    dd = d;
    var width = 735,
        height = 96,
        cellSize = 13; // cell size
    var day = d3.time.format("%w"),
        week = d3.time.format("%U"),
        percent = d3.format(".1%"),
        format = d3.time.format("%Y-%m-%d");
    var color = d3.scale.quantize()
        .domain([-.05, .05])
        .range(d3.range(11).map(function (d) {
            return "q" + d + "-11";
        }));
    var maxYear = +moment(_.max(data1, function (e) {
        return moment(e.name)
    }).name).format('YYYY') + 1;
    var minYear = +moment(_.min(data1, function (e) {
        return moment(e.name)
    }).name).format('YYYY');
    var svg = d3.select(context).selectAll("svg")
        .data(d3.range(minYear, maxYear))
        .enter().append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "col-md-12 RdYlGn pad00")
        .append("g")
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");
    svg.append("text")
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .style("text-anchor", "middle")
        .text(function (d) {
            return d;
        });
    var rect = svg.selectAll(".day")
        .data(function (d) {
            return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
        })
        .enter().append("rect")
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function (d) {
            return week(d) * cellSize;
        })
        .attr("y", function (d) {
            return day(d) * cellSize;
        })
        .datum(format);
    rect.append("title")
        .text(function (d) {
            return d;
        });
    svg.selectAll(".month")
        .data(function (d) {
            return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
        })
        .enter().append("path")
        .attr("class", "month")
        .attr("d", monthPath);

    function monthPath(t0) {
        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
            d0 = +day(t0),
            w0 = +week(t0),
            d1 = +day(t1),
            w1 = +week(t1);
        return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize + "H" + w0 * cellSize + "V" + 7 * cellSize + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize + "H" + (w1 + 1) * cellSize + "V" + 0 + "H" + (w0 + 1) * cellSize + "Z";
    }
    d3.select(self.frameElement).style("height", "2910px");
    var data = d3.nest()
        .key(function (d) {
            return moment(d.name).format('YYYY-MM-DD')
        })
        .rollup(function (d) {
            return -0.003689859718846812;
            return Math.random() * 1000;
            return d[0].data
        })
        .map(data1);
    rect.filter(function (d) {
            return d in data;
        })
        .attr("class", function (d) {
            return "day q7-11";
        })
        .select("title")
        .text(function (d) {
            return d + ": " + percent(data[d]);
        });
};









var recordsSetMap = function (context, data) {
    var geojson;
    if (!data.length) {
        return;
    }
    var obj = {};
    var map = L.map(context)
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
};
