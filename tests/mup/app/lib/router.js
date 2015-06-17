Router.configure({
    layoutTemplate: 'appBody',
    notFoundTemplate: 'appNotFound',
    loadingTemplate: 'appLoading',
    waitOn: function() {
        return [
            Meteor.subscribe('publicLists'),
            Meteor.subscribe('privateLists')
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
    this.route('listsShow', {
        path: '/lists/:_id',
        // subscribe to todos before the page is rendered but don't wait on the
        // subscription, we'll just render the items as they arrive
        onBeforeAction: function() {
            this.todosHandle = Meteor.subscribe('todos', this.params._id);
            if (this.ready()) {
                console.log('READY')
                // Handle for launch screen defined in app-body.js
                dataReadyHold.release();
            }
        },
        data: function() {
            console.log('DATA');
            console.log(this.params._id)
            return Lists.findOne(this.params._id);
        },
        action: function() {
            this.render();
        }
    });
    this.route('home', {
        path: '/',
        action: function() {
            Router.go('listsShow', Lists.findOne());
        }
    });
});
