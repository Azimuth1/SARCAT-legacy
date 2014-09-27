var config = {
        tabs: ['Welcome', 'Initial Incident Information', 'Map Information', 'Incident Mapping', 'Subject Information', 'Time Log', 'Incident Outcomes',
                'Resource Information', 'Summary', 'Subject Option', 'Complete'
        ],
        step1: [{
                'name': 'Incident Status',
                'type': 'radio',
                'vals': ['Open', 'Closed', 'Suspended', 'Closed Post Suspension']
        }, {
                'name': 'Record #',
                'data': [{
                        'name': 'Incident #',
                        'type': 'text'
                }, {
                        'name': 'Mission #',
                        'type': 'text'
                }]
        }, {
                'name': 'Incident Type',
                'type': 'select',
                'vals': ['ATL', 'Aircraft', 'Assist', 'Attempt to Locate', 'Beacon', 'Cave', 'Disaster', 'Evidence', 'False Report', 'Fugitive', 'Fugutive',
                        'IFE', 'INREQ', 'OTHER', 'PRECAUTIONARY', 'Recovery', 'Rescue', 'Search', 'Standby', 'Training', 'URT-144', 'VEHICLE',
                        'Water'
                ]
        }, {
                'name': '# Subjects',
                'type': 'text'
        }, {
                'name': 'Contact Method',
                'type': 'select',
                'vals': ['Distress Signal', 'ELT/PLB/EPIRP', 'Radio', 'Registration Card', 'Reported Missing', 'Satellite Alerting Technology',
                        'Subject Cell Phone', 'Vehicle Found'
                ]
        }, {
                'name': 'Subject',
                'type': 'select',
                'vals': ['ATV', 'Abduction', 'Aircraft', 'Aircraft-nonpowered', 'Angler', 'Animal', 'Assist', 'Autistic', 'BASE Jumper', 'BOAT',
                        'Base Jumper', 'Beacon', 'Boater', 'Camper', 'Caver', 'Child', 'Climber', 'Criminal', 'Dementia', 'Despondent', 'Diver',
                        'ELT/EPIRB', 'Elderly', 'Extreme Sports', 'Fisher', 'Fugative', 'Gatherer', 'Gatherer-Mushroom', 'Golfer', 'Hiker',
                        'Hiker-Tramper', 'Horseback Rider', 'Horseback rider', 'Hunter', 'IFE', 'INREQ', 'Ice Skater', 'Intellectual disability',
                        'MERCY', 'MISSING PERSON', 'Mental Illness', 'Mental Retardation', 'Motorcycle', 'Mountain Biker', 'OTHER', 'Other-student',
                        'PRECAUTIONARY', 'Parachutist', 'Person In Water', 'Prayer', 'Psychotic', 'RESCUE', 'Runaway', 'Runner', 'Signal', 'Skier',
                        'Skier - Alpine', 'Skier - Nordic', 'Skier-Alpine', 'Skier-Nordic', 'Sledder', 'Snowboarder', 'Snowmobile', 'Snowmobiler',
                        'Snowmobilier', 'Snowshoer', 'Soldier', 'Substance Abuse', 'Substance Intoxication', 'Swimmer', 'Vehicle', 'Vehicle-4wd',
                        'Vehicle-Left', 'Vision Quest', 'Walkaway', 'Water', 'Wheelchair', 'Worker', 'Workers', 'Youth'
                ]
        }, {
                'name': 'Subject Sub-Category',
                'type': 'text'
        }, {
                'name': 'Subject Activity',
                'type': 'text'
        }, {
                'name': 'Response Area',
                'type': 'select',
                'vals': ['Air', 'Cave', 'Land', 'Water']
        }, {
                'name': 'Land Owner',
                'type': 'select',
                'vals': ['BLM', 'Commercial', 'County', 'Military', 'NPS', 'Native/Tribal', 'Navigable Water', 'Other', 'Private', 'State', 'USFS']
        }, {
                'name': 'Address-Location',
                'type': 'text'
        }]
};