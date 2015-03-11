Template.form1.rendered = function() {
    //console.log(2,this.parent)
    //currentRecord=Session.get('currentRecord');
};
Template.form1.helpers({
    isEqual: function(obj, obj2) {
        return obj === obj2;
    },
    formChanged: function(name) {
        return Session.get('formChanged');
    },
    schemaCompleteClass2: function(name) {
        return 'panel-success';
        currentRecord = Session.get('currentRecord');
        console.log(this, name, currentRecord)
        var complete = Match.test(currentRecord[name], Schemas[name]);
        //console.log(Match.test(currentRecord[name], Schemas[name]));
        //return complete ? 'panel-success' : 'panel-warning';
        /*
        template.$('.js-edit-form input[type=text]').focus();
        var name = template.$('[name=name]').val();
        Tracker.flush();
        */
    }
});
Template.formTimeLog.helpers({
    Schemas: function() {
        return Schemas;
    },
    Collections: function() {
        return Collections;
    }
});
Template.formMap.rendered = function() {
    var map = L.map('map').setView([51.505, -0.09], 13);
    console.log(map)
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        maxZoom: 18,
        id: 'examples.map-i875mjb7'
    }).addTo(map);
   map.scrollWheelZoom.disable();
};
