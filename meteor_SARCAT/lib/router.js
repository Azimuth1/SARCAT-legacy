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
        Session.set('config', Config.findOne());
        if (Config.findOne({
                initSetup: true
            })) {
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
if (Meteor.isClient) {




    /*Tracker.autorun(function () {
        var count = Session.get('adminUser');
        //console.log('autorun2:' + count);
    });*/

    Roles.userIsInRole(Meteor.userId(), ['admin']);
    L.Icon.Default.imagePath = '/img';
    L.Icon.Default.imagePath = '/img';
}
Router.route('home', {
    path: '/',
    action: function () {
        //console.log('!')
        if (Meteor.user()) {
            Router.go('user-home', Meteor.user());
        } else {
            Router.go('signin');
        }
    }
});
Router.route('adminSetup', {
    path: '/adminSetup/',
    layoutTemplate: null,
    onBeforeAction: function () {
        this.next();
    }
});
Router.route('join');
Router.route('signin')
Router.route('user-home', {
    path: '/user/:_id',
    data: function () {
        var obj = {};
        //obj.user = Meteor.user();
        obj.users = Meteor.users.find().fetch();
        obj.records = Records.find();
        return obj;
    },
});
Router.route('form', {
    path: '/form/:_id',
    waitOn: function () {
        return this.subscribe('item', this.params._id);
    },
    data: function () {
        var obj = {};
        obj.record = Records.findOne(this.params._id);
        //console.log(obj.record);
        return obj;
    },
    action: function () {
        if (this.ready()) {
            this.render();
        }
    }
});
//});
/*
meteor add insecure
meteor add autopublish
meteor remove insecure
meteor remove autopublish
*/
