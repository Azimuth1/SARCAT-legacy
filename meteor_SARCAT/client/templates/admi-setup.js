var ERRORS_KEY = 'signinErrors';
Template.adminSetup.created = function() {
    Session.set(ERRORS_KEY, {});
    /*Meteor.call('defaultAdmin', function(error, result) {
        Session.set('defaultAdmin', result);
    });*/
};
Template.adminSetup.helpers({
    errorMessages: function() {
        return _.values(Session.get(ERRORS_KEY));
    },
    errorClass: function(key) {
        return Session.get(ERRORS_KEY)[key] && 'error';
    },
    /*message: function(){
        return message
    };*/
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

                var user = Meteor.user();
                var role = user.profile.role;
                if (role !== 'admin' && role !== 'default') {
                    var errors = {};
                    errors.email = 'You do not have admin rights';
                    Session.set(ERRORS_KEY, errors);
                    Meteor.logout();
                    return;
                }

                template.$('[name=email]')
                    .val('');
                template.$('[name=password]')
                    .val('');
            });

        } else {
            //var user = Meteor.user();
            //var role = user.profile.role;
            //var _id = user._id;
            /*Meteor.call('createUsers', {
                email: email,
                password: password,
                profile: {
                    role: 'admin'
                }
            });*/
             Accounts.createUser({
                 email: email,
                 password: password,
                 profile: {
                     role: 'admin'
                 }
             }, function(error) {
                 if (error) {
                     return Session.set(ERRORS_KEY, {
                         'none': error.reason
                     });
                 }
                 Meteor.call('updateConfig',self._id, {initSetup: false});
             });
            /*if (role === 'default') {
                Meteor.users.remove({
                    _id: _id
                });

            }*/
            //  Router.go('user-home', Meteor.user());
            //});
        }
    }
});
