//Template.dpReplacement.replaces("afBootstrapDateTimePicker");
var mapDrawn;
var drawn;
Session.setDefault('modal', false);
Session.setDefault('tableHide', false);
Template.records.onCreated(function (a) {
    Session.set('modal', false);
    Session.set('tableHide', false);
    Session.set('selectedRecords', 0);
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
            mapDrawn.reset();
        });
});
Template.records.helpers({
    userView: function(name){
console.log(Session.equals('userView',name))
        return Session.equals('userView',name);
    },
    modal: function () {
        return Session.get('modal');
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
        return Session.get('selectedRecords')
            .length ? true : false;
    },
    tableHide: function () {
        return Session.get('tableHide');
    }
});
Template.records.events({

    'click .openRecord': function (event, template) {
        if (event.target.className === 'recordSel') {
            return;
        }
        return Router.go('form', {
            _id: event.currentTarget.id
        });
    },
    'click .deleteRecord': function (event, template) {
        var toDelete = Session.get('selectedRecords');
        if (!toDelete.length) {
            return;
        }
        var all = Records.find()
            .fetch();
        var names = _.map(toDelete, function (d) {
            return _.findWhere(all, {
                    _id: d
                })
                .recordInfo.name;
        })
        var message = 'Are you sure you want to delete the following records: ' + names.join(',')
        if (confirm(message)) {
            console.log(toDelete);
            $('.recordTable')
                .bootstrapTable('destroy');
            Session.set('tableHide', true);
            Meteor.call('removeRecord', toDelete, function (error, d) {
                var checked = Session.get('selectedRecords')
                Session.set('selectedRecords', checked);
                if (error) {
                    return console.log(error);
                }
                Session.set('tableHide', false);
                setTimeout(function () {
                    $('.recordTable')
                        .bootstrapTable();
                }, 300);
            });
            //Meteor._reload.reload();
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
        Session.set('selectedRecords', checked);
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

