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
            //Meteor.subscribe('privateLists'),
            Meteor.subscribe('userData'),
            Meteor.subscribe('config'),
            //Meteor.subscribe('people'),
            //Meteor.subscribe('Records'),
            //Meteor.subscribe('clientState')
        ];
    }
});
dataReadyHold = null;
if (Meteor.isClient) {
    L.Icon.Default.imagePath = '/img';
    //AutoForm.setDefaultTemplateForType('afQuickField', 'addOptions');
    //console.log(Session.get('defaultAdmin'));
    // Keep showing the launch screen on mobile devices until we have loaded
    // the app's data
    //dataReadyHold = LaunchScreen.hold();
    // Show the loading screen on desktop
    Router.onBeforeAction('loading', {
        except: ['join', 'signin']
    });
    Router.onBeforeAction('dataNotFound', {
        except: ['join', 'signin']
    });
    //Router.onBeforeAction('loading');
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
    // All standard subscriptions you need before anything works
    // the .wait() makes sure that it continues only if the subscription
    // is ready and the data available
    // Use: global
    baseSubscriptions: function() {
        this.subscribe('userData').wait();
    },
    // show login if a guest wants to access private areas
    // Use: {only: [privateAreas] }
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
    // make sure to scroll to the top of the page on a new route
    // Use: global
    scrollUp: function() {
        $('body,html').scrollTop(0);
    },
    // only show route if you are an admin
    // using https://github.com/alanning/meteor-roles
    // Use: {only: [adminAreas]}
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
            //Router.go('signin');
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
        waitOn: function() {
            return Meteor.subscribe('publicLists');
        },
        data: function() {
            var obj = {};
            obj.user = Meteor.user();
            obj.config = Config.findOne();
            return obj;
        },
        action: function() {
            if (this.ready()) {
                this.render();
            }
        }
    });
    this.route('tests', {
        path: '/test',
        waitOn: function() {
            return this.subscribe('item', "P3JSFt6Wi6rbxQSmJ");
        },
        data: function() {
            return Records.findOne("P3JSFt6Wi6rbxQSmJ");
        },
        action: function() {
            //console.log('action');
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
            // console.log('data');
            var obj = {};
            obj.record = Records.findOne(this.params._id);
            console.log(obj.record);
            return obj;
        },
        action: function() {
            //console.log('action');
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
