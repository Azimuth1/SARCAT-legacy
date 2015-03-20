Template.admin.rendered = function() {
    console.log(this.data);
};
Template.admin.helpers({
    profileIncomplete: function() {
        var complete = completeProfile();
        console.log(complete);
        Session.set('profileComplete', complete);
        return !complete;
    },
    userEmail: function() {
        return this.emails[0].address;
    },
    removeUser: function(a) {
        console.log(this, a)
        Meteor.call('removeUser', this._id, function(err) {
            console.log(err);
        });
    },
    test1: function() {
        return Schemas.SARCAT._schemaKeys;
    },
    test2: function() {
        return Schemas.SARCAT._firstLevelSchemaKeys;
    },
    test3: function(name) {
        var schema = Schemas[name];
        if (!schema) {
            return [];
        }
        return Schemas[name]._firstLevelSchemaKeys.map(function(d){
            return name+'.'+d;
        });
    },
    arrRecords: function() {
        if (!this.record) {
            return;
        }
        var record = this.record;
        return _.chain(record).map(function(d, key) {
            if (_.isObject(d)) {
                return _.map(d, function(d2, key2) {
                    return {
                        name: key + '.' + key2,
                        //name: 'Schemas.'+key2,
                        val: d2
                    };
                });
            }
        }).flatten().compact().value();
    }
});
Template.admin.events({
    'click .removeUser': function(event, template) {
        Meteor.call('removeUser', this._id, function(err) {
            console.log(err);
        });
    }
});
