Records = new Mongo.Collection('records');
Config = new Mongo.Collection('config');
Records.defaultName = function(name) {
    var nextLetter = 'A',
        nextName = 'Incident ' + nextLetter;
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
Schemas.profile = new SimpleSchema({
    firstName: {
        type: String,
        optional:true,
        regEx: /^[a-zA-Z-]{2,25}$/,
        /*autoValue: function() {
            if (this.isInsert) {
                return '';
            }
        }*/
    },
    lastName: {
        type: String,
        optional:true,
        regEx: /^[a-zA-Z-]{2,25}$/,
        /*autoValue: function() {
            if (this.isInsert) {
                return '';
            }
        }*/
    },
    phoneNum: {
        type: String,
        optional:true,
    },
    Agency: {
        type: String,
        optional:true,
    },
    country: {
        type: String,
        optional:true,
    },
    'state-region': {
        type: String,
        optional:true,
    },
});
Schemas.User = new SimpleSchema({
    emails: {
        type: [Object]
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
        type: Schemas.profile,
        defaultValue: {},
        //blackbox: true,
    },
    roles: {
        type: String,
        blackbox: true,
        optional: true,
        allowedValues: ['Unknown', 'user', 'admin']
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
        optional: true,
        autoValue: function() {
            if (this.isInsert) {
                return Meteor.user().profile.phoneNum;
            }
        }
    }
});
Schemas.recordInfo = new SimpleSchema({
    name: {
        type: String,
        //optional:true,
        label: 'Record Name',
        autoValue: function() {
            if (this.isInsert) {
                return Records.defaultName();
            }
        }
    },
    status: {
        type: String,
        allowedValues: ['Unknown', 'Active', 'Closed', 'Open'],
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
        type: String,
        label: 'Incident #',
        autoValue: function() {
            if (this.isInsert) {
                return Records.defaultNum('incidentnum').toString();
            }
        }
    },
    missionnum: {
        type: String,
        label: 'Mission #',
        autoValue: function() {
            if (this.isInsert) {
                return '';
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
        allowedValues: ['Unknown', 'Search', 'Rescue', 'Beacon', 'Recovery', 'Training', 'Disaster', 'Fugitive', 'False Report', 'StandBy', 'Attempt To Locate', ' Evidence'],
        label: 'Incident Type',
        defaultValue: 'Unknown'
    },
    incidentEnvironment: {
        type: String,
        //optional: true,
        allowedValues: ['Unknown', 'Choose', 'Land', 'Air', 'Water'],
        label: 'Incident Environment',
        defaultValue: 'Unknown'
    },
    country: {
        type: String,
        label: 'Response Country',
        autoValue: function() {
            if (this.isInsert) {
                return Meteor.user().profile.country;
            }
        }
    },
    stateregion: {
        type: String,
        //optional: true,
        label: 'Response State/Region',
        autoValue: function() {
            if (this.isInsert) {
                return Meteor.user().profile['state-region'];
            }
        }
    },
    subjectcategory: {
        type: String,
        //optional: true,
        allowedValues: ['Unknown', 'Abduction', 'Aircraft Incident', 'Non-Powered Boat', 'Person in Current Water', 'Person in Flat Water', 'Person in Flood Water', 'Power Boat', 'ATV', 'Motorcycle', 'Mountain Bike', 'Vehicle (4WD)', 'Vehicle (Road)', 'Autism', 'Dementia', 'Despondent', 'Intellectual Disability', 'Mental Illness', 'Substance Intoxication', 'Ages 1-3 (Toddler)', 'Ages 4-6 (PreSchool)', 'Ages 7-9 (SchoolAge)', 'Ages 10-12 (Pre-Teenager)', 'Ages 13-15 (Adolescent)', 'Abandoned Vehicle', 'Angler', 'Car Camper', 'Caver', 'Day Climber', 'Extreme Race', 'Gatherer', 'Hiker', 'Horseback Rider', 'Hunter', 'Mountaineer', 'Runner', 'Worker', 'Alpine Skier', 'Nordic Skier', 'Snowboarder', 'Snowmobiler', 'Snowshoer'],
        label: 'Subject Category',
        defaultValue: 'Unknown',
    },
    contactmethod: {
        type: String,
        //optional: true,
        allowedValues: ['Unknown', 'Reported Missing', 'Vehicle Found', 'Registration Card', 'ELT/PLB/EPIRP', 'Satelitte Alerting Technology', 'Subject Cell Phone', 'Radio', 'Distress Signal'],
        label: 'Contact Method',
        defaultValue: 'Unknown',
    },
    ipptype: {
        type: String,
        //optional: true,
        allowedValues: ['Unknown', 'Point Last Seen', 'Last Known Point'],
        label: 'IPP Type',
        defaultValue: 'Unknown',
    },
    ippclassification: {
        type: String,
        //optional: true,
        allowedValues: ['Unknown', 'Airport', 'Beacon', 'Building', 'Field', 'Radar', 'Residence', 'Road', 'Signal', 'Trail', 'Trailhead', 'Vehicle', 'Water', 'Woods', 'Other'],
        label: 'IPP Classification',
        defaultValue: 'Unknown'
    },
    ippCoordinates: {
        type: Object
    },
    'ippCoordinates.x': {
        type: String,
        //optional: true,
        label: '(N/S) Lat',
        autoValue: function() {
            if (this.isInsert) {
                return '0.0';
            }
        }
    },
    'ippCoordinates.y': {
        type: String,
        //optional: true,
        label: '(E/W) Lng',
        autoValue: function() {
            if (this.isInsert) {
                return '0.0';
            }
        }
    },
    ecoregiondomain: {
        type: String,
        //optional: true,
        allowedValues: ['Unknown', 'Temperate', 'Dry', 'Polar', 'Tropical', 'Water'],
        defaultValue: 'Unknown',
        label: 'Ecoregion Domain',
    },
    ecoregionDivision: {
        type: String,
        //optional: true,
        allowedValues: ['Unknown', 'M110 Icecap Regime Mountains', '120 Tundra Division', 'M120 Tundra Regime Mountains', '130 Subarctic Division', 'M130 Subarctic Regime Mountains', '210 Warm Continental Division', 'M210 Warm Continental Regime Mountains', '220 Hot Continental Division', 'M220 Hot Continental Regime Mountains', '230 Subtropical Division', 'M230 Subtropical Regime Mountains', '240 Marine Division', 'M240 Marine Regime Mountains', '250 Prairie Division', 'M250 Prairie Regime Mountains', '260 Mediterranean Division', 'M260 Mediterranean Regime Mountains', '310 Tropical/Subtropical Steppe Division', 'M310 Tropical/Subtropical Steppe Regime Mountains', '320 Tropical/Subtropical Dessert Division', 'M320 Tropical/Subtropical Regime Mountains', '330 Temperate Steppe Division'],
        defaultValue: 'Unknown',
        label: 'Ecoregion Division',
    },
    populationDensity: {
        type: String,
        //optional: true,
        allowedValues: ['Unknown', 'Wilderness', 'Rural', 'Suburban', 'Urban', 'Water'],
        defaultValue: 'Unknown',
        label: 'Population Density',
    },
    terrain: {
        type: String,
        // optional: true,
        allowedValues: ['Unknown', 'Mountain', 'Hilly', 'Flat', 'Water'],
        defaultValue: 'Unknown',
        label: 'Terrrain',
    },
    landCover: {
        type: String,
        //optional: true,
        allowedValues: ['Unknown', 'Bare', 'Light', 'Moderate', 'Heavy', 'Water'],
        defaultValue: 'Unknown',
        label: 'Land Cover',
    },
    landOwner: {
        type: String,
        // optional: true,
        allowedValues: ['Unknown', 'Private', 'Commercial', 'County', 'State', 'NPS', 'USFS', 'BLM', 'Military', 'Native/Tribal', 'Navigable Water', 'Other'],
        defaultValue: 'Unknown',
        label: 'Land Owner',
    },
    weather: {
        type: String,
        // optional: true,
        allowedValues: ['Unknown', 'Clear', 'Partly Cloudy', 'Overcast', 'Foggy', 'Drizzle', 'Showers', 'Rain', 'Hail', 'Sleet', 'Snow', 'Blizzard', 'Smokey'],
        defaultValue: 'Unknown',
        label: 'Weather',
    },
    maxTemp: {
        type: String,
        // optional: true,
        label: 'Max Temp',
        autoValue: function() {
            if (this.isInsert) {
                return '';
            }
        }
    },
    minTemp: {
        type: String,
        // optional: true,
        label: 'Min Temp',
        autoValue: function() {
            if (this.isInsert) {
                return '';
            }
        }
    },
    wind: {
        type: String,
        // optional: true,
        allowedValues: ['Unknown', 'Light', 'Medium', 'Heavy'],
        defaultValue: 'Unknown',
        label: 'Wind',
    },
    rain: {
        type: String,
        // optional: true,
        allowedValues: ['Unknown', 'Light', 'Medium', 'Heavy'],
        defaultValue: 'Unknown',
        label: 'Rain',
    },
    snow: {
        type: String,
        //optional: true,
        allowedValues: ['Unknown', 'Light', 'Medium', 'Heavy'],
        defaultValue: 'Unknown',
        label: 'Snow',
    },
    light: {
        type: String,
        // optional: true,
        allowedValues: ['Unknown', 'Day', 'Night', 'Night (bright)', 'Day+NightObscured', 'Twilight'],
        defaultValue: 'Unknown',
        label: 'Light',
    }
});
Schemas.allSubjects = new SimpleSchema({
    'allSubjects': {
        type: [Object],
        label: 'Number of Subjects',
        defaultValue: []
    },
});
Schemas.subjectInfo = new SimpleSchema({
    'age': {
        type: Number,
        defaultValue: 9,
        label: 'Age',
    },
    'sex': {
        type: String,
        allowedValues: ['Unknown', 'Male', 'Femail'],
        defaultValue: 'Unknown',
        label: 'Sex',
    },
    'local': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Yes', 'No', 'Guide'],
        label: 'Local?',
    },
    'weight': {
        type: String,
        defaultValue: '',
        label: 'Weight',
    },
    'height': {
        type: String,
        defaultValue: '',
        label: 'Height',
    },
    'physical fitness': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Physical Fitness',
    },
    'experience': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Experience',
    },
    'equipment': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Equipment',
    },
    'clothing': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Clothing',
    },
    'survival training': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Survival training',
    }
});
Schemas.timeLog = new SimpleSchema({
    'last seen date-time': {
        type: 'datetime',
        defaultValue: '',
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'Last Seen Date/Time'
    },
    'sar notified date-time': {
        type: String,
        defaultValue: '',
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'SAR Notified Date/Time'
    },
    'subject located date-time': {
        type: String,
        defaultValue: '',
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'Subject Located Date/Time'
    },
    'incident closed date-time': {
        type: String,
        defaultValue: '',
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'Incident Closed Date/Time'
    },
    'total hours': {
        type: Number,
        defaultValue: 0,
        'label': 'Total Missing Hours'
    },
    'search hours': {
        type: Number,
        defaultValue: 0,
        'label': 'Total Search Hours'
    }
});
Schemas.incidentOperations = new SimpleSchema({
    'destinationCoord_N-S': {
        type: String,
        defaultValue: '',
        label: 'Destination Coord. (N/S)'
    },
    'destinationCoord_E-W': {
        type: String,
        defaultValue: '',
        label: 'Destination Coord. (E/W)'
    },
    'initialDirectionofTravel': {
        type: String,
        defaultValue: '',
        label: 'Initial Direction of Travel'
    },
    'DOTHowdetermined': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Intended Destination', 'Physical Clue', 'Sighting', 'Tracks', 'Tracking/Trailing dog', 'Other'],
        label: 'DOT How determined'
    },
    'revisedLKP-PLS_N-S': {
        type: String,
        defaultValue: '',
        label: 'Revised LKP/PLS (N/S)'
    },
    'revisedLKP-PLS_E-W': {
        type: String,
        defaultValue: '',
        label: 'Revised LKP/PLS (E/W)'
    },
    'revisedHowDetermined': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Physical Clue', 'Trail Register', 'Sighting', 'Tracks', 'Other'],
        label: 'Revised How Determined'
    },
    'revisedDOT': {
        type: String,
        defaultValue: '',
        label: 'Revised DOT'
    },
    'decisionPointCoord_N-S': {
        type: String,
        defaultValue: '',
        label: 'Decision Point Coord. (N/S)'
    },
    'decisionPointCoord_E-W': {
        type: String,
        defaultValue: '',
        label: 'Decision Point Coord. (E/W)'
    },
    'typeofDecisionPoint': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Other', 'Saddle', 'Shortcut', 'Trail', 'Animal', 'Trail Crossed', 'Trail Junction', 'Trail Lost', 'Trail Social', 'Trail Turnoff'],
        label: 'Type of Decision Point'
    },
    'decisionPointFactor': {
        type: String,
        defaultValue: '',
        label: 'Decision Point Factor'
    }
});
Schemas.incidentOutcome = new SimpleSchema({
    'incidentOutcome': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Closed by Search', 'Closed by Public', 'Closed by Self-Rescue', 'Closed by Investigation', 'Closed by Investigation-False Report', 'Closed by Investigation-Friend/Family', 'Closed by investigation-In facility', 'Closed by Investigation-Staged', 'Closed by investigation-Transportation', 'Open/Suspended', 'Other'],
        label: 'Incident Outcome'
    },
    'scenario': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Avalanche', 'Criminal', 'Despondent', 'Evading', 'Investigative', 'Lost', 'Medical', 'Drowning', 'Overdue', 'Stranded', 'Trauma'],
        label: 'Scenario'
    },
    'suspensionReasons': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Lack of clues', 'Lack of resources', 'Weather', 'Hazards', 'Lack of Survivability', 'Investigative information'],
        label: 'Suspension Reasons'
    },
    '#Subjects': {
        type: Number,
        defaultValue: 0,
        label: '# Subjects'
    },
    '#Well': {
        type: Number,
        defaultValue: 0,
        label: '# Well'
    },
    '#Injured': {
        type: Number,
        defaultValue: 0,
        label: '# Injured'
    },
    '#DOA': {
        type: Number,
        defaultValue: 0,
        label: '# DOA'
    },
    '#Saved': {
        type: String,
        defaultValue: '',
        label: '# Saved'
    },
    'findCoord_N-S': {
        type: String,
        defaultValue: '',
        label: 'Find Coord (N/S)'
    },
    'findCoord_E-W': {
        type: String,
        defaultValue: '',
        label: 'Find Coord (E/W)'
    },
    'distanceIPP': {
        type: String,
        defaultValue: '',
        label: 'Distance IPP'
    },
    'findBearing': {
        type: String,
        defaultValue: '',
        label: 'Find Bearing'
    },
    'findFeature': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Brush', 'Canyon', 'Cave', 'Drainage', 'Field', 'Forest/woods', 'ice/snow', 'Structure', 'Road', 'Rock', 'Scrub', 'Trail', 'Vehicle', 'Lake/Pond/Water', 'Wetland', 'Yard'],
        label: 'Find Feature'
    },
    'foundSecondary': {
        type: String,
        defaultValue: '',
        label: 'Found Secondary'
    },
    'detectability': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Excellent', 'Good', 'Fair', 'Poor'],
        label: 'Detectability'
    },
    'mobility&Responsiveness': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Mobile and responsive', 'Mobile and unresponsive', 'Immobile and responsive', 'Immobile and unresponsive'],
        label: 'Mobility & Responsiveness'
    },
    'lostStrategy': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Backtracking', 'Direction sampling', 'Direction traveling', 'Downhill', 'Evasive', 'wisdom', 'Followed travel aid', 'Landmark', 'Nothing', 'Paniced', 'Route sampling', 'Stayed put', 'View enhancing', 'Seek cell signal', 'Other'],
        label: 'Lost Strategy'
    },
    'mobility_hours': {
        type: String,
        defaultValue: '',
        label: 'Mobility (hours)'
    },
    'trackOffset': {
        type: String,
        defaultValue: '',
        label: 'Track Offset'
    },
    'elevationChange': {
        type: String,
        defaultValue: '',
        label: 'Elevation Change'
    }
});
Schemas.medical = new SimpleSchema({
    'status': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Alive and well', 'Injuired', 'DOA'],
        label: 'Status'
    },
    'mechanism': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Animal attack/bite/sting', 'Human attack', 'Fall - ground level', 'Fall - height', 'Gunshot', 'Avalanche', 'Tree fall', 'Rock fall', 'Water', 'Environment', 'Medical condition', 'Other'],
        label: 'Mechanism'
    },
    'injuryType': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Abrasion', 'Bruise', 'Burn', 'Cramp', 'Crush', 'Fracture', 'Flail Chest', 'Frostbite', 'Infection', 'Laceration', 'Pain', 'Soft Tissue', 'Sprain', 'Multi-Trauma', 'Drowning'],
        label: 'Injury Type'
    },
    'illness': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Addision', 'Allergic reaction', 'Altitude disorder', 'Appendicitis', 'Asthma', 'Dehydration', 'Exhaustion', 'Hypertherimic', 'Hypothermic', 'Illness', 'Intoxicated', 'Seizures', 'Shock', 'Shortness of Breath', 'Stroke', 'Unconscious', 'UTI', 'Other'],
        label: 'Illness'
    },
    'treatmentby': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'None', 'Self', 'Public', 'First-Aid', 'First-Responder', 'EMT', 'WEMT', 'ALS', 'RN', 'MD', 'N/A'],
        label: 'Treatment by'
    },
    'rescue-EvacuationMethods': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Walkout', 'Carryout', 'Semi-Tech', 'Technical', 'Vehicle', 'Boat', 'Swiftwater', 'Helicopter', 'AeromedicalOther'],
        label: 'Rescue/Evacuation Methods'
    },
    'injuredSearcher': {
        type: String,
        defaultValue: '',
        label: 'Injured Searcher'
    },
    'injuredSearcherDetails': {
        type: String,
        defaultValue: '',
        label: 'Injured Searcher Details'
    },
    'signalling': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'None', 'N/A', 'ELT', 'EPIRP', 'PLB', 'SPOT', 'Satellite-Alerting', 'Cell phone', 'Cell + GPS', 'Radio', 'FRS/GMRS', 'Fire/Smoke', 'Flare', 'Mirror', 'Visual', 'Sound', 'Other'],
        label: 'Signalling'
    }
});
Schemas.resources = new SimpleSchema({
    'resourcesUsed': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'GSAR', 'Dogs', 'EMS', 'Fire', 'Tracker', 'Law', 'Divers', 'Boats', 'Cave', 'Parks', 'USAR', 'Helicopter', 'Fixed Wing', 'Swiftwater', 'Other'],
        label: 'Resources Used'
    },
    'findResource': {
        type: String,
        defaultValue: 'Unknown',
        allowedValues: ['Unknown', 'Hasty', 'Sweep', 'Grid', 'Dog-Airscent', 'Dog-Tracking', 'Dog-Trailing', 'Dog-Disaster', 'Tracker', 'Cave', 'Helicopter', 'Fixed Wing', 'Family/Friend', 'Public', 'Investigation', 'Horseback rider', 'ATV', 'Boat', 'Diver', 'Containment', 'Patrol', 'Bike', 'CERT', 'USAR', 'Other'],
        label: 'Find Resource'
    },
    '#Tasks': {
        type: Number,
        defaultValue: 0,
        label: '# Tasks'
    },
    '#Dogs': {
        type: Number,
        defaultValue: 0,
        label: '# Dogs'
    },
    '#AirTasks': {
        type: Number,
        defaultValue: 0,
        label: '# Air Tasks'
    },
    '#Aircraft': {
        type: Number,
        defaultValue: 0,
        label: '# Aircraft'
    },
    '#AirHours': {
        type: Number,
        defaultValue: 0,
        label: '# Air Hours'
    },
    'emergentVolunters': {
        type: Number,
        defaultValue: 0,
        label: 'Emergent Volunters'
    },
    'totalPersonnel': {
        type: Number,
        defaultValue: 0,
        label: 'Total Personnel'
    },
    'totalManHours': {
        type: Number,
        defaultValue: 0,
        label: 'Total Man Hours'
    },
    'totalDogHours': {
        type: Number,
        defaultValue: 0,
        label: 'Total Dog Hours'
    },
    '#Vehicles': {
        type: Number,
        defaultValue: 0,
        label: '# Vehicles'
    },
    'distanceTraveled': {
        type: String,
        defaultValue: '',
        label: 'Distance Traveled'
    },
    'totalCost': {
        type: String,
        defaultValue: '',
        label: 'Total Cost'
    },
    'comments': {
        type: String,
        defaultValue: '',
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
    test: {
        type: Schemas.test,
        //blackbox: true,
        optional: true
            //defaultValue: {}
    },
    admin: {
        type: Schemas.admin,
        optional: true
            //blackbox: true,
            //defaultValue: {}
    },
    recordInfo: {
        type: Schemas.recordInfo
        //optional: true
    },
    incident: {
        type: Schemas.incident
    },
    subjectInfo: {
        type: Schemas.subjectInfo,
        //optional: true
    },
    allSubjects: {
        type: Schemas.allSubjects
    },
    timeLog: {
        type: Schemas.timeLog,
        //optional: true
    },
    incidentOperations: {
        type: Schemas.incidentOperations,
   
    },
    incidentOutcome: {
        type: Schemas.incidentOutcome,
       
    },
    medical: {
        type: Schemas.medical,
   
    },
    resources: {
        type: Schemas.resources,
       
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
Collections.Records = Records;
People = Collections.People = new Mongo.Collection("People");
People.attachSchema(Schemas.Person);
