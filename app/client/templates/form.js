var map;
Session.setDefault('subjectTableView', 'Description');
Template.registerHelper("Schemas", Schemas);
Template.form.onCreated(function () {
    Session.set('editRecordInfo', 'list');
    Session.set('userView', this.data.record._id);
    Session.set('record', this.data.record);
    Meteor.call('getFilesInPublicFolder', this.data.record._id, function (err, d) {
        Session.set('fileUploads', d)
    });
});
Template.form.onRendered(function () {
    var record = this.data.record;
    map = formSetMap('formMap', record._id);
    var coords = getCoords(record);
    coords.forEach(function (d) {
        if (d.coords) {
            map.add(d);
        }
    });
    map.fitBounds();
    var currentUnit = Session.get('measureUnits');
    var degree = record.incidentOperations.initialDirectionofTravel || 0;
    $('.knob').knobKnob({
        value: degree,
        turn: function (ratio) {
            var deg = parseInt(360 * ratio);
            $('.knobVal').html(deg);
        }
    });
    $('.knobVal').html(degree);
    if (!record.incidentLocation.ecoregionDomain || !record.incidentLocation.ecoregionDivision) {
        Meteor.call('setEcoRegion', record._id, function (err, d) {
            if (err) {
                return;
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
    $('[name="weather.temperatureMax"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'temperature') + ')');
    $('[name="weather.temperatureMin"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'temperature') + ')');
    $('[name="weather.windSpeed"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'speed') + ')');
    $('[name="findLocation.trackOffset"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'distanceMed') + ')');
    $('[name="findLocation.elevationChange"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'distanceSmall') + ')');
    $('[name="resourcesUsed.distanceTraveled"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'distance') + ')');
    $('[name="findLocation.distanceIPP"]')
        .prev()
        .append(' (' + labelUnits(currentUnit, 'distance') + ')');
    $('[data-subjecttable="Weight"]')
        .append(' (' + labelUnits(currentUnit, 'weight') + ')');
    $('[data-subjecttable="Height"]')
        .append(' (' + labelUnits(currentUnit, 'height') + ')');
    if ($('[name="incidentOutcome.incidentOutcome"]').val() !== 'Open/Suspended') {
        $('[name="incidentOutcome.suspensionReasons"]').parent().addClass('hide')
    }
    if ($('[name="incidentOutcome.injuredSearcher"]').val() !== 'Yes') {
        $('[name="incidentOutcome.injuredSearcherDetails"]').parent().addClass('hide')
    }
});
Template.form.helpers({
    activeLayer: function (name) {
        var coords = this.record.coords;
        return coords[name] ? 'active' : '';
    },
    toDateString: function (date) {
        return;
        console.log(date)
        if (!date) {
            return;
        }
        return date.toISOString()
            .split('T')[0];
    },
    config: function () {
        return Session.get('config')
    },
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
    hasRevisedPLS: function () {
        var record = this.record;
        return record.coords && record.coords['revisedLKP_PLS'];
    },
    autoSaveMode: function () {
        return true;
    },
    schemas: function () {
        var record = this.record;
        var schemas = [{
            "name": "incidentLocation",
        }, {
            "name": "incident",
        }, {
            "name": "subjects",
            "total": ' ',
            "count": record.subjects.subject.length
        }, {
            "name": "weather"
        }, {
            "name": "findLocation"
        }, {
            "name": "incidentOutcome"
        }, {
            "name": "resourcesUsed"
        }];
        var summary = _.chain(schemas)
            .map(function (field) {
                var d = field.name;
                if (!Schemas[d]) {
                    return;
                }
                record[d] = record[d] || {};
                var total = field.total || Schemas[d]._firstLevelSchemaKeys.length;
                var countNum = field.count ? null : Object.keys(record[d]).length;
                var count = field.count ? field.count : Object.keys(record[d]).length + '/';
                var sum = [count, total].join('');
                var label = Schemas.SARCAT._schema[d].label;
                var klass = (countNum !== total) ? '' : 'primary-bg';
                return {
                    klass: klass,
                    field: label,
                    sum: sum
                };
            })
            .compact()
            .value();
        return summary;
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
        return ["Rescue Status", "Evacuation Method", "Mechanism", "Injury Type", "Illness", "Treatment by"];
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
    customQuestions: function () {
        var record = Session.get('record');
        return Object.keys(record.customQuestions).length;
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
    editRecordInfo: function (item) {
        return Session.equals('editRecordInfo', item);
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
                var keep = ["status", "evacuationMethod", "mechanism", "injuryType", "illness", "treatmentby"];
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
    disableFindLocation: function () {
        var record = this.record;
        var findCoord = record.coords.findCoord;
        var highRole = Roles.userIsInRole(Meteor.user(), ['admin', 'editor']);
        return !(highRole && findCoord);
    },
    disableFindLocationForm: function () {
        var record = this.record;
        var findCoord = record.coords.findCoord;
        var highRole = Roles.userIsInRole(Meteor.user(), ['admin', 'editor']);
        return (highRole && findCoord) ? 'update' : 'disabled';
    },
});
Template.form.events({
    'mouseout .travelDir': function (event, template) {
        clicking = false;
        $('[name="incidentOperations.initialDirectionofTravel"]')
            .val($('.knobVal').html())
            .trigger("change");
    },
    'click .editRecordInfo': function (event) {
        var item = event.target.getAttribute('data');
        console.log(event.target)
        return Session.set('editRecordInfo', item);
    },
    'click .formNav': function (event, template) {
        $('.collapse')
            .collapse('hide');
        $('#collapse_' + this.name)
            .collapse('toggle');
    },
    'click .newSubject': function (event, template) {
        var record = Session.get('record');
        Meteor.call('pushArray', record._id, 'subjects.subject', function (err, d) {
            console.log(d);
        });
    },
    'click .removeSubject': function (event, template) {
        var record = Session.get('record');
        Meteor.call('removeSubject', record._id, event.target.getAttribute('data'), function (err) {
            console.log(err);
        });
    },
    'click .newResource': function (event, template) {
        var record = Session.get('record');
        Meteor.call('pushArray', record._id, 'resourcesUsed.resource', function (err, d) {
            console.log(d);
        });
    },
    'click .removeResource': function (event, template) {
        var record = Session.get('record');
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
        var record = Session.get('record');
        Meteor.call('setWeather', record._id, {
            unset: true
        }, function (err, d) {
            console.log('weather: ' + d);
            if (err) {
                $('.panel-title:contains("Weather")')
                    .parent()
                    .next()
                    .prepend('<p class="small em mar0y text-danger">Unable to retreive weather data</p>')
                return console.log(err);
            }
        });
    },
    'click .mapPoints .btn': function (event, template) {
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
    'click #weatherBtn': function (event, template) {
        Meteor.call('setWeather', Session.get('record')
            ._id,
            function (err, d) {
                console.log(err, d)
                if (err) {
                    console.log(err);
                    Meteor.call('updateConfig', {
                        weatherAPI: false
                    }, function (err, d) {})
                    $(event.target)
                        .replaceWith('<p class="small em mar0y text-danger">Unable to retreive weather data</p>')
                    return console.log(err);
                } else {}
            });
    },
    'click #mapCalcBtn': function (event, template) {
        var record = Session.get('record');
        Meteor.call('setDistance', record._id, function (err, d) {
            console.log(d);
            if (err) {
                return console.log(err);
            }
        });
        Meteor.call('setBearing', record._id, 'findLocation.findBearing', function (err, d) {
            console.log(d);
            if (err) {
                return console.log(err);
            }
        });
        Meteor.call('setEcoRegion', record._id, function (err, d) {
            if (err) {
                return;
            }
        });
        Meteor.call('setElevation', record._id, function (err, d) {
            console.log(d);
            if (err) {
                return console.log(err);
            }
        });
        Meteor.call('setLocale', record._id, function (err, d) {
            console.log(d);
            if (err) {
                return console.log(err);
            }
        });
    },
    'change [name="incidentOperations.lkp_pls_Boolean"]': function (event) {
        var val = event.target.value;
        console.log(val);
        var item = {
            val: "revisedLKP_PLS",
            name: "coords.revisedLKP_PLS",
            text: "Revised IPP",
            icon: 'fa-male',
            color: 'red'
        }
        if (val === 'Yes') {
            map.add(item);
        } else {
            if (confirm('Are you sure you want to remove ' + item.text + ' from the map?')) {
                map.remove(item);
            } else {
                event.stopPropagation();
            }
        }
    },
    'change [name="incidentOutcome.incidentOutcome"]': function (event) {
        var val = event.target.value;
        if (val !== 'Open/Suspended') {
            $('[name="incidentOutcome.suspensionReasons"]').parent().addClass('hide');
        } else {
            $('[name="incidentOutcome.suspensionReasons"]').parent().removeClass('hide');
        }
    },
    'change [name="incidentOutcome.injuredSearcher"]': function (event) {
        var val = event.target.value;
        if (val === 'Yes') {
            $('[name="incidentOutcome.injuredSearcherDetails"]').parent().removeClass('hide');
        } else {
            $('[name="incidentOutcome.injuredSearcherDetails"]').parent().addClass('hide');
        }
    },
    'change [name="incidentOperations.initialDirectionofTravel_Boolean"]': function (event) {
        console.log(this)
        var val = event.target.value;
        var record = Session.get('record');
        console.log(val);
        if (val === 'Yes') {
            Meteor.call('setBearing', record._id, 'incidentOperations.initialDirectionofTravel', function (err, degree) {
                console.log(degree)
                if (degree) {
                    var travelBearing = $('.travelDirection');
                    travelBearing.css('-moz-transform', 'rotate(' + degree + 'deg)');
                    travelBearing.css('-webkit-transform', 'rotate(' + degree + 'deg)');
                    travelBearing.css('-o-transform', 'rotate(' + degree + 'deg)');
                    travelBearing.css('-ms-transform', 'rotate(' + degree + 'deg)');
                }
                if (err) {
                    return console.log(err);
                }
            });
        } else {
            Meteor.call('updateRecord', record._id, 'incidentOperations.initialDirectionofTravel', null, function (err, d) {
                console.log(d);
                if (err) {
                    return console.log(err);
                }
            });
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
