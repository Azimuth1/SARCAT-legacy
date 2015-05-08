flatten = function (x, result, prefix) {
    if (_.isObject(x)) {
        _.each(x, function (v, k) {
            flatten(v, result, prefix ? prefix + '.' + k : k)
        })
    } else {
        result[prefix] = x
    }
    return result
}
var mapDrawn;
var drawn;
var filterFields
Session.setDefault('recordMap', false);
Template.records.onCreated(function (a) {
    Session.set('activeRecord', false);
    Session.set('selectedRecords', 0);
    var records = Records.find().fetch();
    Session.set('allRecords', records);
    var activeFields = ["recordInfo.name", "recordInfo.incidentnum", "recordInfo.missionnum", "recordInfo.incidentdate", "recordInfo.incidenttype", "recordInfo.status"];
    var allFields = _.map(Schemas.SARCAT._schema, function (d, e) {
        return {
            headerClass: 'default-bg',
            cellClass: 'white-bg',
            key: e,
            fieldId: e,
            label: d.label,
            hidden: !_.contains(activeFields, e),
            parent: e.split('.')[0]
        };
    });
    Session.set('allFields', allFields);
    var keep = ["subjects.subject.$.age", "subjects.subject.$.sex", "subjects.subject.$.status", "subjects.subject.$.evacuationMethod", "incident.SARNotifiedDateTime", "incident.contactmethod", "incident.county-region", "incident.ecoregionDivision", "incident.incidentEnvironment", "incident.landCover", "incident.landOwner", "incident.populationDensity", "incident.subjectcategory", "incident.terrain", "incidentOperations.PLS_HowDetermined", "incidentOperations.ippclassification", "incidentOperations.ipptype", "incidentOutcome.detectability", "incidentOutcome.distanceIPP", "incidentOutcome.findFeature", "incidentOutcome.incidentOutcome", "incidentOutcome.lostStrategy", "incidentOutcome.mobility&Responsiveness", "incidentOutcome.mobility_hours", "incidentOutcome.scenario", "incidentOutcome.suspensionReasons", "recordInfo.incidentdate", "recordInfo.incidentnum", "recordInfo.incidenttype", "recordInfo.missionnum", "recordInfo.name", "recordInfo.status", "rescueDetails.signalling", "resourcesUsed.distanceTraveled", "resourcesUsed.numTasks", "resourcesUsed.totalCost", "resourcesUsed.totalManHours", "resourcesUsed.totalPersonnel", "weather.precipType"];
    filterFields = _.map(keep, function (d) {
        return _.findWhere(allFields, {
            key: d
        });
    });
    Session.set('filterFields', filterFields);
})
Template.records.onRendered(function () {
    var records = Records.find()
        .fetch();
    if (Session.get('recordMap')) {
        var recordMap = recordsSetMap('recordsMap', records);
        //Session.set('map',recordMap.map)
    }
    r = records
    dates = _.chain(records)
        .map(function (d) {
            return moment(d.recordInfo.incidentdate)
                .format('MM/DD/YYYY HH:mm');
        })
        .sortBy(function (d) {
            return new Date(d);
        })
        .value();
    drawn = false;
    Session.set('userView', 'records');
    var bounds = Session.get('bounds');
    var newBounds = boundsString2Array(bounds);
    mapDrawn = newProjectSetMap('recordMap', newBounds, {
        "name": "coords.ippCoordinates",
        "text": "Incident Location"
    });
    $('#createRecordModal')
        .on('shown.bs.modal', function (e) {
            AutoForm.resetForm('createRecordModalFormId');
            mapDrawn.reset();
        });
});
resourceArrayForm = function (data) {
    return _.chain(data.resourcesUsed.resource).sortBy(function (d) {
        return -d.count;
    }).map(function (d, e) {
        var sum = 'Total Count: ' + d.count + ',Total Hours: ' + d.hours;
        return {
            key: d.type,
            parent: 'Resources Used',
            val: sum
        };
    }).value()
};
subjectArrayForm = function (flatData, name, parent) {
    return _.chain(flatData).map(function (d, e) {
        if (e.indexOf('_key') > -1) {
            return;
        }
        if (e.indexOf('.' + name + '.') > -1) {
            return {
                key: e,
                val: d
            };
        }
    }).compact().groupBy(function (d) {
        return d.key.substr(d.key.lastIndexOf('.') + 1);
    }).map(function (d, e) {
        var items = d.map(function (f) {
            return f.val;
        }).sort();
        var sum = _.chain(items).reduce(function (counts, word) {
            counts[word] = (counts[word] || 0) + 1;
            return counts;
        }, {}).map(function (d, e) {
            return [d, e];
        }).sortBy(function (d) {
            return -d[0];
        }).map(function (d, e) {
            if (d[0] === 1) {
                return d[1];
            };
            return d[1] + '(' + d[0] + ')';
        }).value().join(', ');
        return {
            key: e,
            parent: parent,
            val: items.sort().join(', '),
            val: sum
        };
    }).value();
};
Template.records.helpers({
    stats: function () {
        var data = Session.get('activeRecord');
        if (!data) {
            return;
        }
        var filterFields = Session.get('filterFields');
        var flatData = flatten(data, {});
        f = flatData
        var displayData = _.chain(flatData)
            .map(function (d, e) {
                var goodVal = _.findWhere(filterFields, {
                    key: e
                });
                if (goodVal) {
                    return {
                        key: goodVal.label,
                        parent: Schemas.SARCAT._schema[goodVal.parent].label,
                        val: d
                    };
                }
            })
            .compact()
            .value();
        var subjects = subjectArrayForm(flatData, 'subject', 'Subjects');
        var resources = resourceArrayForm(data);
        displayData = _.flatten([displayData, subjects, resources]);
        //displayData = displayData.concat(displayData, resources);
        displayData2 = _.chain(displayData)
            .groupBy('parent')
            .map(function (d, e) {
                return {
                    field: e,
                    data: d
                };
            })
            .value();
        console.log(displayData, displayData2);
        return displayData2;
    },
    settings: function () {
        //["recordInfo.name", "recordInfo.incidentnum", "recordInfo.missionnum", "recordInfo.incidentdate", "recordInfo.incidenttype", "recordInfo.status"]
        var fields = Session.get('filterFields');
        fields.unshift({
            headerClass: 'default-bg text-center',
            cellClass: 'white-bg recordSel text-center pointer',
            fieldId: 'recordSel',
            key: 'cb',
            sortable: false,
            hideToggle: true,
            label: function () {
                return new Spacebars.SafeString('<input type="checkbox" class="recordSelAll">');
            },
            fn: function (value, obj) {
                return new Spacebars.SafeString('<input value="' + obj._id + '" name="' + obj.recordInfo.name + '" type="checkbox" class="recordSel">');
            }
        });
        fields[1].sortByValue = true;
        fields[1].sort = 'descending';
        return {
            showColumnToggles: true,
            collection: Records,
            rowsPerPage: 50,
            showFilter: true,
            class: "table table-hover table-bordered table-condensed pointer",
            fields: fields
        };
    },
    Records: function () {
        return Records;
    },
    userView: function (name) {
        console.log(Session.equals('userView', name))
        return Session.equals('userView', name);
    },
    allRecords: function () {
        return Records.find({}, {
            sort: {
                'recordInfo.incidentnum': -1
            }
        });
    },
    isAdmin: function () {
        return Roles.userIsInRole(Meteor.userId(), ['admin']);
    },
    noRecords: function () {
        return !Records.find()
            .count()
    },
    createNewBtn: function () {
        var agencyProfile = Session.get('agencyProfile');
        var profile = _.compact(_.map(agencyProfile, function (d) {
                return d;
            }))
            .length;
        var role = Roles.userIsInRole(Meteor.userId(), ['admin', 'editor']);
        return profile && role;
    },
    selectedRecords: function () {
        return Session.get('selectedRecords');
    },
    recordMap: function () {
        return Session.get('recordMap');
    }
});
Template.records.events({
    'click .reactive-table tr': function (event) {
        if (!this._id || _.contains(event.target.classList, "recordSel")) {
            return;
        }
        event.preventDefault();
        return Router.go('form', {
            _id: this._id
        });
    },
    'click .openRecord': function (event, template) {
        if (event.target.className === 'recordSel') {
            return;
        }
        return Router.go('form', {
            _id: event.currentTarget.id
        });
    },
    'click .deleteRecord': function (event, template) {
        var toDelete = $('.recordSel:checked')
            .map(function () {
                return this.value
            })
            .toArray();
        var names = $('.recordSel:checked')
            .map(function () {
                return this.name;
            })
            .toArray();
        if (!toDelete.length) {
            return;
        }
        var message = 'Are you sure you want to delete the following records: ' + names.join(',')
        if (confirm(message)) {
            Meteor.call('removeRecord', toDelete, function (error, d) {
                var checked = Session.get('selectedRecords')
                    .length;
                Session.set('selectedRecords', checked);
                if (error) {
                    return console.log(error);
                }
            });
        }
    },
    'blur [name="coords.ippCoordinates.lat"],[name="coords.ippCoordinates.lng"]': function (event, template) {
        var lat = template.$('[name="coords.ippCoordinates.lat"]')
            .val();
        var lng = template.$('[name="coords.ippCoordinates.lng"]')
            .val();
        if (!lat || !lng) {
            return;
        }
        console.log(lat, lng);
        mapDrawn.editPoint(lat, lng);
    },
    'change .recordSel': function (event, template) {
        var checked = $('.recordSel:checked')
            .map(function () {
                return this.value
            })
            .toArray();
        Session.set('selectedRecords', checked.length);
    },
    'change .recordSelAll': function (event, template) {
        var checked = event.target.checked;
        if (checked) {
            $('.recordSel')
                .prop('checked', true);
        } else {
            $('.recordSel')
                .prop('checked', false)
        }
        Session.set('selectedRecords', checked);
    },
    'click #viewMap': function (event, template) {
        var currentMap = Session.get('recordMap');
        Session.set('recordMap', !currentMap);
        var newMap = !currentMap;
        if (newMap) {
            setTimeout(function () {
                recordsSetMap('recordsMap', Records.find()
                    .fetch());
            }, 100);
        }
    },
    'click #downloadRecords': function (event, template) {
        var checked = $('.recordSel:checked')
            .map(function () {
                return this.value;
            })
            .toArray();
        if (!checked.length) {
            return;
        }
        var allRecords = Records.find({
                '_id': {
                    $in: checked
                }
            })
            .fetch();
        allRecordsFlat = allRecords.map(function (d) {
            return flatten(d, {});
        })
        if (navigator.appName != 'Microsoft Internet Explorer') {
            function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
                var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
                var CSV = '';
                CSV += ReportTitle + '\r\n\n';
                if (ShowLabel) {
                    var row = "";
                    for (var index in arrData[0]) {
                        row += index + ',';
                    }
                    row = row.slice(0, -1);
                    CSV += row + '\r\n';
                }
                for (var i = 0; i < arrData.length; i++) {
                    var row = "";
                    for (var index in arrData[i]) {
                        row += '"' + arrData[i][index] + '",';
                    }
                    row.slice(0, row.length - 1);
                    CSV += row + '\r\n';
                }
                if (CSV == '') {
                    alert("Invalid data");
                    return;
                }
                var fileName = ReportTitle.replace(/ /g, "_");
                var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
                var link = document.createElement("a");
                link.href = uri;
                link.style = "visibility:hidden";
                link.download = fileName + ".csv";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            JSONToCSVConvertor(allRecordsFlat, "SARCAT EXPORT-" + new Date()
                .toLocaleString(), true);
            /*
            //var str = JSON.stringify(flattenedData);
            //window.open('data:application/json;charset=utf-8,' + escape(str));
            var uri = 'data:application/json;charset=utf-8,' + escape(str);
            var link = document.createElement("a");
            link.href = uri;

            link.style = "visibility:hidden";
            link.download = "SARCAT_Records_" + new Date().toLocaleString() + ".csv";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
*/
        } else {
            //ie
            //var popup = window.open('', 'csv', '');
            //popup.document.body.innerHTML = '<pre>' + str + '</pre>';
        }
    },
});
AutoForm.hooks({
    createRecordModalFormId: {
        beginSubmit: function () {
            $('#recordTable_wrapper')
                .remove();
            Session.set('tableHide', true);
        },
        endSubmit: function () {
            console.log('!')
            Session.set('tableHide', false);
            $('#recordTable')
                .DataTable()
        },
        onSuccess: function (formType, result) {
            $('#createRecordModal')
                .modal('hide');
        },
        onError: function (formType, error) {
            console.log(error);
        },
    }
});
