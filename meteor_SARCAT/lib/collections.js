Records = new Mongo.Collection('records');
Config = new Mongo.Collection('config');
Records.defaultName = function() {
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
        allowedValues: ['viewer', 'editor', 'admin'],
        defaultValue: ['viewer'],
        optional: true,
        /*autoValue: function(a,b){
            console.log(this,a,b);
        }*/
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
        autoValue: function() {
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
        autoValue: function() {
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
        autoValue: function() {
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
        autoValue: function() {
            if (this.isInsert) {
                return Records.defaultName();
            }
        }
    },
    status: {
        type: String,
        allowedValues: ['Unknown', 'Active', 'Closed', 'Open'],
        label: 'Incident Status',
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
        optional: true,
        autoValue: function() {
            if (this.isInsert) {
                var agencyProfile = Config.findOne()
                    .agencyProfile;
                if (agencyProfile.agency) {
                    return agencyProfile.agency;
                }
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
                var agencyProfile = Config.findOne()
                    .agencyProfile;
                if (agencyProfile.agency) {
                    return agencyProfile.agency;
                }
            }
        }
    },
    incidentnum: {
        type: String,
        label: 'Incident #',
        autoValue: function() {
            if (this.isInsert) {
                return Records.defaultNum('incidentnum')
                    .toString();
            }
        }
    },
    missionnum: {
        type: Number,
        optional: true,
        label: 'Mission #',
    },
    incidenttype: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Search', 'Rescue', 'Beacon', 'Recovery', 'Training', 'Disaster', 'Fugitive', 'False Report', 'StandBy', 'Attempt To Locate', ' Evidence'],
        label: 'Incident Type',
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
    incidentEnvironment: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Choose', 'Land', 'Air', 'Water'],
        label: 'Incident Environment',
    },
    country: {
        type: String,
        label: 'Response Country',
        optional: true,
        autoValue: function() {
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
        autoValue: function() {
            if (this.isInsert) {
                return Config.findOne()
                    .agencyProfile['state-region'];
            }
        }
    },
    subjectcategory: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Abduction', 'Aircraft Incident', 'Non-Powered Boat', 'Person in Current Water', 'Person in Flat Water', 'Person in Flood Water', 'Power Boat', 'ATV', 'Motorcycle', 'Mountain Bike', 'Vehicle (4WD)', 'Vehicle (Road)', 'Autism', 'Dementia', 'Despondent', 'Intellectual Disability', 'Mental Illness', 'Substance Intoxication', 'Ages 1-3 (Toddler)', 'Ages 4-6 (PreSchool)', 'Ages 7-9 (SchoolAge)', 'Ages 10-12 (Pre-Teenager)', 'Ages 13-15 (Adolescent)', 'Abandoned Vehicle', 'Angler', 'Car Camper', 'Caver', 'Day Climber', 'Extreme Race', 'Gatherer', 'Hiker', 'Horseback Rider', 'Hunter', 'Mountaineer', 'Runner', 'Worker', 'Alpine Skier', 'Nordic Skier', 'Snowboarder', 'Snowmobiler', 'Snowshoer'],
        label: 'Subject Category',
    },
    contactmethod: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Reported Missing', 'Vehicle Found', 'Registration Card', 'ELT/PLB/EPIRP', 'Satelitte Alerting Technology', 'Subject Cell Phone', 'Radio', 'Distress Signal'],
        label: 'Contact Method',
    },
    ipptype: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Point Last Seen', 'Last Known Point'],
        label: 'IPP Type',
    },
    ippclassification: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Airport', 'Beacon', 'Building', 'Field', 'Radar', 'Residence', 'Road', 'Signal', 'Trail', 'Trailhead', 'Vehicle', 'Water', 'Woods', 'Other'],
        label: 'IPP Classification',
        defaultValue: 'Unknown'
    },
    ecoregiondomain: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Temperate', 'Dry', 'Polar', 'Tropical', 'Water'],
        label: 'Ecoregion Domain',
    },
    ecoregionDivision: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'M110 Icecap Regime Mountains', '120 Tundra Division', 'M120 Tundra Regime Mountains', '130 Subarctic Division', 'M130 Subarctic Regime Mountains', '210 Warm Continental Division', 'M210 Warm Continental Regime Mountains', '220 Hot Continental Division', 'M220 Hot Continental Regime Mountains', '230 Subtropical Division', 'M230 Subtropical Regime Mountains', '240 Marine Division', 'M240 Marine Regime Mountains', '250 Prairie Division', 'M250 Prairie Regime Mountains', '260 Mediterranean Division', 'M260 Mediterranean Regime Mountains', '310 Tropical/Subtropical Steppe Division', 'M310 Tropical/Subtropical Steppe Regime Mountains', '320 Tropical/Subtropical Dessert Division', 'M320 Tropical/Subtropical Regime Mountains', '330 Temperate Steppe Division'],
        label: 'Ecoregion Division',
    },
    populationDensity: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Wilderness', 'Rural', 'Suburban', 'Urban', 'Water'],
        label: 'Population Density',
    },
    terrain: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Mountain', 'Hilly', 'Flat', 'Water'],
        label: 'Terrrain',
    },
    landCover: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Bare', 'Light', 'Moderate', 'Heavy', 'Water'],
        label: 'Land Cover',
    },
    landOwner: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Private', 'Commercial', 'County', 'State', 'NPS', 'USFS', 'BLM', 'Military', 'Native/Tribal', 'Navigable Water', 'Other'],
        label: 'Land Owner',
    },
    weather: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Clear', 'Partly Cloudy', 'Overcast', 'Foggy', 'Drizzle', 'Showers', 'Rain', 'Hail', 'Sleet', 'Snow', 'Blizzard', 'Smokey'],
        label: 'Weather',
    },
    maxTemp: {
        type: String,
        optional: true,
        label: 'Max Temp',
        autoValue: function() {
            if (this.isInsert) {
                return '';
            }
        }
    },
    minTemp: {
        type: String,
        optional: true,
        label: 'Min Temp',
        autoValue: function() {
            if (this.isInsert) {
                return '';
            }
        }
    },
    wind: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Light', 'Medium', 'Heavy'],
        label: 'Wind',
    },
    rain: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Light', 'Medium', 'Heavy'],
        label: 'Rain',
    },
    snow: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Light', 'Medium', 'Heavy'],
        label: 'Snow',
    },
    light: {
        type: String,
        optional: true,
        allowedValues: ['Unknown', 'Day', 'Night', 'Night (bright)', 'Day+NightObscured', 'Twilight'],
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
        optional: true
    },
    'sex': {
        type: String,
        allowedValues: ['Unknown', 'Male', 'Femail'],
        label: 'Sex',
        optional: true
    },
    'local': {
        type: String,
        allowedValues: ['Unknown', 'Yes', 'No', 'Guide'],
        label: 'Local?',
        optional: true
    },
    'weight': {
        type: String,
        defaultValue: '',
        label: 'Weight',
        optional: true
    },
    'height': {
        type: String,
        defaultValue: '',
        label: 'Height',
        optional: true
    },
    'physical fitness': {
        type: String,
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Physical Fitness',
        optional: true
    },
    'experience': {
        type: String,
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Experience',
        optional: true
    },
    'equipment': {
        type: String,
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Equipment',
        optional: true
    },
    'clothing': {
        type: String,
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Clothing',
        optional: true
    },
    'survival training': {
        type: String,
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Survival training',
        optional: true
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
        'label': 'Last Seen Date/Time',
        optional: true
    },
    'sar notified date-time': {
        type: String,
        defaultValue: '',
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'SAR Notified Date/Time',
        optional: true
    },
    'subject located date-time': {
        type: String,
        defaultValue: '',
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'Subject Located Date/Time',
        optional: true
    },
    'incident closed date-time': {
        type: String,
        defaultValue: '',
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'Incident Closed Date/Time',
        optional: true
    },
    'total hours': {
        type: Number,
        defaultValue: 0,
        'label': 'Total Missing Hours',
        optional: true
    },
    'search hours': {
        type: Number,
        defaultValue: 0,
        'label': 'Total Search Hours',
        optional: true
    }
});
Schemas.incidentOperations = new SimpleSchema({
    ippCoordinates: {
        type: Object,
        label: 'IPP Coordinates',
        optional: true
    },
    'ippCoordinates.y': {
        type: String,
        label: '(N/S)',
        optional: true
    },
    'ippCoordinates.x': {
        type: String,
        label: '(E/W)',
        optional: true
    },
    decisionPointCoord: {
        type: Object,
        label: 'decisionPointCoord',
        optional: true
    },
    'decisionPointCoord.y': {
        type: String,
        label: '(N/S)',
        optional: true
    },
    'decisionPointCoord.x': {
        type: String,
        label: '(E/W)',
        optional: true
    },
    destinationCoord: {
        type: Object,
        label: 'Destination Coordinates',
        optional: true
    },
    'destinationCoord.y': {
        type: String,
        label: '(N/S)',
        optional: true
    },
    'destinationCoord.x': {
        type: String,
        label: '(E/W)',
        optional: true
    },
    'initialDirectionofTravel': {
        type: String,
        defaultValue: '',
        label: 'Initial Direction of Travel',
        optional: true
    },
    'DOTHowdetermined': {
        type: String,
        allowedValues: ['Unknown', 'Intended Destination', 'Physical Clue', 'Sighting', 'Tracks', 'Tracking/Trailing dog', 'Other'],
        label: 'DOT How determined',
        optional: true
    },
    'revisedLKP-PLS_N-S': {
        type: String,
        defaultValue: '',
        label: 'Revised LKP/PLS (N/S)',
        optional: true
    },
    'revisedLKP-PLS_E-W': {
        type: String,
        defaultValue: '',
        label: 'Revised LKP/PLS (E/W)',
        optional: true
    },
    'revisedHowDetermined': {
        type: String,
        allowedValues: ['Unknown', 'Physical Clue', 'Trail Register', 'Sighting', 'Tracks', 'Other'],
        label: 'Revised How Determined',
        optional: true
    },
    'revisedDOT': {
        type: String,
        defaultValue: '',
        label: 'Revised DOT',
        optional: true
    },
    'typeofDecisionPoint': {
        type: String,
        allowedValues: ['Unknown', 'Other', 'Saddle', 'Shortcut', 'Trail', 'Animal', 'Trail Crossed', 'Trail Junction', 'Trail Lost', 'Trail Social', 'Trail Turnoff'],
        label: 'Type of Decision Point',
        optional: true
    },
    'decisionPointFactor': {
        type: String,
        defaultValue: '',
        label: 'Decision Point Factor',
        optional: true
    }
});
Schemas.incidentOutcome = new SimpleSchema({
    'incidentOutcome': {
        type: String,
        allowedValues: ['Unknown', 'Closed by Search', 'Closed by Public', 'Closed by Self-Rescue', 'Closed by Investigation', 'Closed by Investigation-False Report', 'Closed by Investigation-Friend/Family', 'Closed by investigation-In facility', 'Closed by Investigation-Staged', 'Closed by investigation-Transportation', 'Open/Suspended', 'Other'],
        label: 'Incident Outcome',
        optional: true
    },
    'scenario': {
        type: String,
        allowedValues: ['Unknown', 'Avalanche', 'Criminal', 'Despondent', 'Evading', 'Investigative', 'Lost', 'Medical', 'Drowning', 'Overdue', 'Stranded', 'Trauma'],
        label: 'Scenario',
        optional: true
    },
    'suspensionReasons': {
        type: String,
        allowedValues: ['Unknown', 'Lack of clues', 'Lack of resources', 'Weather', 'Hazards', 'Lack of Survivability', 'Investigative information'],
        label: 'Suspension Reasons',
        optional: true
    },
    '#Well': {
        type: Number,
        defaultValue: 0,
        label: '# Well',
        optional: true
    },
    '#Injured': {
        type: Number,
        defaultValue: 0,
        label: '# Injured',
        optional: true
    },
    '#DOA': {
        type: Number,
        defaultValue: 0,
        label: '# DOA',
        optional: true
    },
    '#Saved': {
        type: String,
        defaultValue: '',
        label: '# Saved',
        optional: true
    },
    'findCoord_N-S': {
        type: String,
        defaultValue: '',
        label: 'Find Coord (N/S)',
        optional: true
    },
    'findCoord_E-W': {
        type: String,
        defaultValue: '',
        label: 'Find Coord (E/W)',
        optional: true
    },
    'distanceIPP': {
        type: String,
        defaultValue: '',
        label: 'Distance IPP',
        optional: true
    },
    'findBearing': {
        type: String,
        defaultValue: '',
        label: 'Find Bearing',
        optional: true
    },
    'findFeature': {
        type: String,
        allowedValues: ['Unknown', 'Brush', 'Canyon', 'Cave', 'Drainage', 'Field', 'Forest/woods', 'ice/snow', 'Structure', 'Road', 'Rock', 'Scrub', 'Trail', 'Vehicle', 'Lake/Pond/Water', 'Wetland', 'Yard'],
        label: 'Find Feature',
        optional: true
    },
    'foundSecondary': {
        type: String,
        defaultValue: '',
        label: 'Found Secondary',
        optional: true
    },
    'detectability': {
        type: String,
        allowedValues: ['Unknown', 'Excellent', 'Good', 'Fair', 'Poor'],
        label: 'Detectability',
        optional: true
    },
    'mobility&Responsiveness': {
        type: String,
        allowedValues: ['Unknown', 'Mobile and responsive', 'Mobile and unresponsive', 'Immobile and responsive', 'Immobile and unresponsive'],
        label: 'Mobility & Responsiveness',
        optional: true
    },
    'lostStrategy': {
        type: String,
        allowedValues: ['Unknown', 'Backtracking', 'Direction sampling', 'Direction traveling', 'Downhill', 'Evasive', 'wisdom', 'Followed travel aid', 'Landmark', 'Nothing', 'Paniced', 'Route sampling', 'Stayed put', 'View enhancing', 'Seek cell signal', 'Other'],
        label: 'Lost Strategy',
        optional: true
    },
    'mobility_hours': {
        type: String,
        defaultValue: '',
        label: 'Mobility (hours)',
        optional: true
    },
    'trackOffset': {
        type: String,
        defaultValue: '',
        label: 'Track Offset',
        optional: true
    },
    'elevationChange': {
        type: String,
        defaultValue: '',
        label: 'Elevation Change',
        optional: true
    }
});
Schemas.medical = new SimpleSchema({
    'status': {
        type: String,
        allowedValues: ['Unknown', 'Alive and well', 'Injuired', 'DOA'],
        label: 'Subject Status',
        optional: true
    },
    'mechanism': {
        type: String,
        allowedValues: ['Unknown', 'Animal attack/bite/sting', 'Human attack', 'Fall - ground level', 'Fall - height', 'Gunshot', 'Avalanche', 'Tree fall', 'Rock fall', 'Water', 'Environment', 'Medical condition', 'Other'],
        label: 'Mechanism',
        optional: true
    },
    'injuryType': {
        type: String,
        allowedValues: ['Unknown', 'Abrasion', 'Bruise', 'Burn', 'Cramp', 'Crush', 'Fracture', 'Flail Chest', 'Frostbite', 'Infection', 'Laceration', 'Pain', 'Soft Tissue', 'Sprain', 'Multi-Trauma', 'Drowning'],
        label: 'Injury Type',
        optional: true
    },
    'illness': {
        type: String,
        allowedValues: ['Unknown', 'Addision', 'Allergic reaction', 'Altitude disorder', 'Appendicitis', 'Asthma', 'Dehydration', 'Exhaustion', 'Hypertherimic', 'Hypothermic', 'Illness', 'Intoxicated', 'Seizures', 'Shock', 'Shortness of Breath', 'Stroke', 'Unconscious', 'UTI', 'Other'],
        label: 'Illness',
        optional: true
    },
    'treatmentby': {
        type: String,
        allowedValues: ['Unknown', 'None', 'Self', 'Public', 'First-Aid', 'First-Responder', 'EMT', 'WEMT', 'ALS', 'RN', 'MD', 'N/A'],
        label: 'Treatment by',
        optional: true
    },
    'rescue-EvacuationMethods': {
        type: String,
        allowedValues: ['Unknown', 'Walkout', 'Carryout', 'Semi-Tech', 'Technical', 'Vehicle', 'Boat', 'Swiftwater', 'Helicopter', 'AeromedicalOther'],
        label: 'Rescue/Evacuation Methods',
        optional: true
    },
    'injuredSearcher': {
        type: String,
        defaultValue: '',
        label: 'Injured Searcher',
        optional: true
    },
    'injuredSearcherDetails': {
        type: String,
        defaultValue: '',
        label: 'Injured Searcher Details',
        optional: true
    },
    'signalling': {
        type: String,
        allowedValues: ['Unknown', 'None', 'N/A', 'ELT', 'EPIRP', 'PLB', 'SPOT', 'Satellite-Alerting', 'Cell phone', 'Cell + GPS', 'Radio', 'FRS/GMRS', 'Fire/Smoke', 'Flare', 'Mirror', 'Visual', 'Sound', 'Other'],
        label: 'Signalling',
        optional: true
    }
});
Schemas.resources = new SimpleSchema({
    'resourcesUsed': {
        type: Array,
        allowedValues: ['Unknown', 'GSAR', 'Dogs', 'EMS', 'Fire', 'Tracker', 'Law', 'Divers', 'Boats', 'Cave', 'Parks', 'USAR', 'Helicopter', 'Fixed Wing', 'Swiftwater', 'Other'],
        label: 'Resources Used',
        optional: true
    },
    'resourcesUsed.$': {
        type: String,
        optional: true
    },
    'findResource': {
        type: Array,
        allowedValues: ['Unknown', 'Hasty', 'Sweep', 'Grid', 'Dog-Airscent', 'Dog-Tracking', 'Dog-Trailing', 'Dog-Disaster', 'Tracker', 'Cave', 'Helicopter', 'Fixed Wing', 'Family/Friend', 'Public', 'Investigation', 'Horseback rider', 'ATV', 'Boat', 'Diver', 'Containment', 'Patrol', 'Bike', 'CERT', 'USAR', 'Other'],
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
    'totalDogHours': {
        type: Number,
        label: 'Total Dog Hours',
        optional: true
    },
    '#Vehicles': {
        type: Number,
        label: '# Vehicles',
        optional: true
    },
    'distanceTraveled': {
        type: String,
        label: 'Distance Traveled',
        optional: true
    },
    'totalCost': {
        type: String,
        label: 'Total Cost',
        optional: true
    },
    'comments': {
        type: String,
        label: 'Comments',
        optional: true
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
        },
        autoform: {
            omit: true
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
        optional: true,
        autoform: {
            omit: true
        }
        //blackbox: true,
        //defaultValue: {}
    },
    recordInfo: {
        type: Schemas.recordInfo,
        optional: true
            //optional: true
    },
    incident: {
        type: Schemas.incident,
        optional: true
    },
    subjectInfo: {
        type: Schemas.subjectInfo,
        optional: true
            //optional: true
    },
    allSubjects: {
        type: Schemas.allSubjects,
        optional: true
    },
    timeLog: {
        type: Schemas.timeLog,
        optional: true
            //optional: true
    },
    incidentOperations: {
        type: Schemas.incidentOperations,
        optional: true
    },
    incidentOutcome: {
        type: Schemas.incidentOutcome,
        optional: true
    },
    medical: {
        type: Schemas.medical,
        optional: true
    },
    resources: {
        type: Schemas.resources,
        optional: true
    }
});
Records.attachSchema(Schemas.SARCAT);
Schemas.agencyProfile = new SimpleSchema({
    agency: {
        type: String,
        optional: true,
    },
    phoneNum: {
        type: String,
        optional: true,
    },
    country: {
        type: String,
        optional: true,
    },
    'state-region': {
        type: String,
        optional: true,
    },
});
Schemas.config = new SimpleSchema({
    initSetup: {
        type: Boolean,
        defaultValue: true
    },
    agencyProfile: {
        type: Schemas.agencyProfile,
        defaultValue: {},
        //blackbox: true,
        //optional: true,
        //blackbox: true,
        //defaultValue: {}
    },
});
Config.attachSchema(Schemas.config);
