//process.env.GG='tt';
//console.log(process.env);
//settings = JSON.parse(process.env.METEOR_SETTINGS);
//console.log(Meteor.settings);
//process.env.METEOR_SETTINGS.initSetup=false;
//console.log(process.env.METEOR_;SETTINGS.initSetup);
//var config
Meteor.startup(function() {
    /*
    AdminConfig = {
        //adminEmails: ['a@a'],
        roles: ['admin'],
        collections: {
            Records: {}
        }
    };*/
    //Config.insert(Meteor.settings.production.public)
    if (!Config.find().count()) {
        //Config.insert(Meteor.settings.production.public);
        var customSettings = {
            'initSetup': true
        };
        Config.insert(customSettings);
    }
    if (!Meteor.users.find()
        .count()) {
        var admin = Accounts.createUser({
            email: 'a@a', //dmin@sarcat',
            password: 'a', //dmin',
            username: 'default'
        });
        Roles.addUsersToRoles(admin, ['admin']);
        /*Accounts.onCreateUser(function(options, user) {
            console.log(user._id)
            Roles.addUsersToRoles(user._id, ['viewer']);
        });*/
    }
});
Meteor.methods({
    removeUser: function(userId) {
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            Meteor.users.remove(userId);
        }
    },
    createAdmin: function(username, email, password, id) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        var newAdmin = Accounts.createUser({
            email: email,
            password: password,
            username: username
        });
        Roles.addUsersToRoles(newAdmin, ['admin']);
        Config.update(id, {
            $set: {
                initSetup: false
            }
        });
        Meteor.users.remove(Meteor.userId());
    },
    addRole: function(id, role) {
        Roles.addUsersToRoles(id, [role]);
    },
    updateConfig: function(id, list) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Config.update(id, {
            $set: list
        });
    },
    addRecord: function(list) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Records.insert(list);
    },
    removeRecord: function(id) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Records.remove(id);
    },
    updateRecord: function(id, name) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Records.update(id, {
            $set: {
                name: name
            }
        });
    },
    toggleListPrivacy: function(list) {
        //console.log(list, list.userId);
        a = Meteor.userId();
        //console.log(a);
        if (!Meteor.user()) {
            return alert('Please sign in or create an account to make private lists.');
        }
        if (list.userId) {
            Records.update(list._id, {
                $unset: {
                    userId: true
                }
            });
        } else {
            // console.log(2);
            // ensure the last public list cannot be made private
            if (Records.find({
                    userId: {
                        $exists: false
                    }
                })
                .count() === 1) {
                return alert('Sorry, you cannot make the final public list private!');
            }
            Records.update(list._id, {
                $set: {
                    userId: Meteor.userId()
                }
            });
        }
    },
    defaultAdmin: function() {
        var defaultAdmin = Meteor.users.find({
            emails: {
                $elemMatch: {
                    address: 'admin@sarcat'
                }
            }
        }).count();
        return defaultAdmin ? true : false;
    },
    deleteUser: function(targetUserId, group) {
        var loggedInUser = Meteor.user();
        if (!loggedInUser ||
            !Roles.userIsInRole(loggedInUser, ['manage-users', 'support-staff'], group)) {
            throw new Meteor.Error(403, 'Access denied');
        }
        // remove permissions for target group
        Roles.setUserRoles(targetUserId, [], group);
        // do other actions required when a user is removed...
    }
});
Records.allow({
    update: function() {
        return true;
    }
});



Config.allow({
    'update': function() {
        return true;
    }
});
Meteor.users.allow({
    'remove': function(userId, doc) {
        if (Roles.userIsInRole(userId, ['admin'])) {
            return true;
        }
    },
    'update': function(userId, doc) {
        if (Roles.userIsInRole(userId, ['admin'])) {
            return true;
        }
    }
});
