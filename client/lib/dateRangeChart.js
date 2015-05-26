dateChart = function(records) {
    records = _.chain(records).filter(function(d, i) {
        return d.timeLog && d.timeLog.lastSeenDateTime;
    }).map(function(d) {
        d.date = parseDate(d.timeLog.lastSeenDateTime);
        return d;
    }).compact().value();
    var dates = records
    var extent = d3.extent(records, function(d) {
        if (d.timeLog && d.timeLog.lastSeenDateTime) {
            return new Date(d.timeLog.lastSeenDateTime);
        }
    });
    var minYear = extent[0];
    var maxYear = extent[1];
    // Various formatters.
    var formatNumber = d3.format(",d");
    var formatChange = d3.format("+,d");
    var formatDate = d3.time.format("%B %d, %Y");
    var formatTime = d3.time.format("%I:%M %p");
    var nestByDate = d3.nest()
        .key(function(d) {
            return d3.time.day(d.date);
        });
    // Create the crossfilter for the relevant dimensions and groups.
    record = crossfilter(records);
    var all = record.groupAll();
    var date = record.dimension(function(d) {
        return d.date;
    });
    dates = date.group(d3.time.day);
    var margin = {
        top: 10,
        right: 10,
        bottom: 20,
        left: 10
    };
    var rangeW = parseInt(d3.select(".chart").style('width'))*.95;


    charts = [
        barChart()
        .dimension(date)
        .group(dates)
        .round(d3.time.day.round)
        .x(d3.time.scale()
            .domain([minYear, maxYear])
            .rangeRound([0, rangeW])
        )
        /*,
                barChart()
                .dimension(date)
                .group(dates)
                .round(d3.time.day.round)
                .x(d3.time.scale()
                    .domain([minYear, maxYear])
                    .rangeRound([0, 10 * 90])
                )*/
    ];
    var chart = d3.selectAll(".chart")
        .data(charts)
        .each(function(chart) {
            chart.on("brush", renderAll).on("brushend", renderAll);
        });
    // Render the total.
    d3.selectAll("#total")
        .text(formatNumber(record.size()));
    renderAll();
    // Renders the specified chart or list.
    function render(method) {
            d3.select(this).call(method);
        }
        // Whenever the brush moves, re-rendering everything.
    function renderAll() {
            chart.each(render);
            // d3.select("#active").text(formatNumber(all.value()));
        }
        // Like d3.time.format, but faster.
    function parseDate(d) {
        return new Date(d);
        return new Date(2001,
            d.substring(0, 2) - 1,
            d.substring(2, 4),
            d.substring(4, 6),
            d.substring(6, 8));
    }
    window.filter = function(filters) {
        filters.forEach(function(d, i) {
            charts[i].filter(d);
        });
        renderAll();
    };
    window.reset = function(i) {
        console.log()
        charts[i].filter(null);
        renderAll();
        stats.redrawRecords(records);
    };

    function barChart() {
        if (!barChart.id) {
            barChart.id = 0;
        }

        var x;

        var y = d3.scale.linear().range([100, 0]);
        var id = barChart.id++;
        var axis = d3.svg.axis().orient("bottom");
        var brush = d3.svg.brush();
        var brushDirty;
        var dimension;
        var group;
        var round;
        var extent;

        function chart(div) {
            var width = x.range()[1];

            var height = y.range()[0];

            console.log(width)


            y.domain([0, group.top(1)[0].value]);
            div.each(function() {
                var div = d3.select(this),
                    g = div.select("g");
                if (g.empty()) {

                    div.select(".title").append("a")
                        .attr("href", "javascript:reset(" + id + ")")
                        .attr("class", "reset")
                        .text(" reset")
                        .style("display", "none");
                    console.log(width + margin.left + margin.right)
                    g = div.append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    g.append("clipPath")
                        .attr("id", "clip-" + id)
                        .append("rect")
                        .attr("width", width)
                        .attr("height", height);
                    g.selectAll(".bar")
                        .data(["background", "foreground"])
                        .enter().append("path")
                        .attr("class", function(d) {
                            return d + " bar";
                        })
                        .datum(group.all());
                    g.selectAll(".foreground.bar")
                        .attr("clip-path", "url(#clip-" + id + ")");
                    g.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(axis);
                    var gBrush = g.append("g").attr("class", "brush").call(brush);
                    gBrush.selectAll("rect").attr("height", height);
                    gBrush.selectAll(".resize").append("path").attr("d", resizePath);
                }
                if (brushDirty) {
                    brushDirty = false;
                    g.selectAll(".brush").call(brush);
                    div.select(".title a").style("display", brush.empty() ? "none" : null);
                    if (brush.empty()) {
                        g.selectAll("#clip-" + id + " rect")
                            .attr("x", 0)
                            .attr("width", width);
                    } else {
                        var extent = brush.extent();
                        g.selectAll("#clip-" + id + " rect")
                            .attr("x", x(extent[0]))
                            .attr("width", x(extent[1]) - x(extent[0]));
                    }
                }
                g.selectAll(".bar").attr("d", barPath);
            });

            function barPath(groups) {
                var path = [],
                    i = -1,
                    n = groups.length,
                    d;
                while (++i < n) {
                    d = groups[i];
                    path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
                }
                return path.join("");
            }

            function resizePath(d) {
                var e = +(d == "e"),
                    x = e ? 1 : -1,
                    y = height / 3;
                return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
            }
        }
        brush.on("brushstart.chart", function() {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.select(".title a").style("display", null);
        });
        brush.on("brush.chart", function() {
            extent = brush.extent();
        });
        brush.on("brushend.chart", function() {
            var dateRange = records.filter(function(d) {
                return new Date(d.date) >= extent[0] && new Date(d.date) <= extent[1]
            });
            stats.redrawRecords(dateRange);
            if (brush.empty()) {
                var div = d3.select(this.parentNode.parentNode.parentNode);
                div.select(".title a").style("display", "none");
                div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
                dimension.filterAll();
            }
        });
        chart.margin = function(_) {
            if (!arguments.length) return margin;
            margin = _;
            return chart;
        };
        chart.x = function(_) {
            if (!arguments.length) return x;
            x = _;
            axis.scale(x);
            brush.x(x);
            return chart;
        };
        chart.y = function(_) {
            if (!arguments.length) return y;
            y = _;
            return chart;
        };
        chart.dimension = function(_) {
            if (!arguments.length) return dimension;
            dimension = _;
            return chart;
        };
        chart.filter = function(_) {
            if (_) {
                brush.extent(_);
                dimension.filterRange(_);
            } else {
                brush.clear();
                dimension.filterAll();
            }
            brushDirty = true;
            return chart;
        };
        chart.group = function(_) {
            if (!arguments.length) return group;
            group = _;
            return chart;
        };
        chart.round = function(_) {
            if (!arguments.length) return round;
            round = _;
            return chart;
        };
        return d3.rebind(chart, brush, "on");
    }
}



















beta_dateChart = function(data) {
    var toMap = [{
        "field": "timeLog.lastSeenDateTime",
        "count": [],
        "label": "Last Seen Date/Time",
        "tableList": false,
        "parent": "timeLog",
        "stats": true,
        "date": true
    }, {
        "field": "timeLog.SARNotifiedDateTime",
        "count": [],
        "label": "SAR Notified Date/Time",
        "tableList": true,
        "parent": "timeLog",
        "stats": false
    }, {
        "field": "timeLog.subjectLocatedDateTime",
        "count": [],
        "label": "Subject Located Date/Time",
        "tableList": true,
        "parent": "timeLog",
        "stats": false
    }, {
        "field": "timeLog.incidentClosedDateTime",
        "count": [],
        "label": "Incident Closed Date/Time",
        "tableList": true,
        "parent": "timeLog",
        "stats": false
    }, {
        "field": "timeLog.totalMissingHours",
        "count": [],
        "label": "Total Missing Hours",
        "tableList": true,
        "parent": "timeLog",
        "stats": true,
        number: true
    }, {
        "field": "timeLog.totalSearchHours",
        "count": [],
        "label": "Total Search Hours",
        "tableList": true,
        "parent": "timeLog",
        "stats": true,
        number: true
    }];
    var toGraph = _.chain(toMap)
        .map(function(d) {
            if (d.stats) {
                return d;
            }
        })
        .compact()
        .value();
    var records = _.chain(data)
        .map(function(d, e) {
            var flat = flatten(d, {});
            return _.pick(flat, toMap.map(function(key) {
                return key.field;
            }));
        })
        .value();
    //records = data;
    var dates = records
    var maxYear = d3.max(records, function(d) {
        return new Date(d['timeLog.lastSeenDateTime']);
    });
    var minYear = d3.min(records, function(d) {
        return new Date(d['timeLog.lastSeenDateTime']);
    });
    // Various formatters.
    var formatNumber = d3.format(",d"),
        formatChange = d3.format("+,d"),
        formatDate = d3.time.format("%B %d, %Y"),
        formatTime = d3.time.format("%I:%M %p");
    //formatDate = d3.time.format("%B %d, %Y"),
    //moment(d.name).format('YYYY-MM-DD')
    // A nest operator, for grouping the record list.
    var nestByDate = d3.nest()
        .key(function(d) {
            return d3.time.day(d.date);
        });
    // A little coercion, since the CSV is untyped.
    records.forEach(function(d, i) {
        //d.index = i;
        //d.date = parseDate(d.date);
        //d.delay = +d.delay;
        //d.distance = +d.distance;
        d.index = i;
        d.date = parseDate(d['timeLog.lastSeenDateTime']);
        d.delay = +d['timeLog.totalMissingHours'];
        //d.distance = +d['findLocation.distanceIPP'];
        d.distance = +d['timeLog.totalSearchHours'];
    });
    // Create the crossfilter for the relevant dimensions and groups.
    record = crossfilter(records);
    var all = record.groupAll();
    var date = record.dimension(function(d) {
        return d.date;
    });
    dates = date.group(d3.time.day);
    var hour = record.dimension(function(d) {
        return d.date.getHours() + d.date.getMinutes() / 60;
    });
    var hours = hour.group(Math.floor);
    var delay = record.dimension(function(d) {
        return d.delay;
        //return Math.max(-60, Math.min(149, d.delay));
    });
    var delays = delay.group(function(d) {
        return Math.floor(d / 10) * 10;
    });
    var distance = record.dimension(function(d) {
        return Math.min(d.distance);
        //return Math.min(1999, d.findLocation.distanceIPP);
    });
    var distances = distance.group(function(d) {
        return Math.floor(d / 50) * 50;
    });
    data = _.chain(toGraph).map(function(d) {
        var delay;
        var delays;
        //if (d.number) {
        delay = record.dimension(function(e) {
            return e[d.field];
            //return Math.max(-60, Math.min(149, d.delay));
        });
        delays = delay.group(function(e) {
            return Math.floor(e / 10) * 10;
        });
        if (d.number) {
            return {
                field: d.field,
                label: d.label,
                chart: barChart()
                    .dimension(delay)
                    .group(delays)
                    .x(d3.scale.linear()
                        .domain([0, d3.max(records, function(e) {
                            return e[d.field];
                        })])
                        .rangeRound([0, 10 * 21]))
            }
        }
        if (d.date) {
            return {
                field: 'findLocation.lastSeenDateTime',
                chart: barChart()
                    .dimension(date)
                    .group(dates)
                    .round(d3.time.day.round)
                    .x(d3.time.scale()
                        .domain([minYear, maxYear])
                        .rangeRound([0, 10 * 90])
                    )
            }
        }
        //}
        /*if (d.field === 'recordInfo.incidentEnvironment') {
            delay = record.dimension(function (e) {
                return e[d.field];
                //return Math.max(-60, Math.min(149, d.delay));
            });
            delays = delay.group(function (e) {
                return Math.floor(e / 10) * 10;
            });
            width = 500;
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1)
                .domain(_.uniq(records.map(function (e) {
                    return e[d.field];
                })))
                //.rangeRound([0, 10 * 21])
            return {
                field: d.field,
                label: d.label,
                chart: barChart()
                    .dimension(delay)
                    .group(delays)
                    .x(d3.scale.linear()
                        .domain([0, d3.max(records, function (e) {
                            return e[d.field];
                        })])
                        .rangeRound([0, 10 * 21]))
            }
        }*/
    }).compact().value();
    var container = d3.select('#charts').append('div').selectAll('div').data(data);
    container.enter().append('div').attr('id', function(d) {
            return d.field.replace('.', '-')
        }).attr('class', 'chart').append('div').attr('class', 'title').text(function(d) {
            return d.label;
        })
        //timeLog.totalSearchHours
    charts = [{
            //field: 'timeLog.totalMissingHours',
            chart: barChart()
                .dimension(hour)
                .group(hours)
                .x(d3.scale.linear()
                    .domain([0, 24])
                    .rangeRound([0, 10 * 24]))
        }, {
            field: 'timeLog.totalMissingHours',
            chart: barChart()
                .dimension(delay)
                .group(delays)
                .x(d3.scale.linear()
                    .domain([0, d3.max(records, function(d) {
                        return d['timeLog.totalMissingHours'];
                    })])
                    .rangeRound([0, 10 * 21]))
        }, {
            field: 'findLocation.distanceIPP',
            chart: barChart()
                .dimension(distance)
                .group(distances)
                .x(d3.scale.linear()
                    .domain([0, d3.max(records, function(d) {
                        return d['findLocation.distanceIPP'];
                    })])
                    .rangeRound([0, 10 * 40]))
        }, {
            field: 'findLocation.lastSeenDateTime',
            chart: barChart()
                .dimension(date)
                .group(dates)
                .round(d3.time.day.round)
                .x(d3.time.scale()
                    .domain([minYear, maxYear])
                    .rangeRound([0, 10 * 90])
                )
        }
        //.filter([new Date(2001, 1, 1), new Date(2001, 2, 1)])
    ];
    charts = [];
    charts = _.flatten([charts, data]);
    // Given our array of charts, which we assume are in the same order as the
    // .chart elements in the DOM, bind the charts to the DOM and render them.
    // We also listen to the chart's brush events to update the display.
    var chart = d3.selectAll(".chart")
        .data(charts.map(function(d) {
            return d.chart;
        }))
        .each(function(chart) {
            chart.on("brush", renderAll).on("brushend", renderAll);
        });
    d3.selectAll("#total")
        .text(formatNumber(record.size()));
    renderAll();
    // Renders the specified chart or list.
    function render(method) {
            d3.select(this).call(method);
        }
        // Whenever the brush moves, re-rendering everything.
    function renderAll() {
            chart.each(render);
            list.each(render);
            d3.select("#active").text(formatNumber(all.value()));
        }
        // Like d3.time.format, but faster.
    function parseDate(d) {
        return new Date(d);
        return new Date(2001,
            d.substring(0, 2) - 1,
            d.substring(2, 4),
            d.substring(4, 6),
            d.substring(6, 8));
    }
    window.filter = function(filters) {
        filters.forEach(function(d, i) {
            charts[i].filter(d);
        });
        renderAll();
    };
    window.reset = function(i) {
        charts[i].filter(null);
        renderAll();
    };

    function barChart() {
        if (!barChart.id) {
            barChart.id = 0;
        }
        var margin = {
                top: 10,
                right: 10,
                bottom: 20,
                left: 10
            },
            x,
            y = d3.scale.linear().range([100, 0]),
            id = barChart.id++,
            axis = d3.svg.axis().orient("bottom"),
            brush = d3.svg.brush(),
            brushDirty,
            dimension,
            group,
            round;

        function chart(div) {
            //console.log(div.node(),x.range(),y.range())
            var width = x.range()[1],
                height = y.range()[0];
            y.domain([0, group.top(1)[0].value]);
            div.each(function() {
                var div = d3.select(this),
                    g = div.select("g");
                // Create the skeletal chart.
                if (g.empty()) {
                    div.select(".title").append("a")
                        .attr("href", "javascript:reset(" + id + ")")
                        .attr("class", "reset")
                        .text("reset")
                        .style("display", "none");
                    g = div.append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    g.append("clipPath")
                        .attr("id", "clip-" + id)
                        .append("rect")
                        .attr("width", width)
                        .attr("height", height);
                    g.selectAll(".bar")
                        .data(["background", "foreground"])
                        .enter().append("path")
                        .attr("class", function(d) {
                            return d + " bar";
                        })
                        .datum(group.all());
                    g.selectAll(".foreground.bar")
                        .attr("clip-path", "url(#clip-" + id + ")");
                    g.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(axis);
                    // Initialize the brush component with pretty resize handles.
                    var gBrush = g.append("g").attr("class", "brush").call(brush);
                    gBrush.selectAll("rect").attr("height", height);
                    gBrush.selectAll(".resize").append("path").attr("d", resizePath);
                }
                // Only redraw the brush if set externally.
                if (brushDirty) {
                    brushDirty = false;
                    g.selectAll(".brush").call(brush);
                    div.select(".title a").style("display", brush.empty() ? "none" : null);
                    if (brush.empty()) {
                        g.selectAll("#clip-" + id + " rect")
                            .attr("x", 0)
                            .attr("width", width);
                    } else {
                        var extent = brush.extent();
                        g.selectAll("#clip-" + id + " rect")
                            .attr("x", x(extent[0]))
                            .attr("width", x(extent[1]) - x(extent[0]));
                    }
                }
                g.selectAll(".bar").attr("d", barPath);
            });

            function barPath(groups) {
                var path = [],
                    i = -1,
                    n = groups.length,
                    d;
                while (++i < n) {
                    d = groups[i];
                    path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
                }
                return path.join("");
            }

            function resizePath(d) {
                var e = +(d == "e"),
                    x = e ? 1 : -1,
                    y = height / 3;
                return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
            }
        }
        brush.on("brushstart.chart", function() {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.select(".title a").style("display", null);
        });
        brush.on("brush.chart", function() {
            var g = d3.select(this.parentNode),
                extent = brush.extent();
            if (round) g.select(".brush")
                .call(brush.extent(extent = extent.map(round)))
                .selectAll(".resize")
                .style("display", null);
            g.select("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
            //console.log(extent)
            dimension.filterRange(extent);
            Session.set('dateExtent', extent);
            e = extent;
            rr = records
        });
        brush.on("brushend.chart", function() {
            var extent = Session.get('dateExtent');
            var dateRange = records.filter(function(d) {
                return new Date(d.date) >= extent[0] && new Date(d.date) <= extent[1]
            });
            Session.set('dateRange', dateRange);
            drawAllGraphs(dateRange);
            if (brush.empty()) {
                var div = d3.select(this.parentNode.parentNode.parentNode);
                div.select(".title a").style("display", "none");
                div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
                dimension.filterAll();
            }
        });
        chart.margin = function(_) {
            if (!arguments.length) return margin;
            margin = _;
            return chart;
        };
        chart.x = function(_) {
            if (!arguments.length) return x;
            x = _;
            axis.scale(x);
            brush.x(x);
            return chart;
        };
        chart.y = function(_) {
            if (!arguments.length) return y;
            y = _;
            return chart;
        };
        chart.dimension = function(_) {
            if (!arguments.length) return dimension;
            dimension = _;
            return chart;
        };
        chart.filter = function(_) {
            if (_) {
                brush.extent(_);
                dimension.filterRange(_);
            } else {
                brush.clear();
                dimension.filterAll();
            }
            brushDirty = true;
            return chart;
        };
        chart.group = function(_) {
            if (!arguments.length) return group;
            group = _;
            return chart;
        };
        chart.round = function(_) {
            if (!arguments.length) return round;
            round = _;
            return chart;
        };
        return d3.rebind(chart, brush, "on");
    }
}
var d3Calender = function(context, data1) {
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
        .range(d3.range(11)
            .map(function(d) {
                return "q" + d + "-11";
            }));
    var maxYear = +moment(_.max(data1, function(e) {
                return moment(e.name)
            })
            .name)
        .format('YYYY') + 1;
    var minYear = +moment(_.min(data1, function(e) {
                return moment(e.name)
            })
            .name)
        .format('YYYY');
    var svg = d3.select(context)
        .selectAll("svg")
        .data(d3.range(minYear, maxYear))
        .enter()
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "col-md-12 RdYlGn pad00")
        .append("g")
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");
    svg.append("text")
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d;
        });
    var rect = svg.selectAll(".day")
        .data(function(d) {
            return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
        })
        .enter()
        .append("rect")
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) {
            return week(d) * cellSize;
        })
        .attr("y", function(d) {
            return day(d) * cellSize;
        })
        .datum(format);
    rect.append("title")
        .text(function(d) {
            return d;
        });
    svg.selectAll(".month")
        .data(function(d) {
            return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
        })
        .enter()
        .append("path")
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
    d3.select(self.frameElement)
        .style("height", "2910px");
    var data = d3.nest()
        .key(function(d) {
            return moment(d.name)
                .format('YYYY-MM-DD')
        })
        .rollup(function(d) {
            return -0.003689859718846812;
            return Math.random() * 1000;
            return d[0].data
        })
        .map(data1);
    rect.filter(function(d) {
            return d in data;
        })
        .attr("class", function(d) {
            return "day q7-11";
        })
        .select("title")
        .text(function(d) {
            return d + ": " + percent(data[d]);
        });
};
var stackedBar = function(d, color, context) {
    z = d;
    var data = _.chain(d.count)
        .map(function(e, name) {
            var _data = e.data;
            var keys = _.keys(_data);
            if (keys.length > 20) {
                return;
            }
            var sortedData = _.chain(_data)
                .map(function(f, name2) {
                    return {
                        name: name2,
                        data: f
                    };
                })
                .sortBy(data, function(a, b) {
                    return a.length;
                })
                .value();
            var newData = _.object(_.map(sortedData, function(x) {
                return [x.name, x.data];
            }));
            newData.name = e.name;
            return newData;
        })
        .compact()
        .value();
    //return {data:a.length,name,b}
    dd = data;
    var options = d.options || {};
    var title = options.label || '';
    var id = options.field || Math.random()
        .toString()
        .slice(2);
    var klass = options.klass || 'col-md-12 pad00';
    var h = options.height || 300;
    var margin = {
        top: 20,
        right: 20,
        bottom: 80,
        left: 40
    };
    // var width = 960 - margin.left - margin.right;
    // var height = 500 - margin.top - margin.bottom;
    var container = context
        .append("div")
        .attr('class', klass);
    var brighter = d3.rgb(color)
        .brighter(1)
        .toString();
    var brighter2 = d3.rgb(color)
        .brighter(2)
        .toString();
    var darker = d3.rgb(color)
        .darker(1)
        .toString();
    var width = parseInt(container.style('width')); // / 1;
    width = width - margin.left - margin.right;
    var height = (width / 2) - margin.top - margin.bottom;
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
        //.tickFormat(d3.format(".2s"));
    var svg = context
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    colorCont = {};
    data.forEach(function(d, i) {
        var color = d3.scale.ordinal()
            .range(["#5D2E2C", "#6E3B49", "#744F6A", "#6B6788", "#53819D", "#3799A2", "#3AB098", "#67C283", "#A1D06B", "#E2D85D"]);
        color.domain(d3.keys(d)
            .filter(function(key) {
                return key;
            }));
        colorCont[d.name] = color;
        var y0 = 0;
        d.ages = color.domain()
            .map(function(name) {
                return {
                    name: name,
                    y0: y0,
                    y1: y0 += +d[name].length
                };
            });
        d.total = d.ages[d.ages.length - 1].y1;
    });
    data.sort(function(a, b) {
        return b.total - a.total;
    });
    /*data.forEach(function (e) {
        e.sort(function (a, b) {
            return b.total;
        });
    });*/
    x.domain(data.map(function(d) {
        return d.name;
    }));
    y.domain([0, d3.max(data, function(d) {
        return d.total;
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
        .text("Population");
    var state = svg.selectAll(".state")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "g")
        .attr("transform", function(d) {
            return "translate(" + x(d.name) + ",0)";
        });
    rect = state.selectAll("rect")
        .data(function(d) {
            return d.ages;
        })
        .enter()
        .append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d) {
            return y(d.y1);
        })
        .attr("height", function(d) {
            return y(d.y0) - y(d.y1);
        })
        .style("fill", function(d) {
            var parent = d3.select(this.parentNode)
                .datum()
                .name;
            return colorCont[parent](d.name);
        })
        .on("mouseover", function(d) {
            //console.log(this);
            self = d3.select(this);
            var parent = d3.select(this.parentNode)
            coordinates = d3.mouse(this);
            var xPos = coordinates[0];
            var yPos = coordinates[1];
            self.style("stroke", brighter)
                .attr("stroke-width", 3);
            parent.append("text")
                .attr("x", xPos + 3)
                .attr("y", yPos + 3)
                .attr("class", "tooltips")
                .text(function(d) {
                    var name = self.datum().name;
                    var count = parent.datum()[name];
                    return name + '-' + count.length;
                });
            // }
        })
        .on("mouseout", function() {
            var self = d3.select(this);
            svg.select(".tooltips")
                .remove();
            self.attr("stroke-width", 0);
        })
    svg.selectAll(".x.axis .tick text")
        .style("text-anchor", "end")
        .attr("dx", "-.5em")
        .attr("transform", function(d) {
            return "rotate(-15)";
        });
};
var _drawGraph = function(d, color, context) {
    console.log(d)
    var data = d.count;
    var options = d.options || {};
    var title = options.label;
    var id = options.field || Math.random()
        .toString()
        .slice(2);
    var numItems = data.length;
    var klass = options.klass || 'col-sm-4 pad00 _borderTop _default-border';
    var h = options.height || 300;
    console.log(h)
    var margin = {
        top: 40,
        right: 10,
        bottom: 10,
        left: 10
    };
    var container = context
        .append("div")
        .attr('class', klass);
    var brighter = d3.rgb(color)
        .brighter(1)
        .toString();
    var brighter2 = d3.rgb(color)
        .brighter(2)
        .toString();
    var darker = d3.rgb(color)
        .darker(1)
        .toString();
    var width = parseInt(container.style('width')); // / 1;
    width = width - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, height], .1);
    var y = d3.scale.linear()
        .rangeRound([width, 0]);
    var svg1 = container.append("svg")
        .style('background', function(d) {
            return color
        })
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    svg1.append("linearGradient")
        .attr("id", "temperature-gradient" + id)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", '0%')
        .attr("y1", '0%')
        .attr("x2", '80%')
        .attr("y2", '0%')
        .selectAll("stop")
        .data([{
            offset: "0%",
            color: color
        }, {
            offset: "80%",
            color: brighter
        }])
        .enter()
        .append("stop")
        .attr("offset", function(d) {
            return d.offset;
        })
        .attr("stop-color", function(d) {
            return d.color;
        });
    svg1.append('g')
        .append("text")
        .attr("transform", "translate(3," + margin.top / 2 + ")")
        .attr("class", "title")
        .attr("text-anchor", "left")
        .text(title)
        .attr('fill', brighter2);
    var svg = svg1.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    x.domain(data.map(function(d) {
        return d.name;
    }));
    y.domain([0, d3.max(data, function(d) {
        return d.data;
    })]);
    bar = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", function(d) {
            return "translate(" + 0 + "," + x(d.name) + ")";
        });
    bar.append("rect")
        .attr("class", "_bar")
        .attr("height", x.rangeBand())
        .attr("width", function(d) {
            return width - y(d.data);
        })
        .attr('stroke', brighter)
        .attr('fill', 'url(#temperature-gradient' + id + ')')
    bar.append("text")
        .attr('fill', brighter2)
        .attr("dy", ".75em")
        .attr("y", x.rangeBand() / 2)
        .attr("x", function(d) {
            return width / 2;
        })
        .attr("text-anchor", "middle")
        .text(function(d) {
            return d.name + ' (' + d.data + ')';
        });
}
