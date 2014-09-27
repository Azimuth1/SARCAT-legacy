'use strict';
$('#myModal').modal();
var config = config || null;
var tabs = config.tabs;
var step1 = config.step1;
var appendInput = function(d, elem, horz) {
        var div = d3.select(elem);
        if (horz) { //console.log(d);
                div.append('label').attr('class', 'control-label col-xs-3').style('text-align', 'left').text(function() {
                        return d.name;
                });
        }
        if (d.data) {
                d.data.forEach(function(e) {
                        appendInput(e, elem, true);
                });
                return;
        }
        if (d.type === 'select') {
                var select = div.append('select').attr('class', 'form-control');
                select.selectAll('option').data(d.vals).enter().append('option').attr('value', function(e) {
                        return e;
                }).text(function(e) {
                        return e;
                });
        }
        if (d.type === 'text') {
                div.append('input').attr('type', 'text').attr('class', 'form-control').attr('placeholder', function() {
                        return d.name;
                });
        }
        if (d.type === 'radio') {
                div.classed('btn-group', true).attr('data-toggle', 'buttons');
                var radios = div.selectAll('radio').data(d.vals);
                var labels = radios.enter().append('label').attr('class', 'btn btn-primary');
                labels.text(function(d) {
                        return d;
                });
                labels.append('input').attr('type', 'radio').attr('name', function() {
                        return d.name;
                });
        }
};
var steps = d3.select('.step').selectAll('p').data(tabs);
var step = steps.enter().append('div').attr('class', function(d, i) {
        return i === 0 ? 'activestep steps' : 'steps';
}).on('click', function(elem, i) {
        elem = d3.select(this);
        var percent = i * 10;
        $('.progress-bar').css('width', percent + '%').attr('aria-valuenow', percent).text(percent + '%');
        step.classed('activestep', false);
        elem.classed('activestep', true);
});
step.append('span').attr('class', 'glyphicon glyphicon-ok btn-md');
step.append('h6').text(function(d) {
        return d;
});
var formData = d3.select('.formFill').append('form').attr('class', 'form-horizontal');
formData.append('legend').text('Initial Incident Information');
formData = formData.selectAll('form-group').data(step1);
var formGroup = formData.enter().append('div').attr('class', 'form-group pad5').append('div').attr('class', 'col-md-12 pad5 form-group-style');
formGroup.append('label').attr('class', 'control-label col-xs-3').text(function(d) {
        return d.name;
});
formGroup.append('div').attr('class', 'col-xs-9').select(function(d) {
        appendInput(d, this);
});