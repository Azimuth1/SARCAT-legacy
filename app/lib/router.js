//var initSetup;
console.log('router.js');
Meteor.startup(function () {
    console.log('router-startup')
    if (!Meteor.isServer) {
        Tracker.autorun(function () {
            var config = Config.findOne();
            if (config) {
                console.log('config')
                Session.set('config', config);
                Session.set('agencyProfile', config.agencyProfile);
                Session.set('bounds', config.bounds);
                Session.set('bounds', config.bounds);
                Session.set('logo', config.agencyLogo);
                Session.set('measureUnits', config.measureUnits);

            }
        });
        settings = Meteor.settings.public;
        config = Meteor.settings.public.config;

            //console.log(Meteor.settings)
            //initSetup = Meteor.settings.public.config.initSetup;
    }
});
Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});
Handlebars.registerHelper('isEqual', function (a, b) {
    return a === b;
});
Router.configure({
    layoutTemplate: 'appBody',
    notFoundTemplate: 'appNotFound',
    loadingTemplate: 'appLoading',
    waitOn: function () {
        return [
            Meteor.subscribe('publicLists'),
            Meteor.subscribe('userData'),
            Meteor.subscribe('config'),
            Meteor.subscribe('roles'),
        ];
    },
    onBeforeAction: function () {
        if (Config.findOne()
            .initSetup) {
            Router.go('adminSetup');
        }
        this.next();
    },
    action: function () {
        if (this.ready()) {
            this.render();
        } else {
            this.render('appLoading');
        }
    }
});
Router.route('home', {
    path: '/',
    action: function () {
        if (Meteor.user()) {
            if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
                Router.go('admin');
            } else {
                Router.go('records', Meteor.user());
            }
        } else {
            Router.go('signin');
        }
    }
});
Router.route('adminSetup', {
    path: '/adminSetup',
    //layoutTemplate: null,
    onBeforeAction: function () {
        if (!Config.findOne()
            .initSetup) {
            Router.go('signin');
        }
        this.next();
    }
});
Router.route('join');
Router.route('signin');
Router.route('records', {
    path: '/records',
    waitOn: function () {
        return [this.subscribe('publicLists')];
    },
    data: function () {
        var obj = {};
        obj.users = Meteor.users.find();
        obj.records = Records.find({},{
            sort: {
                    'recordInfo.incidentnum': -1
                }
        });
        return obj;
    },
    action: function () {
        if (this.ready()) {
            this.render();
        }
    }
});
Router.route('admin', {
    path: '/admin',
    waitOn: function () {
        return this.subscribe('userData');
    },
    data: function () {
        var obj = {};
        obj.users = Meteor.users.find();
        obj.records = Records.find();
        return obj;
    },
    action: function () {
        if (this.ready()) {
            this.render();
        }
    }
});
Router.route('appLoading');
Router.route('profiles');
Router.route('about');
Router.route('form', {
    path: '/form/:_id',
    waitOn: function () {
        return this.subscribe('item', this.params._id);
    },
    data: function () {
        var obj = {};
        obj.record = Records.findOne(this.params._id);
        return obj;
    },
    action: function () {
        if (this.ready()) {
            this.render();
        }
    }
});
/*
meteor add insecure
meteor add autopublish
meteor remove insecure
meteor remove autopublish
*/

