//process.env.GG='tt';
//console.log(process.env);
//settings = JSON.parse(process.env.METEOR_SETTINGS);
//console.log(settings.initSetup);
//process.env.METEOR_SETTINGS.initSetup=false;
//console.log(process.env.METEOR_;SETTINGS.initSetup);
//var config
Meteor.startup(function() {
    if (!Meteor.users.find()
        .count()) {
        Accounts.createUser({
            email: 'admin@sarcat',
            password: 'admin',
            defaultAdmin:true,
            role: 'default',
            profile: {
                role: 'default'
            }
        });
        /*

                        var list = {
                            name: Records.defaultName(),
                            userId: defaultUser
                        };
                        var record = Records.insert(list);
                       */
        /*list._id = Meteor.call('addRecord', list, function(error, d) {
            if (error) {}
            list._id = d;
            Router.go('form', list);
        });*/
    }
    if (Records.find().count() === 0) {
        /*
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
        });*/
    }
});
Meteor.methods({
    addRecord: function(list) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        return Records.insert(list);
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
    checkState: function() {
        return Meteor.settings.initSetup;
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
