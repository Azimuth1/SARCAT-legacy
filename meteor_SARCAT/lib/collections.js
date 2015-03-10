
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
Schemas.UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        optional: true,
        //defaultValue: '',
        regEx: /^[a-zA-Z-]{2,25}$/,
    },
    lastName: {
        type: String,
        optional: true,
        //defaultValue: ''
    },
    phoneNum: {
        type: String,
        optional: true,
        //defaultValue: ''
    },
    Agency: {
        type: String,
        optional: true,
        regEx: /^[a-z0-9A-z .]{3,30}$/,
        //defaultValue: ''
    }
});
Schemas.User = new SimpleSchema({
    emails: {
        type: [Object],
        // this must be optional if you also use other login services like facebook,
        // but if you use only accounts-password, then it can be required
        //optional: true
    },
    'emails.$.address': {
        type: String,
        //optional: true,
        regEx: SimpleSchema.RegEx.Email
    },
    'emails.$.verified': {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schemas.UserProfile,
        defaultValue: {}
    },
    /*role: {
        type: String,
        //optional: true,
        optional: false,
        blackbox: true,
        allowedValues: ['user', 'admin', 'default'],
        defaultValue: 'user'
    },*/
roles: {
        type: String,
        optional: true,
        blackbox: true,
        allowedValues: ['user', 'admin']
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
});
Meteor.users.attachSchema(Schemas.User);
Schemas.admin = new SimpleSchema({
    user: {
        type: String,
        //optional: true,
        label: 'Prepared By',
        optional: true,
        autoValue: function() {
            if (this.isInsert) {
                var first = Meteor.user().profile.firstName;
                var last = Meteor.user().profile.lastName;
                return [first, last].join(' ');
            }
        }
    },
    email: {
        type: String,
        optional: true,
        autoValue: function() {
            if (this.isInsert) {
                return Meteor.user().emails[0].address;
            }
        }
    },
    phonenum: {
        type: String,
        label: 'Phone #',
        optional: true,
        /*autoValue: function() {
            if (this.isInsert) {
                return Meteor.user().profile.phoneNum;
            }
        }*/
    }
});
Schemas.recordInfo = new SimpleSchema({
    name: {
        type: String,
        //optional: true,
        label: 'Record Name',
        optional: false,
        autoValue: function() {
            if (this.isInsert) {
                return Records.defaultName();
            }
        }
    },
    status: {
        type: String,
        optional: true,
        allowedValues: ['Active', 'Closed', 'Open'],
        label: 'Status',
        autoValue: function() {
            if (this.isInsert) {
                return 'Open';
            }
        },
    },
    leadagency: {
        type: String,
        optional: true,
        label: 'Lead Agency',
        max: 200,
        autoValue: function() {
            if (this.isInsert) {
                return Meteor.user().profile.Agency;
            }
        }
    },
    organizationagency: {
        type: String,
        optional: true,
        label: 'Organization/Agency',
        max: 200,
        autoValue: function() {
            if (this.isInsert) {
                return Meteor.user().profile.Agency;
            }
        }
    },
    incidentnum: {
        type: Number,
        label: 'Incident #',
        optional: true,
        defaultValue: 0
    },
    missionnum: {
        type: Number,
        label: 'Mission #',
        optional: true,
        defaultValue: 0
    },
});
Schemas.incident = new SimpleSchema({
    'incidentdate': {
        type: Date,
        optional: true,
        label: 'Incident Date',
        autoValue: function() {
            if (this.isInsert) {
                return new Date();
            }
        }
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
        autoValue: function() {
            if (this.isInsert) {
                return '15:22';
            }
        }
    },
    incidenttype: {
        type: String,
        optional: true,
        allowedValues: ['Search', 'Rescue', 'Beacon', 'Recovery', 'Training', 'Disaster', 'Fugitive', 'False Report', 'StandBy', 'Attempt To Locate', ' Evidence'],
        label: 'Incident Type',
        //defaultValue: ''
    },
    incidentEnvironment: {
        type: String,
        optional: true,
        allowedValues: ['Land', 'Air', 'Water'],
        label: 'Incident Environment'
    },
    country: {
        type: String,
        optional: true,
        label: 'Response Country',
        autoValue: function() {
            return 'Default Country';
        }
    },
    stateregion: {
        type: String,
        optional: true,
        label: 'Response State/Region',
        autoValue: function() {
            return 'Default State/Region';
        }
    },
    subjectcategory: {
        type: String,
        optional: true,
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
        optional: true,
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
        optional: true,
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
        optional: true,
        allowedValues: ['Airport', 'Beacon', 'Building', 'Field', 'Radar', 'Residence', 'Road', 'Signal', 'Trail', 'Trailhead', 'Unknown', 'Vehicle', 'Water', 'Woods', 'Other'],
        label: 'IPP Classification',
        autoValue: function() {
            if (this.isInsert) {
                return 'Airport';
            }
        },
    },
    ippCoordinates: {
        type: Object
    },
    'ippCoordinates.x': {
        type: String,
        optional: true,
        label: '(N/S) Lat',
        autoValue: function() {
            return '0';
        }
    },
    'ippCoordinates.y': {
        type: String,
        optional: true,
        label: '(E/W) Lng',
        autoValue: function() {
            return '0';
        }
    },
    ecoregiondomain: {
        type: String,
        optional: true,
        allowedValues: ['Temperate', 'Dry', 'Polar', 'Tropical', 'Water'],
        label: 'Ecoregion Domain'
    },
    ecoregionDivision: {
        type: String,
        optional: true,
        allowedValues: ['M110 Icecap Regime Mountains', '120 Tundra Division', 'M120 Tundra Regime Mountains', '130 Subarctic Division', 'M130 Subarctic Regime Mountains', '210 Warm Continental Division', 'M210 Warm Continental Regime Mountains', '220 Hot Continental Division', 'M220 Hot Continental Regime Mountains', '230 Subtropical Division', 'M230 Subtropical Regime Mountains', '240 Marine Division', 'M240 Marine Regime Mountains', '250 Prairie Division', 'M250 Prairie Regime Mountains', '260 Mediterranean Division', 'M260 Mediterranean Regime Mountains', '310 Tropical/Subtropical Steppe Division', 'M310 Tropical/Subtropical Steppe Regime Mountains', '320 Tropical/Subtropical Dessert Division', 'M320 Tropical/Subtropical Regime Mountains', '330 Temperate Steppe Division'],
        label: 'Ecoregion Division'
    },
    populationDensity: {
        type: String,
        optional: true,
        allowedValues: ['Wilderness', 'Rural', 'Suburban', 'Urban', 'Water'],
        label: 'Population Density'
    },
    terrain: {
        type: String,
        optional: true,
        allowedValues: ['Mountain', 'Hilly', 'Flat', 'Water'],
        label: 'Terrrain'
    },
    landCover: {
        type: String,
        optional: true,
        allowedValues: ['Bare', 'Light', 'Moderate', 'Heavy', 'Water'],
        label: 'Land Cover'
    },
    landOwner: {
        type: String,
        optional: true,
        allowedValues: ['Private', 'Commercial', 'County', 'State', 'NPS', 'USFS', 'BLM', 'Military', 'Native/Tribal', 'Navigable Water', 'Other'],
        label: 'Land Owner'
    },
    weather: {
        type: String,
        optional: true,
        allowedValues: ['Clear', 'Partly Cloudy', 'Overcast', 'Foggy', 'Drizzle', 'Showers', 'Rain', 'Hail', 'Sleet', 'Snow', 'Blizzard', 'Smokey'],
        label: 'Weather'
    },
    maxTemp: {
        type: String,
        optional: true,
        label: 'Max Temp'
    },
    Temminp: {
        type: String,
        optional: true,
        label: 'Min Temp'
    },
    wind: {
        type: String,
        optional: true,
        allowedValues: ['Light', 'Medium', 'Heavy'],
        label: 'Wind'
    },
    rain: {
        type: String,
        optional: true,
        allowedValues: ['Light', 'Medium', 'Heavy'],
        label: 'Rain'
    },
    snow: {
        type: String,
        optional: true,
        allowedValues: ['Light', 'Medium', 'Heavy'],
        label: 'Snow'
    },
    light: {
        type: String,
        optional: true,
        allowedValues: ['Day', 'Night', 'Night (bright)', 'Day+NightObscured', 'Twilight'],
        label: 'Light'
    }
});
Schemas.subjectInfo = new SimpleSchema({
    'number': {
        type: Number,
        optional: true,
        label: 'Number of Subjects',
    },
    'age': {
        type: String,
        optional: true,
        label: 'Age',
    },
    'sex': {
        type: String,
        optional: true,
        allowedValues: ['Male', 'Femail'],
        label: 'Sex',
    },
    'local': {
        type: String,
        optional: true,
        allowedValues: ['Yes', 'No', 'Guide'],
        label: 'Local?',
    },
    'weight': {
        type: String,
        optional: true,
        label: 'Weight',
    },
    'height': {
        type: String,
        optional: true,
        label: 'Height',
    },
    'physical fitness': {
        type: String,
        optional: true,
        allowedValues: ['Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Physical Fitness',
    },
    'experience': {
        type: String,
        optional: true,
        allowedValues: ['Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Experience',
    },
    'equipment': {
        type: String,
        optional: true,
        allowedValues: ['Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Equipment',
    },
    'clothing': {
        type: String,
        optional: true,
        allowedValues: ['Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Clothing',
    },
    'survival training': {
        type: String,
        optional: true,
        allowedValues: ['Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Survival training',
    }
});
Schemas.timeLog = new SimpleSchema({
    'last seen date-time': {
        type: 'datetime',
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'Last Seen Date/Time'
    },
    'sar notified date-time': {
        type: String,
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'SAR Notified Date/Time'
    },
    'subject located date-time': {
        type: String,
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'Subject Located Date/Time'
    },
    'incident closed date-time': {
        type: String,
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'Incident Closed Date/Time'
    },
    'total hours': {
        type: String,
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'time'
            }
        },
        'label': 'Total hours'
    },
    'search hours': {
        type: Number,
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'time'
            }
        },
        'label': 'Search hours'
    }
});
Schemas.incidentOperations = new SimpleSchema({
    'destinationCoord_N-S': {
        type: String,
        optional: true,
        label: 'Destination Coord. (N/S)'
    },
    'destinationCoord_E-W': {
        type: String,
        optional: true,
        label: 'Destination Coord. (E/W)'
    },
    'initialDirectionofTravel': {
        type: String,
        optional: true,
        label: 'Initial Direction of Travel'
    },
    'DOTHowdetermined': {
        type: String,
        optional: true,
        allowedValues: ['Intended Destination', 'Physical Clue', 'Sighting', 'Tracks', 'Tracking/Trailing dog', 'Other'],
        label: 'DOT How determined'
    },
    'revisedLKP-PLS_N-S': {
        type: String,
        optional: true,
        label: 'Revised LKP/PLS (N/S)'
    },
    'revisedLKP-PLS_E-W': {
        type: String,
        optional: true,
        label: 'Revised LKP/PLS (E/W)'
    },
    'revisedHowDetermined': {
        type: String,
        optional: true,
        allowedValues: ['Physical Clue', 'Trail Register', 'Sighting', 'Tracks', 'Other'],
        label: 'Revised How Determined'
    },
    'revisedDOT': {
        type: String,
        optional: true,
        label: 'Revised DOT'
    },
    'decisionPointCoord_N-S': {
        type: String,
        optional: true,
        label: 'Decision Point Coord. (N/S)'
    },
    'decisionPointCoord_E-W': {
        type: String,
        optional: true,
        label: 'Decision Point Coord. (E/W)'
    },
    'typeofDecisionPoint': {
        type: String,
        optional: true,
        allowedValues: ['Other', 'Saddle', 'Shortcut', 'Trail', 'Animal', 'Trail Crossed', 'Trail Junction', 'Trail Lost', 'Trail Social', 'Trail Turnoff'],
        label: 'Type of Decision Point'
    },
    'decisionPointFactor': {
        type: String,
        optional: true,
        label: 'Decision Point Factor'
    }
});
Schemas.incidentOutcome = new SimpleSchema({
    'incidentOutcome': {
        type: String,
        optional: true,
        allowedValues: ['Closed by Search', 'Closed by Public', 'Closed by Self-Rescue', 'Closed by Investigation', 'Closed by Investigation-False Report', 'Closed by Investigation-Friend/Family', 'Closed by investigation-In facility', 'Closed by Investigation-Staged', 'Closed by investigation-Transportation', 'Open/Suspended', 'Other'],
        label: 'Incident Outcome'
    },
    'scenario': {
        type: String,
        optional: true,
        allowedValues: ['Avalanche', 'Criminal', 'Despondent', 'Evading', 'Investigative', 'Lost', 'Medical', 'Drowning', 'Overdue', 'Stranded', 'Trauma'],
        label: 'Scenario'
    },
    'suspensionReasons': {
        type: String,
        optional: true,
        allowedValues: ['Lack of clues', 'Lack of resources', 'Weather', 'Hazards', 'Lack of Survivability', 'Investigative information'],
        label: 'Suspension Reasons'
    },
    '#Subjects': {
        type: String,
        optional: true,
        label: '# Subjects'
    },
    '#Well': {
        type: String,
        optional: true,
        label: '# Well'
    },
    '#Injured': {
        type: String,
        optional: true,
        label: '# Injured'
    },
    '#DOA': {
        type: String,
        optional: true,
        label: '# DOA'
    },
    '#Saved': {
        type: String,
        optional: true,
        label: '# Saved'
    },
    'findCoord_N-S': {
        type: String,
        optional: true,
        label: 'Find Coord (N/S)'
    },
    'findCoord_E-W': {
        type: String,
        optional: true,
        label: 'Find Coord (E/W)'
    },
    'distanceIPP': {
        type: String,
        optional: true,
        label: 'Distance IPP'
    },
    'findBearing': {
        type: String,
        optional: true,
        label: 'Find Bearing'
    },
    'findFeature': {
        type: String,
        optional: true,
        allowedValues: ['Brush', 'Canyon', 'Cave', 'Drainage', 'Field', 'Forest/woods', 'ice/snow', 'Structure', 'Road', 'Rock', 'Scrub', 'Trail', 'Vehicle', 'Lake/Pond/Water', 'Wetland', 'Yard'],
        label: 'Find Feature'
    },
    'foundSecondary': {
        type: String,
        optional: true,
        label: 'Found Secondary'
    },
    'detectability': {
        type: String,
        optional: true,
        allowedValues: ['Excellent', 'Good', 'Fair', 'Poor'],
        label: 'Detectability'
    },
    'mobility&Responsiveness': {
        type: String,
        optional: true,
        allowedValues: ['Mobile and responsive', 'Mobile and unresponsive', 'Immobile and responsive', 'Immobile and unresponsive'],
        label: 'Mobility & Responsiveness'
    },
    'lostStrategy': {
        type: String,
        optional: true,
        allowedValues: ['Backtracking', 'Direction sampling', 'Direction traveling', 'Downhill', 'Evasive', 'wisdom', 'Followed travel aid', 'Landmark', 'Nothing', 'Paniced', 'Route sampling', 'Stayed put', 'View enhancing', 'Seek cell signal', 'Other'],
        label: 'Lost Strategy'
    },
    'mobility_hours': {
        type: String,
        optional: true,
        label: 'Mobility (hours)'
    },
    'trackOffset': {
        type: String,
        optional: true,
        label: 'Track Offset'
    },
    'elevationChange': {
        type: String,
        optional: true,
        label: 'Elevation Change'
    }
});
Schemas.medical = new SimpleSchema({
    'status': {
        type: String,
        optional: true,
        allowedValues: ['Alive and well', 'Injuired', 'DOA'],
        label: 'Status'
    },
    'mechanism': {
        type: String,
        optional: true,
        allowedValues: ['Animal attack/bite/sting', 'Human attack', 'Fall - ground level', 'Fall - height', 'Gunshot', 'Avalanche', 'Tree fall', 'Rock fall', 'Water', 'Environment', 'Medical condition', 'Other'],
        label: 'Mechanism'
    },
    'injuryType': {
        type: String,
        optional: true,
        allowedValues: ['Abrasion', 'Bruise', 'Burn', 'Cramp', 'Crush', 'Fracture', 'Flail Chest', 'Frostbite', 'Infection', 'Laceration', 'Pain', 'Soft Tissue', 'Sprain', 'Multi-Trauma', 'Drowning'],
        label: 'Injury Type'
    },
    'illness': {
        type: String,
        optional: true,
        allowedValues: ['Addision', 'Allergic reaction', 'Altitude disorder', 'Appendicitis', 'Asthma', 'Dehydration', 'Exhaustion', 'Hypertherimic', 'Hypothermic', 'Illness', 'Intoxicated', 'Seizures', 'Shock', 'Shortness of Breath', 'Stroke', 'Unconscious', 'UTI', 'Other'],
        label: 'Illness'
    },
    'treatmentby': {
        type: String,
        optional: true,
        allowedValues: ['None', 'Self', 'Public', 'First-Aid', 'First-Responder', 'EMT', 'WEMT', 'ALS', 'RN', 'MD', 'N/A'],
        label: 'Treatment by'
    },
    'rescue-EvacuationMethods': {
        type: String,
        optional: true,
        allowedValues: ['Walkout', 'Carryout', 'Semi-Tech', 'Technical', 'Vehicle', 'Boat', 'Swiftwater', 'Helicopter', 'AeromedicalOther'],
        label: 'Rescue/Evacuation Methods'
    },
    'injuredSearcher': {
        type: String,
        optional: true,
        label: 'Injured Searcher'
    },
    'injuredSearcherDetails': {
        type: String,
        optional: true,
        label: 'Injured Searcher Details'
    },
    'signalling': {
        type: String,
        optional: true,
        allowedValues: ['None', 'N/A', 'ELT', 'EPIRP', 'PLB', 'SPOT', 'Satellite-Alerting', 'Cell phone', 'Cell + GPS', 'Radio', 'FRS/GMRS', 'Fire/Smoke', 'Flare', 'Mirror', 'Visual', 'Sound', 'Other'],
        label: 'Signalling'
    }
});
Schemas.resources = new SimpleSchema({
    'resourcesUsed': {
        type: String,
        optional: true,
        allowedValues: ['GSAR', 'Dogs', 'EMS', 'Fire', 'Tracker', 'Law', 'Divers', 'Boats', 'Cave', 'Parks', 'USAR', 'Helicopter', 'Fixed Wing', 'Swiftwater', 'Other'],
        label: 'Resources Used'
    },
    'findResource': {
        type: String,
        optional: true,
        allowedValues: ['Hasty', 'Sweep', 'Grid', 'Dog-Airscent', 'Dog-Tracking', 'Dog-Trailing', 'Dog-Disaster', 'Tracker', 'Cave', 'Helicopter', 'Fixed Wing', 'Family/Friend', 'Public', 'Investigation', 'Horseback rider', 'ATV', 'Boat', 'Diver', 'Containment', 'Patrol', 'Bike', 'CERT', 'USAR', 'Other'],
        label: 'Find Resource'
    },
    '#Tasks': {
        type: String,
        optional: true,
        label: '# Tasks'
    },
    '#Dogs': {
        type: String,
        optional: true,
        label: '# Dogs'
    },
    '#AirTasks': {
        type: String,
        optional: true,
        label: '# Air Tasks'
    },
    '#Aircraft': {
        type: String,
        optional: true,
        label: '# Aircraft'
    },
    '#AirHours': {
        type: String,
        optional: true,
        label: '# Air Hours'
    },
    'emergentVolunters': {
        type: String,
        optional: true,
        label: 'Emergent Volunters'
    },
    'totalPersonnel': {
        type: String,
        optional: true,
        label: 'Total Personnel'
    },
    'totalManHours': {
        type: String,
        optional: true,
        label: 'Total Man Hours'
    },
    'totalDogHours': {
        type: String,
        optional: true,
        label: 'Total Dog Hours'
    },
    '#Vehicles': {
        type: String,
        optional: true,
        label: '# Vehicles'
    },
    'distanceTraveled': {
        type: String,
        optional: true,
        label: 'Distance Traveled'
    },
    'totalCost': {
        type: String,
        optional: true,
        label: 'Total Cost'
    },
    'comments': {
        type: String,
        optional: true,
        label: 'Comments'
    }
});
Schemas.SARCAT = new SimpleSchema({
    userId: {
        type: String,
        optional: false,
        autoValue: function() {
            if (this.isInsert) {
                return Meteor.userId();
            }
        }
    },
    created: {
        type: String,
        optional: true,
        autoValue: function() {
            return new Date()
                .toDateString();
        }
    },
    admin: {
        type: Schemas.admin,
        defaultValue: {}
    },

    recordInfo: {
        type: Schemas.recordInfo,
        defaultValue: {}
    },
    incident: {
        type: Schemas.incident,
        defaultValue: {}
    },
    subjectInfo: {
        type: Schemas.subjectInfo,
        defaultValue: {}
    },
    timeLog: {
        type: Schemas.timeLog,
        defaultValue: {}
    },
    incidentOperations: {
        type: Schemas.incidentOperations,
        defaultValue: {}
    },
    incidentOutcome: {
        type: Schemas.incidentOutcome,
        defaultValue: {}
    },
    medical: {
        type: Schemas.medical,
        defaultValue: {}
    },
    resources: {
        type: Schemas.resources,
        defaultValue: {}
    },
});
Records.attachSchema(Schemas.SARCAT);


/*
AdminConfig = {
    //adminEmails: [' ben@code2create.com'],
    collections: {
        Records: {}
    }
};*/
