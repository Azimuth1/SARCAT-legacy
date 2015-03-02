var ERRORS_KEY = 'signinErrors';
Template.adminSetup.created = function() {
    Session.set(ERRORS_KEY, {});
    Meteor.call('defaultAdmin', function(error, result) {
        Session.set('defaultAdmin', result);
    });
};
Template.adminSetup.helpers({
    errorMessages: function() {
        return _.values(Session.get(ERRORS_KEY));
    },
    errorClass: function(key) {
        return Session.get(ERRORS_KEY)[key] && 'error';
    },
    initConfig: function() {
        return Session.get('initConfig');
    },
    defaultAdmin: function() {
        return Session.get('defaultAdmin');
    },
    defaultSignin: function() {
        console.log(Session.get('defaultAdmin') && !Meteor.user())
        return Session.get('defaultAdmin') && !Meteor.user();
    }
});
Template.adminSetup.events({
    'submit': function(event, template) {
        event.preventDefault();
        var email = template.$('[name=email]')
            .val();
        var password = template.$('[name=password]')
            .val();
        var errors = {};
        if (!email) {
            errors.email = 'Email is required';
        }
        if (!password) {
            errors.password = 'Password is required';
        }
        Session.set(ERRORS_KEY, errors);
        if (_.keys(errors)
            .length) {
            return;
        }
        if (!Meteor.user()) {
            Meteor.loginWithPassword(email, password, function(error) {
                if (error) {
                    return Session.set(ERRORS_KEY, {
                        'none': error.reason
                    });
                }
                template.$('[name=email]')
                    .val('');
                template.$('[name=password]')
                    .val('');
            });
        } else {
            Meteor.users.remove({
                _id: Meteor.userId()
            });
            Accounts.createUser({
                email: email,
                password: password,
            }, function(error) {
                if (error) {
                    return Session.set(ERRORS_KEY, {
                        'none': error.reason
                    });
                }
                Router.go('user-home', Meteor.user());
            });
        }
    }
});
