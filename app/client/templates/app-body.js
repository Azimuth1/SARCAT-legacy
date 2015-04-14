var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);
var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);

Template.appBody.onCreated(function () {

    HTTP.get('/uploads/logo/main_logo', null, function (error, result) {
        if (!error) {
            result = '/uploads/logo/main_logo';
            Session.set('logo', '/uploads/logo/main_logo');
        } else {
            Session.set('logo', '/uploads/logo/default_logo')

        };
    });

});
Template.appBody.onRendered(function () {});

Template.appBody.helpers({
    logo: function (view) {
        return Session.get('logo');

    },
    isUserView: function (view) {
        view = view || this._id;
        var active = Session.get('userView') === view;
        return active ? 'primary-bg' : '';
    },
    isAdmin: function () {
        return Roles.userIsInRole(Meteor.userId(), ['admin']);
    },
    agencyProfileInComplete: function () {
        var config = Config.findOne();
        if (!config) {
            return;
        }
        return !config.agencyProfileComplete;

    },
    agencyMapInComplete: function () {
        var config = Config.findOne();
        if (!config) {
            return;
        }
        return !config.agencyMapComplete;

    },
    thisArray: function () {
        return [this];
    },
    menuOpen: function () {
        return Session.get(MENU_KEY) && 'menu-open';
    },
    cordova: function () {
        return Meteor.isCordova && 'cordova';
    },

    lists: function () {
        return Records.find();
    },
    activeListClass: function () {
        var current = Router.current();
        if (current.params._id === this._id) {
            return 'active';
        }
    },
    connected: function () {
        if (Session.get(SHOW_CONNECTION_ISSUE_KEY)) {
            return Meteor.status()
                .connected;
        } else {
            return true;
        }
    },
    samplerecords: function () {
        return sampleRecords.find();
    }
});
Template.appBody.events({
    'click .userView': function (event) {
        var target = $(event.target)
            .attr('data');
        Session.set('userView', target);
    },
    'click .js-menu': function () {
        Session.set(MENU_KEY, !Session.get(MENU_KEY));
    },
    'click .content-overlay': function (event) {
        Session.set(MENU_KEY, false);
        event.preventDefault();
    },
    'click #menu a': function () {
        Session.set(MENU_KEY, false);
    },
    'click .js-logout': function () {
        Session.set('adminRole', false);
        Meteor.logout();
        Router.go('signin');
    },

});

