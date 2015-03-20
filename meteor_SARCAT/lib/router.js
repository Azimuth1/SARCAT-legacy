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
            Meteor.subscribe('publicLists'),
            Meteor.subscribe('userData'),
            Meteor.subscribe('config'),
        ];
    }
});
dataReadyHold = null;
if (Meteor.isClient) {
    L.Icon.Default.imagePath = '/img';
    Router.onBeforeAction('loading', {
        except: ['join', 'signin']
    });
    Router.onBeforeAction('dataNotFound', {
        except: ['join', 'signin']
    });
}
var IR_Filters = {
    initSetup: function() {
        if (Config.findOne({
                initSetup: true
            })) {
            Router.go('adminSetup', Config.findOne());
        }
        this.next();
    },
    baseSubscriptions: function() {
        this.subscribe('userData').wait();
    },
    isLoggedIn: function() {
        if (!(Meteor.loggingIn() || Meteor.user())) {
            this.render();
        }
    },
    notLoggedIn: function() {
        if (!Meteor.user()) {
            Router.go('signin');
        }
        this.next();
    },
    scrollUp: function() {
        $('body,html').scrollTop(0);
    },
    isAdmin: function(pause) {
        if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            this.render();
            pause();
        }
    }
};
Router.map(function() {
    this.onBeforeAction(IR_Filters.initSetup);
    this.onBeforeAction('loading');
    this.route('home', {
        path: '/',
        action: function() {
            if (Meteor.user()) {
                Router.go('user-home', Meteor.user());
            } else {
                Router.go('signin');
            }
        }
    });
    this.route('adminSetup', {
        path: '/adminSetup / : _id ',
        layoutTemplate: null,
        onBeforeAction: function() {
            this.next();
        },
        data: function() {
            return Config.findOne();
        },
        action: function() {
            this.render();
        }
    });
    this.route('appLoading');
    this.route('join');
    this.route('signin');
    this.route('admin', {
        path: '/admin/',
        data: function() {
            var obj = {};
            obj.users = Meteor.users.find();
            obj.config = Config.findOne();
            return obj;
        },
        action: function() {
            console.log('!!!')
            if (this.ready()) {
                this.render();
            }
        }
    });
    this.route('user-home', {
        path: '/user/:_id',
        /*waitOn: function() {
            return Meteor.subscribe('publicLists');
        },*/
        data: function() {
            var obj = {};
            obj.user = Meteor.user();
            obj.config = Config.findOne();
            obj.users = Meteor.users.find();
            obj.records=Records.find();
            return obj;
        },
        action: function() {
            if (this.ready()) {
                this.render();
            }
        }
    });

    this.route('form', {
        path: '/form/:_id',
        waitOn: function() {
            return this.subscribe('item', this.params._id);
        },
        data: function() {
            var obj = {};
            obj.record = Records.findOne(this.params._id);
            return obj;
        },
        action: function() {
            if (this.ready()) {
                this.render();
            }
        }
    });
});
/*
meteor add insecure
meteor add autopublish


meteor remove insecure
meteor remove autopublish


*/
