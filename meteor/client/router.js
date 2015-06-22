Meteor.startup(function() {
    Tracker.autorun(function() {
        var config = Config.findOne();

        if (config) {
            Session.set('records', Records.find().fetch());
            Session.set('config', config);
            Session.set('agencyProfile', config.agencyProfile);
            Session.set('bounds', config.bounds);
            Session.set('bounds', config.bounds);
            Session.set('logo', config.agencyLogo);
            if (config.agencyLogo) {
                Session.set('logoSrc', 'uploads/logo/' + config.agencyLogo);
            }
            Session.set('measureUnits', config.measureUnits);
        }
    });
});

Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});
Handlebars.registerHelper('isEqual', function(a, b) {
    return a === b;
});
Router.configure({
    layoutTemplate: 'appBody',
    notFoundTemplate: 'appNotFound',
    loadingTemplate: 'appLoading',
    waitOn: function() {
        return [
          
            Meteor.subscribe('userData'),
            Meteor.subscribe('config'),
            Meteor.subscribe('roles'),
            Meteor.subscribe('audit'),
        ];
    },
    onBeforeAction: function() {
        if (Config.findOne()
            .initSetup) {
            Router.go('adminSetup');
        }

        this.next();
    },
    action: function() {
        if (this.ready()) {
            this.render();
        } else {
            this.render('appLoading');
        }
    }
});
Router.route('home', {
    path: '/',
    action: function() {
        if (Meteor.user()) {
            if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
                Router.go('admin');
            } else {
                Router.go('userhome', Meteor.user());
            }
        } else {
            Router.go('signin');
        }
    }
});
Router.route('adminSetup', {
    path: '/adminSetup',
    //layoutTemplate: null,
    onBeforeAction: function() {
        if (!Config.findOne()
            .initSetup) {
            Router.go('home');
        }
        this.next();
    },
    action: function() {
        if (this.ready()) {
            this.render();
        }
    }
});
Router.route('join');
Router.route('signin');
Router.route('appLoading');
Router.route('profiles');
Router.route('about');

Router.route('userhome', {
    path: '/userhome',
    waitOn: function() {
        return this.subscribe('records');
    },
    action: function() {
        if (!Meteor.userId()) {
            Router.go('home');
        }
        if (this.ready()) {
            this.render();
        }
    }
});
Router.route('records', {
    path: '/records',
    waitOn: function() {
        return this.subscribe('records');
    },
    action: function() {
        if (!Meteor.userId()) {
            Router.go('home');
        }
        if (this.ready()) {
            this.render();
        }
    }
});

Router.route('form', {
    path: '/form/:_id',
    waitOn: function() {
        return this.subscribe('item', this.params._id);
    },
    data: function() {
        var params = this.params;
        return Records.findOne({
            _id: params._id
        });
    },
    action: function() {

        if (!Meteor.userId()) {
            Router.go('home');
        }
        if (this.ready()) {
            this.render();
        }
    }
});

Router.route('stats', {
    path: '/stats',
    waitOn: function() {
        return this.subscribe('records');
    },
    action: function() {
        if (!Meteor.userId()) {
            Router.go('home');
        }
        if (this.ready()) {
            this.render();
        }
    }
});


Router.route('report', {
    path: '/report/:ids',
    waitOn: function() {
        return this.subscribe('records');
    },
    data: function() {
        var checked = this.params.ids.split('.');
        var allRecords = Records.find({
                '_id': {
                    $in: checked
                }
            })
            .fetch();
        return allRecords;
    },
    action: function() {
        if (!Meteor.userId()) {
            Router.go('home');
        }
        console.log(this.data())
        if (this.ready()) {
            this.render();
        }
    }
});


Router.route('admin', {
    path: '/admin',
    waitOn: function() {
        return this.subscribe('userData');
    },
    data: function() {
        var obj = {};
        obj.users = Meteor.users.find();
        obj.records = Records.find();
        obj.title = 'ddd';
        return obj;
    },
    action: function() {
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            Router.go('home');
        }
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
Resource Responses
*/
