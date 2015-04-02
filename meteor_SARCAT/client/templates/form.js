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

    
    $('.collapse')
        .collapse({
            toggle: false
        });

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
        var schemas = ['recordInfo', 'incident', 'weather', 'subjects', 'timeLog', 'incidentOutcome', 'medical', 'resources'];
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

    'change .formNav': function (event, template) {
        $('.collapse')
            .collapse('hide');
        $('#collapse_' + this.name)
            .collapse('toggle');
    },

    'change [name="incident.incidentDataTime"]': function (event, template) {

        var date = this.value.split('.')[0];; //event.target.value;

        var weatherCoords = record.coords.ippCoordinates;

        getWeather(weatherCoords, date, function (data, err) {
            //if(){}
            console.log(data, err)
            Session.set('weather', data);
            var data = data.currently;
            _.each(data, function (d, name) {
                $('[name="weather.' + name + '"]')
                    .val(d);
            })
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
        //console.log(coords)
        var item = _.findWhere(coords, {
            val: pointType
        });
        // console.log(item);

        if (!active) {
            map.add(item);
        } else {
            map.remove(item);
        }

    },
});

