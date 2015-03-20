var ERRORS_KEY = 'joinErrors';
Template.join.created = function() {
    Session.set(ERRORS_KEY, {});
    /*Meteor.call('getCount', function(error, result) {
        Session.set('initConfig', result);
        return result;
    });*/
};
Template.join.helpers({
    errorMessages: function() {
        return _.values(Session.get(ERRORS_KEY));
    },
    errorClass: function(key) {
        return Session.get(ERRORS_KEY)[key] && 'error';
    },
    initConfig: function() {
        //    return Session.get('initConfig');
        Meteor.call('getCount', function(error, result) {
            console.log(error, result);
            Session.set('initConfig', result);
            return result;
        });
        /*return Config.findOne({
            initSetup: {
                $exists: true
            }
        });*/
    }
});
Template.join.events({
    'submit': function(event, template) {
        event.preventDefault();
        //var username = template.$('[name=username]').val();
        var firstname = template.$('[name=firstname]').val();
        var lastname = template.$('[name=lastname]').val();
        var email = template.$('[name=email]')
            .val();
        var password = template.$('[name=password]')
            .val();
        var confirm = template.$('[name=confirm]')
            .val();
        var errors = {};
        if (!firstname) {
            errors.firstname = 'First Name required';
        }
        if (!lastname) {
            errors.lastname = 'Last Name required';
        }
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
            username: [firstname, lastname].join(' ')
                //profile:{role:'dd'}
        }, function(error) {
            if (error) {
                return Session.set(ERRORS_KEY, {
                    'none': error.reason
                });
            }
            Router.go('user-home', Meteor.user());
        });
    }
});
