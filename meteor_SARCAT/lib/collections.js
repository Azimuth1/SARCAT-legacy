Records = new Mongo.Collection('records');
Config = new Mongo.Collection('config');
Records.defaultName = function(name) {
    var nextLetter = 'A',
        nextName = 'New Record ' + nextLetter;
    while (Records.findOne({
            'recordInfo.name': nextName
        })) {
        nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
        nextName = 'New Record ' + nextLetter;
    }
    return nextName;
};
Records.defaultNum = function() {
    var nextLetter = 1;
    while (Records.findOne({
            'recordInfo.incidentnum': nextLetter
        })) {
        nextLetter = nextLetter + 1;
    }
    return nextLetter;
};
Schemas = {};
Schemas.UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        //defaultValue: '',
        regEx: /^[a-zA-Z-]{2,25}$/,
    },
    lastName: {
        type: String,
        //defaultValue: ''
    },
    phoneNum: {
        type: String,
        //defaultValue: ''
    },
    Agency: {
        type: String,
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
        //
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
        defaultValue: {},
        blackbox: true,
    },
    /*role: {
        type: String,
        //
        optional: false,
        blackbox: true,
        allowedValues: ['user', 'admin', 'default'],
        defaultValue: 'user'
    },*/
    roles: {
        type: String,
        blackbox: true,
        optional:true,
        allowedValues: ['user', 'admin']
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
        //optional:true,
        label: 'Prepared By',
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
        //optional:true,
        regEx: SimpleSchema.RegEx.Email,
        autoValue: function() {
            if (this.isInsert) {
                return Meteor.user().emails[0].address;
            }
        }
    },
    phonenum: {
        type: String,
        label: 'Phone #',
        //optional:true,
        autoValue: function() {
            if (this.isInsert) {
                return Meteor.user().profile.phoneNum || '';
            }
        },
        //defaultValue: '',
        /*custom: function() {
                return 'fff'
            }*/
        //
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
        label: 'Record Name',
        autoValue: function() {
            if (this.isInsert) {
                return Records.defaultName();
            }
        }
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
    leadagency: {
        type: String,
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
        autoValue: function() {
            if (this.isInsert) {
                return Records.defaultNum('incidentnum');
            }
        }
    },
    missionnum: {
        type: Number,
        label: 'Mission #',
        autoValue: function() {
            if (this.isInsert) {
                return Records.defaultNum('missionnum');
            }
        }
    },
});
Schemas.incident = new SimpleSchema({
    'incidentdate': {
        type: Date,
        label: 'Incident Date',
        autoValue: function() {
            if (this.isInsert) {
                return new Date();
            }
        }
    },
    'incidenttime': {
        type: String,
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
        allowedValues: ['Search', 'Rescue', 'Beacon', 'Recovery', 'Training', 'Disaster', 'Fugitive', 'False Report', 'StandBy', 'Attempt To Locate', ' Evidence'],
        label: 'Incident Type',
        defaultValue: ''
    },
    incidentEnvironment: {
        type: String,
        allowedValues: ['Land', 'Air', 'Water'],
        label: 'Incident Environment',
        defaultValue: ''
    },
    country: {
        type: String,
        label: 'Response Country',
        autoValue: function() {
            return 'Default Country';
        }
    },
    stateregion: {
        type: String,
        label: 'Response State/Region',
        autoValue: function() {
            return 'Default State/Region';
        }
    },
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
        label: '(N/S) Lat',
        autoValue: function() {
            return '0';
        }
    },
    'ippCoordinates.y': {
        type: String,
        label: '(E/W) Lng',
        autoValue: function() {
            return '0';
        }
    },
    ecoregiondomain: {
        type: String,
        allowedValues: ['Temperate', 'Dry', 'Polar', 'Tropical', 'Water'],
        label: 'Ecoregion Domain',
        defaultValue: ''
    },
    ecoregionDivision: {
        type: String,
        allowedValues: ['M110 Icecap Regime Mountains', '120 Tundra Division', 'M120 Tundra Regime Mountains', '130 Subarctic Division', 'M130 Subarctic Regime Mountains', '210 Warm Continental Division', 'M210 Warm Continental Regime Mountains', '220 Hot Continental Division', 'M220 Hot Continental Regime Mountains', '230 Subtropical Division', 'M230 Subtropical Regime Mountains', '240 Marine Division', 'M240 Marine Regime Mountains', '250 Prairie Division', 'M250 Prairie Regime Mountains', '260 Mediterranean Division', 'M260 Mediterranean Regime Mountains', '310 Tropical/Subtropical Steppe Division', 'M310 Tropical/Subtropical Steppe Regime Mountains', '320 Tropical/Subtropical Dessert Division', 'M320 Tropical/Subtropical Regime Mountains', '330 Temperate Steppe Division'],
        label: 'Ecoregion Division',
        defaultValue: ''
    },
    populationDensity: {
        type: String,
        allowedValues: ['Wilderness', 'Rural', 'Suburban', 'Urban', 'Water'],
        label: 'Population Density',
        defaultValue: ''
    },
    terrain: {
        type: String,
        allowedValues: ['Mountain', 'Hilly', 'Flat', 'Water'],
        label: 'Terrrain',
        defaultValue: ''
    },
    landCover: {
        type: String,
        allowedValues: ['Bare', 'Light', 'Moderate', 'Heavy', 'Water'],
        label: 'Land Cover',
        defaultValue: ''
    },
    landOwner: {
        type: String,
        allowedValues: ['Private', 'Commercial', 'County', 'State', 'NPS', 'USFS', 'BLM', 'Military', 'Native/Tribal', 'Navigable Water', 'Other'],
        label: 'Land Owner',
        defaultValue: ''
    },
    weather: {
        type: String,
        allowedValues: ['Clear', 'Partly Cloudy', 'Overcast', 'Foggy', 'Drizzle', 'Showers', 'Rain', 'Hail', 'Sleet', 'Snow', 'Blizzard', 'Smokey'],
        label: 'Weather',
        defaultValue: ''
    },
    maxTemp: {
        type: String,
        label: 'Max Temp',
        defaultValue: ''
    },
    Temminp: {
        type: String,
        label: 'Min Temp',
        defaultValue: ''
    },
    wind: {
        type: String,
        allowedValues: ['Light', 'Medium', 'Heavy'],
        label: 'Wind',
        defaultValue: ''
    },
    rain: {
        type: String,
        allowedValues: ['Light', 'Medium', 'Heavy'],
        label: 'Rain',
        defaultValue: ''
    },
    snow: {
        type: String,
        allowedValues: ['Light', 'Medium', 'Heavy'],
        label: 'Snow',
        defaultValue: ''
    },
    light: {
        type: String,
        allowedValues: ['Day', 'Night', 'Night (bright)', 'Day+NightObscured', 'Twilight'],
        label: 'Light',
        defaultValue: ''
    }
});
Schemas.subjectInfo = new SimpleSchema({
    /*'number': {
        type: Number,
        label: 'Number of Subjects',
        defaultValue: ''
    },*/
    'age': {
        type: String,
        label: 'Age',
        defaultValue: ''
    },
    'sex': {
        type: String,
        allowedValues: ['Male', 'Femail'],
        label: 'Sex',
        defaultValue: ''
    },
    'local': {
        type: String,
        allowedValues: ['Yes', 'No', 'Guide'],
        label: 'Local?',
        defaultValue: ''
    },
    'weight': {
        type: String,
        label: 'Weight',
        defaultValue: ''
    },
    'height': {
        type: String,
        label: 'Height',
        defaultValue: ''
    },
    'physical fitness': {
        type: String,
        allowedValues: ['Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Physical Fitness',
        defaultValue: ''
    },
    'experience': {
        type: String,
        allowedValues: ['Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Experience',
        defaultValue: ''
    },
    'equipment': {
        type: String,
        allowedValues: ['Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Equipment',
        defaultValue: ''
    },
    'clothing': {
        type: String,
        allowedValues: ['Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Clothing',
        defaultValue: ''
    },
    'survival training': {
        type: String,
        allowedValues: ['Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Survival training',
        defaultValue: ''
    }
});
Schemas.timeLog = new SimpleSchema({
    'last seen date-time': {
        type: 'datetime',
        //optional: true,
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
        autoValue: function() {
            return new Date()
                .toDateString();
        }
    },
    admin: {
        type: Schemas.admin,
        //blackbox: true,
        //defaultValue: {}
    },
    recordInfo: {
        type: Schemas.recordInfo,
        //blackbox: true,
    },
    incident: {
        type: Schemas.incident,
        blackbox: true,
    },
    subjectInfo: {
        type: Schemas.subjectInfo,
        blackbox: true,
    },
    timeLog: {
        type: Schemas.timeLog,
        defaultValue: {},
        blackbox: true,
    },
    incidentOperations: {
        type: Schemas.incidentOperations,
        defaultValue: {},
        blackbox: true,
    },
    incidentOutcome: {
        type: Schemas.incidentOutcome,
        defaultValue: {},
        blackbox: true,
    },
    medical: {
        type: Schemas.medical,
        defaultValue: {},
        blackbox: true,
    },
    resources: {
        type: Schemas.resources,
        defaultValue: {},
        blackbox: true,
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


People = Collections.People = new Mongo.Collection("People");
People.attachSchema(Schemas.Person);