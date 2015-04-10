var firstRender = true;
listFadeInHold = null;
var weather = false;
var config;
var agencyProfile;
var record;
var map;
Template.registerHelper("Schemas", Schemas);

Template.form.onCreated(function () {
    console.log('created');
    console.log($(".dial"))
    Session.set('userView', this.data.record._id);
    config = Config.findOne();
    agencyProfile = config.agencyProfile;
record = this.data.record;
    Session.set('currentRecord', this.data.record);

});
Template.form.onRendered(function () {
    console.log('!')

    record = this.data.record;
    var dialVal = (record.incidentOperations && record.incidentOperations.initialDirectionofTravel) ? record.incidentOperations.initialDirectionofTravel : 0;
    $(".dial")
        .val(dialVal);
    $(".dial")
        .knob({
            'release': function (v) {
                $('[name="incidentOperations.initialDirectionofTravel"]')
                    .val(v)
                    .trigger("change");

            }
        });

    Session.set('userView', this.data.record._id);
    config = Config.findOne();
    agencyProfile = config.agencyProfile;

    Session.set('currentRecord', record);

    var record = this.data.record;
    var currentUnit = record.measureUnits;
    var units = labelUnits(currentUnit, 'temperature');

    $('[name="weather.temperatureMax"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'temperature') + ')');
    $('[name="weather.temperatureMin"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'temperature') + ')');
    $('[name="weather.windSpeed"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'speed') + ')');
    $('[name="incidentOutcome.trackOffset"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'distance') + ')');
    $('[name="incidentOutcome.elevationChange"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'distance') + ')');

    $('[data-subjecttable="weight"]')
        .append(' (' + labelUnits(currentUnit, 'weight') + ')');
    $('[data-subjecttable="height"]')
        .append(' (' + labelUnits(currentUnit, 'height') + ')');

    var coords = record.coords;

    var bounds = coords.bounds;
    var mapBounds = coords.bounds ? coords.bounds : agencyProfile.bounds;
    mapBounds = boundsString2Array(mapBounds);

    map = formSetMap('formMap');

    var coords = getCoords(record);
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

});
Template.form.helpers({
    /*agencyProfile: function () {
        return Session.get('config')
            .agencyProfile;
    },*/
    /* measureUnits: function () {
         return Config.findOne()
             .agencyProfile.measureUnits;

            
     },
     measureUnitsHeight: function () {
         var units = Config.findOne()
             .agencyProfile.measureUnits;
              return labelUnits(units,'height')
     },
     measureUnitsWeight: function () {
         var units = Config.findOne()
             .agencyProfile.measureUnits;
              return labelUnits(units,'weight')
     },*/
    formType: function () {
        var highRole = Roles.userIsInRole(Meteor.user(), ['admin', 'editor']);
        return highRole ? 'update' : 'disabled';
    },
    formType2: function () {
        var highRole = Roles.userIsInRole(Meteor.user(), ['admin', 'editor']);
        return highRole ? 'update-pushArray' : 'disabled';
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

    hasDecisionPoint: function () {

        var record = this.record;
        return record.coords && record.coords.decisionPointCoord;
    },
    autoSaveMode: function () {
        return true;
    },

    schemas: function () {
        var record = this.record;
        var schemas = _.without(Schemas.SARCAT._firstLevelSchemaKeys, 'measureUnits', "userId", "coords", "updated", "created", "admin");
        return schemas.map(function (d) {
            var count = (record[d]) ? Object.keys(record[d])
                .length || 0 : 0;

            if (!Schemas[d]) {
                return;
            }
            return {
                field: d,
                current: count,
                total: Schemas[d]._firstLevelSchemaKeys.length
            };
        });
    },
    subjectKeys: function () {
        return Schemas.subject._schemaKeys
    },
    subjects: function () {
        return this.data.record.subjects.subject;
    },
    subject: function () {
        return _.map(this, function (d) {
            return d;
        });
    },

    resourceKeys: function () {
        return ["Resource Type", "Total Used", "Total Hours"];
        return _.chain(Schemas.resourcesUsed._schemaKeys)
            .filter(function (d) {
                return d.indexOf("$") > -1;
            })
            .map(function (d) {
                return d.split('.')[2];
            })
            .compact()
            .without('_key')
            .value();
    },
    resources: function () {
        return this.data.record.subjects.subject;
    },
    resource: function () {
        return _.map(this, function (d) {
            return d;
        });
    },

    medicalDetails: function () {
        var medical = this.record.medical;
        if (!medical) {
            return false;
        }
        var val = medical.status;
        var detailsTrue = (val === 'Injured' || val === 'DOA') ? true : false;
        return detailsTrue;
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
        var record = this.data.record;
        deleteList(record);
    },
    'click .formNav': function (event, template) {
        $('.collapse')
            .collapse('hide');
        $('#collapse_' + this.name)
            .collapse('toggle');
    },
    'click .removeSubject': function (event, template) {
        console.log(record._id, this._key)
        Meteor.call('removeSubject', record._id, this._key, function (err) {
            console.log(err);
        });
    },
    'click .removeResource': function (event, template) {
        console.log(record._id, this._key)
        Meteor.call('removeResource', record._id, this._key, function (err) {
            console.log(err);
        });

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
                $('[name="weather.' + name + '"]')
                    .val(d);
            });
            if (!dailyData.precipType) {
                $('[name="weather.precipType"]')
                    .val('none')
                    .trigger('change');
            }

        });

    },
    'click .mapPoints a': function (event, template) {

       

        var context = template.$(event.target);
        var pointType = context.attr('data');
        var active = context.hasClass('active')

        var coords = getCoords(this.record);

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

AutoForm.hooks({
    updateSubjectForm: {
        onSuccess: function (insertDoc, updateDoc, currentDoc) {
            $('#updateSubjectForm')
                .find('input')
                .val('');
        }
    }
});

