var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);

var USER_MENU_KEY = 'userMenuOpen';
Session.setDefault(USER_MENU_KEY, false);

var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);

var CONNECTION_ISSUE_TIMEOUT = 5000;

settings = Meteor.settings.public;
Template.appBody.onCreated(function() {});
Template.appBody.onRendered(function() {});
Template.appBody.helpers({

    cordova: function() {
        return Meteor.isCordova && 'cordova';
    },

    userMenuOpen: function() {
        return Session.get(USER_MENU_KEY);
    },

    email: function(view) {
        return Meteor.user()
            .emails[0].address.split('@')[0];
    },
    logo: function(view) {
        return Session.get('logo');
    },
    logoSrc: function() {
        return 'uploads/logo/' + Session.get('logo');
    },
    isUserView: function(view) {
        //console.log(Session.get('userView'))
        //return
        // console.log(view,this)
        //view = view || this._id;
        var active = Session.equals('userView', view);
        return active ? 'active strong' : '';
    },
    isAdmin: function() {
        return Roles.userIsInRole(Meteor.userId(), ['admin']);
    },
    thisArray: function() {
        return [this];
    },
    menuOpen: function() {
        return Session.get(MENU_KEY) && 'menu-open';
    },
    cordova: function() {
        return Meteor.isCordova && 'cordova';
    },
    lists: function() {
        return Records.find();
    },
    activeListClass: function() {
        var current = Router.current();
        if (current.params._id === this._id) {
            return 'active';
        }
    },
    connected: function() {
        if (Session.get(SHOW_CONNECTION_ISSUE_KEY)) {
            return Meteor.status()
                .connected;
        } else {
            return true;
        }
    },
    samplerecords: function() {
        return sampleRecords.find();
    }
});
Template.appBody.events({
    'click .js-menu': function() {
        Session.set(MENU_KEY, !Session.get(MENU_KEY));
    },

    'click .content-overlay': function(event) {
        Session.set(MENU_KEY, false);
        event.preventDefault();
    },

    'click .js-user-menu': function(event) {
        Session.set(USER_MENU_KEY, !Session.get(USER_MENU_KEY));
        // stop the menu from closing
        event.stopImmediatePropagation();
    },

    'click #menu a': function() {
        Session.set(MENU_KEY, false);
    },
    'click .content-overlay': function(event) {
        Session.set(MENU_KEY, false);
        event.preventDefault();
    },
    'click .js-logout': function() {
        Meteor.logout(function() {
            Session.set('adminRole', false);
            Session.set('passwordReset', false);
            Router.go('signin');
        });
    },
});
