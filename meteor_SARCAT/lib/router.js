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
            Meteor.subscribe('userData')
        ];
    }
});
dataReadyHold = null;
if (Meteor.isClient) {
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
    this.route('join');
    this.route('signin');
    this.route('form', {
        path: '/form/:_id',
        onBeforeAction: function() {
            this.todosHandle = Meteor.subscribe('Records', this.params._id);
            if (this.ready()) {
                // Handle for launch screen defined in app-body.js
                dataReadyHold.release();
                this.next();
            }
        },
        data: function() {
            return Records.findOne(this.params._id);
        },
        action: function() {
            this.render();
        }
    });
    this.route('home', {
        path: '/',
        action: function() {
            Router.go('signin');
        }
    });
});
