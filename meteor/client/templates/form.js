var map;
Template.form.onCreated(function(a, b) {
    if (!Object.keys(this.data)
        .length) {
        return Router.go('records');
    }
    Session.set('subjectTableView', 'Description');
    var record = this.data;
    r = record
    Session.set('record', record);
    Tracker.autorun(function() {
        Session.set('record', Records.findOne(record._id));
    });
    Session.set('editRecordInfo', 'list');
    Session.set('userView', this.data._id);
});
Template.form.onRendered(function() {
    var country = $('[name="incidentLocation.country"]').val();
    Session.set('country', $('[name="incidentLocation.country"]').val());
    var record = this.data;
    map = formSetMap('formMap', record._id);
    var coords = getCoords(record);
    coords.forEach(function(d) {
        if (d.coords) {
            map.add(d);
        }
    });
    map.fitBounds();
    Meteor.call('getFilesInPublicFolder', record._id, function(err, d) {
        Session.set('fileUploads', d)
    });
    var currentUnit = Session.get('measureUnits');
    var degree = record.incidentOperations.initialDirectionofTravel || 0;
    $('.knob')
        .knobKnob({
            value: degree,
            turn: function(ratio) {
                var deg = parseInt(360 * ratio);
                $('.knobVal')
                    .html(deg);
            }
        });
    $('.knobVal')
        .html(degree);
    /*if (!record.incidentLocation['state-province']) {
    Meteor.call('setStateProvince', record._id, function (err, d) {
        if (err) {
            return;
        }
    });
    }*/
    if (!record.incidentLocation.ecoregionDomain || !record.incidentLocation.ecoregionDivision) {
        Meteor.call('setEcoRegion', record._id, function(err, d) {
            if (err) {
                return;
            }
        });
    }
    $('.subjectRescueRow')
        .each(function() {
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
    if ($('[name="incidentOutcome.incidentOutcome"]')
        .val() !== 'Open/Suspended') {
        $('[name="incidentOutcome.suspensionReasons"]')
            .parent()
            .addClass('hide')
    }
    if ($('[name="incidentOutcome.injuredSearcher"]')
        .val() !== 'Yes') {
        $('[name="incidentOutcome.injuredSearcherDetails"]')
            .parent()
            .addClass('hide')
    }
    $('[name="timeLog.totalMissingHours"]')
        .prop('disabled', true);
    $('[name="timeLog.totalSearchHours"]')
        .prop('disabled', true);
    // $('.bsDateInput').prop('disabled', true);
    $('.bsDateInput')
        .datetimepicker({
            use24hours: true,
            format: 'MM/DD/YYYY HH:mm',
            sideBySide: true
        });
});
Template.form.helpers({
    record: function() {
        return Session.get('record')
    },
    allowedStates: function(a, b) {
        var country = Session.get('country');
        //console.log(country)
        var states = allowedStates(country);
        //console.log(states.length)
        return states;
    },
    activeLayer: function(name) {
        var coords = this.coords;
        return coords[name] ? 'active' : '';
    },
    toDateString: function(date) {
        return;
        console.log(date)
        if (!date) {
            return;
        }
        return date.toISOString()
            .split('T')[0];
    },
    config: function() {
        return Session.get('config')
    },
    formType: function() {
        var highRole = Roles.userIsInRole(Meteor.user(), ['admin', 'editor']);
        return highRole ? 'update' : 'disabled';
    },
    formType2: function() {
        var highRole = Roles.userIsInRole(Meteor.user(), ['admin', 'editor']);
        return highRole ? 'update-pushArray' : 'disabled';
    },
    todosReady: function() {
        return true;
    },
    getObj: function(obj, name) {
        return obj[name];
    },
    getData: function(obj, name) {
        return this;
    },
    current: function() {
        return Records.findOne(this._id)
    },
    current2: function() {
        return Records.findOne(this._id)
    },
    Schemas: function() {
        return Schemas;
    },
    Records: function() {
        return Records;
    },
    hasRevisedPLS: function() {
        var record = this;
        return record.coords && record.coords['revisedLKP_PLS'];
    },
    autoSaveMode: function() {
        return true;
    },
    schemas: function() {
        var record = this;
        if (!record) {
            return;
        }
        var schemas = [{
            "name": "incidentLocation",
        }, {
            "name": "timeLog",
        }, {
            "name": "subjects",
            "total": record.subjects.subject.length,
            "toCount": true
        }, {
            "name": "weather"
        }, {
            "name": "findLocation"
        }, {
            "name": "incidentOutcome",
            newTotal: 7
        }, {
            "name": "resourcesUsed",
            "total": record.resourcesUsed.resource.length,
            "toCount": true
        }];
        var summary = _.chain(schemas)
            .map(function(field) {
                var d = field.name;
                var toCount = field.toCount;
                if (!Schemas[d]) {
                    console.log(d)
                    return;
                }
                var recordSamp = record[d] || {};


                var total = toCount ? null : Schemas[d]._firstLevelSchemaKeys.length;
                total = field.newTotal || total;
                total = total > count ? count : total;
                var count = toCount ? field.total : Object.keys(recordSamp)
                    .length;

                var label = Schemas.SARCAT._schema[d].label;
                //console.log(d, count, total,field.newTotal)

                var klass = (count === total || (!total && count)) ? 'primary-bg' : '';
                total = total ? '/' + total : null;
                var sum = [count, total].join('');
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
    subjectKeys: function() {
        return _.chain(Schemas.subjects._schema)
            .filter(function(e, d) {
                return d.indexOf("$.") > -1;
            })
            .map(function(d) {
                return d.label;
            })
            .compact()
            .without('Name/Alias')
            .value();
    },
    subjectKeysDesc: function() {
        return ["Age", "Sex", "Weight", "Height", "Fitness Level", "Experience", "Equipment", "Clothing", "Survival training", "Local?"];
    },
    subjectKeysRescue: function() {
        return ["Rescue Status", "Evacuation Method", "Mechanism", "Injury Type", "Illness", "Treatment by"];
    },
    subjectKeysPersonal: function() {
        return ["Full Name", "Address", "Home Phone", "Cell Phone", "Comments"];
    },
    test: function() {
        return this.coords;
    },
    customQuestions_: function() {
        var record = Session.get('record');
        if (!record || !record.customQuestions) {
            return;
        }
        var keys = Object.keys(record.customQuestions)
        return keys && keys.length;
    },
    hideCoord: function(d) {
        return this.coords[d] ? '' : 'hide';
    },
    getSubjectsArray: function() {
        var myArray = (this && this.subjects) ? this.subjects.subject : [];
        return _.map(myArray, function(value, index) {
            return {
                value: value,
                index: index,
                name: "subjects.subject." + index
            };
        });
    },
    getSubjectsArrayDesc: function() {
        var values = _.chain(Schemas.subjects._schema)
            .map(function(e, d) {
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
            .filter(function(d) {
                var keep = ["age", "sex", "weight", "height", "physical_fitness", "experience", "equipment", "clothing", "survival_training", "local"];
                return _.contains(keep, d.field);
            })
            .without('_key')
            .value();
        var myArray = (this && this.subjects) ? this.subjects.subject : [];
        //console.log(myArray);
        return _.map(myArray, function(value, index) {
            var fields = values.map(function(d) {
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
    editRecordInfo: function(item) {
        return Session.equals('editRecordInfo', item);
    },
    getSubjectsArrayRescue: function() {
        var values = _.chain(Schemas.subjects._schema)
            .map(function(e, d) {
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
            .filter(function(d) {
                var keep = ["status", "evacuationMethod", "mechanism", "injuryType", "illness", "treatmentby"];
                return _.contains(keep, d.field);
            })
            .without('_key')
            .value();
        var myArray = (this && this.subjects) ? this.subjects.subject : [];
        return _.map(myArray, function(value, index) {
            var fields = values.map(function(d) {
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
    getSubjectsArrayPersonal: function() {
        var values = _.chain(Schemas.subjects._schema)
            .map(function(e, d) {
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
            .filter(function(d) {
                var keep = ["name", "address", "homePhone", "cellPhone", "other"];
                return _.contains(keep, d.field);
            })
            .without('_key')
            .value();
        var myArray = (this && this.subjects) ? this.subjects.subject : [];
        return _.map(myArray, function(value, index) {
            var fields = values.map(function(d) {
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
    getResourceArray: function() {
        var myArray = (this && this.resourcesUsed) ? this.resourcesUsed.resource : [];
        return _.map(myArray, function(value, index) {
            return {
                value: value,
                index: index,
                name: "resourcesUsed.resource." + index
            };
        });
    },
    getResourceArray2: function() {
        var values = _.chain(Schemas.resourcesUsed._schema)
            .map(function(e, d) {
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
            .filter(function(d) {
                var keep = ["type", "count", "hours", "findResource"];
                return _.contains(keep, d.field);
            })
            .without('_key')
            .value();
        var myArray = (this && this.resourcesUsed) ? this.resourcesUsed.resource : [];
        return _.map(myArray, function(value, index) {
            var fields = values.map(function(d) {
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
    subject: function() {
        return _.map(this, function(d) {
            return d;
        });
    },
    resourceKeys: function() {
        return _.chain(Schemas.resourcesUsed._schema)
            .filter(function(e, d) {
                return d.indexOf("$.") > -1;
            })
            .map(function(d) {
                return d.label;
            })
            .compact()
            .without('Name/Alias')
            .value();
    },
    resources: function() {
        return this.data.subjects.subject;
    },
    resource: function() {
        return _.map(this, function(d) {
            return d;
        });
    },
    fileUploads: function(d) {
        return Session.get('fileUploads');
    },
    subjectTableView: function(d) {
        var isView = Session.equals('subjectTableView', d);
        return isView ? '' : 'hide';
    },
    showFindLocation: function() {
        var record = Session.get('record');
        if (!record) {
            return false;
        }
        var findCoord = record.coords.findCoord;
        var highRole = Roles.userIsInRole(Meteor.user(), ['admin', 'editor']);
        return (highRole && findCoord) ? true : false;
    },
    disableFindLocationForm: function() {
        var record = Session.get('record');
        if (!record) {
            return;
        }
        var findCoord = record.coords.findCoord;
        var highRole = Roles.userIsInRole(Meteor.user(), ['admin', 'editor']);
        return (highRole && findCoord) ? 'update' : 'disabled';
    },
    initialDirectionofTravelClass: function() {
        var initialDirectionofTravel_Boolean = this.incidentOperations.initialDirectionofTravel_Boolean === 'Yes' ? true : false;
        Session.set('initialDirectionofTravel_Boolean', initialDirectionofTravel_Boolean);
        return initialDirectionofTravel_Boolean ? 'show' : 'hide';
    }
});
Template.form.events({
    'change [name="incidentLocation.country"]': function(event, template) {
        return Session.set('country', event.currentTarget.value);
    },
    'mouseout .travelDir': function(event, template) {
        clicking = false;
        $('[name="incidentOperations.initialDirectionofTravel"]')
            .val($('.knobVal')
                .html())
            .trigger("change");
    },
    'click .editRecordInfo': function(event) {
        var item = event.target.getAttribute('data');
        return Session.set('editRecordInfo', item);
    },
    'click .formNav': function(event, template) {
        $('.collapse')
            .collapse('hide');
        $('#collapse_' + this.name)
            .collapse('toggle');
    },
    'click .newSubject': function(event, template) {
        var record = Session.get('record');
        Meteor.call('pushArray', record._id, 'subjects.subject', function(err, d) {
            if (err) {
                console.log(err);
            }
        });
    },
    'click .removeSubject': function(event, template) {
        var record = Session.get('record');
        Meteor.call('removeSubject', record._id, event.target.getAttribute('data'), function(err) {
            if (err) {
                console.log(err);
            }
        });
    },
    'click .newResource': function(event, template) {
        var record = Session.get('record');
        Meteor.call('pushArray', record._id, 'resourcesUsed.resource', function(err, d) {
            if (err) {
                console.log(err);
            }
        });
    },
    'click .removeResource': function(event, template) {
        var record = Session.get('record');
        Meteor.call('removeResource', record._id, event.target.getAttribute('data'), function(err) {
            if (err) {
                console.log(err);
            }
        });
    },
    'change .formNav': function(event, template) {
        $('.collapse')
            .collapse('hide');
        $('#collapse_' + this.name)
            .collapse('toggle');
    },
    'change .bsDateInput': function(event, template) {
        var record = Session.get('record');
        var name = event.target.name;
        if (name === 'timeLog.lastSeenDateTime' || name === 'timeLog.subjectLocatedDateTime' || name === 'timeLog.SARNotifiedDatetime') {
            var startTime = $('[name="timeLog.lastSeenDateTime"]')
                .val();
            var startTimeSAR = $('[name="timeLog.SARNotifiedDatetime"]')
                .val();
            var endTime = $('[name="timeLog.subjectLocatedDateTime"]')
                .val();
            if (startTime && endTime) {
                var duration = moment.duration(moment(endTime)
                    .diff(moment(startTime)));
                var elapsedTime = Math.round(duration.asHours());
                console.log(elapsedTime);
                Meteor.call('updateRecord', record._id, 'timeLog.totalMissingHours', elapsedTime, function(err, d) {
                    console.log(d);
                    if (err) {
                        return console.log(err);
                    }
                });
            } else if ($('[name="timeLog.totalMissingHours"]')
                .val()) {
                Meteor.call('updateRecord', record._id, 'timeLog.totalMissingHours', '', function(err, d) {
                    console.log(d);
                    if (err) {
                        return console.log(err);
                    }
                });
            }
            if (startTimeSAR && endTime) {
                var duration = moment.duration(moment(endTime)
                    .diff(moment(startTimeSAR)));
                var elapsedTime = Math.round(duration.asHours());
                Meteor.call('updateRecord', record._id, 'timeLog.totalSearchHours', elapsedTime, function(err, d) {
                    console.log(d);
                    if (err) {
                        return console.log(err);
                    }
                });
            } else if ($('[name="timeLog.totalSearchHours"]')
                .val()) {
                Meteor.call('updateRecord', record._id, 'timeLog.totalSearchHours', '', function(err, d) {
                    console.log(d);
                    if (err) {
                        return console.log(err);
                    }
                });
            }
        }

        /*var record = Session.get('record');
        if (!record || record.weather) {
            return;
        }
        Meteor.call('setWeather', record._id, {
            unset: true
        }, function(err, d) {
            console.log(err, d)
            if (err) {
                $('.panel-title:contains("Weather")')
                    .parent()
                    .next()
                    .prepend('<p class="small em mar0y text-danger">Unable to retreive weather data</p>')
                return console.log(err);
            }
        });*/
    },
    'click .mapPoints .btn': function(event, template) {
        e = event
        var context = template.$(event.currentTarget);
        var pointType = context.attr('data');
        var active = context.hasClass('active');
        console.log(pointType)
        if (!map || pointType === 'ippCoordinates') {
            event.stopPropagation();
            return;
        }
        var coords = getCoords(Session.get('record'));
        var item = _.findWhere(coords, {
            val: pointType
        });
        //console.log(active, item)
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
    'click .fileUpload': function(event, template) {
        var record = Session.get('record');
        var file = event.target.getAttribute('data');
        var url = '/uploads/records'
        url += '/' + record._id;
        url += '/' + file;
        window.open(url);
    },
    'click .subjectTableView label': function(event, template) {
        var dataAttr = event.currentTarget.children[0].getAttribute('data');
        Session.set('subjectTableView', dataAttr);
    },
    'blur #formIdMap input': function(event, template) {
        var record = Session.get('record');
        var name = event.target.name;
        var value = event.target.value;
        console.log(name, value)
        if (name.indexOf('coords.') !== -1) {
            val = name.split('.');
            console.log(val)
            if (val.length !== 3) {
                return;
            }
            if (record[val[0]][val[1]][val[2]] === parseFloat(value)) {
                return;
            }
            map.editPoint(val[1]);
        }
    },
    'change [name*="subjects.subject"][name*="status"]': function(event) {
        var val = event.target.value;
        var ind = event.target.getAttribute('name')
            .split('.')[2];
        if (val === "Injured" || val === 'DOA') {
            $('.subjectRescueRow[data-index="' + ind + '"] select')
                .not('[name*="status"]')
                .not('[name*="evacuationMethod"]')
                .attr('disabled', false);
        } else {
            $('.subjectRescueRow[data-index="' + ind + '"] select')
                .not('[name*="status"]')
                .not('[name*="evacuationMethod"]')
                .attr('disabled', true);
        }
    },
    'click #weatherBtn': function(event, template) {
        var id = Session.get('record')
            ._id;
        Meteor.call('setWeather', id, function(err, d) {

            if (err) {
                $(event.target)
                    .replaceWith('<p class="small em mar0y text-danger">Unable to retreive weather data</p>')


                return console.log(err);
            } else {}
        });
    },
    'click #mapCalcBtn': function(event, template) {
        var recordId = Session.get('record')
            ._id;
        Meteor.call('setDistance', recordId, function(err, d) {
            if (err) {
                return console.log(err);
            }
        });
        Meteor.call('setBearing', recordId, 'findLocation.findBearing', function(err, d) {
            if (err) {
                return console.log(err);
            }
        });
        Meteor.call('setDispersionAngle', recordId, function(err, d) {
            if (err) {
                return console.log(err);
            }
        });
        Meteor.call('setEcoRegion', recordId, function(err, d) {
            if (err) {
                return console.log(err);
            }
        });
        if (!Session.get('config')
            .internet) {
            return;
        }
        Meteor.call('setElevation', recordId, function(err, d) {
            if (err) {
                return console.log(err);
            }
        });
        /*Meteor.call('setLocale', recordId, function(err, d) {
            if (err) {
                return console.log(err);
            }
        });*/
    },
    'change [name="incidentOperations.lkp_pls_Boolean"]': function(event) {
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
    'change [name="incidentOutcome.incidentOutcome"]': function(event) {
        var val = event.target.value;
        if (val !== 'Open/Suspended') {
            $('[name="incidentOutcome.suspensionReasons"]')
                .parent()
                .addClass('hide');
        } else {
            $('[name="incidentOutcome.suspensionReasons"]')
                .parent()
                .removeClass('hide');
        }
    },
    'change [name="incidentOutcome.injuredSearcher"]': function(event) {
        var val = event.target.value;
        if (val === 'Yes') {
            $('[name="incidentOutcome.injuredSearcherDetails"]')
                .parent()
                .removeClass('hide');
        } else {
            $('[name="incidentOutcome.injuredSearcherDetails"]')
                .parent()
                .addClass('hide');
        }
    },
    'change [name="incidentOperations.initialDirectionofTravel_Boolean"]': function(event) {
        var val = event.target.value === 'Yes' ? true : false;
        Session.set('initialDirectionofTravel_Boolean', val);
        var record = Session.get('record');
        if (val) {} else {
            Meteor.call('updateRecord', record._id, 'incidentOperations.initialDirectionofTravel', null, function(err, d) {
                if (err) {
                    return console.log(err);
                }
            });
        }
    },
});
AutoForm.hooks({
    updateResourceForm: {
        onSuccess: function(insertDoc, updateDoc, currentDoc) {
            $('#updateResourceForm')
                .find('input,select')
                .val('');
        }
    }
});
var encryptionKey = Meteor.settings.public.encryptionKey;
Records.before.update(function(userId, doc, fieldNames, modifier, options) {
    //console.log(userId, doc, fieldNames, modifier, options)
    if (modifier && modifier.$set && Object.keys(modifier.$set)
        .length) {
        console.log(modifier)
        var hide = ['name', 'address', 'homePhone', 'cellPhone', 'other'];
        var fields = Object.keys(modifier.$set)
            .map(function(d) {
                return {
                    field: d.substr(d.lastIndexOf('.') + 1),
                    name: d
                }
            });
        console.log(fields)
        _.each(fields, function(d) {
            if (_.contains(hide, d.field)) {
                console.log(d)
                    /*console.log(d.name,CryptoJS.AES.encrypt(modifier.$set[d.name], encryptionKey)
                        .toString())*/
                modifier.$set[d.name] = CryptoJS.AES.encrypt(modifier.$set[d.name], encryptionKey)
                    .toString();
            }
        });
    }
});
AutoForm.addHooks(null, {
    onSuccess: function(formType, result, c) {
        //.log(this, formType, result, c);
        var autoSaveChangedElement = this.autoSaveChangedElement || {};
        var field;
        var value;
        if (formType === 'insert') {
            field = this.insertDoc.recordInfo.name;
            value = this.insertDoc
        } else if (this.autoSaveChangedElement) {
            var autoSaveChangedElement = this.autoSaveChangedElement
            field = autoSaveChangedElement.name;
            value = autoSaveChangedElement.value;
        }
        RecordsAudit.insert({
            'type': formType,
            'recordId': this.docId,
            'userId': Meteor.userId(),
            'userName': Meteor.user()
                .username,
            'field': field,
            'value': value,
            'date': moment()
                .format('MM/DD/YYYY HH:mm')
        });
    }
});
formSetMap = function(context, recordId) {
    var markers = {};
    var paths = {};
    var coords = {};
    c = coords;
    var obj = {};
    var map = L.map(context);
    var units = (Session.get('measureUnits') === 'Metric') ? true : false;
    L.Control.measureControl({
            metric: units
        })
        .addTo(map);
    var defaultLayers = Meteor.settings.public.layers;
    var layers = _.object(_.map(defaultLayers, function(x, e) {
        return [e, L.tileLayer(x)];
    }));
    var firstLayer = Object.keys(layers)[0];
    layers[firstLayer].addTo(map);
    L.control.layers(layers)
        .addTo(map);
    var bounds = boundsString2Array(Session.get('bounds'));
    map.fitBounds(bounds);
    drawnPaths = new L.FeatureGroup()
        //.addTo(map);
    drawnPoints = new L.FeatureGroup()
        //.addTo(map);
    map.scrollWheelZoom.disable();
    /*map.on('moveend', function() {
        var bounds = map.getBounds()
            .toBBoxString();
        $('[name="coords.bounds"]')
            .val(bounds)
            .trigger("change");
    });*/
    obj.add = function(d) {
        var val = d.val;
        if (!d.path) {
            coords[val] = d;
            obj.addPoint(d);
            return;
        }
        if (val === 'intendedRoute' || val === 'actualRoute') {
            coords[d.val] = d;
            if (d.coords) {
                return obj.addPoly(d, JSON.parse(d.coords));
            }
            var start = coords.ippCoordinates.layer.getLatLng();
            var end;
            var dest = (val === 'intendedRoute') ? 'destinationCoord' : 'findCoord';
            if (coords[dest]) {
                end = coords[dest].layer.getLatLng()
            } else {
                var bounds = map.getBounds();
                var north = bounds._northEast;
                var south = bounds._southWest
                latDiff = ((north.lat - south.lat) / 1);
                lngDiff = ((south.lng - north.lng) / 1);
                north = {
                    lat: north.lat - latDiff,
                    lng: north.lng + lngDiff
                };
                south = {
                    lat: south.lat + latDiff,
                    lng: south.lng - lngDiff
                }
                var lat = Math.random() * (north.lat - south.lat) + south.lat;
                var lng = Math.random() * (south.lng - north.lng) + north.lng;
                end = {
                    lat: lat,
                    lng: lng
                };
            }
            var latlngs = [
                [start.lat, start.lng],
                [end.lat, end.lng]
            ];
            obj.addPoly(d, latlngs);
        }
    };
    obj.remove = function(d) {
        if (d.path) {
            obj.removePoly(d);
        } else {
            obj.removePoint(d);
            return;
        }
    };
    obj.addPoly = function(d, latlngs) {
        color = d.path.stroke;
        var polyline = L.polyline(latlngs, {
            color: color,
            opacity: 0.9,
            name: d.name,
            val: d.val,
            //editable: true
        });
        drawnPaths.addLayer(polyline);
        marker.setZIndexOffset(4);
        coords[d.val].layer = polyline;
        var lineString = JSON.stringify(latlngs);
        if (!$('[name="' + d.name + '"]')
            .val()) {
            Meteor.call('updateRecord', recordId, d.name, lineString, function(err, d) {
                if (err) {
                    return console.log(err);
                }
            });
        }
        polyline.on('click', function(d) {
            polyline.editing.enable();
        });
        polyline.on('dblclick', function(d) {
            polyline.editing.disable();
        });
        $('#formMap')
            .on('mouseup', '.leaflet-editing-icon', function(d) {
                drawnPaths.eachLayer(function(layer) {
                    var name = layer.options.name;
                    if (layer._path) {
                        latlngs = layer.getLatLngs()
                            .map(function(d) {
                                return [d.lat, d.lng]
                            });
                        var lineString = JSON.stringify(latlngs);
                        $('[name="' + name + '"]')
                            .val(lineString)
                            .trigger("change");
                        return;
                    }
                });
            })
            //var lineString = JSON.stringify(layer.toGeoJSON());
    };
    obj.removePoly = function(d) {
        if (!d || !d.val) {
            return;
        }
        Meteor.call('updateRecord', recordId, d.name, null, function(err, result) {
            if (err) {
                return console.log(err);
            }
            var path = coords[d.val].layer;
            drawnPaths.removeLayer(path);
            delete coords[d.val];
        });
    };
    obj.removePoint = function(d) {
        if (!d || !d.val) {
            return;
        }
        var marker = coords[d.val].layer;
        if (!marker) {
            return;
        }
        $('[name="' + d.name + '.lng"]')
            .val('')
            .trigger("change");
        $('[name="' + d.name + '.lat"]')
            .val('')
            .trigger("change");
        drawnPoints.removeLayer(marker);
        delete coords[d.val];
    };
    obj.editPoint = function(name) {
        var coords = Records.findOne(recordId)
            .coords[name];
        var layer = drawnPoints.getLayers()
            .filter(function(d) {
                return d.options.name === 'coords.' + name;
            });
        if (!layer.length) {
            return;
        }
        layer[0].setLatLng([coords.lat, coords.lng]);
        obj.fitBounds();
    };
    var addLocations = ['_southWest', '_northEast'];
    //m = map
    obj.addPoint = function(d) {
        var _coords = d.coords; // || map.getCenter();
        if (!d.coords) {
            var bounds = map.getBounds();
            var north = bounds._northEast;
            var south = bounds._southWest
            latDiff = ((north.lat - south.lat) / 4);
            lngDiff = ((south.lng - north.lng) / 4);
            north = {
                lat: north.lat - latDiff,
                lng: north.lng + lngDiff
            };
            south = {
                lat: south.lat + latDiff,
                lng: south.lng - lngDiff
            }
            var lat = Math.random() * (north.lat - south.lat) + south.lat;
            var lng = Math.random() * (south.lng - north.lng) + north.lng;
            var _coords = {
                lat: lat,
                lng: lng
            }
        }
        var myIcon = L.AwesomeMarkers.icon({
            icon: d.icon,
            prefix: 'fa',
            markerColor: d.color,
            iconColor: d.tColor || '#fff',
            extraClasses: d.extraClasses
        });
        var draggable = (Roles.userIsInRole(Meteor.userId(), ['editor', 'admin'])) ? true : false;
        marker = L.marker(_coords, {
            draggable: draggable,
            icon: myIcon,
            name: d.name,
            val: d.val,
        });
        var text = d.text;
        coords[d.val].layer = marker;
        drawnPoints.addLayer(marker);
        if (!$('[name="' + d.name + '.lng"]')
            .val()) {
            Meteor.call('updateRecord', recordId, d.name + '.lng', _coords.lng, function(err, d) {
                if (err) {
                    return console.log(err);
                }
            });
            Meteor.call('updateRecord', recordId, d.name + '.lat', _coords.lat, function(err, d) {
                if (err) {
                    return console.log(err);
                }
            });
        }
        marker.on('dragend', function(event) {
            var marker = event.target;
            var position = marker.getLatLng();
            Meteor.call('updateRecord', recordId, d.name, position, function(err, res) {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        });
        return marker;
    }
    obj.fitBounds = function() {
        map.fitBounds(drawnPoints.getBounds()
            .pad(0.5));
        drawnPaths.addTo(map);
        drawnPoints.addTo(map);
    };
    return obj;
}
