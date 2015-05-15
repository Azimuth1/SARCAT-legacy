var map;
Template.admin.onCreated(function (a) {
    Session.set('userView', 'admin');
});
Template.admin.onRendered(function (a) {
    $('label:contains("Forecast API Key")')
        .append('<span class="forecastio small em mar0y text-default">*Auto-calculate weather by getting a key from <a class="em" href="https://developer.forecast.io/" target="_blank">Forecast</a></span>');
    $('label:contains("MapQuest API Key")')
        .append('<span class="forecastio small em mar0y text-default">*Auto-calculate elevation by getting a key from <a class="em" href="http://open.mapquestapi.com/elevation/" target="_blank">MapQuest</a></span>');
    var logo = document.getElementById('agencyLogo');
    logo.src = 'uploads/logo/' + Session.get('logo');
    logo.style.display = 'inline';
    var bounds = Session.get('bounds');
    var newBounds = boundsString2Array(bounds);
    map = setAdminMap('adminMap', bounds);
    this.data.users.forEach(function (d) {
        var role = d.roles[0];
        var id = d._id;
        $('input[name="role_' + id + '"][value="' + role + '"]')
            .prop("checked", true)
    });
});
Template.admin.helpers({
    userAlert: function (a, b) {
        setTimeout(function () {
            $('.userAlert').fadeOut(500, function () {
                Session.set('userAlert', null);
            })
        }, 500)
        return Session.get('userAlert');
    },
    userAlertClass: function () {
        return Session.get('userAlert').error ? 'bg-danger text-danger' : 'bg-success text-success';
    },
    errorMessages: function () {
        return _.values(Session.get(ERRORS_KEY));
    },
    errorClass: function (key) {
        return Session.get(ERRORS_KEY)[key] && 'error';
    },
    profileIncomplete: function () {
        var agencyProfile = Session.get('agencyProfile');
        var done = _.compact(_.map(agencyProfile, function (d) {
                return d;
            }))
            .length;
        return done ? '' : 'afPanel warning mar00 noBorder';
    },
    configs: function () {
        return Session.get('config');
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
                    if (err) {
                        return console.log(err);
                    }
                    // Meteor._reload.reload();
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
            if (err) {
                return console.log(err);
            }
            //Meteor._reload.reload();
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
        var origRole = this.roles[0];
        var username = this.username;
        var val = $('input[name="role_' + user + '"]:checked')
            .val();
        Meteor.call('changeRole', user, val, function (err) {
            if (err) {
                console.log(err);
            } else {
                Session.set('userAlert', {
                    error: false,
                    text: username + ' Successfully Changed from ' + origRole + ' To ' + val + '!'
                });
            }
        });
    }
});
var hooksObject = {
    onSuccess: function (insertDoc, updateDoc, currentDoc) {
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
