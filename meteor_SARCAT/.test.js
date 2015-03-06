z = 'xx***xx***xx***Intended Destination,Physical Clue,Sighting,Tracks,Tracking/Trailing dog,Other***xx***xx***Physical Clue,Trail Register,Sighting,Tracks,Other***xx***xx***xx***Other,Saddle,Shortcut,Trail,Animal,Trail Crossed,Trail Junction,Trail Lost,Trail Social,Trail Turnoff***xx***Closed by Search,Closed by Public,Closed by Self-Rescue,Closed by Investigation,Closed by Investigation-False Report,Closed by Investigation-Friend/Family,Closed by investigation-In facility,Closed by Investigation-Staged,Closed by investigation-Transportation,Open/Suspended,Other***Avalanche,Criminal,Despondent,Evading,Investigative,Lost,Medical,Drowning,Overdue,Stranded,Trauma***Lack of clues,Lack of resources,Weather,Hazards,Lack of Survivability,Investigative information***xx***xx***xx***xx***xx***xx***xx***xx***xx***Brush,Canyon,Cave,Drainage,Field,Forest/woods,ice/snow,Structure,Road,Rock,Scrub,Trail,Vehicle,Lake/Pond/Water,Wetland,Yard***xx***Excellent,Good,Fair,Poor***Mobile and responsive,Mobile and unresponsive,Immobile and responsive,Immobile and unresponsive***Backtracking,Direction sampling,Direction traveling,Downhill,Evasive,wisdom,Followed travel aid,Landmark,Nothing,Paniced,Route sampling,Stayed put,View enhancing,Seek cell signal,Other***xx***xx***xx***Alive and well,Injuired,DOA***Animal attack/bite/sting,Human attack,Fall - ground level,Fall - height,Gunshot,Avalanche,Tree fall,Rock fall,Water,Environment,Medical condition,Other***Abrasion,Bruise,Burn,Cramp,Crush,Fracture,Flail Chest,Frostbite,Infection,Laceration,Pain,Soft Tissue,Sprain,Multi-Trauma,Drowning***Addision,Allergic reaction,Altitude disorder,Appendicitis,Asthma,Dehydration,Exhaustion,Hypertherimic,Hypothermic,Illness,Intoxicated,Seizures,Shock,Shortness of Breath,Stroke,Unconscious,UTI,Other***None,Self,Public,First-Aid,First-Responder,EMT,WEMT,ALS,RN,MD,N/A***Walkout,Carryout,Semi-Tech,Technical,Vehicle,Boat,Swiftwater,Helicopter,AeromedicalOther***xx***xx***None,N/A,ELT,EPIRP,PLB,SPOT,Satellite-Alerting,Cell phone,Cell + GPS,Radio,FRS/GMRS,Fire/Smoke,Flare,Mirror,Other,visual,Sound,Other***GSAR,Dogs,EMS,Fire,Tracker,Law,Divers,Boats,Cave,Parks,USAR,Helicopter,Fixed Wing,Swiftwater,Other***Hasty,Sweep,Grid,Dog-Airscent,Dog-Tracking,Dog-Trailing,Dog-Disaster,Tracker,Cave,Helicopter,Fixed Wing,Family/Friend,Public,Investigation,Horseback rider,ATV,Boat,Diver,Containment,Patrol,Bike,CERT,USAR,Other***';
c = [{
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Destination Coord. (N/S)'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Destination Coord. (E/W)'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Initial Direction of Travel'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'DOT How determined'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Revised LKP/PLS (N/S)'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Revised LKP/PLS (E/W)'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Revised How Determined'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Revised DOT'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Decision Point Coord. (N/S)'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Decision Point Coord. (E/W)'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Type of Decision Point'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Decision Point Factor'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Incident Outcome'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Scenario'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Suspension Reasons'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': '# Subjects'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': '# Well'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': '# Injured'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': '# DOA'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': '# Saved'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Find Coord (N/S)'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Find Coord (E/W)'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Distance IPP'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Find Bearing'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Find Feature'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Found Secondary'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Detectability'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Mobility & Responsiveness'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Lost Strategy'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Mobility (hours)'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Track Offset'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Elevation Change'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Status'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Mechanism'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Injury Type'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Illness'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Treatment by'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Rescue/Evacuation Methods'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Injured Searcher'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Injured Searcher Details'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Signalling'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Resources Used'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Find Resource'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': '# Tasks'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': '# Dogs'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': '# Air Tasks'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': '# Aircraft'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': '# Air Hours'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Emergent Volunters'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Total Personnel'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Total Man Hours'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Total Dog Hours'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': '# Vehicles'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Distance Traveled'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Total Cost'
}, {
    'type': 'String',
    'optional': true,
    'allowedValues': ['a', 'b', 'c'],
    'label': 'Comments'
}];
z2 = ['xx', 'xx', 'xx', 'Intended Destination,Physical Clue,Sighting,Tracks,Tracking/Trailing dog,Other', 'xx', 'xx', 'Physical Clue,Trail Register,Sighting,Tracks,Other', 'xx', 'xx', 'xx', 'Other,Saddle,Shortcut,Trail,Animal,Trail Crossed,Trail Junction,Trail Lost,Trail Social,Trail Turnoff', 'xx', 'Closed by Search,Closed by Public,Closed by Self-Rescue,Closed by Investigation,Closed by Investigation-False Report,Closed by Investigation-Friend/Family,Closed by investigation-In facility,Closed by Investigation-Staged,Closed by investigation-Transportation,Open/Suspended,Other', 'Avalanche,Criminal,Despondent,Evading,Investigative,Lost,Medical,Drowning,Overdue,Stranded,Trauma', 'Lack of clues,Lack of resources,Weather,Hazards,Lack of Survivability,Investigative information', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'Brush,Canyon,Cave,Drainage,Field,Forest/woods,ice/snow,Structure,Road,Rock,Scrub,Trail,Vehicle,Lake/Pond/Water,Wetland,Yard', 'xx', 'Excellent,Good,Fair,Poor', 'Mobile and responsive,Mobile and unresponsive,Immobile and responsive,Immobile and unresponsive', 'Backtracking,Direction sampling,Direction traveling,Downhill,Evasive,wisdom,Followed travel aid,Landmark,Nothing,Paniced,Route sampling,Stayed put,View enhancing,Seek cell signal,Other', 'xx', 'xx', 'xx', 'Alive and well,Injuired,DOA', 'Animal attack/bite/sting,Human attack,Fall - ground level,Fall - height,Gunshot,Avalanche,Tree fall,Rock fall,Water,Environment,Medical condition,Other', 'Abrasion,Bruise,Burn,Cramp,Crush,Fracture,Flail Chest,Frostbite,Infection,Laceration,Pain,Soft Tissue,Sprain,Multi-Trauma,Drowning', 'Addision,Allergic reaction,Altitude disorder,Appendicitis,Asthma,Dehydration,Exhaustion,Hypertherimic,Hypothermic,Illness,Intoxicated,Seizures,Shock,Shortness of Breath,Stroke,Unconscious,UTI,Other', 'None,Self,Public,First-Aid,First-Responder,EMT,WEMT,ALS,RN,MD,N/A', 'Walkout,Carryout,Semi-Tech,Technical,Vehicle,Boat,Swiftwater,Helicopter,AeromedicalOther', 'xx', 'xx', 'None,N/A,ELT,EPIRP,PLB,SPOT,Satellite-Alerting,Cell phone,Cell + GPS,Radio,FRS/GMRS,Fire/Smoke,Flare,Mirror,Other,visual,Sound,Other', 'GSAR,Dogs,EMS,Fire,Tracker,Law,Divers,Boats,Cave,Parks,USAR,Helicopter,Fixed Wing,Swiftwater,Other', 'Hasty,Sweep,Grid,Dog-Airscent,Dog-Tracking,Dog-Trailing,Dog-Disaster,Tracker,Cave,Helicopter,Fixed Wing,Family/Friend,Public,Investigation,Horseback rider,ATV,Boat,Diver,Containment,Patrol,Bike,CERT,USAR,Other', ''];
z2.map(function(d) {
    return {
        allowedValues: d
    };
});
z3 = [{
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'Intended Destination,Physical Clue,Sighting,Tracks,Tracking/Trailing dog,Other'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'Physical Clue,Trail Register,Sighting,Tracks,Other'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'Other,Saddle,Shortcut,Trail,Animal,Trail Crossed,Trail Junction,Trail Lost,Trail Social,Trail Turnoff'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'Closed by Search,Closed by Public,Closed by Self-Rescue,Closed by Investigation,Closed by Investigation-False Report,Closed by Investigation-Friend/Family,Closed by investigation-In facility,Closed by Investigation-Staged,Closed by investigation-Transportation,Open/Suspended,Other'
}, {
    'allowedValues': 'Avalanche,Criminal,Despondent,Evading,Investigative,Lost,Medical,Drowning,Overdue,Stranded,Trauma'
}, {
    'allowedValues': 'Lack of clues,Lack of resources,Weather,Hazards,Lack of Survivability,Investigative information'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'Brush,Canyon,Cave,Drainage,Field,Forest/woods,ice/snow,Structure,Road,Rock,Scrub,Trail,Vehicle,Lake/Pond/Water,Wetland,Yard'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'Excellent,Good,Fair,Poor'
}, {
    'allowedValues': 'Mobile and responsive,Mobile and unresponsive,Immobile and responsive,Immobile and unresponsive'
}, {
    'allowedValues': 'Backtracking,Direction sampling,Direction traveling,Downhill,Evasive,wisdom,Followed travel aid,Landmark,Nothing,Paniced,Route sampling,Stayed put,View enhancing,Seek cell signal,Other'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'Alive and well,Injuired,DOA'
}, {
    'allowedValues': 'Animal attack/bite/sting,Human attack,Fall - ground level,Fall - height,Gunshot,Avalanche,Tree fall,Rock fall,Water,Environment,Medical condition,Other'
}, {
    'allowedValues': 'Abrasion,Bruise,Burn,Cramp,Crush,Fracture,Flail Chest,Frostbite,Infection,Laceration,Pain,Soft Tissue,Sprain,Multi-Trauma,Drowning'
}, {
    'allowedValues': 'Addision,Allergic reaction,Altitude disorder,Appendicitis,Asthma,Dehydration,Exhaustion,Hypertherimic,Hypothermic,Illness,Intoxicated,Seizures,Shock,Shortness of Breath,Stroke,Unconscious,UTI,Other'
}, {
    'allowedValues': 'None,Self,Public,First-Aid,First-Responder,EMT,WEMT,ALS,RN,MD,N/A'
}, {
    'allowedValues': 'Walkout,Carryout,Semi-Tech,Technical,Vehicle,Boat,Swiftwater,Helicopter,AeromedicalOther'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'xx'
}, {
    'allowedValues': 'None,N/A,ELT,EPIRP,PLB,SPOT,Satellite-Alerting,Cell phone,Cell + GPS,Radio,FRS/GMRS,Fire/Smoke,Flare,Mirror,Other,visual,Sound,Other'
}, {
    'allowedValues': 'GSAR,Dogs,EMS,Fire,Tracker,Law,Divers,Boats,Cave,Parks,USAR,Helicopter,Fixed Wing,Swiftwater,Other'
}, {
    'allowedValues': 'Hasty,Sweep,Grid,Dog-Airscent,Dog-Tracking,Dog-Trailing,Dog-Disaster,Tracker,Cave,Helicopter,Fixed Wing,Family/Friend,Public,Investigation,Horseback rider,ATV,Boat,Diver,Containment,Patrol,Bike,CERT,USAR,Other'
}, {
    'allowedValues': ''
}];
