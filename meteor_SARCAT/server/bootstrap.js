//process.env.GG='tt';
//console.log(process.env);
//settings = JSON.parse(process.env.METEOR_SETTINGS);
//console.log(Meteor.settings.production);
//process.env.METEOR_SETTINGS.initSetup=false;
//console.log(process.env.METEOR_;SETTINGS.initSetup);
//var config
Meteor.startup(function() {
    //Config.insert(Meteor.settings.production.public)

    if (!Config.find().count()) {
        Config.insert(Meteor.settings.production.public);
    }

    if (!Meteor.users.find()
        .count()) {
        Accounts.createUser({
            email: 'a@a', //dmin@sarcat',
            password: 'a', //dmin',
            profile: {
                role: 'default'
            }
        });
    }
});
Meteor.methods({
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
