
var tabs = ["Welcome", "Initial Incident Information", "Map Information", "Incident Mapping", "Subject Information", "Time Log", "Incident Outcomes",
    "Resource Information", "Summary", "Subject Option", "Complete"
];
var step1 = [{
    "name": "Incident Status",
    "type": "radio",
    "vals": ["Open", "Closed", "Suspended", "Closed Post Suspension"]
}, {
    "name": "Record #",
    "data": [{
        "name": "Incident #",
        "type": "input"
    }, {
        "name": "Mission #",
        "type": "input"
    }]
}, {
    "name": "Incident Type",
    "type": "select",
    "vals": ["ATL", "Aircraft", "Assist", "Attempt to Locate", "Beacon", "Cave", "Disaster", "Evidence", "False Report", "Fugitive", "Fugutive", "IFE",
        "INREQ", "OTHER", "PRECAUTIONARY", "Recovery", "Rescue", "Search", "Standby", "Training", "URT-144", "VEHICLE", "Water"
    ]
}, {
    "name": "# Subjects",
    "type": "text"
}, {
    "name": "Contact Method",
    "type": "select",
    "vals": ["Distress Signal", "ELT/PLB/EPIRP", "Radio", "Registration Card", "Reported Missing", "Satellite Alerting Technology",
        "Subject Cell Phone", "Vehicle Found"
    ]
}, {
    "name": "Subject",
    "type": "select",
    "vals": ["ATV", "Abduction", "Aircraft", "Aircraft-nonpowered", "Angler", "Animal", "Assist", "Autistic", "BASE Jumper", "BOAT", "Base Jumper",
        "Beacon", "Boater", "Camper", "Caver", "Child", "Climber", "Criminal", "Dementia", "Despondent", "Diver", "ELT/EPIRB", "Elderly",
        "Extreme Sports", "Fisher", "Fugative", "Gatherer", "Gatherer-Mushroom", "Golfer", "Hiker", "Hiker-Tramper", "Horseback Rider",
        "Horseback rider", "Hunter", "IFE", "INREQ", "Ice Skater", "Intellectual disability", "MERCY", "MISSING PERSON", "Mental Illness",
        "Mental Retardation", "Motorcycle", "Mountain Biker", "OTHER", "Other-student", "PRECAUTIONARY", "Parachutist", "Person In Water", "Prayer",
        "Psychotic", "RESCUE", "Runaway", "Runner", "Signal", "Skier", "Skier - Alpine", "Skier - Nordic", "Skier-Alpine", "Skier-Nordic",
        "Sledder", "Snowboarder", "Snowmobile", "Snowmobiler", "Snowmobilier", "Snowshoer", "Soldier", "Substance Abuse", "Substance Intoxication",
        "Swimmer", "Vehicle", "Vehicle-4wd", "Vehicle-Left", "Vision Quest", "Walkaway", "Water", "Wheelchair", "Worker", "Workers", "Youth"
    ]
}, {
    "name": "Subject Sub-Category",
    "type": "text"
}, {
    "name": "Subject Activity",
    "type": "text"
}, {
    "name": "Response Area",
    "type": "select",
    "vals": ["Air", "Cave", "Land", "Water"]
}, {
    "name": "Land Owner",
    "type": "select",
    "vals": ["BLM", "Commercial", "County", "Military", "NPS", "Native/Tribal", "Navigable Water", "Other", "Private", "State", "USFS"]
}, {
    "name": "Address-Location",
    "type": "text"
}];





$('#myModal').modal();




var steps = d3.select('.step')
    .selectAll("p")
    .data(tabs);
var w = Math.floor(12 / tabs.length);
var step = steps.enter()
    .append('div')
    .attr('class', function(d, i) {
        return i === 0 ? 'activestep steps' : 'steps';
    })
    .on('click', function(elem, i) {
        elem = d3.select(this);
        percent = i * 10;
        $('.progress-bar')
            .css('width', percent + '%')
            .attr('aria-valuenow', percent)
            .text(percent + "%");
        step.classed('activestep', false);
        elem.classed('activestep', true);
    });
step.append('span')
    .attr('class', 'glyphicon glyphicon-ok btn-md');
step.append('h6')
    .text(function(d) {
        return d;
    });
var formData = d3.select('.formFill')
    .append('form')
    .attr('class', 'form-horizontal');
formData.append('legend')
    .text('Initial Incident Information');
formData = formData.selectAll("form-group")
    .data(step1);
var formGroup = formData.enter()
    .append('div')
    .attr('class', 'form-group');
formGroup.append('label')
    .attr('class', 'control-label col-xs-3')
    .text(function(d) {
        return d.name;
    });
formGroup.append('div')
    .attr('class', 'col-xs-9')
    .select(function(d) {
        if (d.data) {
            return;
        }
        if (d.type == 'text') {
            d3.select(this)
                .append('input')
                .attr('type', 'text')
                .attr('class', 'form-control')
                .attr('placeholder', function(d) {
                    return d.name;
                });
        }
        if (d.type == 'radio') {
            var div = d3.select(this);
            div.classed('btn-group', true)
                .attr('data-toggle', 'buttons');
            var radios = div.selectAll('radio')
                .data(d.vals);
            var labels = radios.enter()
                .append('label')
                .attr('class', 'btn btn-primary');
            labels.text(function(d) {
                return d;
            });
            labels.append('input')
                .attr('type', 'radio')
                .attr('name', function(e) {
                    return d.name;
                });
        }
    });