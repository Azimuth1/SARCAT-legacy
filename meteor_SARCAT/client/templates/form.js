var firstRender = true;
listFadeInHold = null;
var weather = false;
var config;
var agencyProfile;
var record;
var map;
Template.registerHelper("Schemas", Schemas);

Template.form.created = function () {
    Session.set('userView', this.data.record._id);
    config = Session.get('config');
    agencyProfile = config.agencyProfile;
    record = this.data.record;
    Session.set('currentRecord', record);
};
Template.form.rendered = function () {

    var coords = record.coords;
    var bounds = coords.bounds;
    var mapBounds = coords.bounds ? coords.bounds : agencyProfile.bounds;
    mapBounds = boundsString2Array(mapBounds);

    map = formSetMap('formMap', mapBounds);

    var coords = getCoords();
    coords.forEach(function (d) {
        if (d.coords) {
            $('[data="' + d.val + '"]')
                .addClass('active');
            map.add(d);
        }

    });
    map.fitBounds();

    $('.collapse')
        .collapse({
            toggle: false
        });

};
Template.form.helpers({
    agencyProfile: function () {
        return Session.get('config')
            .agencyProfile;
    },
    measureUnits: function () {
        return Session.get('config')
            .agencyProfile.measureUnits;
    },
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
    formComplete: function () {
        var name = this.field;
        var _record = Session.get('currentRecord')[name];

        if (!_record) {
            return 0;
        }
        return Object.keys(_record)
            .length;
        /*var formLen = _.filter(_record, function (d) {
                var val = d;
                if (val === '' || !val) {
                    val = false;
                }
                return val;
            })
            .length;
        var schemaLen = this.length;
        var complete = (formLen === schemaLen);
        return formLen + '/' + schemaLen;*/
    },

    autoSaveMode: function () {
        return true;
    },

    schemas: function () {
        var record = this.record;
        var schemas = _.without(Schemas.SARCAT._firstLevelSchemaKeys, "userId", "coords", "updated", "created", "admin");
        return schemas.map(function (d) {
            var count = (record[d]) ? Object.keys(record[d])
                .length || 0 : 0;
            return {
                field: d,
                current: count,
                total: Schemas[d]._firstLevelSchemaKeys.length
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

    'change .formNav': function (event, template) {
        $('.collapse')
            .collapse('hide');
        $('#collapse_' + this.name)
            .collapse('toggle');
    },

    'change [name="incident.incidentdate"]': function (event, template) {

        var date = this.value; //.split('.')[0];; //event.target.value;

        var weatherCoords = record.coords.ippCoordinates;

        getWeather(weatherCoords, date, function (data, err) {
            //if(){}
            z = data
                //console.log(data, err)
            Session.set('weather', data);
            //var data = data.currently;
            var dailyData = data.daily.data[0];
            console.log('MAX: ' + dailyData.temperatureMax)
            _.each(dailyData, function (d, name) {
                $('[name="weather.' + name + '.0.C"]')
                    .val(d);
            });

        });

    },
    'change [name="resources.resourcesUsed"]': function (event, template) {
        console.log('!')
    },
    'click .mapPoints a': function (event, template) {
        var context = template.$(event.target);
        var pointType = context.attr('data');
        var active = context.hasClass('active')

        var coords = getCoords();

        var item = _.findWhere(coords, {
            val: pointType
        });
        if (!item) {
            return;
        };
        console.log(item)
        if (!active) {
            map.add(item);
        } else {
            map.remove(item);
        }

    },
});

function convertToC(fTempVal) {
    return Math.round(cTempVal = (fTempVal - 32) * (5 / 9));
}

function convertToF(cTempVal) {
    return (cTempVal * (9 / 5)) + 32;
}
