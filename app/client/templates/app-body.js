var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);
var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);
settings = Meteor.settings.public;
Template.appBody.onCreated(function () {});
Template.appBody.onRendered(function () {
});
Template.appBody.helpers({
    email: function (view) {
        return Meteor.user()
            .emails[0].address.split('@')[0];
    },
    logo: function (view) {
        return Session.get('logo');
    },
    isUserView: function (view) {
        view = view || this._id;
        var active = Session.equals('userView', view);
        return active ? 'primary-bg' : '';
    },
    isAdmin: function () {
        return Roles.userIsInRole(Meteor.userId(), ['admin']);
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
    'click .content-overlay': function (event) {
        Session.set(MENU_KEY, false);
        event.preventDefault();
    },
    'click .js-logout': function () {
        Meteor.logout(function () {
            Session.set('adminRole', false);
            Router.go('signin');
        });
    },
});
