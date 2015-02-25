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
Meteor.publish('kyle', function() {
    return {
        hey: 'yup'
    };
});
Meteor.publish('userData', function() {
    if (this.userId) {
        return Meteor.users.find({
            _id: this.userId
        });
    } else {
        this.ready();
    }
});
Meteor.publish("collection", function() {
    //returns undefined if not logged in so check if logged in first
    if (this.userId) {
        var user = Meteor.users.findOne(this.userId);
        //var user is the same info as would be given in Meteor.user();
    }
});
/*
Meteor.publish('userCount', function() {
     return Meteor.users.find().count().fetch();
    //var userCount = return userCount;
});




// server: publish the current size of a collection
Meteor.publish("counts-by-room", function (roomId) {
  var self = this;
  var count = 0;
  var initializing = true;

  var handle = Messages.find({room_id: roomId}).observeChanges({
    added: function (doc, idx) {
      count++;
      if (!initializing)
        self.changed("counts", roomId, {count: count});  // "counts" is the published collection name
    },
    removed: function (doc, idx) {
      count--;
      self.changed("counts", roomId, {count: count});  // same published collection, "counts"
    }
    // don't care about moved or changed
  });

  initializing = false;

  // publish the initial count. `observeChanges` guaranteed not to return
  // until the initial set of `added` callbacks have run, so the `count`
  // variable is up to date.
  self.added("counts", roomId, {count: count});

  // and signal that the initial document set is now available on the client
  self.ready();

  // turn off observe when client unsubscribes
  self.onStop(function () {
    handle.stop();
  });
});*/
