var firstRender = true;
listFadeInHold = null;
var weather = false;
var config;
var agencyProfile;
var record;
var map;
Session.setDefault('subjectTableView', 'Description');
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
    if (!Object.keys(record.weather)
        .length) {
        Meteor.call('setWeather', record._id, function (err, d) {
            console.log('weather: ' + d);
            if (err) {
                return console.log(err);
            }
        });
    }

    //if (!record.incident.ecoregiondomain || !record.incident.ecoregionDivision) {
        Meteor.call('setEcoRegion', record._id, function (err, d) {
            if (err) {
                return;
            }
        });
    //}
    if (!record.incidentOutcome.elevationChange && record.coords.findCoord) {
        Meteor.call('setElevation', record._id, function (err, d) {
            console.log('elevation: ' + d);
            if (err) {
                return console.log(err);
            }
        });
    }
    if (!record.incident.country && !record.incident.stateregion) {
        Meteor.call('setLocale', record._id, function (err, d) {
            console.log('location: ' + d);
            if (err) {
                return console.log(err);
            }
        });
    }
    if (!record.incidentOutcome.distanceIPP && record.coords.findCoord) {
        Meteor.call('setDistance', record._id, function (err, d) {
            console.log('distance: ' + d);
            if (err) {
                return console.log(err);
            }
        });
    }


   // if (!record.incidentOutcome.distanceIPP && record.coords.findCoord) {
        Meteor.call('setFindBearing', record._id, function (err, d) {
            console.log('bearing: ' + d);
            if (err) {
                return console.log(err);
            }
        });
  //  }


    if (!record.incidentOutcome.distanceIPP && record.coords.findCoord) {
        Meteor.call('setDistance', record._id, function (err, d) {
            console.log('distance: ' + d);
            if (err) {
                return console.log(err);
            }
        });
    }
    $('.subjectRescueRow')
        .each(function () {
            var val = $(this)
                .find('[name*="status"]')
                .val();
            if (val === "Injured" || val === 'DOA') {
                $(this)
                    .find('select')
                    .not('[name*="status"]')
                    .not('[name*="evacuationMethod"]')
                    
                    .attr('disabled', false);
            } else {
                $(this)
                    .find('select')
                    .not('[name*="status"]')
                    .not('[name*="evacuationMethod"]')
                    .attr('disabled', true);
            }
        });
    $('label:contains("Subject Category")')
        .append('<span class="small em mar0y text-default"><a class="em" href="/profiles" target="newwindow"}}">*See Descriptions</span>');
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
        .append(' (' + labelUnits(currentUnit, 'distanceSmall') + ')');
    $('[name="rescueDetails.distanceTraveled"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'distance') + ')');
    $('[data-subjecttable="Weight"]')
        .append(' (' + labelUnits(currentUnit, 'weight') + ')');
    $('[data-subjecttable="Height"]')
        .append(' (' + labelUnits(currentUnit, 'height') + ')');
    $('.panel-title:contains("Weather")')
        .parent()
        .next()
        .prepend('<p class="small em mar0y text-default">*Powered by <a class="em" href="http://forecast.io/">Forecast</a> based on Incident Date & Location</p>')
    var coords = record.coords;
    var bounds = coords.bounds;
    var mapBounds = coords.bounds ? coords.bounds : agencyProfile.bounds;
    mapBounds = boundsString2Array(mapBounds);
    map = formSetMap('formMap', record._id);
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
    hasRevisedPLS: function () {
        var record = this.record;
        return record.coords && record.coords['revisedLKP_PLS'];
    },
    autoSaveMode: function () {
        return true;
    },
    schemas: function () {
        var record = this.record;
        var schemas = _.without(Schemas.SARCAT._firstLevelSchemaKeys, 'measureUnits', "userId", "coords", "updated", "created", "admin", "xComments", "incidentOperations");
        return _.chain(schemas)
            .map(function (d) {
                if (!Schemas[d]) {
                    return;
                }
                var total = Schemas[d]._firstLevelSchemaKeys.length;
                var objKeys = Object.keys(record[d]);
                var count = objKeys.length;
                var sum;
                if (total === 1) {
                    count = record[d][objKeys[0]].length;
                    sum = ' - ' + count;
                } else {
                    sum = [count, total].join('/');
                }
                var label = Schemas.SARCAT._schema[d].label;
                var klass = (count === Schemas[d]._firstLevelSchemaKeys.length) ? '' : 'primary-bg';
                return {
                    klass: klass,
                    field: label,
                    sum: sum
                };
            })
            .compact()
            .value();
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
    subjectKeysDesc: function () {
        return ["Age", "Sex", "Weight", "Height", "Fitness Level", "Experience", "Equipment", "Clothing", "Survival training", "Local?"];
    },
    subjectKeysRescue: function () {
        return ["Rescue Status", "Evacuation Method","Mechanism", "Injury Type", "Illness", "Treatment by"];
    },
    subjectKeysPersonal: function () {
        return ["Full Name", "Address", "Home Phone", "Cell Phone", "Comments"];
    },
    subjects: function () {
        return this.data.record.subjects.subject;
    },
    test: function () {
        return this.record.coords;
    },
    coordKeys: function () {
        var coords = ["ippCoordinates", "decisionPointCoord", "destinationCoord", "findCoord", "revisedLKP_PLS"];
        //var activeCoords = Object.keys(this.record.coords);
        //coords = _.intersection(coords, activeCoords)
        return coords.map(function (d) {
            return 'coords.' + d
        }); //.join(',');
    },
    hideCoord: function (d) {
        return this.record.coords[d] ? '' : 'hide';
    },
    getSubjectsArray: function () {
        var myArray = (this.record && this.record.subjects) ? this.record.subjects.subject : [];
        return _.map(myArray, function (value, index) {
            return {
                value: value,
                index: index,
                name: "subjects.subject." + index
            };
        });
    },
    getSubjectsArrayDesc: function () {
        var values = _.chain(Schemas.subjects._schema)
            .map(function (e, d) {
                var field = d.split("$.")[1];
                if (!field) {
                    return;
                }
                return {
                    options: e.allowedValues ? 'allowed' : null,
                    field: d.split("$.")[1]
                }
            })
            .compact()
            .filter(function (d) {
                var keep = ["age", "sex", "weight", "height", "physical_fitness", "experience", "equipment", "clothing", "survival_training", "local"];
                return _.contains(keep, d.field);
            })
            .without('_key')
            .value();
        var myArray = (this.record && this.record.subjects) ? this.record.subjects.subject : [];
        //console.log(myArray);
        return _.map(myArray, function (value, index) {
            var fields = values.map(function (d) {
                var obj = {};
                obj.name = "subjects.subject." + index + '.' + d.field;
                obj.options = d.options
                return obj
            });
            return {
                value: fields,
                index: index,
                _key: value._key,
                name: "subjects.subject." + index
            };
        });
    },
    getSubjectsArrayRescue: function () {
        var values = _.chain(Schemas.subjects._schema)
            .map(function (e, d) {
                var field = d.split("$.")[1];
                if (!field) {
                    return;
                }
                return {
                    options: e.allowedValues ? 'allowed' : null,
                    field: d.split("$.")[1]
                }
            })
            .compact()
            .filter(function (d) {
                var keep = ["status", "evacuationMethod","mechanism", "injuryType", "illness", "treatmentby"];
                return _.contains(keep, d.field);
            })
            .without('_key')
            .value();
        var myArray = (this.record && this.record.subjects) ? this.record.subjects.subject : [];
        return _.map(myArray, function (value, index) {
            var fields = values.map(function (d) {
                var obj = {};
                obj.name = "subjects.subject." + index + '.' + d.field;
                obj.options = d.options
                return obj
            });
            return {
                value: fields,
                index: index,
                name: "subjects.subject." + index
            };
        });
    },
    getSubjectsArrayPersonal: function () {
        var values = _.chain(Schemas.subjects._schema)
            .map(function (e, d) {
                var field = d.split("$.")[1];
                if (!field) {
                    return;
                }
                return {
                    options: e.allowedValues ? 'allowed' : null,
                    field: d.split("$.")[1]
                }
            })
            .compact()
            .filter(function (d) {
                var keep = ["name", "address", "homePhone", "cellPhone", "other"];
                return _.contains(keep, d.field);
            })
            .without('_key')
            .value();
        var myArray = (this.record && this.record.subjects) ? this.record.subjects.subject : [];
        return _.map(myArray, function (value, index) {
            var fields = values.map(function (d) {
                var obj = {};
                obj.name = "subjects.subject." + index + '.' + d.field;
                obj.options = d.options
                return obj
            });
            return {
                value: fields,
                index: index,
                name: "subjects.subject." + index
            };
        });
    },
    getResourceArray: function () {
        var myArray = (this.record && this.record.resourcesUsed) ? this.record.resourcesUsed.resource : [];
        return _.map(myArray, function (value, index) {
            return {
                value: value,
                index: index,
                name: "resourcesUsed.resource." + index
            };
        });
    },
    getResourceArray2: function () {
        var values = _.chain(Schemas.resourcesUsed._schema)
            .map(function (e, d) {
                var field = d.split("$.")[1];
                if (!field) {
                    return;
                }
                return {
                    options: e.allowedValues ? 'allowed' : null,
                    field: d.split("$.")[1]
                }
            })
            .compact()
            .filter(function (d) {
                var keep = ["type", "count", "hours", "findResource"];
                return _.contains(keep, d.field);
            })
            .without('_key')
            .value();
        var myArray = (this.record && this.record.resourcesUsed) ? this.record.resourcesUsed.resource : [];
        //console.log(myArray);
        return _.map(myArray, function (value, index) {
            var fields = values.map(function (d) {
                var obj = {};
                obj.name = "resourcesUsed.resource." + index + '.' + d.field;
                obj.options = d.options
                return obj
            });
            return {
                value: fields,
                index: index,
                _key: value._key,
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
    fileUploads: function (d) {
        return Session.get('fileUploads');
    },
    subjectTableView: function (d) {
        var isView = Session.equals('subjectTableView', d);
        return isView ? '' : 'hide';
    },
});
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
        console.log(travelDirectionDegree)
        clicking = false;
        $('[name="incidentOperations.initialDirectionofTravel"]')
            .val(travelDirectionDegree)
            .trigger("change");
    },
    'mousemove .travelDirection': function (evt, template) {
        // console.log(mouse_x, mouse_y);
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
    'click .formNav': function (event, template) {
        $('.collapse')
            .collapse('hide');
        $('#collapse_' + this.name)
            .collapse('toggle');
    },
    'click .newSubject': function (event, template) {
        Meteor.call('pushArray', record._id, 'subjects.subject', function (err, d) {
            console.log(d);
        });
    },
    'click .removeSubject': function (event, template) {
        Meteor.call('removeSubject', record._id, event.target.getAttribute('data'), function (err) {
            console.log(err);
        });
    },
    'click .newResource': function (event, template) {
        Meteor.call('pushArray', record._id, 'resourcesUsed.resource', function (err, d) {
            console.log(d);
        });
    },
    'click .removeResource': function (event, template) {
        Meteor.call('removeResource', record._id, event.target.getAttribute('data'), function (err) {
            console.log(err);
        });
    },
    'change .formNav': function (event, template) {
        $('.collapse')
            .collapse('hide');
        $('#collapse_' + this.name)
            .collapse('toggle');
    },
    'change [name="recordInfo.incidentdate"]': function (event, template) {
        Meteor.call('setWeather', record._id, function (err, d) {
            console.log('weather: ' + d);
            if (err) {
                return console.log(err);
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
        if (!active) {
            map.add(item);
        } else {
            if (confirm('Are you sure you want to remove ' + item.text + ' from the map?')) {
                map.remove(item);
            } else {
                event.stopPropagation();
            }
        }
    },
    'click .fileUpload': function (event, template) {
        var file = event.target.getAttribute('data');
        var url = '/uploads/records'
        url += '/' + record._id;
        url += '/' + file;
        window.open(url);
    },
    'click .subjectTableView label': function (event, template) {
        e = event;
        var dataAttr = event.target.children[0].getAttribute('data');
        Session.set('subjectTableView', dataAttr);
    },
    'blur #formIdMap input': function (event, template) {
        var name = event.target.name;
        var value = event.target.value;
        if (name.indexOf('coords.') !== -1) {
            val = name.split('.');
            if (val.length !== 3) {
                return;
            }
            if (record[val[0]][val[1]][val[2]] === parseFloat(value)) {
                return;
            }
            map.editPoint(val[1]);
        }
    },
    'change [name*="subjects.subject"][name*="status"]': function (event) {
        var val = event.target.value;
        var ind = event.target.getAttribute('name')
            .split('.')[2];
        if (val === "Injured" || val === 'DOA') {
            $('.subjectRescueRow[data-index="' + ind + '"] select')
                .not('[name*="status"]')
                .attr('disabled', false);
        } else {
            $('.subjectRescueRow[data-index="' + ind + '"] select')
                .not('[name*="status"]')
                .attr('disabled', true);
        }
    },
});
AutoForm.hooks({
    updateResourceForm: {
        onSuccess: function (insertDoc, updateDoc, currentDoc) {
            $('#updateResourceForm')
                .find('input,select')
                .val('');
        }
    }
});

