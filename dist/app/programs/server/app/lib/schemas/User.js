(function(){Schemas.User = new SimpleSchema({
    emails: {
        type: [Object]
    },
    username: {
        type: String,
    },
    'emails.$.address': {
        type: String,
        label: 'Email',
        regEx: SimpleSchema.RegEx.Email
    },
    'emails.$.verified': {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    roles: {
        type: Array,
        autoform: {
            firstOption: function() {
                return "--";
            }
        },
        allowedValues: ['pending','viewer', 'editor', 'admin'],
        defaultValue: ['pending'],
        optional: true,
    },
    'roles.$': {
        type: String,
        optional: true
    },
    services: {
        type: Object,
        blackbox: true
    },
    profile: {
        type: Object,
        blackbox: true,
        optional: true
    },
});
Meteor.users.attachSchema(Schemas.User);

})();
