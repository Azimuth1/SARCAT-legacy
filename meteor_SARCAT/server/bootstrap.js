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
            "initSetup": true
        };
        Config.insert(customSettings);
    }
    if (!Meteor.users.find()
        .count()) {
        var admin = Accounts.createUser({
            email: 'a@a', //dmin@sarcat',
            password: 'a', //dmin',
        });

        Roles.addUsersToRoles(admin, ['admin']);

        /*Accounts.onCreateUser(function(options, user) {
            console.log(user._id)
            Roles.addUsersToRoles(user._id, ['viewer']);
        });*/

    }

});
Meteor.methods({
    createAdmin: function(email, password, id) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        console.log('!!!!!!!!');
        var newAdmin = Accounts.createUser({
            email: email,
            password: password,

        });
        console.log('aaaaaaaa');
        Roles.addUsersToRoles(newAdmin, ['admin']);
        console.log(0000000000);
        Config.update(id, {
            $set: {
                initSetup: false
            }
        });
        console.log(111111);

        this.logout(function() {
            console.log('222222222')
            this.loginWithPassword(email, password)
        });

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
    }
});

Records.allow({
    'update': function(userId, doc) {
        /* user and doc checks ,
        return true to allow insert */
        return true;
    }
});

/*
Meteor.users.deny({
  update: function() {
    return true;
  }
});
*/
/* if (Records.find().count() === 0) {
     
             var data = [{
                 'name': 'Default Template',
                 'status': 'Open',
                 items: ['Data on the Wire', 'One Language', 'Database Everywhere', 'Latency Compensation', 'Full Stack Reactivity', 'Embrace the Ecosystem', 'Simplicity Equals Productivity']
             }, {
                 'name': 'John & Jane Doe',
                 'status': 'Closed',
                 items: ['Lisp', 'C', 'C++', 'Python', 'Ruby', 'JavaScript', 'Scala', 'Erlang', '6502 Assembly']
             }, {
                 'name': 'Kyle Kalwarski',
                 'status': 'Closed',
                 'items': ['Ada Lovelace', 'Grace Hopper', 'Marie Curie', 'Carl Friedrich Gauss', 'Nikola Tesla', 'Claude Shannon']
             }];*/
/*var timestamp = (new Date())
            .getTime();
        _.each(data, function(record) {
            record.incompleteCount = record.items.length;
            Records.insert(record);
            timestamp += 1;
        });
    }*/
