//var agencyProfile;
//var agencyCoordinates;
//var map;
var mapDrawn;

var config;
Template.admin.created = function() {
    config = Session.get('config');
};

Template.admin.rendered = function() {

    this.data.users.forEach(function(d) {
        var role = d.roles[0];
        var id = d._id;
        $('input[name="role_' + id + '"][value="' + role + '"]')
            .prop("checked", true)
    });
};
Template.admin.helpers({
    agencyCoordinates: function() {
        return agencyCoordinates;
    },
    profileIncomplete: function() {
        var complete = completeProfile();
        Session.set('profileComplete', complete);
        return !complete;
    },
    configs: function() {
        return Session.get('config');
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
        return Schemas[name]._firstLevelSchemaKeys.map(function(d) {
            return name + '.' + d;
        });
    },
    arrRecords: function() {
        if (!this.record) {
            return;
        }
        var record = this.record;
        return _.chain(record)
            .map(function(d, key) {
                if (_.isObject(d)) {
                    return _.map(d, function(d2, key2) {
                        return {
                            name: key + '.' + key2,
                            //name: 'Schemas.'+key2,
                            val: d2
                        };
                    });
                }
            })
            .flatten()
            .compact()
            .value();
    },
    roleIsChecked: function(e, f) {
        return true;
        return this.roles[0] === $(e.target)
            .val();
        console.log(this)
        $('input[name="role_oS8Y6oZC5WraaCnPW"]:checked')
            .val();
        return 'checked';
    },
});

var drawMap = function(newBounds) {

    mapDrawn = setMap('adminMap', newBounds);

};
Template.admin.events({
    'click .removeUser': function(event, template) {

        if (Meteor.userId() === this._id) {
            alert('You cannot remove your own account!');
            return;
        }
        Meteor.call('removeUser', this._id, function(err) {
            console.log(err);
        });
    },
    'click .adminMap': function(event, template) {

        template.$('a[data-toggle="tab"][href="#adminMapTab"]')
            .on('shown.bs.tab', function(e) {
                if (mapDrawn) {
                    return;
                }

                var agencyProfile = config.agencyProfile;
                var bounds = agencyProfile.bounds;
                var newBounds = boundsString2Array(bounds);
                drawMap(newBounds);
            });

      
    },
    'change .adminUserRoles': function(event) {
        var user = this._id;

        if (Meteor.userId() === this._id) {
            alert('You cannot remove your own account!');
            return;
        }
        var val = $('input[name="role_' + user + '"]:checked')
            .val();
        console.log(user, val)
            //var checked = event.target.checked;
            //var val = $(e.target).val();
        Meteor.call('changeRole', user, val, function(err) {
            console.log(err);
        });
        //$('input[name="role_oS8Y6oZC5WraaCnPW"]:checked').val();
        //.prop('checked', true);
    }
});
hooks2 = {
    onSubmit: function(doc) {
        console.log(doc);
        Schemas.SARCAT.clean(doc);
        console.log(doc);
        this.done();
        return false;
    },
    // Schemas.SARCAT.clean(doc);
    onSuccess: function(formType, result) {
        console.log(formType, result);
    },
    onError: function(formType, error) {
        console.log(formType, error);
    },
    beginSubmit: function(a) {
        // console.log()
        console.log('beginSubmit');
    },
    endSubmit: function() {
        console.log('endSubmit');
    }
};
/*
AutoForm.hooks({
    recordAdminForm: {
        // Schemas.SARCAT.clean(doc);
        onSuccess: function(operation, result, template) {
            console.log(operation, result);
        },
        onError: function(operation, error, template) {
            console.log(error);
        },
        beginSubmit: function() {
            console.log('beginSubmit');
        },
        endSubmit: function() {
            console.log('endSubmit');
        }
    }
});*/
AutoForm.addHooks('adminRoles', hooks2);
