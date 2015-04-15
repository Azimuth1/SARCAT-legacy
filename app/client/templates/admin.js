var mapDrawn;

var config;
Template.admin.created = function () {
    Session.set('userView', 'admin');
    //config = Session.get('config');
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
    UploadImgFormData: function () {
        return {
            type: 'logo'
        };
    },

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

    userRoleList: function () {
        var users = this.users.fetch()
            .filter(function (d) {
                return d._id !== Meteor.userId()
            });
        return users.length ? users : false;
    },
    noUsers: function () {
        var users = this.users.fetch()
            .filter(function (d) {
                return d._id !== Meteor.userId()
            });
        return !users.length;
    },
    uploadLogo: function (a,b) {
        //console.log(a,b,this)
        return {
            finished: function (index, fileInfo, context) {
                Meteor.call('updateConfig', {
                    agencyLogo: fileInfo.name
                }, function (err) {
                    console.log(err);
                });
            }
        };
    },
});

Template.admin.events({


    'click .removeUser': function (event, template) {

        if (Meteor.userId() === this._id) {
            alert('You cannot remove your own account!');
            return;
        }

        var r = confirm("Are you sure you want to delete user: " + this.username);
        if (r == true) {
            Meteor.call('removeUser', this._id, function (err) {
                console.log(err);
            });
        } else {
            return;
        }

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
