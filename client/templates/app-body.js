var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);
var USER_MENU_KEY = 'userMenuOpen';
Session.setDefault(USER_MENU_KEY, false);
var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);
var CONNECTION_ISSUE_TIMEOUT = 5000;
//Session.setDefault('defaultEmail', null);
settings = Meteor.settings.public;
Template.appBody.onCreated(function () {});
Template.appBody.onRendered(function () {});
Template.appBody.helpers({
    summary: function () {
        var records = Session.get('records');
        if (!records) {
            return;
        }
        var subjectCount = _.chain(records).map(function (d) {
            if (!d.subjects || !d.subjects.subject) {
                return 0;
            }
            return d.subjects.subject.length
        }).reduce(function (sum, el) {
            return sum + el;
        }, 0).value();
        

        var subjectSubCount = _.chain(records).map(function (d) {
            if (!d.subjects || !d.subjects.subject) {
                return;
            }
            return d.subjects.subject
        }).flatten().compact().map(function (d) {
            return d.status;
        }).groupBy(function (d, e) {
            return d;
        }).map(function (d, e) {
            if (e === 'Unknown' || !d.length || !e) {
                return;
            }
            return {
                name: '# ' + e,
                val: d.length
            }
        }).compact().value();


        var yearCount = _.chain(records).filter(function (d) {
            return d.timeLog && d.timeLog.lastSeenDateTime
        }).filter(function (d) {
            return moment(new Date(d.timeLog.lastSeenDateTime)).year()>2013;
        }).map(function (d) {
            return moment(new Date(d.timeLog.lastSeenDateTime)).year()
        }).groupBy().map(function (d, e) {
            return {
                name: e + ' # of incidents ',
                val: d.length
            }
        }).reverse().value();
        var arr = [];
        arr.push({
            name: 'Total # of incidents',
            val: records.length
        });
        arr = _.flatten([arr, yearCount, {
            name: 'Total # of subjects',
            val: subjectCount
        }, subjectSubCount]);
        arr = arr.filter(function (d) {
            return d.val;
        });
        return arr;
    },
    cordova: function () {
        return Meteor.isCordova && 'cordova';
    },
    userMenuOpen: function () {
        return Session.get(USER_MENU_KEY);
    },
    email: function (view) {
        return Meteor.user()
            .emails[0].address.split('@')[0];
    },
    logo: function (view) {
        return Session.get('logo');
    },
    logoSrc: function () {
        return 'uploads/logo/' + Session.get('logo');
    },
    isUserView: function (view) {
        //console.log(Session.get('userView'))
        //return
        // console.log(view,this)
        //view = view || this._id;
        var active = Session.equals('userView', view);
        return active ? 'active strong' : '';
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
        return Session.get('records');
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
    'click .js-menu': function () {
        Session.set(MENU_KEY, !Session.get(MENU_KEY));
    },
    'click .content-overlay': function (event) {
        Session.set(MENU_KEY, false);
        event.preventDefault();
    },
    'click .js-user-menu': function (event) {
        Session.set(USER_MENU_KEY, !Session.get(USER_MENU_KEY));
        // stop the menu from closing
        event.stopImmediatePropagation();
    },
    'click #menu a': function () {
        Session.set(MENU_KEY, false);
    },
    'click .content-overlay': function (event) {
        Session.set(MENU_KEY, false);
        event.preventDefault();
    },
    'click .js-logout': function () {
        Meteor.logout(function () {
            Session.set('adminRole', false);
            Session.set('passwordReset', false);
            Router.go('signin');
        });
    },
});
