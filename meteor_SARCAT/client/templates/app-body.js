var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);
var USER_MENU_KEY = 'userMenuOpen';
Session.setDefault(USER_MENU_KEY, false);
var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);
var CONNECTION_ISSUE_TIMEOUT = 5000;
Meteor.startup(function() {
    // set up a swipe left / right handler
    $(document.body)
        .touchwipe({
            wipeLeft: function() {
                Session.set(MENU_KEY, false);
            },
            wipeRight: function() {
                Session.set(MENU_KEY, true);
            },
            preventDefaultEvents: false
        });
    // Only show the connection error box if it has been 5 seconds since
    // the app started
    setTimeout(function() {
        // Launch screen handle created in lib/router.js
        dataReadyHold.release();
        // Show the connection error box
        Session.set(SHOW_CONNECTION_ISSUE_KEY, true);
    }, CONNECTION_ISSUE_TIMEOUT);
});
Template.appBody.rendered = function() {
    this.find('#content-container')
        ._uihooks = {
            insertElement: function(node, next) {
                $(node)
                    .hide()
                    .insertBefore(next)
                    .fadeIn(function() {
                        //console.log(Meteor.user())
                        //listFadeInHold.release();
                    });
            },
            removeElement: function(node) {
                $(node)
                    .fadeOut(function() {
                        $(this)
                            .remove();
                    });
            }
        };
};
Template.appBody.helpers({
    // We use #each on an array of one item so that the "list" template is
    // removed and a new copy is added when changing lists, which is
    // important for animation purposes. #each looks at the _id property of it's
    // items to know when to insert a new item and when to update an old one.
    thisArray: function() {
        return [this];
    },
    menuOpen: function() {
        return Session.get(MENU_KEY) && 'menu-open';
    },
    cordova: function() {
        return Meteor.isCordova && 'cordova';
    },
    emailLocalPart: function() {
        var user = Meteor.user();

        var firstName = user.profile.firstName;
        if(firstName){return firstName;}
        var email = user.emails[0].address;
        return email.substring(0, email.indexOf('@'));
    },
    /*userMenuOpen: function() {
        return Session.get(USER_MENU_KEY);
    },*/
    lists: function() {
        return Records.find();
    },
    activeListClass: function() {
        var current = Router.current();
        //if (current.route.name === 'form' && current.params._id === this._id) {
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
    'click #menu a': function() {
        Session.set(MENU_KEY, false);
    },
    'click .js-logout': function() {
        Meteor.logout();
        Router.go('signin');
    },
    'click .js-userProfile': function() {
        Router.go('user-home', Meteor.user());
    },
    'click .js-newRecord': function() {
        var list = {
            //name: Records.defaultName(),
            userId: Meteor.userId()
        };
        list._id = Meteor.call('addRecord', list, function(error, d) {
            if (error) {
                console.log(error)
            }
            list._id = d;
            Router.go('form', list);
        });
    }
});
