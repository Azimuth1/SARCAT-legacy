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
        allowedValues: ['Unknown', 'Active', 'Closed', 'Open'],
        label: 'Incident Status',
        defaultValue: 'Open',
    },
    leadagency: {
        type: String,
        label: 'Agency Having Jurisdiction',
        max: 200,
        autoValue: function () {
            if (this.isInsert) {
                var value = this.value;
                if (value) {
                    return value;
                } else {
                    return Config.findOne()
                        .agencyProfile.agency;
                }
            }
        },
    },
    organizationagency: {
        type: String,
        label: 'Organization/Agency',
        max: 200,
        autoValue: function () {
            if (this.isInsert) {
                var value = this.value;
                if (value) {
                    return value;
                } else {
                    return Config.findOne()
                        .agencyProfile.agency;
                }
            }
        }
    },
    incidentnum: {
        type: String,
        label: 'Incident #',
        autoValue: function () {
            if (this.isInsert) {
                var value = this.value;
                if (value) {
                    return value;
                } else {
                    return Records.defaultNum('incidentnum');
                }
            }
        }
    },
    missionnum: {
        type: String,
        optional: true,
        label: 'Mission #',
    },
    incidenttype: {
        type: String,
        defaultValue: 'Search',
        allowedValues: ['Unknown', 'Search', 'Rescue', 'Beacon', 'Recovery', 'Training', 'Disaster', 'Fugitive', 'False Report', 'StandBy', 'Attempt To Locate', ' Evidence'],
        label: 'Incident Type',
    }
});
Schemas.incident = new SimpleSchema({
    /*'incidentdate': {
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
     
    },*/
    'incidentDataTime': {
        type: 'datetime',
        autoform: {
            afFieldInput: {
                type: 'datetime-local'
            }
        },
        'label': 'Incident Date/Time',
        optional: true
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
    /* weather: {
         type: String,
         optional: true,
         allowedValues: ['Unknown', 'Clear', 'Partly Cloudy', 'Overcast', 'Foggy', 'Drizzle', 'Showers', 'Rain', 'Hail', 'Sleet', 'Snow', 'Blizzard', 'Smokey'],
         label: 'Weather',
     },
     maxTemp: {
         type: String,
         optional: true,
         label: 'Max Temp',
         autoValue: function () {
             if (this.isInsert) {
                 return '';
             }
         }
     },
     minTemp: {
         type: String,
         optional: true,
         label: 'Min Temp',
         autoValue: function () {
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
     }*/
});
Schemas.weather = new SimpleSchema({
    /*
        light: {
            type: String,
            optional: true,
            allowedValues: ['clear-day', ' clear-night', ' rain', ' snow', ' sleet', ' wind', ' fog', ' cloudy', ' partly-cloudy-day', ' or partly-cloudy-night'],
            label: 'Light',
        }
    */
    /*'time': {
        'type': String,
        'optional': true,
        'label': 'time'
    },*/
    /*'summary': {
        'type': String,
        'optional': true,
        'label': 'Summary'
    },*/
    'icon': {
        'type': String,
        'optional': true,
        'label': 'Summary'
    },
    'precipIntensity': {
        'type': String,
        'optional': true,
        'label': 'Precipitation Intensity'
    },
    /*'precipProbability': {
        'type': String,
        'optional': true,
        'label': 'precipProbability'
    },*/
    'precipType': {
        'type': String,
        'optional': true,
        'label': 'Precipitation Type'
    },
    'temperature': {
        'type': String,
        'optional': true,
        'label': 'Temperature'
    },
    'apparentTemperature': {
        'type': String,
        'optional': true,
        'label': 'Apparent Temperature'
    },
    'dewPoint': {
        'type': String,
        'optional': true,
        'label': 'Dew Point'
    },
    'humidity': {
        'type': String,
        'optional': true,
        'label': 'Humidity'
    },
    'windSpeed': {
        'type': String,
        'optional': true,
        'label': 'Wind Speed'
    },
    'windBearing': {
        'type': String,
        'optional': true,
        'label': 'Wind Bearing'
    },
    'visibility': {
        'type': String,
        'optional': true,
        'label': 'Visibility'
    },
    'pressure': {
        'type': String,
        'optional': true,
        'label': 'Pressure'
    }
})
Schemas.subjects = new SimpleSchema({
    subject: {
        type: Array,
        optional: true
    },
    'subject.$': {
        type: Object
    },
    'subject.$.age': {
        type: Number,
        label: 'Age',
        optional: true
    },
    'subject.$.sex': {
        type: String,
        allowedValues: ['Unknown', 'Male', 'Femail'],
        label: 'Sex',
        optional: true
    },
    'subject.$.local': {
        type: String,
        allowedValues: ['Unknown', 'Yes', 'No', 'Guide'],
        label: 'Local?',
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
    'subject.$.physical fitness': {
        type: String,
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Physical Fitness',
        optional: true
    },
    'subject.$.experience': {
        type: String,
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Experience',
        optional: true
    },
    'subject.$.equipment': {
        type: String,
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Equipment',
        optional: true
    },
    'subject.$.clothing': {
        type: String,
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Clothing',
        optional: true
    },
    'subject.$.survival training': {
        type: String,
        allowedValues: ['Unknown', 'Poor', 'Fair', 'Good', 'Excellent'],
        label: 'Survival training',
        optional: true
    }
});
/*
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
        label: 'Weight',
        optional: true
    },
    'height': {
        type: String,
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
});*/
Schemas.timeLog = new SimpleSchema({
    'last seen date-time': {
        type: 'datetime',
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
        'label': 'Total Missing Hours',
        optional: true
    },
    'search hours': {
        type: Number,
        'label': 'Total Search Hours',
        optional: true
    }
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
        optional: true
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
    'initialDirectionofTravel': {
        type: String,
        label: 'Initial Direction of Travel',
        optional: true
    },
    'DOTHowdetermined': {
        type: String,
        allowedValues: ['Unknown', 'Intended Destination', 'Physical Clue', 'Sighting', 'Tracks', 'Tracking/Trailing dog', 'Other'],
        label: 'DOT How determined',
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
        label: '# Well',
        optional: true
    },
    '#Injured': {
        type: Number,
        label: '# Injured',
        optional: true
    },
    '#DOA': {
        type: Number,
        label: '# DOA',
        optional: true
    },
    '#Saved': {
        type: String,
        label: '# Saved',
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
        allowedValues: ['Unknown', 'Brush', 'Canyon', 'Cave', 'Drainage', 'Field', 'Forest/woods', 'ice/snow', 'Structure', 'Road', 'Rock', 'Scrub', 'Trail', 'Vehicle', 'Lake/Pond/Water', 'Wetland', 'Yard'],
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
        type: Number,
        label: 'Mobility (hours)',
        optional: true
    },
    'trackOffset': {
        type: String,
        label: function () {
            var unit = Config.findOne().agencyProfile.measureUnits;
            var unitType = {Metric:'Meters',English:'Feet'};
            unit = unitType[unit];
            return 'Track Offset ('+unit+')'
        },
        optional: true
    },
    'elevationChange': {
        type: String,
        label: function () {
            var unit = Config.findOne().agencyProfile.measureUnits;
            var unitType = {Metric:'Meters',English:'Feet'};
            unit = unitType[unit];
            return 'Elevation Change ('+unit+')'
        },
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
    admin: {
        type: Schemas.admin,
        optional: true,
        //blackbox: true,
        //defaultValue: {}
    },
    recordInfo: {
        type: Schemas.recordInfo,
        optional: true
            //optional: true
    },
    coords: {
        type: Schemas.coords,
        optional: true
            //optional: true
    },
    incident: {
        type: Schemas.incident,
        optional: true
    },
    weather: {
        type: Schemas.weather,
        label: 'Weather - Autoset from forecast.io based on Incident Date/Time',
        optional: true
    },
    subjects: {
        type: Schemas.subjects,
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
        label: 'Incident Outcome',
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
        label: 'Agency/Organization',
        //optional: true,
        /*autoValue: function() {
            if (this.isInsert) {
                return Meteor.user().username;
            }
        }*/
    },
    phoneNum: {
        type: String,
        label: 'Phone Number',
        //optional: true,
    },
    country: {
        type: String,
        // optional: true,
    },
    measureUnits: {
        type: String,
        label: 'Unit of Measurement',
        defaultValue: 'Metric',
        allowedValues: ['Metric', 'English'],
    },
    'state-region': {
        type: String,
        // optional: true,
    },
    bounds: {
        type: String,
        optional: true,
        defaultValue: "-143.61328125,11.350796722383684,106.34765625,62.99515845212052"
    },
    /*
        coordinates: {
            type: Object,
            label: 'Location',
            defaultValue: {
                lat: 40,
                lng: -96,
                zoom: 4
            },

        },

        'coordinates.zoom': {
            type: Number,
            defaultValue: 4,
            decimal: true,
        },
        'coordinates.lat': {
            type: Number,
            label: 'Latitude',
            decimal: true,
            //optional: true

        },
        'coordinates.lng': {
            type: Number,
            label: 'Longitude',
            decimal: true,
            //optional: true

        },*/
});
/*
var bronze = Schemas.incident._firstLevelSchemaKeys.map(function (d) {
    return {
        label: d,
        defaultValue: true,
        allowedValues: [true, false],
        autoform: {
            type: 'select-radio-inline',
        },
        type: Boolean,
        //allowedValues: ['true', 'bar']
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
Schemas.formEditions = new SimpleSchema({
    type: {
        type: String,
        label: 'Choose SARCAT Edition',
        defaultValue: 'Platinum Edition',
        autoform: {
            type: 'select-radio-inline',
            options: function () {
                return [{
                    'label': 'Platinum Edition',
                    'value': 'Platinum Edition'
                }, {
                    'label': 'Gold Edition',
                    'value': 'Gold Edition'
                }, {
                    'label': 'Silver Edition',
                    'value': 'Silver Edition'
                }, {
                    'label': 'Basic Edition',
                    'value': 'Basic Edition'
                }];
            }
        }
    },
    recordInfo: {
        type: Array,
        allowedValues: Schemas.recordInfo._firstLevelSchemaKeys,
        defaultValue: Schemas.recordInfo._firstLevelSchemaKeys,
        label: 'Record Info',
    },
    'recordInfo.$': {
        type: String
    },
    incident: {
        type: Array,
        allowedValues: Schemas.incident._firstLevelSchemaKeys,
        defaultValue: Schemas.incident._firstLevelSchemaKeys,
        label: 'incident',
    },
    'incident.$': {
        type: String
    },
    weather: {
        type: Array,
        allowedValues: Schemas.weather._firstLevelSchemaKeys,
        defaultValue: Schemas.weather._firstLevelSchemaKeys,
        label: 'weather',
    },
    'weather.$': {
        type: String
    },
    subjects: {
        type: Array,
        allowedValues: Schemas.subjects._firstLevelSchemaKeys,
        defaultValue: Schemas.subjects._firstLevelSchemaKeys,
        label: 'subjects',
    },
    'subjects.$': {
        type: String
    },
    timeLog: {
        type: Array,
        allowedValues: Schemas.timeLog._firstLevelSchemaKeys,
        defaultValue: Schemas.timeLog._firstLevelSchemaKeys,
        label: 'timeLog',
    },
    'timeLog.$': {
        type: String
    },
    incidentOperations: {
        type: Array,
        allowedValues: Schemas.incidentOperations._firstLevelSchemaKeys,
        defaultValue: Schemas.incidentOperations._firstLevelSchemaKeys,
        label: 'incidentOperations',
    },
    'incidentOperations.$': {
        type: String
    },
    incidentOutcome: {
        type: Array,
        allowedValues: Schemas.incidentOutcome._firstLevelSchemaKeys,
        defaultValue: Schemas.incidentOutcome._firstLevelSchemaKeys,
        label: 'incidentOutcome',
    },
    'incidentOutcome.$': {
        type: String
    },
    medical: {
        type: Array,
        allowedValues: Schemas.medical._firstLevelSchemaKeys,
        defaultValue: Schemas.medical._firstLevelSchemaKeys,
        label: 'medical',
    },
    'medical.$': {
        type: String
    },
    resources: {
        type: Array,
        allowedValues: Schemas.resources._firstLevelSchemaKeys,
        defaultValue: Schemas.resources._firstLevelSchemaKeys,
        label: 'resources',
    },
    'resources.$': {
        type: String
    },
})
Schemas.config = new SimpleSchema({
    initSetup: {
        type: Boolean,
        defaultValue: true
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

