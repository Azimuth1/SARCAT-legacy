Config = new Mongo.Collection('config');



Schemas.customQuestions = new SimpleSchema({
    'q1': {
        type: String,
        optional: true,
        label: 'Custom Question 1',
        autoform: {
            rows: 3
        }
    },
    'q2': {
        type: String,
        optional: true,
        label: 'Custom Question 2',
        autoform: {
            rows: 3
        }
    },
    'q3': {
        type: String,
        optional: true,
        label: 'Custom Question 3',
        autoform: {
            rows: 3
        }
    },
    'a1': {
        type: String,
        optional: true,
        label: 'Custom Answer 1',
        autoform: {
            rows: 3
        }
    },
    'a2': {
        type: String,
        optional: true,
        label: 'Custom Answer 2',
        autoform: {
            rows: 3
        }
    },
    'a3': {
        type: String,
        optional: true,
        label: 'Custom Answer 3',
        autoform: {
            rows: 3
        }
    },
});



Schemas.agencyProfile = new SimpleSchema({
    contactPerson: {
        type: String,
        label: 'Organization Contact',
        defaultValue: ''
    },
    contactEmail: {
        type: String,
        label: 'Contact Email',
        defaultValue: ''
    },
    organization: {
        type: String,
        label: 'Organization Name',
        defaultValue: ''
    },
    country: {
        type: String,
        label: 'Country',
        defaultValue: 'United States',
        allowedValues: countryList.map(function(d) {
            return d.country;
        })
    },
    'city': {
        type: String,
        label: 'City',
        defaultValue: ''
    },
    street: {
        type: String,
        label: 'Street',
        defaultValue: ''
    },
    'state-province': {
        type: String,
        label: 'State/Province',
        defaultValue: '---',
    },
    'county-region': {
        type: String,
        label: 'County',
        optional: true
    },
    phoneNum: {
        type: String,
        label: 'Phone Number',
        defaultValue: ''
    }
});
Schemas.config = new SimpleSchema({
    initSetup: {
        type: Boolean,
        defaultValue: true
    },
    encryptionKey: {
        type: String,
        optional: true
    },
    bounds: {
        type: String,
        optional: true,
        defaultValue: "-143.61328125,11.350796722383684,106.34765625,62.99515845212052"
    },
    measureUnits: {
        type: String,
        label: 'Preferred Unit of Measurement',
        defaultValue: 'US',
        autoform: {
            type: "select-radio",
            options: function() {
                return [{
                    label: "US/Imperial",
                    value: "US"
                }, {
                    label: 'Metric',
                    value: "Metric"
                }];
            },
        },
    },
    agencyLogo: {
        type: String,
        optional: true,
    },
    agencyProfile: {
        type: Schemas.agencyProfile,
        defaultValue: {},
        label: 'Organization Profile'
    },
    internet: {
        type: Boolean,
        label: 'Connect To SARCAT Server to assist with autofill features (weather/elevation)?',
        optional: true,
        defaultValue: true
    },
    customQuestions: {
        type: Schemas.customQuestions,
        label: 'Create Customized Incident Questions For Your Team',
        optional: true,
        defaultValue: {}
    },
    layers: {
        type: Object,
        label: 'Map Layers',
        optional: true,
        defaultValue: {},
        blackbox: true,
    },
    sarcatServer: {
        type: String,
        optional: true,
    }
});
Config.attachSchema(Schemas.config);
