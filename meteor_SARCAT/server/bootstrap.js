// if the database is empty on server start, create some sample data.
Meteor.startup(function() {
    if (Records.find().count() === 0) {
        console.log('new Records');
        var data = [{
            'name': 'John Doe',
            'date': '1/5/2013',
            'status': 'Open',
            items: ['Data on the Wire',
                'One Language',
                'Database Everywhere',
                'Latency Compensation',
                'Full Stack Reactivity',
                'Embrace the Ecosystem',
                'Simplicity Equals Productivity'
            ]
        }, {
            'name': 'John & Jane Doe',
            'date': '6/5/2013',
            'status': 'Closed',
            items: ['Lisp',
                'C',
                'C++',
                'Python',
                'Ruby',
                'JavaScript',
                'Scala',
                'Erlang',
                '6502 Assembly'
            ]
        }, {
            'name': 'Kyle Kalwarski',
            'date': '7/5/2013',
            'status': 'Closed',
            'items': ['Ada Lovelace',
                'Grace Hopper',
                'Marie Curie',
                'Carl Friedrich Gauss',
                'Nikola Tesla',
                'Claude Shannon'
            ]
        }];
        var timestamp = (new Date()).getTime();
        _.each(data, function(record) {


            record.incompleteCount = record.items.length;
            var list_id = Records.insert(record);
//console.log(list_id)

            _.each(record.items, function(text) {
                Todos.insert({
                    listId: list_id,
                    text: text,
                    createdAt: new Date(timestamp)
                });
                /*Records.insert({
                    listId: list_id,
                    text: text,
                    createdAt: new Date(timestamp)
                });*/
                timestamp += 1; // ensure unique timestamp.
            });
        });
    }
});
