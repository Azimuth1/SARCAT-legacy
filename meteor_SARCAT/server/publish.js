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
        return Meteor.users.find({
            'profile.role': 'default'
        });
        //this.ready();
    }
});
Meteor.publish('userData', function() {
    //return Meteor.users.find();
    if (this.userId) {
        return Meteor.users.find({
            _id: this.userId
        });
    } else {
        this.ready();
    }
});
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
/*
Meteor.publish('adminDefault', function() {
    return Meteor.users.find({
        'profile.role': 'default'
    });
});
*/
/*
Meteor.publish("counts-by-room", function() {
    var self = this;
    var count = 0;
    var initializing = true;
    var handle = Meteor.users.find({
        emails: {
            $elemMatch: {
                address: 'admin@sarcat'
            }
        }
    }).observeChanges({
        added: function(id) {
            count++;
            if (!initializing)
                self.changed("counts", roomId, {
                    count: count
                });
        },
        removed: function(id) {
                count--;
                self.changed("counts", roomId, {
                    count: count
                });
            }
            // don't care about moved or changed
    });
    // Observe only returns after the initial added callbacks have
    // run.  Now return an initial value and mark the subscription
    // as ready.
    initializing = false;
    self.added("counts", roomId, {
        count: count
    });
    self.ready();
    // Stop observing the cursor when client unsubs.
    // Stopping a subscription automatically takes
    // care of sending the client any removed messages.
    self.onStop(function() {
        handle.stop();
    });
});
*/
