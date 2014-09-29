'use strict';
//$('#myModal').modal();


var generatePage = function(d) {
    var tabs = d.config;
    var appendInput = function(d, elem, horz) {
        var div = d3.select(elem);
        var type = d.type;
        type = (type === 'select') ? 'radio' : type;
        if (horz) {
            div = div.append('div')
                .attr('class', 'col-xs-6');
            div.append('h4')
                .attr('class', 'control-label')
                .style('text-align', 'left')
                .text(function() {
                    return d.name;
                });
        }
        if (d.data) {
            d.data.forEach(function(e) {
                appendInput(e, elem, true);
            });
            return;
        }
        if (type === 'select') {
            var select = div.append('select')
                .attr('class', 'form-control');
            select.selectAll('option')
                .data(d.vals)
                .enter()
                .append('option')
                .attr('value', function(e) {
                    return e;
                })
                .text(function(e) {
                    return e;
                });
        }
        if (type === 'text') {
            div.append('input')
                .attr('type', 'text')
                .attr('class', 'form-control')
                .attr('placeholder', function() {
                    return d.name;
                });
        }
        if (type === 'number') {
            div.append('input')
                .attr('type', 'number')
                .attr('class', 'form-control')
                .attr('placeholder', function() {
                    return d.name;
                });
        }
        if (type === 'radio') {
            div = div.append('div')
                .classed('btn-group', true)
                .attr('data-toggle', 'buttons');
            var radios = div.selectAll('radio')
                .data(d.vals);
            var labels = radios.enter()
                .append('label')
                .attr('class', 'btn btn-primary');
            labels.text(function(d) {
                return d;
            });
            labels.append('input')
                .attr('type', 'radio')
                .attr('name', function() {
                    return d.name;
                });
        }
        if (type === 'date') {
            div.append('input')
                .attr('type', 'date')
                .attr('class', 'form-control')
                .attr('placeholder', function() {
                    return d.name;
                });
        }
        if (type === 'textarea') {
            div.append('textarea')
                .attr('class', 'form-control')
                .attr('rows', '3')
                .attr('placeholder', function() {
                    return d.placeholder;
                });
        }
    };
    var formContainer = d3.select('.formContainer')
        .append('div')
        .attr('class', function() {
            return 'col-md-12 formFill';
        })
        .selectAll('form')
        .data(tabs);
    var formData = formContainer.enter()
        .append('form')
        .attr('class', function(d, i) {
            var vis = (i === 0) ? '' : '_hidden';
            return 'form-horizontal ' + vis;
        });
    formData.append('legend')
        .text(function(d) {
            return d.name;
        });
    formData.select(function(d) {
        var inputs = d.data || [];
        var inputDiv = d3.select(this)
            .selectAll('div')
            .data(inputs)
            .enter()
            .append('div')
            .attr('class', 'form-group pad5')
            .append('div')
            .attr('class', 'col-md-12 pad5 form-group-style');
        inputDiv.append('label')
            .attr('class', 'control-label col-xs-2')
            .text(function(d) {
                return d.name;
            });
        inputDiv.append('div')
            .attr('class', 'col-xs-10')
            .select(function(d) {
                appendInput(d, this);
            });
    });
    var steps = d3.select('.step')
        .selectAll('p')
        .data(tabs);
    var step = steps.enter()
        .append('div')
        .attr('class', function(d, i) {
            return i === 0 ? 'activestep steps' : 'steps';
        })
        .on('click', function(e, i) {
            formContainer.classed('_hidden', true);
            formContainer.each(function(d) {
                if (d.step === e.step) {
                    d3.select(this)
                        .classed('_hidden', false);
                }
            });
            var elem = d3.select(this);
            var percent = i * 10;
            d3.select('.progress-bar')
                .style('width', percent + '%')
                .attr('aria-valuenow', percent)
                .text(percent + '%');
            step.classed('activestep', false);
            elem.classed('activestep', true);
        });
    step.append('span')
        .attr('class', 'glyphicon glyphicon-ok btn-md');
    step.append('h6')
        .text(function(d) {
            return d.name;
        });
};



d3.json('data/config.json',function(d){generatePage(d);});


