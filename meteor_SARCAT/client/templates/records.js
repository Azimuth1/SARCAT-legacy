var mapDrawn;
var drawn;


Template.records.onRendered(function () {



    Session.set('userView', 'records');
    var config = Config.findOne();
    var agencyProfile = config.agencyProfile;
    var bounds = agencyProfile.bounds;
    var newBounds = boundsString2Array(bounds);

    mapDrawn = newProjectSetMap('recordMap', newBounds, {
        "name": "coords.ippCoordinates",
        "text": "Incident Location"
    });
    $('#createRecordModal')
        .on('shown.bs.modal', function (e) {
            mapDrawn.reset();
        });



});
Template.records.helpers({
    lists: function () {
        return Records.find({}, {sort: {name: 1}});
    },
    newRecord: function () {
        return Records.findOne(Session.get('newRecord'));
    },
    createNewBtn: function () {
        var profile = Config.findOne().agencyProfileComplete;
        var agencyMapComplete = Config.findOne().agencyMapComplete;
        var role = Roles.userIsInRole(Meteor.userId(), ['admin', 'editor']);
        return profile && agencyMapComplete && role;
    },

});
Template.records.events({
    'click #createRecordModal button': function () {
        // $('#createRecordModal').modal('hide')
    },
    'click .js-deleteRecord': function () {
        var record = Records.findOne(Session.get('newRecord'));
        Meteor.call('removeRecord', record, function (error, d) {
            console.log(error, d)
        })
    },

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

                var records = Records.find().fetch();

                data = recordStats(records);

                var coords = records.map(function (d) {
                    return d.coords
                });
                var mapBounds = coords[0].bounds;
                mapBounds = boundsString2Array(mapBounds);

                map = statsSetMap('statsMap', mapBounds);

                var mapPoints = {
                    "ippCoordinates": {
                        "val": "ippCoordinates",
                        "name": "coords.ippCoordinates",
                        "text": "IPP Location. <br>Direction of Travel (hover to edit): <div class=\"fa fa-arrow-circle-up fa-2x fa-fw travelDirection\"></div>",
                        "icon": "fa-times-circle-o text-black"
                    },
                    "decisionPointCoord": {
                        "val": "decisionPointCoord",
                        "name": "coords.decisionPointCoord",
                        "text": "Decision Point",
                        "icon": "fa-code-fork text-danger"
                    },
                    "destinationCoord": {
                        "val": "destinationCoord",
                        "name": "coords.destinationCoord",
                        "text": "Intended Destination",
                        "icon": "fa-bullseye text-default"
                    },
                    "revisedLKP-PLS": {
                        "val": "revisedLKP-PLS",
                        "name": "coords.revisedLKP-PLS",
                        "text": "Revised IPP",
                        "icon": "fa-times-circle-o 4x text-success"
                    },
                    "findCoord": {
                        "val": "findCoord",
                        "name": "coords.findCoord",
                        "text": "Find Location",
                        "icon": "fa-male text-success"
                    },
                    "intendedRoute": {
                        "val": "intendedRoute",
                        "name": "coords.intendedRoute",
                        "text": "Intended Route",
                        "path": {
                            "stroke": "#018996"
                        }
                    },
                    "actualRoute": {
                        "val": "actualRoute",
                        "name": "coords.actualRoute",
                        "text": "Actual Route",
                        "path": {
                            "stroke": "#3C763D",
                            "weight": 8
                        }
                    }
                };
                _.each(mapPoints, function (d) {
                    coords.forEach(function (e) {
                        var latlng = e[d.val];
                        if (!latlng) {
                            return
                        };
                        d.coords = latlng;
                        map.add(d);
                    });

                })

                map.fitBounds();
            });

    },

    'click .js-newRecord': function (event, template) {

        var list = {
            userId: Meteor.userId()
        };
        list._id = Meteor.call('addRecord', list, function (error, d) {
            if (error) {
                console.log(error);
            }
            Session.set('newRecord', d);
        });

    }
});
