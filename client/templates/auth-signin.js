var ERRORS_KEY = 'signinErrors';
var passwordReset = function () {
    var user = Meteor.user() || {};
    var profile = user.profile || {};
    var reset = profile.passwordReset ? true : false;
    return reset;
};
Template.signin.onCreated(function () {
    Session.set(ERRORS_KEY, {});
    var reset = Session.get('passwordReset'); //passwordReset();
    //Session.set('passwordReset', reset);
    if (Meteor.user() && !reset) {
        Router.go('home');
    }
});
Template.signin.onRendered(function () {
    //var logo = document.getElementById('agencyLogo');
    //logo.src = 'uploads/logo/' + Session.get('logo');
    //logo.style.display = 'inline';
});
Template.signin.helpers({
    logoSrc: function (event, template) {
        return Session.get('logoSrc');
    },
    defaultEmail: function () {
        return Session.get('defaultEmail');
        //return Meteor.settings.public.email;
    },
    errorMessages: function () {
        return _.values(Session.get(ERRORS_KEY));
    },
    errorClass: function (key) {
        return Session.get(ERRORS_KEY)[key] && 'error';
    },
    initConfig: function () {
        return Session.get('initConfig');
    },
    resetPassword: function () {
        return Session.get('passwordReset');
    },
});
Template.signin.events({
    'click #resetPassword': function (event, template) {
        event.preventDefault();
        var password = template.$('[name=password]')
            .val();
        var confirm = template.$('[name=confirm]')
            .val();
        // alert(password,confirm)
        var errors = {};
        if (confirm !== password) {
            errors.confirm = 'Please confirm your password';
        }
        Session.set(ERRORS_KEY, errors);
        if (_.keys(errors)
            .length) {
            return;
        }
        Meteor.call('setPassword', Meteor.userId(), password, false, function (err, d) {
            console.log(err, d)
            if (err) {
                console.log(err);
            } else {
                var reset = passwordReset();
                Session.set('passwordReset', reset);
                if (Meteor.user() && !reset) {
                    Router.go('home');
                }
            }
        });
    },
    'click #signin': function (event, template) {
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
        Meteor.loginWithPassword(email, password, function (error, result) {
            if (error) {
                return Session.set(ERRORS_KEY, {
                    'none': error.reason
                });
            }
            Session.set('defaultEmail', email);
            var roles = Roles.getRolesForUser(Meteor.userId());
            var reset = passwordReset();
            Session.set('passwordReset', email);
            if (Meteor.user() && !reset) {
                Router.go('home');
            }
            //var passwordReset = Meteor.user().profile.passwordReset;
            //if(passwordReset){}
            //Router.go('home', Meteor.user());
        });
    }
});
