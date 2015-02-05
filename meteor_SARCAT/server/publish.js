


Meteor.publish('publicLists', function() {
  return Records.find({userId: {$exists: false}});
});

Meteor.publish('privateLists', function() {
  if (this.userId) {
    return Records.find({userId: this.userId});
  } else {
    this.ready();
  }
});

Meteor.publish('todos', function(listId) {
  check(listId, String);
  return Todos.find({listId: listId});
});




/*
Meteor.publish('sampleRecords', function(listId) {
  check(listId, String);
  return Todos.find();
});*/



Meteor.publish(null, function () {
  return People.find();
});

People.allow({
  insert: function () {
    return true;
  },
  remove: function () {
    return true;
  }
});