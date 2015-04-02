var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);
var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);

Meteor.startup(function () {
    $(document.body)
        .touchwipe({
            wipeLeft: function () {
                Session.set(MENU_KEY, false);
            },
            wipeRight: function () {
                Session.set(MENU_KEY, true);
            },
            preventDefaultEvents: false
        });
});
Template.appBody.created = function () {};
Template.appBody.rendered = function () {};
Template.appBody.helpers({
    isUserView: function (view) {
        view = view || this._id;
        var active = Session.get('userView') === view;
        return active ? 'primary-bg' : '';
    },
    isAdmin: function () {
        return Roles.userIsInRole(Meteor.userId(), ['admin']);
    },
    noProfile: function () {
        var profile = agencyProfileComplete();
        return !profile;
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
    /* emailLocalPart: function() {
         var user = Meteor.user();
         var firstName = user.profile.firstName;
         if (firstName) {
             return firstName;
         }
         var email = user.emails[0].address;
         return email.substring(0, email.indexOf('@'));
     },*/
    /*userMenuOpen: function() {
        return Session.get(USER_MENU_KEY);
    },*/
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

        if (target === 'records') {
            Router.go('user-home', Meteor.user());
        }
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
    /*    'click .js-newRecord': function() {
            var list = {
                userId: Meteor.userId()
            };
            list._id = Meteor.call('addRecord', list, function(error, d) {
                if (error) {
                    console.log(error);
                }
                list._id = d;
                Router.go('form', list);
            });
        }*/
});

