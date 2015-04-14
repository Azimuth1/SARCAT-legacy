Records = new Mongo.Collection('records');
Config = new Mongo.Collection('config');

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
        autoValue: function (d, e) {
            if (this.isInsert) {
                var value = this.value;
                if (value) {
                    return value;
                } else {
                    return Records.defaultName();
                }
            }
        }
    },
    status: {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Active', 'Closed', 'Open'],
        label: 'Incident Status',
        defaultValue: 'Open',
    },
    incidentnum: {
        type: String,
        optional: true,
        label: 'Incident #',
        /*autoform: {
            placeholder:lastIncidentNum()
        }*/
        /*autoValue: function () {
            if (this.isInsert) {
                var value = this.value;
                if (value) {
                    return value;
                } else {
                    return Records.defaultNum('incidentnum');
                }
            }
        }*/
    },
    missionnum: {
        type: String,
        optional: true,
        label: 'Mission #',
    },
    leadagency: {
        type: String,
        optional: true,
        label: 'Agency Having Jurisdiction',
        max: 200
    },

    incidenttype: {
        type: String,
        defaultValue: 'Search',
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Search', 'Rescue', 'Beacon', 'Recovery', 'Training', 'Disaster', 'Fugitive', 'False Report', 'StandBy', 'Attempt To Locate', ' Evidence'],
        label: 'Incident Type',
    }
});
Schemas.incident = new SimpleSchema({
    'incidentdate': {
        type: Date,
        optional: true,
        label: 'Incident Date',

    },
    'incidenttime': {
        type: String,
        optional: true,
        label: 'Incident Time',
        autoform: {
            afFieldInput: {
                type: 'time'
            }
        },

    },
    /*'incidentDataTime': {
        type: 'datetime',
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        label: 'Incident Date/Time',
        optional: true
    },*/

    country: {
        type: String,
        label: 'Response Country',
        optional: true,
        autoValue: function () {
            if (this.isInsert) {
                return Config.findOne()
                    .agencyProfile.country;
            }
        }
    },
    stateregion: {
        type: String,
        optional: true,
        label: 'Response State/Region',
        autoValue: function () {
            if (this.isInsert) {
                return Config.findOne()
                    .agencyProfile['state-region'];
            }
        }
    },
    subjectcategory: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ["ATV", "Abandoned Vehicle", "Abduction", "Ages 1-3 (Toddler)", "Ages 10-12 (Pre-Teenager)", "Ages 13-15 (Adolescent)", "Ages 4-6 (PreSchool)", "Ages 7-9 (SchoolAge)", "Aircraft Incident", "Alpine Skier", "Angler", "Autism", "Car Camper", "Caver", "Day Climber", "Dementia", "Despondent", "Extreme Race", "Gatherer", "Hiker", "Horseback Rider", "Hunter", "Intellectual Disability", "Mental Illness", "Motorcycle", "Mountain Bike", "Mountaineer", "Non-Powered Boat", "Nordic Skier", "Person in Current Water", "Person in Flat Water", "Person in Flood Water", "Power Boat", "Runner", "Snowboarder", "Snowmobiler", "Snowshoer", "Substance Intoxication", "Unknown", "Vehicle (4WD)", "Vehicle (Road)", "Worker"],
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
        allowedValues: ['Unknown', 'Choose', 'Land', 'Air', 'Water'],
        label: 'Incident Environment',
    },
    ecoregiondomain: {
        type: String,
        optional: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Temperate', 'Dry', 'Polar', 'Tropical', 'Water'],
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
        allowedValues: ['Unknown', 'M110 Icecap Regime Mountains', '120 Tundra Division', 'M120 Tundra Regime Mountains', '130 Subarctic Division', 'M130 Subarctic Regime Mountains', '210 Warm Continental Division', 'M210 Warm Continental Regime Mountains', '220 Hot Continental Division', 'M220 Hot Continental Regime Mountains', '230 Subtropical Division', 'M230 Subtropical Regime Mountains', '240 Marine Division', 'M240 Marine Regime Mountains', '250 Prairie Division', 'M250 Prairie Regime Mountains', '260 Mediterranean Division', 'M260 Mediterranean Regime Mountains', '310 Tropical/Subtropical Steppe Division', 'M310 Tropical/Subtropical Steppe Regime Mountains', '320 Tropical/Subtropical Dessert Division', 'M320 Tropical/Subtropical Regime Mountains', '330 Temperate Steppe Division'],
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

Schemas.timeLog = new SimpleSchema({
    'last seen date-time': {
        type: 'datetime',
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        label: 'Last Seen Date/Time',
        optional: true
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
    /*'total hours': {
        type: Number,
        label: 'Total Missing Hours',
        optional: true
    },
    'search hours': {
        type: Number,
        label: 'Total Search Hours',
        optional: true
    }*/
});
Schemas.coords = new SimpleSchema({
    bounds: {
        type: String,
        optional: true,
        //defaultValue: "-150.29296875,27.21555620902969,-41.66015625,50.736455137010665",

    },
    travelDirection: {
        type: String,
        optional: true,
    },
    ippCoordinates: {
        type: Object,
        label: 'IPP Coordinates',
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
    decisionPointCoord: {
        type: Object,
        label: 'decisionPointCoord',
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
    destinationCoord: {
        type: Object,
        label: 'Destination Coordinates',
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
        label: 'Find Coordinates',
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
    'revisedLKP-PLS': {
        type: Object,
        optional: true,
        label: 'Revised Point Last Seen?'
    },
    'revisedLKP-PLS.lat': {
        type: Number,
        decimal: true,
        label: 'Latitude',
        optional: true
    },
    'revisedLKP-PLS.lng': {
        type: Number,
        decimal: true,
        label: 'Longitude',
        optional: true
    },
    intendedRoute: {
        type: String,
        optional: true,
        //defaultValue: "-150.29296875,27.21555620902969,-41.66015625,50.736455137010665",

    },
    actualRoute: {
        type: String,
        optional: true,
        //defaultValue: "-150.29296875,27.21555620902969,-41.66015625,50.736455137010665",

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
        label: 'Initial Travel Direction',
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
        label: 'Travel Direction Factor',
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

        type: Boolean,
        label: 'Decision Point A Factor?',
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: [true, false],
        optional: true,
        autoform: {
            afFieldInput: {
                type: "boolean-checkbox"
            }
        }

    }
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
    /*'distanceIPP': {
        type: String,
        label: 'Distance IPP',
        optional: true
    },
    'findBearing': {
        type: String,
        label: 'Find Bearing',
        optional: true
    },*/
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
    'trackOffset': {
        type: String,
        label: 'Track Offset',
        optional: true
    },
    'elevationChange': {
        type: String,
        label: 'Elevation Change',
        optional: true
    }
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
    'subject.$.age': {
        type: Number,
        label: 'Age',
        optional: true
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
});
/*
Schemas.medical = new SimpleSchema({
    'rescue-EvacuationMethods': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },allowedValues: ['Unknown', 'Walkout', 'Carryout', 'Semi-Tech', 'Technical', 'Vehicle', 'Boat', 'Swiftwater', 'Helicopter', 'AeromedicalOther'],
        label: 'Rescue/Evacuation Methods',
        optional: true
    },
    'injuredSearcher': {
        type: String,
        label: 'Injured Searcher',
        optional: true
    },
    'injuredSearcherDetails': {
        type: String,
        label: 'Injured Searcher Details',
        optional: true
    },
    'signalling': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },allowedValues: ['Unknown', 'None', 'N/A', 'ELT', 'EPIRP', 'PLB', 'SPOT', 'Satellite-Alerting', 'Cell phone', 'Cell + GPS', 'Radio', 'FRS/GMRS', 'Fire/Smoke', 'Flare', 'Mirror', 'Visual', 'Sound', 'Other'],
        label: 'Signalling',
        optional: true
    },

});*/

Schemas.rescueDetails = new SimpleSchema({
    /* 'resourcesUsed': {
         type: Array,
         autoform: {
            firstOption: function () {
                return "--";
            }
        },allowedValues: ['Unknown', 'GSAR', 'Dogs', 'EMS', 'Fire', 'Tracker', 'Law', 'Divers', 'Boats', 'Cave', 'Parks', 'USAR', 'Helicopter', 'Fixed Wing', 'Swiftwater', 'Other'],
         label: 'Resources Used',
         optional: true
     },
     'resourcesUsed.$': {
         type: String,
         optional: true
     },
     'findResource': {
         type: Array,
         autoform: {
            firstOption: function () {
                return "--";
            }
        },allowedValues: ['Unknown', 'Hasty', 'Sweep', 'Grid', 'Dog-Airscent', 'Dog-Tracking', 'Dog-Trailing', 'Dog-Disaster', 'Tracker', 'Cave', 'Helicopter', 'Fixed Wing', 'Family/Friend', 'Public', 'Investigation', 'Horseback rider', 'ATV', 'Boat', 'Diver', 'Containment', 'Patrol', 'Bike', 'CERT', 'USAR', 'Other'],
         label: 'Find Resource',
         optional: true
     },
     'findResource.$': {
         type: String,
         optional: true
     },
     '#Tasks': {
         type: Number,
         label: '# Tasks',
         optional: true
     },
     '#Dogs': {
         type: Number,
         label: '# Dogs',
         optional: true
     },
     '#AirTasks': {
         type: Number,
         label: '# Air Tasks',
         optional: true
     },
     '#Aircraft': {
         type: Number,
         label: '# Aircraft',
         optional: true
     },
     '#AirHours': {
         type: Number,
         label: '# Air Hours',
         optional: true
     },
     'emergentVolunters': {
         type: Number,
         label: 'Emergent Volunters',
         optional: true
     },*/
    '#Tasks': {
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
    'rescue-EvacuationMethods': {
        type: String,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Unknown', 'Walkout', 'Carryout', 'Semi-Tech', 'Technical', 'Vehicle', 'Boat', 'Swiftwater', 'Helicopter', 'AeromedicalOther'],
        label: 'Rescue/Evacuation Methods',
        optional: true
    },
    'injuredSearcher': {
        type: Boolean,
        label: 'Injured Searcher',
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: [true, false],
        optional: true,
        autoform: {
            afFieldInput: {
                type: "boolean-checkbox"
            }
        }
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
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: [true, false],
        optional: true,
        autoform: {
            afFieldInput: {
                type: "boolean-checkbox"
            }
        }

    },
});

Schemas.weather = new SimpleSchema({
    'summary': {
        type: String,
        optional: true,
        label: 'Brief Summary',
        autoform: {
            rows: 2
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

})

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
                    .agencyProfile.measureUnits;
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
        optional: true
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
    },

    subjects: {
        type: Schemas.subjects,
        label: 'Subject Information',
        optional: true
    },

    timeLog: {
        type: Schemas.timeLog,
        optional: true,
        label: 'Time Log'
            //optional: true
    },

    weather: {
        type: Schemas.weather,
        label: 'Weather',
        optional: true
    },
    incidentOutcome: {
        type: Schemas.incidentOutcome,
        label: 'Incident Outcome',
        optional: true
    },
    /*medical: {
        type: Schemas.medical,
        optional: true
    },*/
    rescueDetails: {
        type: Schemas.rescueDetails,
        label: 'Rescue Details',
        optional: true
    },
    resourcesUsed: {
        type: Schemas.resourcesUsed,
        optional: true,
        label: 'Resources Used',
    },
    xComments: {
        type: Schemas.xComments,
        optional: true,
        label: 'Comments',
    }
});
Records.attachSchema(Schemas.SARCAT);

Schemas.agencyProfile = new SimpleSchema({
    agency: {
        type: String,
        label: 'Agency/Organization',
    },
    phoneNum: {
        type: String,
        label: 'Phone Number',
        min: 10

    },
    country: {
        type: String,

    },
    'state-region': {
        type: String,
        label:'State/Region'

    },
    measureUnits: {
        type: String,
        label: 'Unit of Measurement',
        defaultValue: 'US',
        autoform: {
            firstOption: function () {
                return "--";
            }
        },
        allowedValues: ['Metric', 'US'],
    },
    bounds: {
        type: String,
        optional: true,
        defaultValue: "-143.61328125,11.350796722383684,106.34765625,62.99515845212052"
    }
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
    timeLog: {
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
})
Schemas.config = new SimpleSchema({
    initSetup: {
        type: Boolean,
        defaultValue: true
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
    agencyMapComplete: {
        type: Boolean,
        defaultValue: false
    },
    agencyProfile: {
        type: Schemas.agencyProfile,
        defaultValue: {},
        optional: true,
        blackbox: true
    },
    formEditions: {
        type: Schemas.formEditions,
    },
});
Config.attachSchema(Schemas.config);




/*
var bronze = Schemas.incident._firstLevelSchemaKeys.map(function (d) {
    return {
        label: d,
        defaultValue: true,
        autoform: {
            firstOption: function () {
                return "--";
            }
        },allowedValues: [true, false],
        autoform: {
            type: 'select-radio-inline',
        },
        type: Boolean,
        //autoform: {
            firstOption: function () {
                return "--";
            }
        },allowedValues: ['true', 'bar']
    };
});

bronze = _.object(_.map(bronze, function (x) {
    return [x.label, x]
}))

var allValues = ['recordInfo.name', 'recordInfo.status', 'recordInfo.leadagency', 'recordInfo.organizationagency', 'recordInfo.incidentnum', 'recordInfo.missionnum', 'recordInfo.incidenttype', 'incident.incidentdate', 'incident.incidenttime', 'incident.incidentEnvironment', 'incident.country', 'incident.stateregion', 'incident.subjectcategory', 'incident.contactmethod', 'incident.ipptype', 'incident.ippclassification', 'incident.ecoregiondomain', 'incident.ecoregionDivision', 'incident.populationDensity', 'incident.terrain', 'incident.landCover', 'incident.landOwner', 'incident.weather', 'incident.maxTemp', 'incident.minTemp', 'incident.wind', 'incident.rain', 'incident.snow', 'incident.light', 'timeLog.last seen date-time', 'timeLog.sar notified date-time', 'timeLog.subject located date-time', 'timeLog.incident closed date-time', 'timeLog.total hours', 'timeLog.search hours'];

allValues = allValues.map(function (d) {
    return {
        label: d,
        value: d,
    };
});

//var allValues = ['recordInfo.name', 'recordInfo.status', 'recordInfo.leadagency', 'recordInfo.organizationagency', 'recordInfo.incidentnum', 'recordInfo.missionnum', 'recordInfo.incidenttype', 'incident.incidentdate', 'incident.incidenttime', 'incident.incidentEnvironment', 'incident.country', 'incident.stateregion', 'incident.subjectcategory', 'incident.contactmethod', 'incident.ipptype', 'incident.ippclassification', 'incident.ecoregiondomain', 'incident.ecoregionDivision', 'incident.populationDensity', 'incident.terrain', 'incident.landCover', 'incident.landOwner', 'incident.weather', 'incident.maxTemp', 'incident.minTemp', 'incident.wind', 'incident.rain', 'incident.snow', 'incident.light', 'timeLog.last seen date-time', 'timeLog.sar notified date-time', 'timeLog.subject located date-time', 'timeLog.incident closed date-time', 'timeLog.total hours', 'timeLog.search hours'];

var keys1 = Schemas.SARCAT._firstLevelSchemaKeys;

allValues = _.chain(keys1)
    .map(function (d) {
        var schema = Schemas[d];
        if (!schema) {
            return;
        }
        return {
            label: d,
            value: schema._firstLevelSchemaKeys
        };
    })
    .compact()
    .map(function (d) {
        return {
            label: d.label,
            //type: [String],
            type: Boolean,
            optional: true,
            defaultValue: true,

            autoform: {
                type: 'select-checkbox-inline',
                options: function () {
                    return d.value.map(function (e) {

                        return {
                            label: e,
                            value: e
                        };
                    })

                }
            }
        };
    })
    .value()
*/
/*
allValues2 = _.object(_.map(allValues, function(x) {

    var vals = _.object(_.map(x.value, function(y) {
        return [y.label, y]
    }));
    vals.type = Object;
    vals.optional = true;
    return [x.label, vals];
}));*/
/*var vals = _.object(_.map(allValues, function(x) {
    return [x.label, xx.value]
}));*/
//console.log(allValues2)
//timeLog
