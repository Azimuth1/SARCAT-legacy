var mapDrawn;
var getSelectedRecords = function() {
    return $('.recordSel:checked')
        .map(function() {
            return this.value;
        })
        .toArray();
};
Template.records.onCreated(function() {
    Session.set('activeRecord', false);
    Session.set('selectedRecords', getSelectedRecords());
});
Template.records.onRendered(function() {
    records = Session.get('Records');
    Session.set('userView', 'records');
    var bounds = Session.get('bounds');
    var newBounds = boundsString2Array(bounds);
    mapDrawn = newProjectSetMap('recordMap', newBounds, {
        'name': 'coords.ippCoordinates',
        'text': 'Incident Location'
    });
    $('#createRecordModal')
        .on('shown.bs.modal', function() {
            AutoForm.resetForm('createRecordModalFormId');
            $('[name="recordInfo.incidentEnvironment"]')
                .val('Land');
            $('[name="recordInfo.incidentType"]')
                .val('Search');
            mapDrawn.reset();
        });
    $('label:contains("Subject Category")')
        //$('[name="incident.subject.category"]')
        .after('<span class="small em mar0y text-default"><a class="em" href="/profiles" target="_blank"}}"> *info</span>');
});
Template.records.helpers({
    userAlert: function() {
        setTimeout(function() {
            $('.userAlert')
                .fadeOut(900, function() {
                    Session.set('userAlert', null);
                });
        }, 1500);
        return Session.get('userAlert');
    },
    userAlertClass: function() {
        return Session.get('userAlert')
            .error ? 'bg-danger text-danger' : 'bg-success text-success';
    },
    settings: function() {
        var fields = _.chain(allInputs)
            .filter(function(d) {
                return d.tableList;
            })
            .map(function(d) {
                return {
                    //headerClass: 'lightBlue-bg',
                    //cellClass: 'white-bg',
                    key: d.field,
                    fieldId: d.field,
                    label: function() {
                        return new Spacebars.SafeString('<span class="hideInTable strong">' + d.parent + ' - </span><i>' + d.label + '</i>');
                    },
                    hidden: d.tableVisible ? false : true,
                    parent: d.parent
                };
            })
            .value();
        if (Roles.userIsInRole(Meteor.userId(), ['admin', 'editor'])) {
            fields.unshift({
                //headerClass: 'text-center',
                //cellClass: 'recordSel',
                fieldId: 'recordSel',
                key: 'cb',
                sortable: false,
                hideToggle: true,
                label: function() {
                    return new Spacebars.SafeString('<input type="checkbox" class="recordSelAll">');
                },
                fn: function(value, obj) {
                    if (!obj.recordInfo) {
                        return;
                    }
                    return new Spacebars.SafeString('<input value="' + obj._id + '" name="' + obj.recordInfo.name + '" type="checkbox" class="recordSel">');
                }
            });
        }
        fields[1].sortByValue = true;
        fields[1].sort = 'ascending';
        return {
            showColumnToggles: true,
            collection: Records,
            rowsPerPage: 100,
            showFilter: true,
            class: 'table table-hover table-bordered table-condensed pointer',
            fields: fields,
            showNavigation: 'auto',
            //showNavigationRowsPerPage: false,
        };
    },
    Records: function() {
        return Records;
    },
    record: function() {
        return Session.get('record');
    },
    hasRecords: function() {
        return Session.get('records')
            .length;
    },
    createNewBtn: function() {
        //return true;
        var agencyProfile = Session.get('agencyProfile');
        var profile = _.compact(_.map(agencyProfile, function(d) {
                return d;
            }))
            .length;
        var role = Roles.userIsInRole(Meteor.userId(), ['admin', 'editor']);
        return profile && role;
    },
    canCreateNewRecords: function() {
        var profileKeys = Object.keys(Session.get('agencyProfile'));
        var agencyProfile = Session.get('agencyProfile');
        var done = _.compact(_.map(agencyProfile, function(d) {
            return d;
        }));
        return done.length === profileKeys.length;

    },
    selectedRecords: function() {
        return Session.get('selectedRecords');
    },
    recordMap: function() {
        return Session.get('recordMap');
    }
});
Template.records.events({
    'click .reactive-table tr': function(event) {
        if (!this._id || _.contains(event.target.classList, 'recordSel')) {
            return;
        }
        event.preventDefault();
        return Router.go('form', {
            _id: this._id
        });
    },
    'click .createSampleRecords': function() {
        insertSampleRecords();
    },
    'click .openRecord': function(event) {
        if (event.target.className === 'recordSel') {
            return;
        }
        return Router.go('form', {
            _id: event.currentTarget.id
        });
    },
    'click .deleteRecord': function() {
        var toDeleteIDs = $('.recordSel:checked')
            .map(function() {
                return this.value;
            })
            .toArray();
        var toDelete = Session.get('records')
            .filter(function(d) {
                return _.contains(toDeleteIDs, d._id);
            });
        var names = toDelete
            .map(function(d) {
                return d.recordInfo.name;
            });
        if (!toDelete.length) {
            return;
        }
        var message = 'Are you sure you want to delete the following records: ' + names.join(',');
        if (confirm(message)) {
            Meteor.call('removeRecord', toDelete, function(error) {
                if (error) {
                    return console.log(error);
                }
                Session.set('selectedRecords', []);
                $('.recordSelAll')
                    .prop('checked', false);
            });
        }
    },
    'blur [name="coords.ippCoordinates.lat"],[name="coords.ippCoordinates.lng"]': function(event, template) {
        var lat = template.$('[name="coords.ippCoordinates.lat"]')
            .val();
        var lng = template.$('[name="coords.ippCoordinates.lng"]')
            .val();
        if (!lat || !lng) {
            return;
        }
        console.log(lat, lng);
        mapDrawn.editPoint(lat, lng);
        mapDrawn.fitBounds();
    },
    'change .recordSel': function() {
        Session.set('selectedRecords', getSelectedRecords());
    },
    'change .recordSelAll': function(event) {
        var checked = event.target.checked;
        var newVal = checked ? true : false;
        $('.recordSel')
            .prop('checked', newVal);
        Session.set('recordSelAll', newVal);
        Session.set('selectedRecords', getSelectedRecords());
    },
    'click #viewMap': function() {
        var currentMap = Session.get('recordMap');
        Session.set('recordMap', !currentMap);
        var newMap = !currentMap;
        if (newMap) {
            setTimeout(function() {
                recordsSetMap('recordsMap', Records.find()
                    .fetch());
            }, 100);
        }
    },
    'click .uploadISRID': function() {
        var checked = $('.recordSel:checked')
            .map(function() {
                return this.value;
            })
            .toArray();
        if (!checked.length) {
            var con = confirm('No Records Selected - Upload all records to ISRID database?');
            if (!con) {
                return;
            }
            checked = Session.get('records')
                .map(function(d) {
                    return d._id;
                });
        }
        var allRecords = Records.find({
                '_id': {
                    $in: checked
                }
            })
            .fetch();
        var hide = ['name', 'address', 'homePhone', 'cellPhone', 'other'];
        allRecords.forEach(function(d) {
            if (d.subjects && d.subjects.subject) {
                _.each(d.subjects.subject, function(e) {
                    _.each(e, function(g, h) {
                        if (_.contains(hide, h)) {
                            delete e[h];
                        }
                    });
                });
            }
        });
        var toUpload = {
            data: allRecords,
            profile: Session.get('config')
        };
        var r = confirm('Are you sure you want to upload ' + allRecords.length + ' records to ISRID Database?');
        if (!r) {
            return;
        }
        Meteor.call('uploadISRID', {
            data: toUpload
        }, function(err) {
            if (err) {
                return alert('Oops - there seems to be a problem uploading your data. \nPlease try again later or you may email a downloaded JSON to data@sarcat.com.');
            }
            return Session.set('userAlert', {
                error: false,
                text: 'Records Successfully Uploaded.'
            });
        });
    },
    'click #downloadRecords': function() {
        var checked = $('.recordSel:checked')
            .map(function() {
                return this.value;
            })
            .toArray();
        if (!checked.length) {
            var con = confirm('No Records Selected - Download all records?');
            if (!con) {
                return;
            }
            checked = Session.get('records')
                .map(function(d) {
                    return d._id;
                });
        }
        var allRecords = Records.find({
                '_id': {
                    $in: checked
                }
            })
            .fetch();
        var allRecordsFlat = allRecords.map(function(d) {
            return flatten(d, {});
        });
        var JSONToCSVConvertor = function(JSONData, ReportTitle) {
            var arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;
            var CSV = '';
            var titleRow = '';
            for (var index1 in arrData[0]) {
                titleRow += index1 + ',';
            }
            titleRow = titleRow.slice(0, -1);
            CSV += titleRow + '\r\n';
            for (var i = 0; i < arrData.length; i++) {
                var row = '';
                for (var index in arrData[i]) {
                    row += '' + arrData[i][index] + ',';
                }
                //console.log(row)
                row.slice(0, row.length - 2);
                //console.log(row)
                CSV += row + '\r\n';
            }
            if (CSV === '') {
                alert('Invalid data');
                return;
            }
            var fileName = ReportTitle.replace(/ /g, '_');
            var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
            var link = document.createElement('a');
            link.href = uri;
            link.style = 'visibility:hidden';
            link.download = fileName + '.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        JSONToCSVConvertor(allRecordsFlat, 'SARCAT EXPORT-' + new Date()
            .toLocaleString());
    },
    'click #downloadRecordsJSON': function() {
        var checked = $('.recordSel:checked')
            .map(function() {
                return this.value;
            })
            .toArray();
        if (!checked.length) {
            var con = confirm('No Records Selected - Download all records?');
            if (!con) {
                return;
            }
            checked = Session.get('records')
                .map(function(d) {
                    return d._id;
                });
        }
        var allRecords = Records.find({
                '_id': {
                    $in: checked
                }
            })
            .fetch();
        var allRecordsFlat = allRecords.map(function(d) {
            return flatten(d, {});
        });
        var JSONConvertor = function(JSONData, ReportTitle) {
            var fileName = ReportTitle.replace(/ /g, '_');
            var uri = 'data:text/csv;charset=utf-8,' + escape(JSON.stringify(JSONData));
            var link = document.createElement('a');
            link.href = uri;
            link.style = 'visibility:hidden';
            link.download = fileName + '.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        JSONConvertor(allRecordsFlat, 'SARCAT EXPORT-' + new Date()
            .toLocaleString());
    },
});
AutoForm.hooks({
    createRecordModalFormId: {
        beginSubmit: function() {},
        endSubmit: function() {},
        onSuccess: function(formType, result) {
            return Router.go('form', {
                _id: result
            });
        },
        onError: function(formType, error) {
            console.log(error);
        },
    }
});
