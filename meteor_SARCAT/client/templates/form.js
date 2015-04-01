var firstRender = true;
listFadeInHold = null;
var weather = false;
var config;
var record;
var map;
Template.registerHelper("Schemas", Schemas);

var getCoords = function () {

    var mapPoints = [{
        "val": "ippCoordinates",
        "name": "coords.ippCoordinates",
        "text": "IPP Location",
    }, {
        "val": "decisionPointCoord",
        "name": "coords.decisionPointCoord",
        "text": "Decision Point"
    }, {
        "val": "destinationCoord",
        "name": "coords.destinationCoord",
        "text": "Subject Destination"
    }, {
        "val": "revisedLKP-PLS",
        "name": "coords.revisedLKP-PLS",
        "text": "Revised IPP"
    }, {
        "val": "findCoord",
        "name": "coords.findCoord",
        "text": "Find Location"
    }];

    mapPoints = _.object(_.map(mapPoints, function (x) {
        return [x.val, x];
    }));

    var record = Session.get('currentRecord');
    if (!record.coords) {
        return mapPoints;
    }
    var coords = record.coords;

    _.each(mapPoints, function (d, e) {
        mapPoints[e].coords = coords[e];

    });
    return _.map(mapPoints, function (d) {
        return d;
    });

};

Template.form.created = function () {
    config = Session.get('config');
    record = this.data.record;
    Session.set('currentRecord', record);
};
Template.form.rendered = function () {
    var coords = record.coords;
    var agencyProfile = config.agencyProfile;
    var center = coords.ippCoordinates;
    map = formSetMap('formMap', center);

    a = map

    var coords = getCoords();
    console.log(coords);
    coords.forEach(function (d) {
        if (d.coords) {
            $('[data="' + d.val + '"]').addClass('active');
            map.addPoint(d);
        }

    });

    /*
    var weatherCoords;

    if (coords && coords.ippCoordinates) {
        weatherCoords = coords.ippCoordinates;
    } else {
        weatherCoords = config.agencyProfile.coordinates;
    }

    if (!record.weather) {

        getWeather(weatherCoords, null, function(data) {
            Session.set('weather', data);
            var data = data.currently;
            _.each(data, function(d, name) {
                $('[name="weather.' + name + '"]')
                    .val(d);
            })
        });
    }

    var agencyProfile = config.agencyProfile;
*/
    //var center = weatherCoords;

    Session.set('userView', this.data.record._id);
    $('.collapse')
        .collapse({
            toggle: false
        });

    /*
        var data = {
            "time": 1426269221,
            "summary": "Windy and Mostly Cloudy",
            "icon": "wind",
            "precipIntensity": 0,
            "precipProbability": 0,
            "temperature": 44.09,
            "apparentTemperature": 33.76,
            "dewPoint": 1.66,
            "humidity": 0.17,
            "windSpeed": 31.77,
            "windBearing": 218,
            "cloudCover": 0.6,
            "pressure": 1021.8,
            "ozone": 345.58
        };
        data = _.map(data, function(d, e) {
            return {
                key: e,
                val: d
            };
        });

        console.log(data);

        var tbl_body = '';
        var odd_even = false;
        $.each(data, function() {
            var tbl_row = '';
            $.each(this, function(k, v) {
                tbl_row += '<td>' + v + '</td>';
            })
            tbl_body += '<tr class=\'' + (odd_even ? 'odd' : 'even') + '\'>' + tbl_row + '</tr>';
            odd_even = !odd_even;
        });

        $('#target_table_id').html(tbl_body);*/
};
Template.form.helpers({
    formType: function () {
        var highRole = Roles.userIsInRole(Meteor.user(), ['admin', 'editor']);
        return highRole ? 'update' : 'disabled';
    },
    todosReady: function () {
        return true;
    },
    getObj: function (obj, name) {
        return obj[name];
    },
    getData: function (obj, name) {
        return this.data.record;
    },
    current: function () {
        return Records.findOne(this.record._id)
    },
    Schemas: function () {
        return Schemas;
    },
    Records: function () {
        return Records;
    },
    currentRecord: function () {
        return Session.get('currentRecord');
    },
    formComplete: function (name) {
        var name = this.field;
        var record = this.doc;
        if (!record) {
            return;
        }
        var formLen = _.filter(record, function (d) {
                var val = d;
                if (val === '' || !val) {
                    val = false;
                }
                return val;
            })
            .length;
        var schemaLen = Schemas[name]._schemaKeys.length;
        var complete = (formLen === schemaLen);
        return formLen + '/' + schemaLen;
    },
    formId: function (name) {
        return 'af_' + this.field;
    },
    autoSaveMode: function () {
        return true;
    },
    isSchema: function (obj, obj2) {
        return obj === obj2;
    },
    arrRecord: function (val) {
        if (!this.record) {
            return;
        }
        result = [];
        var use = ['recordInfo', 'coords', 'incident', 'weather', 'subjects', 'timeLog', 'incidentOperations', 'incidentOutcome', 'medical', 'resources'];
        var record = this.record;
        _.each(use, function (d) {
            if (record[d]) {
                result.push({
                    name: d,
                    value: record[d]
                });
            }
        });
        return val ? record[val] : result;
    },
    arrRecords: function () {
        if (!this.record) {
            return;
        }
        var record = this.record;
        return _.chain(record)
            .map(function (d, key) {
                if (_.isObject(d)) {
                    return _.map(d, function (d2, key2) {
                        return {
                            name: key + '.' + key2,
                            //name: 'Schemas.'+key2,
                            val: d2
                        };
                    });
                }
            })
            .flatten()
            .compact()
            .value();
    },
    schemas: function () {
        var record = this.record;
        //'incidentOperations'
        var schemas = ['recordInfo', 'recordInfo', 'incident', 'weather', 'subjects', 'timeLog', 'incidentOutcome', 'medical', 'resources'];
        return schemas.map(function (d) {
            return {
                field: d,
                doc: record[d]
            };
        });
    },
});
var editList = function (list, template) {
    Tracker.flush();
    template.$('.js-edit-form input[type=text]')
        .focus();
    var name = template.$('[name=name]')
        .val();
    Meteor.call('updateRecords', list._id, name, function (err) {
        console.log(err);
    });
};
var saveList = function (list, template) {
    //Session.set(EDITING_KEY, false);
    var name = template.$('[name=name]')
        .val();
    Meteor.call('updateRecords', list._id, name, function (err) {
        console.log(err);
    });
};
var deleteList = function (list) {
    if (list.userId !== Meteor.userId()) {
        return alert('Sorry, You can only delete lists you created!');
    }
    var message = 'Are you sure you want to delete the list ' + list.name + '?';
    if (confirm(message)) {
        Meteor.call('removeRecord', list._id, function () {
            Router.go('form', Records.findOne());
        });
        return true;
    } else {
        return false;
    }
};
var toggleListPrivacy = function (list) {
    return toggleListPrivacy = !toggleListPrivacy;
    if (list.userId) {
        Records.update(list._id, {
            $unset: {
                userId: true
            }
        });
    } else {
        Records.update(list._id, {
            $set: {
                userId: Meteor.userId()
            }
        });
    }
};
Template.form.events({
    'change .list-edit': function (event, template) {
        if ($(event.target)
            .val() === 'edit') {
            editList(this, template);
        } else if ($(event.target)
            .val() === 'delete') {
            deleteList(this, template);
        } else {
            Meteor.call('toggleListPrivacy', 'this', 'template');
        }
        event.target.selectedIndex = 0;
    },
    'click .js-toggle-list-privacy': function (event, template) {
        var toggleTest = Session.get('toggleTest');
        var result = !toggleTest;
        Session.set('toggleTest', result);
        return result ? 'a' : 'b';
    },
    'click .js-delete-list': function (event, template) {
        var record = Session.get('currentRecord');
        deleteList(record);
    },
    'click .formNav': function (event, template) {
        $('.collapse')
            .collapse('hide');
        $('#collapse_' + this.name)
            .collapse('toggle');
    },
    'change ._afInput': function (event, template) {},
    'change [name="resources.resourcesUsed"]': function (event, template) {
        console.log('!')
    },
    'click .mapPoints a': function (event, template) {
        var context = template.$(event.target);
        var pointType = context.attr('data');
        var active = context.hasClass('active')

        var coords = getCoords();
        console.log(coords)
        var item = _.findWhere(coords, {
            val: pointType
        });
        console.log(item)

        if (!active) {

            map.addPoint(item);
        } else {
            map.removePoint(item);
        }
        /* coords.forEach(function(d) {
                 if (d.coords) {
                     $('[data="' + d.val + '"]')
                         .addClass('active');
                 }

                 map.addPoint(d);*/

        /*
                 var d = mapPoints.filter(function(d) {
                     return d.name === 'coords.' + pointType;
                 })[0];

                 var marker = L.marker(map.getCenter(), {
                     draggable: true,
                     className: 'z2'
                 });

                 marker.bindLabel(d.text, {
                         noHide: true
                     })
                     .addTo(map);

                 marker.on('dragend', function(event) {
                     var marker = event.target;
                     var position = marker.getLatLng();
                     $('[name="coords.' + pointType + '.lng"]')
                         .val(position.lng)
                         .trigger("change");;
                     $('[name="coords.' + pointType + '.lat"]')
                         .val(position.lat)
                         .trigger("change");;

                 });*/

    },
});
hooks2 = {
    onSubmit: function (doc) {
        console.log(doc);
        Schemas.SARCAT.clean(doc);
        console.log(doc);
        this.done();
        return false;
    },
    // Schemas.SARCAT.clean(doc);
    onSuccess: function (formType, result) {
        console.log(formType, result);
    },
    onError: function (formType, error) {
        console.log(formType, error);
    },
    beginSubmit: function (a) {
        // console.log()
        console.log('beginSubmit');
    },
    endSubmit: function () {
        console.log('endSubmit');
    }
};
/*
AutoForm.hooks({
    recordAdminForm: {
        // Schemas.SARCAT.clean(doc);
        onSuccess: function(operation, result, template) {
            console.log(operation, result);
        },
        onError: function(operation, error, template) {
            console.log(error);
        },
        beginSubmit: function() {
            console.log('beginSubmit');
        },
        endSubmit: function() {
            console.log('endSubmit');
        }
    }
});*/
AutoForm.addHooks('kaf_recordInfo', hooks2);
