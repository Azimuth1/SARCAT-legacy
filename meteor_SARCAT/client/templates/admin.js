var mapDrawn;

var config;
Template.admin.created = function () {
    Session.set('userView', 'admin');
    config = Session.get('config');
    mapDrawn = false;
};

Template.admin.rendered = function () {
    this.data.users.forEach(function (d) {
        var role = d.roles[0];
        var id = d._id;
        $('input[name="role_' + id + '"][value="' + role + '"]')
            .prop("checked", true)
    });
};
Template.admin.helpers({
    agencyCoordinates: function () {
        return agencyCoordinates;
    },
    profileIncomplete: function () {
        var complete = completeProfile();
        Session.set('profileComplete', complete);
        return !complete;
    },
    configs: function () {
        return Config.findOne();
    },
    userEmail: function () {
        return this.emails[0].address;
    },
    removeUser: function (a) {
        Meteor.call('removeUser', this._id, function (err) {
            console.log(err);
        });
    },
    // roleIsChecked: function (event) {
    //var roles = this.roles;
    //console.log(event)
    //return true;
    //return this.roles[0] === $(e.target).val();
    /*console.log(this)
    $('input[name="role_oS8Y6oZC5WraaCnPW"]:checked')
        .val();
    return 'checked';*/
    // },
    userRoleList: function () {
        return this.users.fetch()
            .filter(function (d) {
                return d._id !== Meteor.userId()
            })
    },
});

Template.admin.events({
    'click .removeUser': function (event, template) {

        if (Meteor.userId() === this._id) {
            alert('You cannot remove your own account!');
            return;
        }
        Meteor.call('removeUser', this._id, function (err) {
            console.log(err);
        });
    },
    'click .adminMap': function (event, template) {
        template.$('a[data-toggle="tab"][href="#adminMapTab"]')
            .on('shown.bs.tab', function (e) {
                if (mapDrawn) {
                    return;
                }
                var config = Config.findOne();
                var agencyMapComplete = config.agencyMapComplete;
                var agencyProfile = config.agencyProfile;
                var bounds = agencyProfile.bounds;
                var newBounds = boundsString2Array(bounds);
                mapDrawn = setMap('adminMap', newBounds, agencyMapComplete);

            });

    },
    'change .adminUserRoles': function (event) {
        var user = this._id;
        var val = $('input[name="role_' + user + '"]:checked')
            .val();
        Meteor.call('changeRole', user, val, function (err) {
            if (err) {
                console.log(err);
            }
        });

    }
});

AutoForm.hooks({
    formIdAgencyProfile: {

        onSuccess: function (insertDoc, updateDoc, currentDoc) {
            var config = Config.findOne();
            if (!config) {
                return;
            }
            var agencyProfile = config.agencyProfile;
            var apKeys = Object.keys(agencyProfile);
            var complete = apKeys.length === Schemas.agencyProfile._schemaKeys.length;
            if (complete) {
                Meteor.call('updateConfig', {
                    agencyProfileComplete: true
                }, function (error, d) {
                    if (error) {
                        console.log(error);
                    }

                });
            }
        }
    }
});
