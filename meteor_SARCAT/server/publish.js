Meteor.publish('publicLists', function() {
    if (this.userId) {
        return Records.find({});
        //return Records.find({},{fields: {recordInfo: 1}});
    } else {
        this.ready();
    }
});
Meteor.publish('item', function(id) {
    if (this.userId) {
        return Records.find(id);
    } else {
        this.ready();
    }
});
Meteor.publish('privateLists', function() {
    if (this.userId) {
        return Records.find({
            userId: this.userId
        });
    } else {
        return Meteor.users.find({
            'profile.role': 'default'
        });
        //this.ready();
    }
});
Meteor.publish('userData', function() {
    if (Roles.userIsInRole(this.userId, ['admin'])) {
        return Meteor.users.find();
    } else if (this.userId) {
        return Meteor.users.find({
            _id: this.userId
        }, {
            fields: {
                'roles': 1
            }
        });
    } else {
        this.ready();
    }
});
Meteor.publish('roles', function() {
    return Meteor.roles.find()
})
Meteor.publish('config', function() {
    return Config.find();
});
Meteor.publish('adminDefault', function() {
    return Meteor.users.find({
        emails: {
            $elemMatch: {
                address: 'admin@sarcat'
            }
        }
    });
});
