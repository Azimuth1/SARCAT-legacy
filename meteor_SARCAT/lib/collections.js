//Records = new Meteor.Collection('titles');
Records = new Mongo.Collection('records');
// Calculate a default name for a list in the form of 'List A'
Records.defaultName = function() {
    console.log('!')
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
Todos = new Meteor.Collection('todos');
//Records = new Mongo.Collection('records');
Schemas = {};
//Template.registerHelper('Schemas', Schemas);
//Schemas.Records = new SimpleSchema({
Records.attachSchema(new SimpleSchema({
    name: {
        type: String,
        label: 'Save As',
        max: 200,
        optional: false
    },
    status: {
        type: String,
        allowedValues: [
            'Active',
            'Closed',
            'Open'
        ],
        label: 'Status',
        autoValue: function() {
            if (this.isInsert) {
                return 'Open';
            }
        }
    },
    created: {
        type: String,
        autoValue: function() {
            if (this.isInsert) {
                return new Date().toDateString();
            } else {
                this.unset();
            }
        }
    },
    leadagency: {
        type: String,
        label: 'Lead Agency',
        max: 200,
        optional: true
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
    incidentdate: {
        type: Date,
        label: 'Incident Date',
        //min: 0
        optional: true
    },
    /*incidenttime: {
        type: Number,
        label: 'Incident Time',
        min: 0,
        optional: true
    },*/
    incidenttime: {
        type: String,
        label: 'Incident Time',
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'time'
            }
        }
    },
    preparedby: {
        type: String,
        label: 'Prepared By',
        optional: true
    },
    organizationagency: {
        type: String,
        label: 'Organization/Agency',
        max: 200,
        optional: true
    },
    email: {
        type: String,
        label: 'Email',
        regEx: SimpleSchema.RegEx.Email,
        max: 200,
        optional: true
    },
    phonenum: {
        type: Number,
        label: 'Phone #',
        optional: true
    },
    incidenttype: {
        type: String,
        allowedValues: [
            'Hiker',
            'ATV',
            'Camper'
        ],
        optional: true,
        label: 'Incident Type'
    },
    country: {
        type: String,
        label: 'Country',
        optional: true
    },
    stateregion: {
        type: String,
        label: 'State/Region',
        optional: true
    }
}));
Schemas.Person = new SimpleSchema({
    firstName: {
        type: String,
        index: 1,
        unique: true
    },
    lastName: {
        type: String,
        optional: true
    },
    age: {
        type: Number,
        optional: true
    }
});
Collections = {};
People = new Mongo.Collection('People');
Collections.People = People;
People.attachSchema(Schemas.Person);
