var map;
Template.userhome.onCreated(function (a) {
    Session.set('editUserInfo', false);
    Session.set('userView', 'userhome');
});
Template.admin.onRendered(function (a) {});
Template.userhome.helpers({
    currentUser: function () {
        return Meteor.user();
    },
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
    configs: function () {
        return Session.get('config');
    },
    userEmail: function () {
        return this.emails[0].address;
    },
    editUserInfo: function () {
        return Session.get('editUserInfo');
    },
    btnTextDisabled: function () {
        var current = Session.get('editUserInfo');
        return current ? 'Cancel' : 'Edit Username/Email';
    },
    settings: function () {
        var fields = _.chain(allInputs).filter(function (d) {
            return d.tableVisible;
        }).map(function (d) {
            return {
                //headerClass: 'lightBlue-bg',
                //cellClass: 'white-bg',
                key: d.field,
                fieldId: d.field,
                label: function () {
                    return new Spacebars.SafeString('<span class="hideInTable strong">' + d.parent + ' - </span><i>' + d.label + '</i>');
                },
                hidden: d.tableVisible ? false : true,
                parent: d.parent
            };
        }).value();
        return {
            showColumnToggles: false,
            collection: Records.find({
                'admin.userId': Meteor.userId()
            }),
            rowsPerPage: 50,
            showFilter: false,
            class: "table table-hover table-bordered table-condensed pointer",
            fields: fields,
            showNavigation: 'auto',
            showNavigationRowsPerPage: false,
        };
    },
});
Template.userhome.events({
    'click .resetUserPassword': function (event, template) {
        Meteor.call('setPassword', Meteor.userId(), null, true, true, function (err, d) {
            console.log(err, d)
            if (err) {
                console.log(err);
            } else {
                Meteor.logout(function () {
                    Session.set('adminRole', false);
                    Session.set('passwordReset', false);
                    Router.go('signin');
                });
            }
        });
        /*Meteor.logout(function () {
            Session.set('adminRole', false);
            Session.set('passwordReset', false);
            Router.go('signin');
        });*/
    },
    'click .editUserInfo': function (event, template) {
        var current = Session.get('editUserInfo');
        Session.set('editUserInfo', !current);
        event.target.blur();
    },
    'click .reactive-table tr': function (event) {
        if (!this._id || _.contains(event.target.classList, "recordSel")) {
            return;
        }
        event.preventDefault();
        return Router.go('form', {
            _id: this._id
        });
    },
});
