Meteor.publish('records', function () {
    if (this.userId) {
        return Records.find({});
        //return Records.find({},{fields: {recordInfo: 1}});
    } else {
        this.ready();
    }
});
Meteor.publish('_item', function (id) {
    if (this.userId) {
        return Records.find(id, {
            fields: {
                //'subjects.subject': 1
            }
        });
    } else {
        this.ready();
    }
});
//Publishing and decrypting
Meteor.publish('xitem', function (filter) {
    var self = this;
    var subHandle = Records.find(filter || {}).observeChanges({
        added: function (id, fields) {
            var hide = ['name', 'address', 'homePhone', 'cellPhone', 'other'];
            var allFields = fields.subjects.subject;
            allFields.forEach(function (d) {
                _.each(d, function (e, f) {
                    if (_.contains(hide, f)) {
                        console.log(f)
                        d[f] = CryptoJS.AES
                            .decrypt(d[f], encryptionKey)
                            .toString(CryptoJS.enc.Utf8);
                    }
                })
            });
            self.added("records", id, fields);
        },
        changed: function (id, fields) {
            if (fields.subjects) {
                var hide = ['name', 'address', 'homePhone', 'cellPhone', 'other'];
                var allFields = fields.subjects.subject;
                allFields.forEach(function (d) {
                    _.each(d, function (e, f) {
                        if (_.contains(hide, f)) {
                            console.log(f)
                            d[f] = CryptoJS.AES
                                .decrypt(d[f], encryptionKey)
                                .toString(CryptoJS.enc.Utf8);
                        }
                    })
                });
            }
            self.changed("records", id, fields);
        },
        removed: function (id) {
            self.removed("records", id);
        }
    });
    self.ready();
    self.onStop(function () {
        subHandle.stop();
    });
});
Meteor.publish('item', function (filter) {
    encryptionKey = Meteor.settings.public.config.encryptionKey
    console.log(Meteor.settings.public.config.encryptionKey)
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
                                //console.log(f)
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
                                    //console.log(f,dec);
                                    allFields[ind][f] = dec;
                                }
                            })
                        });
                    }
                }
                self.changed("records", id, fields);
                //}
            },
            removed: function (id) {
                self.removed("records", id);
            }
        });
        self.ready();
        self.onStop(function () {
            handle.stop();
        });
    }
});
Meteor.publish('__item', function (id) {
    check(id, String);
    var cursor = Records.find(id, {});
    var self = this;
    encryptionKey = "adsffe534tryertrrtweGe";
    console.log('!!!!!')
    console.log(cursor)
    console.log('????????')
    var handle = cursor.observeChanges({
        /*added: function (id, fields) {
            console.log(fields)
            fields.text = CryptoJS.AES
                .decrypt(fields.text, encryptionKey)
                .toString(CryptoJS.enc.Utf8);
            self.added('item', id, fields);
        },*/
        changed: function (id, fields) {
            console.log(fields)
                /*if (fields.text) {
                    fields.text = CryptoJS.AES
                        .decrypt(fields.text, encryptionKey)
                        .toString(CryptoJS.enc.Utf8);
                }*/
            self.changed('item', id, fields);
        },
        /*removed: function (id) {
            self.removed('item', id);
        }*/
    });
    self.onStop(function () {
        handle.stop();
    });
    self.ready();
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
            /*'forecastAPI': 0,
            'googleAPI': 0*/
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
