Template.form1.rendered = function() {
    console.log(this.data)
    //console.log(2,this.parent)
    //currentRecord=Session.get('currentRecord');
};
Template.form1.helpers({
    isEqual: function(obj, obj2) {
        return obj === obj2;
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
    m=map;

    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        maxZoom: 18,
        id: 'examples.map-i875mjb7'
    }).addTo(map);


  L.marker([m.getCenter().lat,m.getCenter().lng],{draggable:true}).addTo(map);
    //L.circleMarker([m.getCenter().lat,m.getCenter().lng],{draggable:true}).addTo(map);


   map.scrollWheelZoom.disable();
};



Template.afSubjects.rendered = function() {
    console.log(this.data)
    //console.log(2,this.parent)
    //currentRecord=Session.get('currentRecord');
};


