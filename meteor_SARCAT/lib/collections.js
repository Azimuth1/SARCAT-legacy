Records = new Mongo.Collection('records');
Config = new Mongo.Collection('config');
Records.defaultName = function() {
    var nextLetter = 'A',
        nextName = 'New Record ' + nextLetter;
    while (Records.findOne({
            name: nextName
        })) {
        // not going to be too smart here, can go past Z
        nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
        nextName = 'New Record ' + nextLetter;
    }
    return nextName;
};
Schemas = {};
Schemas.admin = new SimpleSchema({
    userId: {
        type: String,
        optional: false,
        autoValue: function() {
            if (this.isInsert) {
                return Meteor.userId();
            }
        }
    },
    name: {
        type: String,
        label: 'Save As',
        max: 200,
        optional: false
    },
    status: {
        type: String,
        allowedValues: ['Active', 'Closed', 'Open'],
        label: 'Status',
        autoValue: function() {
            if (this.isInsert) {
                return 'Open';
            }
        },
    },
    created: {
        type: String,
        autoValue: function() {
            return new Date()
                .toDateString();
        }
    },
    leadagency: {
        type: String,
        label: 'Lead Agency',
        max: 200,
        optional: true,
        autoValue: function() {
            if (this.isInsert) {
                return 'Default Agency';
            }
        }
    },
    organizationagency: {
        type: String,
        label: 'Organization/Agency',
        max: 200,
        optional: true,
        autoValue: function() {
            if (this.isInsert) {
                return 'Default Agency';
            }
        }
    },
    incidentnum: {
        type: Number,
        label: 'Incident #',
        optional: true
    },
    missionnum: {
        type: Number,
        label: 'Mission #',
        optional: true
    },
    'incidentdate': {
        type: Date,
        label: 'Incident Date',
        //min: 0
        optional: true,
        autoValue: function() {
            if (this.isInsert) {
                return new Date();
            }
        }
    },
    'incidenttime': {
        type: String,
        label: 'Incident Time',
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'time'
            }
        },
        autoValue: function() {
            if (this.isInsert) {
                return '15:22';
            }
        }
    },
    phonenum: {
        type: Number,
        label: 'Phone #',
        optional: true
    },
    incidenttype: {
        type: String,
        allowedValues: ['Search', 'Rescue', 'Beacon', 'Recovery', 'Training', 'Disaster', 'Fugitive', 'False Report', 'StandBy', 'Attempt To Locate', ' Evidence'],
        optional: true,
        label: 'Incident Type'
    },
    country: {
        type: String,
        label: 'Country',
        optional: true,
        autoValue: function() {
            return 'Default Country';
        }
    },
    stateregion: {
        type: String,
        label: 'State/Region',
        optional: true,
        autoValue: function() {
            return 'Default State/Region';
        }
    }
});
Schemas.incident = new SimpleSchema({
    subjectcategory: {
        type: String,
        allowedValues: ['Abduction', 'Aircraft Incident', 'Non-Powered Boat', 'Person in Current Water', 'Person in Flat Water', 'Person in Flood Water', 'Power Boat', 'ATV', 'Motorcycle', 'Mountain Bike', 'Vehicle (4WD)', 'Vehicle (Road)', 'Autism', 'Dementia', 'Despondent', 'Intellectual Disability', 'Mental Illness', 'Substance Intoxication', 'Ages 1-3 (Toddler)', 'Ages 4-6 (PreSchool)', 'Ages 7-9 (SchoolAge)', 'Ages 10-12 (Pre-Teenager)', 'Ages 13-15 (Adolescent)', 'Abandoned Vehicle', 'Angler', 'Car Camper', 'Caver', 'Day Climber', 'Extreme Race', 'Gatherer', 'Hiker', 'Horseback Rider', 'Hunter', 'Mountaineer', 'Runner', 'Worker', 'Alpine Skier', 'Nordic Skier', 'Snowboarder', 'Snowmobiler', 'Snowshoer'],
        label: 'Subject Category',
        autoValue: function() {
            if (this.isInsert) {
                return 'Hiker';
            }
        },
    },
    contactmethod: {
        type: String,
        allowedValues: ['Reported Missing', 'Vehicle Found', 'Registration Card', 'ELT/PLB/EPIRP', 'Satelitte Alerting Technology', 'Subject Cell Phone', 'Radio', 'Distress Signal'],
        label: 'Contact Method',
        autoValue: function() {
            if (this.isInsert) {
                return 'Reported Missing';
            }
        },
    },
    ipptype: {
        type: String,
        allowedValues: ['Point Last Seen', 'Last Known Point'],
        label: 'IPP Type',
        autoValue: function() {
            if (this.isInsert) {
                return 'Point Last Seen';
            }
        },
    },
    ippclassification: {
        type: String,
        allowedValues: ['Airport', 'Beacon', 'Building', 'Field'],
        label: 'IPP Classification',
        autoValue: function() {
            if (this.isInsert) {
                return 'Airport';
            }
        },
    },
    ecoregiondomain: {
        type: String,
        allowedValues: ['Temperate', 'Dry', 'Polar', 'Tropical', 'Water'],
        label: 'Eco-Region Domain',
        autoValue: function() {
            if (this.isInsert) {
                return 'Temperate';
            }
        },
    }
});
Records.attachSchema(Schemas.admin);
Records.attachSchema(Schemas.incident);
Schemas.UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        //regEx: /^[a-zA-Z-]{2,25}$/,
        optional: true,
        /*defaultValue: function() {
            return 'a';
        }*/
    },
    lastName: {
        type: String,
        //regEx: /^[a-zA-Z]{2,25}$/,
        optional: true,
        /*defaultValue: function() {
            return 'b';
        }*/
    },
    role: {
        type: String,
        optional: false,
        defaultValue: function() {
            return 'user';
        }
    },
    Agency: {
        type: String,
        optional: true
    },
});



Schemas.User = new SimpleSchema({
    /*_id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },*/
    username: {
        type: String,
        optional: true,
        regEx: /^[a-z0-9A-Z_]{3,15}$/,
        custom: function () {
            //console.log(this);
        }
    },
    emails: {
        
        type: [Object],
        custom: function () {
            //console.log(this);
        }
    },
    'emails.$.address': {
        optional: true,
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    'emails.$.verified': {
        optional: true,
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schemas.UserProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Note that when using this package, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Roles.addUsersToRoles(userId, ['admin'], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: String,
        optional: true,
        blackbox: true,
        allowedValues: ['booker', 'provider', 'admin']
    }
});

Meteor.users.attachSchema(Schemas.User);
//Meteor.users.attachSchema(Schemas.UserProfile);
