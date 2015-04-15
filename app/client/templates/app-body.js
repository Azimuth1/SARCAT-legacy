var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);
var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);
var config;
/*
geojson.features=[geojson.features[99]]
console.log(pip([132.0927,44.8397],geojson));


var gjLayer = L.geoJson(geojson);
results = leafletPip.pointInLayer([132.0927,44.8397], gjLayer);
console.log(results)
*/



Template.appBody.onCreated(function () {

});
Template.appBody.onRendered(function () {});

Template.appBody.helpers({
    logo: function (view) {
        var config = Config.findOne();
        if (config) {
            return 'uploads/logo/' + config.agencyLogo;
        } 

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
