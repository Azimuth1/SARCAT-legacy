var mapDrawn;
Template.records.onCreated(function (a) {
    Session.set('activeRecord', false);
    Session.set('selectedRecords', 0);
});
Template.records.onRendered(function () {
    var records = Records.find().fetch();
    r = records
        /*dates = _.chain(records)
            .map(function (d) {
                return moment(d.recordInfo.incidentdate)
                    .format('MM/DD/YYYY HH:mm');
            })
            .sortBy(function (d) {
                return new Date(d);
            })
            .value();*/
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
            $('[name="recordInfo.incidentEnvironment"]').val('Land')
            $('[name="recordInfo.incidentType"]').val('Search')
            mapDrawn.reset();
        });
    $('label:contains("Subject Category")')
        //$('[name="incident.subject.category"]')
        .after('<span class="small em mar0y text-default"><a class="em" href="/profiles" target="_blank"}}"> *info</span>');
});
Template.records.helpers({
    settings: function () {
        var activeFields = ["recordInfo.name", "recordInfo.incidentnum", "recordInfo.missionnum", "recordInfo.incidentdate", "recordInfo.incidentType", "recordInfo.status", "recordInfo.subjectCategory"];
        var keep = ["recordInfo.incidentdate", "recordInfo.incidentnum", "recordInfo.incidentType", "recordInfo.missionnum", "recordInfo.name", "recordInfo.status", "recordInfo.subjectCategory", "subjects.subject.$.evacuationMethod", "incident.SARNotifiedDateTime", "incident.contactmethod", "incidentLocation.county-region", "incidentLocation.ecoregionDivision", "recordInfo.incidentEnvironment", "incidentLocation.landCover", "incidentLocation.landOwner", "incidentLocation.populationDensity", "incidentLocation.terrain", "incidentOperations.PLS_HowDetermined", "incidentOperations.ippclassification", "incidentOperations.ipptype", "findLocation.detectability", "findLocation.distanceIPP", "findLocation.findFeature", "incidentOutcome.incidentOutcome", "incidentOutcome.lostStrategy", "incidentOutcome.mobility&Responsiveness", "incidentOutcome.mobility_hours", "incidentOutcome.scenario", "incidentOutcome.suspensionReasons", "incidentOutcome.signalling", "resourcesUsed.distanceTraveled", "resourcesUsed.numTasks", "resourcesUsed.totalCost", "resourcesUsed.totalManHours", "resourcesUsed.totalPersonnel", "weather.precipType"];
        var fields = _.map(keep, function (e) {
            //console.log(e);
            //console.log(Schemas.SARCAT._schema[e].label)
            var parent = e.split('.')[0];
            var parentLabel = Schemas.SARCAT._schema[parent].label;
            return {
                headerClass: 'default-bg',
                cellClass: 'white-bg',
                key: e,
                fieldId: e,
                label: function () {
                    return new Spacebars.SafeString('<span class="hideInTable strong">' + parentLabel + ' - </span><i>' + Schemas.SARCAT._schema[e].label + '</i>');
                },
                hidden: !_.contains(activeFields, e),
                parent: parent
            };
        });
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
                if (!obj.recordInfo) {
                    return;
                }
                return new Spacebars.SafeString('<input value="' + obj._id + '" name="' + obj.recordInfo.name + '" type="checkbox" class="recordSel">');
            }
        });
        fields[1].sortByValue = true;
        fields[1].sort = 'ascending';
        return {
            showColumnToggles: true,
            collection: Records,
            rowsPerPage: 50,
            showFilter: true,
            class: "table table-hover table-bordered table-condensed pointer",
            fields: fields,
            showNavigation: 'auto',
            showNavigationRowsPerPage: false,
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
    },
    summary: function () {
        var ar = [];
        arr.push({
            name: 'Total Incidents',
            val: Records.find().count()
        })
        return arr;
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
    'click .createSampleRecords': function (event) {
        insertSampleRecords()
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
        beginSubmit: function () {},
        endSubmit: function () {},
        onSuccess: function (formType, result) {
            $('#createRecordModal')
                .modal('hide');
        },
        onError: function (formType, error) {
            console.log(error);
        },
    }
});
