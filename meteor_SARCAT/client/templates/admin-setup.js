var ERRORS_KEY = 'signinErrors';
Template.adminSetup.created = function() {
    Session.set(ERRORS_KEY, {});
};
Template.adminSetup.helpers({
    errorMessages: function() {
        return _.values(Session.get(ERRORS_KEY));
    },
    errorClass: function(key) {
        return Session.get(ERRORS_KEY)[key] && 'error';
    },
});
Template.adminSetup.events({
    'submit': function(event, template) {
        var self = this;
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



        event.preventDefault();
        /*var username = template.$('[name=username]')
            .val();*/
        var email = template.$('[name=email]')
            .val();
        var password = template.$('[name=password]')
            .val();
        var confirm = template.$('[name=confirm]')
            .val();
        var errors = {};
        if (!email) {
            errors.email = 'Email required';
        }
        if (!password) {
            errors.password = 'Password required';
        }
        if (confirm !== password) {
            errors.confirm = 'Please confirm your password';
        }
        Session.set(ERRORS_KEY, errors);
        if (_.keys(errors)
            .length) {
            return;
        }


            
            Accounts.createUser({
                email: email,
                password: password,
                role: 'admin'
                /*profile: {
                    role: 'admin'
                }*/
            }, function(error) {
                if (error) {
                    return Session.set(ERRORS_KEY, {
                        'none': error.reason
                    });
                }
                Meteor.call('updateConfig', self._id, {
                    initSetup: false
                }, function() {
                    console.log('!');
                    Router.go('user-home', Meteor.user());
                });
            });
        }
    }
});
