var mapDrawn;
Template.records.onCreated(function(a) {
    Session.set('activeRecord', false);
    Session.set('selectedRecords', 0);
});
Template.records.onRendered(function() {
    var records = Records.find().fetch();
    r = records
    Session.set('userView', 'records');
    var bounds = Session.get('bounds');
    var newBounds = boundsString2Array(bounds);
    mapDrawn = newProjectSetMap('recordMap', newBounds, {
        "name": "coords.ippCoordinates",
        "text": "Incident Location"
    });
    $('#createRecordModal')
        .on('shown.bs.modal', function(e) {
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
    settings: function() {
        var fields = _.chain(allInputs).filter(function(d) {
            return d.tableList;
        }).map(function(d) {
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
        }).value();
        fields.unshift({
            //headerClass: 'text-center',
            cellClass: 'recordSel',
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
        fields[1].sortByValue = true;
        fields[1].sort = 'ascending';
        return {
            showColumnToggles: true,
            collection: Records,
            rowsPerPage: 500,
            showFilter: true,
            class: "table table-hover table-bordered table-condensed pointer",
            fields: fields,
            showNavigation: 'auto',
            showNavigationRowsPerPage: false,
        };
    },
    Records: function() {
        return Records;
    },
    userView: function(name) {
        console.log(Session.equals('userView', name))
        return Session.equals('userView', name);
    },
    allRecords: function() {
        return Records.find({}, {
            sort: {
                'recordInfo.incidentnum': -1
            }
        });
    },
    isAdmin: function() {
        return Roles.userIsInRole(Meteor.userId(), ['admin']);
    },
    noRecords: function() {
        return !Records.find()
            .count()
    },
    createNewBtn: function() {
        var agencyProfile = Session.get('agencyProfile');
        var profile = _.compact(_.map(agencyProfile, function(d) {
                return d;
            }))
            .length;
        var role = Roles.userIsInRole(Meteor.userId(), ['admin', 'editor']);
        return profile && role;
    },
    selectedRecords: function() {
        return Session.get('selectedRecords');
    },
    recordMap: function() {
        return Session.get('recordMap');
    },
    summary: function() {
        var ar = [];
        arr.push({
            name: 'Total Incidents',
            val: Records.find().count()
        })
        return arr;
    }
});
Template.records.events({
    'click .reactive-table tr': function(event) {
        if (!this._id || _.contains(event.target.classList, "recordSel")) {
            return;
        }
        event.preventDefault();
        return Router.go('form', {
            _id: this._id
        });
    },
    'click .createSampleRecords': function(event) {
        insertSampleRecords()
    },
    'click .openRecord': function(event, template) {
        if (event.target.className === 'recordSel') {
            return;
        }
        return Router.go('form', {
            _id: event.currentTarget.id
        });
    },
    'click .deleteRecord': function(event, template) {
        var toDelete = $('.recordSel:checked')
            .map(function() {
                return this.value
            })
            .toArray();
        var names = $('.recordSel:checked')
            .map(function() {
                return this.name;
            })
            .toArray();
        if (!toDelete.length) {
            return;
        }
        var message = 'Are you sure you want to delete the following records: ' + names.join(',')
        if (confirm(message)) {
            console.log('!!!')
            Meteor.call('removeRecord', toDelete, function(error, d) {
                console.log(error, d)
                if (error) {
                    return console.log(error);
                }
                var checked = Session.get('selectedRecords')
                    .length;
                Session.set('selectedRecords', checked);
                $('.recordSelAll').prop('checked', false)
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
    },
    'change .recordSel': function(event, template) {
        var checked = $('.recordSel:checked')
            .map(function() {
                return this.value
            })
            .toArray();
        Session.set('selectedRecords', checked.length);
    },
    'change .recordSelAll': function(event, template) {
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
    'click #viewMap': function(event, template) {
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
    'click .uploadISRID': function(event, template) {

        var checked = $('.recordSel:checked')
            .map(function() {
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
        var toUpload = {
            data: allRecords,
            profile:Meteor.settings.public.config
        };
       // return toUpload;
        Meteor.call('uploadISRID', {data:toUpload}, function(error, d) {
            console.log(error, d)

        });



    },
    'click #downloadRecords': function(event, template) {
        var checked = $('.recordSel:checked')
            .map(function() {
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
        allRecordsFlat = allRecords.map(function(d) {
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
                        row += '' + arrData[i][index] + ',';
                    }
                    console.log(row)
                    row.slice(0, row.length - 2);
                    console.log(row)
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
        beginSubmit: function() {},
        endSubmit: function() {},
        onSuccess: function(formType, result) {
            return Router.go('form', {
                _id: result
            });
            //$('#createRecordModal').modal('hide');
        },
        onError: function(formType, error) {
            console.log(error);
        },
    }
});
