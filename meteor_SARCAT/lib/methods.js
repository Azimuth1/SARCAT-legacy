Meteor.methods({
    removeUser: function (userId) {
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            Meteor.users.remove(userId);
        }
    },
    createAdmin: function (username, email, password, id) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        var newAdmin = Accounts.createUser({
            email: email,
            password: password,
            username: username
        });
        Meteor.users.update(newAdmin, {
            $set: {
                roles: ['admin']
            }
        }, function (error, result) {
            if (error) {
                console.log(error, result);
            }
        });
        Config.update(Config.findOne()
            ._id, {
                $set: {
                    initSetup: false
                }
            });
        // Meteor.users.remove(Meteor.userId());
    },
    addRole: function (id, role) {
        Roles.addUsersToRoles(id, [role]);
    },
    updateConfig: function (val) {
        console.log(val)
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Config.update(Config.findOne()
            ._id, {
                $set: val
            }
        );
    },

    addRecord: function (list) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Records.insert(list);
    },
    removeRecord: function (id) {
        console.log(id)
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        /*return Records.update(id, {
            $set: {
                remove: "true"
            }
        },function(d,e){console.log(d,e)});*/
        return Records.remove(id);
    },
    updateRecord: function (id, name) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Records.update(id, {
            $set: {
                name: name
            }
        });
    },
    toggleListPrivacy: function (list) {
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
    defaultAdmin: function () {
        var defaultAdmin = Meteor.users.find({
                emails: {
                    $elemMatch: {
                        address: 'admin@sarcat'
                    }
                }
            })
            .count();
        return defaultAdmin ? true : false;
    },
    deleteUser: function (targetUserId, group) {
        var loggedInUser = Meteor.user();
        if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['manage-users', 'support-staff'], group)) {
            throw new Meteor.Error(403, 'Access denied');
        }
        // remove permissions for target group
        Roles.setUserRoles(targetUserId, [], group);
        // do other actions required when a user is removed...
    },
    changeRole: function (user, val) {
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            Meteor.users.update(user, {
                $set: {
                    roles: [val]
                }
            });
        }
    },
    removeSubject: function (recordId, subjectId) {
        newSubjects = Records.findOne(recordId).subjects.subject.filter(function (d) {
            return d._key !== subjectId;
        });
        Records.update(recordId, {
            $set: {
                'subjects.subject': newSubjects
            }
        })
    },
    removeResource: function (recordId, resourceId) {
        newResource = Records.findOne(recordId).resourcesUsed.resource.filter(function (d) {
            return d._key !== resourceId;
        });
        Records.update(recordId, {
            $set: {
                'resourcesUsed.resource': newResource
            }
        })
    },
});
Records.allow({
    remove: function () {
        return true;
    },
    update: function () {
        return true;
    },
    insert: function () {
        return true;
    }
});
Config.allow({
    'update': function () {
        return true;
    },
    'insert': function () {
        return true;
    }
});
Meteor.users.allow({
    'remove': function (userId, doc) {
        if (Roles.userIsInRole(userId, ['admin'])) {
            return true;
        }
    },
    'update': function (userId, doc) {
        if (Roles.userIsInRole(userId, ['admin'])) {
            return true;
        }
    }
});
