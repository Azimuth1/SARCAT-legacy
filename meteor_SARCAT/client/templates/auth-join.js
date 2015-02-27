var ERRORS_KEY = 'joinErrors';
Template.join.created = function() {
    Session.set(ERRORS_KEY, {});
};
Template.join.helpers({
    errorMessages: function() {
        return _.values(Session.get(ERRORS_KEY));
    },
    errorClass: function(key) {
        return Session.get(ERRORS_KEY)[key] && 'error';
    },
    initConfig: function() {
        return State.findOne({
            initSetup: {
                $exists: true
            }
        });
    }
});
Template.join.events({
    'submit': function(event, template) {
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
            //username: username,
            profile: {
                test: 'aaaa'
            }
        }, function(error) {
            if (error) {
                return Session.set(ERRORS_KEY, {
                    'none': error.reason
                });
            }
            Router.go('home');
        });
    }
});
