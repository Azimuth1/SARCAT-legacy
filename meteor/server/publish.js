Meteor.publish('records', function () {
    if (this.userId) {
        return Records.find({});
        //return Records.find({},{fields: {recordInfo: 1}});
    } else {
        this.ready();
    }
});

Meteor.publish('item', function (filter) {
    var encryptionKey = Meteor.settings.private.encryptionKey
    check(filter, String);
    if (this.userId) {
        var self = this;
        var subHandle = Records.find(filter || {});
        var handle = subHandle.observeChanges({
            added: function (id, fields) {
                var hide = ['name', 'address', 'homePhone', 'cellPhone', 'other'];
                var allFields = fields.subjects.subject;
                if (self.userId === subHandle.fetch()[0].admin.userId) {
                    allFields.forEach(function (d, ind) {
                        _.each(d, function (e, f) {
                            if (_.contains(hide, f)) {

                                allFields[ind][f] = CryptoJS.AES
                                    .decrypt(allFields[ind][f], encryptionKey)
                                    .toString(CryptoJS.enc.Utf8);
                            }
                        })
                    });
                }
                self.added("records", id, fields);
            },
            changed: function (id, fields) {
                if (fields.subjects) {
                    var hide = ['name', 'address', 'homePhone', 'cellPhone', 'other'];
                    var allFields = fields.subjects.subject;
                    if (self.userId === subHandle.fetch()[0].admin.userId) {
                        allFields.forEach(function (d, ind) {
                            _.each(d, function (e, f) {
                                if (_.contains(hide, f)) {
                                    var dec = CryptoJS.AES
                                        .decrypt(allFields[ind][f], encryptionKey)
                                        .toString(CryptoJS.enc.Utf8);

                                    allFields[ind][f] = dec;
                                }
                            })
                        });
                    }
                }
                self.changed("records", id, fields);

            },
            removed: function (id) {
                self.removed("records", id);
            }
        });
        self.ready();
        self.onStop(function () {
            handle.stop();
        });
    } else {
        this.ready();
    }
});

Meteor.publish('audit', function (id) {
    if (this.userId) {
        return RecordsAudit.find({});
    } else {
        this.ready();
    }
});
Meteor.publish('privateLists', function () {
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
Meteor.publish('userData', function () {
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
Meteor.publish('roles', function () {
    return Meteor.roles.find()
})
Meteor.publish('config', function () {
    return Config.find({}, {
        fields: {
            'encryptionKey': 0
        }
    });
});
Meteor.publish('adminDefault', function () {
    return Meteor.users.find({
        emails: {
            $elemMatch: {
                address: 'admin@sarcat'
            }
        }
    });
});

