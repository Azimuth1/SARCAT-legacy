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
    profileIncomplete: function () {
        var config = Session.get('config');
        var done = _.compact(_.map(config.agencyProfile, function (d) {
                return d;
            }))
            .length;
        return done ? '' : 'afPanel warning mar00 noBorder';
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
    UploadImgFormData: function (a, b) {
        return {
            type: 'logo'
        };
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
        var r = confirm("Are you sure you want to delete your custom logo?");
        if (!r) {
            return;
        }
        Meteor.call('removeLogo', function (err) {
            console.log(err);
        });
        Meteor.call('updateConfig', {
            agencyLogo: ''
        }, function (err) {
            console.log(err);
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
var hooksObject = {
    onSuccess: function (insertDoc, updateDoc, currentDoc) {
        d = this
        context = $(this.event.target)
            .find('[type="submit"]');
        text = context.html();
        context.text('Saved....');
        context.delay(1000)
            .animate({
                opacity: 0
            }, function () {
                context.html(text)
                    .animate({
                        opacity: 1
                    });
            });
    }
}
AutoForm.addHooks(['formIdAgencyProfile', 'formIdAgencyMap', 'formIdConfig'], hooksObject);

