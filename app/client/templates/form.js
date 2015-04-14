var firstRender = true;
listFadeInHold = null;
var weather = false;
var config;
var agencyProfile;
var record;
var map;
Template.registerHelper("Schemas", Schemas);

Template.form.onCreated(function () {
    Session.set('userView', this.data.record._id);
    config = Config.findOne();
    agencyProfile = config.agencyProfile;
    record = this.data.record;
    Session.set('currentRecord', this.data.record);

    Meteor.call('getFilesInPublicFolder', record._id, function (err, d) {
        Session.set('fileUploads', d)
    });

});
Template.form.onRendered(function () {

    record = this.data.record;
    r = record;
    var degree = (record.incidentOperations && record.incidentOperations.initialDirectionofTravel) ? record.incidentOperations.initialDirectionofTravel : 0;
    var travelBearing = $('.travelDirection');
    travelBearing.css('-moz-transform', 'rotate(' + degree + 'deg)');
    travelBearing.css('-webkit-transform', 'rotate(' + degree + 'deg)');
    travelBearing.css('-o-transform', 'rotate(' + degree + 'deg)');
    travelBearing.css('-ms-transform', 'rotate(' + degree + 'deg)');

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

    $('[name="rescueDetails.distanceTraveled"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'distance') + ')');

    $('[data-subjecttable="Weight"]')
        .append(' (' + labelUnits(currentUnit, 'weight') + ')');
    $('[data-subjecttable="Height"]')
        .append(' (' + labelUnits(currentUnit, 'height') + ')');
    $('.panel-title:contains("Weather")')
        .append('- Autoset from forecast.io based on Incident Date & Location');

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
    current2: function () {
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
            var label = Schemas.SARCAT._schema[d].label;

            return {
                field: label,
                current: count,
                total: Schemas[d]._firstLevelSchemaKeys.length
            };
        });
    },
    subjectKeys: function () {
        return _.chain(Schemas.subjects._schema)
            .filter(function (e, d) {
                return d.indexOf("$.") > -1;
            })
            .map(function (d) {
                return d.label;
            })
            .compact()
            .without('Name/Alias')
            .value();
    },
    subjects: function () {
        return this.data.record.subjects.subject;
    },
    coordKeys: function () {
        var coords = ["ippCoordinates", "decisionPointCoord", "destinationCoord", "findCoord", "revisedLKP-PLS"];
        return coords.map(function (d) {
            return 'coords.' + d;
        });
    },
    getSubjectsArray: function () {

        var self = this;
        self.myArray = (this.record && this.record.subjects) ? this.record.subjects.subject : [];
        return _.map(self.myArray, function (value, index) {

            return {
                value: value,
                index: index,
                name: "subjects.subject." + index
            };
        });
    },
    getResourceArray: function () {

        var self = this;
        self.myArray = (this.record && this.record.resourcesUsed) ? this.record.resourcesUsed.resource : [];
        return _.map(self.myArray, function (value, index) {

            return {
                value: value,
                index: index,
                name: "resourcesUsed.resource." + index
            };
        });
    },

    subject: function () {
        return _.map(this, function (d) {
            return d;
        });
    },
    resourceKeys: function () {
        //return ["Resource Type", "Total Used", "Total Hours","findResource"];
        return _.chain(Schemas.resourcesUsed._schema)
            .filter(function (e, d) {
                return d.indexOf("$.") > -1;
            })
            .map(function (d) {
                return d.label;
            })
            .compact()
            .without('Name/Alias')
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
    fileUploads: function (d) {
        return Session.get('fileUploads');
    }

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

var clicking = false;
var travelDirectionDegree;
Template.form.events({

    'mousedown .travelDirection': function (evt, template) {
        clicking = true;
    },
    'mouseout .travelDirection': function (event, template) {
        clicking = false;
        $('[name="incidentOperations.initialDirectionofTravel"]')
            .val(travelDirectionDegree)
            .trigger("change");
    },
    'mouseup .travelDirection': function (event, template) {

        clicking = false;
        $('[name="incidentOperations.initialDirectionofTravel"]')
            .val(travelDirectionDegree)
            .trigger("change");

    },
    'mousemove .travelDirection': function (evt, template) {

        var travelBearing = $(evt.target);
        if (clicking == false) return;
        var offset = travelBearing.offset();
        var center_x = (offset.left) + (travelBearing.width() / 2);
        var center_y = (offset.top) + (travelBearing.height() / 2);
        var mouse_x = evt.pageX;
        var mouse_y = evt.pageY;
        var radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
        travelDirectionDegree = (radians * (180 / Math.PI) * -1) + 90;
        travelDirectionDegree = Math.round((travelDirectionDegree < 0) ? (360 - (Math.abs(travelDirectionDegree))) : travelDirectionDegree);
        //console.log(travelDirectionDegree);
        travelBearing.css('-moz-transform', 'rotate(' + travelDirectionDegree + 'deg)');
        travelBearing.css('-webkit-transform', 'rotate(' + travelDirectionDegree + 'deg)');
        travelBearing.css('-o-transform', 'rotate(' + travelDirectionDegree + 'deg)');
        travelBearing.css('-ms-transform', 'rotate(' + travelDirectionDegree + 'deg)');

    },
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

        Meteor.call('removeSubject', record._id, this.value._key, function (err) {
            console.log(err);
        });
    },
    'click .removeResource': function (event, template) {

        Meteor.call('removeResource', record._id, this.value._key, function (err) {
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

        var weatherCoords = record.coords.ippCoordinates;

        getWeather(weatherCoords, event.target.value, function (data, err) {
            z = data
            Session.set('weather', data);
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
    'click .fileUpload': function (event, template) {

        var file = event.target.getAttribute('data');

        var url = '/uploads/records'
        url += '/' + record._id;
        url += '/' + file;
        window.open(url);
        //Router.go(url);
    }

});

AutoForm.hooks({
    updateSubjectForm: {
        onSuccess: function (insertDoc, updateDoc, currentDoc) {
            $('#updateSubjectForm')
                .find('input,select')
                .val('');
        }
    },
    updateResourceForm: {
        onSuccess: function (insertDoc, updateDoc, currentDoc) {
            $('#updateResourceForm')
                .find('input,select')
                .val('');
        }
    }
});

