// if the database is empty on server start, create some sample data.
Meteor.startup(function() {
    if (Records.find()
        .count() === 0) {
        var admin;
        Accounts.createUser({
            email: 'admin@a.com',
            password: 'a',
            username: 'admin',
            admin: true,
            test: 'ff',
            profile: {
                admin: true,
                vv: 'ff',
                test: 'vv'
            }
        });
        var data = [{
            'name': 'John Doe',
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
        }];
        var timestamp = (new Date())
            .getTime();
        _.each(data, function(record) {
            record.incompleteCount = record.items.length;
            Records.insert(record);
            timestamp += 1;
        });
    }
});
