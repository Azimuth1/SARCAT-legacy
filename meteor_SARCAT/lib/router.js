Router.configure({
    // we use the  appBody template to define the layout for the entire app
    layoutTemplate: 'appBody',
    // the appNotFound template is used for unknown routes and missing lists
    notFoundTemplate: 'appNotFound',
    // show the appLoading template whilst the subscriptions below load their data
    loadingTemplate: 'appLoading',
    // wait on the following subscriptions before rendering the page to ensure
    // the data it's expecting is present
    waitOn: function() {
        return [
            Meteor.subscribe('publicLists'),
            Meteor.subscribe('privateLists'),
            Meteor.subscribe('userData'),
            Meteor.subscribe('adminDefault'),
            //Meteor.subscribe('clientState')
        ];
    }
});
dataReadyHold = null;
if (Meteor.isClient) {
    //console.log(Session.get('defaultAdmin'));
    // Keep showing the launch screen on mobile devices until we have loaded
    // the app's data
    dataReadyHold = LaunchScreen.hold();
    // Show the loading screen on desktop
    Router.onBeforeAction('loading', {
        except: ['join', 'signin']
    });
    Router.onBeforeAction('dataNotFound', {
        except: ['join', 'signin']
    });
}
Router.map(function() {
    var routeDefaults = {
        noAdmin: function(_this) {
            if (Meteor.users.find().count()) {
                //_this.render('adminSetup');
                Router.go('adminSetup');
            } /*else {
                _this.render('signin');
            }*/
        }
    };
    this.route('adminSetup', {
        path: '/adminSetup',
        /* onBeforeAction: function() {
             var self = this;


             Meteor.call('defaultAdmin', function(error, result) {
                 Session.set('defaultAdmin', result);
                 dataReadyHold.release();
                 self.next();
             });
             if (this.ready()) {
                 // Handle for launch screen defined in app-body.js
                 //dataReadyHold.release();
                 this.next();
             }            
         },*/
        action: function() {
            /*Meteor.call('defaultAdmin', function(error, result) {
                Session.set('defaultAdmin', result);
                dataReadyHold.release();
                this.next();
            });*/
            //if (this.ready()) {
            // Handle for launch screen defined in app-body.js
            //dataReadyHold.release();
            //console.log('!')
            this.render();
            //}
        }
    });
    this.route('join', {
        path: '/join',
        onBeforeAction: function() {
            routeDefaults.noAdmin(this);
            /*this.todosHandle = Meteor.subscribe('Records', this.params._id);
            if (this.ready()) {
                // Handle for launch screen defined in app-body.js
                dataReadyHold.release();
                this.next();
            }
        },
        action: function() {
            this.render();*/
        }
    });
    this.route('signin');
    this.route('user-home', {
        path: '/user/:_id',
        onBeforeAction: function() {
            this.todosHandle = Meteor.subscribe('Records', this.params._id);
            if (this.ready()) {
                dataReadyHold.release();
                this.next();
            }
        },
        action: function() {
            this.render();
        }
    });
    this.route('form', {
        path: '/form/:_id',
        data: function() {
            return Records.findOne(this.params._id);
        },
        onBeforeAction: function() {
            this.todosHandle = Meteor.subscribe('Records', this.params._id);
            if (this.ready()) {
                // Handle for launch screen defined in app-body.js
                dataReadyHold.release();
                this.next();
            }
        },
        action: function() {
            this.render();
        }
    });
    this.route('home', {
        path: '/',
        onBeforeAction: function() {
            //var _this = this;

alert('!')
            routeDefaults.noAdmin(this);
            //Router.go('join');



            //Router.go('signin');
            /*var defaultAdmin = Meteor.users.find().count();
            if (Meteor.users.find().count()) {
                _this.render('adminSetup');
            } else {
                _this.render('signin');
            }*/
            //this.render('join');
            /* if (Meteor.user()) {
                 Router.go('form', Records.findOne());
             } else {
                 Router.go('signin');
                // this.render('adminSetup')
             }*/
        },
        action: function() {
            //Router.go('signin');
            //this.render();
        }
    });
});
/*
meteor add insecure
meteor add autopublish


meteor remove insecure
meteor remove autopublish


*/
