Meteor.publish('publicLists', function() {
    return Records.find({
        userId: {
            $exists: false
        }
    });
});
Meteor.publish('privateLists', function() {
    if (this.userId) {
        return Records.find({
            userId: this.userId
        });
    } else {
        this.ready();
    }
});
Meteor.publish('todos', function(listId) {
    check(listId, String);
    return Todos.find({
        listId: listId
    });
});
Meteor.publish('userData', function() {
    return Meteor.users.find({}, {
        fields: {
            'test': 1
        }
    });
});
