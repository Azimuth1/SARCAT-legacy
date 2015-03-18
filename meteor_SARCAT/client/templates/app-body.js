var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);
var USER_MENU_KEY = 'userMenuOpen';
Session.setDefault(USER_MENU_KEY, false);
var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);
var CONNECTION_ISSUE_TIMEOUT = 500;
Meteor.startup(function() {
    //Session.set('userView','Dashboard');
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
    /*setTimeout(function() {
        //console.log('timeout')
        // Launch screen handle created in lib/router.js
        //dataReadyHold.release();
        // Show the connection error box
        Session.set(SHOW_CONNECTION_ISSUE_KEY, true);
    }, CONNECTION_ISSUE_TIMEOUT);*/
});
Template.appBody.rendered = function() {

    //$('.userView[data=userStats]').click();
    //console.log($('.userView[data=userStats]')[0])
  /*this.find('#content-container')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn(function () {
          listFadeInHold.release();
        });
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        $(this).remove();
      });
    }
  };*/
};
Template.appBody.helpers({
    isAdmin: function(){
        return Roles.userIsInRole(Meteor.userId(), ['admin']);
    },
    /*formComplete: function() {
        var name = 'profile';
        var obj = Meteor.user()[name];
        var formLen = _.filter(obj,function(d){
            var val = d;
            if (val === 'Unknown' || val === '' || !val) {
                val = false;
            }
            return val;
        }).length;
        var schemaLen = Schemas.profile._schemaKeys.length;
        return (formLen === schemaLen);
    },*/
    thisArray: function() {
        return [this];
    },
    menuOpen: function() {
        return Session.get(MENU_KEY) && 'menu-open';
    },
    cordova: function() {
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
    /*'click .userView': function(event,template) {
        //console.log(event,template,event.target.text)
        Session.set('userView',event.target.text);
        //Router.go('home');
        
        //event.preventDefault();
    },*/

  

    'click .btns-userHome a': function(event) {
        $('.btns-userHome a').removeClass('primary-bg');
        $(event.currentTarget).addClass('primary-bg');
    },
    'click .userView': function(event) {
        var target = $(event.target).attr('data');
        Session.set('userView',target);
        Router.go('user-home', Meteor.user());
    },
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
    'click .js-newRecord': function() {
        var list = {
            //name: Records.defaultName(),
            userId: Meteor.userId()
        };
        list._id = Meteor.call('addRecord', list, function(error, d) {
            if (error) {
                console.log(error);
            }
            list._id = d;
            Router.go('form', list);
        });
    }
});
