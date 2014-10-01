'use strict';


var SARCAT = function() {
    var sarcat = {};
    sarcat.config = {};
    var appendInput = function(d, elem, horz) {
        var div = d3.select(elem);
        var type = d.type;
        type = (type === 'select' && d.vals.length < 6) ? 'radio' : type;
        var activeVal = d.value;
        if (horz) {
            div = div.append('div').attr('class', 'col-xs-6');
            div.append('h4').attr('class', 'control-label').style('text-align', 'left').text(function() {
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
            var select = div.append('select').attr('class', 'form-control');
            select.selectAll('option').data(d.vals).enter().append('option').attr('value', function(e) {
                return e;
            }).text(function(e) {
                return e;
            });
            var index = d.vals.indexOf(activeVal);
            select.property('selectedIndex', index);
        }
        if (type === 'text') {
            div.append('input').attr('type', 'text').attr('class', 'form-control').attr('placeholder', function() {
                return d.name;
            });
        }
        if (type === 'number') {
            div.append('input').attr('type', 'number').attr('class', 'form-control').attr('value', activeVal);
        }
        if (type === 'radio') {
            div = div.append('div').classed('btn-group', true).attr('data-toggle', 'buttons');
            var radios = div.selectAll('radio').data(d.vals);
            var labels = radios.enter().append('label').attr('class', function(e) {
                var _active = (activeVal === e) ? 'active' : '';
                return 'btn btn-primary ' + _active;
            });
            labels.text(function(d) {
                return d;
            });
            labels.append('input').attr('type', 'radio').attr('name', function() {
                return d.name;
            });
        }
        if (type === 'date') {
            var date = new Date().toISOString().substr(0, 10);
            div.append('input').attr('type', 'date').attr('class', 'form-control').attr('value', date);
        }
        if (type === 'textarea') {
            div.append('textarea').attr('class', 'form-control').attr('rows', '3').attr('placeholder', function() {
                return d.placeholder;
            });
        }
    };
    var generatePage = function(d) {
        var tabs = d.config;
        var form = d3.select('body').append('div').attr('id', 'form-container').attr('class', 'container');
        form.append('div').attr('class', 'page-header');
        form.append('h3').html('SARCAT <small>Missing persons database entry.</small>');
        var progress = form.append('div').attr('class', 'row pad0');
        progress.append('div').attr('class', 'col-md-12 paxd5').append('div').attr('class', 'progress').append('div').attr('class', 'progress-bar progress-bar-info progress-bar-striped').text(
            '0%');
        progress.append('div').attr('class', 'col-md-12 pad5y').append('div').attr('class', 'step');
        var formContainer = form.append('div').attr('class', 'row formContainer').append('div').attr('class', function() {
            return 'col-md-12 formFill';
        }).selectAll('form').data(tabs);
        var formData = formContainer.enter().append('form').attr('class', function(d, i) {
            var vis = (i === 0) ? 'step' + d.step : '_hidden step' + d.step;
            return 'col-md-12 form-horizontal ' + vis;
        });
        formData.append('legend').text(function(d) {
            return d.name;
        });
        formData.select(function(d) {
            var inputs = d.data || [];
            var inputDiv = d3.select(this).selectAll('div').data(inputs).enter().append('div').attr('class', 'form-group pad5').append('div').attr('class',
                'col-md-12 pad5 form-group-style');
            inputDiv.append('label').attr('class', 'control-label col-xs-2').text(function(d) {
                return d.name;
            });
            inputDiv.append('div').attr('class', 'col-xs-10').select(function(d) {
                appendInput(d, this);
            });
        });
        var steps = d3.select('.step').selectAll('p').data(tabs);
        var step = steps.enter().append('div').attr('class', function(d, i) {
            return i === 0 ? 'activestep steps btnStep' + i : 'steps btnStep' + i;
        }).on('click', function(e, i) {
            formContainer.classed('hidden', true);
            formContainer.each(function(d) {
                if (d.step === e.step) {
                    d3.select(this).classed('hidden', false);
                }
            });
            var elem = d3.select(this);
            var percent = i * 10;
            d3.select('.progress-bar').style('width', percent + '%').attr('aria-valuenow', percent).text(percent + '%');
            step.classed('activestep', false);
            elem.classed('activestep', true);
        });
        step.append('span').attr('class', 'glyphicon glyphicon-ok btn-md');
        step.append('h6').text(function(d) {
            return d.name;
        });
    };
    var addMap = function(elem, callback) {
        elem.insert('div', ':first-child').attr('id', 'map').style({
            height: '500px',
            width: '100%'
        });
        L.mapbox.accessToken = 'pk.eyJ1IjoibWFwcGlza3lsZSIsImEiOiJ5Zmp5SnV3In0.mTZSyXFbiPBbAsJCFW8kfg';
        L.mapbox.map('map', 'examples.map-i86nkdio').setView([40, -74.50], 9);
        if (callback) {
            callback();
        }
    };
    sarcat.login = function() {
        sarcat.dashboard();
    };
    sarcat.generateLoginPage = function() {
        var login = d3.select('body').append('div').attr('class', 'login');
        var introtText = login.append('div').attr('class', 'intro-text');
        introtText.append('div').attr('class', 'intro-lead-in').text('Missing persons database entry.');
        introtText.append('div').attr('class', 'iintro-heading').text('SARCAT');
        var form = login.append('div').attr('class', 'wrapper').append('form').attr('class', 'form-signin');
        form.append('h2').attr('class', 'form-signin-heading').text('Login');
        form.append('input').attr('autofocus', '').attr('class', 'form-control').attr('name', 'username').attr('value', 'SARCATUser@sarcat.org').attr('type', 'text').attr('required', '');
        form.append('input').attr('autofocus', '').attr('class', 'form-control').attr('name', 'username').attr('value', 'aaaaaa').attr('type', 'password').attr('required', '');
        var remember = form.append('label').attr('class', 'checkbox');
        remember.append('input').attr('type', 'checkbox');
        remember.append('p').text('Remember Me');
        form.append('button').attr('class', 'btn btn-lg btn-primary btn-block demoLogin').attr('type', 'button').text('Login').on('click', function() {
            sarcat.login();
        });
        form.append('button').attr('class', 'btn btn-lg btn-default btn-block demoLogin').attr('type', 'button').text('Not Registered?');
    };
    sarcat.dashboard = function() {
        d3.json('data/login.json', function() {
            d3.select('.wrapper').style({
                display: 'none'
            });
            /*var data = d.login;*/
            var elem = d3.select('.login').append('div').attr('class', 'form-welcome');
            elem.append('h1').text('Welcome User!');
            elem.append('hr');
            /*
        elem.append('h3').text('Recent Records');
    var list = elem.append('div').attr('class', 'col-md-12').append('div')
        .attr('class', 'list-group')
        .selectAll('a')
        .data(data);
    var a = list.enter()
        .append('a')
        .attr('href', '#')
        .attr('class', function(d) {
            var status = d.status == 'incomplete' ? 'list-group-item-danger' : 'list-group-item-success';
            return 'list-group-item ' + status;
        });
    a.append('h4')
        .attr('class', 'list-group-item-heading')
        .text(function(d) {
            return d.name;
        });
    a.append('div')
        .attr('class', 'list-group-item-text')
        .text(function(d) {
            return d.date;
        });*/
            elem.append('button').attr('type', 'button').attr('class', 'btn btn-primary btn-lg btn-block').text('Create New Record').on('click', function() {
                sarcat.generateForm();
            });
            elem.append('button').attr('type', 'button').attr('class', 'btn btn-default btn-lg btn-block').text('Edit Existing Record');
        });
    };
    sarcat.generateForm = function() {
        d3.json('data/config.json', function(d) {
            d3.select('.login').style({
                display: 'none'
            });
            generatePage(d);
            addMap(d3.select('.step2'), function() {$('.btnStep0').click();});
        });
    };
    return sarcat;
};




(function() {
    var sarcat = SARCAT();
    sarcat.generateLoginPage();





    /*d3.select('.demoLogin').on('click', function() {
        sarcat.dashboard();
        sarcat.generateForm();
        window.location.hash = '#sarcat';
        location.reload();
    });
    if (window.location.hash == '#sarcat') {
        sarcat.generateForm();
    }*/
})();
