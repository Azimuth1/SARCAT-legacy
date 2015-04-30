Records = new Mongo.Collection('records');
Config = new Mongo.Collection('config');
Records.lastRecord = function (type) {
    var lastRecords = Records.find({}, {
            sort: {
                created: -1
            },
        })
        .fetch();
    if (!lastRecords.length) {
        return '1';
    }
    var last = _.find(lastRecords, function (d) {
        if (d.recordInfo && d.recordInfo[type]) {
            return d.recordInfo[type];
        }
    });
    return last ? 'Previous:  ' + last.recordInfo[type] : '1';
};
Records.defaultName = function () {
    var nextLetter = 'A',
        nextName = 'Incident ' + nextLetter;
    while (Records.findOne({
            'recordInfo.name': nextName
        })) {
        nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
        nextName = 'Incident ' + nextLetter;
    }
    return nextName;
};
Records.defaultNum = function () {
    var nextLetter = 1;
    while (Records.findOne({
            'recordInfo.incidentnum': nextLetter
        })) {
        nextLetter = nextLetter + 1;
    }
    return nextLetter.toString();
};
/*
function convertToC(fTempVal) {
    return cTempVal = (fTempVal - 32) * (5 / 9);
}

function convertToF(cTempVal) {
    return (cTempVal * (9 / 5)) + 32;
}

convertDeg = function (val) {

    function convertToC(fTempVal) {
        return cTempVal = (fTempVal - 32) * (5 / 9);
    }

    function convertToF(cTempVal) {
        return (cTempVal * (9 / 5)) + 32;
    }

    var config = Config.findOne();
    var agencyProfile = config.agencyProfile;
    var currentUnit = agencyProfile.measureUnits;
    if (currentUnit === 'Metric') {
        return val;
    }
    return convertToC(val);

};
*/
Schemas = {};
Schemas = {};
Schemas.User = new SimpleSchema({
    emails: {
        type: [Object]
    },
    username: {
        type: String,
    },
    'emails.$.address': {
        type: String,
        //
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
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['viewer', 'editor', 'admin'],
        defaultValue: ['viewer'],
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
});
Meteor.users.attachSchema(Schemas.User);
Schemas.admin = new SimpleSchema({
    user: {
        type: String,
        optional: true,
        label: 'Prepared By',
        autoValue: function () {
            if (this.isInsert) {
                return Meteor.user()
                    .username;
            }
        }
    },
    email: {
        type: String,
        optional: true,
        regEx: SimpleSchema.RegEx.Email,
        autoValue: function () {
            if (this.isInsert) {
                return Meteor.user()
                    .emails[0].address;
            }
        }
    },
    phonenum: {
        type: String,
        label: 'Phone #',
        optional: true,
        autoform: {
            omit: true
        },
        autoValue: function () {
            if (this.isInsert) {
                //var config = Config.findOne();
                return Config.findOne()
                    .agencyProfile.phoneNum;
            }
        }
    }
});
Schemas.recordInfo = new SimpleSchema({
    name: {
        type: String,
        label: 'Record Name',
        unique: true,
        autoform: {
            placeholder: function (d) {
                return Records.lastRecord('name');
            }
        },
    },
    incidentnum: {
        type: String,
        label: 'Incident #',
        unique: true,
        autoform: {
            placeholder: function (d) {
                return Records.lastRecord('incidentnum');
            }
        },
    },
    missionnum: {
        type: String,
        optional: true,
        label: 'Mission #',
        autoform: {
            placeholder: function (d) {
                return Records.lastRecord('missionnum');
            }
        },
    },
    incidentdate: {
        type: 'datetime',
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        label: 'Incident Date/Time',
        //defaultValue: moment().format('YYYY-MM-DThh:mm')
    },
    incidenttype: {
        type: String,
        allowedValues: ['Unknown', 'Search', 'Rescue', 'Beacon', 'Recovery', 'Training', 'Disaster', 'Fugitive', 'False Report', 'StandBy', 'Attempt To Locate', ' Evidence'],
        label: 'Incident Type',
        defaultValue: 'Search'
    },
    status: {
        type: String,
        allowedValues: ['Unknown', 'Active', 'Closed', 'Open'],
        label: 'Incident Status',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return [{
                    "label": "Active",
                    "value": "Active"
                }, {
                    "label": "Open",
                    "value": "Open"
                }, {
                    "label": "Closed",
                    "value": "Closed"
                }, {
                    "label": "Unknown",
                    "value": "Unknown"
                }, ];
            }
        }
    },
});
Schemas.incident = new SimpleSchema({
    leadagency: {
        type: String,
        optional: true,
        label: 'Agency Having Jurisdiction',
    },
    'sar notified date-time': {
        type: String,
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        label: 'SAR Notified Date/Time',
        optional: true
    },
    country: {
        type: String,
        label: 'Incident Response Country',
        optional: true,
    },
    administrative1: {
        type: String,
        optional: true,
        label: 'Incident State/Region',
    },
    administrative2: {
        type: String,
        label: 'Incident County/Region',
        optional: true,
    },
    subjectcategory: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ["ATV", "Abandoned Vehicle", "Abduction", "Ages 1-3 (Toddler)", "Ages 10-12 (Pre-Teenager)", "Ages 13-15 (Adolescent)", "Ages 4-6 (PreSchool)", "Ages 7-9 (SchoolAge)", "Aircraft Incident", "Alpine Skier", "Angler", "Autism", "Car Camper", "Caver", "Day Climber", "Dementia", "Despondent", "Extreme Race", "Gatherer", "Hiker", "Horseback Rider", "Hunter", "Intellectual Disability", "Mental Illness", "Motorcycle", "Mountain Bike", "Mountaineer", "Non-Powered Boat", "Nordic Skier", "Person in Current Water", "Person in Flat Water", "Person in Flood Water", "Power Boat", "Runner", "Snowboarder", "Snowmobiler", "Snowshoer", "Substance Intoxication", "Unknown", "Vehicle (4WD)", "Vehicle (Road)", "Worker", "Other"],
        label: 'Subject Category',
    },
    subjectSubCategory: {
        type: String,
        optional: true,
        label: 'Subject Sub-Category',
        //changeName???
    },
    contactmethod: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Reported Missing', 'Vehicle Found', 'Registration Card', 'ELT/PLB/EPIRP', 'Satelitte Alerting Technology', 'Subject Cell Phone', 'Radio', 'Distress Signal'],
        label: 'Contact Method',
    },
    landOwner: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Private', 'Commercial', 'County', 'State', 'NPS', 'USFS', 'BLM', 'Military', 'Native/Tribal', 'Navigable Water', 'Other'],
        label: 'Land Owner',
    },
    incidentEnvironment: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Land', 'Air', 'Water'],
        label: 'Incident Environment',
        defaultValue: 'Land'
    },
    ecoregiondomain: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ["POLAR", "TEMPERATE", "DRY", "TROPICAL"],
        label: 'Ecoregion Domain',
    },
    ecoregionDivision: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ["110-ICECAP DIVISION", "120-TUNDRA DIVISION", "130-SUBARCTIC DIVISION", "210-WARM CONTINENTAL DIVISION", "220-HOT CONTINENTAL DIVISION", "230-SUBTROPICAL DIVISION", "240-MARINE DIVISION", "250-PRAIRIE DIVISION", "260-MEDITERRANEAN DIVISION", "310-TROPICAL/SUBTROPICAL STEPPE DIVISION", "320-TROPICAL/SUBTROPICAL DESERT DIVISION", "330-TEMPERATE STEPPE DIVISION", "340-TEMPERATE DESERT DIVISION", "410-SAVANNA DIVISION", "420-RAINFOREST DIVISION", "M110-ICECAP REGIME MOUNTAINS", "M120-TUNDRA REGIME MOUNTAINS", "M130-SUBARCTIC REGIME MOUNTAINS", "M210-WARM CONTINENTAL REGIME MOUNTAINS", "M220-HOT CONTINENTAL REGIME MOUNTAINS", "M230-SUBTROPICAL REGIME MOUNTAINS", "M240-MARINE REGIME MOUNTAINS", "M250-PRAIRIE REGIME MOUNTAINS", "M260-MEDITERRANEAN REGIME MOUNTAINS", "M310-TROPICAL/SUBTROPICAL STEPPE REGIME MOUNTAINS", "M320-TROPICAL/SUBTROPICAL DESERT REGIME MOUNTAINS", "M330-TEMPERATE STEPPE REGIME MOUNTAINS", "M340-TEMPERATE DESERT REGIME MOUNTAINS", "M410-SAVANNA REGIME DIVISION", "M420-RAINFOREST REGIME MOUNTAINS"],
        label: 'Ecoregion Division',
    },
    populationDensity: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Wilderness', 'Rural', 'Suburban', 'Urban', 'Water'],
        label: 'Population Density',
        //ask Bob
        //UTI????
    },
    terrain: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Mountain', 'Hilly', 'Flat', 'Water'],
        label: 'Terrrain',
    },
    landCover: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Bare', 'Light', 'Moderate', 'Heavy', 'Water'],
        label: 'Land Cover',
    },
});
Schemas.coords = new SimpleSchema({
    /*bounds: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },*/
    ippCoordinates: {
        type: Object,
        label: 'Incident Location/IPP',
        optional: true
    },
    'ippCoordinates.lat': {
        type: Number,
        label: 'Latitude',
        decimal: true,
        optional: true
    },
    'ippCoordinates.lng': {
        type: Number,
        label: 'Longitude',
        decimal: true,
        optional: true
    },
    'revisedLKP_PLS': {
        type: Object,
        optional: true,
        label: 'Last Known Point/Point Last Seen'
    },
    'revisedLKP_PLS.lat': {
        type: Number,
        decimal: true,
        label: 'Latitude',
        optional: true
    },
    'revisedLKP_PLS.lng': {
        type: Number,
        decimal: true,
        label: 'Longitude',
        optional: true
    },
    decisionPointCoord: {
        type: Object,
        label: 'Decision Point',
        optional: true
    },
    destinationCoord: {
        type: Object,
        label: 'Intended Destination',
        optional: true
    },
    'destinationCoord.lat': {
        type: Number,
        decimal: true,
        label: 'Latitude',
        optional: true
    },
    'destinationCoord.lng': {
        type: Number,
        decimal: true,
        label: 'Longitude',
        optional: true
    },
    'findCoord': {
        type: Object,
        label: 'Find Location',
        optional: true
    },
    'findCoord.lat': {
        type: Number,
        decimal: true,
        label: 'Latitude',
        optional: true
    },
    'findCoord.lng': {
        type: Number,
        decimal: true,
        label: 'Longitude',
        optional: true
    },
    'decisionPointCoord.lat': {
        type: Number,
        decimal: true,
        label: 'Latitude',
        optional: true
    },
    'decisionPointCoord.lng': {
        type: Number,
        decimal: true,
        label: 'Longitude',
        optional: true
    },
    intendedRoute: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
    actualRoute: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        }
    },
});
Schemas.incidentOperations = new SimpleSchema({
    ipptype: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Point Last Seen', 'Last Known Point'],
        label: 'IPP Type',
    },
    ippclassification: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Airport', 'Beacon', 'Building', 'Field', 'Radar', 'Residence', 'Road', 'Signal', 'Trail', 'Trailhead', 'Vehicle', 'Water', 'Woods', 'Other'],
        label: 'IPP Classification',
    },
    'initialDirectionofTravel': {
        type: Number,
        label: ' ',
        optional: true
    },
    'DOTHowdetermined': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Intended Destination', 'Physical Clue', 'Sighting', 'Tracks', 'Tracking/Trailing dog', 'Other'],
        label: 'Determining Factor',
        optional: true
    },
    'typeofDecisionPoint': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Other', 'Saddle', 'Shortcut', 'Trail', 'Animal', 'Trail Crossed', 'Trail Junction', 'Trail Lost', 'Trail Social', 'Trail Turnoff'],
        label: 'Type of Decision Point',
        optional: true
    },
    'decisionPointFactor': {
        type: String,
        label: 'Decision Point A Find Factor?',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return [{
                    label: "Yes",
                    value: "Yes"
                }, {
                    label: "No",
                    value: "No"
                }];
            },
        },
        optional: true
    },
    'PLS_HowDetermined': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Intended Destination', 'Physical Clue', 'Sighting', 'Tracks', 'Tracking/Trailing dog', 'Other'],
        label: 'Determining Factor',
        optional: true
    },
});
Schemas.incidentOutcome = new SimpleSchema({
    'incidentOutcome': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Closed by Search', 'Closed by Public', 'Closed by Self-Rescue', 'Closed by Investigation', 'Closed by Investigation-False Report', 'Closed by Investigation-Friend/Family', 'Closed by investigation-In facility', 'Closed by Investigation-Staged', 'Closed by investigation-Transportation', 'Open/Suspended', 'Other'],
        label: 'Incident Outcome',
        optional: true
    },
    'subject located date-time': {
        type: String,
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        label: 'Subject Located Date/Time',
        optional: true
    },
    'incident closed date-time': {
        type: String,
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        label: 'Incident Closed Date/Time',
        optional: true
    },
    'scenario': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Avalanche', 'Criminal', 'Despondent', 'Evading', 'Investigative', 'Lost', 'Medical', 'Drowning', 'Overdue', 'Stranded', 'Trauma'],
        label: 'Scenario',
        optional: true
    },
    'suspensionReasons': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Lack of clues', 'Lack of resources', 'Weather', 'Hazards', 'Lack of Survivability', 'Investigative information'],
        label: 'Suspension Reasons',
        optional: true
    },
    'lkp_pls_Boolean': {
        type: String,
        label: 'Is LKP/PLS Different from IPP?',
        optional: true,
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return [{
                    label: "Yes",
                    value: "Yes"
                }, {
                    label: "No",
                    value: "No"
                }];
            },
            value: 'No'
        }
    },
    'distanceIPP': {
        type: String,
        label: 'Distance From IPP',
        optional: true
    },
    'dispersionAngle': {
        type: String,
        label: 'Dispersion Angle (deg)',
        optional: true
    },
    'findBearing': {
        type: String,
        label: 'Find Bearing (deg)',
        optional: true
    },
    'trackOffset': {
        type: String,
        label: 'Track Offset',
        optional: true
    },
    'elevationChange': {
        type: String,
        label: 'Elevation Change',
        optional: true
    },
    'findFeature': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Brush', 'Canyon', 'Cave', 'Drainage', 'Field', 'Forest/Woods', 'Ice/Snow', 'Structure', 'Road', 'Rock', 'Scrub', 'Trail', 'Vehicle', 'Lake/Pond/Water', 'Wetland', 'Yard'],
        label: 'Find Feature',
        optional: true
    },
    'foundSecondary': {
        type: String,
        label: 'Found Secondary',
        optional: true
    },
    'detectability': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Excellent', 'Good', 'Fair', 'Poor'],
        label: 'Detectability',
        optional: true
    },
    'mobility&Responsiveness': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Mobile and responsive', 'Mobile and unresponsive', 'Immobile and responsive', 'Immobile and unresponsive'],
        label: 'Mobility/Responsiveness',
        optional: true
    },
    'lostStrategy': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Backtracking', 'Direction sampling', 'Direction traveling', 'Downhill', 'Evasive', 'wisdom', 'Followed travel aid', 'Landmark', 'Nothing', 'Paniced', 'Route sampling', 'Stayed put', 'View enhancing', 'Seek cell signal', 'Other'],
        label: 'Lost Strategy',
        optional: true
    },
    'mobility_hours': {
        type: Number,
        label: 'Mobility (hours)',
        optional: true
    },
});
Schemas.subjects = new SimpleSchema({
    subject: {
        type: Array,
        label: 'Subject Info',
        optional: true
    },
    'subject.$': {
        type: Object
    },
    'subject.$._key': {
        type: String,
        label: 'Name/Alias',
        optional: true,
        autoValue: function (a, b) {
            if (!this.isSet) {
                return new Date()
                    .toISOString();
            }
        },
        autoform: {
            omit: true
        }
    },
    'subject.$.age': {
        type: Number,
        label: 'Age',
        optional: true,
    },
    'subject.$.sex': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Male', 'Female'],
        label: 'Sex',
        optional: true
    },
    'subject.$.weight': {
        type: String,
        label: 'Weight',
        optional: true
    },
    'subject.$.height': {
        type: String,
        label: 'Height',
        optional: true
    },
    'subject.$.physical_fitness': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Fitness Level',
        optional: true
    },
    'subject.$.experience': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Experience',
        optional: true
    },
    'subject.$.equipment': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Equipment',
        optional: true
    },
    'subject.$.clothing': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Clothing',
        optional: true
    },
    'subject.$.survival_training': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Survival training',
        optional: true
    },
    'subject.$.local': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Yes', 'No', 'Guide'],
        label: 'Local?',
        optional: true
    },
    'subject.$.status': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Alive and well', 'Injured', 'DOA'],
        label: 'Rescue Status',
        optional: true
    },
    'subject.$.evacuationMethod': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Walkout', 'Carryout', 'Semi-Tech', 'Technical', 'Vehicle', 'Boat', 'Swiftwater', 'Helicopter', 'AeromedicalOther'],
        label: 'Evacuation Methods',
        optional: true
    },
    'subject.$.mechanism': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Animal attack/bite/sting', 'Human attack', 'Fall - ground level', 'Fall - height', 'Gunshot', 'Avalanche', 'Tree fall', 'Rock fall', 'Water', 'Environment', 'Medical condition', 'Other'],
        label: 'Mechanism',
        optional: true
    },
    'subject.$.injuryType': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Abrasion', 'Bruise', 'Burn', 'Cramp', 'Crush', 'Fracture', 'Flail Chest', 'Frostbite', 'Infection', 'Laceration', 'Pain', 'Soft Tissue', 'Sprain', 'Multi-Trauma', 'Drowning'],
        label: 'Injury Type',
        optional: true
    },
    'subject.$.illness': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Addision', 'Allergic reaction', 'Altitude disorder', 'Appendicitis', 'Asthma', 'Dehydration', 'Exhaustion', 'Hypertherimic', 'Hypothermic', 'Illness', 'Intoxicated', 'Seizures', 'Shock', 'Shortness of Breath', 'Stroke', 'Unconscious', 'UTI', 'Other'],
        label: 'Illness',
        optional: true
    },
    'subject.$.treatmentby': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'None', 'Self', 'Public', 'First-Aid', 'First-Responder', 'EMT', 'WEMT', 'ALS', 'RN', 'MD', 'N/A'],
        label: 'Treatment by',
        optional: true
    },
    'subject.$.name': {
        type: String,
        label: 'Full Name',
        optional: true
    },
    'subject.$.address': {
        type: String,
        label: 'Address',
        optional: true
    },
    'subject.$.homePhone': {
        type: String,
        label: 'Home Phone',
        optional: true
    },
    'subject.$.cellPhone': {
        type: String,
        label: 'Cell Phone',
        optional: true
    },
    'subject.$.other': {
        type: String,
        optional: true,
        label: 'Comments',
        autoform: {
            rows: 1,
        }
    },
});
Schemas.rescueDetails = new SimpleSchema({
    'signalling': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'None', 'N/A', 'ELT', 'EPIRP', 'PLB', 'SPOT', 'Satellite-Alerting', 'Cell phone', 'Cell + GPS', 'Radio', 'FRS/GMRS', 'Fire/Smoke', 'Flare', 'Mirror', 'Visual', 'Sound', 'Other'],
        label: 'Signalling',
        optional: true
    },
    'injuredSearcher': {
        type: String,
        label: 'Injured Searcher',
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Yes', 'No'],
        optional: true,
        /*autoform: {
            afFieldInput: {
                type: "boolean-checkbox"
            }
        }*/
    },
    'injuredSearcherDetails': {
        type: String,
        label: 'Injured Searcher Details',
        optional: true,
        autoform: {
            rows: 2
        }
    }
});
Schemas.resourcesUsed = new SimpleSchema({
    'numTasks': {
        type: Number,
        label: 'Total # of Tasks',
        optional: true
    },
    'totalPersonnel': {
        type: Number,
        label: 'Total Personnel',
        optional: true
    },
    'totalManHours': {
        type: Number,
        label: 'Total Man Hours',
        optional: true
    },
    'distanceTraveled': {
        type: String,
        label: 'Total Distance Traveled',
        optional: true
    },
    'totalCost': {
        type: String,
        label: 'Total Cost',
        optional: true
    },
    'resource': {
        type: Array,
        label: 'Resource',
        optional: true
    },
    'resource.$': {
        type: Object
    },
    'resource.$._key': {
        type: String,
        label: 'Name/Alias',
        optional: true,
        autoValue: function () {
            if (!this.isSet) {
                return new Date()
                    .toISOString();
            }
        },
        autoform: {
            omit: true
        }
    },
    'resource.$.type': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ["ATV", "Bike", "Boat", "Boats", "CERT", "Cave", "Containment", "Diver", "Dog-Airscent", "Dog-Disaster", "Dog-Tracking", "Dog-Trailing", "Dogs", "EMS", "Family/Friend", "Fire", "Fixed Wing", "GSAR", "Grid", "Hasty", "Helicopter", "Horseback rider", "Investigation", "Law", "Other", "Parks", "Patrol", "Public", "Sweep", "Swiftwater", "Tracker", "USAR", "Emergent Volunteers", "Unknown"],
        label: 'Resource Type',
        optional: true
    },
    'resource.$.count': {
        type: Number,
        label: 'Total Used',
        optional: true
    },
    'resource.$.hours': {
        type: Number,
        label: 'Total Hours',
        optional: true
    },
    'resource.$.findResource': {
        type: Boolean,
        label: 'Find Resource?',
        allowedValues: [true, false],
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
    },
});
Schemas.weather = new SimpleSchema({
    'summary': {
        type: String,
        optional: true,
        label: 'Brief Summary',
        autoform: {
            rows: 3
        }
    },
    'precipType': {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['rain', 'snow', 'sleet', 'none'],
        label: 'Precipitation Type'
    },
    'temperatureMax': {
        type: Number,
        decimal: true,
        optional: true,
        label: 'Max Temperature',
    },
    'temperatureMin': {
        type: Number,
        optional: true,
        decimal: true,
        label: 'Min Temperature',
    },
    'windSpeed': {
        type: String,
        optional: true,
        label: 'Wind Speed',
    },
    'cloudCover': {
        type: String,
        optional: true,
        label: 'Cloud Cover (%)',
    },
})
Schemas.xComments = new SimpleSchema({
    'summary': {
        type: String,
        optional: true,
        label: 'Comments',
        autoform: {
            rows: 4,
            'label-class': 'hide'
        }
    },
});
Schemas.formEditions = new SimpleSchema({
    type: {
        type: String,
        label: 'Choose SARCAT form level of detail',
        defaultValue: 'Platinum Edition',
        autoform: {
            type: 'select-radio-inline',
            options: function () {
                return [{
                    label: 'Platinum Edition',
                    'value': 'Platinum Edition'
                }, {
                    label: 'Gold Edition',
                    'value': 'Gold Edition'
                }, {
                    label: 'Silver Edition',
                    'value': 'Silver Edition'
                }, {
                    label: 'Basic Edition',
                    'value': 'Basic Edition'
                }];
            }
        }
    },
    recordInfo: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.recordInfo._firstLevelSchemaKeys,
        defaultValue: Schemas.recordInfo._firstLevelSchemaKeys,
        label: 'Record Info',
    },
    'recordInfo.$': {
        type: String
    },
    incident: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.incident._firstLevelSchemaKeys,
        defaultValue: Schemas.incident._firstLevelSchemaKeys,
        label: 'incident',
    },
    'incident.$': {
        type: String
    },
    weather: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.weather._firstLevelSchemaKeys,
        defaultValue: Schemas.weather._firstLevelSchemaKeys,
        label: 'weather',
    },
    'weather.$': {
        type: String
    },
    subjects: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.subjects._firstLevelSchemaKeys,
        defaultValue: Schemas.subjects._firstLevelSchemaKeys,
        label: 'subjects',
    },
    'subjects.$': {
        type: String
    },
    incidentOperations: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.incidentOperations._firstLevelSchemaKeys,
        defaultValue: Schemas.incidentOperations._firstLevelSchemaKeys,
        label: 'incidentOperations',
    },
    'incidentOperations.$': {
        type: String
    },
    incidentOutcome: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.incidentOutcome._firstLevelSchemaKeys,
        defaultValue: Schemas.incidentOutcome._firstLevelSchemaKeys,
        label: 'incidentOutcome',
    },
    'incidentOutcome.$': {
        type: String
    },
    /*medical: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },allowedValues: Schemas.medical._firstLevelSchemaKeys,
        defaultValue: Schemas.medical._firstLevelSchemaKeys,
        label: 'medical',
    },
    'medical.$': {
        type: String
    },*/
    rescueDetails: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.rescueDetails._firstLevelSchemaKeys,
        defaultValue: Schemas.rescueDetails._firstLevelSchemaKeys,
        label: 'resources',
    },
    'rescueDetails.$': {
        type: String
    },
});
Schemas.formEditions = new SimpleSchema({
    type: {
        type: String,
        label: 'Choose SARCAT form level of detail',
        defaultValue: 'Platinum Edition',
        autoform: {
            type: 'select-radio-inline',
            options: function () {
                return [{
                    label: 'Platinum Edition',
                    'value': 'Platinum Edition'
                }, {
                    label: 'Gold Edition',
                    'value': 'Gold Edition'
                }, {
                    label: 'Silver Edition',
                    'value': 'Silver Edition'
                }, {
                    label: 'Basic Edition',
                    'value': 'Basic Edition'
                }];
            }
        }
    },
    recordInfo: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.recordInfo._firstLevelSchemaKeys,
        defaultValue: Schemas.recordInfo._firstLevelSchemaKeys,
        label: 'Record Info',
    },
    'recordInfo.$': {
        type: String
    },
    incident: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.incident._firstLevelSchemaKeys,
        defaultValue: Schemas.incident._firstLevelSchemaKeys,
        label: 'incident',
    },
    'incident.$': {
        type: String
    },
    weather: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.weather._firstLevelSchemaKeys,
        defaultValue: Schemas.weather._firstLevelSchemaKeys,
        label: 'weather',
    },
    'weather.$': {
        type: String
    },
    subjects: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.subjects._firstLevelSchemaKeys,
        defaultValue: Schemas.subjects._firstLevelSchemaKeys,
        label: 'subjects',
    },
    'subjects.$': {
        type: String
    },
    /*timeLog: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.timeLog._firstLevelSchemaKeys,
        defaultValue: Schemas.timeLog._firstLevelSchemaKeys,
        label: 'timeLog',
    },
    'timeLog.$': {
        type: String
    },*/
    incidentOperations: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.incidentOperations._firstLevelSchemaKeys,
        defaultValue: Schemas.incidentOperations._firstLevelSchemaKeys,
        label: 'incidentOperations',
    },
    'incidentOperations.$': {
        type: String
    },
    incidentOutcome: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.incidentOutcome._firstLevelSchemaKeys,
        defaultValue: Schemas.incidentOutcome._firstLevelSchemaKeys,
        label: 'incidentOutcome',
    },
    'incidentOutcome.$': {
        type: String
    },
    /*medical: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },allowedValues: Schemas.medical._firstLevelSchemaKeys,
        defaultValue: Schemas.medical._firstLevelSchemaKeys,
        label: 'medical',
    },
    'medical.$': {
        type: String
    },*/
    rescueDetails: {
        type: Array,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: Schemas.rescueDetails._firstLevelSchemaKeys,
        defaultValue: Schemas.rescueDetails._firstLevelSchemaKeys,
        label: 'resources',
    },
    'rescueDetails.$': {
        type: String
    },
});
Schemas.SARCAT = new SimpleSchema({
    measureUnits: {
        type: String,
        optional: false,
        label: 'Units',
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['US', 'Metric'],
        autoform: {
            omit: true
        },
        autoValue: function () {
            if (this.isInsert) {
                return Config.findOne()
                    .measureUnits;
            } else {
                this.unset();
            }
        }
    },
    userId: {
        type: String,
        optional: false,
        autoValue: function () {
            if (this.isInsert) {
                return Meteor.userId();
            }
        },
        autoform: {
            omit: true
        }
    },
    updated: {
        type: Date,
        autoValue: function () {
            if (this.isUpdate) {
                return new Date();
            }
        },
        denyInsert: true,
        optional: true
    },
    created: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) {
                return new Date;
            } else if (this.isUpsert) {
                return {
                    $setOnInsert: new Date
                };
            } else {
                this.unset();
            }
        }
    },
    coords: {
        type: Schemas.coords,
        optional: true,
        label: 'Map Data'
            //optional: true
    },
    admin: {
        type: Schemas.admin,
        optional: true,
        //blackbox: true,
        //defaultValue: {}
    },
    incidentOperations: {
        type: Schemas.incidentOperations,
        optional: true,
        label: 'Incident Map Operations',
    },
    recordInfo: {
        type: Schemas.recordInfo,
        optional: true,
        label: 'Record Info',
        //optional: true
    },
    incident: {
        type: Schemas.incident,
        optional: true,
        label: 'Incident Details',
        defaultValue: {}
    },
    weather: {
        type: Schemas.weather,
        label: 'Weather',
        optional: true,
        defaultValue: {}
    },
    incidentOutcome: {
        type: Schemas.incidentOutcome,
        label: 'Incident Outcome',
        optional: true,
        defaultValue: {}
    },
    rescueDetails: {
        type: Schemas.rescueDetails,
        label: 'Rescue Details',
        optional: true,
        defaultValue: {}
    },
    subjects: {
        type: Schemas.subjects,
        label: 'Subject Information',
        optional: true,
        defaultValue: {
            subject: []
        }
    },
    resourcesUsed: {
        type: Schemas.resourcesUsed,
        optional: true,
        label: 'Resources Used',
        defaultValue: {
            resource: []
        }
    },
    xComments: {
        type: Schemas.xComments,
        optional: true,
        label: 'Comments',
    }
});
Records.attachSchema(Schemas.SARCAT);
Schemas.agencyProfile = new SimpleSchema({
    organization: {
        type: String,
        label: 'Organization Name',
        defaultValue: ''
    },
    country: {
        type: String,
        label: 'Country/Region',
        defaultValue: ''
    },
    address: {
        type: String,
        label: 'Street',
        defaultValue: ''
    },
    'city': {
        type: String,
        label: 'City',
        defaultValue: ''
    },
    'state-region': {
        type: String,
        label: 'State/Province/Region',
        defaultValue: ''
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
            type: "select-radio-inline",
            options: function () {
                return [{
                    label: "US",
                    value: "US"
                }, {
                    label: "Metric",
                    value: "Metric"
                }];
            },
        },
    },
    agencyProfileComplete: {
        type: Boolean,
        autoValue: function () {
            var config = Config.findOne();
            if (!config) {
                return false;
            }
            var agencyProfile = config.agencyProfile;
            var apKeys = Object.keys(agencyProfile);
            var complete = apKeys.length === Schemas.agencyProfile._schemaKeys.length;
            return complete;
        }
    },
    agencyLogo: {
        type: String,
        optional: true,
        //defaultValue: 'default_logo.png',
    },
    weatherAPI: {
        type: Boolean,
        optional: true,
    },
    agencyProfile: {
        type: Schemas.agencyProfile,
        defaultValue: {},
        label: 'Organization Profile'
            //optional: true,
            //blackbox: true
    },
    googleAPI: {
        type: String,
        label: 'Google API Key',
        defaultValue: 'AIzaSyDNWoPzOFwqV3F0Z7AFCuFUvENFbwjkaVs'
    },
    forecastAPI: {
        type: String,
        label: 'Forecast API Key',
        defaultValue: 'f3da6c91250a43b747f7ace5266fd1a4'
    },
    /*formEditions: {
        type: Schemas.formEditions,
    },*/
});
Config.attachSchema(Schemas.config);

