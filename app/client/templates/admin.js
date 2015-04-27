var config;
var map;
Template.admin.created = function () {
    Session.set('userView', 'admin');
};
Template.admin.rendered = function () {
    var config = Session.get('config');
    var bounds = config.bounds;
    var newBounds = boundsString2Array(bounds);
    map = setMap('adminMap', newBounds);
    this.data.users.forEach(function (d) {
        var role = d.roles[0];
        var id = d._id;
        $('input[name="role_' + id + '"][value="' + role + '"]')
            .prop("checked", true)
    });
};
Template.admin.helpers({
    logo: function (view) {
        return Session.get('logo');
    },
    defaultLogo: function (view) {
        return Session.equals('logo', 'uploads/logo/default_logo.png');
    },
    UploadImgFormData: function () {
        return {
            type: 'logo'
        };
    },
    agencyCoordinates: function () {
        return agencyCoordinates;
    },
    profileIncomplete: function () {
        var config = Config.findOne();
        var done =  _.compact(_.map(config.agencyProfile, function (d) {
            return d;
        })).length;
    return done ? '' : 'afPanel warning';
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
    uploadLogo: function (a, b) {
        return {
            finished: function (index, fileInfo, context) {
                Meteor.call('updateConfig', {
                    agencyLogo: fileInfo.name
                }, function (err) {
                    console.log(err);
                    //Meteor._reload.reload();
                });
            }
        };
    },
});
Template.admin.events({
    'click .deleteLogo': function (event, template) {
        Meteor.call('updateConfig', {
            agencyLogo: 'default_logo.png'
        }, function (err) {
            console.log(err);
        });
    },
    'click .saveBounds': function (event, template) {
        m = map;
        var bounds = map.getBounds()
            .toBBoxString();
        Meteor.call('updateConfig', {
            'bounds': bounds
        }, function (error, d) {
            if (error) {
                console.log(error);
            }
        });
    },
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
    /*'click .adminMap': function (event, template) {
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
    },*/
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
/*
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
});*/

