$('.control-label strong').map(function() {
    var name = $(this) .text();return name
    
})


$('.step').map(function() {
    var name = $(this).text();console.log(name)
    var topics = $(this + '.control-label strong');console.log(topics)
});




$('.step').map(function(d,e) {
    var group = $(this).text();
    var step = $('#step'+(d+1));



    var controlgroup = step.find('.box-content').children('.control-group')
    var data = controlgroup.map(function() {
		var text = $(this).find('.control-label strong').map(function(){return $(this).text()})
		var type = $(this).find('input, select').map(function(){
			var type = $(this).attr('type') || 'select';
			var options = $(this).find('option').map(function(d){return $(this).text()})

			var obj = {};
			obj.type=type
			if(options.length){obj.options=options}
			return obj
		})
    	return {type:type}
    });

    //var type = controlgroup.find('input').map(function() {return $(this).attr('type')});
    return {group:group,data:data}
});


var geojson2heat = function(geojson,options){
options = options || {};
console.log(options)
var heat = geojson.features.map(function(d) {
    var lng = d.geometry.coordinates[0];
    var lat = d.geometry.coordinates[1];
    var compounds = d.properties.Compounds;
    var sum = 0;
    for (var key in compounds) {
        var number = compounds[key].replace(',', '');
        var val = !isNaN(number) ? +number : null;
        if (val) {sum += val;}
    }
    if(sum==15897){sum=0}
    return [lat, lng, sum];
});


if(options.filter){heat=heat.filter(function(array){return array[2]!==0})}


return heat;
}