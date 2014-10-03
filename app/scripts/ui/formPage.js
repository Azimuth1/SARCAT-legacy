sarcat.formPage = function(context, data) {
    var appendInput = function(d, elem, horz) {
        var div = d3.select(elem);
        var type = d.type;
        type = (type === 'select' && d.vals.length < 6) ? 'radio' : type;
        var activeVal = d.value;
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
            var index = d.vals.indexOf(activeVal);
            select.property('selectedIndex', index);
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
                .attr('value', activeVal);
        }
        if (type === 'radio') {
            div = div.append('div')
                .classed('btn-group', true)
                .attr('data-toggle', 'buttons');
            var radios = div.selectAll('radio')
                .data(d.vals);
            var labels = radios.enter()
                .append('label')
                .attr('class', function(e) {
                    var _active = (activeVal === e) ? 'active' : '';
                    return 'btn btn-primary ' + _active;
                });
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
            var date = new Date()
                .toISOString()
                .substr(0, 10);
            div.append('input')
                .attr('type', 'date')
                .attr('class', 'form-control')
                .attr('value', date);
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
    var tabs = data;
    var form = context.append('div')
        .attr('id', 'form-container')
        .attr('class', 'container');
    form.append('div')
        .attr('class', 'page-header');
    form.append('h3')
        .html('SARCAT <small>Missing persons database entry.</small>');
    var progress = form.append('div')
        .attr('class', 'row pad0');
    progress.append('div')
        .attr('class', 'col-md-12 paxd5')
        .append('div')
        .attr('class', 'progress')
        .append('div')
        .attr('class', 'progress-bar progress-bar-info progress-bar-striped')
        .text('0%');
    progress.append('div')
        .attr('class', 'col-md-12 pad5y')
        .append('div')
        .attr('class', 'step');
    var formContainer = form.append('div')
        .attr('class', 'row formContainer')
        .append('div')
        .attr('class', function() {
            return 'col-md-12 formFill';
        })
        .selectAll('form')
        .data(tabs);
    var formData = formContainer.enter()
        .append('form')
        .attr('class', function(d, i) {
            var vis = (i === 0) ? 'step' + d.step : '_hidden step' + d.step;
            return 'col-md-12 form-horizontal ' + vis;
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
            return i === 0 ? 'activestep steps btnStep' + i : 'steps btnStep' + i;
        })
        .on('click', function(e, i) {
            formContainer.classed('hidden', true);
            formContainer.each(function(d) {
                if (d.step === e.step) {
                    d3.select(this)
                        .classed('hidden', false);
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
    sarcat.map(d3.select('.step2'), function() {
        $('.btnStep0')
            .click();
    });
};