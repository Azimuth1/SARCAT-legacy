//Template.dpReplacement.replaces("afBootstrapDateTimePicker");
var mapDrawn;
var drawn;
Session.setDefault('modal', false);
Session.setDefault('tableHide', false);
Template.records.onCreated(function (a) {
    Tracker.autorun(function () {
        var count = Records.find()
            .count()
        Session.set('count', count);
    });
})
Template.records.onRendered(function () {
    drawn = false;
    if (Records.find()
        .count()) {
        $('.recordTable')
            .bootstrapTable();
    }
    Session.set('userView', 'records');
    var bounds = Session.get('bounds');
    var newBounds = boundsString2Array(bounds);
    mapDrawn = newProjectSetMap('recordMap', newBounds, {
        "name": "coords.ippCoordinates",
        "text": "Incident Location"
    });
    $('#createRecordModal')
        .on('hidden.bs.modal', function (e) {
            Session.set('modal', false);
            $('.recordTable')
                .bootstrapTable();
        })
        .on('show.bs.modal', function (e) {
            Session.set('modal', true);
            $('.recordTable')
                .bootstrapTable('destroy');
        })
        .on('shown.bs.modal', function (e) {
            /* 
            //http://ipinfo.io/developers

            $('.datetimepicker')
                 .datetimepicker({
                     use24hours: true,
                     format: 'HH:mm'
                 });

             $('.datetimepicker')
                 .datetimepicker({
                     locale: moment.locale(),
                     maxDate: new Date()
                 });
             $('.datetimepicker input')
                 .val(new Date()
                     .toLocaleString())
                 .trigger('change')*/
            mapDrawn.reset();
        });
});
Template.records.helpers({
    modal: function () {
        return Session.get('modal');
    },
    allRecords: function () {
        return this.records;
    },
    config: function () {
        return Session.get('config');
    },
    isAdmin: function () {
        return Roles.userIsInRole(Meteor.userId(), ['admin']);
    },
    noRecords: function () {
        return !Records.find({}, {
                sort: {
                    name: 1
                }
            })
            .fetch()
            .length;
    },
    newRecord: function () {
        return Records.findOne(Session.get('newRecord'));
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
    toDateString: function (date) {
        if (!date) {
            return;
        }
        return moment(date)
            .format('MM/DD/YYYY HH:mm')
    },
    selectedRecords: function () {
        //console.log(checked = $('.bs-checkbox [name="btSelectItem"]:checked')[0])
        return Session.get('selectedRecords');
    },
    tableHide: function () {
        return Session.get('tableHide');
    }
});
Template.records.events({
    'click .modal-backdrop': function () {
        var record = Records.findOne(Session.get('newRecord'));
        Meteor.call('removeRecord', record, function (error, d) {
            console.log(error, d)
        })
    },
    'click .recordStats': function (event, template) {
        if (drawn) {
            return;
        }
        drawn = true;
        template.$('a[data-toggle="tab"][href="#recordStats"]')
            .on('shown.bs.tab', function (e) {
                stats();
            });
    },
    'click .openRecord': function (event, template) {
        if (event.target.className === 'bs-checkbox') {
            return;
        }
        Router.go('form', {
            _id: event.currentTarget.id
        });
    },
    'click .deleteRecord': function (event, template) {
        var toDelete = $('.bs-checkbox [name="btSelectItem"]:checked')
            .parent()
            .parent()
            .map(function (d) {
                return {
                    id: this.id,
                    name: Records.findOne(this.id)
                        .recordInfo.name
                };
            });
        if (!toDelete.length) {
            return;
        }
        var message = 'Are you sure you want to delete the following records: ' + _.map(toDelete, function (d) {
                return d.name;
            })
            .join(', ');
        if (confirm(message)) {
            toDelete.each(function (e, d) {
                console.log(d)
                Meteor.call('removeRecord', d.id, function (error, d) {
                    var checked = $('.bs-checkbox [name="btSelectItem"]:checked');
                    Session.set('selectedRecords', checked.length);
                });
            });
            //Meteor._reload.reload();
            return true;
        } else {
            return false;
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
    'change .bs-checkbox input,[name="btSelectAll"]': function (event, template) {
        var checked = $('.bs-checkbox [name="btSelectItem"]:checked');
        Session.set('selectedRecords', checked.length);
    },
    'change [name="btSelectAll"]': function (event, template) {
        setTimeout(function () {
            var checked = $('.bs-checkbox [name="btSelectItem"]:checked');
            Session.set('selectedRecords', checked.length)
        }, 100)
    },
    'click #downloadRecords': function (event, template) {
        var flatten = function (x, result, prefix) {
            if (_.isObject(x)) {
                _.each(x, function (v, k) {
                    flatten(v, result, prefix ? prefix + '.' + k : k)
                })
            } else {
                result[prefix] = x
            }
            return result
        }
        var allRecords = Records.find();
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
            Session.set('tableHide', true);
            // $('.recordTable').bootstrapTable('destroy');
        },
        endSubmit: function () {
            Session.set('tableHide', false);
        },
        onSuccess: function (formType, result) {
            /*$('.recordTable')
                .bootstrapTable('destroy');*/
            //Meteor._reload.reload();
            $('#createRecordModal')
                .modal('hide');
        },
        // Called when any submit operation fails
        onError: function (formType, error) {
            console.log(error);
        },
    }
});

